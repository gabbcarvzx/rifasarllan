"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { upsertCustomer } from "@/lib/asaas/customers";
import { getAsaasErrorMessage } from "@/lib/asaas/errors";
import {
  cancelPayment,
  createPixPayment,
  findPaymentByExternalReference,
  getPayment,
  getPixQrCode,
} from "@/lib/asaas/payments";
import type { AsaasPayment, AsaasPixQrCode } from "@/lib/asaas/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AsaasCustomer as LocalAsaasCustomer,
  Json,
  Order,
  Payment,
  PaymentStatus,
  Profile,
} from "@/types/database";

export type CheckoutActionState = {
  status: "idle" | "success" | "error";
  message: string;
  updatedAt?: number;
};

export type CheckoutResult = {
  data: Payment | null;
  error?: string;
};

type OrderCheckoutScope = {
  order: Order;
  profile: Profile | null;
  userId: string;
  reservedUntil: string | null;
};

const INITIALIZING_STATUS = "INITIALIZING";
const INITIALIZATION_TIMEOUT_MS = 30_000;

function makeState(
  status: CheckoutActionState["status"],
  message: string,
): CheckoutActionState {
  return {
    status,
    message,
    updatedAt: Date.now(),
  };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formatSaoPauloDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getCheckoutDueDate(scope: OrderCheckoutScope) {
  return formatSaoPauloDate(
    scope.reservedUntil ? new Date(scope.reservedUntil) : new Date(),
  );
}

function mapAsaasPaymentStatus(payment: AsaasPayment): PaymentStatus {
  if (["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(payment.status)) {
    return "paid";
  }

  if (payment.status === "REFUNDED") {
    return "refunded";
  }

  if (payment.deleted) {
    return "cancelled";
  }

  if (payment.status === "OVERDUE") {
    return "failed";
  }

  return "pending";
}

function toQrCodeDataUrl(encodedImage?: string | null) {
  if (!encodedImage) {
    return null;
  }

  if (encodedImage.startsWith("data:image/")) {
    return encodedImage;
  }

  return `data:image/png;base64,${encodedImage}`;
}

function getCheckoutErrorMessage(error: unknown) {
  const providerMessage = getAsaasErrorMessage(error);

  if (providerMessage.includes("Missing required environment variable")) {
    return "O checkout Pix ainda nao foi configurado no ambiente do servidor.";
  }

  if (providerMessage.toLowerCase().includes("cpf")) {
    return "O Asaas solicitou CPF/CNPJ para este cliente. Atualize o cadastro antes de tentar novamente.";
  }

  return `Nao foi possivel concluir a operacao no Asaas. ${providerMessage}`;
}

async function getOwnedOrderScope(
  orderId: string,
  options: { requireActiveReservation?: boolean } = {},
): Promise<OrderCheckoutScope | null> {
  const { user, profile } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order || order.user_id !== user.id) {
    return null;
  }

  const { data: reservedRows } = await supabase
    .from("raffle_numbers")
    .select("reserved_until")
    .eq("order_id", order.id)
    .order("reserved_until", { ascending: false })
    .limit(1);
  const reservedUntil = reservedRows?.[0]?.reserved_until ?? null;

  if (options.requireActiveReservation) {
    const isActive =
      order.status === "pending" &&
      reservedUntil !== null &&
      new Date(reservedUntil).getTime() > Date.now();

    if (!isActive) {
      return null;
    }
  }

  return {
    order,
    profile,
    userId: user.id,
    reservedUntil,
  };
}

async function getLocalPayment(orderId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .eq("provider", "asaas")
    .maybeSingle();

  return data;
}

async function claimCheckoutInitialization(scope: OrderCheckoutScope) {
  const admin = createSupabaseAdminClient();
  const current = await getLocalPayment(scope.order.id);

  if (current?.provider_payment_id) {
    return { payment: current, claimed: false };
  }

  if (!current) {
    const { data, error } = await admin
      .from("payments")
      .insert({
        order_id: scope.order.id,
        provider: "asaas",
        amount: scope.order.amount,
        status: "pending",
        provider_raw_status: INITIALIZING_STATUS,
        expires_at: scope.reservedUntil,
        due_date: getCheckoutDueDate(scope),
      })
      .select("*")
      .single();

    if (!error && data) {
      return { payment: data, claimed: true };
    }

    const concurrentPayment = await getLocalPayment(scope.order.id);
    return { payment: concurrentPayment, claimed: false };
  }

  const initializationAge = Date.now() - new Date(current.updated_at).getTime();

  if (
    current.provider_raw_status === INITIALIZING_STATUS &&
    initializationAge < INITIALIZATION_TIMEOUT_MS
  ) {
    return { payment: current, claimed: false };
  }

  const { data } = await admin
    .from("payments")
    .update({
      status: "pending",
      provider_raw_status: INITIALIZING_STATUS,
      expires_at: scope.reservedUntil,
      due_date: getCheckoutDueDate(scope),
    })
    .eq("id", current.id)
    .eq("updated_at", current.updated_at)
    .select("*")
    .maybeSingle();

  return { payment: data ?? current, claimed: Boolean(data) };
}

async function ensureLocalAsaasCustomer(scope: OrderCheckoutScope) {
  const admin = createSupabaseAdminClient();
  const { data: localCustomer } = await admin
    .from("asaas_customers")
    .select("*")
    .eq("tenant_id", scope.order.tenant_id)
    .eq("user_id", scope.userId)
    .maybeSingle();
  const name =
    scope.order.customer_name ?? scope.profile?.full_name ?? "Cliente da plataforma";
  const email = scope.order.customer_email ?? scope.profile?.email;
  const phone = scope.order.customer_phone ?? scope.profile?.phone ?? undefined;

  if (!email) {
    throw new Error("O pedido nao possui e-mail para criar o cliente no Asaas.");
  }

  const remoteCustomer = await upsertCustomer({
    name,
    email,
    mobilePhone: phone,
    externalReference: `${scope.order.tenant_id}:${scope.userId}`,
    existingCustomerId: localCustomer?.asaas_customer_id,
    notificationDisabled: true,
  });
  const payload = {
    tenant_id: scope.order.tenant_id,
    user_id: scope.userId,
    asaas_customer_id: remoteCustomer.id,
    name: remoteCustomer.name || name,
    email: remoteCustomer.email || email,
    phone: remoteCustomer.mobilePhone || remoteCustomer.phone || phone || null,
  };
  const { data, error } = await admin
    .from("asaas_customers")
    .upsert(payload, { onConflict: "tenant_id,user_id" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Nao foi possivel persistir o cliente Asaas localmente.");
  }

  return data as LocalAsaasCustomer;
}

async function syncLocalPayment({
  localPayment,
  remotePayment,
  qrCode,
  reservedUntil,
  forcedStatus,
}: {
  localPayment: Payment;
  remotePayment: AsaasPayment;
  qrCode?: AsaasPixQrCode | null;
  reservedUntil: string | null;
  forcedStatus?: PaymentStatus;
}) {
  const admin = createSupabaseAdminClient();
  const expiresAt = qrCode?.expirationDate ?? reservedUntil ?? null;
  const providerResponse = {
    payment: remotePayment,
    pixQrCode: qrCode ?? null,
  } as Json;
  const { error } = await admin.rpc("sync_asaas_payment", {
    p_payment_id: localPayment.id,
    p_status: forcedStatus ?? mapAsaasPaymentStatus(remotePayment),
    p_provider_raw_status: remotePayment.status,
    p_provider_payment_id: remotePayment.id,
    p_pix_copy_paste: qrCode?.payload ?? null,
    p_pix_qr_code: toQrCodeDataUrl(qrCode?.encodedImage),
    p_invoice_url: remotePayment.invoiceUrl ?? null,
    p_expires_at: expiresAt,
    p_due_date: remotePayment.dueDate ?? null,
    p_pix_end_to_end_identifier: null,
    p_provider_response: providerResponse,
  });

  if (error) {
    throw new Error("Nao foi possivel sincronizar a cobranca no banco local.");
  }
}

async function getQrCodeWhenPending(remotePayment: AsaasPayment) {
  if (mapAsaasPaymentStatus(remotePayment) !== "pending") {
    return null;
  }

  return getPixQrCode(remotePayment.id);
}

function revalidateCheckoutPaths(scope: OrderCheckoutScope) {
  revalidatePath(`/pedido/${scope.order.id}`);
  revalidatePath(`/rifas`);
  revalidatePath(`/admin/rifas/${scope.order.raffle_id}/editar`);
}

export async function createPixCheckout(
  _state: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const orderId = getFormString(formData, "orderId");
  const scope = await getOwnedOrderScope(orderId, {
    requireActiveReservation: true,
  });

  if (!scope) {
    return makeState(
      "error",
      "O pedido nao existe, nao pertence a sua conta ou a reserva expirou.",
    );
  }

  try {
    const claim = await claimCheckoutInitialization(scope);

    if (!claim.payment) {
      return makeState("error", "Nao foi possivel iniciar o checkout Pix.");
    }

    if (claim.payment.provider_payment_id) {
      const remotePayment = await getPayment(claim.payment.provider_payment_id);
      const qrCode = await getQrCodeWhenPending(remotePayment);
      await syncLocalPayment({
        localPayment: claim.payment,
        remotePayment,
        qrCode,
        reservedUntil: scope.reservedUntil,
      });
      revalidateCheckoutPaths(scope);
      return makeState("success", "Cobranca Pix existente reutilizada.");
    }

    const recoveredPayment = await findPaymentByExternalReference(scope.order.id);

    if (recoveredPayment) {
      const qrCode = await getQrCodeWhenPending(recoveredPayment);
      await syncLocalPayment({
        localPayment: claim.payment,
        remotePayment: recoveredPayment,
        qrCode,
        reservedUntil: scope.reservedUntil,
      });
      revalidateCheckoutPaths(scope);
      return makeState("success", "Cobranca Pix recuperada e reutilizada.");
    }

    if (!claim.claimed) {
      return makeState(
        "error",
        "O checkout ja esta sendo criado. Aguarde alguns segundos e atualize.",
      );
    }

    const customer = await ensureLocalAsaasCustomer(scope);
    const remotePayment = await createPixPayment({
      customer: customer.asaas_customer_id,
      billingType: "PIX",
      value: scope.order.amount,
      dueDate: getCheckoutDueDate(scope),
      description: `Reserva da rifa - pedido ${scope.order.id}`,
      externalReference: scope.order.id,
    });
    const qrCode = await getPixQrCode(remotePayment.id);

    await syncLocalPayment({
      localPayment: claim.payment,
      remotePayment,
      qrCode,
      reservedUntil: scope.reservedUntil,
    });
    revalidateCheckoutPaths(scope);

    return makeState("success", "Cobranca Pix criada com sucesso.");
  } catch (error) {
    try {
      const localPayment = await getLocalPayment(scope.order.id);

      if (localPayment && !localPayment.provider_payment_id) {
        const admin = createSupabaseAdminClient();
        await admin
          .from("payments")
          .update({
            status: "failed",
            provider_raw_status: "CREATE_FAILED",
            provider_response: {
              message: error instanceof Error ? error.message : "Unknown error",
            },
            last_provider_sync: new Date().toISOString(),
          })
          .eq("id", localPayment.id);
      }
    } catch {
      // The original configuration/provider error is more useful to the user.
    }

    return makeState("error", getCheckoutErrorMessage(error));
  }
}

export async function refreshPixPayment(
  _state: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const orderId = getFormString(formData, "orderId");
  const scope = await getOwnedOrderScope(orderId);

  if (!scope) {
    return makeState("error", "Pedido nao encontrado na sua conta.");
  }

  const localPayment = await getLocalPayment(scope.order.id);

  if (!localPayment?.provider_payment_id) {
    return makeState("error", "Este pedido ainda nao possui cobranca Pix.");
  }

  try {
    const remotePayment = await getPayment(localPayment.provider_payment_id);
    const qrCode = await getQrCodeWhenPending(remotePayment);
    await syncLocalPayment({
      localPayment,
      remotePayment,
      qrCode,
      reservedUntil: scope.reservedUntil,
    });
    revalidateCheckoutPaths(scope);

    return makeState("success", "Status atualizado diretamente no Asaas.");
  } catch (error) {
    return makeState("error", getCheckoutErrorMessage(error));
  }
}

export async function cancelPixPayment(
  _state: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const orderId = getFormString(formData, "orderId");
  const scope = await getOwnedOrderScope(orderId);

  if (!scope || scope.order.status !== "pending") {
    return makeState("error", "Este pedido nao pode mais ser cancelado.");
  }

  const localPayment = await getLocalPayment(scope.order.id);

  if (!localPayment?.provider_payment_id || localPayment.status !== "pending") {
    return makeState("error", "Nao existe cobranca Pix pendente para cancelar.");
  }

  try {
    await cancelPayment(localPayment.provider_payment_id);
    const remotePayment: AsaasPayment = {
      id: localPayment.provider_payment_id,
      customer: "",
      billingType: "PIX",
      value: localPayment.amount ?? scope.order.amount,
      status: "DELETED",
      dueDate: localPayment.due_date ?? formatSaoPauloDate(),
      invoiceUrl: localPayment.invoice_url,
      externalReference: scope.order.id,
      deleted: true,
    };
    await syncLocalPayment({
      localPayment,
      remotePayment,
      reservedUntil: scope.reservedUntil,
      forcedStatus: "cancelled",
    });
    revalidateCheckoutPaths(scope);

    return makeState("success", "Cobranca Pix e reserva canceladas.");
  } catch (error) {
    return makeState("error", getCheckoutErrorMessage(error));
  }
}

export async function getCheckoutByOrderId(
  orderId: string,
): Promise<CheckoutResult> {
  const scope = await getOwnedOrderScope(orderId);

  if (!scope) {
    return {
      data: null,
      error: "Pedido nao encontrado na sua conta.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .eq("provider", "asaas")
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: "Nao foi possivel carregar o checkout deste pedido.",
    };
  }

  return { data };
}

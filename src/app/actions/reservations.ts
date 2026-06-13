"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ExpireOldReservationsResult,
  Order,
  OrderItem,
  Raffle,
  ReserveRaffleNumbersResult,
} from "@/types/database";

export type ReservationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  updatedAt?: number;
};

export type OrderDetails = {
  order: Order;
  items: OrderItem[];
  raffle: Pick<Raffle, "id" | "title" | "slug" | "price_per_number" | "draw_date" | "status"> | null;
  reservedUntil: string | null;
};

export type OrderDetailsResult = {
  data: OrderDetails | null;
  error?: string;
};

export type PendingOrdersResult = {
  data: Order[];
  error?: string;
};

const MAX_NUMBERS_PER_RESERVATION = 100;

function makeState(
  status: ReservationActionState["status"],
  message: string,
): ReservationActionState {
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

function parseSelectedNumbers(value: string) {
  const rawNumbers = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (rawNumbers.length === 0) {
    return {
      ok: false as const,
      error: "Selecione pelo menos um numero disponivel.",
    };
  }

  if (rawNumbers.length > MAX_NUMBERS_PER_RESERVATION) {
    return {
      ok: false as const,
      error: `Selecione no maximo ${MAX_NUMBERS_PER_RESERVATION} numeros por reserva.`,
    };
  }

  const numbers = rawNumbers.map((item) => Number.parseInt(item, 10));

  if (numbers.some((number) => !Number.isInteger(number) || number <= 0)) {
    return {
      ok: false as const,
      error: "A selecao contem numeros invalidos.",
    };
  }

  if (new Set(numbers).size !== numbers.length) {
    return {
      ok: false as const,
      error: "A selecao contem numeros duplicados.",
    };
  }

  return {
    ok: true as const,
    numbers,
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getReservationErrorMessage(message?: string, details?: string | null) {
  const source = `${message ?? ""} ${details ?? ""}`;

  if (source.includes("AUTH_REQUIRED")) {
    return "Entre na sua conta para reservar numeros.";
  }

  if (source.includes("NO_NUMBERS_SELECTED")) {
    return "Selecione pelo menos um numero disponivel.";
  }

  if (source.includes("DUPLICATED_NUMBERS")) {
    return "A selecao contem numeros duplicados.";
  }

  if (source.includes("TOO_MANY_NUMBERS")) {
    return `Selecione no maximo ${MAX_NUMBERS_PER_RESERVATION} numeros por reserva.`;
  }

  if (source.includes("INVALID_CUSTOMER_NAME")) {
    return "Informe um nome valido para a reserva.";
  }

  if (source.includes("INVALID_CUSTOMER_EMAIL")) {
    return "Informe um e-mail valido para a reserva.";
  }

  if (source.includes("INVALID_CUSTOMER_PHONE")) {
    return "Informe um WhatsApp valido para a reserva.";
  }

  if (source.includes("RAFFLE_NOT_AVAILABLE")) {
    return "Esta rifa nao esta disponivel para novas reservas.";
  }

  if (source.includes("NUMBERS_NOT_FOUND")) {
    return "Um ou mais numeros selecionados nao existem nesta rifa.";
  }

  if (source.includes("NUMBERS_UNAVAILABLE")) {
    return details
      ? `Alguns numeros acabaram de ficar indisponiveis: ${details}. Atualize a selecao e tente novamente.`
      : "Alguns numeros acabaram de ficar indisponiveis. Atualize a selecao e tente novamente.";
  }

  return "Nao foi possivel criar a reserva. Revise os dados e tente novamente.";
}

async function runExpireReservations() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("expire_old_reservations", {});

  if (error) {
    return {
      ok: false as const,
      error: "Nao foi possivel expirar reservas antigas agora.",
    };
  }

  return {
    ok: true as const,
    data: (data?.[0] ?? {
      expired_orders: 0,
      released_numbers: 0,
    }) as ExpireOldReservationsResult,
  };
}

export async function expireReservations() {
  await requireUser();
  return runExpireReservations();
}

export async function reserveNumbers(
  _state: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  await requireUser();

  const raffleId = getFormString(formData, "raffleId");
  const raffleSlug = getFormString(formData, "raffleSlug");
  const customerName = getFormString(formData, "customerName");
  const customerEmail = getFormString(formData, "customerEmail").toLowerCase();
  const customerPhone = getFormString(formData, "customerPhone");
  const selectedNumbers = parseSelectedNumbers(
    getFormString(formData, "selectedNumbers"),
  );

  if (!raffleId) {
    return makeState("error", "Rifa nao informada.");
  }

  if (!selectedNumbers.ok) {
    return makeState("error", selectedNumbers.error);
  }

  if (customerName.length < 3) {
    return makeState("error", "Informe seu nome completo.");
  }

  if (!isValidEmail(customerEmail)) {
    return makeState("error", "Informe um e-mail valido.");
  }

  if (customerPhone.length < 8) {
    return makeState("error", "Informe um WhatsApp valido.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("reserve_raffle_numbers", {
    p_raffle_id: raffleId,
    p_numbers: selectedNumbers.numbers,
    p_customer_name: customerName,
    p_customer_email: customerEmail,
    p_customer_phone: customerPhone,
  });

  if (error) {
    revalidatePath("/");
    revalidatePath("/rifas");

    if (raffleSlug) {
      revalidatePath(`/rifas/${raffleSlug}`);
    }

    return makeState(
      "error",
      getReservationErrorMessage(error.message, error.details),
    );
  }

  const reservation = data?.[0] as ReserveRaffleNumbersResult | undefined;

  if (!reservation?.order_id) {
    return makeState(
      "error",
      "A reserva foi processada, mas nao retornou um pedido valido.",
    );
  }

  revalidatePath("/");
  revalidatePath("/rifas");
  revalidatePath("/admin");
  revalidatePath("/admin/rifas");
  revalidatePath(`/admin/rifas/${raffleId}/editar`);

  if (raffleSlug) {
    revalidatePath(`/rifas/${raffleSlug}`);
  }

  redirect(`/pedido/${reservation.order_id}`);
}

export async function getUserPendingOrders(): Promise<PendingOrdersResult> {
  const { user } = await requireUser();
  await runExpireReservations();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: [],
      error: "Nao foi possivel carregar suas reservas pendentes.",
    };
  }

  return {
    data: data ?? [],
  };
}

export async function getOrderById(orderId: string): Promise<OrderDetailsResult> {
  const { user, profile } = await requireUser();
  await runExpireReservations();

  const supabase = await createSupabaseServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return {
      data: null,
      error: "Pedido nao encontrado.",
    };
  }

  const isOwner = order.user_id === user.id;
  const isTenantAdmin =
    profile?.role === "admin" &&
    Boolean(profile.tenant_id) &&
    profile.tenant_id === order.tenant_id;

  if (!isOwner && !isTenantAdmin) {
    return {
      data: null,
      error: "Voce nao tem permissao para acessar este pedido.",
    };
  }

  const [
    { data: items, error: itemsError },
    { data: raffle },
    { data: reservedRows },
  ] = await Promise.all([
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id)
      .order("number", { ascending: true }),
    supabase
      .from("raffles")
      .select("id,title,slug,price_per_number,draw_date,status")
      .eq("id", order.raffle_id)
      .maybeSingle(),
    supabase
      .from("raffle_numbers")
      .select("reserved_until")
      .eq("order_id", order.id)
      .order("reserved_until", { ascending: false })
      .limit(1),
  ]);

  if (itemsError) {
    return {
      data: null,
      error: "Nao foi possivel carregar os numeros deste pedido.",
    };
  }

  return {
    data: {
      order,
      items: items ?? [],
      raffle,
      reservedUntil: reservedRows?.[0]?.reserved_until ?? null,
    },
  };
}

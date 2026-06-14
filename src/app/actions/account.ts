"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AccountActionState,
  AccountDataResult,
  MyNumberStatus,
  MyNumbersGroup,
  MyOrder,
  MyOrderDetails,
  MyProfile,
  ParticipantRaffle,
} from "@/types/account";
import type { OrderItem, OrderStatus, Raffle } from "@/types/database";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

const raffleSelect =
  "id,title,slug,main_image_url,status,draw_date" as const;
const orderListSelect =
  "id,raffle_id,amount,status,created_at,updated_at" as const;
const orderDetailsSelect =
  "id,tenant_id,user_id,raffle_id,customer_name,customer_email,customer_phone,amount,status,payment_method,created_at,updated_at" as const;
const orderItemSelect =
  "id,order_id,raffle_number_id,number,price,created_at" as const;
const participantPaymentSelect =
  "id,order_id,pix_qr_code,pix_copy_paste,amount,status,created_at" as const;

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function makeState(
  status: AccountActionState["status"],
  message: string,
): AccountActionState {
  return { status, message, updatedAt: Date.now() };
}

function toParticipantRaffle(
  raffle: Pick<
    Raffle,
    "id" | "title" | "slug" | "main_image_url" | "status" | "draw_date"
  > | null,
  raffleId: string,
): ParticipantRaffle {
  return {
    id: raffle?.id ?? raffleId,
    title: raffle?.title ?? "Rifa indisponivel",
    slug: raffle?.slug ?? "",
    mainImageUrl: raffle?.main_image_url ?? null,
    status: raffle?.status ?? "cancelled",
    drawDate: raffle?.draw_date ?? null,
  };
}

async function getOwnedOrders(
  supabase: SupabaseServerClient,
  userId: string,
) {
  return supabase
    .from("orders")
    .select(orderListSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function getMyProfile(): Promise<
  AccountDataResult<MyProfile | null>
> {
  const { profile } = await requireUser();
  return { data: profile };
}

export async function updateMyProfile(
  _state: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const { user } = await requireUser();
  const fullName = getFormString(formData, "fullName");
  const phone = getFormString(formData, "phone");

  if (fullName.length < 3 || fullName.length > 120) {
    return makeState(
      "error",
      "Informe um nome completo entre 3 e 120 caracteres.",
    );
  }

  if (phone.length < 8 || phone.length > 24 || !/^[0-9+()\-\s]+$/.test(phone)) {
    return makeState("error", "Informe um WhatsApp valido.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone })
    .eq("id", user.id);

  if (error) {
    return makeState(
      "error",
      "Nao foi possivel atualizar seu perfil. Tente novamente.",
    );
  }

  revalidatePath("/minha-conta");
  revalidatePath("/", "layout");

  return makeState("success", "Seus dados foram atualizados.");
}

export async function getMyOrders(): Promise<AccountDataResult<MyOrder[]>> {
  const { user } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: orders, error } = await getOwnedOrders(supabase, user.id);

  if (error) {
    return { data: [], error: "Nao foi possivel carregar seus pedidos." };
  }

  if (!orders?.length) {
    return { data: [] };
  }

  const orderIds = orders.map((order) => order.id);
  const raffleIds = [...new Set(orders.map((order) => order.raffle_id))];
  const [itemsResult, rafflesResult, reservationsResult] = await Promise.all([
    supabase.from("order_items").select("order_id").in("order_id", orderIds),
    supabase.from("raffles").select(raffleSelect).in("id", raffleIds),
    supabase
      .from("raffle_numbers")
      .select("order_id,reserved_until")
      .in("order_id", orderIds)
      .not("order_id", "is", null),
  ]);

  if (itemsResult.error || rafflesResult.error) {
    return { data: [], error: "Nao foi possivel montar seu historico." };
  }

  const countByOrder = new Map<string, number>();
  itemsResult.data?.forEach((item) => {
    countByOrder.set(item.order_id, (countByOrder.get(item.order_id) ?? 0) + 1);
  });

  const raffleById = new Map(
    (rafflesResult.data ?? []).map((raffle) => [raffle.id, raffle]),
  );
  const reservationByOrder = new Map<string, string>();
  reservationsResult.data?.forEach((row) => {
    if (!row.order_id || !row.reserved_until) {
      return;
    }

    const current = reservationByOrder.get(row.order_id);
    if (!current || current < row.reserved_until) {
      reservationByOrder.set(row.order_id, row.reserved_until);
    }
  });

  const data: MyOrder[] = orders.map((order) => ({
    id: order.id,
    status: getEffectiveOrderStatus(
      order.status,
      reservationByOrder.get(order.id) ?? null,
    ),
    amount: order.amount,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    numbersCount: countByOrder.get(order.id) ?? 0,
    reservedUntil: reservationByOrder.get(order.id) ?? null,
    raffle: toParticipantRaffle(
      raffleById.get(order.raffle_id) ?? null,
      order.raffle_id,
    ),
  }));

  return { data };
}

function getEffectiveOrderStatus(
  status: OrderStatus,
  reservedUntil: string | null,
): OrderStatus {
  if (
    status === "pending" &&
    reservedUntil &&
    new Date(reservedUntil).getTime() <= Date.now()
  ) {
    return "expired";
  }

  return status;
}

function getNumberStatus(status: OrderStatus): MyNumberStatus {
  if (status === "paid") {
    return "paid";
  }

  if (status === "pending") {
    return "reserved";
  }

  if (status === "expired") {
    return "expired";
  }

  return "cancelled";
}

export async function getMyNumbers(): Promise<
  AccountDataResult<MyNumbersGroup[]>
> {
  const { user } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: orders, error } = await getOwnedOrders(supabase, user.id);

  if (error) {
    return { data: [], error: "Nao foi possivel carregar seus numeros." };
  }

  if (!orders?.length) {
    return { data: [] };
  }

  const orderIds = orders.map((order) => order.id);
  const raffleIds = [...new Set(orders.map((order) => order.raffle_id))];
  const [itemsResult, rafflesResult, reservationsResult] = await Promise.all([
    supabase
      .from("order_items")
      .select(orderItemSelect)
      .in("order_id", orderIds)
      .order("number", { ascending: true }),
    supabase.from("raffles").select(raffleSelect).in("id", raffleIds),
    supabase
      .from("raffle_numbers")
      .select("order_id,reserved_until")
      .in("order_id", orderIds)
      .not("order_id", "is", null),
  ]);

  if (itemsResult.error || rafflesResult.error) {
    return { data: [], error: "Nao foi possivel montar seu historico de numeros." };
  }

  const orderById = new Map(orders.map((order) => [order.id, order]));
  const raffleById = new Map(
    (rafflesResult.data ?? []).map((raffle) => [raffle.id, raffle]),
  );
  const reservationByOrder = new Map<string, string>();
  reservationsResult.data?.forEach((row) => {
    if (row.order_id && row.reserved_until) {
      reservationByOrder.set(row.order_id, row.reserved_until);
    }
  });

  const groupByRaffle = new Map<string, MyNumbersGroup>();

  (itemsResult.data ?? []).forEach((item) => {
    const order = orderById.get(item.order_id);

    if (!order) {
      return;
    }

    const reservedUntil = reservationByOrder.get(order.id) ?? null;
    const effectiveStatus = getEffectiveOrderStatus(
      order.status,
      reservedUntil,
    );
    const existing = groupByRaffle.get(order.raffle_id) ?? {
      raffle: toParticipantRaffle(
        raffleById.get(order.raffle_id) ?? null,
        order.raffle_id,
      ),
      numbers: [],
    };

    existing.numbers.push({
      id: item.id,
      number: item.number,
      status: getNumberStatus(effectiveStatus),
      orderId: order.id,
      orderStatus: effectiveStatus,
      reservedAt: order.created_at,
      reservedUntil,
    });
    groupByRaffle.set(order.raffle_id, existing);
  });

  return { data: [...groupByRaffle.values()] };
}

export async function getMyOrderById(
  orderId: string,
): Promise<AccountDataResult<MyOrderDetails | null>> {
  const { user } = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(orderDetailsSelect)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !order) {
    return { data: null, error: "Pedido nao encontrado na sua conta." };
  }

  const [itemsResult, raffleResult, reservationResult, paymentResult] =
    await Promise.all([
      supabase
        .from("order_items")
        .select(orderItemSelect)
        .eq("order_id", order.id)
        .order("number", { ascending: true }),
      supabase
        .from("raffles")
        .select(raffleSelect)
        .eq("id", order.raffle_id)
        .maybeSingle(),
      supabase
        .from("raffle_numbers")
        .select("reserved_until")
        .eq("order_id", order.id)
        .order("reserved_until", { ascending: false })
        .limit(1),
      supabase
        .from("payments")
        .select(participantPaymentSelect)
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (itemsResult.error || raffleResult.error || paymentResult.error) {
    return { data: null, error: "Nao foi possivel carregar este pedido." };
  }

  const reservedUntil = reservationResult.data?.[0]?.reserved_until ?? null;

  return {
    data: {
      order: {
        ...order,
        status: getEffectiveOrderStatus(order.status, reservedUntil),
      },
      items: (itemsResult.data ?? []) as OrderItem[],
      raffle: toParticipantRaffle(raffleResult.data, order.raffle_id),
      reservedUntil,
      payment: paymentResult.data,
    },
  };
}

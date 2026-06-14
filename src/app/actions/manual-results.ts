"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getPublicTenantId } from "@/lib/platform-settings/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Order,
  Raffle,
  RaffleNumber,
  RafflePrize,
  Winner,
} from "@/types/database";
import type {
  AdminManualResults,
  AdminManualWinner,
  ManualResultActionState,
  ManualResultsResult,
  PublicManualResults,
} from "@/types/manual-results";

function makeState(
  status: ManualResultActionState["status"],
  message: string,
): ManualResultActionState {
  return { status, message, updatedAt: Date.now() };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(value: string) {
  return value || null;
}

function parseNumber(value: string) {
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function normalizeHttpsUrl(value: string) {
  if (!value) {
    return { ok: true as const, value: null };
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:"
      ? { ok: true as const, value: url.toString() }
      : { ok: false as const };
  } catch {
    return { ok: false as const };
  }
}

async function getAdminScope() {
  const { user, profile } = await requireAdmin();

  if (!profile.tenant_id) {
    return {
      ok: false as const,
      error: "Seu perfil admin ainda nao esta vinculado a um tenant.",
    };
  }

  return {
    ok: true as const,
    userId: user.id,
    tenantId: profile.tenant_id,
  };
}

async function getOwnedRaffle(raffleId: string, tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("raffles")
    .select("*")
    .eq("id", raffleId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  return data as Raffle | null;
}

async function getOwnedWinner(winnerId: string, tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("winners")
    .select("*")
    .eq("id", winnerId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  return data as Winner | null;
}

async function getPrize(
  prizeId: string,
  raffleId: string,
): Promise<RafflePrize | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("raffle_prizes")
    .select("*")
    .eq("id", prizeId)
    .eq("raffle_id", raffleId)
    .maybeSingle();

  return data;
}

async function getRaffleNumber(raffleId: string, number: number) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("raffle_numbers")
    .select("*")
    .eq("raffle_id", raffleId)
    .eq("number", number)
    .maybeSingle();

  return data as RaffleNumber | null;
}

async function getLatestOrderForNumber(raffleNumber: RaffleNumber) {
  const supabase = await createSupabaseServerClient();

  if (raffleNumber.order_id) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", raffleNumber.order_id)
      .maybeSingle();

    if (data) {
      return data as Order;
    }
  }

  const { data: item } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("raffle_number_id", raffleNumber.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!item) {
    return null;
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", item.order_id)
    .maybeSingle();

  return order as Order | null;
}

async function validateWinnerForm(
  formData: FormData,
  raffle: Raffle,
) {
  const prizeId = getFormString(formData, "prizeId");
  const number = parseNumber(getFormString(formData, "number"));
  const inputName = getFormString(formData, "winnerName");
  const inputPhone = getFormString(formData, "winnerPhone");
  const instagramLiveUrl = normalizeHttpsUrl(
    getFormString(formData, "instagramLiveUrl"),
  );
  const proofUrl = normalizeHttpsUrl(getFormString(formData, "proofUrl"));
  const notes = getFormString(formData, "notes");

  if (!prizeId) {
    return { ok: false as const, error: "Selecione o premio entregue." };
  }

  if (!number) {
    return { ok: false as const, error: "Informe um numero vencedor valido." };
  }

  if (!instagramLiveUrl.ok || !proofUrl.ok) {
    return {
      ok: false as const,
      error: "Os links devem ser URLs completas iniciadas por https://.",
    };
  }

  if (inputPhone && !/^[0-9+()\-\s]{8,24}$/.test(inputPhone)) {
    return { ok: false as const, error: "Informe um WhatsApp valido." };
  }

  if (notes.length > 5000) {
    return { ok: false as const, error: "As observacoes excedem 5.000 caracteres." };
  }

  const [prize, raffleNumber] = await Promise.all([
    getPrize(prizeId, raffle.id),
    getRaffleNumber(raffle.id, number),
  ]);

  if (!prize) {
    return { ok: false as const, error: "Premio nao encontrado nesta rifa." };
  }

  if (!raffleNumber) {
    return { ok: false as const, error: "Este numero nao existe na rifa." };
  }

  const order = await getLatestOrderForNumber(raffleNumber);
  const winnerName = inputName || order?.customer_name?.trim() || "";
  const winnerPhone = inputPhone || order?.customer_phone?.trim() || "";

  if (winnerName.length < 2 || winnerName.length > 160) {
    return {
      ok: false as const,
      error: "Informe o nome do vencedor com pelo menos 2 caracteres.",
    };
  }

  return {
    ok: true as const,
    data: {
      prize,
      raffleNumber,
      order,
      number,
      winnerName,
      winnerPhone: optionalValue(winnerPhone),
      instagramLiveUrl: instagramLiveUrl.value,
      proofUrl: proofUrl.value,
      notes: optionalValue(notes),
    },
  };
}

function revalidateResultPaths(raffle: Raffle) {
  revalidatePath(`/admin/rifas/${raffle.id}/editar`);
  revalidatePath(`/admin/rifas/${raffle.id}/resultado`);
  revalidatePath(`/rifas/${raffle.slug}`);
  revalidatePath(`/rifas/${raffle.slug}/resultado`);
}

function numberStatusMessage(status: RaffleNumber["status"]) {
  if (status === "reserved") {
    return "Vencedor registrado. Atencao: o numero esta reservado, mas nao consta como pago.";
  }

  if (status === "available") {
    return "Vencedor registrado com alerta: o numero esta disponivel e nao consta como pago.";
  }

  return "Vencedor registrado com alerta: o numero esta cancelado e nao consta como pago.";
}

export async function createManualWinner(
  _state: ManualResultActionState,
  formData: FormData,
): Promise<ManualResultActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const raffleId = getFormString(formData, "raffleId");
  const raffle = await getOwnedRaffle(raffleId, scope.tenantId);

  if (!raffle) {
    return makeState("error", "Rifa nao encontrada neste tenant.");
  }

  const validation = await validateWinnerForm(formData, raffle);

  if (!validation.ok) {
    return makeState("error", validation.error);
  }

  const { data } = validation;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("winners").insert({
    tenant_id: scope.tenantId,
    raffle_id: raffle.id,
    prize_id: data.prize.id,
    user_id: data.raffleNumber.user_id ?? data.order?.user_id ?? null,
    order_id: data.raffleNumber.order_id ?? data.order?.id ?? null,
    number: data.number,
    winner_name: data.winnerName,
    winner_phone: data.winnerPhone,
    draw_source: "instagram_live",
    instagram_live_url: data.instagramLiveUrl,
    proof_url: data.proofUrl,
    notes: data.notes,
    published: false,
    created_by: scope.userId,
  });

  if (error) {
    const duplicate = error.message.includes("winners_raffle_prize_number_unique");
    return makeState(
      "error",
      duplicate
        ? "Este numero ja foi registrado para o premio selecionado."
        : "Nao foi possivel registrar o vencedor.",
    );
  }

  revalidateResultPaths(raffle);

  return data.raffleNumber.status === "paid"
    ? makeState("success", "Vencedor registrado com sucesso.")
    : makeState("warning", numberStatusMessage(data.raffleNumber.status));
}

export async function updateManualWinner(
  _state: ManualResultActionState,
  formData: FormData,
): Promise<ManualResultActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const winnerId = getFormString(formData, "winnerId");
  const winner = await getOwnedWinner(winnerId, scope.tenantId);

  if (!winner) {
    return makeState("error", "Vencedor nao encontrado neste tenant.");
  }

  const raffle = await getOwnedRaffle(winner.raffle_id, scope.tenantId);

  if (!raffle) {
    return makeState("error", "Rifa nao encontrada neste tenant.");
  }

  const validation = await validateWinnerForm(formData, raffle);

  if (!validation.ok) {
    return makeState("error", validation.error);
  }

  const { data } = validation;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("winners")
    .update({
      prize_id: data.prize.id,
      user_id: data.raffleNumber.user_id ?? data.order?.user_id ?? null,
      order_id: data.raffleNumber.order_id ?? data.order?.id ?? null,
      number: data.number,
      winner_name: data.winnerName,
      winner_phone: data.winnerPhone,
      instagram_live_url: data.instagramLiveUrl,
      proof_url: data.proofUrl,
      notes: data.notes,
    })
    .eq("id", winner.id)
    .eq("tenant_id", scope.tenantId);

  if (error) {
    return makeState("error", "Nao foi possivel atualizar o vencedor.");
  }

  revalidateResultPaths(raffle);

  return data.raffleNumber.status === "paid"
    ? makeState("success", "Vencedor atualizado.")
    : makeState("warning", numberStatusMessage(data.raffleNumber.status));
}

export async function deleteManualWinner(
  _state: ManualResultActionState,
  formData: FormData,
): Promise<ManualResultActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const winner = await getOwnedWinner(
    getFormString(formData, "winnerId"),
    scope.tenantId,
  );

  if (!winner) {
    return makeState("error", "Vencedor nao encontrado neste tenant.");
  }

  const raffle = await getOwnedRaffle(winner.raffle_id, scope.tenantId);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("winners")
    .delete()
    .eq("id", winner.id)
    .eq("tenant_id", scope.tenantId);

  if (error) {
    return makeState("error", "Nao foi possivel excluir o vencedor.");
  }

  if (raffle) {
    revalidateResultPaths(raffle);
  }

  return makeState("success", "Vencedor excluido.");
}

export async function publishResult(
  _state: ManualResultActionState,
  formData: FormData,
): Promise<ManualResultActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const raffle = await getOwnedRaffle(
    getFormString(formData, "raffleId"),
    scope.tenantId,
  );

  if (!raffle) {
    return makeState("error", "Rifa nao encontrada neste tenant.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("winners")
    .update({ published: true, published_at: new Date().toISOString() })
    .eq("raffle_id", raffle.id)
    .eq("tenant_id", scope.tenantId)
    .select("id");

  if (error || !data?.length) {
    return makeState(
      "error",
      error
        ? "Nao foi possivel publicar o resultado."
        : "Cadastre pelo menos um vencedor antes de publicar.",
    );
  }

  revalidateResultPaths(raffle);
  return makeState("success", "Resultado publicado na pagina publica.");
}

export async function unpublishResult(
  _state: ManualResultActionState,
  formData: FormData,
): Promise<ManualResultActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const raffle = await getOwnedRaffle(
    getFormString(formData, "raffleId"),
    scope.tenantId,
  );

  if (!raffle) {
    return makeState("error", "Rifa nao encontrada neste tenant.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("winners")
    .update({ published: false, published_at: null })
    .eq("raffle_id", raffle.id)
    .eq("tenant_id", scope.tenantId);

  if (error) {
    return makeState("error", "Nao foi possivel ocultar o resultado.");
  }

  revalidateResultPaths(raffle);
  return makeState("success", "Resultado ocultado da pagina publica.");
}

export async function getAdminManualResults(
  raffleId: string,
): Promise<ManualResultsResult<AdminManualResults>> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return { data: null, error: scope.error };
  }

  const raffle = await getOwnedRaffle(raffleId, scope.tenantId);

  if (!raffle) {
    return { data: null, error: "Rifa nao encontrada neste tenant." };
  }

  const supabase = await createSupabaseServerClient();
  const [prizesResult, winnersResult] = await Promise.all([
    supabase
      .from("raffle_prizes")
      .select("*")
      .eq("raffle_id", raffle.id)
      .order("position", { ascending: true }),
    supabase
      .from("winners")
      .select("*")
      .eq("raffle_id", raffle.id)
      .eq("tenant_id", scope.tenantId)
      .order("created_at", { ascending: true }),
  ]);

  if (prizesResult.error || winnersResult.error) {
    return { data: null, error: "Nao foi possivel carregar os resultados." };
  }

  const prizes = prizesResult.data ?? [];
  const winners = winnersResult.data ?? [];
  const winnerNumbers = [...new Set(winners.map((winner) => winner.number))];
  const { data: numberRows } = winnerNumbers.length
    ? await supabase
        .from("raffle_numbers")
        .select("number,status")
        .eq("raffle_id", raffle.id)
        .in("number", winnerNumbers)
    : { data: [] };
  const prizeById = new Map(prizes.map((prize) => [prize.id, prize]));
  const statusByNumber = new Map(
    (numberRows ?? []).map((row) => [row.number, row.status]),
  );
  const enrichedWinners: AdminManualWinner[] = winners.map((winner) => ({
    ...winner,
    prize: winner.prize_id ? prizeById.get(winner.prize_id) ?? null : null,
    numberStatus: statusByNumber.get(winner.number) ?? "available",
  }));

  return {
    data: { raffle, prizes, winners: enrichedWinners },
  };
}

export async function getPublicManualResults(
  slug: string,
): Promise<ManualResultsResult<PublicManualResults>> {
  const tenantId = await getPublicTenantId();

  if (!tenantId) {
    return { data: null, error: "Tenant publico nao configurado." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: raffleRows, error: raffleError } = await supabase.rpc(
    "get_public_result_raffle",
    { p_slug: slug, p_tenant_id: tenantId },
  );
  const raffle = raffleRows?.[0] ?? null;

  if (raffleError || !raffle) {
    return { data: null, error: "Rifa nao encontrada." };
  }

  const { data: winners, error: winnersError } = await supabase.rpc(
    "get_public_manual_results",
    { p_raffle_id: raffle.id, p_tenant_id: tenantId },
  );

  if (winnersError) {
    return { data: null, error: "Nao foi possivel carregar o resultado." };
  }

  return {
    data: {
      raffle,
      winners: winners ?? [],
      published: Boolean(winners?.length),
    },
  };
}

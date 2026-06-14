"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Raffle, RaffleNumberStatus } from "@/types/database";
import type { RaffleNumberPublic } from "@/types/raffle";

export type RaffleNumberStats = Record<RaffleNumberStatus, number> & {
  total: number;
  error?: string;
};

const emptyStats: RaffleNumberStats = {
  total: 0,
  available: 0,
  reserved: 0,
  paid: 0,
  cancelled: 0,
};

const numberStatuses: RaffleNumberStatus[] = [
  "available",
  "reserved",
  "paid",
  "cancelled",
];

async function getOwnedRaffle(raffleId: string, tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .eq("id", raffleId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

async function getAdminNumberScope(raffleId: string) {
  const { profile } = await requireAdmin();

  if (!profile.tenant_id) {
    return {
      ok: false as const,
      error: "Seu perfil admin ainda nao esta vinculado a um tenant.",
    };
  }

  const raffle = await getOwnedRaffle(raffleId, profile.tenant_id);

  if (!raffle) {
    return {
      ok: false as const,
      error: "Rifa nao encontrada neste tenant.",
    };
  }

  return {
    ok: true as const,
    raffle,
  };
}

export async function getPublicRaffleNumbers(
  raffleId: string,
): Promise<RaffleNumberPublic[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("public_raffle_numbers")
    .select("number,status")
    .eq("raffle_id", raffleId)
    .order("number", { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []).map((item) => ({
    number: item.number,
    status: item.status,
  }));
}

async function countNumbersByStatus(raffle: Raffle, status: RaffleNumberStatus) {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("raffle_numbers")
    .select("id", { count: "exact", head: true })
    .eq("raffle_id", raffle.id)
    .eq("status", status);

  if (error) {
    return null;
  }

  return count ?? 0;
}

export async function getAdminRaffleNumberStats(
  raffleId: string,
): Promise<RaffleNumberStats> {
  const scope = await getAdminNumberScope(raffleId);

  if (!scope.ok) {
    return {
      ...emptyStats,
      error: scope.error,
    };
  }

  const supabase = await createSupabaseServerClient();
  await supabase.rpc("expire_old_reservations", {});

  const counts = await Promise.all(
    numberStatuses.map(async (status) => ({
      status,
      count: await countNumbersByStatus(scope.raffle, status),
    })),
  );

  if (counts.some((item) => item.count === null)) {
    return {
      ...emptyStats,
      error: "Nao foi possivel carregar as estatisticas dos numeros.",
    };
  }

  const stats = counts.reduce<RaffleNumberStats>(
    (acc, item) => ({
      ...acc,
      [item.status]: item.count ?? 0,
      total: acc.total + (item.count ?? 0),
    }),
    { ...emptyStats },
  );

  return stats;
}

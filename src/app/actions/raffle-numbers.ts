"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  clampRaffleNumberPagination,
  defaultRaffleNumberPageSize,
  type RaffleNumberPage,
  type RaffleNumberPageInput,
} from "@/lib/raffles/number-pagination";
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

function getEmptyNumberPage(
  input: RaffleNumberPageInput = {},
): RaffleNumberPage {
  const normalized = clampRaffleNumberPagination(input);

  return {
    ...normalized,
    numbers: [],
    totalItems: 0,
    totalPages: 1,
  };
}

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
  const page = await getPublicRaffleNumberPage({
    raffleId,
    page: 1,
    pageSize: defaultRaffleNumberPageSize,
  });

  return page.numbers;
}

export async function getPublicRaffleNumberPage(
  input: RaffleNumberPageInput & { raffleId: string },
): Promise<RaffleNumberPage> {
  const { raffleId, ...paginationInput } = input;
  const normalized = clampRaffleNumberPagination(paginationInput);

  if (!raffleId) {
    return getEmptyNumberPage(normalized);
  }

  const supabase = createSupabasePublicClient();
  const searchNumber = normalized.search
    ? Number.parseInt(normalized.search, 10)
    : null;

  let countQuery = supabase
    .from("public_raffle_numbers")
    .select("number", { count: "exact", head: true })
    .eq("raffle_id", raffleId);

  if (normalized.status !== "all" && normalized.status !== "selected") {
    countQuery = countQuery.eq("status", normalized.status);
  }

  if (Number.isInteger(searchNumber) && searchNumber !== null) {
    countQuery = countQuery.eq("number", searchNumber);
  }

  if (normalized.fromNumber !== null) {
    countQuery = countQuery.gte("number", normalized.fromNumber);
  }

  if (normalized.toNumber !== null) {
    countQuery = countQuery.lte("number", normalized.toNumber);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    return getEmptyNumberPage(normalized);
  }

  const totalItems = count ?? 0;
  const totalPages = Math.max(Math.ceil(totalItems / normalized.pageSize), 1);
  const page = Math.min(normalized.page, totalPages);
  const from = (page - 1) * normalized.pageSize;
  const to = from + normalized.pageSize - 1;
  let dataQuery = supabase
    .from("public_raffle_numbers")
    .select("number,status")
    .eq("raffle_id", raffleId);

  if (normalized.status !== "all" && normalized.status !== "selected") {
    dataQuery = dataQuery.eq("status", normalized.status);
  }

  if (Number.isInteger(searchNumber) && searchNumber !== null) {
    dataQuery = dataQuery.eq("number", searchNumber);
  }

  if (normalized.fromNumber !== null) {
    dataQuery = dataQuery.gte("number", normalized.fromNumber);
  }

  if (normalized.toNumber !== null) {
    dataQuery = dataQuery.lte("number", normalized.toNumber);
  }

  const { data, error } = await dataQuery
    .order("number", { ascending: true })
    .range(from, to);

  if (error) {
    return getEmptyNumberPage(normalized);
  }

  return {
    ...normalized,
    page,
    numbers: (data ?? []).map((item) => ({
      number: item.number,
      status: item.status,
    })),
    totalItems,
    totalPages,
  };
}

export async function getPublicRaffleNumberStats(
  raffleId: string,
): Promise<RaffleNumberStats> {
  if (!raffleId) {
    return emptyStats;
  }

  const supabase = createSupabasePublicClient();
  const counts = await Promise.all(
    numberStatuses.map(async (status) => {
      const { count, error } = await supabase
        .from("public_raffle_numbers")
        .select("number", { count: "exact", head: true })
        .eq("raffle_id", raffleId)
        .eq("status", status);

      return {
        status,
        count: error ? null : (count ?? 0),
      };
    }),
  );

  if (counts.some((item) => item.count === null)) {
    return {
      ...emptyStats,
      error: "Nao foi possivel carregar as estatisticas dos numeros.",
    };
  }

  return counts.reduce<RaffleNumberStats>(
    (acc, item) => ({
      ...acc,
      [item.status]: item.count ?? 0,
      total: acc.total + (item.count ?? 0),
    }),
    { ...emptyStats },
  );
}

export async function getPublicRandomAvailableNumbers(input: {
  raffleId: string;
  quantity: number;
  excludedNumbers?: number[];
}): Promise<number[]> {
  if (!input.raffleId) {
    return [];
  }

  const quantity = Math.min(Math.max(Math.trunc(input.quantity), 1), 100);
  const excludedNumbers = Array.from(
    new Set(
      (input.excludedNumbers ?? []).filter(
        (number) => Number.isInteger(number) && number > 0,
      ),
    ),
  ).slice(0, 100);
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc(
    "get_random_available_raffle_numbers",
    {
      p_raffle_id: input.raffleId,
      p_quantity: quantity,
      p_excluded_numbers: excludedNumbers,
    },
  );

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("public_raffle_numbers")
      .select("number")
      .eq("raffle_id", input.raffleId)
      .eq("status", "available")
      .order("number", { ascending: true })
      .range(0, 999);

    if (fallbackError) {
      return [];
    }

    const excludedLookup = new Set(excludedNumbers);
    const availableNumbers = (fallbackData ?? [])
      .map((item) => item.number)
      .filter((number) => !excludedLookup.has(number));
    const selected: number[] = [];

    while (selected.length < quantity && availableNumbers.length > 0) {
      const index = Math.min(
        Math.floor(Math.random() * availableNumbers.length),
        availableNumbers.length - 1,
      );
      const [number] = availableNumbers.splice(index, 1);
      selected.push(number);
    }

    return selected;
  }

  return data ?? [];
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

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { isSupabaseConfigured } from "@/lib/env/public";
import { getPublicTenantId } from "@/lib/platform-settings/public";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Raffle, RafflePrize } from "@/types/database";

export type PublicPrizeSummary = {
  count: number;
  primaryTitle: string | null;
};

export type PublicRaffleCatalog = {
  raffles: Raffle[];
  prizeSummaries: Record<string, PublicPrizeSummary>;
};

type RaffleWithPrizes = Raffle & {
  raffle_prizes: Pick<RafflePrize, "title" | "position">[];
};

const loadPublicRaffleCatalog = unstable_cache(
  async (
    tenantId: string,
    featuredOnly: boolean,
    limit: number | null,
  ): Promise<PublicRaffleCatalog> => {
    const supabase = createSupabasePublicClient();
    let query = supabase
      .from("raffles")
      .select("*,raffle_prizes(title,position)")
      .eq("status", "active")
      .eq("tenant_id", tenantId)
      .order("featured", { ascending: false })
      .order("draw_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (featuredOnly) query = query.eq("featured", true);
    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error) return { raffles: [], prizeSummaries: {} };

    const rows = (data ?? []) as unknown as RaffleWithPrizes[];
    const prizeSummaries = rows.reduce<Record<string, PublicPrizeSummary>>(
      (summaries, row) => {
        const prizes = [...(row.raffle_prizes ?? [])].sort(
          (first, second) => first.position - second.position,
        );

        summaries[row.id] = {
          count: prizes.length,
          primaryTitle: prizes[0]?.title ?? null,
        };
        return summaries;
      },
      {},
    );

    return {
      raffles: rows.map((row) => {
        const raffle = { ...row };
        delete (raffle as Partial<RaffleWithPrizes>).raffle_prizes;
        return raffle as Raffle;
      }),
      prizeSummaries,
    };
  },
  ["public-raffle-catalog"],
  { revalidate: 60, tags: [CACHE_TAGS.publicRaffles] },
);

const loadPublicRaffleBySlug = unstable_cache(
  async (tenantId: string, slug: string): Promise<Raffle | null> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("raffles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .eq("tenant_id", tenantId)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return error ? null : (data as Raffle | null);
  },
  ["public-raffle-by-slug"],
  { revalidate: 30, tags: [CACHE_TAGS.publicRaffles] },
);

export async function getPublicRaffleCatalog(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<PublicRaffleCatalog> {
  const tenantId = await getPublicTenantId();

  if (!tenantId || !isSupabaseConfigured()) {
    return { raffles: [], prizeSummaries: {} };
  }

  return loadPublicRaffleCatalog(
    tenantId,
    Boolean(options?.featuredOnly),
    options?.limit ?? null,
  );
}

export async function getPublicActiveRaffles(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Raffle[]> {
  const tenantId = await getPublicTenantId();

  if (!tenantId || !isSupabaseConfigured()) {
    return [];
  }

  const catalog = await loadPublicRaffleCatalog(
    tenantId,
    Boolean(options?.featuredOnly),
    options?.limit ?? null,
  );
  return catalog.raffles;
}

export const getPublicRaffleBySlug = cache(async function getPublicRaffleBySlug(
  slug: string,
): Promise<Raffle | null> {
  const tenantId = await getPublicTenantId();

  if (!tenantId || !isSupabaseConfigured()) {
    return null;
  }

  return loadPublicRaffleBySlug(tenantId, slug);
});

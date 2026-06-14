import { isSupabaseConfigured } from "@/lib/env";
import { getPublicTenantId } from "@/lib/platform-settings/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Raffle } from "@/types/database";

export async function getPublicActiveRaffles(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Raffle[]> {
  const tenantId = await getPublicTenantId();

  if (!tenantId || !isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("raffles")
    .select("*")
    .eq("status", "active")
    .eq("tenant_id", tenantId)
    .order("featured", { ascending: false })
    .order("draw_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (options?.featuredOnly) {
    query = query.eq("featured", true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    return [];
  }

  return (data ?? []) as Raffle[];
}

export async function getPublicRaffleBySlug(slug: string): Promise<Raffle | null> {
  const tenantId = await getPublicTenantId();

  if (!tenantId || !isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
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

  if (error) {
    return null;
  }

  return data as Raffle | null;
}

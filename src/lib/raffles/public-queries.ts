import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Raffle } from "@/types/database";

async function getActiveTenantIds() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id")
    .eq("status", "active");

  if (error) {
    return [];
  }

  return data.map((tenant) => tenant.id);
}

export async function getPublicActiveRaffles(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Raffle[]> {
  const tenantIds = await getActiveTenantIds();

  if (tenantIds.length === 0) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("raffles")
    .select("*")
    .eq("status", "active")
    .in("tenant_id", tenantIds)
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
  const tenantIds = await getActiveTenantIds();

  if (tenantIds.length === 0) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .in("tenant_id", tenantIds)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as Raffle | null;
}

export type SupabasePublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function getRequiredPublicEnv(name: string, value: string | undefined): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing required public environment variable: ${name}`);
  }

  return normalized;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    supabaseUrl: getRequiredPublicEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    supabaseAnonKey: getRequiredPublicEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function getPublicTenantSlug() {
  return process.env.NEXT_PUBLIC_TENANT_SLUG?.trim() || null;
}

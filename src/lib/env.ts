type SupabaseEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type SupabaseAdminEnv = SupabaseEnv & {
  supabaseServiceRoleKey: string;
};

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function getRequiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabasePublicEnv(): SupabaseEnv {
  return {
    supabaseUrl: getRequiredEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    supabaseAnonKey: getRequiredEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function getSupabaseServerEnv(): SupabaseEnv {
  return getSupabasePublicEnv();
}

export function getSupabaseAdminEnv(): SupabaseAdminEnv {
  return {
    ...getSupabaseServerEnv(),
    supabaseServiceRoleKey: getRequiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
  };
}

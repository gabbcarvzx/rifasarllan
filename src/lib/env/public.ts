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

function assertSingleLine(name: string, value: string) {
  if (/\s/.test(value)) {
    throw new Error(`${name} must be a single value without whitespace.`);
  }

  return value;
}

function getSupabaseUrl() {
  const value = assertSingleLine(
    "NEXT_PUBLIC_SUPABASE_URL",
    getRequiredPublicEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
  );

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL.");
  }

  return value;
}

function getSupabaseAnonKey() {
  const value = assertSingleLine(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    getRequiredPublicEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  );
  const isJwt = value.split(".").length === 3;
  const isPublishableKey = value.startsWith("sb_publishable_");

  if (!isJwt && !isPublishableKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY has an invalid format.");
  }

  return value;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    supabaseUrl: getSupabaseUrl(),
    supabaseAnonKey: getSupabaseAnonKey(),
  };
}

export function getPublicTenantSlug() {
  return process.env.NEXT_PUBLIC_TENANT_SLUG?.trim() || null;
}

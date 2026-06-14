import "server-only";

import {
  getSupabasePublicEnv,
  type SupabasePublicEnv,
} from "@/lib/env/public";

type SupabaseAdminEnv = SupabasePublicEnv & {
  supabaseServiceRoleKey: string;
};

function getRequiredServerEnv(name: string, value: string | undefined): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return normalized;
}

export function getSupabaseServerEnv(): SupabasePublicEnv {
  return getSupabasePublicEnv();
}

export function getSupabaseAdminEnv(): SupabaseAdminEnv {
  return {
    ...getSupabaseServerEnv(),
    supabaseServiceRoleKey: getRequiredServerEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
  };
}

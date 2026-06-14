import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database";

let publicClient: SupabaseClient<Database> | null = null;

export function createSupabasePublicClient() {
  if (!publicClient) {
    const { supabaseAnonKey, supabaseUrl } = getSupabasePublicEnv();

    publicClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  return publicClient;
}

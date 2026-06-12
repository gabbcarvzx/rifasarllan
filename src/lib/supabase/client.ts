"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let browserClient: SupabaseBrowserClient | null = null;

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    const { supabaseAnonKey, supabaseUrl } = getSupabasePublicEnv();

    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}

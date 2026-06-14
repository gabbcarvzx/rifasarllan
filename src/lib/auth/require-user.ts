import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env/public";
import { getAuthContext } from "@/lib/auth/session";

export const requireUser = cache(async () => {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=Configure%20o%20Supabase%20para%20usar%20autenticacao.");
  }

  const { user, profile } = await getAuthContext();

  if (!user) {
    redirect("/login?error=Entre%20para%20continuar.");
  }

  return { user, profile };
});

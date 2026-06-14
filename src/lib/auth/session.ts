import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthContext, AuthProfile, AuthUser } from "@/types/auth";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export const getServerUser = cache(async (): Promise<AuthUser | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims || typeof claims.sub !== "string") {
    return null;
  }

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    user_metadata: asRecord(claims.user_metadata),
  };
});

export const getServerProfile = cache(
  async (userId?: string): Promise<AuthProfile | null> => {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const user = userId ? null : await getServerUser();
    const profileUserId = userId ?? user?.id;

    if (!profileUserId) {
      return null;
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id,full_name,email,phone,role,tenant_id,created_at,updated_at,tenant:tenants(status)",
      )
      .eq("id", profileUserId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data as unknown as AuthProfile;
  },
);

export const getAuthContext = cache(async (): Promise<AuthContext> => {
  const user = await getServerUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const profile = await getServerProfile(user.id);

  return { user, profile };
});

export async function hasSupabaseSessionCookie() {
  const cookieStore = await cookies();

  return cookieStore.getAll().some(({ name }) => {
    return name.startsWith("sb-") && name.includes("-auth-token");
  });
}

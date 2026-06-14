import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthContext } from "@/types/auth";
import type { Profile } from "@/types/database";

export const getServerUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getServerProfile = cache(
  async (userId?: string): Promise<Profile | null> => {
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
      .select("*")
      .eq("id", profileUserId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data;
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

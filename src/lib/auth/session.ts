import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthContext } from "@/types/auth";
import type { Profile } from "@/types/database";

export async function getServerUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getServerProfile(userId?: string): Promise<Profile | null> {
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
}

export async function getAuthContext(): Promise<AuthContext> {
  const user = await getServerUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const profile = await getServerProfile(user.id);

  return { user, profile };
}

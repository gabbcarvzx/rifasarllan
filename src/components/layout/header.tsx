import { getAuthContext } from "@/lib/auth/session";
import { HeaderClient } from "@/components/layout/header-client";

export async function Header() {
  const { user, profile } = await getAuthContext();

  return (
    <HeaderClient
      isLoggedIn={Boolean(user)}
      isAdmin={profile?.role === "admin"}
      displayName={profile?.full_name ?? user?.email ?? null}
    />
  );
}

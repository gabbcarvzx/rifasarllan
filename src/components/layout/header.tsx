import {
  getAuthContext,
  hasSupabaseSessionCookie,
} from "@/lib/auth/session";
import { HeaderClient } from "@/components/layout/header-client";
import { getPublicPlatformSettings } from "@/lib/platform-settings/public";

export async function Header() {
  const [hasSessionCookie, settings] = await Promise.all([
    hasSupabaseSessionCookie(),
    getPublicPlatformSettings(),
  ]);
  const { user, profile } = hasSessionCookie
    ? await getAuthContext()
    : { user: null, profile: null };

  return (
    <HeaderClient
      isLoggedIn={Boolean(user)}
      isAdmin={profile?.role === "admin"}
      displayName={profile?.full_name ?? user?.email ?? null}
      platformName={settings.platform_name}
      logoUrl={settings.logo_url}
    />
  );
}

import { hasSupabaseSessionCookie } from "@/lib/auth/session";
import { HeaderClient } from "@/components/layout/header-client";
import { getPublicPlatformSettings } from "@/lib/platform-settings/public";

export async function Header() {
  const [hasSessionCookie, settings] = await Promise.all([
    hasSupabaseSessionCookie(),
    getPublicPlatformSettings(),
  ]);
  return (
    <HeaderClient
      isLoggedIn={hasSessionCookie}
      isAdmin={false}
      displayName={null}
      platformName={settings.platform_name}
      logoUrl={settings.logo_url}
    />
  );
}

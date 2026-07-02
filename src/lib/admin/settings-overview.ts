import type { ResolvedPlatformSettings } from "@/types/platform-settings";

function hasText(value: string | null | undefined, minLength = 1) {
  return Boolean(value && value.trim().length >= minLength);
}

function countTruthy(values: Array<string | null | undefined>) {
  return values.filter((value) => hasText(value)).length;
}

export type AdminSettingsOverview = {
  assetsReady: number;
  contactChannels: number;
  seoReady: boolean;
  legalReady: boolean;
  brandingReady: boolean;
};

export function getAdminSettingsOverview(
  settings: ResolvedPlatformSettings,
): AdminSettingsOverview {
  const assetsReady = countTruthy([
    settings.logo_url,
    settings.favicon_url,
    settings.hero_banner_url,
  ]);
  const contactChannels = countTruthy([
    settings.support_email,
    settings.whatsapp_number,
    settings.instagram_url,
    settings.facebook_url,
    settings.youtube_url,
  ]);
  const seoReady =
    hasText(settings.seo_title, 5) && hasText(settings.seo_description, 20);
  const legalReady =
    hasText(settings.privacy_policy, 20) && hasText(settings.terms_of_use, 20);
  const brandingReady =
    hasText(settings.platform_name, 2) &&
    hasText(settings.platform_subtitle, 5) &&
    hasText(settings.primary_color, 7) &&
    hasText(settings.secondary_color, 7);

  return {
    assetsReady,
    contactChannels,
    seoReady,
    legalReady,
    brandingReady,
  };
}

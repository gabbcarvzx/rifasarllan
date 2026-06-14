import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  getPublicTenantSlug,
  isSupabaseConfigured,
} from "@/lib/env/public";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/platform-settings/defaults";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { PlatformSettings } from "@/types/database";
import type { ResolvedPlatformSettings } from "@/types/platform-settings";

function mergeSettings(
  settings: PlatformSettings | null,
  tenantId: string | null,
): ResolvedPlatformSettings {
  if (!settings) {
    return { ...DEFAULT_PLATFORM_SETTINGS, tenant_id: tenantId };
  }

  return {
    ...DEFAULT_PLATFORM_SETTINGS,
    ...settings,
    platform_name: settings.platform_name || DEFAULT_PLATFORM_SETTINGS.platform_name,
    platform_subtitle:
      settings.platform_subtitle ||
      settings.hero_subtitle ||
      settings.hero_title ||
      DEFAULT_PLATFORM_SETTINGS.platform_subtitle,
    primary_color:
      settings.primary_color || DEFAULT_PLATFORM_SETTINGS.primary_color,
    secondary_color:
      settings.secondary_color || DEFAULT_PLATFORM_SETTINGS.secondary_color,
    seo_title:
      settings.seo_title ||
      `${settings.platform_name} | ${DEFAULT_PLATFORM_SETTINGS.platform_subtitle}`,
    seo_description:
      settings.seo_description ||
      settings.platform_subtitle ||
      DEFAULT_PLATFORM_SETTINGS.seo_description,
  };
}

export const getPublicTenantId = cache(async (): Promise<string | null> => {
  const bootstrap = await getPublicPlatformBootstrap(getPublicTenantSlug());
  return bootstrap.tenantId;
});

export const getPublicPlatformSettings = cache(
  async (): Promise<ResolvedPlatformSettings> => {
    const bootstrap = await getPublicPlatformBootstrap(getPublicTenantSlug());
    return mergeSettings(bootstrap.settings, bootstrap.tenantId);
  },
);

type PlatformBootstrap = {
  tenantId: string | null;
  settings: PlatformSettings | null;
};

type TenantWithSettings = {
  id: string;
  platform_settings: PlatformSettings[] | PlatformSettings | null;
};

const getPublicPlatformBootstrap = unstable_cache(
  async (configuredSlug: string | null): Promise<PlatformBootstrap> => {
    if (!isSupabaseConfigured()) {
      return { tenantId: null, settings: null };
    }

    const supabase = createSupabasePublicClient();
    let query = supabase
      .from("tenants")
      .select("id,platform_settings(*)")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1);

    if (configuredSlug) {
      query = query.eq("slug", configuredSlug);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return { tenantId: null, settings: null };
    }

    const tenant = data as unknown as TenantWithSettings;
    const embeddedSettings = Array.isArray(tenant.platform_settings)
      ? tenant.platform_settings[0] ?? null
      : tenant.platform_settings;

    return {
      tenantId: tenant.id,
      settings: embeddedSettings ?? null,
    };
  },
  ["public-platform-bootstrap"],
  { revalidate: 300, tags: [CACHE_TAGS.platformSettings] },
);

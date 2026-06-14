import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/platform-settings/defaults";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const configuredSlug = process.env.NEXT_PUBLIC_TENANT_SLUG?.trim();

  if (configuredSlug) {
    const { data } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", configuredSlug)
      .eq("status", "active")
      .maybeSingle();

    if (data?.id) {
      return data.id;
    }
  }

  const { data: configuredSettings } = await supabase
    .from("platform_settings")
    .select("tenant_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (configuredSettings?.tenant_id) {
    return configuredSettings.tenant_id;
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return tenant?.id ?? null;
});

export const getPublicPlatformSettings = cache(
  async (): Promise<ResolvedPlatformSettings> => {
    const tenantId = await getPublicTenantId();

    if (!tenantId || !isSupabaseConfigured()) {
      return mergeSettings(null, tenantId);
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) {
      return mergeSettings(null, tenantId);
    }

    return mergeSettings(data, tenantId);
  },
);

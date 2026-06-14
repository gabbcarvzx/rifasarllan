"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/platform-settings/defaults";
import { isHexColor } from "@/lib/platform-settings/theme";
import { uploadMediaFile } from "@/lib/storage/upload";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PlatformSettings } from "@/types/database";
import type { UploadPurpose } from "@/types/media";
import type {
  PlatformAssetField,
  PlatformSettingsActionState,
  ResolvedPlatformSettings,
} from "@/types/platform-settings";

type SettingsPatch = Partial<
  Omit<PlatformSettings, "id" | "tenant_id" | "created_at" | "updated_at">
>;

function makeState(
  status: PlatformSettingsActionState["status"],
  message: string,
): PlatformSettingsActionState {
  return { status, message, updatedAt: Date.now() };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFormFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function optionalValue(value: string) {
  return value || null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeUrl(value: string) {
  if (!value) {
    return { ok: true as const, value: null };
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      return { ok: false as const };
    }

    return { ok: true as const, value: url.toString() };
  } catch {
    return { ok: false as const };
  }
}

async function getAdminScope() {
  const { profile } = await requireAdmin();

  if (!profile.tenant_id) {
    return {
      ok: false as const,
      error: "Seu perfil admin ainda nao esta vinculado a um tenant.",
    };
  }

  return { ok: true as const, tenantId: profile.tenant_id };
}

function resolveSettings(
  settings: PlatformSettings | null,
  tenantId: string,
): ResolvedPlatformSettings {
  return {
    ...DEFAULT_PLATFORM_SETTINGS,
    ...(settings ?? {}),
    id: settings?.id ?? null,
    tenant_id: tenantId,
    created_at: settings?.created_at ?? null,
    updated_at: settings?.updated_at ?? null,
    platform_name:
      settings?.platform_name || DEFAULT_PLATFORM_SETTINGS.platform_name,
    platform_subtitle:
      settings?.platform_subtitle ||
      settings?.hero_subtitle ||
      settings?.hero_title ||
      DEFAULT_PLATFORM_SETTINGS.platform_subtitle,
    primary_color:
      settings?.primary_color || DEFAULT_PLATFORM_SETTINGS.primary_color,
    secondary_color:
      settings?.secondary_color || DEFAULT_PLATFORM_SETTINGS.secondary_color,
  };
}

async function upsertSettings(tenantId: string, patch: SettingsPatch) {
  const supabase = await createSupabaseServerClient();
  const { data: current } = await supabase
    .from("platform_settings")
    .select("platform_name")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  return supabase
    .from("platform_settings")
    .upsert(
      {
        tenant_id: tenantId,
        platform_name:
          patch.platform_name ||
          current?.platform_name ||
          DEFAULT_PLATFORM_SETTINGS.platform_name,
        ...patch,
      },
      { onConflict: "tenant_id" },
    )
    .select("*")
    .single();
}

async function deactivateAssetByUrl(tenantId: string, publicUrl?: string | null) {
  if (!publicUrl) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("media_files")
    .update({ is_active: false })
    .eq("tenant_id", tenantId)
    .eq("bucket_name", "platform-assets")
    .eq("public_url", publicUrl);
}

function revalidatePlatform() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
  revalidatePath("/termos");
  revalidatePath("/privacidade");
  revalidatePath("/rifas");
}

export async function getAdminPlatformSettings(): Promise<ResolvedPlatformSettings> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return DEFAULT_PLATFORM_SETTINGS;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("*")
    .eq("tenant_id", scope.tenantId)
    .maybeSingle();

  return resolveSettings(data, scope.tenantId);
}

export async function updateGeneralSettings(
  _state: PlatformSettingsActionState,
  formData: FormData,
): Promise<PlatformSettingsActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const platformName = getFormString(formData, "platformName");
  const platformSubtitle = getFormString(formData, "platformSubtitle");
  const supportEmail = getFormString(formData, "supportEmail").toLowerCase();
  const footerText = getFormString(formData, "footerText");

  if (platformName.length < 2 || platformName.length > 80) {
    return makeState("error", "O nome deve ter entre 2 e 80 caracteres.");
  }

  if (platformSubtitle.length < 5 || platformSubtitle.length > 220) {
    return makeState("error", "O slogan deve ter entre 5 e 220 caracteres.");
  }

  if (supportEmail && !isValidEmail(supportEmail)) {
    return makeState("error", "Informe um e-mail de suporte valido.");
  }

  if (footerText.length > 500) {
    return makeState("error", "O texto do rodape deve ter no maximo 500 caracteres.");
  }

  const { error } = await upsertSettings(scope.tenantId, {
    platform_name: platformName,
    platform_subtitle: platformSubtitle,
    support_email: optionalValue(supportEmail),
    footer_text: optionalValue(footerText),
  });

  if (error) {
    return makeState("error", "Nao foi possivel salvar as configuracoes gerais.");
  }

  revalidatePlatform();
  return makeState("success", "Configuracoes gerais atualizadas.");
}

const assetUploads: Array<{
  input: string;
  field: PlatformAssetField;
  purpose: UploadPurpose;
}> = [
  { input: "logo", field: "logo_url", purpose: "logo" },
  { input: "favicon", field: "favicon_url", purpose: "favicon" },
  { input: "heroBanner", field: "hero_banner_url", purpose: "banner" },
];

export async function updateBrandingSettings(
  _state: PlatformSettingsActionState,
  formData: FormData,
): Promise<PlatformSettingsActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const primaryColor = getFormString(formData, "primaryColor");
  const secondaryColor = getFormString(formData, "secondaryColor");

  if (!isHexColor(primaryColor) || !isHexColor(secondaryColor)) {
    return makeState("error", "Use cores no formato hexadecimal, como #22c55e.");
  }

  const current = await getAdminPlatformSettings();
  const patch: SettingsPatch = {
    primary_color: primaryColor.toLowerCase(),
    secondary_color: secondaryColor.toLowerCase(),
  };
  const newMedia: Array<{ id: string; field: PlatformAssetField }> = [];

  for (const asset of assetUploads) {
    const file = getFormFile(formData, asset.input);

    if (!file) {
      continue;
    }

    const upload = await uploadMediaFile(file, asset.purpose);

    if (!upload.ok || !upload.mediaFile.public_url) {
      for (const media of newMedia) {
        const supabase = await createSupabaseServerClient();
        await supabase
          .from("media_files")
          .update({ is_active: false })
          .eq("id", media.id)
          .eq("tenant_id", scope.tenantId);
      }

      return makeState(
        "error",
        upload.ok ? "O asset enviado nao possui URL publica." : upload.error,
      );
    }

    patch[asset.field] = upload.mediaFile.public_url;
    newMedia.push({ id: upload.mediaFile.id, field: asset.field });
  }

  const { error } = await upsertSettings(scope.tenantId, patch);

  if (error) {
    if (newMedia.length > 0) {
      const supabase = await createSupabaseServerClient();
      await supabase
        .from("media_files")
        .update({ is_active: false })
        .eq("tenant_id", scope.tenantId)
        .in(
          "id",
          newMedia.map((media) => media.id),
        );
    }

    return makeState("error", "Nao foi possivel salvar o branding.");
  }

  for (const media of newMedia) {
    await deactivateAssetByUrl(scope.tenantId, current[media.field]);
  }

  revalidatePlatform();
  return makeState("success", "Branding atualizado e aplicado na plataforma.");
}

export async function removePlatformAsset(
  _state: PlatformSettingsActionState,
  formData: FormData,
): Promise<PlatformSettingsActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const field = getFormString(formData, "assetField") as PlatformAssetField;

  if (!["logo_url", "favicon_url", "hero_banner_url"].includes(field)) {
    return makeState("error", "Asset de plataforma invalido.");
  }

  const current = await getAdminPlatformSettings();
  const { error } = await upsertSettings(scope.tenantId, { [field]: null });

  if (error) {
    return makeState("error", "Nao foi possivel remover o asset.");
  }

  await deactivateAssetByUrl(scope.tenantId, current[field]);
  revalidatePlatform();
  return makeState("success", "Asset removido da identidade visual.");
}

export async function updateSocialSettings(
  _state: PlatformSettingsActionState,
  formData: FormData,
): Promise<PlatformSettingsActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const whatsapp = getFormString(formData, "whatsappNumber");
  const fields = {
    instagram_url: normalizeUrl(getFormString(formData, "instagramUrl")),
    facebook_url: normalizeUrl(getFormString(formData, "facebookUrl")),
    youtube_url: normalizeUrl(getFormString(formData, "youtubeUrl")),
  };

  if (whatsapp && !/^[0-9+()\-\s]{8,24}$/.test(whatsapp)) {
    return makeState("error", "Informe um numero de WhatsApp valido.");
  }

  if (Object.values(fields).some((value) => !value.ok)) {
    return makeState("error", "Informe URLs completas iniciadas por https://.");
  }

  const { error } = await upsertSettings(scope.tenantId, {
    whatsapp_number: optionalValue(whatsapp),
    instagram_url: fields.instagram_url.value,
    facebook_url: fields.facebook_url.value,
    youtube_url: fields.youtube_url.value,
  });

  if (error) {
    return makeState("error", "Nao foi possivel salvar as redes sociais.");
  }

  revalidatePlatform();
  return makeState("success", "Canais de contato atualizados.");
}

export async function updateSeoSettings(
  _state: PlatformSettingsActionState,
  formData: FormData,
): Promise<PlatformSettingsActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const seoTitle = getFormString(formData, "seoTitle");
  const seoDescription = getFormString(formData, "seoDescription");

  if (seoTitle.length < 5 || seoTitle.length > 70) {
    return makeState("error", "O titulo SEO deve ter entre 5 e 70 caracteres.");
  }

  if (seoDescription.length < 20 || seoDescription.length > 170) {
    return makeState("error", "A descricao SEO deve ter entre 20 e 170 caracteres.");
  }

  const { error } = await upsertSettings(scope.tenantId, {
    seo_title: seoTitle,
    seo_description: seoDescription,
  });

  if (error) {
    return makeState("error", "Nao foi possivel salvar as configuracoes de SEO.");
  }

  revalidatePlatform();
  return makeState("success", "SEO atualizado.");
}

export async function updateLegalSettings(
  _state: PlatformSettingsActionState,
  formData: FormData,
): Promise<PlatformSettingsActionState> {
  const scope = await getAdminScope();

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const privacyPolicy = getFormString(formData, "privacyPolicy");
  const termsOfUse = getFormString(formData, "termsOfUse");

  if (privacyPolicy.length > 50000 || termsOfUse.length > 50000) {
    return makeState("error", "Cada texto legal deve ter no maximo 50.000 caracteres.");
  }

  const { error } = await upsertSettings(scope.tenantId, {
    privacy_policy: optionalValue(privacyPolicy),
    terms_of_use: optionalValue(termsOfUse),
  });

  if (error) {
    return makeState("error", "Nao foi possivel salvar os textos legais.");
  }

  revalidatePlatform();
  return makeState("success", "Textos legais atualizados.");
}

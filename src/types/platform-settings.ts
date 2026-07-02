import type { PlatformSettings } from "@/types/database";

export type PlatformSettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
  updatedAt?: number;
};

export type ResolvedPlatformSettings = Omit<
  PlatformSettings,
  "id" | "tenant_id" | "created_at" | "updated_at"
> & {
  id: string | null;
  tenant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PlatformAssetField =
  | "logo_url"
  | "favicon_url"
  | "hero_banner_url";

export type PlatformThemeTokenName =
  | "background"
  | "foreground"
  | "muted"
  | "border"
  | "surface"
  | "surfaceRaised"
  | "card"
  | "cardForeground"
  | "input"
  | "inputForeground"
  | "header"
  | "headerForeground"
  | "footer"
  | "footerForeground"
  | "sidebar"
  | "sidebarForeground"
  | "primary"
  | "primaryForeground"
  | "secondary"
  | "secondaryForeground"
  | "accent"
  | "accentForeground"
  | "success"
  | "successForeground"
  | "warning"
  | "warningForeground"
  | "danger"
  | "dangerForeground"
  | "info"
  | "infoForeground";

export type PlatformThemeTokens = Record<PlatformThemeTokenName, string>;

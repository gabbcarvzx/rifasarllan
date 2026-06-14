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

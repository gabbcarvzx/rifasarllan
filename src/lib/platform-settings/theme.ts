import type { CSSProperties } from "react";
import type { ResolvedPlatformSettings } from "@/types/platform-settings";

type ThemeProperties = CSSProperties & Record<`--${string}`, string>;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: string) {
  return HEX_COLOR.test(value);
}

function readableForeground(hex: string) {
  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 150 ? "#07100b" : "#ffffff";
}

export function getPlatformThemeStyle(
  settings: ResolvedPlatformSettings,
): ThemeProperties {
  const primary = isHexColor(settings.primary_color ?? "")
    ? settings.primary_color!
    : "#22c55e";
  const secondary = isHexColor(settings.secondary_color ?? "")
    ? settings.secondary_color!
    : "#d6a94f";

  return {
    "--primary": primary,
    "--primary-foreground": readableForeground(primary),
    "--accent": secondary,
    "--accent-foreground": readableForeground(secondary),
    "--shadow-primary": `0 24px 80px -40px ${primary}99`,
    "--shadow-secondary": `0 22px 72px -44px ${secondary}b3`,
  };
}

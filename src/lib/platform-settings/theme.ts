import type { CSSProperties } from "react";
import type { ResolvedPlatformSettings } from "@/types/platform-settings";
import type { PlatformThemeTokens } from "@/types/platform-settings";

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

export function getThemeTokens(
  settings: ResolvedPlatformSettings,
): PlatformThemeTokens {
  const primary = isHexColor(settings.primary_color ?? "")
    ? settings.primary_color!
    : "#22c55e";
  const secondary = isHexColor(settings.secondary_color ?? "")
    ? settings.secondary_color!
    : "#d6a94f";

  return {
    background: "#060808",
    foreground: "#f7f2e8",
    muted: "#9da8a0",
    border: "#24302c",
    surface: "#0d1110",
    surfaceRaised: "#141a18",
    card: "#161c1a",
    cardForeground: "#f7f2e8",
    input: "#0f1513",
    inputForeground: "#f7f2e8",
    header: "#08100e",
    headerForeground: "#f7f2e8",
    footer: "#050706",
    footerForeground: "#eef5ef",
    sidebar: "#0b0f0e",
    sidebarForeground: "#f4f7f4",
    primary,
    primaryForeground: readableForeground(primary),
    secondary,
    secondaryForeground: readableForeground(secondary),
    accent: secondary,
    accentForeground: readableForeground(secondary),
    success: "#16a34a",
    successForeground: "#f5fff8",
    warning: "#f59e0b",
    warningForeground: "#1b1202",
    danger: "#f43f5e",
    dangerForeground: "#fff5f7",
    info: "#38bdf8",
    infoForeground: "#04141d",
  };
}

export function getPlatformThemeStyle(
  settings: ResolvedPlatformSettings,
): ThemeProperties {
  const tokens = getThemeTokens(settings);

  return {
    "--background": tokens.background,
    "--foreground": tokens.foreground,
    "--muted": tokens.muted,
    "--border": tokens.border,
    "--surface": tokens.surface,
    "--surface-raised": tokens.surfaceRaised,
    "--card": tokens.card,
    "--card-foreground": tokens.cardForeground,
    "--input": tokens.input,
    "--input-foreground": tokens.inputForeground,
    "--header": tokens.header,
    "--header-foreground": tokens.headerForeground,
    "--footer": tokens.footer,
    "--footer-foreground": tokens.footerForeground,
    "--sidebar": tokens.sidebar,
    "--sidebar-foreground": tokens.sidebarForeground,
    "--primary": tokens.primary,
    "--primary-foreground": tokens.primaryForeground,
    "--secondary": tokens.secondary,
    "--secondary-foreground": tokens.secondaryForeground,
    "--accent": tokens.accent,
    "--accent-foreground": tokens.accentForeground,
    "--success": tokens.success,
    "--success-foreground": tokens.successForeground,
    "--warning": tokens.warning,
    "--warning-foreground": tokens.warningForeground,
    "--danger": tokens.danger,
    "--danger-foreground": tokens.dangerForeground,
    "--info": tokens.info,
    "--info-foreground": tokens.infoForeground,
    "--shadow-primary": `0 24px 80px -40px ${tokens.primary}99`,
    "--shadow-secondary": `0 22px 72px -44px ${tokens.secondary}b3`,
  };
}

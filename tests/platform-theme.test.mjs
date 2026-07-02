import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getPlatformThemeStyle,
  getThemeTokens,
  isHexColor,
} from "../src/lib/platform-settings/theme.ts";

const settings = {
  id: "theme-id",
  tenant_id: "tenant-id",
  platform_name: "Tema Premium",
  platform_subtitle: "Teste",
  logo_url: null,
  favicon_url: null,
  hero_banner_url: null,
  primary_color: "#22c55e",
  secondary_color: "#d6a94f",
  whatsapp_number: null,
  instagram_url: null,
  facebook_url: null,
  youtube_url: null,
  support_email: null,
  footer_text: null,
  privacy_policy: null,
  terms_of_use: null,
  seo_title: null,
  seo_description: null,
  hero_title: null,
  hero_subtitle: null,
  created_at: null,
  updated_at: null,
};

test("isHexColor accepts only 6-digit hex colors", () => {
  assert.equal(isHexColor("#22c55e"), true);
  assert.equal(isHexColor("#ABCDEF"), true);
  assert.equal(isHexColor("#fff"), false);
  assert.equal(isHexColor("22c55e"), false);
});

test("getThemeTokens returns the complete semantic token map", () => {
  const tokens = getThemeTokens(settings);

  for (const key of [
    "background",
    "foreground",
    "muted",
    "border",
    "surface",
    "surfaceRaised",
    "card",
    "cardForeground",
    "input",
    "inputForeground",
    "header",
    "headerForeground",
    "footer",
    "footerForeground",
    "sidebar",
    "sidebarForeground",
    "primary",
    "primaryForeground",
    "secondary",
    "secondaryForeground",
    "accent",
    "accentForeground",
    "success",
    "successForeground",
    "warning",
    "warningForeground",
    "danger",
    "dangerForeground",
    "info",
    "infoForeground",
  ]) {
    assert.equal(typeof tokens[key], "string", `${key} should be a string token`);
    assert.notEqual(tokens[key].length, 0, `${key} should not be empty`);
  }
});

test("getPlatformThemeStyle maps semantic tokens to CSS variables", () => {
  const style = getPlatformThemeStyle(settings);

  assert.equal(style["--primary"], "#22c55e");
  assert.equal(style["--secondary"], "#d6a94f");
  assert.equal(style["--accent"], "#d6a94f");
  assert.equal(typeof style["--surface"], "string");
  assert.equal(typeof style["--header"], "string");
  assert.equal(typeof style["--sidebar"], "string");
  assert.equal(typeof style["--success"], "string");
  assert.equal(typeof style["--warning"], "string");
  assert.equal(typeof style["--danger"], "string");
});

test("getThemeTokens derives readable foregrounds for bright and dark brand colors", () => {
  const bright = getThemeTokens({
    ...settings,
    primary_color: "#f5f06a",
    secondary_color: "#101820",
  });

  assert.equal(bright.primaryForeground, "#07100b");
  assert.equal(bright.secondaryForeground, "#ffffff");
});

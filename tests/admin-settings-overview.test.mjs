import assert from "node:assert/strict";
import { test } from "node:test";
import { getAdminSettingsOverview } from "../src/lib/admin/settings-overview.ts";

test("getAdminSettingsOverview summarizes white-label readiness", () => {
  assert.deepEqual(
    getAdminSettingsOverview({
      id: "1",
      tenant_id: "tenant-1",
      created_at: null,
      updated_at: null,
      platform_name: "Rifa Pro",
      platform_subtitle: "Campanhas premium com sorteios confiaveis",
      logo_url: "https://cdn.example.com/logo.png",
      favicon_url: "https://cdn.example.com/favicon.png",
      hero_banner_url: null,
      primary_color: "#22c55e",
      secondary_color: "#d6a94f",
      whatsapp_number: "+5511999999999",
      instagram_url: "https://instagram.com/rifa",
      facebook_url: null,
      youtube_url: null,
      support_email: "suporte@example.com",
      footer_text: null,
      privacy_policy: "Politica com conteudo suficiente para publicacao.",
      terms_of_use: "Termos com conteudo suficiente para publicacao.",
      seo_title: "Rifa Pro | Campanhas confiaveis",
      seo_description:
        "Participe de campanhas premium com checkout simples e experiencia de compra confiavel.",
      hero_title: null,
      hero_subtitle: null,
    }),
    {
      assetsReady: 2,
      contactChannels: 3,
      seoReady: true,
      legalReady: true,
      brandingReady: true,
    },
  );
});

import type { Metadata } from "next";
import { getAdminPlatformSettings } from "@/app/actions/platform-settings";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";
import { Alert } from "@/components/ui/alert";
import { getAdminSettingsOverview } from "@/lib/admin/settings-overview";

export const metadata: Metadata = {
  title: "Configuracoes da Plataforma",
};

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const settings = await getAdminPlatformSettings();
  const overview = getAdminSettingsOverview(settings);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="White label"
        title="Configuracoes da plataforma"
        description="Controle marca, tema, canais, SEO e textos legais do seu tenant sem alterar codigo."
      />
      <Alert
        tone={overview.assetsReady < 2 || !overview.seoReady ? "warning" : "info"}
        title="Ajustes white label centralizados"
        description="Esta area controla identidade visual, canais, SEO e textos legais sem alterar a base funcional do sistema."
      />
      <SettingsTabs settings={settings} />
    </div>
  );
}

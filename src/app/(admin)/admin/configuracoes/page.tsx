import type { Metadata } from "next";
import { getAdminPlatformSettings } from "@/app/actions/platform-settings";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";

export const metadata: Metadata = {
  title: "Configuracoes da Plataforma",
};

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const settings = await getAdminPlatformSettings();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="White label"
        title="Configuracoes da plataforma"
        description="Controle marca, tema, canais, SEO e textos legais do seu tenant sem alterar codigo."
      />
      <SettingsTabs settings={settings} />
    </div>
  );
}

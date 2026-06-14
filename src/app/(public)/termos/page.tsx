import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getPublicPlatformSettings } from "@/lib/platform-settings/public";

export const metadata: Metadata = { title: "Termos de Uso" };
export const dynamic = "force-dynamic";

export default async function TermosPage() {
  const settings = await getPublicPlatformSettings();

  return (
    <LegalPage
      eyebrow={settings.platform_name}
      title="Termos de uso"
      content={settings.terms_of_use}
      emptyMessage="Os termos de uso ainda nao foram publicados pelo administrador."
    />
  );
}

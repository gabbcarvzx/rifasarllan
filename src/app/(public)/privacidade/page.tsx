import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getPublicPlatformSettings } from "@/lib/platform-settings/public";

export const metadata: Metadata = { title: "Politica de Privacidade" };

export default async function PrivacidadePage() {
  const settings = await getPublicPlatformSettings();

  return (
    <LegalPage
      eyebrow={settings.platform_name}
      title="Politica de privacidade"
      content={settings.privacy_policy}
      emptyMessage="A politica de privacidade ainda nao foi publicada pelo administrador."
    />
  );
}

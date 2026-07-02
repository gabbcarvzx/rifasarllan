"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  FileText,
  Globe2,
  Palette,
  Search,
  Share2,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminSettingsOverview } from "@/lib/admin/settings-overview";
import { cn } from "@/lib/utils";
import type { ResolvedPlatformSettings } from "@/types/platform-settings";

type SettingsTab = "general" | "branding" | "social" | "seo" | "legal";

function SettingsPanelSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-36" />
      <Skeleton className="h-11 w-52" />
    </div>
  );
}

const GeneralSettings = dynamic(
  () =>
    import("@/components/admin/settings/general-settings").then(
      (mod) => mod.GeneralSettings,
    ),
  { loading: () => <SettingsPanelSkeleton /> },
);
const BrandingSettings = dynamic(
  () =>
    import("@/components/admin/settings/branding-settings").then(
      (mod) => mod.BrandingSettings,
    ),
  { loading: () => <SettingsPanelSkeleton /> },
);
const SocialSettings = dynamic(
  () =>
    import("@/components/admin/settings/social-settings").then(
      (mod) => mod.SocialSettings,
    ),
  { loading: () => <SettingsPanelSkeleton /> },
);
const SeoSettings = dynamic(
  () =>
    import("@/components/admin/settings/seo-settings").then(
      (mod) => mod.SeoSettings,
    ),
  { loading: () => <SettingsPanelSkeleton /> },
);
const LegalSettings = dynamic(
  () =>
    import("@/components/admin/settings/legal-settings").then(
      (mod) => mod.LegalSettings,
    ),
  { loading: () => <SettingsPanelSkeleton /> },
);

const tabs = [
  { id: "general", label: "Geral", icon: Globe2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "social", label: "Redes Sociais", icon: Share2 },
  { id: "seo", label: "SEO", icon: Search },
  { id: "legal", label: "Textos Legais", icon: FileText },
] as const;

export function SettingsTabs({ settings }: { settings: ResolvedPlatformSettings }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const overview = getAdminSettingsOverview(settings);

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.key === "Home") {
      setActiveTab(tabs[0].id);
      return;
    }

    if (event.key === "End") {
      setActiveTab(tabs[tabs.length - 1].id);
      return;
    }

    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIndex].id);
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assets prontos"
          value={`${overview.assetsReady}/3`}
          hint="Logo, favicon e banner principal"
        />
        <StatCard
          label="Canais publicados"
          value={String(overview.contactChannels)}
          hint="E-mail, WhatsApp e redes sociais"
        />
        <StatCard
          label="SEO"
          value={overview.seoReady ? "Pronto" : "Pendente"}
          hint="Titulo e descricao para indexacao"
        />
        <StatCard
          label="Textos legais"
          value={overview.legalReady ? "Prontos" : "Pendentes"}
          hint="Privacidade e termos de uso"
        />
      </div>

      {!overview.brandingReady || overview.assetsReady < 2 ? (
        <Alert
          tone="warning"
          title="White label ainda incompleto"
          description="Finalize identidade visual e ativos principais para transmitir mais confianca na vitrine publica e nos fluxos de compra."
        />
      ) : (
        <Alert
          tone="success"
          title="Base white label consistente"
          description="A plataforma ja possui identidade, canais e configuracoes suficientes para uma operacao mais profissional."
        />
      )}

      <div
        className="flex gap-1 overflow-x-auto rounded-[var(--radius-sm)] border border-border/80 bg-surface-raised/60 p-1"
        role="tablist"
        aria-label="Configuracoes da plataforma"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          const tabPanelId = `settings-panel-${tab.id}`;
          const tabId = `settings-tab-${tab.id}`;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={tabId}
              aria-controls={tabPanelId}
              aria-selected={active}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm font-semibold text-muted transition",
                active && "bg-primary/14 text-primary shadow-premium",
              )}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, tabs.findIndex((item) => item.id === tab.id))}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card className="p-5 sm:p-6">
        <SectionHeading
          eyebrow="Painel de configuracao"
          title={tabs.find((tab) => tab.id === activeTab)?.label ?? "Configuracoes"}
          description="Atualize este bloco sem alterar codigo nem quebrar integracoes existentes."
          className="mb-6 border-b border-border/80 pb-5"
        />
        <div
          hidden={activeTab !== "general"}
          role="tabpanel"
          id="settings-panel-general"
          aria-labelledby="settings-tab-general"
        >
          <GeneralSettings settings={settings} />
        </div>
        <div
          hidden={activeTab !== "branding"}
          role="tabpanel"
          id="settings-panel-branding"
          aria-labelledby="settings-tab-branding"
        >
          <BrandingSettings settings={settings} />
        </div>
        <div
          hidden={activeTab !== "social"}
          role="tabpanel"
          id="settings-panel-social"
          aria-labelledby="settings-tab-social"
        >
          <SocialSettings settings={settings} />
        </div>
        <div
          hidden={activeTab !== "seo"}
          role="tabpanel"
          id="settings-panel-seo"
          aria-labelledby="settings-tab-seo"
        >
          <SeoSettings settings={settings} />
        </div>
        <div
          hidden={activeTab !== "legal"}
          role="tabpanel"
          id="settings-panel-legal"
          aria-labelledby="settings-tab-legal"
        >
          <LegalSettings settings={settings} />
        </div>
      </Card>
    </div>
  );
}

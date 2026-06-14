"use client";

import { useState } from "react";
import {
  FileText,
  Globe2,
  Palette,
  Search,
  Share2,
} from "lucide-react";
import { BrandingSettings } from "@/components/admin/settings/branding-settings";
import { GeneralSettings } from "@/components/admin/settings/general-settings";
import { LegalSettings } from "@/components/admin/settings/legal-settings";
import { SeoSettings } from "@/components/admin/settings/seo-settings";
import { SocialSettings } from "@/components/admin/settings/social-settings";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ResolvedPlatformSettings } from "@/types/platform-settings";

type SettingsTab = "general" | "branding" | "social" | "seo" | "legal";

const tabs = [
  { id: "general", label: "Geral", icon: Globe2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "social", label: "Redes Sociais", icon: Share2 },
  { id: "seo", label: "SEO", icon: Search },
  { id: "legal", label: "Textos Legais", icon: FileText },
] as const;

export function SettingsTabs({ settings }: { settings: ResolvedPlatformSettings }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div className="grid gap-5">
      <div
        className="flex gap-1 overflow-x-auto rounded-lg border border-white/10 bg-black/18 p-1"
        role="tablist"
        aria-label="Configuracoes da plataforma"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted transition",
                active && "bg-primary/14 text-primary shadow-premium",
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card className="p-5 sm:p-6">
        <div hidden={activeTab !== "general"} role="tabpanel">
          <GeneralSettings settings={settings} />
        </div>
        <div hidden={activeTab !== "branding"} role="tabpanel">
          <BrandingSettings settings={settings} />
        </div>
        <div hidden={activeTab !== "social"} role="tabpanel">
          <SocialSettings settings={settings} />
        </div>
        <div hidden={activeTab !== "seo"} role="tabpanel">
          <SeoSettings settings={settings} />
        </div>
        <div hidden={activeTab !== "legal"} role="tabpanel">
          <LegalSettings settings={settings} />
        </div>
      </Card>
    </div>
  );
}

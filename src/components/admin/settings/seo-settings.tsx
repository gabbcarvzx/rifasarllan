"use client";

import { useActionState } from "react";
import { Search, Save } from "lucide-react";
import { updateSeoSettings } from "@/app/actions/platform-settings";
import { SettingsActionMessage } from "@/components/admin/settings/settings-action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  PlatformSettingsActionState,
  ResolvedPlatformSettings,
} from "@/types/platform-settings";

const initialState: PlatformSettingsActionState = { status: "idle", message: "" };

export function SeoSettings({ settings }: { settings: ResolvedPlatformSettings }) {
  const [state, action, isPending] = useActionState(updateSeoSettings, initialState);

  return (
    <form action={action} className="grid gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">SEO da plataforma</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Titulo e descricao alimentam os metadados gerados no servidor para todas as paginas.
        </p>
      </div>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Titulo SEO
        <Input
          name="seoTitle"
          defaultValue={settings.seo_title ?? ""}
          minLength={5}
          maxLength={70}
          required
        />
        <span className="text-xs font-normal text-muted">Recomendado: ate 60 caracteres.</span>
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Descricao SEO
        <Textarea
          name="seoDescription"
          defaultValue={settings.seo_description ?? ""}
          minLength={20}
          maxLength={170}
          required
        />
        <span className="text-xs font-normal text-muted">Recomendado: entre 120 e 160 caracteres.</span>
      </label>

      <div className="rounded-lg border border-white/10 bg-black/18 p-4">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Search className="size-4" />
          Preview do resultado
        </div>
        <p className="mt-3 text-lg font-semibold text-info">
          {settings.seo_title}
        </p>
        <p className="mt-1 text-xs text-primary">seudominio.com</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {settings.seo_description}
        </p>
      </div>

      <SettingsActionMessage state={state} />
      <Button type="submit" isLoading={isPending} className="w-full sm:w-fit">
        <Save className="size-4" />
        {isPending ? "Salvando..." : "Salvar SEO"}
      </Button>
    </form>
  );
}

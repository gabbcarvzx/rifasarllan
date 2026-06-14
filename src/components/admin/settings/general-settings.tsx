"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateGeneralSettings } from "@/app/actions/platform-settings";
import { SettingsActionMessage } from "@/components/admin/settings/settings-action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  PlatformSettingsActionState,
  ResolvedPlatformSettings,
} from "@/types/platform-settings";

const initialState: PlatformSettingsActionState = {
  status: "idle",
  message: "",
};

export function GeneralSettings({
  settings,
}: {
  settings: ResolvedPlatformSettings;
}) {
  const [state, action, isPending] = useActionState(
    updateGeneralSettings,
    initialState,
  );

  return (
    <form action={action} className="grid gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Identidade geral</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Estes dados aparecem na navegacao, landing page, rodape e canais de suporte.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Nome da plataforma
          <Input
            name="platformName"
            defaultValue={settings.platform_name}
            minLength={2}
            maxLength={80}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          E-mail de suporte
          <Input
            name="supportEmail"
            type="email"
            defaultValue={settings.support_email ?? ""}
            placeholder="suporte@seudominio.com"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Slogan
        <Input
          name="platformSubtitle"
          defaultValue={settings.platform_subtitle ?? ""}
          minLength={5}
          maxLength={220}
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Texto do rodape
        <Textarea
          name="footerText"
          defaultValue={settings.footer_text ?? ""}
          maxLength={500}
          className="min-h-32"
        />
      </label>

      <SettingsActionMessage state={state} />
      <Button type="submit" isLoading={isPending} className="w-full sm:w-fit">
        <Save className="size-4" />
        {isPending ? "Salvando..." : "Salvar configuracoes gerais"}
      </Button>
    </form>
  );
}

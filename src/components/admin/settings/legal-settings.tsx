"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { updateLegalSettings } from "@/app/actions/platform-settings";
import { SettingsActionMessage } from "@/components/admin/settings/settings-action-message";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type {
  PlatformSettingsActionState,
  ResolvedPlatformSettings,
} from "@/types/platform-settings";

const initialState: PlatformSettingsActionState = { status: "idle", message: "" };

export function LegalSettings({ settings }: { settings: ResolvedPlatformSettings }) {
  const [state, action, isPending] = useActionState(updateLegalSettings, initialState);

  return (
    <form action={action} className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Textos legais</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            O conteudo e publicado como texto formatado por paragrafos nas paginas publicas.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/termos" target="_blank" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Termos <ExternalLink className="size-4" />
          </Link>
          <Link href="/privacidade" target="_blank" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Privacidade <ExternalLink className="size-4" />
          </Link>
        </div>
      </div>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Termos de uso
        <Textarea
          name="termsOfUse"
          defaultValue={settings.terms_of_use ?? ""}
          maxLength={50000}
          className="min-h-80 font-mono text-xs leading-6"
          placeholder="Informe as regras de uso, responsabilidades e condicoes da plataforma."
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Politica de privacidade
        <Textarea
          name="privacyPolicy"
          defaultValue={settings.privacy_policy ?? ""}
          maxLength={50000}
          className="min-h-80 font-mono text-xs leading-6"
          placeholder="Explique quais dados sao coletados, finalidades, retencao e direitos do titular."
        />
      </label>

      <SettingsActionMessage state={state} />
      <Button type="submit" isLoading={isPending} className="w-full sm:w-fit">
        <Save className="size-4" />
        {isPending ? "Salvando..." : "Salvar textos legais"}
      </Button>
    </form>
  );
}

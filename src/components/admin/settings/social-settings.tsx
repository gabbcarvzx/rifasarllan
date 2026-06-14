"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateSocialSettings } from "@/app/actions/platform-settings";
import { SettingsActionMessage } from "@/components/admin/settings/settings-action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  PlatformSettingsActionState,
  ResolvedPlatformSettings,
} from "@/types/platform-settings";

const initialState: PlatformSettingsActionState = {
  status: "idle",
  message: "",
};

export function SocialSettings({ settings }: { settings: ResolvedPlatformSettings }) {
  const [state, action, isPending] = useActionState(
    updateSocialSettings,
    initialState,
  );

  const fields = [
    ["whatsappNumber", "WhatsApp", settings.whatsapp_number ?? "", "+55 11 99999-9999", "tel"],
    ["instagramUrl", "Instagram", settings.instagram_url ?? "", "https://instagram.com/suamarca", "url"],
    ["facebookUrl", "Facebook", settings.facebook_url ?? "", "https://facebook.com/suamarca", "url"],
    ["youtubeUrl", "YouTube", settings.youtube_url ?? "", "https://youtube.com/@suamarca", "url"],
  ] as const;

  return (
    <form action={action} className="grid gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Redes sociais</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Os canais preenchidos aparecem automaticamente no rodape publico.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(([name, label, value, placeholder, type]) => (
          <label key={name} className="grid gap-2 text-sm font-medium text-foreground">
            {label}
            <Input
              name={name}
              type={type}
              defaultValue={value}
              placeholder={placeholder}
            />
          </label>
        ))}
      </div>

      <SettingsActionMessage state={state} />
      <Button type="submit" isLoading={isPending} className="w-full sm:w-fit">
        <Save className="size-4" />
        {isPending ? "Salvando..." : "Salvar redes sociais"}
      </Button>
    </form>
  );
}

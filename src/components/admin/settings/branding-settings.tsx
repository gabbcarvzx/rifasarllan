"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { ImageIcon, Save, Trash2 } from "lucide-react";
import {
  removePlatformAsset,
  updateBrandingSettings,
} from "@/app/actions/platform-settings";
import { ColorPickerField } from "@/components/admin/settings/color-picker-field";
import { SettingsActionMessage } from "@/components/admin/settings/settings-action-message";
import { MediaPreview } from "@/components/media/media-preview";
import { UploadDropzone } from "@/components/media/upload-dropzone";
import { Button } from "@/components/ui/button";
import type {
  PlatformAssetField,
  PlatformSettingsActionState,
  ResolvedPlatformSettings,
} from "@/types/platform-settings";

const initialState: PlatformSettingsActionState = {
  status: "idle",
  message: "",
};

type AssetFieldProps = {
  name: string;
  label: string;
  description: string;
  currentUrl: string | null;
  field: PlatformAssetField;
  onFilesSelected: (files: File[]) => void;
  previewUrl: string | null;
  isRemoving: boolean;
  removeAction: (payload: FormData) => void;
};

function AssetField({
  name,
  label,
  description,
  currentUrl,
  field,
  onFilesSelected,
  previewUrl,
  isRemoving,
  removeAction,
}: AssetFieldProps) {
  return (
    <div className="grid gap-4 border-t border-white/10 pt-5 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <UploadDropzone
          name={name}
          label={label}
          description={description}
          onFilesSelected={onFilesSelected}
        />
        {currentUrl ? (
          <Button
            type="submit"
            variant="danger"
            size="sm"
            name="assetField"
            value={field}
            formAction={removeAction}
            disabled={isRemoving}
            className="mt-3"
          >
            <Trash2 className="size-4" />
            {isRemoving ? "Removendo..." : "Remover asset atual"}
          </Button>
        ) : null}
      </div>
      <MediaPreview
        src={previewUrl ?? currentUrl}
        alt={`Preview de ${label.toLowerCase()}`}
        className="h-fit"
      />
    </div>
  );
}

function usePreview(files: File[]) {
  const preview = useMemo(
    () => (files[0] ? URL.createObjectURL(files[0]) : null),
    [files],
  );

  useEffect(
    () => () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    },
    [preview],
  );

  return preview;
}

export function BrandingSettings({
  settings,
}: {
  settings: ResolvedPlatformSettings;
}) {
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [faviconFiles, setFaviconFiles] = useState<File[]>([]);
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [state, action, isPending] = useActionState(
    updateBrandingSettings,
    initialState,
  );
  const [removeState, removeAction, isRemoving] = useActionState(
    removePlatformAsset,
    initialState,
  );
  const logoPreview = usePreview(logoFiles);
  const faviconPreview = usePreview(faviconFiles);
  const bannerPreview = usePreview(bannerFiles);
  const latestState =
    (removeState.updatedAt ?? 0) > (state.updatedAt ?? 0) ? removeState : state;

  return (
    <form action={action} className="grid gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Branding e tema</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Assets sao validados no servidor e armazenados no bucket platform-assets do tenant.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ColorPickerField
          name="primaryColor"
          label="Cor principal"
          description="Aplicada em botoes, estados positivos e chamadas principais."
          defaultValue={settings.primary_color ?? "#22c55e"}
        />
        <ColorPickerField
          name="secondaryColor"
          label="Cor secundaria"
          description="Aplicada em badges, detalhes de marca e destaques editoriais."
          defaultValue={settings.secondary_color ?? "#d6a94f"}
        />
      </div>

      <div className="grid gap-6">
        <AssetField
          name="logo"
          label="Logo da plataforma"
          description="PNG, JPG ou WEBP de ate 5 MB. Prefira fundo transparente."
          currentUrl={settings.logo_url}
          field="logo_url"
          onFilesSelected={setLogoFiles}
          previewUrl={logoPreview}
          isRemoving={isRemoving}
          removeAction={removeAction}
        />
        <AssetField
          name="favicon"
          label="Favicon"
          description="PNG, JPG ou WEBP quadrado de ate 2 MB."
          currentUrl={settings.favicon_url}
          field="favicon_url"
          onFilesSelected={setFaviconFiles}
          previewUrl={faviconPreview}
          isRemoving={isRemoving}
          removeAction={removeAction}
        />
        <AssetField
          name="heroBanner"
          label="Banner principal"
          description="Imagem horizontal de ate 10 MB para o primeiro viewport da landing page."
          currentUrl={settings.hero_banner_url}
          field="hero_banner_url"
          onFilesSelected={setBannerFiles}
          previewUrl={bannerPreview}
          isRemoving={isRemoving}
          removeAction={removeAction}
        />
      </div>

      <SettingsActionMessage state={latestState} />
      <Button type="submit" isLoading={isPending} className="w-full sm:w-fit">
        {isPending ? <ImageIcon className="size-4" /> : <Save className="size-4" />}
        {isPending ? "Enviando e salvando..." : "Salvar branding"}
      </Button>
    </form>
  );
}

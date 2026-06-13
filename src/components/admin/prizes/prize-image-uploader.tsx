"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { MediaPreview } from "@/components/media/media-preview";
import { UploadDropzone } from "@/components/media/upload-dropzone";
import { Button } from "@/components/ui/button";
import type { RafflePrize } from "@/types/database";

type PrizeImageUploaderProps = {
  prize: RafflePrize;
  uploadAction: (formData: FormData) => void;
  removeAction: (formData: FormData) => void;
  isUploading: boolean;
  isRemoving: boolean;
};

function useLocalPreviews(files: File[]) {
  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [previews],
  );

  return previews;
}

export function PrizeImageUploader({
  prize,
  uploadAction,
  removeAction,
  isUploading,
  isRemoving,
}: PrizeImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const previews = useLocalPreviews(files);
  const selectedPreview = previews[0];

  return (
    <div className="grid gap-3">
      {selectedPreview ? (
        <MediaPreview
          src={selectedPreview.url}
          alt={`Nova imagem de ${prize.title}`}
          fileName={selectedPreview.file.name}
          mimeType={selectedPreview.file.type}
          fileSize={selectedPreview.file.size}
        />
      ) : prize.image_url ? (
        <MediaPreview
          src={prize.image_url}
          alt={prize.title}
          fileName="Imagem atual do premio"
          mimeType="image/*"
        />
      ) : (
        <ImagePlaceholder
          title="Premio sem imagem"
          description="Adicione uma imagem para melhorar a conversao da pagina publica."
        />
      )}

      <form action={uploadAction} className="grid gap-3">
        <input type="hidden" name="prizeId" value={prize.id} />
        <UploadDropzone
          name="prizeImage"
          label="Alterar imagem"
          description="Upload isolado em prize-images com auditoria em media_files."
          onFilesSelected={setFiles}
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={isUploading}
          className="w-full"
        >
          <ImagePlus className="size-4" />
          {isUploading ? "Enviando..." : "Salvar imagem"}
        </Button>
      </form>

      {prize.image_url ? (
        <form action={removeAction}>
          <input type="hidden" name="prizeId" value={prize.id} />
          <Button
            type="submit"
            variant="danger"
            disabled={isRemoving}
            className="w-full"
          >
            <Trash2 className="size-4" />
            {isRemoving ? "Removendo..." : "Remover imagem"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

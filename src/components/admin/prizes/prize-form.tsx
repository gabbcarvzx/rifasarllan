"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { FileBadge } from "@/components/media/file-badge";
import { MediaPreview } from "@/components/media/media-preview";
import { UploadDropzone } from "@/components/media/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RafflePrize } from "@/types/database";

type PrizeFormProps = {
  mode: "create" | "edit";
  raffleId: string;
  prize?: RafflePrize;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  includeImage?: boolean;
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

export function PrizeForm({
  mode,
  raffleId,
  prize,
  formAction,
  isPending,
  includeImage = false,
}: PrizeFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const previews = useLocalPreviews(files);
  const selectedPreview = previews[0];

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="raffleId" value={raffleId} />
      {prize ? <input type="hidden" name="prizeId" value={prize.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-[1fr_120px_120px]">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Titulo
          <Input
            name="title"
            defaultValue={prize?.title ?? ""}
            placeholder="Ex: 1o Premio - iPhone 15 Pro"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Quantidade
          <Input
            name="quantity"
            type="number"
            min="1"
            defaultValue={prize?.quantity ?? 1}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Posicao
          <Input
            name="position"
            type="number"
            min="1"
            defaultValue={prize?.position ?? ""}
            placeholder="Auto"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Descricao
        <Textarea
          name="description"
          className="min-h-28"
          defaultValue={prize?.description ?? ""}
          placeholder="Detalhes comerciais, versao, estado, cor, garantia ou observacoes de entrega."
        />
      </label>

      {includeImage ? (
        <div className="grid gap-3">
          <UploadDropzone
            name="prizeImage"
            label="Imagem do premio"
            description="JPG, JPEG, PNG ou WEBP ate 10 MB. O servidor valida MIME e assinatura real."
            onFilesSelected={setFiles}
          />
          {selectedPreview ? (
            <MediaPreview
              src={selectedPreview.url}
              alt="Preview do novo premio"
              fileName={selectedPreview.file.name}
              mimeType={selectedPreview.file.type}
              fileSize={selectedPreview.file.size}
            />
          ) : files.length > 0 ? (
            <FileBadge
              fileName={files[0].name}
              mimeType={files[0].type}
              fileSize={files[0].size}
            />
          ) : null}
        </div>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
        <Save className="size-4" />
        {isPending
          ? "Salvando..."
          : mode === "create"
            ? "Adicionar premio"
            : "Salvar premio"}
      </Button>
    </form>
  );
}

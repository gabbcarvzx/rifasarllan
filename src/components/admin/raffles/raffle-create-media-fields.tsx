"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Images } from "lucide-react";
import { FileBadge } from "@/components/media/file-badge";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { MediaPreview } from "@/components/media/media-preview";
import { UploadDropzone } from "@/components/media/upload-dropzone";
import { UploadProgress } from "@/components/media/upload-progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

export function RaffleCreateMediaFields() {
  const [mainImageFiles, setMainImageFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const mainPreview = useLocalPreviews(mainImageFiles);
  const galleryPreviews = useLocalPreviews(galleryFiles);

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
          <ImagePlus className="size-4" />
        </div>
        <CardTitle>Midia da rifa</CardTitle>
        <CardDescription>
          Envie a imagem principal e ate 10 imagens de galeria no mesmo salvamento.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Imagem principal</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Esta imagem aparece nos cards, home e topo da pagina publica.
            </p>
          </div>
          <UploadDropzone
            name="mainImage"
            label="Adicionar imagem principal"
            description="Arraste uma imagem ou escolha no computador. Limite de 10 MB."
            onFilesSelected={setMainImageFiles}
          />
          {mainPreview[0] ? (
            <MediaPreview
              src={mainPreview[0].url}
              alt="Preview da imagem principal"
              fileName={mainPreview[0].file.name}
              mimeType={mainPreview[0].file.type}
              fileSize={mainPreview[0].file.size}
            />
          ) : (
            <ImagePlaceholder
              title="Sem imagem principal selecionada"
              description="Se nada for enviado, a rifa usara placeholder elegante."
            />
          )}
        </div>

        <div className="grid gap-4 border-t border-white/10 pt-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/12 text-accent">
              <Images className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Galeria
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted">
                As imagens serao ordenadas na sequencia selecionada.
              </span>
            </span>
          </div>
          <UploadDropzone
            name="galleryImages"
            label="Adicionar imagens da galeria"
            description="Selecione ate 10 imagens JPG, PNG ou WEBP."
            multiple
            onFilesSelected={(files) => setGalleryFiles(files.slice(0, 10))}
          />
          {galleryFiles.length > 0 ? (
            <div className="grid gap-3">
              <UploadProgress value={0} label="Aguardando salvamento da rifa" />
              <div className="grid gap-3 sm:grid-cols-2">
                {galleryPreviews.map((preview) => (
                  <FileBadge
                    key={preview.url}
                    fileName={preview.file.name}
                    mimeType={preview.file.type}
                    fileSize={preview.file.size}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

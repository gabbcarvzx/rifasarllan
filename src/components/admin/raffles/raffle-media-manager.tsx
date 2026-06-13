"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import {
  removeGalleryImage,
  removeMainRaffleImage,
  reorderGalleryImages,
  uploadGalleryImages,
  uploadMainRaffleImage,
  type RaffleMediaActionState,
} from "@/app/actions/raffle-media";
import { FileBadge } from "@/components/media/file-badge";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { MediaPreview } from "@/components/media/media-preview";
import { UploadDropzone } from "@/components/media/upload-dropzone";
import { UploadProgress } from "@/components/media/upload-progress";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Raffle, RaffleImage } from "@/types/database";

const initialState: RaffleMediaActionState = {
  status: "idle",
  message: "",
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

function ActionMessage({ state }: { state: RaffleMediaActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm leading-6",
        state.status === "success"
          ? "border-primary/35 bg-primary/12 text-emerald-100"
          : "border-danger/35 bg-danger/12 text-rose-100",
      )}
    >
      {state.message}
    </div>
  );
}

function orderAfterMove(images: RaffleImage[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= images.length) {
    return images.map((image) => image.id).join(",");
  }

  const nextImages = [...images];
  const [movedImage] = nextImages.splice(index, 1);
  nextImages.splice(targetIndex, 0, movedImage);

  return nextImages.map((image) => image.id).join(",");
}

type SubmitButtonProps = {
  isPending: boolean;
  children: ReactNode;
  variant?: ComponentProps<typeof Button>["variant"];
  className?: string;
};

function SubmitButton({
  isPending,
  children,
  variant,
  className,
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isPending} variant={variant} className={className}>
      {isPending ? "Processando..." : children}
    </Button>
  );
}

export function RaffleMediaManager({
  raffle,
  galleryImages,
}: {
  raffle: Raffle;
  galleryImages: RaffleImage[];
}) {
  const router = useRouter();
  const [mainFiles, setMainFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const mainPreview = useLocalPreviews(mainFiles);
  const galleryPreviews = useLocalPreviews(galleryFiles);
  const [mainUploadState, mainUploadAction, isMainUploading] = useActionState(
    uploadMainRaffleImage,
    initialState,
  );
  const [mainRemoveState, mainRemoveAction, isMainRemoving] = useActionState(
    removeMainRaffleImage,
    initialState,
  );
  const [galleryUploadState, galleryUploadAction, isGalleryUploading] =
    useActionState(uploadGalleryImages, initialState);
  const [galleryRemoveState, galleryRemoveAction, isGalleryRemoving] =
    useActionState(removeGalleryImage, initialState);
  const [galleryOrderState, galleryOrderAction, isGalleryOrdering] =
    useActionState(reorderGalleryImages, initialState);

  useEffect(() => {
    const states = [
      mainUploadState,
      mainRemoveState,
      galleryUploadState,
      galleryRemoveState,
      galleryOrderState,
    ];

    if (states.some((state) => state.status === "success")) {
      router.refresh();
    }
  }, [
    galleryOrderState,
    galleryRemoveState,
    galleryUploadState,
    mainRemoveState,
    mainUploadState,
    router,
  ]);

  const combinedMessage =
    [
      mainUploadState,
      mainRemoveState,
      galleryUploadState,
      galleryRemoveState,
      galleryOrderState,
    ]
      .filter((state) => state.status !== "idle")
      .sort((first, second) => (second.updatedAt ?? 0) - (first.updatedAt ?? 0))[0] ??
    initialState;

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
          <ImagePlus className="size-4" />
        </div>
        <CardTitle>Midia da rifa</CardTitle>
        <CardDescription>
          Gerencie imagem principal e galeria com Storage, metadata e isolamento
          por tenant.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <ActionMessage state={combinedMessage} />

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Imagem principal</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Usada no card publico, home e topo da rifa.
              </p>
            </div>

            {mainPreview[0] ? (
              <MediaPreview
                src={mainPreview[0].url}
                alt="Nova imagem principal"
                fileName={mainPreview[0].file.name}
                mimeType={mainPreview[0].file.type}
                fileSize={mainPreview[0].file.size}
              />
            ) : raffle.main_image_url ? (
              <MediaPreview
                src={raffle.main_image_url}
                alt={raffle.title}
                fileName="Imagem principal atual"
                mimeType="image/*"
              />
            ) : (
              <ImagePlaceholder
                title="Sem imagem principal"
                description="Adicione uma imagem para valorizar a vitrine publica."
              />
            )}
          </div>

          <div className="grid content-start gap-3">
            <form action={mainUploadAction} className="grid gap-3">
              <input type="hidden" name="raffleId" value={raffle.id} />
              <UploadDropzone
                name="mainImage"
                label="Substituir imagem principal"
                description="Arraste uma imagem ou selecione arquivo. JPG, PNG ou WEBP ate 10 MB."
                onFilesSelected={setMainFiles}
              />
              {isMainUploading ? (
                <UploadProgress value={64} label="Enviando imagem principal" />
              ) : null}
              <SubmitButton isPending={isMainUploading} className="w-full">
                Salvar imagem principal
              </SubmitButton>
            </form>

            {raffle.main_image_url ? (
              <form action={mainRemoveAction}>
                <input type="hidden" name="raffleId" value={raffle.id} />
                <SubmitButton
                  isPending={isMainRemoving}
                  variant="danger"
                  className="w-full"
                >
                  <Trash2 className="size-4" />
                  Remover imagem principal
                </SubmitButton>
              </form>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Galeria</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Ate 10 imagens. Use os controles para definir a ordem publica.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted">
              {galleryImages.length}/10 imagens
            </span>
          </div>

          <form action={galleryUploadAction} className="grid gap-3">
            <input type="hidden" name="raffleId" value={raffle.id} />
            <UploadDropzone
              name="galleryImages"
              label="Adicionar imagens a galeria"
              description="Upload multiplo com preview instantaneo e validacao server-side."
              multiple
              disabled={galleryImages.length >= 10}
              onFilesSelected={(files) =>
                setGalleryFiles(files.slice(0, Math.max(10 - galleryImages.length, 0)))
              }
            />
            {galleryPreviews.length > 0 ? (
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
            ) : null}
            {isGalleryUploading ? (
              <UploadProgress value={72} label="Enviando imagens da galeria" />
            ) : null}
            <SubmitButton
              isPending={isGalleryUploading}
              className="w-full sm:w-fit"
              variant="secondary"
            >
              Enviar para galeria
            </SubmitButton>
          </form>

          {galleryImages.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-lg border border-white/10 bg-black/18"
                >
                  <MediaPreview
                    src={image.image_url}
                    alt={image.alt_text || raffle.title}
                    fileName={`Imagem ${index + 1}`}
                    className="rounded-none border-0 shadow-none"
                  />
                  <div className="grid gap-2 border-t border-white/10 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <form action={galleryOrderAction}>
                        <input type="hidden" name="raffleId" value={raffle.id} />
                        <input
                          type="hidden"
                          name="orderedIds"
                          value={orderAfterMove(galleryImages, index, -1)}
                        />
                        <button
                          type="submit"
                          disabled={index === 0 || isGalleryOrdering}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon",
                          })}
                          aria-label="Mover imagem para cima"
                          title="Mover para cima"
                        >
                          <ArrowUp className="size-4" />
                        </button>
                      </form>

                      <form action={galleryOrderAction}>
                        <input type="hidden" name="raffleId" value={raffle.id} />
                        <input
                          type="hidden"
                          name="orderedIds"
                          value={orderAfterMove(galleryImages, index, 1)}
                        />
                        <button
                          type="submit"
                          disabled={
                            index === galleryImages.length - 1 || isGalleryOrdering
                          }
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon",
                          })}
                          aria-label="Mover imagem para baixo"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="size-4" />
                        </button>
                      </form>

                      <form action={galleryRemoveAction} className="ml-auto">
                        <input type="hidden" name="imageId" value={image.id} />
                        <button
                          type="submit"
                          disabled={isGalleryRemoving}
                          className={buttonVariants({
                            variant: "danger",
                            size: "icon",
                          })}
                          aria-label="Remover imagem da galeria"
                          title="Remover"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ImagePlaceholder
              title="Galeria vazia"
              description="Adicione imagens complementares para enriquecer a pagina publica."
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

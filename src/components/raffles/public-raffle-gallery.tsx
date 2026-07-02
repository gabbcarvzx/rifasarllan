"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { Camera, Maximize2, Sparkles } from "lucide-react";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RaffleImage } from "@/types/database";

type PublicRaffleGalleryProps = {
  title: string;
  mainImageUrl?: string | null;
  galleryImages: RaffleImage[];
  featured?: boolean;
  statusBadge?: ReactNode;
};

export function PublicRaffleGallery({
  title,
  mainImageUrl,
  galleryImages,
  featured = false,
  statusBadge,
}: PublicRaffleGalleryProps) {
  const thumbnails = [
    ...(mainImageUrl
      ? [
          {
            id: "main",
            image_url: mainImageUrl,
            alt_text: title,
          },
        ]
      : []),
    ...galleryImages,
  ];
  const [selectedUrl, setSelectedUrl] = useState(thumbnails[0]?.image_url ?? null);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-black/20 shadow-gold">
        {selectedUrl ? (
          <Image
            src={selectedUrl}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        ) : (
          <ImagePlaceholder
            title="Imagem da rifa em breve"
            description="Esta campanha ainda nao possui imagem principal."
            className="h-full rounded-none border-0"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {statusBadge}
          {featured ? <Badge variant="default">Destaque</Badge> : null}
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
          <Maximize2 className="size-3.5" />
          Visual premium do premio
        </div>
      </div>

      {thumbnails.length > 1 ? (
        <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4">
            {thumbnails.map((image, index) => {
              const isSelected = selectedUrl === image.image_url;

              return (
                <button
                  key={`${image.id}-${image.image_url}`}
                  type="button"
                  onClick={() => setSelectedUrl(image.image_url)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-[var(--radius-sm)] border bg-black/18 transition",
                    isSelected
                      ? "border-primary/70 ring-2 ring-primary/25"
                      : "border-white/10 hover:border-accent/50",
                  )}
                  aria-label={`Visualizar imagem ${index + 1}`}
                >
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              );
            })}
          </div>
          <Card className="hidden p-4 lg:block">
            <Camera className="size-5 text-accent" />
            <p className="mt-4 text-sm font-semibold text-foreground">
              Veja o premio por varios angulos
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use as miniaturas para conferir detalhes visuais antes de escolher seus numeros.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              <Sparkles className="size-4" />
              {thumbnails.length} imagem{thumbnails.length === 1 ? "" : "ens"}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

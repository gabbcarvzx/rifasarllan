"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { Badge } from "@/components/ui/badge";
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
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-gold">
        {selectedUrl ? (
          <Image
            src={selectedUrl}
            alt={title}
            fill
            priority
            unoptimized
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
      </div>

      {thumbnails.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {thumbnails.map((image, index) => {
            const isSelected = selectedUrl === image.image_url;

            return (
              <button
                key={`${image.id}-${image.image_url}`}
                type="button"
                onClick={() => setSelectedUrl(image.image_url)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border bg-black/18 transition",
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
                  unoptimized
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

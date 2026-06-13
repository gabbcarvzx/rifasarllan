import Image from "next/image";
import { FileBadge } from "@/components/media/file-badge";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { cn } from "@/lib/utils";

type MediaPreviewProps = {
  src?: string | null;
  alt: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  className?: string;
};

export function MediaPreview({
  src,
  alt,
  fileName,
  mimeType,
  fileSize,
  className,
}: MediaPreviewProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-white/10 bg-surface-raised/82 shadow-premium",
        className,
      )}
    >
      {src ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-black/20">
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            className="object-cover"
            sizes="(min-width: 768px) 420px, 100vw"
          />
        </div>
      ) : (
        <ImagePlaceholder className="rounded-none border-0" />
      )}

      {fileName ? (
        <div className="border-t border-white/10 p-3">
          <FileBadge fileName={fileName} mimeType={mimeType} fileSize={fileSize} />
        </div>
      ) : null}
    </div>
  );
}

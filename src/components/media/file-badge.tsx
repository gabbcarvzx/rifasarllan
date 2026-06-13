import { FileImage, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FileBadgeProps = {
  fileName: string;
  mimeType?: string | null;
  fileSize?: number | null;
  className?: string;
};

function formatFileSize(size?: number | null) {
  if (!size) {
    return null;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function FileBadge({
  fileName,
  mimeType,
  fileSize,
  className,
}: FileBadgeProps) {
  const Icon = mimeType?.startsWith("image/") ? FileImage : FileText;
  const formattedSize = formatFileSize(fileSize);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-white/10 bg-black/18 p-3",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {fileName}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
          {mimeType ? <Badge variant="muted">{mimeType}</Badge> : null}
          {formattedSize ? <span>{formattedSize}</span> : null}
        </span>
      </span>
    </div>
  );
}

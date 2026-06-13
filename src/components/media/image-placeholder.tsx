import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function ImagePlaceholder({
  title = "Imagem ainda nao enviada",
  description = "O asset sera conectado ao Supabase Storage nas proximas etapas.",
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-6 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent">
        <ImageIcon className="size-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-xs leading-5 text-muted">{description}</p>
    </div>
  );
}

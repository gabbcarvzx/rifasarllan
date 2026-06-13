import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadProgressProps = {
  value: number;
  label?: string;
  className?: string;
};

export function UploadProgress({
  value,
  label = "Enviando arquivo",
  className,
}: UploadProgressProps) {
  const safeValue = Math.min(Math.max(value, 0), 100);
  const isComplete = safeValue >= 100;

  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-black/18 p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-4 text-sm">
        <span className="flex items-center gap-2 font-semibold text-foreground">
          {isComplete ? (
            <CheckCircle2 className="size-4 text-primary" />
          ) : (
            <Loader2 className="size-4 animate-spin text-accent" />
          )}
          {label}
        </span>
        <span className="font-mono text-xs text-muted">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-info to-accent transition-all"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

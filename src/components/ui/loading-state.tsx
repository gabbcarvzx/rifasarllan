import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({
  label = "Carregando",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] text-muted",
        className,
      )}
    >
      <Loader2 className="size-5 animate-spin text-primary" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

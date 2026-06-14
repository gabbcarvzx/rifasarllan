import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlatformSettingsActionState } from "@/types/platform-settings";

export function SettingsActionMessage({
  state,
}: {
  state: PlatformSettingsActionState;
}) {
  if (state.status === "idle") {
    return null;
  }

  const success = state.status === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-sm leading-6",
        success
          ? "border-primary/30 bg-primary/10 text-emerald-100"
          : "border-danger/30 bg-danger/10 text-rose-100",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{state.message}</span>
    </div>
  );
}

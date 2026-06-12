import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMessageProps = {
  error?: string;
  success?: string;
};

export function AuthMessage({ error, success }: AuthMessageProps) {
  const message = error || success;

  if (!message) {
    return null;
  }

  const isError = Boolean(error);
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-sm leading-6",
        isError
          ? "border-danger/35 bg-danger/12 text-rose-100"
          : "border-primary/35 bg-primary/12 text-emerald-100",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

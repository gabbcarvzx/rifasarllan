import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "danger";

const toneStyles: Record<AlertTone, string> = {
  info: "border-info/35 bg-info/14 text-info-foreground",
  success: "border-success/35 bg-success/14 text-success-foreground",
  warning: "border-warning/35 bg-warning/16 text-warning-foreground",
  danger: "border-danger/35 bg-danger/14 text-danger-foreground",
};

const toneIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
} satisfies Record<AlertTone, typeof Info>;

type AlertProps = {
  title: string;
  description?: string;
  tone?: AlertTone;
  className?: string;
  action?: ReactNode;
};

export function Alert({
  title,
  description,
  tone = "info",
  className,
  action,
}: AlertProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-[var(--radius-md)] border p-4",
        toneStyles[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {description ? <p className="mt-1 text-sm leading-6">{description}</p> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}

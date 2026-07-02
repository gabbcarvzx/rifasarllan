import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "border-accent/35 bg-accent/16 text-accent-foreground",
  success: "border-success/35 bg-success/16 text-success-foreground",
  warning: "border-warning/35 bg-warning/18 text-warning-foreground",
  info: "border-info/35 bg-info/18 text-info-foreground",
  danger: "border-danger/35 bg-danger/16 text-danger-foreground",
  muted: "border-border/85 bg-card/75 text-muted",
};

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

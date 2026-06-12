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
  default: "border-accent/30 bg-accent/15 text-amber-100",
  success: "border-primary/30 bg-primary/15 text-emerald-100",
  warning: "border-accent/35 bg-accent/15 text-amber-100",
  info: "border-info/35 bg-info/15 text-sky-100",
  danger: "border-danger/35 bg-danger/15 text-rose-100",
  muted: "border-white/10 bg-white/[0.06] text-muted",
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

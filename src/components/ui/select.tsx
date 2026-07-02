import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-[var(--radius-sm)] border border-border/85 bg-input px-3 text-sm text-input-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = "Select";

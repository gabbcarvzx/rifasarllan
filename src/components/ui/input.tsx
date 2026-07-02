import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-[var(--radius-sm)] border border-border/85 bg-input px-3 text-sm text-input-foreground outline-none transition placeholder:text-muted/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

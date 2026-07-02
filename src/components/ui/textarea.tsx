import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-y rounded-[var(--radius-sm)] border border-border/85 bg-input px-3 py-3 text-sm text-input-foreground outline-none transition placeholder:text-muted/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

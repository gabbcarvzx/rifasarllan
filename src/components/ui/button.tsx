import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonVariantOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-primary/45 bg-primary text-primary-foreground shadow-premium hover:border-primary/60 hover:bg-primary/90",
  secondary:
    "border-border/80 bg-secondary/14 text-foreground hover:border-secondary/45 hover:bg-secondary/20",
  outline:
    "border-border bg-transparent text-foreground hover:border-primary/45 hover:bg-primary/10",
  ghost:
    "border-transparent bg-transparent text-muted hover:bg-card/80 hover:text-foreground",
  danger: "border-danger/40 bg-danger/16 text-danger-foreground hover:bg-danger/22",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-[var(--radius-sm)] px-3 text-sm",
  md: "h-11 rounded-[var(--radius-sm)] px-4 text-sm",
  lg: "h-12 rounded-[var(--radius-md)] px-5 text-base",
  icon: "size-10 rounded-[var(--radius-sm)] p-0",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: ButtonVariantOptions = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 border font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 disabled:pointer-events-none disabled:opacity-55",
    variants[variant],
    sizes[size],
    className,
  );
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantOptions & {
    isLoading?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      disabled,
      isLoading = false,
      size,
      variant,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={buttonVariants({ className, size, variant })}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  ),
);

Button.displayName = "Button";

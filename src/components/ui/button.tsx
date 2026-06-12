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
    "border-primary/40 bg-primary text-primary-foreground shadow-premium hover:bg-primary/90",
  secondary:
    "border-white/10 bg-white/[0.07] text-foreground hover:border-accent/40 hover:bg-white/[0.11]",
  outline:
    "border-border bg-transparent text-foreground hover:border-primary/50 hover:bg-primary/10",
  ghost:
    "border-transparent bg-transparent text-muted hover:bg-white/[0.07] hover:text-foreground",
  danger:
    "border-danger/40 bg-danger/15 text-rose-100 hover:bg-danger/25",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-lg px-3 text-sm",
  md: "h-11 rounded-lg px-4 text-sm",
  lg: "h-12 rounded-lg px-5 text-base",
  icon: "size-10 rounded-lg p-0",
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

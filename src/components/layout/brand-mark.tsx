import Image from "next/image";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  href: string;
  name: string;
  logoUrl: string | null;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
};

export function BrandMark({
  href,
  name,
  logoUrl,
  subtitle,
  onClick,
  className,
  compact = false,
}: BrandMarkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("flex items-center gap-3", className)}
    >
      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-accent/35 bg-accent/16 text-accent-foreground shadow-gold">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`Logo ${name}`}
            fill
            className="object-contain p-1"
            sizes="40px"
          />
        ) : (
          <Ticket className="size-5" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-foreground">{name}</span>
        {!compact && subtitle ? (
          <span className="block truncate text-xs text-muted">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}

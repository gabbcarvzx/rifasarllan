"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileBottomNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent?: boolean;
};

type MobileBottomNavProps = {
  items: MobileBottomNavItem[];
  className?: string;
};

export function MobileBottomNav({
  items,
  className,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacao rapida"
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-1 rounded-[var(--radius-lg)] border border-border/80 bg-sidebar/95 p-1.5 shadow-premium backdrop-blur lg:hidden",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            className={cn(
              "flex min-h-15 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] px-2 py-2 text-[11px] font-semibold transition",
              active
                ? item.accent
                  ? "bg-accent/18 text-accent-foreground"
                  : "bg-primary/18 text-primary-foreground"
                : "text-muted hover:bg-card/80 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

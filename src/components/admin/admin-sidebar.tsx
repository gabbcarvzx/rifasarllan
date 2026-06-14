"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "@/app/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNavigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rifas", label: "Rifas", icon: Ticket },
  { href: "/admin/configuracoes", label: "Configuracoes", icon: Settings },
];

function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {adminNavigation.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-white/[0.07] hover:text-foreground",
              active && "border border-primary/20 bg-primary/12 text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({
  platformName,
  logoUrl,
}: {
  platformName: string;
  logoUrl: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-white/10 bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-lg border border-accent/30 bg-accent/15 text-accent">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`Logo ${platformName}`}
                  fill
                  className="object-contain p-1"
                  sizes="36px"
                />
              ) : (
                <Ticket className="size-4" />
              )}
            </span>
            <span className="max-w-48 truncate text-sm font-bold text-foreground">
              {platformName}
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]"
            aria-label="Abrir menu administrativo"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open ? (
          <div className="mt-4 space-y-3">
            <AdminNavLinks onNavigate={() => setOpen(false)} />
            <form action={signOut}>
              <button
                type="submit"
                className={buttonVariants({
                  variant: "secondary",
                  className: "w-full",
                })}
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-surface/92 p-5 backdrop-blur-xl lg:block">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="relative flex size-11 items-center justify-center overflow-hidden rounded-lg border border-accent/30 bg-accent/15 text-accent">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`Logo ${platformName}`}
                fill
                className="object-contain p-1"
                sizes="44px"
              />
            ) : (
              <Ticket className="size-5" />
            )}
          </span>
          <span>
            <span className="block max-w-44 truncate text-xs font-semibold text-accent">
              {platformName}
            </span>
            <span className="text-base font-bold text-foreground">
              Painel SaaS
            </span>
          </span>
        </Link>

        <div className="mt-8">
          <AdminNavLinks />
        </div>

        <div className="absolute inset-x-5 bottom-5 space-y-3">
          <form action={signOut}>
            <button
              type="submit"
              className={buttonVariants({
                variant: "secondary",
                className: "w-full",
              })}
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </form>
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
            <ShieldCheck className="size-5 text-primary" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Admin protegido
            </p>
            <p className="mt-2 text-xs leading-5 text-muted">
              O layout valida role admin no servidor antes de renderizar o
              painel.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

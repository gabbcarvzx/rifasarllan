"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartColumnBig,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelTop,
  Settings,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "@/app/actions/auth";
import { BrandMark } from "@/components/layout/brand-mark";
import { Alert } from "@/components/ui/alert";
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
      <div className="sticky top-0 z-40 border-b border-border/80 bg-sidebar/92 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <BrandMark
            href="/admin"
            name={platformName}
            logoUrl={logoUrl}
            subtitle="Centro operacional"
            compact
            className="max-w-[14rem]"
          />
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] border border-border/80 bg-card/80"
            aria-label="Abrir menu administrativo"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open ? (
          <div className="mt-4 space-y-3">
            <Alert
              tone="warning"
              title="Area administrativa"
              description="Use este painel para operacao do tenant, campanhas e configuracoes da plataforma."
            />
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

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border/80 bg-sidebar/94 p-5 backdrop-blur-xl lg:block">
        <BrandMark
          href="/admin"
          name={platformName}
          logoUrl={logoUrl}
          subtitle="Painel SaaS"
          className="max-w-[14rem]"
        />

        <div className="mt-8">
          <AdminNavLinks />
        </div>

        <div className="absolute inset-x-5 bottom-5 space-y-3">
          <Alert
            tone="warning"
            title="Operacao protegida"
            description="A shell administrativa usa gate server-side por tenant antes de renderizar qualquer pagina do painel."
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[var(--radius-md)] border border-border/80 bg-card/72 p-3">
              <ChartColumnBig className="size-4 text-primary" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Escopo
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">Tenant atual</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border/80 bg-card/72 p-3">
              <PanelTop className="size-4 text-accent" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Contexto
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">Painel ativo</p>
            </div>
          </div>
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
          <div className="rounded-[var(--radius-md)] border border-primary/20 bg-primary/10 p-4">
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

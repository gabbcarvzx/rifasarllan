"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  ReceiptText,
  TicketCheck,
  UserRound,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AccountSidebarProps = {
  displayName: string;
  email: string | null;
  isAdmin: boolean;
};

const links = [
  { href: "/minha-conta", label: "Minha conta", icon: UserRound },
  { href: "/meus-pedidos", label: "Meus pedidos", icon: ReceiptText },
  { href: "/meus-numeros", label: "Meus numeros", icon: TicketCheck },
];

export function AccountSidebar({
  displayName,
  email,
  isAdmin,
}: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-fit overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-sidebar/92 shadow-premium lg:sticky lg:top-24">
      <div className="border-b border-border/80 p-4">
        <p className="truncate text-sm font-semibold text-foreground">
          {displayName}
        </p>
        {email ? (
          <p className="mt-1 truncate text-xs text-muted">{email}</p>
        ) : null}
      </div>

      <nav className="grid grid-cols-3 gap-1 p-2 lg:grid-cols-1" aria-label="Conta">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] px-2 py-2 text-center text-xs font-semibold text-muted transition hover:bg-card/80 hover:text-foreground lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-sm",
                active && "bg-primary/12 text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {isAdmin ? (
          <Link
            href="/admin"
            className="col-span-3 flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10 lg:col-span-1 lg:justify-start"
          >
            <LayoutDashboard className="size-4" />
            Painel admin
          </Link>
        ) : null}
      </nav>

      <div className="px-2 pb-2">
        <Alert
          tone={isAdmin ? "warning" : "info"}
          title={isAdmin ? "Conta com acesso administrativo" : "Conta protegida"}
          description={
            isAdmin
              ? "Seu perfil atual pode alternar entre jornada do cliente e painel administrativo."
              : "Seus pedidos, numeros e comprovantes ficam vinculados ao seu acesso."
          }
          className="hidden lg:flex"
        />
      </div>

      <div className="border-t border-border/80 p-2">
        <form action={signOut}>
          <button
            type="submit"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "w-full justify-center lg:justify-start",
            })}
          >
            <LogOut className="size-4" />
            Sair da conta
          </button>
        </form>
      </div>
    </aside>
  );
}

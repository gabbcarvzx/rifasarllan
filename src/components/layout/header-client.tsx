"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  ShieldCheck,
  Ticket,
  UserCircle,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "@/app/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderClientProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  displayName: string | null;
};

export function HeaderClient({
  isLoggedIn,
  isAdmin,
  displayName,
}: HeaderClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigation = [
    { href: "/", label: "Inicio" },
    { href: "/rifas", label: "Rifas" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/82 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex size-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent">
            <Ticket className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-[0.22em] text-accent">
              RIFA
            </span>
            <span className="block text-base font-bold text-foreground">Arllan</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/[0.06] hover:text-foreground",
                pathname === item.href && "bg-white/[0.08] text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Link
                href={isAdmin ? "/admin" : "/minha-conta"}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                {isAdmin ? (
                  <ShieldCheck className="size-4" />
                ) : (
                  <UserCircle className="size-4" />
                )}
                {isAdmin ? "Admin" : "Minha conta"}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <LogOut className="size-4" />
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                <UserPlus className="size-4" />
                Cadastrar
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-foreground md:hidden"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-background/95 px-4 py-4 md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {displayName ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">
                  Conectado
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {displayName}
                </p>
              </div>
            ) : null}
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-foreground hover:bg-white/[0.06]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href={isAdmin ? "/admin" : "/minha-conta"}
                    className={buttonVariants({
                      variant: "secondary",
                      size: "md",
                    })}
                    onClick={() => setOpen(false)}
                  >
                    {isAdmin ? "Admin" : "Conta"}
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className={buttonVariants({
                        variant: "ghost",
                        size: "md",
                        className: "w-full",
                      })}
                    >
                      Sair
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={buttonVariants({ variant: "secondary", size: "md" })}
                    onClick={() => setOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/cadastro"
                    className={buttonVariants({ variant: "primary", size: "md" })}
                    onClick={() => setOpen(false)}
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

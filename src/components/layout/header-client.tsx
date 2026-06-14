"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ShieldCheck,
  Ticket,
  TicketCheck,
  UserCircle,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type HeaderClientProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  displayName: string | null;
  platformName: string;
  logoUrl: string | null;
};

export function HeaderClient({
  isLoggedIn,
  isAdmin,
  displayName,
  platformName,
  logoUrl,
}: HeaderClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [account, setAccount] = useState({
    isLoggedIn,
    isAdmin,
    displayName,
  });
  const hydratedUserId = useRef<string | null>(null);
  const navigation = [
    { href: "/", label: "Inicio" },
    { href: "/rifas", label: "Rifas" },
  ];

  useEffect(() => {
    let active = true;

    async function hydrateAccount() {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getClaims();
      const userId = data?.claims?.sub;

      if (!active) return;

      if (error || !userId) {
        hydratedUserId.current = null;
        setAccount({ isLoggedIn: false, isAdmin: false, displayName: null });
        return;
      }

      if (hydratedUserId.current === userId) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,role")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;

      hydratedUserId.current = userId;
      setAccount({
        isLoggedIn: true,
        isAdmin: profile?.role === "admin",
        displayName:
          profile?.full_name ||
          (typeof data.claims.email === "string" ? data.claims.email : null),
      });
    }

    void hydrateAccount();

    return () => {
      active = false;
    };
  }, [pathname]);

  const resolvedLoggedIn = account.isLoggedIn;
  const resolvedAdmin = account.isAdmin;
  const resolvedDisplayName = account.displayName;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/82 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-accent/30 bg-accent/15 text-accent">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`Logo ${platformName}`}
                fill
                className="object-contain p-1"
                sizes="40px"
              />
            ) : (
              <Ticket className="size-5" />
            )}
          </span>
          <span className="max-w-40 truncate text-base font-bold text-foreground lg:max-w-56">
            {platformName}
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
          {resolvedLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                onClick={() => setAccountOpen((current) => !current)}
              >
                {resolvedAdmin ? (
                  <ShieldCheck className="size-4" />
                ) : (
                  <UserCircle className="size-4" />
                )}
                Minha conta
                <ChevronDown className="size-4" />
              </button>

              {accountOpen ? (
                <div
                  className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-lg border border-white/10 bg-surface-raised shadow-premium"
                  role="menu"
                >
                  {resolvedDisplayName ? (
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">
                        Conectado como
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-foreground">
                        {resolvedDisplayName}
                      </p>
                    </div>
                  ) : null}
                  <div className="grid p-2">
                    <Link
                      href="/minha-conta"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-white/[0.06]"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                    >
                      <UserCircle className="size-4 text-primary" />
                      Minha conta
                    </Link>
                    <Link
                      href="/meus-pedidos"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-white/[0.06]"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                    >
                      <ReceiptText className="size-4 text-info" />
                      Meus pedidos
                    </Link>
                    <Link
                      href="/meus-numeros"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-white/[0.06]"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                    >
                      <TicketCheck className="size-4 text-accent" />
                      Meus numeros
                    </Link>
                    {resolvedAdmin ? (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-accent hover:bg-accent/10"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        <LayoutDashboard className="size-4" />
                        Painel admin
                      </Link>
                    ) : null}
                  </div>
                  <form action={signOut} className="border-t border-white/10 p-2">
                    <button
                      type="submit"
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                        className: "w-full justify-start",
                      })}
                      role="menuitem"
                    >
                      <LogOut className="size-4" />
                      Sair
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
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
            {resolvedDisplayName ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">
                  Conectado
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {resolvedDisplayName}
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
            {resolvedLoggedIn ? (
              <div className="grid gap-1 border-t border-white/10 pt-2">
                <Link
                  href="/minha-conta"
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-foreground hover:bg-white/[0.06]"
                  onClick={() => setOpen(false)}
                >
                  Minha conta
                </Link>
                <Link
                  href="/meus-pedidos"
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-foreground hover:bg-white/[0.06]"
                  onClick={() => setOpen(false)}
                >
                  Meus pedidos
                </Link>
                <Link
                  href="/meus-numeros"
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-foreground hover:bg-white/[0.06]"
                  onClick={() => setOpen(false)}
                >
                  Meus numeros
                </Link>
                {resolvedAdmin ? (
                  <Link
                    href="/admin"
                    className="rounded-lg px-3 py-3 text-sm font-semibold text-accent hover:bg-accent/10"
                    onClick={() => setOpen(false)}
                  >
                    Painel admin
                  </Link>
                ) : null}
              </div>
            ) : null}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {resolvedLoggedIn ? (
                <>
                  <Link
                    href="/minha-conta"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "md",
                    })}
                    onClick={() => setOpen(false)}
                  >
                    Conta
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

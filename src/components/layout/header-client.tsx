"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelTop,
  ReceiptText,
  ShieldCheck,
  TicketCheck,
  UserCircle,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { BrandMark } from "@/components/layout/brand-mark";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const mobileMenuId = "mobile-main-menu";
  const accountMenuId = "desktop-account-menu";

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

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setAccountOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const resolvedLoggedIn = account.isLoggedIn;
  const resolvedAdmin = account.isAdmin;
  const resolvedDisplayName = account.displayName;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-header/88 text-header-foreground backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandMark
          href="/"
          onClick={() => setOpen(false)}
          name={platformName}
          logoUrl={logoUrl}
          subtitle="Plataforma premium"
          className="max-w-[16rem]"
        />

        <nav className="hidden items-center gap-1 rounded-full border border-border/80 bg-card/72 p-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-card hover:text-foreground",
                pathname === item.href && "bg-primary/16 text-foreground",
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
                aria-controls={accountMenuId}
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
                <Card
                  className="absolute right-0 top-12 z-50 w-72 overflow-hidden border-border/85 bg-card/98"
                  role="menu"
                  id={accountMenuId}
                >
                  {resolvedDisplayName ? (
                    <div className="border-b border-border/80 px-4 py-3">
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
                      className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-card"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                    >
                      <UserCircle className="size-4 text-primary" />
                      Minha conta
                    </Link>
                    <Link
                      href="/meus-pedidos"
                      className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-card"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                    >
                      <ReceiptText className="size-4 text-info" />
                      Meus pedidos
                    </Link>
                    <Link
                      href="/meus-numeros"
                      className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-card"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                    >
                      <TicketCheck className="size-4 text-accent" />
                      Meus numeros
                    </Link>
                    {resolvedAdmin ? (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-semibold text-accent hover:bg-accent/10"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        <LayoutDashboard className="size-4" />
                        Painel admin
                      </Link>
                    ) : null}
                  </div>
                  <form action={signOut} className="border-t border-border/80 p-2">
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
                </Card>
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
          className="inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] border border-border/80 bg-card/80 text-foreground md:hidden"
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls={mobileMenuId}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div
          id={mobileMenuId}
          className="border-t border-border/80 bg-header/96 px-4 py-4 md:hidden"
        >
          <div className="mx-auto grid max-w-7xl gap-3">
            {resolvedDisplayName ? (
              <Alert
                tone="info"
                title={resolvedDisplayName}
                description={resolvedAdmin ? "Conta administrativa ativa." : "Conta participante ativa."}
              />
            ) : null}
            <div className="grid gap-2 rounded-[var(--radius-md)] border border-border/80 bg-card/78 p-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold text-foreground hover:bg-background/50"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  <ArrowRight className="size-4 text-muted" />
                </Link>
              ))}
              {resolvedLoggedIn ? (
                <>
                  <Link
                    href="/minha-conta"
                    className="flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold text-foreground hover:bg-background/50"
                    onClick={() => setOpen(false)}
                  >
                    Minha conta
                    <ArrowRight className="size-4 text-muted" />
                  </Link>
                  <Link
                    href="/meus-pedidos"
                    className="flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold text-foreground hover:bg-background/50"
                    onClick={() => setOpen(false)}
                  >
                    Meus pedidos
                    <ArrowRight className="size-4 text-muted" />
                  </Link>
                  <Link
                    href="/meus-numeros"
                    className="flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold text-foreground hover:bg-background/50"
                    onClick={() => setOpen(false)}
                  >
                    Meus numeros
                    <ArrowRight className="size-4 text-muted" />
                  </Link>
                  {resolvedAdmin ? (
                    <Link
                      href="/admin"
                      className="flex items-center justify-between rounded-[var(--radius-sm)] bg-accent/10 px-3 py-3 text-sm font-semibold text-accent"
                      onClick={() => setOpen(false)}
                    >
                      Painel admin
                      <PanelTop className="size-4" />
                    </Link>
                  ) : null}
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
            {resolvedLoggedIn ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "md",
                    className: "w-full",
                  })}
                >
                  <LogOut className="size-4" />
                  Sair
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

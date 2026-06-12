import type { Metadata } from "next";
import { CalendarDays, LogOut, ShieldCheck, UserCircle } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Minha Conta",
};

export const dynamic = "force-dynamic";

type MinhaContaPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Nao informado";
  }

  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function MinhaContaPage({
  searchParams,
}: MinhaContaPageProps) {
  const params = await searchParams;
  const { user, profile } = await requireUser();

  const rows = [
    ["Nome", profile?.full_name ?? user.user_metadata?.full_name ?? "Nao informado"],
    ["E-mail", profile?.email ?? user.email ?? "Nao informado"],
    ["WhatsApp", profile?.phone ?? user.user_metadata?.phone ?? "Nao informado"],
    ["Role", profile?.role ?? "customer"],
    ["Criado em", formatDate(profile?.created_at ?? user.created_at)],
  ];

  return (
    <section className="bg-surface/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Area autenticada
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
            Minha conta
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Dados carregados da sessao Supabase e do profile criado pelo trigger
            do banco.
          </p>
        </div>

        <AuthMessage error={params.error} success={params.success} />

        <Card className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
                <UserCircle className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {profile?.full_name ?? user.email}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Perfil autenticado na plataforma.
                </p>
              </div>
            </div>
          </div>

          <div className="grid divide-y divide-white/10">
            {rows.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6"
              >
                <p className="text-sm font-medium text-muted">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-muted">
              {profile?.role === "admin" ? (
                <ShieldCheck className="size-4 text-primary" />
              ) : (
                <CalendarDays className="size-4 text-accent" />
              )}
              <span>
                {profile?.role === "admin"
                  ? "Este usuario possui acesso administrativo."
                  : "Este usuario ainda nao possui acesso administrativo."}
              </span>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className={buttonVariants({
                  variant: "secondary",
                  className: "w-full sm:w-auto",
                })}
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </form>
          </div>
        </Card>
      </div>
    </section>
  );
}

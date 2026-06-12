import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Acesso Negado",
};

export default function AcessoNegadoPage() {
  return (
    <section className="bg-surface/30 px-4 py-16 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-lg border border-danger/35 bg-danger/12 text-rose-100">
          <ShieldAlert className="size-7" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Acesso negado
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          Esta area exige permissao de admin
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
          Sua sessao esta ativa, mas seu profile nao possui role admin para
          acessar o painel administrativo deste tenant.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/rifas" className={buttonVariants({ variant: "primary" })}>
            Voltar para rifas
          </Link>
          <Link
            href="/minha-conta"
            className={buttonVariants({ variant: "secondary" })}
          >
            Minha conta
          </Link>
        </div>
      </Card>
    </section>
  );
}

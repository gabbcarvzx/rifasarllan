import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createRaffle } from "@/app/actions/raffles";
import { PageHeader } from "@/components/admin/page-header";
import { RaffleForm } from "@/components/admin/raffles/raffle-form";
import { AuthMessage } from "@/components/auth/auth-message";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nova Rifa",
};

type NovaRifaPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function NovaRifaPage({ searchParams }: NovaRifaPageProps) {
  const { error, success } = await searchParams;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Criacao visual"
        title="Nova rifa"
        description="Cadastre a campanha, defina a faixa de numeros e publique como rascunho ou ativa sem tocar no codigo."
        actions={
          <Link
            href="/admin/rifas"
            className={buttonVariants({ variant: "secondary" })}
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        }
      />

      <AuthMessage error={error} success={success} />
      <RaffleForm
        action={createRaffle}
        cancelHref="/admin/rifas"
        mode="create"
      />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { getAdminRaffleById, updateRaffle } from "@/app/actions/raffles";
import { PageHeader } from "@/components/admin/page-header";
import { RaffleActions } from "@/components/admin/raffles/raffle-actions";
import { RaffleForm } from "@/components/admin/raffles/raffle-form";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { AuthMessage } from "@/components/auth/auth-message";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar Rifa",
};

type EditarRifaPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function EditarRifaPage({
  params,
  searchParams,
}: EditarRifaPageProps) {
  const [{ id }, { error, success }] = await Promise.all([params, searchParams]);
  const result = await getAdminRaffleById(id);

  if (!result.data) {
    notFound();
  }

  const raffle = result.data;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Edicao de campanha"
        title={raffle.title}
        description="Atualize os dados principais da rifa respeitando o tenant do admin e a consistencia da numeracao."
        actions={
          <>
            <Link
              href="/admin/rifas"
              className={buttonVariants({ variant: "secondary" })}
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
            {raffle.status === "active" ? (
              <Link
                href={`/rifas/${raffle.slug}`}
                className={buttonVariants({ variant: "outline" })}
              >
                <Eye className="size-4" />
                Ver publica
              </Link>
            ) : null}
          </>
        }
      />

      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <RaffleStatusBadge status={raffle.status} />
          <span className="font-mono text-xs text-muted">{raffle.id}</span>
        </div>
        <RaffleActions raffle={raffle} />
      </div>

      <AuthMessage error={error || result.error} success={success} />
      <RaffleForm
        action={updateRaffle}
        cancelHref="/admin/rifas"
        mode="edit"
        raffle={raffle}
      />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { getPublicPrizeSummaries } from "@/app/actions/prizes";
import { PublicRaffleCard } from "@/components/raffles/public-raffle-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicActiveRaffles } from "@/lib/raffles/public-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rifas",
};

export default async function RifasPage() {
  const raffles = await getPublicActiveRaffles();
  const prizeSummaries = await getPublicPrizeSummaries(
    raffles.map((raffle) => raffle.id),
  );

  return (
    <section className="bg-surface/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="success">Rifas disponiveis</Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
              Escolha sua campanha
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Apenas campanhas ativas aparecem nesta vitrine publica. Reservas,
              grade visual e Pix entram em etapas dedicadas.
            </p>
          </div>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Voltar ao inicio
          </Link>
        </div>

        {raffles.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {raffles.map((raffle) => (
              <PublicRaffleCard
                key={raffle.id}
                raffle={raffle}
                prizeSummary={prizeSummaries[raffle.id]}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={SearchX}
              title="Nenhuma rifa ativa no momento"
              description="As campanhas publicadas pelo admin aparecerem aqui assim que o status estiver ativo."
              action={
                <Link
                  href="/"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Voltar para a home
                </Link>
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}

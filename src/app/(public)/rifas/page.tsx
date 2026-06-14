import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { PublicRaffleCard } from "@/components/raffles/public-raffle-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicRaffleCatalog } from "@/lib/raffles/public-queries";

export const metadata: Metadata = {
  title: "Rifas",
};

export default async function RifasPage() {
  const { raffles, prizeSummaries } = await getPublicRaffleCatalog();

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
              Explore campanhas ativas, confira os premios e reserve seus
              numeros em uma experiencia organizada e transparente.
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
              description="As campanhas publicadas pelo administrador aparecerao aqui assim que estiverem ativas."
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

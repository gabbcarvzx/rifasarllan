import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, LockKeyhole, ShieldCheck, Ticket } from "lucide-react";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPublicRaffleBySlug } from "@/lib/raffles/public-queries";

export const dynamic = "force-dynamic";

type RifaPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: RifaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const raffle = await getPublicRaffleBySlug(slug);

  return {
    title: raffle ? raffle.title : "Rifa",
    description: raffle?.short_description ?? undefined,
  };
}

export default async function RifaDetalhePage({ params }: RifaPageProps) {
  const { slug } = await params;
  const raffle = await getPublicRaffleBySlug(slug);

  if (!raffle) {
    notFound();
  }

  const imageUrl = raffle.main_image_url || "/images/hero-raffle-premium.png";

  return (
    <section className="bg-surface/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <div
            className="relative aspect-[16/10] overflow-hidden rounded-lg border border-white/10 bg-cover bg-center shadow-gold"
            style={{ backgroundImage: `url(${imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <RaffleStatusBadge status={raffle.status} />
              {raffle.featured ? <Badge variant="default">Destaque</Badge> : null}
            </div>
          </div>

          <Card className="p-5">
            <Badge variant="default">Campanha ativa</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {raffle.title}
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              {raffle.short_description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/18 p-4">
                <Ticket className="mb-3 size-5 text-primary" />
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Valor
                </p>
                <p className="mt-1 font-bold text-foreground">
                  {formatCurrency(raffle.price_per_number)}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/18 p-4">
                <CalendarDays className="mb-3 size-5 text-accent" />
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Sorteio
                </p>
                <p className="mt-1 font-bold text-foreground">
                  {formatDate(raffle.draw_date)}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/18 p-4">
                <ShieldCheck className="mb-3 size-5 text-info" />
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Numeros
                </p>
                <p className="mt-1 font-bold text-foreground">
                  {raffle.total_numbers.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-bold text-foreground">Descricao</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
              {raffle.description}
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <LockKeyhole className="size-5 text-accent" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              Escolha de numeros
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Os numeros desta rifa ja foram gerados no banco. A grade visual,
              reserva e checkout Pix serao implementados nas etapas futuras.
            </p>
            <button
              type="button"
              disabled
              className={buttonVariants({
                className: "mt-5 w-full",
                size: "lg",
              })}
            >
              Escolher numeros em breve
            </button>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-bold text-foreground">Regras</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
              {raffle.rules}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-bold text-foreground">Resumo operacional</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-muted">Faixa</dt>
                <dd className="font-semibold text-foreground">
                  {raffle.min_number.toLocaleString("pt-BR")} ate{" "}
                  {raffle.max_number.toLocaleString("pt-BR")}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-muted">Status</dt>
                <dd>
                  <RaffleStatusBadge status={raffle.status} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">URL</dt>
                <dd className="font-mono text-xs text-foreground">/{raffle.slug}</dd>
              </div>
            </dl>
            <Link
              href="/rifas"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-5 w-full",
              })}
            >
              Voltar para rifas
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}

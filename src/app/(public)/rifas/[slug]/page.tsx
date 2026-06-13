import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ShieldCheck, Ticket } from "lucide-react";
import { getPublicRaffleNumbers } from "@/app/actions/raffle-numbers";
import { getPublicRafflePrizes } from "@/app/actions/prizes";
import { getPublicRaffleImages } from "@/app/actions/raffle-media";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { NumberGrid } from "@/components/raffles/number-grid";
import { PublicRaffleGallery } from "@/components/raffles/public-raffle-gallery";
import { PublicPrizesSection } from "@/components/raffles/public-prizes-section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth/session";
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

  const [galleryImages, prizes, raffleNumbers, authContext] = await Promise.all([
    getPublicRaffleImages(raffle.id),
    getPublicRafflePrizes(raffle.id),
    getPublicRaffleNumbers(raffle.id),
    getAuthContext(),
  ]);
  const customerDefaults = {
    name:
      authContext.profile?.full_name ??
      (typeof authContext.user?.user_metadata?.full_name === "string"
        ? authContext.user.user_metadata.full_name
        : ""),
    email: authContext.profile?.email ?? authContext.user?.email ?? "",
    phone:
      authContext.profile?.phone ??
      (typeof authContext.user?.user_metadata?.phone === "string"
        ? authContext.user.user_metadata.phone
        : ""),
  };

  return (
    <section className="bg-surface/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <PublicRaffleGallery
              title={raffle.title}
              mainImageUrl={raffle.main_image_url}
              galleryImages={galleryImages}
              featured={raffle.featured}
              statusBadge={<RaffleStatusBadge status={raffle.status} />}
            />

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

            <PublicPrizesSection prizes={prizes} />
          </div>

          <div className="space-y-5">
            <Card className="p-5">
              <h2 className="text-xl font-bold text-foreground">Regras</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
                {raffle.rules}
              </p>
            </Card>

            <Card className="p-5">
              <h2 className="text-xl font-bold text-foreground">
                Resumo operacional
              </h2>
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
                  <dd className="font-mono text-xs text-foreground">
                    /{raffle.slug}
                  </dd>
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

        <div className="mt-8">
          <NumberGrid
            raffleId={raffle.id}
            raffleSlug={raffle.slug}
            numbers={raffleNumbers}
            pricePerNumber={raffle.price_per_number}
            minNumber={raffle.min_number}
            maxNumber={raffle.max_number}
            customerDefaults={customerDefaults}
          />
        </div>
      </div>
    </section>
  );
}

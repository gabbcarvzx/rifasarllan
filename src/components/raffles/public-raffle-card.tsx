import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Gift, Search, Ticket, TrendingUp } from "lucide-react";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import type { PublicCampaignMetrics } from "@/lib/raffles/public-campaign-metrics";
import type { Raffle } from "@/types/database";

type PrizeSummary = {
  count: number;
  primaryTitle: string | null;
};

export function PublicRaffleCard({
  raffle,
  prizeSummary,
  metrics,
}: {
  raffle: Raffle;
  prizeSummary?: PrizeSummary;
  metrics?: PublicCampaignMetrics;
}) {
  const progress = metrics?.progress ?? 0;
  const remaining = metrics?.remaining ?? raffle.total_numbers;
  const sold = metrics?.sold ?? 0;

  return (
    <Card className="overflow-hidden border-border/80 bg-card/96">
      <div className="relative aspect-[16/10] overflow-hidden">
        {raffle.main_image_url ? (
          <Image
            src={raffle.main_image_url}
            alt={raffle.title}
            fill
            className="object-cover transition duration-500 hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <ImagePlaceholder
            title="Imagem em breve"
            description="A rifa ainda nao possui imagem principal."
            className="h-full rounded-none border-0"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4">
          {raffle.featured ? (
            <span className="rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
              Destaque
            </span>
          ) : (
            <RaffleStatusBadge status={raffle.status} />
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <RaffleStatusBadge status={raffle.status} />
            <span className="text-sm font-semibold text-accent">
              {formatCurrency(raffle.price_per_number)}
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            {raffle.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
            {raffle.short_description}
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] border border-primary/20 bg-primary/[0.06] p-4">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <span className="inline-flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Andamento
            </span>
            <span className="text-foreground">{formatPercent(progress)}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-info to-accent"
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted">Vendidos</p>
              <p className="font-semibold text-foreground">
                {sold.toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-muted">Restantes</p>
              <p className="font-semibold text-foreground">
                {remaining.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {prizeSummary && prizeSummary.count > 0 ? (
          <div className="rounded-[var(--radius-md)] border border-accent/20 bg-accent/10 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">
              <Gift className="size-4" />
              {prizeSummary.count === 1
                ? "Premio cadastrado"
                : `${prizeSummary.count} premios cadastrados`}
            </div>
            {prizeSummary.primaryTitle ? (
              <p className="mt-2 line-clamp-1 text-sm font-semibold text-foreground">
                {prizeSummary.primaryTitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[var(--radius-md)] border border-border/80 bg-background/35 p-3">
            <Ticket className="mb-2 size-4 text-primary" />
            <p className="text-muted">Numeros</p>
            <p className="font-semibold text-foreground">
              {raffle.total_numbers.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border/80 bg-background/35 p-3">
            <CalendarDays className="mb-2 size-4 text-accent" />
            <p className="text-muted">Sorteio</p>
            <p className="font-semibold text-foreground">
              {formatDate(raffle.draw_date)}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href={`/rifas/${raffle.slug}`}
            className={buttonVariants({ className: "w-full sm:col-span-2", size: "lg" })}
          >
            Comprar agora
          </Link>
          <Link
            href={`/rifas/${raffle.slug}`}
            className={buttonVariants({ variant: "secondary", className: "w-full" })}
          >
            Regulamento
          </Link>
          <Link
            href={`/rifas/${raffle.slug}`}
            className={buttonVariants({ variant: "outline", className: "w-full" })}
          >
            <Search className="size-4" />
            Detalhes
          </Link>
        </div>
      </div>
    </Card>
  );
}

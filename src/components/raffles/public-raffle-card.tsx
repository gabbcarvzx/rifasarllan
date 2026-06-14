import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Gift, Ticket } from "lucide-react";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Raffle } from "@/types/database";

type PrizeSummary = {
  count: number;
  primaryTitle: string | null;
};

export function PublicRaffleCard({
  raffle,
  prizeSummary,
}: {
  raffle: Raffle;
  prizeSummary?: PrizeSummary;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        {raffle.main_image_url ? (
          <Image
            src={raffle.main_image_url}
            alt={raffle.title}
            fill
            unoptimized
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

        {prizeSummary && prizeSummary.count > 0 ? (
          <div className="rounded-lg border border-accent/20 bg-accent/10 p-3">
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
          <div className="rounded-lg border border-white/10 bg-black/18 p-3">
            <Ticket className="mb-2 size-4 text-primary" />
            <p className="text-muted">Numeros</p>
            <p className="font-semibold text-foreground">
              {raffle.total_numbers.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/18 p-3">
            <CalendarDays className="mb-2 size-4 text-accent" />
            <p className="text-muted">Sorteio</p>
            <p className="font-semibold text-foreground">
              {formatDate(raffle.draw_date)}
            </p>
          </div>
        </div>

        <Link
          href={`/rifas/${raffle.slug}`}
          className={buttonVariants({ className: "w-full", size: "lg" })}
        >
          Escolher numeros
        </Link>
      </div>
    </Card>
  );
}

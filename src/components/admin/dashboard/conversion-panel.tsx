import Link from "next/link";
import { ArrowUpRight, ImageOff, Trophy, TrendingUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { AdminDashboardStats } from "@/types/dashboard";

type ConversionPanelProps = {
  stats: AdminDashboardStats;
};

export function ConversionPanel({ stats }: ConversionPanelProps) {
  const activeRaffles = stats.raffles.filter((raffle) => raffle.status === "active");
  const missingImages = activeRaffles.filter(
    (raffle) => !raffle.main_image_url && raffle.image_count === 0,
  ).length;
  const missingPrizes = activeRaffles.filter((raffle) => raffle.prize_count === 0).length;
  const lowOccupancy = activeRaffles
    .filter((raffle) => raffle.occupancy_percentage < 10)
    .sort((first, second) => first.occupancy_percentage - second.occupancy_percentage)
    .slice(0, 3);
  const reservedPipeline = stats.revenue.reserved;

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Conversao
          </p>
          <h2 className="mt-2 text-xl font-bold text-foreground">
            Prioridades para vender mais numeros
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Use este painel para corrigir atritos visuais antes de divulgar a
            campanha.
          </p>
        </div>
        <Link href="/admin/rifas" className={buttonVariants({ variant: "outline" })}>
          Revisar rifas
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-primary/20 bg-primary/[0.07] p-4">
          <TrendingUp className="size-5 text-primary" />
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">
            Reservas em aberto
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {formatCurrency(reservedPipeline)}
          </p>
        </div>
        <div className="rounded-lg border border-accent/20 bg-accent/[0.07] p-4">
          <Trophy className="size-5 text-accent" />
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">
            Ativas sem premio
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{missingPrizes}</p>
        </div>
        <div className="rounded-lg border border-info/20 bg-info/[0.07] p-4">
          <ImageOff className="size-5 text-info" />
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">
            Ativas sem imagem
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{missingImages}</p>
        </div>
      </div>

      {lowOccupancy.length > 0 ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-foreground">
            Campanhas com baixa ocupacao
          </p>
          <div className="mt-3 grid gap-2">
            {lowOccupancy.map((raffle) => (
              <Link
                key={raffle.id}
                href={`/admin/rifas/${raffle.id}/editar`}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/18 px-3 py-2 text-sm hover:bg-white/[0.05]"
              >
                <span className="truncate font-semibold text-foreground">
                  {raffle.title}
                </span>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {raffle.occupancy_percentage.toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}
                  %
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

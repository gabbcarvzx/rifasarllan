import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AdminRaffleAnalytics } from "@/types/dashboard";

export function TopRaffles({ raffles }: { raffles: AdminRaffleAnalytics[] }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="success">Ranking</Badge>
          <h2 className="mt-3 text-xl font-bold text-foreground">
            Top rifas por ocupacao
          </h2>
        </div>
        <Trophy className="size-5 text-accent" />
      </div>

      <div className="mt-5 space-y-5">
        {raffles.map((raffle, index) => {
          const percentage = Math.min(
            100,
            Math.max(0, raffle.occupancy_percentage),
          );

          return (
            <div key={raffle.id}>
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 font-mono text-sm font-bold text-accent">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-semibold text-foreground">
                      {raffle.title}
                    </p>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {percentage.toLocaleString("pt-BR", {
                        maximumFractionDigits: 1,
                      })}
                      %
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <Link
                  href={`/admin/rifas/${raffle.id}/editar`}
                  aria-label={`Abrir ${raffle.title}`}
                  className="text-muted transition hover:text-foreground"
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          );
        })}

        {raffles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-6 text-center text-sm text-muted">
            O ranking aparecera quando houver rifas cadastradas.
          </div>
        ) : null}
      </div>
    </Card>
  );
}

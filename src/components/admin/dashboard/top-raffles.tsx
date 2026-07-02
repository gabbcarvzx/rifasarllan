import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AdminRaffleAnalytics } from "@/types/dashboard";

export function TopRaffles({ raffles }: { raffles: AdminRaffleAnalytics[] }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="success">Ranking</Badge>
          <SectionHeading
            title="Top rifas por ocupacao"
            description="Campanhas com melhor tracao visual e comercial dentro do tenant."
            className="mt-3"
          />
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
          <EmptyState
            title="Ranking indisponivel"
            description="O ranking aparecera quando houver rifas cadastradas."
            className="min-h-44"
          />
        ) : null}
      </div>
    </Card>
  );
}

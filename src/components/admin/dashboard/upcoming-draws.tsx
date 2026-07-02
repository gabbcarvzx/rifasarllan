import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatDate } from "@/lib/format";
import type { AdminRaffleAnalytics } from "@/types/dashboard";

export function UpcomingDraws({
  raffles,
}: {
  raffles: AdminRaffleAnalytics[];
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="info">Agenda</Badge>
          <SectionHeading
            title="Proximos sorteios"
            description="Campanhas que exigem acompanhamento mais proximo de prazo e ocupacao."
            className="mt-3"
          />
        </div>
        <CalendarDays className="size-5 text-info" />
      </div>

      {raffles.length > 0 ? (
        <div className="mt-5 divide-y divide-border/80">
          {raffles.map((raffle) => (
            <div
              key={raffle.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-foreground">
                    {raffle.title}
                  </p>
                  <RaffleStatusBadge status={raffle.status} />
                </div>
                <p className="mt-2 text-sm text-muted">
                  {formatDate(raffle.draw_date)} · {raffle.occupancy_percentage}%
                  ocupada
                </p>
              </div>
              <Link
                href={`/admin/rifas/${raffle.id}/editar`}
                aria-label={`Abrir ${raffle.title}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border/80 text-muted transition hover:border-primary/35 hover:text-foreground"
              >
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            title="Agenda livre"
            description="Nenhuma campanha ativa ou pausada possui sorteio futuro."
            className="min-h-44"
          />
        </div>
      )}
    </Card>
  );
}

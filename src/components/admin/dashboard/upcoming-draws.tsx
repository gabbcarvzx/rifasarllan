import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
          <h2 className="mt-3 text-xl font-bold text-foreground">
            Proximos sorteios
          </h2>
        </div>
        <CalendarDays className="size-5 text-info" />
      </div>

      {raffles.length > 0 ? (
        <div className="mt-5 divide-y divide-white/10">
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
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-muted transition hover:border-primary/35 hover:text-foreground"
              >
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
          <p className="font-semibold text-foreground">Agenda livre</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Nenhuma campanha ativa ou pausada possui sorteio futuro.
          </p>
        </div>
      )}
    </Card>
  );
}

import Link from "next/link";
import { ArrowUpRight, CircleCheck, Clock3, Ticket } from "lucide-react";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { AdminRaffleAnalytics } from "@/types/dashboard";

export function RaffleOccupancyCard({
  raffle,
}: {
  raffle: AdminRaffleAnalytics;
}) {
  const percentage = Math.min(100, Math.max(0, raffle.occupancy_percentage));

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <RaffleStatusBadge status={raffle.status} />
          <h3 className="mt-3 truncate text-lg font-bold text-foreground">
            {raffle.title}
          </h3>
          <p className="mt-1 font-mono text-xs text-muted">/{raffle.slug}</p>
        </div>
        <Link
          href={`/admin/rifas/${raffle.id}/editar`}
          title="Abrir rifa"
          aria-label={`Abrir rifa ${raffle.title}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-muted transition hover:border-primary/35 hover:text-foreground"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-3xl font-bold text-foreground">
            {percentage.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
          </p>
          <p className="mt-1 text-xs text-muted">ocupacao total</p>
        </div>
        <p className="font-mono text-sm text-muted">
          {raffle.occupied_numbers.toLocaleString("pt-BR")} /{" "}
          {raffle.total_numbers.toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
        <div>
          <Clock3 className="mx-auto size-4 text-accent" />
          <p className="mt-2 font-mono text-sm font-bold text-foreground">
            {raffle.reserved_numbers.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1 text-xs text-muted">Reservados</p>
        </div>
        <div>
          <CircleCheck className="mx-auto size-4 text-primary" />
          <p className="mt-2 font-mono text-sm font-bold text-foreground">
            {raffle.paid_numbers.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1 text-xs text-muted">Pagos</p>
        </div>
        <div>
          <Ticket className="mx-auto size-4 text-info" />
          <p className="mt-2 font-mono text-sm font-bold text-foreground">
            {formatCurrency(raffle.potential_revenue)}
          </p>
          <p className="mt-1 text-xs text-muted">Potencial</p>
        </div>
      </div>
    </Card>
  );
}

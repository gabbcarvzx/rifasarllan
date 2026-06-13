import Link from "next/link";
import { CircleCheck, Clock3, Plus, TicketX } from "lucide-react";
import { RaffleActions } from "@/components/admin/raffles/raffle-actions";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import type { AdminRaffleAnalytics } from "@/types/dashboard";

export function AdminRafflesTable({
  raffles,
}: {
  raffles: AdminRaffleAnalytics[];
}) {
  if (raffles.length === 0) {
    return (
      <EmptyState
        icon={TicketX}
        title="Nenhuma rifa cadastrada"
        description="Crie a primeira campanha do tenant para liberar a vitrine publica e iniciar a operacao."
        action={
          <Link href="/admin/rifas/nova" className={buttonVariants()}>
            <Plus className="size-4" />
            Nova rifa
          </Link>
        }
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Rifa</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Ocupacao</th>
              <th className="px-5 py-3 font-semibold">Reservados / pagos</th>
              <th className="px-5 py-3 font-semibold">Potencial</th>
              <th className="px-5 py-3 font-semibold">Sorteio</th>
              <th className="px-5 py-3 font-semibold">Estrutura</th>
              <th className="px-5 py-3 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {raffles.map((raffle) => {
              const occupancy = Math.min(
                100,
                Math.max(0, raffle.occupancy_percentage),
              );

              return (
                <tr key={raffle.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <p className="max-w-56 truncate font-semibold text-foreground">
                      {raffle.title}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted">
                      /{raffle.slug}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      {formatCurrency(raffle.price_per_number)} por numero
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <RaffleStatusBadge status={raffle.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="w-44">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono font-bold text-foreground">
                          {occupancy.toLocaleString("pt-BR", {
                            maximumFractionDigits: 1,
                          })}
                          %
                        </span>
                        <span className="font-mono text-xs text-muted">
                          {raffle.occupied_numbers.toLocaleString("pt-BR")} /{" "}
                          {raffle.total_numbers.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2 text-amber-100">
                        <Clock3 className="size-4" />
                        <span className="font-mono font-semibold">
                          {raffle.reserved_numbers.toLocaleString("pt-BR")}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-emerald-100">
                        <CircleCheck className="size-4" />
                        <span className="font-mono font-semibold">
                          {raffle.paid_numbers.toLocaleString("pt-BR")}
                        </span>
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {raffle.order_count.toLocaleString("pt-BR")} pedidos
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-mono font-semibold text-accent">
                      {formatCurrency(raffle.potential_revenue)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatCurrency(raffle.reserved_value)} reservado
                    </p>
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {formatDate(raffle.draw_date)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {raffle.prize_count} premios
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {raffle.main_image_url || raffle.image_count > 0
                        ? "Com imagem"
                        : "Sem imagem"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <RaffleActions raffle={raffle} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

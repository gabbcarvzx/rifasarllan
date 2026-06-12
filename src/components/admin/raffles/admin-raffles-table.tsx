import Link from "next/link";
import { Plus, TicketX } from "lucide-react";
import { RaffleActions } from "@/components/admin/raffles/raffle-actions";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Raffle } from "@/types/database";

export function AdminRafflesTable({ raffles }: { raffles: Raffle[] }) {
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
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Rifa</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Valor</th>
              <th className="px-5 py-3 font-semibold">Numeros</th>
              <th className="px-5 py-3 font-semibold">Sorteio</th>
              <th className="px-5 py-3 font-semibold">Destaque</th>
              <th className="px-5 py-3 font-semibold">Criada em</th>
              <th className="px-5 py-3 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {raffles.map((raffle) => (
              <tr key={raffle.id} className="hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <p className="font-semibold text-foreground">{raffle.title}</p>
                  <p className="mt-1 font-mono text-xs text-muted">/{raffle.slug}</p>
                </td>
                <td className="px-5 py-4">
                  <RaffleStatusBadge status={raffle.status} />
                </td>
                <td className="px-5 py-4 font-semibold text-accent">
                  {formatCurrency(raffle.price_per_number)}
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-foreground">
                    {raffle.total_numbers.toLocaleString("pt-BR")}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {raffle.min_number.toLocaleString("pt-BR")} ate{" "}
                    {raffle.max_number.toLocaleString("pt-BR")}
                  </p>
                </td>
                <td className="px-5 py-4 text-muted">
                  {formatDate(raffle.draw_date)}
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-muted">
                    {raffle.featured ? "Sim" : "Nao"}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted">
                  {formatDate(raffle.created_at)}
                </td>
                <td className="px-5 py-4">
                  <RaffleActions raffle={raffle} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

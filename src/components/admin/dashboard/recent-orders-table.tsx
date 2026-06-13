import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { AdminRecentOrder } from "@/types/dashboard";
import type { ComponentProps } from "react";

const orderStatus: Record<
  AdminRecentOrder["status"],
  { label: string; variant: ComponentProps<typeof Badge>["variant"] }
> = {
  pending: { label: "Pendente", variant: "warning" },
  paid: { label: "Confirmado", variant: "success" },
  expired: { label: "Expirado", variant: "danger" },
  cancelled: { label: "Cancelado", variant: "muted" },
  refunded: { label: "Reembolsado", variant: "info" },
};

export function RecentOrdersTable({ orders }: { orders: AdminRecentOrder[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <Badge variant="default">Movimento recente</Badge>
          <h2 className="mt-3 text-xl font-bold text-foreground">
            Ultimos pedidos
          </h2>
        </div>
        <Inbox className="size-5 text-accent" />
      </div>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Participante</th>
                <th className="px-5 py-3 font-semibold">Rifa</th>
                <th className="px-5 py-3 font-semibold">Numeros</th>
                <th className="px-5 py-3 font-semibold">Valor</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Criado em</th>
                <th className="px-5 py-3 text-right font-semibold">Abrir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => {
                const status = orderStatus[order.status];

                return (
                  <tr key={order.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">
                        {order.customer_name ?? "Participante"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {order.customer_email ?? "E-mail nao informado"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">
                        {order.raffle_title}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-mono text-foreground">
                      {order.number_count.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-accent">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/rifas/${order.raffle_id}/editar`}
                        aria-label={`Abrir rifa do pedido ${order.id}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 text-muted transition hover:border-primary/35 hover:text-foreground"
                      >
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="font-semibold text-foreground">Nenhum pedido ainda</p>
          <p className="mt-2 text-sm text-muted">
            As primeiras reservas aparecerao aqui.
          </p>
        </div>
      )}
    </Card>
  );
}

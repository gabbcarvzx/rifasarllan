import Link from "next/link";
import { ArrowUpRight, CalendarDays, Inbox, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
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
      <div className="flex items-start justify-between gap-4 border-b border-border/80 p-5">
        <div>
          <Badge variant="default">Movimento recente</Badge>
          <SectionHeading
            title="Ultimos pedidos"
            description="Leitura rapida de participantes, status e volume financeiro mais recente."
            className="mt-3"
          />
        </div>
        <Inbox className="size-5 text-accent" />
      </div>

      {orders.length > 0 ? (
        <>
          <div className="grid gap-3 p-4 lg:hidden">
            {orders.map((order) => {
              const status = orderStatus[order.status];

              return (
                <div
                  key={order.id}
                  className="rounded-[var(--radius-sm)] border border-border/80 bg-surface-raised/55 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {order.customer_name ?? "Participante"}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted">
                        {order.customer_email ?? "E-mail nao informado"}
                      </p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-muted">
                        Rifa
                      </p>
                      <p className="mt-1 font-medium text-foreground">
                        {order.raffle_title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-muted">
                        Valor
                      </p>
                      <p className="mt-1 font-mono font-semibold text-accent">
                        {formatCurrency(order.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Ticket className="size-4 text-primary" />
                      {order.number_count.toLocaleString("pt-BR")} numero(s)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <CalendarDays className="size-4 text-info" />
                      {formatDateTime(order.created_at)}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/admin/rifas/${order.raffle_id}/editar`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      Abrir campanha
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto lg:block">
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
                        className="inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] border border-border/80 text-muted transition hover:border-primary/35 hover:text-foreground"
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
        </>
      ) : (
        <div className="p-5">
          <EmptyState
            title="Nenhum pedido ainda"
            description="As primeiras reservas aparecerao aqui."
            className="min-h-52"
          />
        </div>
      )}
    </Card>
  );
}

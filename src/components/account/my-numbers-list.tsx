import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  TicketCheck,
} from "lucide-react";
import { AccountEmptyState } from "@/components/account/account-empty-state";
import { MyNumberBadge } from "@/components/account/my-number-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatDateTime } from "@/lib/format";
import { raffleStatusLabels } from "@/lib/account/status";
import { cn } from "@/lib/utils";
import type { MyNumbersGroup, MyNumberStatus } from "@/types/account";

export type NumberFilter = "all" | "reserved" | "paid" | "inactive";

const filters: Array<{ value: NumberFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "reserved", label: "Reservados" },
  { value: "paid", label: "Pagos" },
  { value: "inactive", label: "Expirados / cancelados" },
];

function matchesFilter(status: MyNumberStatus, filter: NumberFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "inactive") {
    return status === "expired" || status === "cancelled";
  }

  return status === filter;
}

export function MyNumbersList({
  groups,
  filter,
}: {
  groups: MyNumbersGroup[];
  filter: NumberFilter;
}) {
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      numbers: group.numbers.filter((entry) =>
        matchesFilter(entry.status, filter),
      ),
    }))
    .filter((group) => group.numbers.length > 0);

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Organizacao rapida"
        title="Encontre seus numeros sem procurar demais"
        description="Filtre por status, abra o pedido vinculado e volte para a campanha com poucos toques."
        action={
          <Link href="/rifas" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Explorar campanhas
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar numeros">
        {filters.map((item) => (
          <Link
            key={item.value}
            href={item.value === "all" ? "/meus-numeros" : `/meus-numeros?status=${item.value}`}
            className={cn(
              "shrink-0 rounded-[var(--radius-sm)] border px-3 py-2 text-xs font-semibold transition",
              filter === item.value
                ? "border-primary/35 bg-primary/12 text-primary"
                : "border-border/80 bg-surface-raised/50 text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {filteredGroups.length === 0 ? (
        <AccountEmptyState
          icon={TicketCheck}
          title="Nenhum numero neste filtro"
          description="Seu historico de numeros reservados, pagos, expirados e cancelados sera organizado por rifa."
        />
      ) : (
        filteredGroups.map((group) => {
          const latest = [...group.numbers].sort((a, b) =>
            b.reservedAt.localeCompare(a.reservedAt),
          )[0];
          const orders = [...group.numbers.reduce((map, entry) => {
            const current = map.get(entry.orderId) ?? [];
            current.push(entry);
            map.set(entry.orderId, current);
            return map;
          }, new Map<string, typeof group.numbers>()).entries()].sort((a, b) =>
            b[1][0].reservedAt.localeCompare(a[1][0].reservedAt),
          );

          return (
            <Card key={group.raffle.id} className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-border/80 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      {group.raffle.title}
                    </h2>
                    <Badge variant={group.raffle.status === "active" ? "success" : "muted"}>
                      {raffleStatusLabels[group.raffle.status]}
                    </Badge>
                  </div>
                  {latest ? (
                    <p className="mt-2 flex items-center gap-2 text-xs text-muted">
                      <CalendarDays className="size-3.5" />
                      Ultima participacao em {formatDateTime(latest.reservedAt)}
                    </p>
                  ) : null}
                </div>
                {group.raffle.slug ? (
                  <Link
                    href={`/rifas/${group.raffle.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-emerald-300"
                  >
                    Ver rifa
                    <ExternalLink className="size-4" />
                  </Link>
                ) : null}
              </div>

              <div className="grid gap-4 border-b border-border/80 p-5 sm:grid-cols-3">
                <div className="rounded-[var(--radius-sm)] border border-border/80 bg-surface-raised/55 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">
                    Total de numeros
                  </p>
                  <p className="mt-2 text-xl font-bold text-foreground">
                    {group.numbers.length}
                  </p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-border/80 bg-surface-raised/55 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">
                    Confirmados
                  </p>
                  <p className="mt-2 text-xl font-bold text-success">
                    {group.numbers.filter((entry) => entry.status === "paid").length}
                  </p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-border/80 bg-surface-raised/55 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">
                    Em reserva
                  </p>
                  <p className="mt-2 text-xl font-bold text-warning">
                    {group.numbers.filter((entry) => entry.status === "reserved").length}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 p-5">
                {orders.map(([orderId, entries]) => (
                  <div key={orderId} className="grid gap-3">
                    <div className="flex flex-col gap-1 border-b border-border/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
                      <Link
                        href={`/pedido/${orderId}`}
                        className="truncate font-mono text-xs font-semibold text-primary hover:text-emerald-300"
                      >
                        Pedido {orderId}
                      </Link>
                      <span className="text-xs text-muted">
                        Reserva em {formatDateTime(entries[0].reservedAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {entries.map((entry) => (
                        <Link
                          key={`${entry.orderId}-${entry.id}`}
                          href={`/pedido/${entry.orderId}`}
                          title={`Abrir pedido ${entry.orderId}`}
                        >
                          <MyNumberBadge entry={entry} />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {group.raffle.slug && group.raffle.status === "active" ? (
                <div className="flex justify-end border-t border-border/80 p-4">
                  <Link
                    href={`/rifas/${group.raffle.slug}`}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    Comprar mais numeros
                  </Link>
                </div>
              ) : null}
            </Card>
          );
        })
      )}
    </div>
  );
}

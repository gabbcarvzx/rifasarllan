import { CircleDollarSign, Clock3, Hash, TicketCheck, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { RaffleNumberStats } from "@/app/actions/raffle-numbers";

type NumberStatsPreviewProps = {
  stats: RaffleNumberStats;
};

const items = [
  {
    key: "total",
    label: "Total",
    icon: Hash,
    className: "text-foreground",
  },
  {
    key: "available",
    label: "Disponiveis",
    icon: TicketCheck,
    className: "text-primary",
  },
  {
    key: "reserved",
    label: "Reservados",
    icon: Clock3,
    className: "text-info",
  },
  {
    key: "paid",
    label: "Pagos",
    icon: CircleDollarSign,
    className: "text-accent",
  },
  {
    key: "cancelled",
    label: "Cancelados",
    icon: XCircle,
    className: "text-muted",
  },
] as const;

export function NumberStatsPreview({ stats }: NumberStatsPreviewProps) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Preview estatistico dos numeros
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Leitura operacional da grade atual. Gerenciamento manual de numeros
            fica para etapas futuras.
          </p>
        </div>
        {stats.error ? (
          <span className="rounded-full border border-danger/30 bg-danger/12 px-3 py-1 text-xs font-semibold text-rose-100">
            Erro ao carregar
          </span>
        ) : null}
      </div>

      {stats.error ? (
        <p className="mt-4 rounded-lg border border-danger/25 bg-danger/12 p-3 text-sm leading-6 text-rose-100">
          {stats.error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const value = stats[item.key];

          return (
            <div
              key={item.key}
              className="rounded-lg border border-white/10 bg-black/18 p-4"
            >
              <Icon className={`mb-3 size-5 ${item.className}`} />
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {value.toLocaleString("pt-BR")}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

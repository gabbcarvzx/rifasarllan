import {
  Banknote,
  CircleCheckBig,
  Clock3,
  TicketCheck,
  Tickets,
  UsersRound,
  Zap,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { formatCurrency } from "@/lib/format";
import type { AdminDashboardStats } from "@/types/dashboard";

export function DashboardSummaryCards({
  stats,
}: {
  stats: AdminDashboardStats;
}) {
  const cards = [
    {
      label: "Rifas totais",
      value: stats.summary.total_raffles.toLocaleString("pt-BR"),
      helper: `${stats.summary.draft_raffles} em rascunho`,
      trend: "Portfolio",
      icon: Tickets,
    },
    {
      label: "Rifas ativas",
      value: stats.summary.active_raffles.toLocaleString("pt-BR"),
      helper: `${stats.summary.paused_raffles} pausadas`,
      trend: "Ao vivo",
      icon: Zap,
    },
    {
      label: "Participantes / pedidos",
      value: `${stats.summary.participants.toLocaleString("pt-BR")} / ${stats.summary.total_orders.toLocaleString("pt-BR")}`,
      helper: "Pessoas unicas e reservas",
      trend: "Demanda",
      icon: UsersRound,
    },
    {
      label: "Numeros reservados",
      value: stats.numbers.reserved.toLocaleString("pt-BR"),
      helper: `${stats.orders.pending} pedidos pendentes`,
      trend: "Em aberto",
      icon: Clock3,
    },
    {
      label: "Numeros pagos",
      value: stats.numbers.paid.toLocaleString("pt-BR"),
      helper: `${stats.orders.paid} pedidos confirmados`,
      trend: "Confirmados",
      icon: CircleCheckBig,
    },
    {
      label: "Valor reservado",
      value: formatCurrency(stats.revenue.reserved),
      helper: "Pedidos ainda pendentes",
      trend: "Pipeline",
      icon: Banknote,
    },
    {
      label: "Potencial total",
      value: formatCurrency(stats.revenue.potential),
      helper: "Numeros x preco unitario",
      trend: "Capacidade",
      icon: TicketCheck,
    },
  ];

  return (
    <section aria-labelledby="dashboard-summary-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Resumo geral
          </p>
          <h2
            id="dashboard-summary-title"
            className="mt-2 text-xl font-bold text-foreground"
          >
            Pulso da operacao
          </h2>
        </div>
        <p className="hidden text-xs text-muted sm:block">
          Atualizado em tempo real
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}

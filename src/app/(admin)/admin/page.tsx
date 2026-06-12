import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck2,
  CircleCheckBig,
  ClipboardList,
  CircleDollarSign,
  PauseCircle,
  Plus,
  Settings,
  TicketCheck,
} from "lucide-react";
import { getAdminRaffles } from "@/app/actions/raffles";
import { PageHeader } from "@/components/admin/page-header";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Raffle } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
};

function getPotentialRevenue(raffles: Raffle[]) {
  return raffles.reduce(
    (total, raffle) => total + raffle.total_numbers * raffle.price_per_number,
    0,
  );
}

export default async function AdminDashboardPage() {
  const result = await getAdminRaffles();
  const raffles = result.data;
  const activeCount = raffles.filter((raffle) => raffle.status === "active").length;
  const pausedCount = raffles.filter((raffle) => raffle.status === "paused").length;
  const finishedCount = raffles.filter(
    (raffle) => raffle.status === "finished",
  ).length;
  const potentialRevenue = getPotentialRevenue(raffles);
  const upcomingRaffles = raffles
    .filter((raffle) => raffle.draw_date)
    .sort(
      (first, second) =>
        new Date(first.draw_date || 0).getTime() -
        new Date(second.draw_date || 0).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Total de rifas",
      value: raffles.length.toLocaleString("pt-BR"),
      helper: "Campanhas do tenant",
      trend: "Real",
      icon: TicketCheck,
    },
    {
      label: "Rifas ativas",
      value: activeCount.toLocaleString("pt-BR"),
      helper: "Visiveis na vitrine",
      trend: "Publicas",
      icon: CalendarCheck2,
    },
    {
      label: "Rifas pausadas",
      value: pausedCount.toLocaleString("pt-BR"),
      helper: "Ocultas da compra",
      trend: "Operacao",
      icon: PauseCircle,
    },
    {
      label: "Rifas finalizadas",
      value: finishedCount.toLocaleString("pt-BR"),
      helper: "Campanhas encerradas",
      trend: "Historico",
      icon: CircleCheckBig,
    },
    {
      label: "Potencial bruto",
      value: formatCurrency(potentialRevenue),
      helper: "Soma numeros x valor",
      trend: "Estimado",
      icon: CircleDollarSign,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Painel administrativo"
        title="Dashboard da operacao"
        description="Indicadores reais do CRUD de rifas por tenant. Pagamentos, reservas e receita confirmada entram em etapas futuras."
        actions={
          <>
            <Link
              href="/admin/configuracoes"
              className={buttonVariants({ variant: "secondary" })}
            >
              <Settings className="size-4" />
              Configuracoes
            </Link>
            <Link href="/admin/rifas/nova" className={buttonVariants()}>
              <Plus className="size-4" />
              Nova rifa
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.76fr_1.24fr]">
        <Card className="p-5">
          <Badge variant="default">Acoes rapidas</Badge>
          <div className="mt-5 grid gap-3">
            {[
              {
                href: "/admin/rifas/nova",
                title: "Criar nova rifa",
                description: "Abrir formulario conectado ao Supabase.",
                icon: Plus,
              },
              {
                href: "/admin/rifas",
                title: "Gerenciar rifas",
                description: "Editar status, datas, precos e numeracao.",
                icon: ClipboardList,
              },
              {
                href: "/rifas",
                title: "Ver area publica",
                description: "Conferir somente campanhas ativas.",
                icon: ArrowUpRight,
              },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-primary/35 hover:bg-primary/10"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/12 text-accent">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block font-semibold text-foreground">
                      {action.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {action.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
            <div>
              <Badge variant="success">Proximas rifas</Badge>
              <h2 className="mt-3 text-xl font-bold text-foreground">
                Agenda de sorteios
              </h2>
            </div>
            <Link
              href="/admin/rifas"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Ver tudo
            </Link>
          </div>

          {upcomingRaffles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.14em] text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Rifa</th>
                    <th className="px-5 py-3 font-semibold">Data</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Potencial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {upcomingRaffles.map((raffle) => (
                    <tr key={raffle.id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-foreground">
                          {raffle.title}
                        </p>
                        <p className="mt-1 font-mono text-xs text-muted">
                          {raffle.slug}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {formatDate(raffle.draw_date)}
                      </td>
                      <td className="px-5 py-4">
                        <RaffleStatusBadge status={raffle.status} />
                      </td>
                      <td className="px-5 py-4 font-semibold text-accent">
                        {formatCurrency(
                          raffle.total_numbers * raffle.price_per_number,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                title="Sem sorteios agendados"
                description="Crie ou edite uma rifa com data de sorteio para preencher esta agenda."
              />
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="info">Status finalizadas</Badge>
            <h2 className="mt-3 text-xl font-bold text-foreground">
              {finishedCount.toLocaleString("pt-BR")} rifas encerradas
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Este numero representa somente campanhas marcadas como encerradas.
              Sorteio, vencedores e financeiro confirmado entram nas proximas
              etapas do produto.
            </p>
          </div>
          <TicketCheck className="size-10 text-primary" />
        </div>
      </Card>
    </div>
  );
}

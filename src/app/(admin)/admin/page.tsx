import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Plus, Settings } from "lucide-react";
import { getAdminDashboardStats } from "@/app/actions/dashboard";
import { AdminAlerts } from "@/components/admin/dashboard/admin-alerts";
import { DashboardEmptyState } from "@/components/admin/dashboard/dashboard-empty-state";
import { DashboardSummaryCards } from "@/components/admin/dashboard/dashboard-summary-cards";
import { RaffleOccupancyCard } from "@/components/admin/dashboard/raffle-occupancy-card";
import { RecentOrdersTable } from "@/components/admin/dashboard/recent-orders-table";
import { RevenueOverview } from "@/components/admin/dashboard/revenue-overview";
import { TopRaffles } from "@/components/admin/dashboard/top-raffles";
import { UpcomingDraws } from "@/components/admin/dashboard/upcoming-draws";
import { PageHeader } from "@/components/admin/page-header";
import { AuthMessage } from "@/components/auth/auth-message";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard administrativo",
};

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardStats();
  const stats = result.data;
  const operationalRaffles = stats
    ? stats.raffles.filter((raffle) =>
        ["active", "paused"].includes(raffle.status),
      )
    : [];
  const occupancyRaffles = (
    operationalRaffles.length > 0 ? operationalRaffles : stats?.raffles ?? []
  ).slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Centro de operacoes"
        title="Dashboard administrativo"
        description="Acompanhe campanhas, ocupacao, reservas e prioridades do tenant em uma unica visao."
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

      <AuthMessage error={result.error} />

      {!stats || stats.summary.total_raffles === 0 ? (
        <DashboardEmptyState error={!stats} />
      ) : (
        <>
          <DashboardSummaryCards stats={stats} />
          <RevenueOverview revenue={stats.revenue} />

          <section aria-labelledby="raffle-occupancy-title">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Ocupacao das rifas
                </p>
                <h2
                  id="raffle-occupancy-title"
                  className="mt-2 text-xl font-bold text-foreground"
                >
                  Campanhas em movimento
                </h2>
              </div>
              <Link
                href="/admin/rifas"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Ver todas
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {occupancyRaffles.map((raffle) => (
                <RaffleOccupancyCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            <UpcomingDraws raffles={stats.upcoming_draws} />
            <AdminAlerts alerts={stats.alerts} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
            <TopRaffles raffles={stats.top_raffles} />
            <RecentOrdersTable orders={stats.recent_orders} />
          </div>
        </>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyOrders, getMyProfile } from "@/app/actions/account";
import { AccountLayout } from "@/components/account/account-layout";
import { MyOrdersList } from "@/components/account/my-orders-list";
import { Alert } from "@/components/ui/alert";
import { StatCard } from "@/components/ui/stat-card";
import { getAccountOrderMetrics } from "@/lib/account/dashboard-metrics";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Meus Pedidos",
};

export const dynamic = "force-dynamic";

export default async function MeusPedidosPage() {
  const [profileResult, ordersResult] = await Promise.all([
    getMyProfile(),
    getMyOrders(),
  ]);

  if (!profileResult.data) {
    redirect("/login?error=Perfil%20nao%20encontrado.");
  }

  const metrics = getAccountOrderMetrics(ordersResult.data);

  return (
    <AccountLayout
      profile={profileResult.data}
      title="Meus pedidos"
      description="Acompanhe reservas, valores, prazos e o historico completo das suas participacoes."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pedidos totais"
          value={String(metrics.totalOrders)}
          hint={`${metrics.uniqueCampaigns} campanha(s) no historico`}
        />
        <StatCard
          label="Pagos"
          value={String(metrics.paidOrders)}
          hint={`Confirmado: ${formatCurrency(metrics.totalSpent)}`}
        />
        <StatCard
          label="Pendentes"
          value={String(metrics.pendingOrders)}
          hint={
            metrics.nextReservationExpiry
              ? `Prazo mais proximo: ${formatDateTime(metrics.nextReservationExpiry)}`
              : "Nenhuma reserva em aberto agora"
          }
        />
        <StatCard
          label="Inativos"
          value={String(metrics.inactiveOrders)}
          hint="Expirados, cancelados ou reembolsados"
        />
      </div>

      {ordersResult.error ? (
        <Alert
          tone="warning"
          title="Nao foi possivel carregar todos os pedidos"
          description={ordersResult.error}
          className="mb-4"
        />
      ) : null}
      <MyOrdersList orders={ordersResult.data} />
    </AccountLayout>
  );
}

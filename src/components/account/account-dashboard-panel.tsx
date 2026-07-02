import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ReceiptText,
  TicketCheck,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type {
  AccountNumberMetrics,
  AccountOrderMetrics,
} from "@/lib/account/dashboard-metrics";

type AccountDashboardPanelProps = {
  orderMetrics: AccountOrderMetrics;
  numberMetrics: AccountNumberMetrics;
};

export function AccountDashboardPanel({
  orderMetrics,
  numberMetrics,
}: AccountDashboardPanelProps) {
  const hasActivity =
    orderMetrics.totalOrders > 0 || numberMetrics.totalNumbers > 0;

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden">
        <div className="border-b border-border/80 px-5 py-6 sm:px-6">
          <SectionHeading
            eyebrow="Dashboard pessoal"
            title="Sua conta em um relance"
            description="Veja o que esta confirmado, o que ainda depende de pagamento e o caminho mais rapido para continuar participando."
            action={
              <Link href="/rifas" className={buttonVariants({ size: "sm" })}>
                Ver campanhas ativas
                <ArrowRight className="size-4" />
              </Link>
            }
          />
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4 sm:px-6 sm:pb-6">
          <StatCard
            label="Pedidos pagos"
            value={String(orderMetrics.paidOrders)}
            hint={`Total confirmado: ${formatCurrency(orderMetrics.totalSpent)}`}
            icon={CheckCircle2}
          />
          <StatCard
            label="Reservas em aberto"
            value={String(orderMetrics.pendingOrders)}
            hint={
              orderMetrics.pendingOrders > 0
                ? `Aguardando pagamento: ${formatCurrency(orderMetrics.pendingAmount)}`
                : "Nenhuma reserva pendente agora"
            }
            icon={Clock3}
          />
          <StatCard
            label="Numeros pagos"
            value={String(numberMetrics.paidNumbers)}
            hint={`${numberMetrics.campaignsWithNumbers} campanha(s) no seu historico`}
            icon={TicketCheck}
          />
          <StatCard
            label="Pedidos totais"
            value={String(orderMetrics.totalOrders)}
            hint={`${orderMetrics.uniqueCampaigns} campanha(s) diferentes`}
            icon={ReceiptText}
          />
        </div>
      </Card>

      {hasActivity ? (
        <Alert
          tone={orderMetrics.pendingOrders > 0 ? "warning" : "success"}
          title={
            orderMetrics.pendingOrders > 0
              ? "Voce ainda tem reserva aguardando pagamento"
              : "Sua area esta organizada e com historico confirmado"
          }
          description={
            orderMetrics.pendingOrders > 0
              ? orderMetrics.nextReservationExpiry
                ? `Finalize o pagamento antes de ${formatDateTime(orderMetrics.nextReservationExpiry)} para nao perder seus numeros.`
                : "Finalize o pagamento das reservas pendentes para manter seus numeros."
              : "Use seus pedidos e numeros para revisar comprovantes, acompanhar sorteios e voltar para novas campanhas com menos atrito."
          }
          action={
            orderMetrics.pendingOrders > 0 ? (
              <Link
                href="/meus-pedidos"
                className={buttonVariants({ size: "sm", variant: "secondary" })}
              >
                Revisar pedidos
              </Link>
            ) : (
              <Link
                href="/meus-numeros"
                className={buttonVariants({ size: "sm", variant: "secondary" })}
              >
                Ver meus numeros
              </Link>
            )
          }
        />
      ) : (
        <Alert
          tone="info"
          title="Sua conta esta pronta para participar"
          description="Assim que voce reservar seus primeiros numeros, seus pedidos, comprovantes e historico ficarao centralizados aqui."
          action={
            <Link href="/rifas" className={buttonVariants({ size: "sm" })}>
              Escolher uma campanha
            </Link>
          }
        />
      )}
    </div>
  );
}

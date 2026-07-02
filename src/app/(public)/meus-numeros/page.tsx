import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyNumbers, getMyProfile } from "@/app/actions/account";
import { AccountLayout } from "@/components/account/account-layout";
import {
  MyNumbersList,
  type NumberFilter,
} from "@/components/account/my-numbers-list";
import { Alert } from "@/components/ui/alert";
import { StatCard } from "@/components/ui/stat-card";
import { getAccountNumberMetrics } from "@/lib/account/dashboard-metrics";

export const metadata: Metadata = {
  title: "Meus Numeros",
};

export const dynamic = "force-dynamic";

type MeusNumerosPageProps = {
  searchParams: Promise<{ status?: string }>;
};

const validFilters = new Set<NumberFilter>([
  "all",
  "reserved",
  "paid",
  "inactive",
]);

export default async function MeusNumerosPage({
  searchParams,
}: MeusNumerosPageProps) {
  const params = await searchParams;
  const requestedFilter = params.status as NumberFilter | undefined;
  const filter =
    requestedFilter && validFilters.has(requestedFilter)
      ? requestedFilter
      : "all";
  const [profileResult, numbersResult] = await Promise.all([
    getMyProfile(),
    getMyNumbers(),
  ]);

  if (!profileResult.data) {
    redirect("/login?error=Perfil%20nao%20encontrado.");
  }

  const metrics = getAccountNumberMetrics(numbersResult.data);

  return (
    <AccountLayout
      profile={profileResult.data}
      title="Meus numeros"
      description="Consulte seus numeros por rifa e filtre rapidamente entre reservas, pagamentos e historico inativo."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Numeros totais"
          value={String(metrics.totalNumbers)}
          hint={`${metrics.campaignsWithNumbers} campanha(s) no seu historico`}
        />
        <StatCard
          label="Confirmados"
          value={String(metrics.paidNumbers)}
          hint="Numeros com pagamento identificado"
        />
        <StatCard
          label="Em reserva"
          value={String(metrics.reservedNumbers)}
          hint="Dependem de conclusao do pagamento"
        />
        <StatCard
          label="Campanhas ativas"
          value={String(metrics.activeCampaigns)}
          hint="Rifas onde voce ainda pode ampliar participacao"
        />
      </div>

      {numbersResult.error ? (
        <Alert
          tone="warning"
          title="Nao foi possivel carregar todos os numeros"
          description={numbersResult.error}
          className="mb-4"
        />
      ) : null}
      <MyNumbersList groups={numbersResult.data} filter={filter} />
    </AccountLayout>
  );
}

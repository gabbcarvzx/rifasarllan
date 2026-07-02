import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getMyNumbers, getMyOrders, getMyProfile } from "@/app/actions/account";
import { AccountDashboardPanel } from "@/components/account/account-dashboard-panel";
import { AccountLayout } from "@/components/account/account-layout";
import { ProfileCard } from "@/components/account/profile-card";
import { ProfileForm } from "@/components/account/profile-form";
import { Alert } from "@/components/ui/alert";
import { StatCard } from "@/components/ui/stat-card";
import {
  getAccountNumberMetrics,
  getAccountOrderMetrics,
} from "@/lib/account/dashboard-metrics";

export const metadata: Metadata = {
  title: "Minha Conta",
};

export const dynamic = "force-dynamic";

export default async function MinhaContaPage() {
  const [profileResult, ordersResult, numbersResult] = await Promise.all([
    getMyProfile(),
    getMyOrders(),
    getMyNumbers(),
  ]);
  const profile = profileResult.data;

  if (!profile) {
    redirect("/login?error=Perfil%20nao%20encontrado.");
  }

  const orderMetrics = getAccountOrderMetrics(ordersResult.data);
  const numberMetrics = getAccountNumberMetrics(numbersResult.data);

  return (
    <AccountLayout
      profile={profile}
      title="Minha conta"
      description="Gerencie seus dados, acompanhe o status das participacoes e mantenha seus proximos passos sempre claros."
    >
      <div className="grid gap-6">
        {ordersResult.error || numbersResult.error ? (
          <Alert
            tone="warning"
            title="Parte do historico nao carregou agora"
            description={ordersResult.error ?? numbersResult.error}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <AccountDashboardPanel
            orderMetrics={orderMetrics}
            numberMetrics={numberMetrics}
          />
          <StatCard
            label="Confianca da conta"
            value="Area protegida"
            hint="Seus pedidos, numeros e comprovantes ficam vinculados ao seu acesso autenticado."
            icon={ShieldCheck}
            className="h-full justify-center"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <ProfileCard profile={profile} />
          <ProfileForm profile={profile} />
        </div>
      </div>
    </AccountLayout>
  );
}

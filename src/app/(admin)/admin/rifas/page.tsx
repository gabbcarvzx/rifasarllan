import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminRaffleAnalytics } from "@/app/actions/dashboard";
import { AdminRafflesTable } from "@/components/admin/raffles/admin-raffles-table";
import { PageHeader } from "@/components/admin/page-header";
import { AuthMessage } from "@/components/auth/auth-message";
import { buttonVariants } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Rifas",
};

type AdminRifasPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function AdminRifasPage({
  searchParams,
}: AdminRifasPageProps) {
  const [{ error, success }, result] = await Promise.all([
    searchParams,
    getAdminRaffleAnalytics(),
  ]);
  const raffles = result.data;
  const active = raffles.filter((raffle) => raffle.status === "active").length;
  const withImage = raffles.filter(
    (raffle) => raffle.main_image_url || raffle.image_count > 0,
  ).length;
  const potential = raffles.reduce(
    (total, raffle) => total + raffle.potential_revenue,
    0,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Gestao de campanhas"
        title="Rifas"
        description="Compare ocupacao, numeros reservados, confirmados e potencial de cada campanha do tenant."
        actions={
          <Link href="/admin/rifas/nova" className={buttonVariants()}>
            <Plus className="size-4" />
            Nova rifa
          </Link>
        }
      />

      <AuthMessage error={error || result.error} success={success} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rifas cadastradas"
          value={String(raffles.length)}
          hint="Carteira total do tenant"
        />
        <StatCard
          label="Ativas"
          value={String(active)}
          hint="Campanhas em captacao agora"
        />
        <StatCard
          label="Com imagem"
          value={`${withImage}/${raffles.length || 0}`}
          hint="Prontas para comunicacao visual"
        />
        <StatCard
          label="Potencial bruto"
          value={formatCurrency(potential)}
          hint="Soma da capacidade comercial"
        />
      </div>

      <AdminRafflesTable raffles={raffles} />
    </div>
  );
}

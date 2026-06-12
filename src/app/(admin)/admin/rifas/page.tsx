import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminRaffles } from "@/app/actions/raffles";
import { AdminRafflesTable } from "@/components/admin/raffles/admin-raffles-table";
import { PageHeader } from "@/components/admin/page-header";
import { AuthMessage } from "@/components/auth/auth-message";
import { buttonVariants } from "@/components/ui/button";

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
    getAdminRaffles(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Gestao de campanhas"
        title="Rifas"
        description="CRUD real conectado ao Supabase, com isolamento por tenant, status operacional e geracao automatica de numeros."
        actions={
          <Link href="/admin/rifas/nova" className={buttonVariants()}>
            <Plus className="size-4" />
            Nova rifa
          </Link>
        }
      />

      <AuthMessage error={error || result.error} success={success} />
      <AdminRafflesTable raffles={result.data} />
    </div>
  );
}

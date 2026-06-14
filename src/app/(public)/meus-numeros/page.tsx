import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { getMyNumbers, getMyProfile } from "@/app/actions/account";
import { AccountLayout } from "@/components/account/account-layout";
import {
  MyNumbersList,
  type NumberFilter,
} from "@/components/account/my-numbers-list";

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

  return (
    <AccountLayout
      profile={profileResult.data}
      title="Meus numeros"
      description="Consulte seus numeros por rifa e filtre rapidamente entre reservas, pagamentos e historico inativo."
    >
      {numbersResult.error ? (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {numbersResult.error}
        </div>
      ) : null}
      <MyNumbersList groups={numbersResult.data} filter={filter} />
    </AccountLayout>
  );
}

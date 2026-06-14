import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { getMyOrders, getMyProfile } from "@/app/actions/account";
import { AccountLayout } from "@/components/account/account-layout";
import { MyOrdersList } from "@/components/account/my-orders-list";

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

  return (
    <AccountLayout
      profile={profileResult.data}
      title="Meus pedidos"
      description="Acompanhe reservas, valores, prazos e o historico completo das suas participacoes."
    >
      {ordersResult.error ? (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {ordersResult.error}
        </div>
      ) : null}
      <MyOrdersList orders={ordersResult.data} />
    </AccountLayout>
  );
}

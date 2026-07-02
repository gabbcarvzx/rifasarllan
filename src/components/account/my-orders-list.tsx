import Link from "next/link";
import { ArrowRight, ReceiptText } from "lucide-react";
import { AccountEmptyState } from "@/components/account/account-empty-state";
import { MyOrderCard } from "@/components/account/my-order-card";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MyOrder } from "@/types/account";

export function MyOrdersList({ orders }: { orders: MyOrder[] }) {
  if (orders.length === 0) {
    return (
      <AccountEmptyState
        icon={ReceiptText}
        title="Nenhum pedido ainda"
        description="Quando voce reservar numeros, seus pedidos e respectivos status aparecerao aqui."
        action={
          <Link href="/rifas" className={buttonVariants()}>
            Explorar rifas
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      <SectionHeading
        eyebrow="Historico e andamento"
        title="Seus pedidos recentes"
        description="Acompanhe o status de cada reserva, revise valores e volte rapidamente para a campanha quando quiser comprar mais."
        action={
          <Link href="/rifas" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Ver novas campanhas
            <ArrowRight className="size-4" />
          </Link>
        }
      />
      {orders.map((order) => (
        <MyOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

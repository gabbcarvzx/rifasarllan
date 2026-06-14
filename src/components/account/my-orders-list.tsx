import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { AccountEmptyState } from "@/components/account/account-empty-state";
import { MyOrderCard } from "@/components/account/my-order-card";
import { buttonVariants } from "@/components/ui/button";
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
      {orders.map((order) => (
        <MyOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

import Link from "next/link";
import { Plus, Tickets } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function DashboardEmptyState({ error = false }: { error?: boolean }) {
  return (
    <EmptyState
      icon={Tickets}
      title={
        error
          ? "Indicadores temporariamente indisponiveis"
          : "Sua operacao comeca pela primeira rifa"
      }
      description={
        error
          ? "Confira se a migration do dashboard foi aplicada e tente novamente."
          : "Cadastre uma campanha para liberar indicadores de ocupacao, pedidos, agenda e alertas administrativos."
      }
      action={error ? undefined : (
        <Link href="/admin/rifas/nova" className={buttonVariants()}>
          <Plus className="size-4" />
          Criar primeira rifa
        </Link>
      )}
    />
  );
}

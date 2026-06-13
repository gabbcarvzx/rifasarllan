import { Gift } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function PrizeEmptyState() {
  return (
    <EmptyState
      icon={Gift}
      title="Nenhum premio cadastrado"
      description="Adicione o premio principal e, se houver, premios secundarios. Eles aparecem na pagina publica da rifa em ordem de posicao."
      className="min-h-64"
    />
  );
}

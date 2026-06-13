import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/types/database";

const labels: Record<PaymentStatus, string> = {
  pending: "Aguardando pagamento",
  paid: "Pagamento confirmado",
  failed: "Falha ou vencido",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const variants: Record<
  PaymentStatus,
  "default" | "success" | "warning" | "danger" | "muted"
> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  cancelled: "muted",
  refunded: "muted",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

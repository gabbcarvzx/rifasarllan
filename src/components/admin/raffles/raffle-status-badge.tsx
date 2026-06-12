import { Badge } from "@/components/ui/badge";
import type { RaffleStatus } from "@/types/database";
import type { ComponentProps } from "react";

const statusMap: Record<
  RaffleStatus,
  { label: string; variant: ComponentProps<typeof Badge>["variant"] }
> = {
  draft: { label: "Rascunho", variant: "muted" },
  active: { label: "Ativa", variant: "success" },
  paused: { label: "Pausada", variant: "warning" },
  finished: { label: "Encerrada", variant: "info" },
  cancelled: { label: "Cancelada", variant: "danger" },
};

export function getRaffleStatusLabel(status: RaffleStatus) {
  return statusMap[status].label;
}

export function RaffleStatusBadge({ status }: { status: RaffleStatus }) {
  const config = statusMap[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

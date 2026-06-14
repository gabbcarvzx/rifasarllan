import type { BadgeProps } from "@/components/ui/badge";
import type { MyNumberStatus } from "@/types/account";
import type { OrderStatus, RaffleStatus } from "@/types/database";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  expired: "Expirado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const orderStatusVariants: Record<
  OrderStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  pending: "warning",
  paid: "success",
  expired: "danger",
  cancelled: "muted",
  refunded: "muted",
};

export const raffleStatusLabels: Record<RaffleStatus, string> = {
  draft: "Rascunho",
  active: "Ativa",
  paused: "Pausada",
  finished: "Encerrada",
  cancelled: "Cancelada",
};

export const numberStatusLabels: Record<MyNumberStatus, string> = {
  reserved: "Reservado",
  paid: "Pago",
  expired: "Expirado",
  cancelled: "Cancelado",
};

export const numberStatusVariants: Record<
  MyNumberStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  reserved: "warning",
  paid: "success",
  expired: "danger",
  cancelled: "muted",
};

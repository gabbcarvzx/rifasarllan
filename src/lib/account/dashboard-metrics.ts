import type { MyNumbersGroup, MyOrder } from "@/types/account";

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export type AccountOrderMetrics = {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  inactiveOrders: number;
  uniqueCampaigns: number;
  totalSpent: number;
  pendingAmount: number;
  nextReservationExpiry: string | null;
};

export type AccountNumberMetrics = {
  totalNumbers: number;
  paidNumbers: number;
  reservedNumbers: number;
  inactiveNumbers: number;
  campaignsWithNumbers: number;
  activeCampaigns: number;
};

export function getAccountOrderMetrics(orders: MyOrder[]): AccountOrderMetrics {
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const paidOrders = orders.filter((order) => order.status === "paid");
  const inactiveOrders = orders.filter((order) =>
    ["expired", "cancelled", "refunded"].includes(order.status),
  );
  const nextReservationExpiry = pendingOrders
    .map((order) => order.reservedUntil)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => left.localeCompare(right))[0] ?? null;

  return {
    totalOrders: orders.length,
    pendingOrders: pendingOrders.length,
    paidOrders: paidOrders.length,
    inactiveOrders: inactiveOrders.length,
    uniqueCampaigns: new Set(orders.map((order) => order.raffle.id)).size,
    totalSpent: sum(paidOrders.map((order) => order.amount)),
    pendingAmount: sum(pendingOrders.map((order) => order.amount)),
    nextReservationExpiry,
  };
}

export function getAccountNumberMetrics(
  groups: MyNumbersGroup[],
): AccountNumberMetrics {
  const allNumbers = groups.flatMap((group) => group.numbers);

  return {
    totalNumbers: allNumbers.length,
    paidNumbers: allNumbers.filter((entry) => entry.status === "paid").length,
    reservedNumbers: allNumbers.filter((entry) => entry.status === "reserved")
      .length,
    inactiveNumbers: allNumbers.filter((entry) =>
      ["expired", "cancelled"].includes(entry.status),
    ).length,
    campaignsWithNumbers: groups.length,
    activeCampaigns: groups.filter((group) => group.raffle.status === "active")
      .length,
  };
}

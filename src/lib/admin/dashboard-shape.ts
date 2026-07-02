import type { AdminDashboardStats } from "@/types/dashboard";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function isString(value: unknown) {
  return typeof value === "string";
}

function hasNumberFields(
  value: unknown,
  fields: string[],
): value is Record<string, number> {
  if (!isRecord(value)) {
    return false;
  }

  return fields.every((field) => isFiniteNumber(value[field]));
}

function isRaffleAnalytics(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.title) &&
    isString(value.slug) &&
    isString(value.status) &&
    isFiniteNumber(value.total_numbers) &&
    isFiniteNumber(value.reserved_numbers) &&
    isFiniteNumber(value.paid_numbers) &&
    isFiniteNumber(value.occupied_numbers) &&
    isFiniteNumber(value.occupancy_percentage) &&
    isFiniteNumber(value.potential_revenue) &&
    isFiniteNumber(value.prize_count) &&
    isFiniteNumber(value.image_count)
  );
}

function isRecentOrder(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.raffle_id) &&
    isString(value.raffle_title) &&
    isFiniteNumber(value.amount) &&
    isString(value.status) &&
    isString(value.created_at) &&
    isFiniteNumber(value.number_count)
  );
}

function isAlert(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.alert_key) &&
    isString(value.kind) &&
    isString(value.severity) &&
    isString(value.title) &&
    isString(value.description) &&
    isString(value.href) &&
    isString(value.created_at) &&
    isFiniteNumber(value.priority)
  );
}

export function parseAdminDashboardStats(
  value: unknown,
): AdminDashboardStats | null {
  if (!isRecord(value)) {
    return null;
  }

  const summary = value.summary;
  const numbers = value.numbers;
  const orders = value.orders;
  const revenue = value.revenue;
  const raffles = value.raffles;
  const upcomingDraws = value.upcoming_draws;
  const topRaffles = value.top_raffles;
  const recentOrders = value.recent_orders;
  const alerts = value.alerts;

  if (
    !isString(value.generated_at) ||
    !hasNumberFields(summary, [
      "total_raffles",
      "active_raffles",
      "paused_raffles",
      "finished_raffles",
      "cancelled_raffles",
      "draft_raffles",
      "participants",
      "total_orders",
    ]) ||
    !hasNumberFields(numbers, [
      "total",
      "available",
      "reserved",
      "paid",
      "cancelled",
    ]) ||
    !hasNumberFields(orders, [
      "total",
      "pending",
      "paid",
      "expired",
      "cancelled",
      "refunded",
    ]) ||
    !hasNumberFields(revenue, ["potential", "reserved", "confirmed"]) ||
    !Array.isArray(raffles) ||
    !Array.isArray(upcomingDraws) ||
    !Array.isArray(topRaffles) ||
    !Array.isArray(recentOrders) ||
    !Array.isArray(alerts)
  ) {
    return null;
  }

  if (
    !raffles.every(isRaffleAnalytics) ||
    !upcomingDraws.every(isRaffleAnalytics) ||
    !topRaffles.every(isRaffleAnalytics) ||
    !recentOrders.every(isRecentOrder) ||
    !alerts.every(isAlert)
  ) {
    return null;
  }

  return value as AdminDashboardStats;
}

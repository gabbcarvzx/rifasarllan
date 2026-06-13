import type {
  ISODateTime,
  OrderStatus,
  Raffle,
} from "@/types/database";

export type AdminDashboardSummary = {
  total_raffles: number;
  active_raffles: number;
  paused_raffles: number;
  finished_raffles: number;
  cancelled_raffles: number;
  draft_raffles: number;
  participants: number;
  total_orders: number;
};

export type AdminDashboardNumbers = {
  total: number;
  available: number;
  reserved: number;
  paid: number;
  cancelled: number;
};

export type AdminDashboardOrders = {
  total: number;
  pending: number;
  paid: number;
  expired: number;
  cancelled: number;
  refunded: number;
};

export type AdminDashboardRevenue = {
  potential: number;
  reserved: number;
  confirmed: number;
};

export type AdminRaffleAnalytics = Raffle & {
  generated_numbers: number;
  available_numbers: number;
  reserved_numbers: number;
  paid_numbers: number;
  cancelled_numbers: number;
  occupied_numbers: number;
  occupancy_percentage: number;
  order_count: number;
  pending_orders: number;
  paid_orders: number;
  reserved_value: number;
  confirmed_value: number;
  potential_revenue: number;
  prize_count: number;
  image_count: number;
};

export type AdminRecentOrder = {
  id: string;
  raffle_id: string;
  raffle_title: string;
  raffle_slug: string;
  customer_name: string | null;
  customer_email: string | null;
  amount: number;
  status: OrderStatus;
  created_at: ISODateTime;
  number_count: number;
  reserved_until: ISODateTime | null;
};

export type AdminDashboardAlert = {
  alert_key: string;
  kind:
    | "missing_prize"
    | "missing_image"
    | "missing_draw_date"
    | "low_occupancy"
    | "reservation_expiring";
  severity: "info" | "warning" | "danger";
  title: string;
  description: string;
  href: string;
  created_at: ISODateTime;
  priority: number;
};

export type AdminDashboardStats = {
  generated_at: ISODateTime;
  summary: AdminDashboardSummary;
  numbers: AdminDashboardNumbers;
  orders: AdminDashboardOrders;
  revenue: AdminDashboardRevenue;
  raffles: AdminRaffleAnalytics[];
  upcoming_draws: AdminRaffleAnalytics[];
  top_raffles: AdminRaffleAnalytics[];
  recent_orders: AdminRecentOrder[];
  alerts: AdminDashboardAlert[];
};

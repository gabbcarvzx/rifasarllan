"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { parseAdminDashboardStats } from "@/lib/admin/dashboard-shape";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminDashboardStats,
  AdminRaffleAnalytics,
  AdminRecentOrder,
} from "@/types/dashboard";

type DashboardResult = {
  data: AdminDashboardStats | null;
  error?: string;
};

type RaffleAnalyticsResult = {
  data: AdminRaffleAnalytics[];
  error?: string;
};

type RecentOrdersResult = {
  data: AdminRecentOrder[];
  error?: string;
};

async function getDashboardScope() {
  const { profile } = await requireAdmin();

  if (!profile.tenant_id) {
    return null;
  }

  return { tenantId: profile.tenant_id };
}

function getDashboardErrorMessage(message?: string) {
  if (message?.includes("ADMIN_TENANT_ACCESS_DENIED")) {
    return "Seu usuario nao possui acesso aos indicadores deste tenant.";
  }

  return "Nao foi possivel carregar os indicadores administrativos agora.";
}

export async function getAdminDashboardStats(): Promise<DashboardResult> {
  const scope = await getDashboardScope();

  if (!scope) {
    return {
      data: null,
      error: "Seu perfil admin ainda nao esta vinculado a um tenant.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats", {
    p_tenant_id: scope.tenantId,
  });

  if (error || !data) {
    return {
      data: null,
      error: getDashboardErrorMessage(error?.message),
    };
  }

  const parsed = parseAdminDashboardStats(data);

  if (!parsed) {
    return {
      data: null,
      error: "Os indicadores administrativos retornaram em um formato inesperado.",
    };
  }

  return { data: parsed };
}

export async function getAdminRaffleAnalytics(): Promise<RaffleAnalyticsResult> {
  const result = await getAdminDashboardStats();

  return {
    data: result.data?.raffles ?? [],
    error: result.error,
  };
}

export async function getRecentOrders(): Promise<RecentOrdersResult> {
  const result = await getAdminDashboardStats();

  return {
    data: result.data?.recent_orders ?? [],
    error: result.error,
  };
}

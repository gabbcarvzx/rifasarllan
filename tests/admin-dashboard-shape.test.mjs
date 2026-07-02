import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAdminDashboardStats } from "../src/lib/admin/dashboard-shape.ts";

function makeValidStats() {
  return {
    generated_at: "2026-07-02T12:00:00.000Z",
    summary: {
      total_raffles: 1,
      active_raffles: 1,
      paused_raffles: 0,
      finished_raffles: 0,
      cancelled_raffles: 0,
      draft_raffles: 0,
      participants: 2,
      total_orders: 3,
    },
    numbers: {
      total: 100,
      available: 80,
      reserved: 10,
      paid: 10,
      cancelled: 0,
    },
    orders: {
      total: 3,
      pending: 1,
      paid: 2,
      expired: 0,
      cancelled: 0,
      refunded: 0,
    },
    revenue: {
      potential: 1000,
      reserved: 100,
      confirmed: 200,
    },
    raffles: [
      {
        id: "raffle-1",
        tenant_id: "tenant-1",
        title: "Rifa 1",
        slug: "rifa-1",
        short_description: null,
        description: null,
        rules: null,
        price_per_number: 10,
        total_numbers: 100,
        min_number: 1,
        max_number: 100,
        draw_date: null,
        status: "active",
        main_image_url: null,
        featured: false,
        created_by: "user-1",
        created_at: "2026-07-02T12:00:00.000Z",
        updated_at: "2026-07-02T12:00:00.000Z",
        generated_numbers: 100,
        available_numbers: 80,
        reserved_numbers: 10,
        paid_numbers: 10,
        cancelled_numbers: 0,
        occupied_numbers: 20,
        occupancy_percentage: 20,
        order_count: 3,
        pending_orders: 1,
        paid_orders: 2,
        reserved_value: 100,
        confirmed_value: 200,
        potential_revenue: 1000,
        prize_count: 1,
        image_count: 1,
      },
    ],
    upcoming_draws: [],
    top_raffles: [],
    recent_orders: [
      {
        id: "order-1",
        raffle_id: "raffle-1",
        raffle_title: "Rifa 1",
        raffle_slug: "rifa-1",
        customer_name: "Cliente",
        customer_email: "cliente@example.com",
        amount: 100,
        status: "paid",
        created_at: "2026-07-02T12:00:00.000Z",
        number_count: 10,
        reserved_until: null,
      },
    ],
    alerts: [
      {
        alert_key: "low_occupancy:raffle-1",
        kind: "low_occupancy",
        severity: "info",
        title: "Baixa ocupacao",
        description: "Rifa 1 esta com 20% de ocupacao.",
        href: "/admin/rifas/raffle-1/editar",
        created_at: "2026-07-02T12:00:00.000Z",
        priority: 4,
      },
    ],
  };
}

test("parseAdminDashboardStats accepts the expected RPC payload shape", () => {
  const stats = makeValidStats();
  assert.deepEqual(parseAdminDashboardStats(stats), stats);
});

test("parseAdminDashboardStats rejects malformed admin dashboard payloads", () => {
  const stats = makeValidStats();
  stats.raffles = null;
  assert.equal(parseAdminDashboardStats(stats), null);

  const statsWithBadSummary = makeValidStats();
  delete statsWithBadSummary.summary.total_orders;
  assert.equal(parseAdminDashboardStats(statsWithBadSummary), null);
});

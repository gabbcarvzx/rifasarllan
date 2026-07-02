import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAccountNumberMetrics,
  getAccountOrderMetrics,
} from "../src/lib/account/dashboard-metrics.ts";

test("getAccountOrderMetrics summarizes paid, pending and inactive orders", () => {
  assert.deepEqual(
    getAccountOrderMetrics([
      {
        id: "ord-1",
        status: "paid",
        amount: 90,
        createdAt: "2026-07-01T10:00:00.000Z",
        updatedAt: "2026-07-01T10:00:00.000Z",
        numbersCount: 9,
        reservedUntil: null,
        raffle: {
          id: "raffle-1",
          title: "Pickup",
          slug: "pickup",
          mainImageUrl: null,
          status: "active",
          drawDate: null,
        },
      },
      {
        id: "ord-2",
        status: "pending",
        amount: 30,
        createdAt: "2026-07-02T10:00:00.000Z",
        updatedAt: "2026-07-02T10:00:00.000Z",
        numbersCount: 3,
        reservedUntil: "2026-07-02T10:30:00.000Z",
        raffle: {
          id: "raffle-1",
          title: "Pickup",
          slug: "pickup",
          mainImageUrl: null,
          status: "active",
          drawDate: null,
        },
      },
      {
        id: "ord-3",
        status: "cancelled",
        amount: 15,
        createdAt: "2026-07-03T10:00:00.000Z",
        updatedAt: "2026-07-03T10:00:00.000Z",
        numbersCount: 1,
        reservedUntil: null,
        raffle: {
          id: "raffle-2",
          title: "Moto",
          slug: "moto",
          mainImageUrl: null,
          status: "finished",
          drawDate: null,
        },
      },
    ]),
    {
      totalOrders: 3,
      pendingOrders: 1,
      paidOrders: 1,
      inactiveOrders: 1,
      uniqueCampaigns: 2,
      totalSpent: 90,
      pendingAmount: 30,
      nextReservationExpiry: "2026-07-02T10:30:00.000Z",
    },
  );
});

test("getAccountNumberMetrics summarizes participant inventory by status", () => {
  assert.deepEqual(
    getAccountNumberMetrics([
      {
        raffle: {
          id: "raffle-1",
          title: "Casa",
          slug: "casa",
          mainImageUrl: null,
          status: "active",
          drawDate: null,
        },
        numbers: [
          {
            id: "1",
            number: 101,
            status: "paid",
            orderId: "ord-1",
            orderStatus: "paid",
            reservedAt: "2026-07-01T10:00:00.000Z",
            reservedUntil: null,
          },
          {
            id: "2",
            number: 102,
            status: "reserved",
            orderId: "ord-2",
            orderStatus: "pending",
            reservedAt: "2026-07-02T10:00:00.000Z",
            reservedUntil: "2026-07-02T10:30:00.000Z",
          },
        ],
      },
      {
        raffle: {
          id: "raffle-2",
          title: "Viagem",
          slug: "viagem",
          mainImageUrl: null,
          status: "finished",
          drawDate: null,
        },
        numbers: [
          {
            id: "3",
            number: 201,
            status: "expired",
            orderId: "ord-3",
            orderStatus: "expired",
            reservedAt: "2026-07-03T10:00:00.000Z",
            reservedUntil: null,
          },
        ],
      },
    ]),
    {
      totalNumbers: 3,
      paidNumbers: 1,
      reservedNumbers: 1,
      inactiveNumbers: 1,
      campaignsWithNumbers: 2,
      activeCampaigns: 1,
    },
  );
});

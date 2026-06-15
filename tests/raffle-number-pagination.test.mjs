import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clampRaffleNumberPagination,
  filterRaffleNumbersForPage,
} from "../src/lib/raffles/number-pagination.ts";

const numbers = [
  { number: 1, status: "available" },
  { number: 2, status: "reserved" },
  { number: 10, status: "available" },
  { number: 11, status: "paid" },
  { number: 12, status: "cancelled" },
  { number: 21, status: "available" },
];

test("clampRaffleNumberPagination bounds unsafe public pagination input", () => {
  assert.deepEqual(
    clampRaffleNumberPagination({
      page: -10,
      pageSize: 50_000,
      status: "paid",
      search: "  1  ",
      fromNumber: -1,
      toNumber: 999,
    }),
    {
      page: 1,
      pageSize: 1000,
      status: "paid",
      search: "1",
      fromNumber: null,
      toNumber: 999,
    },
  );
});

test("filterRaffleNumbersForPage filters by status, exact search and interval before paginating", () => {
  const result = filterRaffleNumbersForPage(numbers, {
    page: 1,
    pageSize: 2,
    status: "available",
    search: "1",
    fromNumber: 1,
    toNumber: 20,
  });

  assert.equal(result.totalItems, 1);
  assert.equal(result.totalPages, 1);
  assert.deepEqual(result.numbers, [
    { number: 1, status: "available" },
  ]);
});

test("filterRaffleNumbersForPage clamps requested page to the last available page", () => {
  const result = filterRaffleNumbersForPage(numbers, {
    page: 99,
    pageSize: 2,
    status: "all",
    search: "",
    fromNumber: null,
    toNumber: null,
  });

  assert.equal(result.page, 3);
  assert.equal(result.totalPages, 3);
  assert.deepEqual(result.numbers, [
    { number: 12, status: "cancelled" },
    { number: 21, status: "available" },
  ]);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addRandomAvailableNumbers,
  getAvailableNumberValues,
} from "../src/lib/raffles/quick-selection.ts";

const quickSelectionModule = await import("../src/lib/raffles/quick-selection.ts");

const numbers = [
  { number: 10, status: "available" },
  { number: 11, status: "reserved" },
  { number: 12, status: "available" },
  { number: 13, status: "paid" },
  { number: 14, status: "available" },
  { number: 15, status: "available" },
];

test("getAvailableNumberValues returns only available numbers in ascending order", () => {
  assert.deepEqual(getAvailableNumberValues(numbers), [10, 12, 14, 15]);
});

test("quick selection does not expose sequential public picks", () => {
  assert.equal("addTopAvailableNumbers" in quickSelectionModule, false);
});

test("addRandomAvailableNumbers supports deterministic quick picks", () => {
  const selected = addRandomAvailableNumbers({
    numbers,
    selectedNumbers: new Set([10]),
    quantity: 3,
    random: () => 0.99,
  });

  assert.deepEqual([...selected].sort((a, b) => a - b), [10, 14, 15]);
});

test("addRandomAvailableNumbers supports custom quantities without unavailable numbers", () => {
  const randomValues = [0.25, 0.75, 0];
  const selected = addRandomAvailableNumbers({
    numbers,
    selectedNumbers: new Set(),
    quantity: 3,
    random: () => randomValues.shift() ?? 0,
  });

  assert.equal(selected.size, 3);
  assert.deepEqual([...selected].sort((a, b) => a - b), [10, 12, 15]);
});

test("addRandomAvailableNumbers does not duplicate existing selections", () => {
  const selected = addRandomAvailableNumbers({
    numbers,
    selectedNumbers: new Set([10, 12]),
    quantity: 4,
    random: () => 0,
  });

  assert.equal(selected.size, 4);
  assert.deepEqual([...selected].sort((a, b) => a - b), [10, 12, 14, 15]);
});

test("addRandomAvailableNumbers returns fewer numbers when availability is insufficient", () => {
  const selected = addRandomAvailableNumbers({
    numbers,
    selectedNumbers: new Set([10, 12, 14]),
    quantity: 100,
    random: () => 0,
  });

  assert.deepEqual([...selected].sort((a, b) => a - b), [10, 12, 14, 15]);
});

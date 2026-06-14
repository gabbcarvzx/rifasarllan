import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addRandomAvailableNumbers,
  addTopAvailableNumbers,
  getAvailableNumberValues,
} from "../src/lib/raffles/quick-selection.ts";

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

test("addTopAvailableNumbers fills the selection up to the requested quantity", () => {
  const selected = addTopAvailableNumbers({
    numbers,
    selectedNumbers: new Set([12]),
    quantity: 3,
  });

  assert.deepEqual([...selected].sort((a, b) => a - b), [10, 12, 14]);
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

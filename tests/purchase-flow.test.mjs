import assert from "node:assert/strict";
import { test } from "node:test";
import { getQuickPickOptions } from "../src/lib/raffles/purchase-flow.ts";

test("getQuickPickOptions returns commercial quantity shortcuts within limits", () => {
  assert.deepEqual(getQuickPickOptions(100, 87), [5, 10, 20, 50]);
});

test("getQuickPickOptions clamps options to available capacity and reservation cap", () => {
  assert.deepEqual(getQuickPickOptions(12, 99), [5, 10]);
  assert.deepEqual(getQuickPickOptions(250, 9), [5]);
  assert.deepEqual(getQuickPickOptions(0, 100), []);
});

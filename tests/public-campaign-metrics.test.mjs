import assert from "node:assert/strict";
import { test } from "node:test";
import { getPublicCampaignMetrics } from "../src/lib/raffles/public-campaign-metrics.ts";

test("getPublicCampaignMetrics calculates sold, remaining and progress safely", () => {
  assert.deepEqual(
    getPublicCampaignMetrics({
      totalNumbers: 1000,
      available: 320,
      reserved: 80,
      paid: 600,
    }),
    {
      sold: 600,
      reserved: 80,
      available: 320,
      occupied: 680,
      remaining: 320,
      progress: 0.68,
    },
  );
});

test("getPublicCampaignMetrics clamps invalid values to safe bounds", () => {
  assert.deepEqual(
    getPublicCampaignMetrics({
      totalNumbers: 10,
      available: 20,
      reserved: -4,
      paid: 50,
    }),
    {
      sold: 10,
      reserved: 0,
      available: 10,
      occupied: 10,
      remaining: 0,
      progress: 1,
    },
  );
});

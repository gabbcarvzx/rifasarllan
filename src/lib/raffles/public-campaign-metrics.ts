type PublicCampaignMetricsInput = {
  totalNumbers: number;
  available: number;
  reserved: number;
  paid: number;
};

export type PublicCampaignMetrics = {
  sold: number;
  reserved: number;
  available: number;
  occupied: number;
  remaining: number;
  progress: number;
};

function clampCount(value: number, max: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(Math.trunc(value), 0), max);
}

export function getPublicCampaignMetrics({
  totalNumbers,
  available,
  reserved,
  paid,
}: PublicCampaignMetricsInput): PublicCampaignMetrics {
  const total = Math.max(Math.trunc(totalNumbers), 0);
  const safeAvailable = clampCount(available, total);
  const safeReserved = clampCount(reserved, total);
  const safePaid = clampCount(paid, total);
  const occupied = Math.min(safeReserved + safePaid, total);
  const remaining = Math.max(Math.min(safeAvailable, total - occupied), 0);

  return {
    sold: safePaid,
    reserved: safeReserved,
    available: safeAvailable,
    occupied,
    remaining,
    progress: total > 0 ? occupied / total : 0,
  };
}

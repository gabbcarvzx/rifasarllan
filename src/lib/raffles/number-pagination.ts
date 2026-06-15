import type { NumberGridStatus, RaffleNumberPublic } from "@/types/raffle";

export type RaffleNumberPageInput = {
  page?: number | null;
  pageSize?: number | null;
  status?: NumberGridStatus | null;
  search?: string | null;
  fromNumber?: number | null;
  toNumber?: number | null;
};

export type NormalizedRaffleNumberPageInput = {
  page: number;
  pageSize: number;
  status: NumberGridStatus;
  search: string;
  fromNumber: number | null;
  toNumber: number | null;
};

export type RaffleNumberPage = NormalizedRaffleNumberPageInput & {
  numbers: RaffleNumberPublic[];
  totalItems: number;
  totalPages: number;
};

const allowedStatuses = new Set<NumberGridStatus>([
  "all",
  "available",
  "reserved",
  "paid",
  "cancelled",
]);

export const raffleNumberPageSizeOptions = [250, 500, 1000] as const;
export const defaultRaffleNumberPageSize = 250;
export const maxRaffleNumberPageSize = 1000;

function normalizePositiveInteger(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

export function clampRaffleNumberPagination(
  input: RaffleNumberPageInput,
): NormalizedRaffleNumberPageInput {
  const requestedPage = normalizePositiveInteger(input.page);
  const requestedPageSize = normalizePositiveInteger(input.pageSize);
  const requestedStatus = input.status ?? "all";
  const search = (input.search ?? "").trim().slice(0, 32);
  const fromNumber = normalizePositiveInteger(input.fromNumber);
  const toNumber = normalizePositiveInteger(input.toNumber);

  return {
    page: requestedPage ?? 1,
    pageSize: Math.min(requestedPageSize ?? defaultRaffleNumberPageSize, maxRaffleNumberPageSize),
    status: allowedStatuses.has(requestedStatus) ? requestedStatus : "all",
    search,
    fromNumber,
    toNumber,
  };
}

export function filterRaffleNumbersForPage(
  numbers: RaffleNumberPublic[],
  input: RaffleNumberPageInput,
): RaffleNumberPage {
  const normalized = clampRaffleNumberPagination(input);
  const searchNumber = normalized.search
    ? Number.parseInt(normalized.search, 10)
    : null;
  const filtered = numbers.filter((item) => {
    if (normalized.status !== "all" && item.status !== normalized.status) {
      return false;
    }

    if (
      Number.isInteger(searchNumber) &&
      searchNumber !== null &&
      item.number !== searchNumber
    ) {
      return false;
    }

    if (normalized.fromNumber !== null && item.number < normalized.fromNumber) {
      return false;
    }

    if (normalized.toNumber !== null && item.number > normalized.toNumber) {
      return false;
    }

    return true;
  });
  const totalPages = Math.max(Math.ceil(filtered.length / normalized.pageSize), 1);
  const page = Math.min(normalized.page, totalPages);
  const startIndex = (page - 1) * normalized.pageSize;

  return {
    ...normalized,
    page,
    numbers: filtered.slice(startIndex, startIndex + normalized.pageSize),
    totalItems: filtered.length,
    totalPages,
  };
}

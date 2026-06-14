import type {
  PublicManualResultRow,
  PublicResultRaffleRow,
  Raffle,
  RaffleNumberStatus,
  RafflePrize,
  Winner,
} from "@/types/database";

export type ManualResultActionState = {
  status: "idle" | "success" | "warning" | "error";
  message: string;
  updatedAt?: number;
};

export type AdminManualWinner = Winner & {
  prize: RafflePrize | null;
  numberStatus: RaffleNumberStatus;
};

export type AdminManualResults = {
  raffle: Raffle;
  prizes: RafflePrize[];
  winners: AdminManualWinner[];
};

export type PublicManualResults = {
  raffle: PublicResultRaffleRow;
  winners: PublicManualResultRow[];
  published: boolean;
};

export type ManualResultsResult<T> = {
  data: T | null;
  error?: string;
};

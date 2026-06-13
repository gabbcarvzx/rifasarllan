import type { LucideIcon } from "lucide-react";
import type {
  PublicRaffleNumber as DatabasePublicRaffleNumber,
  RafflePrize as DatabaseRafflePrize,
  Raffle as DatabaseRaffle,
  RaffleNumberStatus,
  RaffleStatus,
} from "@/types/database";

export type { RaffleNumberStatus, RaffleStatus } from "@/types/database";
export type RaffleRecord = DatabaseRaffle;
export type RaffleFormMode = "create" | "edit";
export type Prize = DatabaseRafflePrize;
export type RaffleNumberPublic = Pick<
  DatabasePublicRaffleNumber,
  "number" | "status"
>;
export type NumberGridStatus = RaffleNumberStatus | "all" | "selected";

export type NumberSelection = {
  numbers: number[];
  quantity: number;
  total: number;
};

export type PrizeImage = {
  imageUrl: string | null;
  mediaFileId: string | null;
  altText?: string | null;
};

export type PrizeFormData = {
  raffleId: string;
  prizeId?: string;
  title: string;
  description: string;
  quantity: number;
  position: number;
  image?: File | null;
};

export type DemoRaffle = {
  id: string;
  tenantId: string;
  slug: string;
  title: string;
  subtitle: string;
  prize: string;
  ticketPrice: number;
  totalNumbers: number;
  soldNumbers: number;
  reservedNumbers: number;
  status: RaffleStatus;
  drawDate: string;
  image: string;
  highlight: string;
};

export type Raffle = DemoRaffle;

export type RaffleNumberPreview = {
  number: number;
  status: RaffleNumberStatus;
};

export type AdminStat = {
  label: string;
  value: string;
  helper: string;
  trend: string;
  icon: LucideIcon;
};

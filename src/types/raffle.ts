import type { LucideIcon } from "lucide-react";
import type {
  Raffle as DatabaseRaffle,
  RaffleNumberStatus,
  RaffleStatus,
} from "@/types/database";

export type { RaffleNumberStatus, RaffleStatus } from "@/types/database";
export type RaffleRecord = DatabaseRaffle;
export type RaffleFormMode = "create" | "edit";

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

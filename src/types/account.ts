import type {
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  Profile,
  RaffleStatus,
} from "@/types/database";

export type AccountActionState = {
  status: "idle" | "success" | "error";
  message: string;
  updatedAt?: number;
};

export type ParticipantRaffle = {
  id: string;
  title: string;
  slug: string;
  mainImageUrl: string | null;
  status: RaffleStatus;
  drawDate: string | null;
};

export type MyOrder = {
  id: string;
  status: OrderStatus;
  amount: number;
  createdAt: string;
  updatedAt: string;
  numbersCount: number;
  reservedUntil: string | null;
  raffle: ParticipantRaffle;
};

export type MyNumberStatus =
  | "reserved"
  | "paid"
  | "expired"
  | "cancelled";

export type MyNumber = {
  id: string;
  number: number;
  status: MyNumberStatus;
  orderId: string;
  orderStatus: OrderStatus;
  reservedAt: string;
  reservedUntil: string | null;
};

export type MyNumbersGroup = {
  raffle: ParticipantRaffle;
  numbers: MyNumber[];
};

export type MyOrderDetails = {
  order: Order;
  items: OrderItem[];
  raffle: ParticipantRaffle;
  reservedUntil: string | null;
  payment: Payment | null;
};

export type MyProfile = Profile;

export type AccountDataResult<T> = {
  data: T;
  error?: string;
};

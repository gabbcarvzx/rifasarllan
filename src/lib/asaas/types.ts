import type { AsaasEnvironment } from "@/config/asaas";

export type { AsaasEnvironment };

export type AsaasApiErrorItem = {
  code?: string;
  description?: string;
};

export type AsaasApiErrorResponse = {
  errors?: AsaasApiErrorItem[];
};

export type AsaasListResponse<T> = {
  object: "list";
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: T[];
};

export type AsaasCustomer = {
  object?: "customer";
  id: string;
  dateCreated?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
  cpfCnpj?: string | null;
  externalReference?: string | null;
  deleted?: boolean;
};

export type CreateAsaasCustomerInput = {
  name: string;
  email: string;
  mobilePhone?: string;
  externalReference: string;
  notificationDisabled?: boolean;
};

export type UpsertAsaasCustomerInput = CreateAsaasCustomerInput & {
  existingCustomerId?: string | null;
};

export type AsaasPaymentStatus =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH"
  | "REFUND_REQUESTED"
  | "REFUND_IN_PROGRESS"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS"
  | string;

export type AsaasPayment = {
  object?: "payment";
  id: string;
  dateCreated?: string;
  customer: string;
  billingType: "PIX" | string;
  value: number;
  netValue?: number;
  status: AsaasPaymentStatus;
  dueDate: string;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  transactionReceiptUrl?: string | null;
  description?: string | null;
  externalReference?: string | null;
  deleted?: boolean;
  paymentDate?: string | null;
  confirmedDate?: string | null;
};

export type CreateAsaasPixPaymentInput = {
  customer: string;
  billingType: "PIX";
  value: number;
  dueDate: string;
  description: string;
  externalReference: string;
};

export type AsaasPixQrCode = {
  encodedImage: string;
  payload: string;
  expirationDate?: string | null;
  description?: string | null;
};

export type AsaasDeletePaymentResponse = {
  id?: string;
  deleted?: boolean;
};

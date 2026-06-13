import "server-only";
import { asaasRequest } from "@/lib/asaas/client";
import type {
  AsaasDeletePaymentResponse,
  AsaasListResponse,
  AsaasPayment,
  AsaasPixQrCode,
  CreateAsaasPixPaymentInput,
} from "@/lib/asaas/types";

export function createPixPayment(input: CreateAsaasPixPaymentInput) {
  return asaasRequest<AsaasPayment>("/payments", {
    method: "POST",
    body: input,
  });
}

export function getPayment(paymentId: string) {
  return asaasRequest<AsaasPayment>(`/payments/${paymentId}`);
}

export async function findPaymentByExternalReference(externalReference: string) {
  const response = await asaasRequest<AsaasListResponse<AsaasPayment>>(
    "/payments",
    {
      query: {
        externalReference,
        limit: 10,
      },
    },
  );

  return (
    response.data.find(
      (payment) => payment.externalReference === externalReference && !payment.deleted,
    ) ?? null
  );
}

export function getPixQrCode(paymentId: string) {
  return asaasRequest<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
}

export function cancelPayment(paymentId: string) {
  return asaasRequest<AsaasDeletePaymentResponse>(`/payments/${paymentId}`, {
    method: "DELETE",
  });
}

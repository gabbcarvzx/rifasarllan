import "server-only";
import { asaasRequest } from "@/lib/asaas/client";
import { AsaasApiError } from "@/lib/asaas/errors";
import type {
  AsaasCustomer,
  AsaasListResponse,
  CreateAsaasCustomerInput,
  UpsertAsaasCustomerInput,
} from "@/lib/asaas/types";

export function createCustomer(input: CreateAsaasCustomerInput) {
  return asaasRequest<AsaasCustomer>("/customers", {
    method: "POST",
    body: input,
  });
}

export async function getCustomer(customerId: string) {
  try {
    return await asaasRequest<AsaasCustomer>(`/customers/${customerId}`);
  } catch (error) {
    if (error instanceof AsaasApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function findCustomerByEmail(email: string) {
  const response = await asaasRequest<AsaasListResponse<AsaasCustomer>>(
    "/customers",
    {
      query: {
        email: email.trim().toLowerCase(),
        limit: 10,
      },
    },
  );

  return (
    response.data.find(
      (customer) => customer.email?.trim().toLowerCase() === email.trim().toLowerCase(),
    ) ?? null
  );
}

async function findCustomerByExternalReference(externalReference: string) {
  const response = await asaasRequest<AsaasListResponse<AsaasCustomer>>(
    "/customers",
    {
      query: {
        externalReference,
        limit: 10,
      },
    },
  );

  return (
    response.data.find(
      (customer) => customer.externalReference === externalReference,
    ) ?? null
  );
}

export async function upsertCustomer(input: UpsertAsaasCustomerInput) {
  if (input.existingCustomerId) {
    const existing = await getCustomer(input.existingCustomerId);

    if (existing && !existing.deleted) {
      return existing;
    }
  }

  const byReference = await findCustomerByExternalReference(
    input.externalReference,
  );

  if (byReference) {
    return byReference;
  }

  const byEmail = await findCustomerByEmail(input.email);

  if (
    byEmail &&
    (!byEmail.externalReference ||
      byEmail.externalReference === input.externalReference)
  ) {
    return byEmail;
  }

  return createCustomer({
    name: input.name,
    email: input.email,
    mobilePhone: input.mobilePhone,
    externalReference: input.externalReference,
    notificationDisabled: input.notificationDisabled ?? true,
  });
}

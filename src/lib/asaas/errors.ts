import type { AsaasApiErrorItem } from "@/lib/asaas/types";

export class AsaasApiError extends Error {
  readonly status: number;
  readonly errors: AsaasApiErrorItem[];

  constructor({
    message,
    status,
    errors = [],
  }: {
    message: string;
    status: number;
    errors?: AsaasApiErrorItem[];
  }) {
    super(message);
    this.name = "AsaasApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function getAsaasErrorMessage(error: unknown) {
  if (error instanceof AsaasApiError) {
    const providerMessage = error.errors
      .map((item) => item.description)
      .filter(Boolean)
      .join(" ");

    return providerMessage || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "O Asaas nao respondeu como esperado.";
}

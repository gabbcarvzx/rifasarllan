import "server-only";
import { getAsaasConfig } from "@/config/asaas";
import { AsaasApiError } from "@/lib/asaas/errors";
import type { AsaasApiErrorResponse } from "@/lib/asaas/types";

type AsaasRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

function buildRequestUrl(
  baseUrl: string,
  path: string,
  query?: AsaasRequestOptions["query"],
) {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const url = new URL(path.replace(/^\//, ""), normalizedBaseUrl);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

export async function asaasRequest<T>(
  path: string,
  options: AsaasRequestOptions = {},
): Promise<T> {
  const config = getAsaasConfig();
  const url = buildRequestUrl(config.baseUrl, path, options.query);
  const response = await fetch(url, {
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
    headers: {
      accept: "application/json",
      access_token: config.apiKey,
      "content-type": "application/json",
      "user-agent": "RifaArllan/1.0",
      ...options.headers,
    },
    signal: options.signal ?? AbortSignal.timeout(15_000),
  });

  const responseText = await response.text();
  const payload = responseText ? JSON.parse(responseText) : {};

  if (!response.ok) {
    const errorPayload = payload as AsaasApiErrorResponse;
    throw new AsaasApiError({
      message: `Asaas request failed with status ${response.status}.`,
      status: response.status,
      errors: errorPayload.errors ?? [],
    });
  }

  return payload as T;
}

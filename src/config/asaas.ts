import "server-only";

export type AsaasEnvironment = "production" | "sandbox";

export type AsaasConfig = {
  apiKey: string;
  environment: AsaasEnvironment;
  baseUrl: string;
  webhookToken: string;
};

function getRequiredValue(name: string, value: string | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return normalized;
}

export function getAsaasConfig(): AsaasConfig {
  const environment = getRequiredValue("ASAAS_ENV", process.env.ASAAS_ENV);

  if (environment !== "production" && environment !== "sandbox") {
    throw new Error("ASAAS_ENV must be production or sandbox.");
  }

  const config: AsaasConfig = {
    apiKey: getRequiredValue("ASAAS_API_KEY", process.env.ASAAS_API_KEY),
    environment,
    baseUrl: getRequiredValue("ASAAS_BASE_URL", process.env.ASAAS_BASE_URL),
    webhookToken: getRequiredValue(
      "ASAAS_WEBHOOK_TOKEN",
      process.env.ASAAS_WEBHOOK_TOKEN,
    ),
  };

  validateAsaasConfig(config);
  return config;
}

export function isProduction(config = getAsaasConfig()) {
  return config.environment === "production";
}

export function isSandbox(config = getAsaasConfig()) {
  return config.environment === "sandbox";
}

export function validateAsaasConfig(config: AsaasConfig) {
  let url: URL;

  try {
    url = new URL(config.baseUrl);
  } catch {
    throw new Error("ASAAS_BASE_URL must be a valid absolute URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("ASAAS_BASE_URL must use HTTPS.");
  }

  if (!url.pathname.endsWith("/v3") && !url.pathname.endsWith("/v3/")) {
    throw new Error("ASAAS_BASE_URL must point to the Asaas API v3 base path.");
  }

  return true;
}

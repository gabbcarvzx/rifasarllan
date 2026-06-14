import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const envPath = resolve(root, ".env.local");

function parseEnv(source) {
  const values = new Map();

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const name = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values.set(name, value);
  }

  return values;
}

const fileValues = existsSync(envPath)
  ? parseEnv(readFileSync(envPath, "utf8"))
  : new Map();
const getValue = (name) => process.env[name]?.trim() || fileValues.get(name)?.trim() || "";
const errors = [];
const warnings = [];

for (const name of [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]) {
  if (!getValue(name)) errors.push(`${name} nao esta configurada.`);
}

if (!getValue("NEXT_PUBLIC_TENANT_SLUG")) {
  const isVercelDeployment = Boolean(process.env.VERCEL_ENV);
  const message =
    "NEXT_PUBLIC_TENANT_SLUG nao esta configurada; o tenant sera resolvido pelo fallback do banco.";

  if (isVercelDeployment) errors.push(message);
  else warnings.push(`${message} Configure-a antes do deploy.`);
}

const publicUrl = getValue("NEXT_PUBLIC_SUPABASE_URL");
if (publicUrl) {
  try {
    const url = new URL(publicUrl);
    if (!['https:', 'http:'].includes(url.protocol)) {
      errors.push("NEXT_PUBLIC_SUPABASE_URL precisa usar HTTP ou HTTPS.");
    }
  } catch {
    errors.push("NEXT_PUBLIC_SUPABASE_URL nao e uma URL valida.");
  }
}

for (const forbidden of [
  "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_ASAAS_API_KEY",
  "NEXT_PUBLIC_ASAAS_WEBHOOK_TOKEN",
]) {
  if (getValue(forbidden)) {
    errors.push(`${forbidden} nunca pode ser exposta como variavel publica.`);
  }
}

const asaasApiKey = getValue("ASAAS_API_KEY");
if (asaasApiKey) {
  const environment = getValue("ASAAS_ENV");
  const baseUrl = getValue("ASAAS_BASE_URL");

  if (!['production', 'sandbox'].includes(environment)) {
    errors.push("ASAAS_ENV precisa ser production ou sandbox quando o checkout estiver configurado.");
  }

  if (!baseUrl) {
    errors.push("ASAAS_BASE_URL e obrigatoria quando ASAAS_API_KEY estiver configurada.");
  } else {
    try {
      const url = new URL(baseUrl);
      if (url.protocol !== "https:" || !url.pathname.replace(/\/$/, "").endsWith("/v3")) {
        errors.push("ASAAS_BASE_URL precisa usar HTTPS e apontar para /v3.");
      }
    } catch {
      errors.push("ASAAS_BASE_URL nao e uma URL valida.");
    }
  }
} else {
  warnings.push("Checkout Asaas permanece pausado porque ASAAS_API_KEY nao esta configurada.");
}

const gitignorePath = resolve(root, ".gitignore");
if (!existsSync(gitignorePath)) {
  errors.push(".gitignore nao encontrado.");
} else {
  const gitignore = readFileSync(gitignorePath, "utf8");
  if (!gitignore.includes(".env*")) {
    errors.push(".gitignore precisa ignorar arquivos .env*.");
  }
}

for (const warning of warnings) console.warn(`AVISO: ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`ERRO: ${error}`);
  process.exitCode = 1;
} else {
  console.log("Ambiente validado sem expor valores sensiveis.");
}

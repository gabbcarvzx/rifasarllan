import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const root = process.cwd();
const sourceRoot = resolve(root, "src");
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const findings = [];

function walk(directory, predicate = () => true) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) return walk(path, predicate);
    return predicate(path) ? [path] : [];
  });
}

const sourceFiles = walk(sourceRoot, (path) => sourceExtensions.has(extname(path)));
const forbiddenClientPatterns = [
  ["process.env", "acesso direto a process.env"],
  ["@/lib/env/server", "helper de env server-only"],
  ["@/lib/supabase/admin", "Supabase service role client"],
  ["@/lib/asaas/", "cliente Asaas"],
  ["SUPABASE_SERVICE_ROLE_KEY", "service role key"],
  ["ASAAS_API_KEY", "Asaas API key"],
  ["ASAAS_WEBHOOK_TOKEN", "token de webhook"],
];

for (const path of sourceFiles) {
  const source = readFileSync(path, "utf8");
  const firstLines = source.split(/\r?\n/).slice(0, 5).join("\n");
  const isClient = /["']use client["'];?/.test(firstLines);

  if (isClient) {
    for (const [pattern, label] of forbiddenClientPatterns) {
      if (source.includes(pattern)) {
        findings.push(`${path}: client component contem ${label}.`);
      }
    }
  }

  if (/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(source)) {
    findings.push(`${path}: possivel JWT literal encontrado no codigo-fonte.`);
  }
}

for (const relativePath of [
  "src/lib/env/server.ts",
  "src/lib/supabase/admin.ts",
  "src/lib/asaas/client.ts",
  "src/config/asaas.ts",
]) {
  const path = resolve(root, relativePath);
  const source = existsSync(path) ? readFileSync(path, "utf8") : "";

  if (!source.includes('import "server-only"')) {
    findings.push(`${relativePath}: modulo sensivel sem import de server-only.`);
  }
}

if (existsSync(resolve(root, "src/lib/env.ts"))) {
  findings.push("src/lib/env.ts: envs publicas e privadas devem permanecer separados.");
}

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        const name = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, "$2");
        return [name, value];
      }),
  );
}

const envPath = resolve(root, ".env.local");
const secrets = existsSync(envPath) ? parseEnv(readFileSync(envPath, "utf8")) : {};
const clientArtifacts = [
  ...walk(resolve(root, ".next/static"), (path) => statSync(path).isFile()),
  ...walk(
    resolve(root, ".next/server/app"),
    (path) => [".html", ".rsc", ".txt"].includes(extname(path)),
  ),
];

for (const name of [
  "SUPABASE_SERVICE_ROLE_KEY",
  "ASAAS_API_KEY",
  "ASAAS_WEBHOOK_TOKEN",
]) {
  const value = secrets[name]?.trim();
  if (!value || value.length < 12) continue;

  for (const path of clientArtifacts) {
    const artifact = readFileSync(path);
    if (artifact.includes(Buffer.from(value))) {
      findings.push(`${path}: valor de ${name} encontrado em artefato publico.`);
    }
  }
}

if (findings.length) {
  for (const finding of findings) console.error(`ERRO: ${finding}`);
  process.exitCode = 1;
} else {
  const artifactMessage = clientArtifacts.length
    ? " Bundle e artefatos publicos tambem foram verificados."
    : " Execute apos o build para incluir a verificacao do bundle.";
  console.log(`Fronteiras client/server aprovadas.${artifactMessage}`);
}

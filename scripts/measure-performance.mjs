import { performance } from "node:perf_hooks";

const baseUrl = (process.env.PERF_BASE_URL || process.argv[2] || "http://localhost:3100")
  .replace(/\/$/, "");
const runs = Number(process.env.PERF_RUNS || 6);
const routes = [
  "/",
  "/login",
  "/cadastro",
  "/rifas",
  "/admin",
  "/minha-conta",
  "/meus-pedidos",
  "/meus-numeros",
];

function percentile(values, ratio) {
  const ordered = [...values].sort((first, second) => first - second);
  return ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * ratio))];
}

async function measureRoute(pathname) {
  const samples = [];
  let status = 0;
  let location = null;

  for (let index = 0; index < runs; index += 1) {
    const startedAt = performance.now();
    const response = await fetch(`${baseUrl}${pathname}`, {
      cache: "no-store",
      redirect: "manual",
      headers: { "user-agent": "rifa-performance-audit/1.0" },
    });

    await response.arrayBuffer();
    samples.push(performance.now() - startedAt);
    status = response.status;
    location = response.headers.get("location");
  }

  const warmSamples = samples.slice(1);
  const average = warmSamples.reduce((total, value) => total + value, 0) / warmSamples.length;

  return {
    route: pathname,
    status,
    redirect: location ? new URL(location, baseUrl).pathname : "-",
    coldMs: Number(samples[0].toFixed(1)),
    warmAverageMs: Number(average.toFixed(1)),
    warmP50Ms: Number(percentile(warmSamples, 0.5).toFixed(1)),
    warmP95Ms: Number(percentile(warmSamples, 0.95).toFixed(1)),
  };
}

async function main() {
  console.log(`Medindo ${baseUrl} com ${runs} requisicoes por rota...`);
  const results = [];

  for (const route of routes) {
    results.push(await measureRoute(route));
  }

  console.table(results);
}

main().catch((error) => {
  console.error(`Falha ao medir a aplicacao: ${error.message}`);
  process.exitCode = 1;
});

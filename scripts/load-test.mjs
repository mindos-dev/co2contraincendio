/**
 * Script de Teste de Carga — OPERIS / CO2 Contra Incêndio
 * Simula 100 usuários simultâneos fazendo requisições ao endpoint público
 * Valida que o rate limiter responde corretamente (200 para requisições normais,
 * 429 apenas quando o limite é excedido por um único IP)
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";
const CONCURRENT_USERS = 100;
const REQUESTS_PER_USER = 3;
const ENDPOINT = "/api/trpc/saas.equipment.getByCode?input=%7B%22json%22%3A%7B%22code%22%3A%22TEST%22%7D%7D";

async function simulateUser(userId) {
  const results = { ok: 0, notFound: 0, rateLimited: 0, errors: 0, latencies: [] };

  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const start = Date.now();
    try {
      const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
        headers: { "Accept": "application/json" },
      });
      const latency = Date.now() - start;
      results.latencies.push(latency);

      if (res.status === 200) results.ok++;
      else if (res.status === 404) results.notFound++;
      else if (res.status === 429) results.rateLimited++;
      else results.errors++;
    } catch {
      results.errors++;
    }
  }
  return results;
}

async function runLoadTest() {
  console.log(`\n🚀 Iniciando teste de carga: ${CONCURRENT_USERS} usuários × ${REQUESTS_PER_USER} req = ${CONCURRENT_USERS * REQUESTS_PER_USER} req totais`);
  console.log(`📡 Endpoint: ${BASE_URL}${ENDPOINT}\n`);

  const start = Date.now();
  const promises = Array.from({ length: CONCURRENT_USERS }, (_, i) => simulateUser(i));
  const allResults = await Promise.all(promises);
  const totalMs = Date.now() - start;

  // Agregar resultados
  const totals = allResults.reduce((acc, r) => ({
    ok: acc.ok + r.ok,
    notFound: acc.notFound + r.notFound,
    rateLimited: acc.rateLimited + r.rateLimited,
    errors: acc.errors + r.errors,
    latencies: [...acc.latencies, ...r.latencies],
  }), { ok: 0, notFound: 0, rateLimited: 0, errors: 0, latencies: [] });

  // Calcular percentis de latência
  const sorted = totals.latencies.sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const avg = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length);

  const totalReqs = totals.ok + totals.notFound + totals.rateLimited + totals.errors;
  const rps = Math.round(totalReqs / (totalMs / 1000));

  console.log("═══════════════════════════════════════════════════════");
  console.log("📊 RESULTADO DO TESTE DE CARGA");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`Total de requisições:  ${totalReqs}`);
  console.log(`Duração total:         ${totalMs}ms`);
  console.log(`Throughput:            ${rps} req/s`);
  console.log("");
  console.log("Status HTTP:");
  console.log(`  ✅ 200 OK:           ${totals.ok}`);
  console.log(`  🔍 Não encontrado:   ${totals.notFound}`);
  console.log(`  🚫 429 Rate Limited: ${totals.rateLimited}`);
  console.log(`  ❌ Erros:            ${totals.errors}`);
  console.log("");
  console.log("Latência (ms):");
  console.log(`  Média:  ${avg}ms`);
  console.log(`  P50:    ${p50}ms`);
  console.log(`  P95:    ${p95}ms`);
  console.log(`  P99:    ${p99}ms`);
  console.log("═══════════════════════════════════════════════════════");

  // Validações
  const successRate = ((totals.ok + totals.notFound) / totalReqs) * 100;
  if (successRate >= 95) {
    console.log(`\n✅ PASSOU: Taxa de sucesso ${successRate.toFixed(1)}% (≥95% esperado)`);
  } else {
    console.log(`\n❌ FALHOU: Taxa de sucesso ${successRate.toFixed(1)}% (<95% esperado)`);
  }

  if (p95 <= 500) {
    console.log(`✅ PASSOU: P95 ${p95}ms (≤500ms esperado)`);
  } else {
    console.log(`⚠️  ATENÇÃO: P95 ${p95}ms (>500ms — considerar otimização)`);
  }

  if (totals.rateLimited === 0) {
    console.log(`✅ PASSOU: Sem rate limiting para ${CONCURRENT_USERS} usuários com ${REQUESTS_PER_USER} req cada`);
  } else {
    console.log(`⚠️  INFO: ${totals.rateLimited} req bloqueadas pelo rate limiter (esperado se > 500 req/min por IP)`);
  }
}

runLoadTest().catch(console.error);

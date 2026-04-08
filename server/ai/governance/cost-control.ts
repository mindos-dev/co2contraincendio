/**
 * OPERIS IA — Governance: Cost Control
 * Hard stop / soft alert por empresa, por dia e por mês
 * Integrado com o provider central
 */

interface UsageRecord {
  companyId: number;
  date: string; // YYYY-MM-DD
  requests: number;
  tokens: number;
}

// In-memory store (substituir por DB em produção)
const usageStore = new Map<string, UsageRecord>();

const LIMITS = {
  free: { dailyRequests: 10, monthlyTokens: 50_000 },
  basic: { dailyRequests: 50, monthlyTokens: 250_000 },
  pro: { dailyRequests: 200, monthlyTokens: 1_000_000 },
  industrial: { dailyRequests: 1000, monthlyTokens: 5_000_000 },
};

export type PlanTier = keyof typeof LIMITS;

function todayKey(companyId: number): string {
  return `${companyId}:${new Date().toISOString().slice(0, 10)}`;
}

export function checkBudget(
  companyId: number,
  plan: PlanTier
): { allowed: boolean; reason?: string } {
  const key = todayKey(companyId);
  const record = usageStore.get(key);
  const limits = LIMITS[plan] ?? LIMITS.free;

  if (record && record.requests >= limits.dailyRequests) {
    return {
      allowed: false,
      reason: `Limite diário de ${limits.dailyRequests} requisições atingido para o plano ${plan}.`,
    };
  }
  return { allowed: true };
}

export function recordUsage(companyId: number, tokens: number): void {
  const key = todayKey(companyId);
  const existing = usageStore.get(key);
  if (existing) {
    existing.requests++;
    existing.tokens += tokens;
  } else {
    usageStore.set(key, {
      companyId,
      date: new Date().toISOString().slice(0, 10),
      requests: 1,
      tokens,
    });
  }
}

export function getUsageStats(companyId: number): UsageRecord | null {
  return usageStore.get(todayKey(companyId)) ?? null;
}

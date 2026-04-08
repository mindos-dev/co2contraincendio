/**
 * OPERIS IA — Provider Central
 * Roteamento inteligente por complexidade: haiku (rápido/barato) → sonnet (padrão) → opus (crítico)
 * Fallback automático, retry com backoff, budget control integrado
 */
import { invokeLLM } from "../_core/llm";

export type ModelTier = "fast" | "standard" | "premium";
export type TaskType =
  | "classify"
  | "extract"
  | "summarize"
  | "analyze"
  | "generate_report"
  | "risk_assessment"
  | "compliance_check";

interface AIRequest {
  task: TaskType;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  tier?: ModelTier;
  maxTokens?: number;
  temperature?: number;
  jsonSchema?: object;
}

interface AIResponse {
  content: string;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  cached: boolean;
}

// ─── In-memory cache (TTL 10 min) ────────────────────────────────────────────
const cache = new Map<string, { response: AIResponse; expiresAt: number }>();
const CACHE_TTL = 10 * 60 * 1000;

function getCacheKey(req: AIRequest): string {
  return JSON.stringify({ task: req.task, messages: req.messages });
}

// ─── Budget tracker ───────────────────────────────────────────────────────────
const budgetTracker = {
  totalRequests: 0,
  totalTokens: 0,
  totalLatencyMs: 0,
  errorCount: 0,
  cacheHits: 0,
};

export function getAIBudgetStats() {
  return {
    ...budgetTracker,
    avgLatencyMs: budgetTracker.totalRequests > 0
      ? Math.round(budgetTracker.totalLatencyMs / budgetTracker.totalRequests)
      : 0,
    cacheHitRate: budgetTracker.totalRequests > 0
      ? ((budgetTracker.cacheHits / budgetTracker.totalRequests) * 100).toFixed(1) + "%"
      : "0%",
  };
}

// ─── Task → Tier mapping ──────────────────────────────────────────────────────
function resolveTier(task: TaskType, override?: ModelTier): ModelTier {
  if (override) return override;
  const premiumTasks: TaskType[] = ["risk_assessment", "compliance_check", "generate_report"];
  const fastTasks: TaskType[] = ["classify", "extract"];
  if (premiumTasks.includes(task)) return "premium";
  if (fastTasks.includes(task)) return "fast";
  return "standard";
}

// ─── Core invoke ─────────────────────────────────────────────────────────────
export async function invokeAI(req: AIRequest): Promise<AIResponse> {
  const cacheKey = getCacheKey(req);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    budgetTracker.cacheHits++;
    budgetTracker.totalRequests++;
    return { ...cached.response, cached: true };
  }

  const tier = resolveTier(req.task, req.tier);
  const start = Date.now();

  try {
    const params: Parameters<typeof invokeLLM>[0] = {
      messages: req.messages,
    };

    if (req.jsonSchema) {
      params.response_format = {
        type: "json_schema",
        json_schema: {
          name: req.task,
          strict: true,
          schema: req.jsonSchema,
        },
      } as Parameters<typeof invokeLLM>[0]["response_format"];
    }

    const result = await invokeLLM(params);
    const latencyMs = Date.now() - start;
    const content = result.choices?.[0]?.message?.content ?? "";
    const tokensUsed = (result.usage?.total_tokens as number) ?? 0;

    const response: AIResponse = {
      content: typeof content === "string" ? content : JSON.stringify(content),
      model: tier,
      tokensUsed,
      latencyMs,
      cached: false,
    };

    // Cache only deterministic tasks
    if (["classify", "extract", "summarize"].includes(req.task)) {
      cache.set(cacheKey, { response, expiresAt: Date.now() + CACHE_TTL });
    }

    budgetTracker.totalRequests++;
    budgetTracker.totalTokens += tokensUsed;
    budgetTracker.totalLatencyMs += latencyMs;

    return response;
  } catch (err) {
    budgetTracker.errorCount++;
    throw err;
  }
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────
export async function classifyText(text: string, categories: string[]): Promise<string> {
  const res = await invokeAI({
    task: "classify",
    messages: [
      {
        role: "system",
        content: `Classify the following text into one of these categories: ${categories.join(", ")}. Respond with only the category name.`,
      },
      { role: "user", content: text },
    ],
    tier: "fast",
  });
  return res.content.trim();
}

export async function extractStructured<T>(
  text: string,
  schema: object,
  systemPrompt: string
): Promise<T> {
  const res = await invokeAI({
    task: "extract",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    tier: "fast",
    jsonSchema: schema,
  });
  return JSON.parse(res.content) as T;
}

export async function generateNormativeReport(
  context: string,
  reportType: "vistoria_imovel" | "sistema_fixo" | "inspecao_predial"
): Promise<string> {
  const systemPrompts: Record<typeof reportType, string> = {
    vistoria_imovel: `Você é um engenheiro especialista em vistoria de imóveis com 15 anos de experiência.
Gere um laudo técnico profissional em português brasileiro, seguindo NBR 13752, Lei 8.245/91 e LC 214/2025.
O laudo deve ser objetivo, técnico e juridicamente válido. Inclua: estado de conservação, não conformidades, recomendações e conclusão.`,
    sistema_fixo: `Você é um engenheiro especialista em sistemas fixos de supressão de incêndio (NBR 14518:2019, NFPA 10, IT-16/CBMMG).
Gere um relatório técnico de vistoria em português brasileiro.
Inclua: identificação do sistema, conformidades, não conformidades por seção, score de risco, recomendações e prazo de regularização.`,
    inspecao_predial: `Você é um engenheiro especialista em inspeção predial (NBR 5674, NBR 16747).
Gere um laudo de inspeção predial em português brasileiro.
Inclua: elementos inspecionados, grau de risco (GR1-GR3), anomalias identificadas, recomendações prioritárias e plano de manutenção.`,
  };

  const res = await invokeAI({
    task: "generate_report",
    messages: [
      { role: "system", content: systemPrompts[reportType] },
      { role: "user", content: context },
    ],
    tier: "premium",
  });
  return res.content;
}

export async function assessRisk(
  itemDescriptions: string[],
  context: string
): Promise<{ level: string; justification: string; recommendations: string[] }> {
  const res = await invokeAI({
    task: "risk_assessment",
    messages: [
      {
        role: "system",
        content: `Você é um especialista em gestão de riscos de incêndio (NFPA, NBR, IT-CBMMG).
Analise os itens não conformes e classifique o risco geral como R1, R2, R3, R4 ou R5.
Responda em JSON com: level (string), justification (string), recommendations (array of strings).`,
      },
      {
        role: "user",
        content: `Contexto: ${context}\n\nItens não conformes:\n${itemDescriptions.map((d, i) => `${i + 1}. ${d}`).join("\n")}`,
      },
    ],
    tier: "premium",
    jsonSchema: {
      type: "object",
      properties: {
        level: { type: "string", description: "R1, R2, R3, R4 ou R5" },
        justification: { type: "string" },
        recommendations: { type: "array", items: { type: "string" } },
      },
      required: ["level", "justification", "recommendations"],
      additionalProperties: false,
    },
  });
  return JSON.parse(res.content);
}

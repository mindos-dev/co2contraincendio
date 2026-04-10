/**
 * ─── AI Pipeline — Fluxos Rápidos entre Múltiplas IAs ───────────────────────
 * JULY AOG | OPERIS IA — Orquestração Soberana de Modelos
 *
 * Permite criar pipelines encadeados onde a saída de um modelo
 * alimenta a entrada do próximo — ideal para testes comparativos,
 * refinamento progressivo e validação cruzada entre IAs.
 *
 * Arquitetura:
 *   [Prompt Inicial] → [IA-1] → [Transformador] → [IA-2] → [IA-3] → [Resultado]
 *
 * Exemplos de fluxos:
 *   - Análise Técnica: DeepSeek R1 → Gemma 2 → Mistral (revisão)
 *   - Código: CodeLlama → Llama 3 (revisão) → Phi-3 (otimização)
 *   - Relatório OPERIS: Gemma 2 (análise) → Llama 3 (formatação)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { runOllamaPrompt } from "./ollama-service";
import { z } from "zod";

// ─── Schemas de validação ─────────────────────────────────────────────────────
export const PipelineStepSchema = z.object({
  id: z.string(),
  model: z.string(),
  label: z.string(),
  systemPrompt: z.string().optional(),
  promptTemplate: z.string().optional(), // usa {{input}} para injetar saída anterior
  timeoutMs: z.number().min(5000).max(300_000).default(120_000),
  transformMode: z.enum([
    "passthrough",      // passa a saída diretamente
    "summarize",        // instrui o modelo a resumir antes de passar
    "critique",         // instrui o modelo a criticar e melhorar
    "translate_pt",     // traduz para português
    "extract_json",     // extrai JSON estruturado
    "code_review",      // revisão de código
    "custom",           // usa promptTemplate personalizado
  ]).default("passthrough"),
});

export const PipelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  steps: z.array(PipelineStepSchema).min(1).max(8),
  initialPrompt: z.string().min(1).max(10_000),
  category: z.enum(["test", "analysis", "code", "report", "operis", "custom"]).default("test"),
  saveResult: z.boolean().default(true),
});

export type PipelineStep = z.infer<typeof PipelineStepSchema>;
export type Pipeline = z.infer<typeof PipelineSchema>;

// ─── Resultado de cada etapa ──────────────────────────────────────────────────
export interface StepResult {
  stepId: string;
  model: string;
  label: string;
  input: string;
  output: string;
  durationMs: number;
  tokensPerSecond: number;
  promptTokens: number;
  responseTokens: number;
  status: "success" | "error" | "timeout";
  error?: string;
  startedAt: string;
  completedAt: string;
}

export interface PipelineResult {
  pipelineId: string;
  pipelineName: string;
  status: "completed" | "partial" | "failed";
  steps: StepResult[];
  finalOutput: string;
  totalDurationMs: number;
  totalTokens: number;
  startedAt: string;
  completedAt: string;
}

// ─── Templates de transformação ───────────────────────────────────────────────
const TRANSFORM_PROMPTS: Record<string, string> = {
  summarize: `Você é um assistente de síntese. Resuma o seguinte texto de forma clara e concisa, mantendo os pontos essenciais:\n\n{{input}}`,
  critique: `Você é um revisor crítico especialista. Analise o seguinte texto, identifique pontos fracos e reescreva com melhorias significativas:\n\n{{input}}`,
  translate_pt: `Traduza o seguinte texto para português brasileiro de forma natural e técnica:\n\n{{input}}`,
  extract_json: `Extraia as informações estruturadas do seguinte texto e retorne APENAS um JSON válido, sem explicações:\n\n{{input}}`,
  code_review: `Você é um engenheiro sênior. Revise o seguinte código, identifique bugs, problemas de performance e sugira melhorias:\n\n{{input}}`,
  passthrough: `{{input}}`,
};

// ─── Templates de pipelines pré-definidos ─────────────────────────────────────
export const PRESET_PIPELINES: Omit<Pipeline, "id" | "initialPrompt">[] = [
  {
    name: "Análise Técnica OPERIS",
    description: "DeepSeek analisa → Gemma 2 estrutura → Mistral revisa",
    category: "operis",
    saveResult: true,
    steps: [
      {
        id: "step-1",
        model: "deepseek-r1",
        label: "DeepSeek: Análise Inicial",
        systemPrompt: "Você é um engenheiro especialista em sistemas de proteção contra incêndio. Analise tecnicamente o problema apresentado.",
        transformMode: "passthrough",
        timeoutMs: 120_000,
      },
      {
        id: "step-2",
        model: "gemma2",
        label: "Gemma 2: Estruturação",
        systemPrompt: "Você é um redator técnico. Estruture a análise recebida em seções claras com títulos, pontos principais e recomendações.",
        transformMode: "critique",
        timeoutMs: 90_000,
      },
      {
        id: "step-3",
        model: "mistral",
        label: "Mistral: Revisão Final",
        systemPrompt: "Você é um revisor técnico. Faça a revisão final, corrija inconsistências e garanta clareza.",
        transformMode: "summarize",
        timeoutMs: 60_000,
      },
    ],
  },
  {
    name: "Revisão de Código",
    description: "CodeLlama revisa → Llama 3 explica → Phi-3 otimiza",
    category: "code",
    saveResult: true,
    steps: [
      {
        id: "step-1",
        model: "codellama",
        label: "CodeLlama: Revisão de Bugs",
        systemPrompt: "Você é um engenheiro de software sênior. Identifique todos os bugs, problemas de segurança e code smells.",
        transformMode: "code_review",
        timeoutMs: 120_000,
      },
      {
        id: "step-2",
        model: "llama3",
        label: "Llama 3: Explicação Didática",
        systemPrompt: "Explique as melhorias sugeridas de forma didática, com exemplos práticos.",
        transformMode: "passthrough",
        timeoutMs: 90_000,
      },
      {
        id: "step-3",
        model: "phi3",
        label: "Phi-3: Otimização Final",
        systemPrompt: "Sugira otimizações de performance e boas práticas adicionais.",
        transformMode: "passthrough",
        timeoutMs: 60_000,
      },
    ],
  },
  {
    name: "Comparativo Rápido (2 IAs)",
    description: "Gemma 2 vs Llama 3 — mesma pergunta, respostas paralelas",
    category: "test",
    saveResult: true,
    steps: [
      {
        id: "step-1",
        model: "gemma2",
        label: "Gemma 2: Resposta A",
        transformMode: "passthrough",
        timeoutMs: 90_000,
      },
      {
        id: "step-2",
        model: "llama3",
        label: "Llama 3: Resposta B",
        systemPrompt: "Responda a mesma pergunta inicial de forma independente.",
        promptTemplate: "{{initialPrompt}}",
        transformMode: "passthrough",
        timeoutMs: 90_000,
      },
      {
        id: "step-3",
        model: "mistral",
        label: "Mistral: Árbitro — Melhor Resposta",
        systemPrompt: "Compare as duas respostas anteriores e determine qual é mais precisa, completa e útil. Justifique.",
        transformMode: "passthrough",
        timeoutMs: 60_000,
      },
    ],
  },
  {
    name: "Relatório Técnico OPERIS",
    description: "Análise → Formatação → Tradução PT-BR",
    category: "report",
    saveResult: true,
    steps: [
      {
        id: "step-1",
        model: "deepseek-r1",
        label: "DeepSeek: Análise Técnica",
        systemPrompt: "Analise tecnicamente e produza um relatório detalhado.",
        transformMode: "passthrough",
        timeoutMs: 120_000,
      },
      {
        id: "step-2",
        model: "gemma2",
        label: "Gemma 2: Formatação",
        systemPrompt: "Formate o relatório com seções, tabelas e conclusões claras.",
        transformMode: "critique",
        timeoutMs: 90_000,
      },
      {
        id: "step-3",
        model: "qwen2",
        label: "Qwen 2: Revisão Multilíngue",
        systemPrompt: "Revise o texto garantindo clareza em português brasileiro técnico.",
        transformMode: "translate_pt",
        timeoutMs: 60_000,
      },
    ],
  },
  {
    name: "Teste Rápido (1 IA)",
    description: "Teste direto com um único modelo",
    category: "test",
    saveResult: false,
    steps: [
      {
        id: "step-1",
        model: "llama3",
        label: "Llama 3: Resposta Direta",
        transformMode: "passthrough",
        timeoutMs: 60_000,
      },
    ],
  },
];

// ─── Executor de Pipeline ─────────────────────────────────────────────────────
export async function executePipeline(
  pipeline: Pipeline,
  onStepComplete?: (step: StepResult) => void
): Promise<PipelineResult> {
  const startedAt = new Date().toISOString();
  const pipelineStart = Date.now();
  const stepResults: StepResult[] = [];
  let currentInput = pipeline.initialPrompt;
  let finalOutput = "";

  for (const step of pipeline.steps) {
    const stepStart = Date.now();
    const stepStartedAt = new Date().toISOString();

    // Construir o prompt para esta etapa
    let prompt = currentInput;

    if (step.transformMode !== "passthrough" && step.transformMode !== "custom") {
      const template = TRANSFORM_PROMPTS[step.transformMode] ?? TRANSFORM_PROMPTS.passthrough;
      prompt = template.replace("{{input}}", currentInput);
    } else if (step.transformMode === "custom" && step.promptTemplate) {
      prompt = step.promptTemplate
        .replace("{{input}}", currentInput)
        .replace("{{initialPrompt}}", pipeline.initialPrompt);
    }

    let stepResult: StepResult;

    try {
      const result = await runOllamaPrompt(
        step.model,
        prompt,
        step.systemPrompt,
        step.timeoutMs
      );

      stepResult = {
        stepId: step.id,
        model: step.model,
        label: step.label,
        input: prompt.slice(0, 500) + (prompt.length > 500 ? "..." : ""),
        output: result.response,
        durationMs: result.durationMs,
        tokensPerSecond: result.tokensPerSecond,
        promptTokens: result.promptTokens,
        responseTokens: result.responseTokens,
        status: "success",
        startedAt: stepStartedAt,
        completedAt: new Date().toISOString(),
      };

      // A saída desta etapa é a entrada da próxima
      currentInput = result.response;
      finalOutput = result.response;

    } catch (error: any) {
      const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");

      stepResult = {
        stepId: step.id,
        model: step.model,
        label: step.label,
        input: prompt.slice(0, 500),
        output: "",
        durationMs: Date.now() - stepStart,
        tokensPerSecond: 0,
        promptTokens: 0,
        responseTokens: 0,
        status: isTimeout ? "timeout" : "error",
        error: error.message ?? "Erro desconhecido",
        startedAt: stepStartedAt,
        completedAt: new Date().toISOString(),
      };

      // Em caso de erro, manter o input atual para a próxima etapa
    }

    stepResults.push(stepResult);
    onStepComplete?.(stepResult);

    // Se houve erro crítico, parar o pipeline
    if (stepResult.status === "error") break;
  }

  const totalDurationMs = Date.now() - pipelineStart;
  const totalTokens = stepResults.reduce((sum, s) => sum + s.responseTokens, 0);
  const hasErrors = stepResults.some(s => s.status === "error");
  const hasTimeouts = stepResults.some(s => s.status === "timeout");
  const allSuccess = stepResults.every(s => s.status === "success");

  return {
    pipelineId: pipeline.id,
    pipelineName: pipeline.name,
    status: allSuccess ? "completed" : hasErrors ? "failed" : "partial",
    steps: stepResults,
    finalOutput,
    totalDurationMs,
    totalTokens,
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

// ─── Alert Engine — Monitoramento de Saúde das IAs ───────────────────────────
export interface AIAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  type: "temperature" | "vram" | "timeout" | "offline" | "slow_response" | "model_error";
  model: string | null;
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
  resolved: boolean;
}

const activeAlerts: AIAlert[] = [];

export function createAlert(
  severity: AIAlert["severity"],
  type: AIAlert["type"],
  model: string | null,
  message: string,
  value?: number,
  threshold?: number
): AIAlert {
  const alert: AIAlert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    severity,
    type,
    model,
    message,
    value,
    threshold,
    timestamp: new Date().toISOString(),
    resolved: false,
  };

  activeAlerts.unshift(alert);

  // Manter apenas os últimos 100 alertas
  if (activeAlerts.length > 100) activeAlerts.splice(100);

  return alert;
}

export function getActiveAlerts(): AIAlert[] {
  return activeAlerts.filter(a => !a.resolved);
}

export function getAllAlerts(limit = 50): AIAlert[] {
  return activeAlerts.slice(0, limit);
}

export function resolveAlert(alertId: string): boolean {
  const alert = activeAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
    return true;
  }
  return false;
}

// ─── Verificação automática de saúde das IAs ──────────────────────────────────
export async function checkAIHealth(stats: {
  cpuTemp?: number;
  gpuTemp?: number;
  vramUsedMB?: number;
  vramTotalMB?: number;
  ollamaOnline?: boolean;
  activeModel?: string | null;
  lastResponseMs?: number;
}): Promise<AIAlert[]> {
  const newAlerts: AIAlert[] = [];

  // Temperatura CPU
  if (stats.cpuTemp !== undefined) {
    if (stats.cpuTemp >= 90) {
      newAlerts.push(createAlert("critical", "temperature", null,
        `CPU em temperatura crítica: ${stats.cpuTemp}°C — Risco de throttling severo!`,
        stats.cpuTemp, 90));
    } else if (stats.cpuTemp >= 75) {
      newAlerts.push(createAlert("warning", "temperature", null,
        `CPU aquecendo: ${stats.cpuTemp}°C — Monitorar de perto`,
        stats.cpuTemp, 75));
    }
  }

  // Temperatura GPU
  if (stats.gpuTemp !== undefined) {
    if (stats.gpuTemp >= 85) {
      newAlerts.push(createAlert("critical", "temperature", stats.activeModel,
        `GPU em temperatura crítica: ${stats.gpuTemp}°C — Reduzir carga da IA!`,
        stats.gpuTemp, 85));
    } else if (stats.gpuTemp >= 70) {
      newAlerts.push(createAlert("warning", "temperature", stats.activeModel,
        `GPU aquecendo: ${stats.gpuTemp}°C`,
        stats.gpuTemp, 70));
    }
  }

  // VRAM
  if (stats.vramUsedMB !== undefined && stats.vramTotalMB !== undefined && stats.vramTotalMB > 0) {
    const vramPercent = (stats.vramUsedMB / stats.vramTotalMB) * 100;
    if (vramPercent >= 95) {
      newAlerts.push(createAlert("critical", "vram", stats.activeModel,
        `VRAM quase esgotada: ${vramPercent.toFixed(1)}% (${stats.vramUsedMB}MB / ${stats.vramTotalMB}MB)`,
        vramPercent, 95));
    } else if (vramPercent >= 80) {
      newAlerts.push(createAlert("warning", "vram", stats.activeModel,
        `VRAM em uso elevado: ${vramPercent.toFixed(1)}%`,
        vramPercent, 80));
    }
  }

  // Ollama offline
  if (stats.ollamaOnline === false) {
    newAlerts.push(createAlert("critical", "offline", null,
      "Serviço Ollama está offline — Nenhuma IA disponível!"));
  }

  // Resposta lenta
  if (stats.lastResponseMs !== undefined && stats.lastResponseMs > 30_000) {
    newAlerts.push(createAlert("warning", "slow_response", stats.activeModel,
      `Resposta lenta detectada: ${(stats.lastResponseMs / 1000).toFixed(1)}s`,
      stats.lastResponseMs, 30_000));
  }

  return newAlerts;
}

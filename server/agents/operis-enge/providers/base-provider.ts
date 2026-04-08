/**
 * OPERIS.enge — Base Provider Interface
 *
 * Qualquer IA pode ser conectada ao OPERIS.enge implementando esta interface.
 * Providers disponíveis para implementar:
 *   - providers/anthropic.provider.ts  → Claude (Haiku / Sonnet / Opus)
 *   - providers/openai.provider.ts     → GPT-4o / GPT-4 Turbo
 *   - providers/gemini.provider.ts     → Gemini Pro / Flash
 *   - providers/ollama.provider.ts     → Modelos locais (Llama3, Mistral, etc.)
 *   - providers/groq.provider.ts       → Groq (Llama3 ultra-rápido, gratuito)
 *   - providers/custom.provider.ts     → Qualquer API REST compatível
 *
 * COMO CRIAR UM NOVO PROVIDER:
 * ─────────────────────────────
 * import { BaseProvider, ProviderMessage, ProviderResponse } from "./base-provider";
 * import { AgentConfig, AgentTask, AgentTaskResult } from "../registry";
 *
 * export class MeuProvider extends BaseProvider {
 *   constructor() {
 *     super({
 *       id: "meu-agente",
 *       name: "Meu Agente",
 *       description: "Descrição do que faz",
 *       provider: "meu-provedor",
 *       model: "meu-modelo",
 *       capabilities: ["text-analysis"],
 *       tier: "paid",
 *       requiresApiKey: true,
 *       apiKeyEnvVar: "MEU_API_KEY",
 *       timeoutMs: 30000,
 *       maxContextTokens: 8192,
 *       costPer1kInputTokens: 0.001,
 *       costPer1kOutputTokens: 0.002,
 *     });
 *   }
 *
 *   async callApi(messages: ProviderMessage[], options?: Record<string, unknown>): Promise<ProviderResponse> {
 *     // Implementar chamada à API aqui
 *     const apiKey = process.env[this.config.apiKeyEnvVar!];
 *     // ... lógica de chamada ...
 *     return { text: "resposta", tokensUsed: 100 };
 *   }
 * }
 *
 * // Registrar no index.ts:
 * import { MeuProvider } from "./providers/meu.provider";
 * engeRegistry.register(new MeuProvider());
 */

import type { AgentConfig, AgentProvider, AgentStatus, AgentTask, AgentTaskResult } from "../registry";

export interface ProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderResponse {
  text: string;
  tokensUsed?: number;
  model?: string;
  metadata?: Record<string, unknown>;
}

export abstract class BaseProvider implements AgentProvider {
  constructor(public readonly config: AgentConfig) {}

  /** Verifica se a chave de API está configurada */
  async healthCheck(): Promise<AgentStatus> {
    if (this.config.requiresApiKey && this.config.apiKeyEnvVar) {
      const key = process.env[this.config.apiKeyEnvVar];
      if (!key || key.trim() === "") {
        return "unconfigured";
      }
    }
    if (this.config.baseUrl) {
      try {
        const res = await fetch(this.config.baseUrl, { method: "GET", signal: AbortSignal.timeout(3000) });
        return res.ok ? "available" : "error";
      } catch {
        return "offline";
      }
    }
    return "available";
  }

  /** Executa uma tarefa convertendo para mensagens e chamando a API */
  async execute(task: AgentTask): Promise<AgentTaskResult> {
    const messages = this.buildMessages(task);
    const response = await this.callApi(messages, task.input.options);

    return {
      text: response.text,
      metadata: {
        model: response.model ?? this.config.model,
        tokensUsed: response.tokensUsed,
        provider: this.config.provider,
      },
      logs: [`[${this.config.name}] Tarefa ${task.taskId} concluída em ${new Date().toISOString()}`],
    };
  }

  /** Constrói as mensagens a partir da tarefa */
  protected buildMessages(task: AgentTask): ProviderMessage[] {
    const systemPrompt = this.getSystemPrompt(task.type);
    const userContent = task.input.prompt ?? task.input.text ?? JSON.stringify(task.input);

    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ];
  }

  /** Prompt de sistema padrão por tipo de tarefa */
  protected getSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      "text-analysis": "Você é um engenheiro especialista em sistemas de proteção contra incêndio. Analise o texto fornecido e identifique conformidades e não-conformidades com as normas NBR, NFPA e ITs do CBMMG.",
      "normative-check": "Você é um especialista em normas técnicas de segurança contra incêndio (NBR 12962, NFPA 10, NBR 12779, NBR 14518, IT-16/CBMMG). Verifique a conformidade do documento com as normas aplicáveis.",
      "report-generation": "Você é um engenheiro responsável pela geração de laudos técnicos de inspeção. Gere um laudo profissional, objetivo e tecnicamente preciso com base nas informações fornecidas.",
      "pdf-extraction": "Extraia e estruture as informações técnicas relevantes do documento. Identifique: tipo de equipamento, normas aplicáveis, datas de manutenção, responsável técnico e não-conformidades.",
      "web-search": "Você é um pesquisador técnico especializado em normas de segurança contra incêndio. Analise e sintetize as informações encontradas.",
      "data-extraction": "Extraia dados estruturados do conteúdo fornecido. Retorne em formato JSON com campos claramente identificados.",
      "custom": "Você é o OPERIS.enge, assistente de engenharia especializado em sistemas de proteção contra incêndio. Responda com precisão técnica.",
    };
    return prompts[type] ?? prompts["custom"]!;
  }

  /** Implementar: chamada real à API do provider */
  abstract callApi(
    messages: ProviderMessage[],
    options?: Record<string, unknown>
  ): Promise<ProviderResponse>;
}

// ─── Provider Nativo OPERIS (usa invokeLLM do Manus) ─────────────────────────
// Este é o único provider pré-instalado — usa a IA nativa do Manus sem custo adicional.
// Todos os outros providers precisam ser configurados com chave de API.

import { invokeLLM } from "../../../_core/llm";

export class OperisNativeProvider extends BaseProvider {
  constructor() {
    super({
      id: "operis-native",
      name: "OPERIS Native (Manus AI)",
      description: "Provider nativo do OPERIS usando a IA integrada do Manus. Sem custo adicional, sem configuração.",
      provider: "manus",
      model: "built-in",
      capabilities: [
        "text-analysis",
        "normative-check",
        "report-generation",
        "pdf-extraction",
        "data-extraction",
        "custom",
      ],
      tier: "free",
      requiresApiKey: false,
      timeoutMs: 60000,
      maxContextTokens: 32000,
      costPer1kInputTokens: 0,
      costPer1kOutputTokens: 0,
      meta: { note: "Provider padrão. Sempre disponível. Outros providers requerem chave de API." },
    });
  }

  async callApi(messages: ProviderMessage[]): Promise<ProviderResponse> {
    const response = await invokeLLM({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const content = response.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content : JSON.stringify(content ?? "");

    return {
      text,
      model: "manus-built-in",
      tokensUsed: response.usage?.total_tokens,
    };
  }
}

// ─── Stubs de providers externos (prontos para receber chave de API) ──────────
// Cada um pode ser ativado adicionando a chave de API correspondente.

/**
 * STUB: Anthropic Claude
 * Para ativar: adicione ANTHROPIC_API_KEY nas secrets do projeto
 * Modelos: claude-3-haiku-20240307, claude-3-5-sonnet-20241022, claude-3-opus-20240229
 */
export class AnthropicProviderStub extends BaseProvider {
  constructor(model: "haiku" | "sonnet" | "opus" = "haiku") {
    const models = {
      haiku: { id: "claude-3-haiku-20240307", cost_in: 0.00025, cost_out: 0.00125 },
      sonnet: { id: "claude-3-5-sonnet-20241022", cost_in: 0.003, cost_out: 0.015 },
      opus: { id: "claude-3-opus-20240229", cost_in: 0.015, cost_out: 0.075 },
    };
    const m = models[model];
    super({
      id: `anthropic-${model}`,
      name: `Claude ${model.charAt(0).toUpperCase() + model.slice(1)} (Anthropic)`,
      description: `Anthropic Claude ${model} — análise técnica avançada`,
      provider: "anthropic",
      model: m.id,
      capabilities: ["text-analysis", "normative-check", "report-generation", "data-extraction", "custom"],
      tier: "paid",
      requiresApiKey: true,
      apiKeyEnvVar: "ANTHROPIC_API_KEY",
      timeoutMs: 60000,
      maxContextTokens: 200000,
      costPer1kInputTokens: m.cost_in,
      costPer1kOutputTokens: m.cost_out,
    });
  }

  async callApi(messages: ProviderMessage[]): Promise<ProviderResponse> {
    // Usa o invokeLLM nativo que já tem Anthropic configurado
    const response = await invokeLLM({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const content = response.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content : JSON.stringify(content ?? "");
    return { text, model: this.config.model, tokensUsed: response.usage?.total_tokens };
  }
}

/**
 * STUB: OpenAI GPT
 * Para ativar: adicione OPENAI_API_KEY nas secrets do projeto
 */
export class OpenAIProviderStub extends BaseProvider {
  constructor(model: "gpt-4o" | "gpt-4o-mini" | "gpt-4-turbo" = "gpt-4o-mini") {
    const costs: Record<string, [number, number]> = {
      "gpt-4o": [0.005, 0.015],
      "gpt-4o-mini": [0.00015, 0.0006],
      "gpt-4-turbo": [0.01, 0.03],
    };
    const [cost_in, cost_out] = costs[model] ?? [0.001, 0.002];
    super({
      id: `openai-${model}`,
      name: `OpenAI ${model}`,
      description: `OpenAI ${model} — raciocínio avançado e análise técnica`,
      provider: "openai",
      model,
      capabilities: ["text-analysis", "normative-check", "report-generation", "code-generation", "data-extraction", "custom"],
      tier: "paid",
      requiresApiKey: true,
      apiKeyEnvVar: "OPENAI_API_KEY",
      timeoutMs: 60000,
      maxContextTokens: 128000,
      costPer1kInputTokens: cost_in,
      costPer1kOutputTokens: cost_out,
    });
  }

  async callApi(messages: ProviderMessage[]): Promise<ProviderResponse> {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) throw new Error("OPENAI_API_KEY não configurada");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: this.config.model, messages }),
    });

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as { choices: Array<{ message: { content: string } }>; usage?: { total_tokens: number } };
    return {
      text: data.choices[0]?.message?.content ?? "",
      model: this.config.model,
      tokensUsed: data.usage?.total_tokens,
    };
  }
}

/**
 * STUB: Google Gemini
 * Para ativar: adicione GOOGLE_AI_API_KEY nas secrets do projeto
 */
export class GeminiProviderStub extends BaseProvider {
  constructor(model: "gemini-1.5-pro" | "gemini-1.5-flash" | "gemini-2.0-flash" = "gemini-1.5-flash") {
    super({
      id: `gemini-${model}`,
      name: `Google ${model}`,
      description: `Google Gemini ${model} — multimodal com contexto longo`,
      provider: "google",
      model,
      capabilities: ["text-analysis", "normative-check", "report-generation", "image-analysis", "data-extraction", "custom"],
      tier: "paid",
      requiresApiKey: true,
      apiKeyEnvVar: "GOOGLE_AI_API_KEY",
      timeoutMs: 60000,
      maxContextTokens: 1000000,
      costPer1kInputTokens: model === "gemini-1.5-flash" ? 0.000075 : 0.00125,
      costPer1kOutputTokens: model === "gemini-1.5-flash" ? 0.0003 : 0.005,
    });
  }

  async callApi(messages: ProviderMessage[]): Promise<ProviderResponse> {
    const apiKey = process.env["GOOGLE_AI_API_KEY"];
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY não configurada");

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

    const systemInstruction = messages.find((m) => m.role === "system")?.content;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }>; usageMetadata?: { totalTokenCount: number } };
    return {
      text: data.candidates[0]?.content?.parts[0]?.text ?? "",
      model: this.config.model,
      tokensUsed: data.usageMetadata?.totalTokenCount,
    };
  }
}

/**
 * STUB: Ollama (modelos locais)
 * Para ativar: configure OLLAMA_BASE_URL (padrão: http://localhost:11434)
 * Modelos populares: llama3, mistral, codellama, phi3, gemma2
 */
export class OllamaProviderStub extends BaseProvider {
  constructor(model = "llama3") {
    super({
      id: `ollama-${model}`,
      name: `Ollama ${model} (Local)`,
      description: `Modelo local ${model} via Ollama — 100% privado, sem custo de API`,
      provider: "ollama",
      model,
      capabilities: ["text-analysis", "normative-check", "report-generation", "code-generation", "custom"],
      tier: "local",
      requiresApiKey: false,
      baseUrl: process.env["OLLAMA_BASE_URL"] ?? "http://localhost:11434",
      timeoutMs: 120000,
      maxContextTokens: 8192,
      costPer1kInputTokens: 0,
      costPer1kOutputTokens: 0,
    });
  }

  async callApi(messages: ProviderMessage[]): Promise<ProviderResponse> {
    const baseUrl = this.config.baseUrl ?? "http://localhost:11434";
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.config.model, messages, stream: false }),
    });

    if (!res.ok) throw new Error(`Ollama error: ${res.status}. Certifique-se que o Ollama está rodando em ${baseUrl}`);
    const data = await res.json() as { message: { content: string }; eval_count?: number };
    return {
      text: data.message?.content ?? "",
      model: this.config.model,
      tokensUsed: data.eval_count,
    };
  }
}

/**
 * STUB: Groq (Llama3 ultra-rápido, tier gratuito generoso)
 * Para ativar: adicione GROQ_API_KEY nas secrets do projeto
 */
export class GroqProviderStub extends BaseProvider {
  constructor(model: "llama3-8b-8192" | "llama3-70b-8192" | "mixtral-8x7b-32768" = "llama3-8b-8192") {
    super({
      id: `groq-${model}`,
      name: `Groq ${model}`,
      description: `Groq ${model} — ultra-rápido, tier gratuito disponível`,
      provider: "groq",
      model,
      capabilities: ["text-analysis", "normative-check", "report-generation", "custom"],
      tier: "free",
      requiresApiKey: true,
      apiKeyEnvVar: "GROQ_API_KEY",
      timeoutMs: 30000,
      maxContextTokens: 8192,
      costPer1kInputTokens: 0.0001,
      costPer1kOutputTokens: 0.0001,
    });
  }

  async callApi(messages: ProviderMessage[]): Promise<ProviderResponse> {
    const apiKey = process.env["GROQ_API_KEY"];
    if (!apiKey) throw new Error("GROQ_API_KEY não configurada");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: this.config.model, messages }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
    const data = await res.json() as { choices: Array<{ message: { content: string } }>; usage?: { total_tokens: number } };
    return {
      text: data.choices[0]?.message?.content ?? "",
      model: this.config.model,
      tokensUsed: data.usage?.total_tokens,
    };
  }
}

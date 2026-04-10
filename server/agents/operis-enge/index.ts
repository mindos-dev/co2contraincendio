/**
 * OPERIS.enge — Entry Point
 *
 * Este arquivo inicializa o framework de agentes.
 * Por padrão, apenas o provider nativo do OPERIS é registrado.
 *
 * PARA ADICIONAR NOVOS PROVIDERS:
 * ─────────────────────────────────
 * 1. Descomente o provider desejado abaixo
 * 2. Adicione a chave de API nas secrets do projeto (Settings → Secrets)
 * 3. O provider aparecerá automaticamente no painel OPERIS.enge
 *
 * Providers disponíveis (todos pré-implementados, aguardando chave de API):
 *   - AnthropicProviderStub  → ANTHROPIC_API_KEY
 *   - OpenAIProviderStub     → OPENAI_API_KEY
 *   - GeminiProviderStub     → GOOGLE_AI_API_KEY
 *   - OllamaProviderStub     → OLLAMA_BASE_URL (sem chave, apenas URL do servidor local)
 *   - GroqProviderStub       → GROQ_API_KEY (tier gratuito disponível em console.groq.com)
 */

import { engeRegistry } from "./registry";
import {
  OperisNativeProvider,
  AnthropicProviderStub,
  OpenAIProviderStub,
  GeminiProviderStub,
  OllamaProviderStub,
  GroqProviderStub,
} from "./providers/base-provider";

// ─── Provider nativo (sempre ativo) ──────────────────────────────────────────
engeRegistry.register(new OperisNativeProvider());

// ─── Providers externos (ativar conforme chave disponível) ────────────────────

// Anthropic Claude — descomente quando ANTHROPIC_API_KEY estiver configurada
if (process.env["ANTHROPIC_API_KEY"]) {
  engeRegistry.register(new AnthropicProviderStub("haiku"));
  engeRegistry.register(new AnthropicProviderStub("sonnet"));
}

// OpenAI GPT — descomente quando OPENAI_API_KEY estiver configurada
if (process.env["OPENAI_API_KEY"]) {
  engeRegistry.register(new OpenAIProviderStub("gpt-4o-mini"));
  engeRegistry.register(new OpenAIProviderStub("gpt-4o"));
}

// Google Gemini — descomente quando GOOGLE_AI_API_KEY estiver configurada
if (process.env["GOOGLE_AI_API_KEY"]) {
  engeRegistry.register(new GeminiProviderStub("gemini-1.5-flash"));
}

// Groq (tier gratuito) — descomente quando GROQ_API_KEY estiver configurada
if (process.env["GROQ_API_KEY"]) {
  engeRegistry.register(new GroqProviderStub("llama3-8b-8192"));
}

// Ollama (local) — ativo se OLLAMA_BASE_URL estiver configurada
if (process.env["OLLAMA_BASE_URL"]) {
  const ollamaModel = process.env["OLLAMA_MODEL"] ?? "llama3";
  engeRegistry.register(new OllamaProviderStub(ollamaModel));
}

// ─── Exportações ──────────────────────────────────────────────────────────────
export { engeRegistry } from "./registry";
export type {
  AgentConfig,
  AgentTask,
  AgentTaskInput,
  AgentTaskResult,
  AgentCapability,
  AgentStatus,
  AgentProvider,
} from "./registry";
export { browserWorker } from "./browser/browser-worker";
export { BaseProvider, OperisNativeProvider } from "./providers/base-provider";

// Log de inicialização
const status = engeRegistry.getStatus();
console.info(`[OPERIS.enge] Inicializado — ${status.message}`);

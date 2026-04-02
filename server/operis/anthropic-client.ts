/**
 * OPERIS IA — Anthropic Client
 *
 * Cliente isolado para uso direto do claude-3-haiku via SDK oficial.
 * Usado exclusivamente pelo ai-service.ts do OPERIS.
 *
 * Controles obrigatórios:
 *   - max_tokens ≤ 400 para analyzeItem (JSON estruturado)
 *   - max_tokens ≤ 2048 para generateReport (HTML)
 *   - temperature = 0.2 (determinístico, técnico)
 *   - Fallback seguro: nunca derruba o servidor
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-3-haiku-20240307";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("[OPERIS AI] ANTHROPIC_API_KEY não configurada.");
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Chama claude-3-haiku com controle rígido de tokens.
 * @param systemPrompt  Instrução do sistema (engenheiro técnico)
 * @param userPrompt    Mensagem do usuário
 * @param maxTokens     Limite de tokens na resposta (default: 400)
 * @returns             Texto da resposta
 */
export async function callHaiku(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 400
): Promise<string> {
  // Limite de segurança: truncar prompt se muito longo
  const MAX_PROMPT_CHARS = 8000;
  const safeUser = userPrompt.length > MAX_PROMPT_CHARS
    ? userPrompt.slice(0, MAX_PROMPT_CHARS) + "\n[PROMPT TRUNCADO POR LIMITE DE SEGURANÇA]"
    : userPrompt;

  const client = getClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: Math.min(maxTokens, 2048), // hard cap
    temperature: 0.2,
    system: systemPrompt,
    messages: [{ role: "user", content: safeUser }],
  });

  const block = response.content[0];
  if (!block || block.type !== "text") {
    throw new Error("[OPERIS AI] Resposta inesperada do claude-3-haiku");
  }

  return block.text;
}

/**
 * Valida se a ANTHROPIC_API_KEY está configurada e o modelo responde.
 * Usado em testes de integração.
 */
export async function validateAnthropicConnection(): Promise<boolean> {
  try {
    const result = await callHaiku(
      "You are a test assistant.",
      "Reply with exactly: OK",
      10
    );
    return result.trim().includes("OK");
  } catch {
    return false;
  }
}

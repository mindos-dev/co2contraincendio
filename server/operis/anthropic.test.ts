/**
 * Teste de integração: valida que a ANTHROPIC_API_KEY está configurada
 * e que o claude-3-haiku responde corretamente.
 */

import { describe, it, expect } from "vitest";
import { validateAnthropicConnection } from "./anthropic-client";

describe("Anthropic claude-3-haiku — OPERIS IA", () => {
  it("deve ter ANTHROPIC_API_KEY configurada", () => {
    const key = process.env.ANTHROPIC_API_KEY;
    expect(key, "ANTHROPIC_API_KEY não está configurada").toBeTruthy();
    expect(key?.startsWith("sk-ant-"), "Chave deve começar com sk-ant-").toBe(true);
  });

  it("deve conectar ao claude-3-haiku e receber resposta", async () => {
    const ok = await validateAnthropicConnection();
    expect(ok, "claude-3-haiku não respondeu — verifique a ANTHROPIC_API_KEY").toBe(true);
  }, 30_000);
});

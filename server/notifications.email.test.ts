/**
 * Teste de integração: sendEmail com fallback Manus Forge
 * Valida que o canal de e-mail funciona mesmo sem SMTP configurado
 */
import { describe, it, expect } from "vitest";

describe("sendEmail fallback via Manus Forge", () => {
  it("deve retornar success:true quando BUILT_IN_FORGE_API_URL está disponível", async () => {
    // Garante que SMTP não está configurado para testar o fallback
    const originalHost = process.env.SMTP_HOST;
    delete process.env.SMTP_HOST;

    const { sendEmail } = await import("./notifications");
    const result = await sendEmail(
      "co2contraincendio@gmail.com",
      "Teste OPERIS — Laudo Técnico",
      "Este é um teste do sistema OPERIS IA. O laudo está disponível em: https://co2contra.com/operis/laudo/teste-123"
    );

    // Restaura
    if (originalHost) process.env.SMTP_HOST = originalHost;

    console.log("Resultado sendEmail:", result);
    // Com Forge disponível, deve retornar success:true
    expect(result.channel).toBe("email");
    expect(result.success).toBe(true);
  });
});

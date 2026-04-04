import { describe, it, expect, vi } from "vitest";
import { buildWelcomeEmail } from "./notifications";

// ─── Testes: buildWelcomeEmail ────────────────────────────────────────────────
describe("buildWelcomeEmail", () => {
  it("retorna subject, text e html não-vazios", () => {
    const result = buildWelcomeEmail("João Silva");
    expect(result.subject).toBeTruthy();
    expect(result.text).toBeTruthy();
    expect(result.html).toBeTruthy();
  });

  it("inclui o nome do usuário no texto e no HTML", () => {
    const result = buildWelcomeEmail("Maria Souza");
    expect(result.text).toContain("Maria Souza");
    expect(result.html).toContain("Maria Souza");
  });

  it("inclui o subject correto", () => {
    const result = buildWelcomeEmail("Carlos");
    expect(result.subject).toContain("OPERIS");
    expect(result.subject).toContain("conta");
  });

  it("HTML contém o link de acesso ao OPERIS", () => {
    const result = buildWelcomeEmail("Ana");
    expect(result.html).toContain("co2contra.com/app/login");
  });

  it("HTML contém os 4 recursos disponíveis", () => {
    const result = buildWelcomeEmail("Pedro");
    expect(result.html).toContain("Ordens de Serviço");
    expect(result.html).toContain("Checklists de campo");
    expect(result.html).toContain("Laudos técnicos");
    expect(result.html).toContain("Gestão de equipamentos");
  });

  it("HTML contém os selos normativos", () => {
    const result = buildWelcomeEmail("Técnico");
    expect(result.html).toContain("NBR 12615");
    expect(result.html).toContain("NFPA 12");
    expect(result.html).toContain("UL 300");
  });

  it("texto plano inclui o link de acesso", () => {
    const result = buildWelcomeEmail("Fernanda");
    expect(result.text).toContain("co2contra.com/app/login");
  });

  it("funciona com nomes especiais (acentos, espaços)", () => {
    const result = buildWelcomeEmail("Antônio Gonçalves Júnior");
    expect(result.html).toContain("Antônio Gonçalves Júnior");
    expect(result.text).toContain("Antônio Gonçalves Júnior");
  });
});

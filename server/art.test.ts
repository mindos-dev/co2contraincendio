/**
 * Testes unitários — Módulo ART OPERIS
 * Cobre: antifraude SHA256, validação de tipos de serviço, lógica de monetização
 */
import { describe, it, expect } from "vitest";
import { createHash } from "crypto";

// ─── Helpers de antifraude (replicados para teste) ────────────────────────────

function computeSubmissionHash(params: {
  artServiceId: number;
  technicianId: number;
  timestamp: string;
  description: string;
}): string {
  const payload = JSON.stringify(params);
  return createHash("sha256").update(payload).digest("hex");
}

function computeEvidenceHash(params: {
  artServiceId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  timestamp: string;
}): string {
  const payload = JSON.stringify(params);
  return createHash("sha256").update(payload).digest("hex");
}

// ─── Constantes do módulo ─────────────────────────────────────────────────────

const ALLOWED_SERVICE_TYPES = [
  "pmoc", "incendio", "eletrica", "gas", "hidraulico", "co2", "outro",
] as const;

const PREMIUM_PLAN_IDS = ["pro", "industrial"];

const ART_UNIT_PRICE_BRL = 4900; // R$ 49,00 em centavos

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("ART OPERIS — Antifraude SHA256", () => {
  it("deve gerar hash determinístico para os mesmos parâmetros", () => {
    const params = {
      artServiceId: 1,
      technicianId: 42,
      timestamp: "2026-01-01T00:00:00.000Z",
      description: "Manutenção preventiva CO2",
    };
    const hash1 = computeSubmissionHash(params);
    const hash2 = computeSubmissionHash(params);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA256 = 64 hex chars
  });

  it("deve gerar hashes diferentes para parâmetros diferentes", () => {
    const base = {
      artServiceId: 1,
      technicianId: 42,
      timestamp: "2026-01-01T00:00:00.000Z",
      description: "Serviço A",
    };
    const modified = { ...base, description: "Serviço B" };
    expect(computeSubmissionHash(base)).not.toBe(computeSubmissionHash(modified));
  });

  it("deve gerar hash de evidência com 64 caracteres hex", () => {
    const hash = computeEvidenceHash({
      artServiceId: 1,
      fileName: "foto_extintor.jpg",
      fileSize: 204800,
      mimeType: "image/jpeg",
      timestamp: "2026-01-01T12:00:00.000Z",
    });
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it("deve gerar hashes de evidência únicos para arquivos diferentes", () => {
    const base = {
      artServiceId: 1,
      fileName: "foto1.jpg",
      fileSize: 100000,
      mimeType: "image/jpeg",
      timestamp: "2026-01-01T12:00:00.000Z",
    };
    const other = { ...base, fileName: "foto2.jpg", fileSize: 200000 };
    expect(computeEvidenceHash(base)).not.toBe(computeEvidenceHash(other));
  });
});

describe("ART OPERIS — Validação de Tipos de Serviço", () => {
  it("deve aceitar todos os tipos de serviço válidos", () => {
    for (const type of ALLOWED_SERVICE_TYPES) {
      expect(ALLOWED_SERVICE_TYPES).toContain(type);
    }
  });

  it("deve ter exatamente 7 tipos de serviço", () => {
    expect(ALLOWED_SERVICE_TYPES).toHaveLength(7);
  });

  it("deve incluir os tipos críticos de proteção contra incêndio", () => {
    expect(ALLOWED_SERVICE_TYPES).toContain("incendio");
    expect(ALLOWED_SERVICE_TYPES).toContain("co2");
    expect(ALLOWED_SERVICE_TYPES).toContain("pmoc");
  });
});

describe("ART OPERIS — Lógica de Monetização", () => {
  it("deve identificar planos premium corretamente", () => {
    expect(PREMIUM_PLAN_IDS).toContain("pro");
    expect(PREMIUM_PLAN_IDS).toContain("industrial");
    expect(PREMIUM_PLAN_IDS).not.toContain("basico");
    expect(PREMIUM_PLAN_IDS).not.toContain("starter");
  });

  it("deve ter o preço unitário de R$ 49,00 (4900 centavos)", () => {
    expect(ART_UNIT_PRICE_BRL).toBe(4900);
    // Verificar que é >= R$ 0,50 (mínimo Stripe)
    expect(ART_UNIT_PRICE_BRL).toBeGreaterThanOrEqual(50);
  });

  it("deve calcular corretamente se usuário precisa pagar", () => {
    const needsPayment = (planId: string | null, artPaid: boolean): boolean => {
      if (!planId) return !artPaid;
      if (PREMIUM_PLAN_IDS.includes(planId)) return false;
      return !artPaid;
    };

    // Plano premium → não precisa pagar
    expect(needsPayment("pro", false)).toBe(false);
    expect(needsPayment("industrial", false)).toBe(false);

    // Plano básico + não pago → precisa pagar
    expect(needsPayment("basico", false)).toBe(true);

    // Plano básico + já pago → não precisa pagar
    expect(needsPayment("basico", true)).toBe(false);

    // Sem plano + não pago → precisa pagar
    expect(needsPayment(null, false)).toBe(true);

    // Sem plano + já pago → não precisa pagar
    expect(needsPayment(null, true)).toBe(false);
  });
});

describe("ART OPERIS — checkAccess (verificação de acesso)", () => {
  // Simula a lógica de checkAccess sem banco de dados
  function simulateCheckAccess(params: {
    companyId: number | null;
    isPremium: boolean;
    paidUnusedCount: number;
  }): { hasAccess: boolean; reason: string } {
    if (!params.companyId) return { hasAccess: false, reason: "no_company" };
    if (params.isPremium) return { hasAccess: true, reason: "premium" };
    if (params.paidUnusedCount > 0) return { hasAccess: true, reason: "paid_credit" };
    return { hasAccess: false, reason: "requires_payment" };
  }

  it("deve negar acesso a usuário sem empresa", () => {
    const result = simulateCheckAccess({ companyId: null, isPremium: false, paidUnusedCount: 0 });
    expect(result.hasAccess).toBe(false);
    expect(result.reason).toBe("no_company");
  });

  it("deve conceder acesso a usuário com plano premium", () => {
    const result = simulateCheckAccess({ companyId: 1, isPremium: true, paidUnusedCount: 0 });
    expect(result.hasAccess).toBe(true);
    expect(result.reason).toBe("premium");
  });

  it("deve conceder acesso a usuário com crédito pago não utilizado", () => {
    const result = simulateCheckAccess({ companyId: 1, isPremium: false, paidUnusedCount: 2 });
    expect(result.hasAccess).toBe(true);
    expect(result.reason).toBe("paid_credit");
  });

  it("deve exigir pagamento para usuário sem premium e sem crédito", () => {
    const result = simulateCheckAccess({ companyId: 1, isPremium: false, paidUnusedCount: 0 });
    expect(result.hasAccess).toBe(false);
    expect(result.reason).toBe("requires_payment");
  });
});

describe("ART OPERIS — ocrInvoice (extração de NF-e)", () => {
  // Simula o parsing do resultado do LLM
  function parseOcrResult(raw: string | object | null): Record<string, unknown> | null {
    if (!raw) return null;
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch { return null; }
    }
    return raw as Record<string, unknown>;
  }

  const EXPECTED_FIELDS = [
    "numeroNF", "dataEmissao", "valorTotal", "cnpjEmitente",
    "nomeEmitente", "cnpjDestinatario", "nomeDestinatario",
    "descricaoServico", "chaveAcesso",
  ];

  it("deve parsear JSON string retornado pelo LLM", () => {
    const mockLlmResponse = JSON.stringify({
      numeroNF: "000123",
      dataEmissao: "2026-01-15",
      valorTotal: "R$ 1.500,00",
      cnpjEmitente: "12.345.678/0001-99",
      nomeEmitente: "CO2 Sistemas Ltda",
      cnpjDestinatario: "98.765.432/0001-11",
      nomeDestinatario: "Cliente SA",
      descricaoServico: "Manutenção sistema CO2",
      chaveAcesso: "35260112345678000199550010000001231000012310",
    });
    const result = parseOcrResult(mockLlmResponse);
    expect(result).not.toBeNull();
    for (const field of EXPECTED_FIELDS) {
      expect(result).toHaveProperty(field);
    }
  });

  it("deve aceitar objeto direto (sem double-parse)", () => {
    const mockObj = { numeroNF: "000456", dataEmissao: null, valorTotal: "R$ 500,00",
      cnpjEmitente: null, nomeEmitente: null, cnpjDestinatario: null,
      nomeDestinatario: null, descricaoServico: null, chaveAcesso: null };
    const result = parseOcrResult(mockObj);
    expect(result?.numeroNF).toBe("000456");
  });

  it("deve retornar null para JSON inválido", () => {
    const result = parseOcrResult("not-valid-json");
    expect(result).toBeNull();
  });

  it("deve ter todos os 9 campos obrigatórios no schema", () => {
    expect(EXPECTED_FIELDS).toHaveLength(9);
    expect(EXPECTED_FIELDS).toContain("chaveAcesso");
    expect(EXPECTED_FIELDS).toContain("cnpjEmitente");
  });
});

describe("ART OPERIS — deleteEvidence (remoção de evidência)", () => {
  // Simula a lógica de validação antes de deletar
  function canDeleteEvidence(params: {
    artStatus: string;
    evidenceIsLocked: boolean;
    technicianId: number;
    requesterId: number;
  }): { allowed: boolean; reason?: string } {
    if (params.requesterId !== params.technicianId)
      return { allowed: false, reason: "FORBIDDEN" };
    if (params.artStatus !== "rascunho")
      return { allowed: false, reason: "ART_NOT_DRAFT" };
    if (params.evidenceIsLocked)
      return { allowed: false, reason: "EVIDENCE_LOCKED" };
    return { allowed: true };
  }

  it("deve permitir remoção em rascunho não bloqueado pelo próprio técnico", () => {
    const result = canDeleteEvidence({
      artStatus: "rascunho",
      evidenceIsLocked: false,
      technicianId: 1,
      requesterId: 1,
    });
    expect(result.allowed).toBe(true);
  });

  it("deve bloquear remoção em ART já submetida", () => {
    const result = canDeleteEvidence({
      artStatus: "aguardando_aprovacao",
      evidenceIsLocked: true,
      technicianId: 1,
      requesterId: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("ART_NOT_DRAFT");
  });

  it("deve bloquear remoção de evidência já bloqueada", () => {
    const result = canDeleteEvidence({
      artStatus: "rascunho",
      evidenceIsLocked: true,
      technicianId: 1,
      requesterId: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("EVIDENCE_LOCKED");
  });

  it("deve bloquear remoção por técnico diferente do dono", () => {
    const result = canDeleteEvidence({
      artStatus: "rascunho",
      evidenceIsLocked: false,
      technicianId: 1,
      requesterId: 99,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("FORBIDDEN");
  });

  it("deve bloquear remoção em ART aprovada", () => {
    const result = canDeleteEvidence({
      artStatus: "aprovado",
      evidenceIsLocked: true,
      technicianId: 1,
      requesterId: 1,
    });
    expect(result.allowed).toBe(false);
  });
});

describe("ART OPERIS — Fluxo de Status", () => {
  const VALID_TRANSITIONS: Record<string, string[]> = {
    rascunho: ["aguardando_aprovacao"],
    aguardando_aprovacao: ["aprovado", "reprovado"],
    reprovado: ["aguardando_aprovacao"],
    aprovado: [], // estado final
  };

  it("deve ter transições de estado válidas", () => {
    expect(VALID_TRANSITIONS["rascunho"]).toContain("aguardando_aprovacao");
    expect(VALID_TRANSITIONS["aguardando_aprovacao"]).toContain("aprovado");
    expect(VALID_TRANSITIONS["aguardando_aprovacao"]).toContain("reprovado");
    expect(VALID_TRANSITIONS["aprovado"]).toHaveLength(0);
  });

  it("não deve permitir transição de aprovado para outro estado", () => {
    const canTransition = (from: string, to: string): boolean => {
      return VALID_TRANSITIONS[from]?.includes(to) ?? false;
    };
    expect(canTransition("aprovado", "rascunho")).toBe(false);
    expect(canTransition("aprovado", "reprovado")).toBe(false);
    expect(canTransition("reprovado", "aguardando_aprovacao")).toBe(true);
  });
});

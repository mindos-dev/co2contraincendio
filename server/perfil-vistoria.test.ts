import { describe, it, expect } from "vitest";

// ─── Testes de Validação de Perfil ───────────────────────────────────────────

describe("perfil validation", () => {
  // Simula a lógica de validação do perfil
  const validateProfileUpdate = (data: {
    name?: string;
    cargo?: string;
    crea?: string;
    telefone?: string;
    bio?: string;
  }) => {
    const errors: string[] = [];
    if (data.name !== undefined && data.name.trim().length < 2) {
      errors.push("Nome deve ter pelo menos 2 caracteres");
    }
    if (data.crea !== undefined && data.crea.length > 0 && !/^\d{4,8}(-[A-Z]{2})?$/.test(data.crea)) {
      errors.push("CREA inválido — formato esperado: 12345-MG");
    }
    if (data.telefone !== undefined && data.telefone.length > 0 && !/^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(data.telefone)) {
      errors.push("Telefone inválido — formato esperado: (31) 99999-9999");
    }
    if (data.bio !== undefined && data.bio.length > 500) {
      errors.push("Bio deve ter no máximo 500 caracteres");
    }
    return { valid: errors.length === 0, errors };
  };

  it("deve aceitar perfil válido completo", () => {
    const result = validateProfileUpdate({
      name: "João Silva",
      cargo: "Engenheiro de Segurança",
      crea: "12345-MG",
      telefone: "(31) 99999-9999",
      bio: "Especialista em sistemas de supressão de incêndio.",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("deve rejeitar nome muito curto", () => {
    const result = validateProfileUpdate({ name: "A" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Nome deve ter pelo menos 2 caracteres");
  });

  it("deve aceitar perfil com campos opcionais vazios", () => {
    const result = validateProfileUpdate({ name: "Maria Santos" });
    expect(result.valid).toBe(true);
  });

  it("deve rejeitar bio com mais de 500 caracteres", () => {
    const result = validateProfileUpdate({ bio: "x".repeat(501) });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Bio deve ter no máximo 500 caracteres");
  });

  it("deve aceitar bio com exatamente 500 caracteres", () => {
    const result = validateProfileUpdate({ bio: "x".repeat(500) });
    expect(result.valid).toBe(true);
  });

  it("deve validar campos de perfil independentemente", () => {
    // Apenas cargo e crea — sem name, deve passar
    const result = validateProfileUpdate({
      cargo: "Técnico de Segurança",
      crea: "67890-SP",
    });
    expect(result.valid).toBe(true);
  });
});

// ─── Testes de Validação de Vistoria ─────────────────────────────────────────

describe("vistoria validation", () => {
  // Simula a lógica de validação de vistoria
  const INSPECTION_TYPES = ["entrada", "saida", "periodica", "emergencia"] as const;
  type InspectionType = typeof INSPECTION_TYPES[number];

  const validateVistoria = (data: {
    tipo: string;
    endereco: string;
    vistoriadorNome: string;
    inquilinoNome?: string;
  }) => {
    const errors: string[] = [];
    if (!INSPECTION_TYPES.includes(data.tipo as InspectionType)) {
      errors.push("Tipo de vistoria inválido");
    }
    if (!data.endereco || data.endereco.trim().length < 10) {
      errors.push("Endereço deve ter pelo menos 10 caracteres");
    }
    if (!data.vistoriadorNome || data.vistoriadorNome.trim().length < 2) {
      errors.push("Nome do vistoriador é obrigatório");
    }
    return { valid: errors.length === 0, errors };
  };

  it("deve aceitar vistoria de entrada válida", () => {
    const result = validateVistoria({
      tipo: "entrada",
      endereco: "Rua das Flores, 123, Belo Horizonte, MG",
      vistoriadorNome: "Carlos Oliveira",
      inquilinoNome: "Ana Paula",
    });
    expect(result.valid).toBe(true);
  });

  it("deve aceitar todos os tipos de vistoria válidos", () => {
    for (const tipo of INSPECTION_TYPES) {
      const result = validateVistoria({
        tipo,
        endereco: "Av. Principal, 456, São Paulo, SP",
        vistoriadorNome: "Técnico Responsável",
      });
      expect(result.valid).toBe(true);
    }
  });

  it("deve rejeitar tipo de vistoria inválido", () => {
    const result = validateVistoria({
      tipo: "tipo_invalido",
      endereco: "Rua das Flores, 123, Belo Horizonte, MG",
      vistoriadorNome: "Carlos Oliveira",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Tipo de vistoria inválido");
  });

  it("deve rejeitar endereço muito curto", () => {
    const result = validateVistoria({
      tipo: "entrada",
      endereco: "Rua 1",
      vistoriadorNome: "Carlos Oliveira",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Endereço deve ter pelo menos 10 caracteres");
  });

  it("deve rejeitar vistoriador sem nome", () => {
    const result = validateVistoria({
      tipo: "saida",
      endereco: "Rua das Flores, 123, Belo Horizonte, MG",
      vistoriadorNome: "A",
    });
    expect(result.valid).toBe(false);
  });

  it("deve aceitar vistoria sem inquilino (campo opcional)", () => {
    const result = validateVistoria({
      tipo: "periodica",
      endereco: "Rua das Flores, 123, Belo Horizonte, MG",
      vistoriadorNome: "Carlos Oliveira",
    });
    expect(result.valid).toBe(true);
  });
});

// ─── Testes de Estado de Itens de Vistoria ───────────────────────────────────

describe("vistoria item states", () => {
  const VALID_STATES = ["otimo", "bom", "regular", "ruim", "inexistente", "nao_aplicavel"] as const;
  type ItemState = typeof VALID_STATES[number];

  const isValidItemState = (state: string): state is ItemState => {
    return VALID_STATES.includes(state as ItemState);
  };

  it("deve aceitar todos os estados válidos de item", () => {
    for (const state of VALID_STATES) {
      expect(isValidItemState(state)).toBe(true);
    }
  });

  it("deve rejeitar estados inválidos", () => {
    expect(isValidItemState("perfeito")).toBe(false);
    expect(isValidItemState("")).toBe(false);
    expect(isValidItemState("danificado")).toBe(false);
  });

  it("deve calcular score de conformidade corretamente", () => {
    const calculateConformityScore = (items: ItemState[]) => {
      const applicable = items.filter(s => s !== "nao_aplicavel");
      if (applicable.length === 0) return 100;
      const good = applicable.filter(s => s === "otimo" || s === "bom").length;
      return Math.round((good / applicable.length) * 100);
    };

    expect(calculateConformityScore(["otimo", "bom", "bom"])).toBe(100);
    expect(calculateConformityScore(["otimo", "regular", "ruim"])).toBe(33);
    expect(calculateConformityScore(["nao_aplicavel", "otimo"])).toBe(100);
    expect(calculateConformityScore(["ruim", "ruim", "ruim"])).toBe(0);
  });
});

// ─── Testes de Assinatura Digital ────────────────────────────────────────────

describe("vistoria signature", () => {
  it("deve validar base64 de assinatura", () => {
    const isValidSignatureBase64 = (data: string) => {
      return typeof data === "string" && data.startsWith("data:image/") && data.length > 100;
    };
    expect(isValidSignatureBase64("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")).toBe(true);
    expect(isValidSignatureBase64("")).toBe(false);
    expect(isValidSignatureBase64("not-base64")).toBe(false);
  });

  it("deve identificar tipo de assinante corretamente", () => {
    const SIGNER_TYPES = ["vistoriador", "inquilino", "proprietario", "testemunha"] as const;
    type SignerType = typeof SIGNER_TYPES[number];

    const isValidSignerType = (type: string): type is SignerType => {
      return SIGNER_TYPES.includes(type as SignerType);
    };

    expect(isValidSignerType("vistoriador")).toBe(true);
    expect(isValidSignerType("inquilino")).toBe(true);
    expect(isValidSignerType("admin")).toBe(false);
  });
});

/**
 * OPERIS Core Engine — Motor Central de Validação Normativa
 * Versão: 2.0 | Padrão: NBR 12962, NFPA 10, NBR 12779, NR-23, IT-16/CBMMG
 *
 * Responsabilidades:
 *  - Classificação de equipamentos por categoria e norma aplicável
 *  - Cálculo de datas de vencimento normativas
 *  - Avaliação de risco (R1–R5) com regras determinísticas
 *  - Validação de conformidade de registros de manutenção
 *  - Geração de auditHash para rastreabilidade
 */

import { createHash } from "crypto";

// ─── Tipos de Domínio ────────────────────────────────────────────────────────

export type RiskLevel = "R1" | "R2" | "R3" | "R4" | "R5";
export type EquipmentCategory =
  | "extintor"
  | "hidrante"
  | "sprinkler"
  | "detector"
  | "mangueira"
  | "bomba"
  | "painel"
  | "sinalizacao"
  | "complementar";

export type NormativeLayout = "A" | "B" | "C" | "D";

export interface EquipmentClassification {
  layout: NormativeLayout;
  norm: string;
  validityDays: number;
  description: string;
}

export interface MaintenanceValidation {
  isValid: boolean;
  daysUntilExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // dentro de 30 dias
  nextDueDate: Date;
  riskLevel: RiskLevel;
  violations: string[];
}

export interface AuditRecord {
  hash: string;
  timestamp: string;
  equipmentCode: string;
  technicianId?: string;
  provider: string;
  isThirdParty: boolean;
}

// ─── Constantes Normativas ───────────────────────────────────────────────────

const NORMATIVE_VALIDITY: Record<NormativeLayout, number> = {
  A: 365,   // NBR 12962 — extintores padrão
  B: 1825,  // NFPA 10 / UL-300 — Classe K / saponificante (5 anos)
  C: 365,   // NBR 12779 — mangueiras / hidrantes / sprinklers
  D: 30,    // Logbook operacional — casas de bombas (mensal)
};

const NORM_DESCRIPTIONS: Record<NormativeLayout, string> = {
  A: "NBR 12962:2016 — Inspeção, manutenção e recarga de extintores",
  B: "NFPA 10 / UL-300 — Extintores Classe K e agentes saponificantes",
  C: "NBR 12779:2009 — Mangueiras de incêndio e sistemas hidráulicos",
  D: "NR-23 / IT-16 CBMMG — Logbook operacional de sistemas fixos",
};

const CO2_PROVIDER_CANONICAL = "CO2 Contra Incêndio";

// ─── Classificação de Equipamentos ──────────────────────────────────────────

/**
 * Determina o layout normativo com base na categoria e tipo de agente.
 * Prioridade: agentType > category > subType
 */
export function classifyEquipment(
  category: string,
  agentType?: string,
  subType?: string
): EquipmentClassification {
  const cat = (category ?? "").toLowerCase();
  const agent = (agentType ?? "").toLowerCase();
  const sub = (subType ?? "").toLowerCase();

  // Layout B — Classe K / Saponificante
  if (
    agent.includes("saponificante") ||
    agent.includes("classe k") ||
    agent.includes("k-class") ||
    agent.includes("k class") ||
    sub.includes("saponificante")
  ) {
    return { layout: "B", norm: NORM_DESCRIPTIONS.B, validityDays: NORMATIVE_VALIDITY.B, description: "Extintor Classe K / Saponificante" };
  }

  // Layout C — Sistemas Hidráulicos
  if (
    cat === "hidrante" ||
    cat === "sprinkler" ||
    cat === "mangueira" ||
    sub.includes("mangueira") ||
    sub.includes("hidrante") ||
    sub.includes("sprinkler") ||
    sub.includes("chuveiro")
  ) {
    return { layout: "C", norm: NORM_DESCRIPTIONS.C, validityDays: NORMATIVE_VALIDITY.C, description: "Sistema Hidráulico (Hidrante/Sprinkler/Mangueira)" };
  }

  // Layout D — Sistemas Fixos / Logbook
  if (
    cat === "detector" ||
    cat === "sinalizacao" ||
    cat === "complementar" ||
    cat === "bomba" ||
    cat === "painel" ||
    sub.includes("bomba") ||
    sub.includes("painel") ||
    sub.includes("central") ||
    sub.includes("detector") ||
    sub.includes("alarme")
  ) {
    return { layout: "D", norm: NORM_DESCRIPTIONS.D, validityDays: NORMATIVE_VALIDITY.D, description: "Sistema Fixo / Casa de Bombas / Detecção" };
  }

  // Layout A — Extintor padrão (default)
  return { layout: "A", norm: NORM_DESCRIPTIONS.A, validityDays: NORMATIVE_VALIDITY.A, description: "Extintor de Incêndio (NBR 12962)" };
}

// ─── Cálculo de Datas Normativas ─────────────────────────────────────────────

/**
 * Calcula a próxima data de manutenção normativa.
 * Se fromDate não for fornecida, usa a data atual.
 */
export function calcNormativeExpiry(
  layout: NormativeLayout,
  fromDate?: Date | string | number
): Date {
  const base = fromDate ? new Date(fromDate) : new Date();
  const days = NORMATIVE_VALIDITY[layout];
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Valida um registro de manutenção contra as regras normativas.
 */
export function validateMaintenance(
  layout: NormativeLayout,
  lastMaintenanceDate?: Date | string | number | null,
  nextMaintenanceDate?: Date | string | number | null
): MaintenanceValidation {
  const now = new Date();
  const violations: string[] = [];

  // Determinar a data de vencimento
  let nextDue: Date;
  if (nextMaintenanceDate) {
    nextDue = new Date(nextMaintenanceDate);
  } else if (lastMaintenanceDate) {
    nextDue = calcNormativeExpiry(layout, lastMaintenanceDate);
  } else {
    // Sem histórico — considera vencido
    nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() - 1);
    violations.push("Sem registro de manutenção anterior");
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilExpiry = Math.floor((nextDue.getTime() - now.getTime()) / msPerDay);
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = !isExpired && daysUntilExpiry <= 30;

  // Regras de violação
  if (isExpired) {
    violations.push(`Manutenção vencida há ${Math.abs(daysUntilExpiry)} dia(s)`);
  }
  if (isExpiringSoon) {
    violations.push(`Manutenção vence em ${daysUntilExpiry} dia(s)`);
  }
  if (!lastMaintenanceDate && !nextMaintenanceDate) {
    violations.push("Equipamento sem histórico de manutenção");
  }

  // Nível de risco baseado em dias restantes
  let riskLevel: RiskLevel;
  if (isExpired && daysUntilExpiry < -90) {
    riskLevel = "R5"; // Crítico — mais de 90 dias vencido
  } else if (isExpired) {
    riskLevel = "R4"; // Alto — vencido
  } else if (isExpiringSoon && daysUntilExpiry <= 7) {
    riskLevel = "R3"; // Médio-alto — vence em 7 dias
  } else if (isExpiringSoon) {
    riskLevel = "R2"; // Médio — vence em 30 dias
  } else {
    riskLevel = "R1"; // Conforme
  }

  return {
    isValid: violations.length === 0,
    daysUntilExpiry,
    isExpired,
    isExpiringSoon,
    nextDueDate: nextDue,
    riskLevel,
    violations,
  };
}

// ─── Geração de AuditHash ────────────────────────────────────────────────────

/**
 * Gera um hash SHA-256 determinístico para rastreabilidade de auditoria.
 * O hash é baseado em: código do equipamento + timestamp + provider + layout.
 */
export function generateAuditHash(
  equipmentCode: string,
  provider: string,
  layout: NormativeLayout,
  timestamp?: Date
): string {
  const ts = (timestamp ?? new Date()).toISOString();
  const payload = `${equipmentCode}|${provider}|${layout}|${ts}`;
  return createHash("sha256").update(payload).digest("hex").substring(0, 32).toUpperCase();
}

/**
 * Cria um registro de auditoria completo.
 */
export function createAuditRecord(
  equipmentCode: string,
  provider: string,
  layout: NormativeLayout,
  technicianId?: string
): AuditRecord {
  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(equipmentCode, provider, layout, new Date(timestamp));
  const isThirdParty = provider.trim().toLowerCase() !== CO2_PROVIDER_CANONICAL.toLowerCase();

  return {
    hash,
    timestamp,
    equipmentCode,
    technicianId,
    provider,
    isThirdParty,
  };
}

// ─── Avaliação de Risco por Texto ────────────────────────────────────────────

/**
 * Avalia o nível de risco com base em palavras-chave do texto de inspeção.
 * Compatível com o risk-engine existente.
 */
export function assessRiskFromText(text: string): RiskLevel {
  const t = text.toLowerCase();

  const r5Keywords = ["inoperante", "não funciona", "nao funciona", "inutilizável", "destruído", "ausente", "faltando", "sem extintor"];
  const r4Keywords = ["vazamento", "corrosão severa", "lacre violado", "pressão zero", "vencido há", "vencido a mais"];
  const r3Keywords = ["necessita revisão", "desgaste", "corrosão leve", "pressão baixa", "vencendo", "próximo vencimento"];
  const r2Keywords = ["atenção", "verificar", "monitorar", "pequeno dano", "leve"];

  if (r5Keywords.some(k => t.includes(k))) return "R5";
  if (r4Keywords.some(k => t.includes(k))) return "R4";
  if (r3Keywords.some(k => t.includes(k))) return "R3";
  if (r2Keywords.some(k => t.includes(k))) return "R2";
  return "R1";
}

// ─── Formatação de Datas ─────────────────────────────────────────────────────

export function formatDateBR(date: Date | string | number): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTimeBR(date: Date | string | number): string {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Constantes Exportadas ───────────────────────────────────────────────────

export const ENGINE_VERSION = "2.0.0";
export const CO2_COMPANY = {
  name: CO2_PROVIDER_CANONICAL,
  cnpj: "XX.XXX.XXX/0001-XX",
  city: "Belo Horizonte/MG",
  engineer: "Judson Aleixo Sampaio",
  crea: "CREA/MG 142203671-5",
  ul: "UL Listed",
};

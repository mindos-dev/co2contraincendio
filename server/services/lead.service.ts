/**
 * OPERIS Lead Service — Captura e Qualificação de Leads
 * Versão: 2.0
 *
 * Responsabilidades:
 *  - Captura estruturada de leads do site CO₂
 *  - Qualificação automática por segmento e urgência
 *  - Notificação imediata ao owner via sistema interno
 *  - Persistência no banco de dados
 */

import { notifyOwner } from "../_core/notification";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type LeadSource =
  | "home_hero"
  | "home_cta"
  | "servico_co2"
  | "servico_hidrante"
  | "servico_sprinkler"
  | "servico_manutencao"
  | "blog"
  | "planos"
  | "whatsapp"
  | "contato_direto";

export type LeadSegment =
  | "residencial"
  | "comercial"
  | "industrial"
  | "condominio"
  | "hospital"
  | "escola"
  | "outro";

export type LeadUrgency = "imediata" | "esta_semana" | "este_mes" | "planejamento";

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  segment?: LeadSegment;
  urgency?: LeadUrgency;
  message?: string;
  source: LeadSource;
  serviceType?: string;
  equipmentCount?: number;
}

export interface QualifiedLead extends LeadInput {
  score: number;           // 0-100
  priority: "high" | "medium" | "low";
  estimatedValue: string;
  tags: string[];
  capturedAt: string;
}

// ─── Qualificação de Lead ────────────────────────────────────────────────────

/**
 * Qualifica um lead com base em critérios de negócio.
 * Score 0-100: quanto maior, maior a prioridade de atendimento.
 */
export function qualifyLead(input: LeadInput): QualifiedLead {
  let score = 0;
  const tags: string[] = [];

  // Pontuação por segmento
  const segmentScores: Record<LeadSegment, number> = {
    industrial:   30,
    hospital:     28,
    condominio:   25,
    comercial:    22,
    escola:       20,
    residencial:  15,
    outro:        10,
  };
  if (input.segment) {
    score += segmentScores[input.segment] ?? 10;
    tags.push(input.segment);
  }

  // Pontuação por urgência
  const urgencyScores: Record<LeadUrgency, number> = {
    imediata:       30,
    esta_semana:    25,
    este_mes:       15,
    planejamento:   5,
  };
  if (input.urgency) {
    score += urgencyScores[input.urgency] ?? 5;
    tags.push(input.urgency);
  }

  // Pontuação por quantidade de equipamentos
  if (input.equipmentCount) {
    if (input.equipmentCount >= 50) { score += 20; tags.push("grande_porte"); }
    else if (input.equipmentCount >= 20) { score += 15; tags.push("medio_porte"); }
    else if (input.equipmentCount >= 5) { score += 10; tags.push("pequeno_porte"); }
    else { score += 5; }
  }

  // Pontuação por completude dos dados
  if (input.phone) { score += 5; tags.push("telefone_informado"); }
  if (input.company) { score += 5; tags.push("empresa_informada"); }
  if (input.message && input.message.length > 50) { score += 5; tags.push("mensagem_detalhada"); }

  // Pontuação por fonte
  const sourceScores: Record<LeadSource, number> = {
    contato_direto:     10,
    planos:             8,
    servico_co2:        7,
    servico_manutencao: 7,
    servico_hidrante:   6,
    servico_sprinkler:  6,
    home_cta:           5,
    home_hero:          4,
    blog:               3,
    whatsapp:           3,
  };
  score += sourceScores[input.source] ?? 3;

  // Determinar prioridade
  const priority: "high" | "medium" | "low" =
    score >= 60 ? "high" :
    score >= 35 ? "medium" :
    "low";

  // Estimar valor do contrato
  const estimatedValue = estimateContractValue(input);

  return {
    ...input,
    score: Math.min(score, 100),
    priority,
    estimatedValue,
    tags,
    capturedAt: new Date().toISOString(),
  };
}

function estimateContractValue(input: LeadInput): string {
  const count = input.equipmentCount ?? 1;
  const segment = input.segment ?? "comercial";

  const basePerUnit: Record<LeadSegment, number> = {
    industrial:   350,
    hospital:     400,
    condominio:   280,
    comercial:    250,
    escola:       220,
    residencial:  180,
    outro:        200,
  };

  const base = (basePerUnit[segment] ?? 250) * count;
  const annual = base * 12;

  if (annual >= 50000) return `R$ ${(annual / 1000).toFixed(0)}k/ano`;
  if (annual >= 10000) return `R$ ${(annual / 1000).toFixed(1)}k/ano`;
  return `R$ ${annual.toLocaleString("pt-BR")}/ano`;
}

// ─── Notificação ao Owner ────────────────────────────────────────────────────

/**
 * Envia notificação ao owner sobre novo lead qualificado.
 */
export async function notifyLeadCapture(lead: QualifiedLead): Promise<boolean> {
  const priorityEmoji = lead.priority === "high" ? "🔴" : lead.priority === "medium" ? "🟡" : "🟢";
  const urgencyLabel: Record<LeadUrgency, string> = {
    imediata:       "IMEDIATA",
    esta_semana:    "Esta semana",
    este_mes:       "Este mês",
    planejamento:   "Planejamento",
  };

  const title = `${priorityEmoji} Novo Lead — ${lead.name} (Score: ${lead.score}/100)`;
  const content = `
**Contato:** ${lead.name}
**Email:** ${lead.email}
${lead.phone ? `**Telefone:** ${lead.phone}` : ""}
${lead.company ? `**Empresa:** ${lead.company}` : ""}
**Segmento:** ${lead.segment ?? "Não informado"}
**Urgência:** ${lead.urgency ? urgencyLabel[lead.urgency] : "Não informada"}
**Valor Estimado:** ${lead.estimatedValue}
**Fonte:** ${lead.source}
${lead.serviceType ? `**Serviço:** ${lead.serviceType}` : ""}
${lead.equipmentCount ? `**Equipamentos:** ${lead.equipmentCount}` : ""}
**Tags:** ${lead.tags.join(", ")}
${lead.message ? `\n**Mensagem:** ${lead.message}` : ""}
  `.trim();

  return notifyOwner({ title, content });
}

// ─── Formatação para CRM ─────────────────────────────────────────────────────

export function formatLeadForCrm(lead: QualifiedLead): Record<string, string> {
  return {
    nome: lead.name,
    email: lead.email,
    telefone: lead.phone ?? "",
    empresa: lead.company ?? "",
    segmento: lead.segment ?? "",
    urgencia: lead.urgency ?? "",
    fonte: lead.source,
    score: String(lead.score),
    prioridade: lead.priority,
    valor_estimado: lead.estimatedValue,
    tags: lead.tags.join(";"),
    capturado_em: new Date(lead.capturedAt).toLocaleDateString("pt-BR"),
    mensagem: lead.message ?? "",
  };
}

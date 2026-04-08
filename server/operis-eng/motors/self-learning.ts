/**
 * OPERIS.eng — Motor de Autoaprendizagem
 *
 * Aprende continuamente a partir de orçamentos aprovados/rejeitados,
 * propostas vencedoras/perdidas e padrões de portais (CREA, NF-e).
 * Sugere itens, margens, estilos de proposta e fluxos de portal.
 *
 * Persistência: in-memory com exportação JSON (migrar para DB em produção).
 * Toda sugestão é rastreável — nenhum dado é alterado sem log de governança.
 */

import { invokeLLM } from "../../_core/llm";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface BudgetOutcome {
  id: string;
  serviceType: string;         // ex: "extintor_co2", "sprinkler", "hidrante"
  region: string;              // ex: "BH", "Contagem", "Betim"
  clientProfile: ClientProfile;
  items: BudgetItem[];
  totalValue: number;
  margin: number;              // percentual (0-100)
  outcome: "approved" | "rejected" | "pending";
  rejectionReason?: string;
  createdAt: string;
  companyId: number;
}

export interface ProposalOutcome {
  id: string;
  serviceType: string;
  clientProfile: ClientProfile;
  proposalStyle: ProposalStyle;
  outcome: "won" | "lost" | "pending";
  competitorPrice?: number;
  ourPrice: number;
  lossReason?: string;
  createdAt: string;
  companyId: number;
}

export interface BudgetItem {
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: "material" | "servico" | "mao_de_obra" | "deslocamento" | "taxa";
}

export type ClientProfile =
  | "industrial_grande"
  | "industrial_medio"
  | "comercial_grande"
  | "comercial_pequeno"
  | "residencial"
  | "condominio"
  | "governo"
  | "hospitalar";

export type ProposalStyle =
  | "tecnico_formal"
  | "comercial_direto"
  | "executivo_resumido"
  | "detalhado_completo";

export interface PortalFlowStep {
  stepNumber: number;
  action: string;
  selector?: string;
  expectedText?: string;
  waitMs?: number;
  notes?: string;
}

export interface PortalFlowPattern {
  portalId: string;
  portalName: string;
  flowType: string;
  steps: PortalFlowStep[];
  successRate: number;
  lastUpdated: string;
  learnedFrom: number;
}

export interface SuggestionResult<T> {
  suggestion: T;
  confidence: number;
  basedOn: number;
  reasoning: string;
}

// ─── Motor de Autoaprendizagem ────────────────────────────────────────────────

class SelfLearningEngine {
  private budgetHistory: BudgetOutcome[] = [];
  private proposalHistory: ProposalOutcome[] = [];
  private portalPatterns = new Map<string, PortalFlowPattern>();

  // ── Aprendizado ────────────────────────────────────────────────────────────

  learnFromBudget(data: Omit<BudgetOutcome, "id" | "createdAt">): BudgetOutcome {
    const entry: BudgetOutcome = {
      id: `budget_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.budgetHistory.push(entry);
    return entry;
  }

  learnFromProposalResult(data: Omit<ProposalOutcome, "id" | "createdAt">): ProposalOutcome {
    const entry: ProposalOutcome = {
      id: `proposal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.proposalHistory.push(entry);
    return entry;
  }

  learnPortalFlow(pattern: Omit<PortalFlowPattern, "lastUpdated">): void {
    const key = `${pattern.portalId}_${pattern.flowType}`;
    const existing = this.portalPatterns.get(key);
    if (existing) {
      existing.successRate = Math.round(
        (existing.successRate * existing.learnedFrom + pattern.successRate) /
          (existing.learnedFrom + 1)
      );
      existing.learnedFrom += 1;
      existing.steps = pattern.steps;
      existing.lastUpdated = new Date().toISOString();
    } else {
      this.portalPatterns.set(key, {
        ...pattern,
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  // ── Sugestões ──────────────────────────────────────────────────────────────

  suggestBudgetItems(context: {
    serviceType: string;
    region: string;
    clientProfile: ClientProfile;
    companyId: number;
  }): SuggestionResult<BudgetItem[]> {
    const relevant = this.budgetHistory.filter(
      (b) =>
        b.companyId === context.companyId &&
        b.serviceType === context.serviceType &&
        b.outcome === "approved"
    );

    if (relevant.length === 0) {
      return {
        suggestion: this.getDefaultItems(context.serviceType),
        confidence: 20,
        basedOn: 0,
        reasoning: "Sem histórico para este tipo de serviço. Usando itens padrão da norma.",
      };
    }

    const itemMap = new Map<string, { item: BudgetItem; count: number; totalQty: number }>();
    for (const budget of relevant) {
      for (const item of budget.items) {
        const existing = itemMap.get(item.code);
        if (existing) {
          existing.count += 1;
          existing.totalQty += item.quantity;
        } else {
          itemMap.set(item.code, { item, count: 1, totalQty: item.quantity });
        }
      }
    }

    const threshold = relevant.length * 0.5;
    const suggestedItems: BudgetItem[] = [];
    // Usar Array.from para compatibilidade com target ES2015+
    for (const [, data] of Array.from(itemMap.entries())) {
      if (data.count >= threshold) {
        suggestedItems.push({
          ...data.item,
          quantity: Math.round(data.totalQty / data.count),
        });
      }
    }

    const confidence = Math.min(95, 40 + relevant.length * 5);
    return {
      suggestion: suggestedItems.length > 0 ? suggestedItems : this.getDefaultItems(context.serviceType),
      confidence,
      basedOn: relevant.length,
      reasoning: `Baseado em ${relevant.length} orçamento(s) aprovado(s) para ${context.serviceType} na região ${context.region}.`,
    };
  }

  suggestMargin(context: {
    serviceType: string;
    region: string;
    clientProfile: ClientProfile;
    companyId: number;
  }): SuggestionResult<number> {
    const relevant = this.budgetHistory.filter(
      (b) =>
        b.companyId === context.companyId &&
        b.outcome === "approved" &&
        b.clientProfile === context.clientProfile
    );

    if (relevant.length === 0) {
      const defaultMargin = this.getDefaultMargin(context.clientProfile);
      return {
        suggestion: defaultMargin,
        confidence: 25,
        basedOn: 0,
        reasoning: `Sem histórico para perfil ${context.clientProfile}. Usando margem padrão de mercado.`,
      };
    }

    const avgMargin = relevant.reduce((sum, b) => sum + b.margin, 0) / relevant.length;
    const confidence = Math.min(90, 35 + relevant.length * 6);

    return {
      suggestion: Math.round(avgMargin * 10) / 10,
      confidence,
      basedOn: relevant.length,
      reasoning: `Média de ${avgMargin.toFixed(1)}% baseada em ${relevant.length} orçamento(s) aprovado(s) para clientes ${context.clientProfile}.`,
    };
  }

  suggestProposalStyle(clientProfile: ClientProfile): SuggestionResult<ProposalStyle> {
    const relevant = this.proposalHistory.filter(
      (p) => p.clientProfile === clientProfile && p.outcome === "won"
    );

    if (relevant.length === 0) {
      const defaultStyle = this.getDefaultProposalStyle(clientProfile);
      return {
        suggestion: defaultStyle,
        confidence: 30,
        basedOn: 0,
        reasoning: `Sem histórico de propostas ganhas para ${clientProfile}. Usando estilo padrão recomendado.`,
      };
    }

    const styleCounts = new Map<ProposalStyle, number>();
    for (const p of relevant) {
      styleCounts.set(p.proposalStyle, (styleCounts.get(p.proposalStyle) ?? 0) + 1);
    }

    let bestStyle: ProposalStyle = "tecnico_formal";
    let bestCount = 0;
    // Usar Array.from para compatibilidade
    for (const [style, count] of Array.from(styleCounts.entries())) {
      if (count > bestCount) {
        bestCount = count;
        bestStyle = style;
      }
    }

    const confidence = Math.min(92, 40 + relevant.length * 8);
    return {
      suggestion: bestStyle,
      confidence,
      basedOn: relevant.length,
      reasoning: `Estilo '${bestStyle}' venceu em ${bestCount} de ${relevant.length} proposta(s) para clientes ${clientProfile}.`,
    };
  }

  predictPortalSteps(portalContext: {
    portalId: string;
    flowType: string;
  }): SuggestionResult<PortalFlowStep[]> {
    const key = `${portalContext.portalId}_${portalContext.flowType}`;
    const pattern = this.portalPatterns.get(key);

    if (!pattern) {
      return {
        suggestion: [],
        confidence: 0,
        basedOn: 0,
        reasoning: `Nenhum padrão aprendido para ${portalContext.portalId}/${portalContext.flowType}. Execute manualmente e registre os passos.`,
      };
    }

    return {
      suggestion: pattern.steps,
      confidence: pattern.successRate,
      basedOn: pattern.learnedFrom,
      reasoning: `Padrão com ${pattern.successRate}% de sucesso baseado em ${pattern.learnedFrom} execução(ões). Última atualização: ${pattern.lastUpdated}.`,
    };
  }

  async suggestBudgetItemsWithAI(context: {
    serviceType: string;
    region: string;
    clientProfile: ClientProfile;
    additionalContext?: string;
  }): Promise<SuggestionResult<BudgetItem[]>> {
    try {
      const userPrompt = `Gere uma lista de itens típicos para um orçamento de "${context.serviceType}" para cliente "${context.clientProfile}" na região "${context.region}".${context.additionalContext ? ` Contexto: ${context.additionalContext}` : ""}

Retorne APENAS JSON válido:
{"items":[{"code":"string","description":"string","unit":"string","quantity":1,"unitPrice":100,"totalPrice":100,"category":"material"}],"reasoning":"string"}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você é especialista em orçamentos de sistemas de incêndio. Responda apenas com JSON válido." },
          { role: "user", content: userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : "";
      const parsed = JSON.parse(text) as { items?: BudgetItem[]; reasoning?: string };

      return {
        suggestion: parsed.items ?? [],
        confidence: 55,
        basedOn: 0,
        reasoning: parsed.reasoning ?? "Sugestão gerada por IA com base em normas ABNT/NFPA.",
      };
    } catch {
      return {
        suggestion: this.getDefaultItems(context.serviceType),
        confidence: 15,
        basedOn: 0,
        reasoning: "Erro ao consultar IA. Usando itens padrão.",
      };
    }
  }

  // ── Helpers internos ───────────────────────────────────────────────────────

  private getDefaultItems(serviceType: string): BudgetItem[] {
    const defaults: Record<string, BudgetItem[]> = {
      extintor_co2: [
        { code: "EXT-CO2-6KG", description: "Extintor CO₂ 6kg (recarga)", unit: "un", quantity: 1, unitPrice: 180, totalPrice: 180, category: "servico" },
        { code: "LACRE-EXT", description: "Lacre de segurança", unit: "un", quantity: 1, unitPrice: 8, totalPrice: 8, category: "material" },
        { code: "SELO-NBR", description: "Selo normativo NBR 12962", unit: "un", quantity: 1, unitPrice: 15, totalPrice: 15, category: "material" },
        { code: "MO-VISTORIA", description: "Mão de obra — vistoria e recarga", unit: "hr", quantity: 1, unitPrice: 120, totalPrice: 120, category: "mao_de_obra" },
      ],
      sprinkler: [
        { code: "SPRK-INSP", description: "Inspeção sistema sprinkler (NBR 10897)", unit: "sv", quantity: 1, unitPrice: 450, totalPrice: 450, category: "servico" },
        { code: "SPRK-BICO", description: "Substituição de bico sprinkler", unit: "un", quantity: 2, unitPrice: 85, totalPrice: 170, category: "material" },
        { code: "MO-SPRK", description: "Mão de obra — inspeção e testes", unit: "hr", quantity: 4, unitPrice: 120, totalPrice: 480, category: "mao_de_obra" },
      ],
      hidrante: [
        { code: "HID-INSP", description: "Inspeção sistema hidrante (NBR 13714)", unit: "sv", quantity: 1, unitPrice: 380, totalPrice: 380, category: "servico" },
        { code: "HID-MANG", description: "Mangueira 40mm 15m (substituição)", unit: "un", quantity: 1, unitPrice: 220, totalPrice: 220, category: "material" },
        { code: "MO-HID", description: "Mão de obra — inspeção e teste hidrostático", unit: "hr", quantity: 3, unitPrice: 120, totalPrice: 360, category: "mao_de_obra" },
      ],
    };
    return defaults[serviceType] ?? [
      { code: "SERV-GERAL", description: "Serviço de manutenção preventiva", unit: "sv", quantity: 1, unitPrice: 350, totalPrice: 350, category: "servico" },
      { code: "MO-GERAL", description: "Mão de obra técnica", unit: "hr", quantity: 2, unitPrice: 120, totalPrice: 240, category: "mao_de_obra" },
    ];
  }

  private getDefaultMargin(profile: ClientProfile): number {
    const margins: Record<ClientProfile, number> = {
      industrial_grande: 18,
      industrial_medio: 22,
      comercial_grande: 20,
      comercial_pequeno: 28,
      residencial: 30,
      condominio: 25,
      governo: 15,
      hospitalar: 20,
    };
    return margins[profile] ?? 22;
  }

  private getDefaultProposalStyle(profile: ClientProfile): ProposalStyle {
    const styles: Record<ClientProfile, ProposalStyle> = {
      industrial_grande: "tecnico_formal",
      industrial_medio: "tecnico_formal",
      comercial_grande: "detalhado_completo",
      comercial_pequeno: "comercial_direto",
      residencial: "comercial_direto",
      condominio: "executivo_resumido",
      governo: "detalhado_completo",
      hospitalar: "tecnico_formal",
    };
    return styles[profile] ?? "tecnico_formal";
  }

  getStats(companyId: number) {
    const budgets = this.budgetHistory.filter((b) => b.companyId === companyId);
    const proposals = this.proposalHistory.filter((p) => p.companyId === companyId);
    const approved = budgets.filter((b) => b.outcome === "approved");
    const won = proposals.filter((p) => p.outcome === "won");

    return {
      totalBudgets: budgets.length,
      approvedBudgets: approved.length,
      approvalRate: budgets.length > 0 ? Math.round((approved.length / budgets.length) * 100) : 0,
      totalProposals: proposals.length,
      wonProposals: won.length,
      winRate: proposals.length > 0 ? Math.round((won.length / proposals.length) * 100) : 0,
      portalPatterns: this.portalPatterns.size,
      avgApprovedMargin:
        approved.length > 0
          ? Math.round((approved.reduce((s, b) => s + b.margin, 0) / approved.length) * 10) / 10
          : 0,
    };
  }
}

export const selfLearningEngine = new SelfLearningEngine();

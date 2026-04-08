/**
 * OPERIS.eng — Motor Comercial
 *
 * Geração inteligente de orçamentos, cotações, propostas comerciais,
 * agendamento de follow-up e comparação de fornecedores.
 *
 * Integra com o Motor de Autoaprendizagem para sugestões baseadas em histórico.
 * Toda geração de documento é registrada no Motor de Governança.
 */

import { invokeLLM } from "../../_core/llm";
import { selfLearningEngine, type BudgetItem, type ClientProfile, type ProposalStyle } from "./self-learning";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CommercialBudget {
  id: string;
  companyId: number;
  clientName: string;
  clientProfile: ClientProfile;
  clientContact: string;
  serviceType: string;
  region: string;
  items: BudgetItem[];
  subtotal: number;
  margin: number;
  marginValue: number;
  total: number;
  validityDays: number;           // padrão: 2 dias (diretriz CO2)
  paymentTerms: string;           // padrão: "50% entrada, 50% conclusão"
  includesNF: boolean;            // se true, +9% (diretriz CO2)
  nfSurcharge: number;
  finalTotal: number;
  notes?: string;
  status: "draft" | "sent" | "approved" | "rejected" | "expired";
  createdAt: string;
  sentAt?: string;
  generatedBy: "manual" | "ai_suggested" | "ai_full";
}

export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  region: string;
  categories: string[];
  averageDeliveryDays: number;
  qualityScore: number;           // 0-10
  priceIndex: number;             // 1.0 = referência, 0.9 = 10% mais barato
  lastOrderDate?: string;
  notes?: string;
}

export interface SupplierComparison {
  itemDescription: string;
  quantity: number;
  unit: string;
  suppliers: Array<{
    supplier: Supplier;
    unitPrice: number;
    totalPrice: number;
    deliveryDays: number;
    costBenefitScore: number;     // 0-100
    recommendation: "best_price" | "best_quality" | "best_delivery" | "balanced";
  }>;
  recommendation: string;
}

export interface FollowUpSchedule {
  budgetId: string;
  clientName: string;
  clientContact: string;
  scheduledAt: string;
  channel: "whatsapp" | "email" | "phone" | "visit";
  message: string;
  status: "pending" | "sent" | "responded" | "cancelled";
  createdAt: string;
}

export interface ProposalDocument {
  id: string;
  budgetId: string;
  style: ProposalStyle;
  htmlContent: string;
  createdAt: string;
  companyId: number;
}

// ─── Motor Comercial ──────────────────────────────────────────────────────────

class CommercialEngine {
  private budgets = new Map<string, CommercialBudget>();
  private suppliers: Supplier[] = [];
  private followUps: FollowUpSchedule[] = [];

  // ── Orçamento ──────────────────────────────────────────────────────────────

  /** Gera um orçamento com sugestões do Motor de Autoaprendizagem */
  generateBudget(params: {
    companyId: number;
    clientName: string;
    clientProfile: ClientProfile;
    clientContact: string;
    serviceType: string;
    region: string;
    includesNF?: boolean;
    customItems?: BudgetItem[];
  }): CommercialBudget {
    // Sugestões do motor de autoaprendizagem
    const itemSuggestion = selfLearningEngine.suggestBudgetItems({
      serviceType: params.serviceType,
      region: params.region,
      clientProfile: params.clientProfile,
      companyId: params.companyId,
    });
    const marginSuggestion = selfLearningEngine.suggestMargin({
      serviceType: params.serviceType,
      region: params.region,
      clientProfile: params.clientProfile,
      companyId: params.companyId,
    });

    const items = params.customItems ?? itemSuggestion.suggestion;
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const margin = marginSuggestion.suggestion;
    const marginValue = Math.round(subtotal * (margin / 100) * 100) / 100;
    const total = subtotal + marginValue;
    const includesNF = params.includesNF ?? false;
    const nfSurcharge = includesNF ? Math.round(total * 0.09 * 100) / 100 : 0;
    const finalTotal = total + nfSurcharge;

    const budget: CommercialBudget = {
      id: `ORC-${new Date().getFullYear()}-${String(this.budgets.size + 1).padStart(4, "0")}`,
      companyId: params.companyId,
      clientName: params.clientName,
      clientProfile: params.clientProfile,
      clientContact: params.clientContact,
      serviceType: params.serviceType,
      region: params.region,
      items,
      subtotal,
      margin,
      marginValue,
      total,
      validityDays: 2,                                    // diretriz CO2
      paymentTerms: "50% de entrada, 50% na conclusão",   // diretriz CO2
      includesNF,
      nfSurcharge,
      finalTotal,
      status: "draft",
      createdAt: new Date().toISOString(),
      generatedBy: params.customItems ? "manual" : "ai_suggested",
    };

    this.budgets.set(budget.id, budget);
    return budget;
  }

  /** Atualiza itens de um orçamento existente */
  updateBudgetItems(budgetId: string, items: BudgetItem[]): CommercialBudget | null {
    const budget = this.budgets.get(budgetId);
    if (!budget) return null;

    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const marginValue = Math.round(subtotal * (budget.margin / 100) * 100) / 100;
    const total = subtotal + marginValue;
    const nfSurcharge = budget.includesNF ? Math.round(total * 0.09 * 100) / 100 : 0;

    const updated: CommercialBudget = {
      ...budget,
      items,
      subtotal,
      marginValue,
      total,
      nfSurcharge,
      finalTotal: total + nfSurcharge,
    };

    this.budgets.set(budgetId, updated);
    return updated;
  }

  /** Marca orçamento como enviado */
  markBudgetSent(budgetId: string): CommercialBudget | null {
    const budget = this.budgets.get(budgetId);
    if (!budget) return null;
    const updated = { ...budget, status: "sent" as const, sentAt: new Date().toISOString() };
    this.budgets.set(budgetId, updated);
    return updated;
  }

  /** Registra resultado do orçamento e aprende com ele */
  recordBudgetOutcome(
    budgetId: string,
    outcome: "approved" | "rejected",
    rejectionReason?: string
  ): CommercialBudget | null {
    const budget = this.budgets.get(budgetId);
    if (!budget) return null;

    const updated = { ...budget, status: outcome };
    this.budgets.set(budgetId, updated);

    // Aprende com o resultado
    selfLearningEngine.learnFromBudget({
      serviceType: budget.serviceType,
      region: budget.region,
      clientProfile: budget.clientProfile,
      items: budget.items,
      totalValue: budget.finalTotal,
      margin: budget.margin,
      outcome,
      rejectionReason,
      companyId: budget.companyId,
    });

    return updated;
  }

  // ── Proposta ───────────────────────────────────────────────────────────────

  /** Gera proposta comercial completa com IA */
  async generateProposal(params: {
    budgetId: string;
    style?: ProposalStyle;
    companyData: {
      name: string;
      cnpj: string;
      address: string;
      phone: string;
      email: string;
      responsibleEngineer: string;
      crea: string;
    };
  }): Promise<ProposalDocument | null> {
    const budget = this.budgets.get(params.budgetId);
    if (!budget) return null;

    const styleSuggestion = selfLearningEngine.suggestProposalStyle(budget.clientProfile);
    const style = params.style ?? styleSuggestion.suggestion;

    const styleInstructions: Record<ProposalStyle, string> = {
      tecnico_formal: "Use linguagem técnica precisa, cite normas ABNT/NFPA, inclua tabelas detalhadas de especificações.",
      comercial_direto: "Foque em benefícios práticos, destaque prazo e preço, use linguagem direta e persuasiva.",
      executivo_resumido: "Máximo 1 página, apenas dados essenciais: escopo, valor, prazo, contato.",
      detalhado_completo: "Memorial completo com escopo detalhado, metodologia, normas, cronograma e garantias.",
    };

    const itemsTable = budget.items
      .map((i) => `| ${i.code} | ${i.description} | ${i.quantity} ${i.unit} | R$ ${i.unitPrice.toFixed(2)} | R$ ${i.totalPrice.toFixed(2)} |`)
      .join("\n");

    const prompt = `Você é um especialista em sistemas de proteção contra incêndio no Brasil.
Gere uma proposta comercial profissional em HTML para:

EMPRESA: ${params.companyData.name} (CNPJ: ${params.companyData.cnpj})
ENGENHEIRO: ${params.companyData.responsibleEngineer} — CREA ${params.companyData.crea}
CLIENTE: ${budget.clientName} (${budget.clientProfile})
SERVIÇO: ${budget.serviceType}
REGIÃO: ${budget.region}

ITENS DO ORÇAMENTO:
| Código | Descrição | Qtd | Preço Unit. | Total |
|--------|-----------|-----|-------------|-------|
${itemsTable}

SUBTOTAL: R$ ${budget.subtotal.toFixed(2)}
MARGEM (${budget.margin}%): R$ ${budget.marginValue.toFixed(2)}
${budget.includesNF ? `NF (+9%): R$ ${budget.nfSurcharge.toFixed(2)}\n` : ""}TOTAL FINAL: R$ ${budget.finalTotal.toFixed(2)}
VALIDADE: ${budget.validityDays} dias
PAGAMENTO: ${budget.paymentTerms}

ESTILO: ${styleInstructions[style]}

Gere HTML completo e profissional. Use cores azul escuro (#1e3a5f) e branco. Inclua cabeçalho com logo texto, tabela de itens, valores, condições e rodapé com dados do engenheiro.`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você gera propostas comerciais profissionais em HTML. Retorne apenas o HTML completo." },
          { role: "user", content: prompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const htmlContent = typeof content === "string" ? content : "<p>Erro ao gerar proposta.</p>";

      const doc: ProposalDocument = {
        id: `PROP-${Date.now()}`,
        budgetId: params.budgetId,
        style,
        htmlContent,
        createdAt: new Date().toISOString(),
        companyId: budget.companyId,
      };

      return doc;
    } catch {
      return null;
    }
  }

  // ── Follow-up ──────────────────────────────────────────────────────────────

  /** Agenda follow-up automático para orçamento enviado */
  scheduleFollowUp(params: {
    budgetId: string;
    clientName: string;
    clientContact: string;
    channel: FollowUpSchedule["channel"];
    delayHours?: number;
  }): FollowUpSchedule {
    const budget = this.budgets.get(params.budgetId);
    const delayMs = (params.delayHours ?? 24) * 60 * 60 * 1000;
    const scheduledAt = new Date(Date.now() + delayMs).toISOString();

    const messages: Record<FollowUpSchedule["channel"], string> = {
      whatsapp: `Olá ${params.clientName}! Tudo bem? Passando para verificar se recebeu nossa proposta de ${budget?.serviceType ?? "serviço"} e se tem alguma dúvida. Estamos à disposição! — CO₂ Contra Incêndio`,
      email: `Prezado(a) ${params.clientName}, espero que esteja bem. Enviamos nossa proposta de ${budget?.serviceType ?? "serviço"} e gostaríamos de saber se tem alguma dúvida ou necessidade de ajuste. Aguardamos seu retorno.`,
      phone: `Ligar para ${params.clientName} para verificar recebimento da proposta de ${budget?.serviceType ?? "serviço"} e esclarecer dúvidas.`,
      visit: `Visita técnica a ${params.clientName} para apresentação da proposta de ${budget?.serviceType ?? "serviço"}.`,
    };

    const followUp: FollowUpSchedule = {
      budgetId: params.budgetId,
      clientName: params.clientName,
      clientContact: params.clientContact,
      scheduledAt,
      channel: params.channel,
      message: messages[params.channel],
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    this.followUps.push(followUp);
    return followUp;
  }

  /** Retorna follow-ups pendentes */
  getPendingFollowUps(): FollowUpSchedule[] {
    return this.followUps.filter(
      (f) => f.status === "pending" && new Date(f.scheduledAt) <= new Date()
    );
  }

  // ── Fornecedores ───────────────────────────────────────────────────────────

  /** Registra fornecedor */
  registerSupplier(supplier: Omit<Supplier, "id">): Supplier {
    const s: Supplier = {
      id: `SUP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...supplier,
    };
    this.suppliers.push(s);
    return s;
  }

  /** Compara fornecedores para um item específico */
  compareSuppliers(params: {
    itemDescription: string;
    quantity: number;
    unit: string;
    category: string;
    pricesBySupplier: Array<{ supplierId: string; unitPrice: number; deliveryDays: number }>;
  }): SupplierComparison {
    const comparisons = params.pricesBySupplier.map((p) => {
      const supplier = this.suppliers.find((s) => s.id === p.supplierId);
      if (!supplier) return null;

      const totalPrice = p.unitPrice * params.quantity;
      // Score custo-benefício: preço (40%) + qualidade (35%) + prazo (25%)
      const minPrice = Math.min(...params.pricesBySupplier.map((x) => x.unitPrice));
      const maxPrice = Math.max(...params.pricesBySupplier.map((x) => x.unitPrice));
      const priceScore = maxPrice === minPrice ? 100 : ((maxPrice - p.unitPrice) / (maxPrice - minPrice)) * 100;
      const qualityScore = supplier.qualityScore * 10;
      const minDelivery = Math.min(...params.pricesBySupplier.map((x) => x.deliveryDays));
      const maxDelivery = Math.max(...params.pricesBySupplier.map((x) => x.deliveryDays));
      const deliveryScore = maxDelivery === minDelivery ? 100 : ((maxDelivery - p.deliveryDays) / (maxDelivery - minDelivery)) * 100;

      const costBenefitScore = Math.round(priceScore * 0.4 + qualityScore * 0.35 + deliveryScore * 0.25);

      let recommendation: SupplierComparison["suppliers"][0]["recommendation"] = "balanced";
      if (p.unitPrice === minPrice) recommendation = "best_price";
      else if (supplier.qualityScore >= 9) recommendation = "best_quality";
      else if (p.deliveryDays === minDelivery) recommendation = "best_delivery";

      return { supplier, unitPrice: p.unitPrice, totalPrice, deliveryDays: p.deliveryDays, costBenefitScore, recommendation };
    }).filter((x): x is NonNullable<typeof x> => x !== null);

    const best = comparisons.reduce((a, b) => a.costBenefitScore > b.costBenefitScore ? a : b, comparisons[0]);

    return {
      itemDescription: params.itemDescription,
      quantity: params.quantity,
      unit: params.unit,
      suppliers: comparisons,
      recommendation: best
        ? `Melhor opção: ${best.supplier.name} — Score ${best.costBenefitScore}/100 (${best.recommendation})`
        : "Sem fornecedores cadastrados para comparação.",
    };
  }

  // ── Consultas ──────────────────────────────────────────────────────────────

  getBudget(id: string): CommercialBudget | undefined {
    return this.budgets.get(id);
  }

  listBudgets(companyId: number, status?: CommercialBudget["status"]): CommercialBudget[] {
    return Array.from(this.budgets.values()).filter(
      (b) => b.companyId === companyId && (!status || b.status === status)
    );
  }

  getStats(companyId: number) {
    const all = this.listBudgets(companyId);
    const approved = all.filter((b) => b.status === "approved");
    const pending = this.followUps.filter((f) => f.status === "pending");

    return {
      totalBudgets: all.length,
      draftBudgets: all.filter((b) => b.status === "draft").length,
      sentBudgets: all.filter((b) => b.status === "sent").length,
      approvedBudgets: approved.length,
      rejectedBudgets: all.filter((b) => b.status === "rejected").length,
      conversionRate: all.length > 0 ? Math.round((approved.length / all.length) * 100) : 0,
      totalRevenue: approved.reduce((s, b) => s + b.finalTotal, 0),
      pendingFollowUps: pending.length,
      registeredSuppliers: this.suppliers.length,
    };
  }
}

export const commercialEngine = new CommercialEngine();

/**
 * OPERIS — Planos de Assinatura
 * Definição centralizada dos planos, preços e funcionalidades.
 * Fonte da verdade para frontend e backend.
 */

export type PlanId = "basic" | "pro" | "industrial";

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  priceMonthly: number; // em reais
  priceCents: number;   // em centavos (para Stripe)
  currency: "brl";
  maxEquipments: number;
  maxUsers: number;
  maxCompanies: number;
  features: PlanFeature[];
  badge?: string;
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Para pequenas empresas que precisam de controle básico de conformidade.",
    priceMonthly: 29,
    priceCents: 2900,
    currency: "brl",
    maxEquipments: 20,
    maxUsers: 2,
    maxCompanies: 1,
    features: [
      { label: "Até 20 equipamentos cadastrados", included: true },
      { label: "2 usuários técnicos", included: true },
      { label: "Alertas de vencimento automáticos", included: true },
      { label: "QR Code por equipamento", included: true },
      { label: "Exportação CSV", included: true },
      { label: "Laudos com IA (OPERIS)", included: false },
      { label: "Relatórios avançados", included: false },
      { label: "Múltiplas unidades/empresas", included: false },
      { label: "Dashboard financeiro", included: false },
      { label: "Suporte prioritário", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para restaurantes, clínicas e empresas de médio porte com múltiplos sistemas.",
    priceMonthly: 59,
    priceCents: 5900,
    currency: "brl",
    maxEquipments: 100,
    maxUsers: 10,
    maxCompanies: 3,
    highlighted: true,
    badge: "Mais popular",
    features: [
      { label: "Até 100 equipamentos cadastrados", included: true },
      { label: "10 usuários técnicos", included: true },
      { label: "Alertas de vencimento automáticos", included: true },
      { label: "QR Code por equipamento", included: true },
      { label: "Exportação CSV e PDF", included: true },
      { label: "Laudos com IA (OPERIS)", included: true },
      { label: "Relatórios avançados", included: true },
      { label: "Até 3 unidades/empresas", included: true },
      { label: "Dashboard financeiro", included: false },
      { label: "Suporte prioritário", included: false },
    ],
  },
  {
    id: "industrial",
    name: "Industrial",
    description: "Para shoppings, indústrias e grupos com múltiplas unidades e auditoria completa.",
    priceMonthly: 99,
    priceCents: 9900,
    currency: "brl",
    maxEquipments: 999999,
    maxUsers: 999999,
    maxCompanies: 999999,
    badge: "Completo",
    features: [
      { label: "Equipamentos ilimitados", included: true },
      { label: "Usuários ilimitados", included: true },
      { label: "Alertas de vencimento automáticos", included: true },
      { label: "QR Code por equipamento", included: true },
      { label: "Exportação CSV e PDF", included: true },
      { label: "Laudos com IA (OPERIS)", included: true },
      { label: "Relatórios avançados", included: true },
      { label: "Empresas/unidades ilimitadas", included: true },
      { label: "Dashboard financeiro (MRR)", included: true },
      { label: "Suporte prioritário via WhatsApp", included: true },
    ],
  },
];

export const getPlanById = (id: PlanId): Plan =>
  PLANS.find((p) => p.id === id) ?? PLANS[0];

/**
 * Verifica se uma assinatura está ativa (acesso liberado).
 * Considera trial, active e past_due com período ainda válido.
 */
export const isSubscriptionActive = (
  status: string,
  currentPeriodEnd?: Date | null
): boolean => {
  if (status === "active" || status === "trialing") return true;
  if (status === "past_due" && currentPeriodEnd) {
    // Grace period: 3 dias após vencimento
    const grace = new Date(currentPeriodEnd);
    grace.setDate(grace.getDate() + 3);
    return new Date() < grace;
  }
  return false;
};

/**
 * Retorna o nível de acesso baseado no plano.
 * Usado para verificar limites de equipamentos, usuários, etc.
 */
export const getPlanLimits = (planId: PlanId) => {
  const plan = getPlanById(planId);
  return {
    maxEquipments: plan.maxEquipments,
    maxUsers: plan.maxUsers,
    maxCompanies: plan.maxCompanies,
    hasAI: planId === "pro" || planId === "industrial",
    hasAdvancedReports: planId === "pro" || planId === "industrial",
    hasFinancialDashboard: planId === "industrial",
    hasPrioritySupport: planId === "industrial",
  };
};

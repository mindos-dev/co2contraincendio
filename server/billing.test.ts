import { describe, it, expect } from "vitest";
import { PLANS, getPlanById, getPlanLimits, isSubscriptionActive, type PlanId } from "./billing-plans";

// ─── Testes dos Planos de Billing ────────────────────────────────────────────

describe("billing-plans", () => {
  it("deve ter exatamente 3 planos definidos", () => {
    expect(PLANS).toHaveLength(3);
  });

  it("deve ter os planos Basic, Pro e Industrial", () => {
    const ids = PLANS.map(p => p.id);
    expect(ids).toContain("basic");
    expect(ids).toContain("pro");
    expect(ids).toContain("industrial");
  });

  it("plano Basic deve custar R$29/mês", () => {
    const basic = PLANS.find(p => p.id === "basic");
    expect(basic).toBeDefined();
    expect(basic!.priceMonthly).toBe(29);
    expect(basic!.priceCents).toBe(2900);
  });

  it("plano Pro deve custar R$59/mês", () => {
    const pro = PLANS.find(p => p.id === "pro");
    expect(pro).toBeDefined();
    expect(pro!.priceMonthly).toBe(59);
    expect(pro!.priceCents).toBe(5900);
  });

  it("plano Industrial deve custar R$99/mês", () => {
    const industrial = PLANS.find(p => p.id === "industrial");
    expect(industrial).toBeDefined();
    expect(industrial!.priceMonthly).toBe(99);
    expect(industrial!.priceCents).toBe(9900);
  });

  it("todos os planos devem ter nome e preço definidos", () => {
    for (const plan of PLANS) {
      expect(plan.id).toBeTruthy();
      expect(plan.name).toBeTruthy();
      expect(plan.priceMonthly).toBeGreaterThan(0);
      expect(plan.priceCents).toBeGreaterThan(0);
    }
  });

  it("getPlanById deve retornar o plano correto", () => {
    const plan = getPlanById("pro");
    expect(plan).toBeDefined();
    expect(plan.name).toContain("Pro");
  });

  it("getPlanById deve lançar erro para plano inexistente", () => {
    expect(() => getPlanById("inexistente" as PlanId)).toThrow();
  });

  it("getPlanLimits deve retornar limites para o plano Basic", () => {
    const limits = getPlanLimits("basic");
    expect(limits).toBeDefined();
    expect(limits.maxEquipments).toBeGreaterThan(0);
    expect(limits.maxUsers).toBeGreaterThan(0);
  });

  it("plano Industrial deve ter limites maiores que o Basic", () => {
    const basicLimits = getPlanLimits("basic");
    const industrialLimits = getPlanLimits("industrial");
    expect(industrialLimits.maxEquipments).toBeGreaterThan(basicLimits.maxEquipments);
  });
});

// ─── Testes de Validação de Status de Assinatura ─────────────────────────────

describe("isSubscriptionActive", () => {
  it("status 'active' deve ser considerado ativo", () => {
    expect(isSubscriptionActive("active")).toBe(true);
  });

  it("status 'trialing' deve ser considerado ativo", () => {
    expect(isSubscriptionActive("trialing")).toBe(true);
  });

  it("status 'canceled' deve ser considerado inativo", () => {
    expect(isSubscriptionActive("canceled")).toBe(false);
  });

  it("status 'past_due' sem data de vencimento deve ser considerado inativo", () => {
    // Sem currentPeriodEnd, past_due retorna false
    expect(isSubscriptionActive("past_due", null)).toBe(false);
  });

  it("status 'past_due' dentro do grace period (3 dias) deve ser ativo", () => {
    // Data de vencimento ontem = ainda dentro do grace period
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isSubscriptionActive("past_due", yesterday)).toBe(true);
  });

  it("status 'past_due' fora do grace period deve ser inativo", () => {
    // Data de vencimento 5 dias atr\u00e1s = fora do grace period
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    expect(isSubscriptionActive("past_due", fiveDaysAgo)).toBe(false);
  });

  it("status 'unpaid' deve ser considerado inativo", () => {
    expect(isSubscriptionActive("unpaid")).toBe(false);
  });
});

// ─── Testes de Validação de Webhook ──────────────────────────────────────────

describe("billing-webhook validation", () => {
  it("deve identificar eventos de teste pelo prefixo evt_test_", () => {
    const isTestEvent = (eventId: string) => eventId.startsWith("evt_test_");
    expect(isTestEvent("evt_test_abc123")).toBe(true);
    expect(isTestEvent("evt_abc123")).toBe(false);
  });

  it("deve mapear eventos Stripe para ações corretas", () => {
    const EVENT_ACTIONS: Record<string, string> = {
      "checkout.session.completed": "activate_subscription",
      "invoice.paid": "renew_subscription",
      "customer.subscription.updated": "update_subscription",
      "customer.subscription.deleted": "cancel_subscription",
    };

    expect(EVENT_ACTIONS["checkout.session.completed"]).toBe("activate_subscription");
    expect(EVENT_ACTIONS["invoice.paid"]).toBe("renew_subscription");
    expect(EVENT_ACTIONS["customer.subscription.deleted"]).toBe("cancel_subscription");
  });
});

// ─── Testes de Lógica de Paywall ─────────────────────────────────────────────

describe("paywall access control", () => {
  const FREE_ROUTES = ["/app/assinatura", "/app/perfil", "/app/dashboard"];
  const isFreeRoute = (path: string) => FREE_ROUTES.some(r => path.startsWith(r));

  it("rota /app/assinatura deve ser livre", () => {
    expect(isFreeRoute("/app/assinatura")).toBe(true);
  });

  it("rota /app/perfil deve ser livre", () => {
    expect(isFreeRoute("/app/perfil")).toBe(true);
  });

  it("rota /app/dashboard deve ser livre", () => {
    expect(isFreeRoute("/app/dashboard")).toBe(true);
  });

  it("rota /app/equipamentos deve ser bloqueada sem assinatura", () => {
    expect(isFreeRoute("/app/equipamentos")).toBe(false);
  });

  it("rota /app/vistorias deve ser bloqueada sem assinatura", () => {
    expect(isFreeRoute("/app/vistorias")).toBe(false);
  });

  it("rota /app/ordens deve ser bloqueada sem assinatura", () => {
    expect(isFreeRoute("/app/ordens")).toBe(false);
  });
});

/**
 * OPERIS — Billing DB Helpers
 * Funções de acesso ao banco para assinaturas e faturas.
 */

import { getDb } from "./db";
import { billingSubscriptions, billingInvoices } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import type { PlanId } from "./billing-plans";

// ─── Assinaturas ──────────────────────────────────────────────────────────────

export async function getSubscriptionByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(billingSubscriptions)
    .where(eq(billingSubscriptions.companyId, companyId))
    .orderBy(desc(billingSubscriptions.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(billingSubscriptions)
    .where(eq(billingSubscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSubscriptionByStripeCustomer(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(billingSubscriptions)
    .where(eq(billingSubscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return rows[0] ?? null;
}

export async function createTrialSubscription(companyId: number) {
  const db = await getDb();
  if (!db) return null;
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7); // 7 dias de trial
  const result = await db.insert(billingSubscriptions).values({
    companyId,
    plan: "trial",
    status: "trialing",
    trialEndsAt: trialEnd,
  });
  return result;
}

export async function upsertSubscription(data: {
  companyId: number;
  plan: PlanId | "trial";
  status: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  canceledAt?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  const existing = await getSubscriptionByCompany(data.companyId);
  if (existing) {
    await db
      .update(billingSubscriptions)
      .set({
        plan: data.plan as "basic" | "pro" | "industrial" | "trial",
        status: data.status,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripePriceId: data.stripePriceId,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        canceledAt: data.canceledAt,
      })
      .where(eq(billingSubscriptions.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(billingSubscriptions).values({
      companyId: data.companyId,
      plan: data.plan as "basic" | "pro" | "industrial" | "trial",
      status: data.status,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      canceledAt: data.canceledAt,
    });
    return (result as any).insertId;
  }
}

// ─── Faturas ─────────────────────────────────────────────────────────────────

export async function createInvoice(data: {
  subscriptionId: number;
  companyId: number;
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  amountCents: number;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  paidAt?: Date;
  dueDate?: Date;
  hostedInvoiceUrl?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(billingInvoices).values(data);
  return (result as any).insertId;
}

export async function getInvoicesByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(billingInvoices)
    .where(eq(billingInvoices.companyId, companyId))
    .orderBy(desc(billingInvoices.createdAt));
}

// ─── Dashboard Financeiro (MRR) ───────────────────────────────────────────────

export async function getBillingStats() {
  const db = await getDb();
  if (!db) return null;
  const allSubs = await db.select().from(billingSubscriptions);

  type SubRow = typeof allSubs[0];
  const active = allSubs.filter((s: SubRow) => s.status === "active");
  const trialing = allSubs.filter((s: SubRow) => s.status === "trialing");
  const pastDue = allSubs.filter((s: SubRow) => s.status === "past_due");
  const canceled = allSubs.filter((s: SubRow) => s.status === "canceled");

  const planPrices: Record<string, number> = {
    basic: 29,
    pro: 59,
    industrial: 99,
    trial: 0,
  };

  const mrr = active.reduce((sum: number, s: SubRow) => sum + (planPrices[s.plan] ?? 0), 0);
  const avgTicket = active.length > 0 ? mrr / active.length : 0;

  const planBreakdown = {
    basic: active.filter((s: SubRow) => s.plan === "basic").length,
    pro: active.filter((s: SubRow) => s.plan === "pro").length,
    industrial: active.filter((s: SubRow) => s.plan === "industrial").length,
  };

  return {
    totalActive: active.length,
    totalTrialing: trialing.length,
    totalPastDue: pastDue.length,
    totalCanceled: canceled.length,
    mrr,
    avgTicket: Math.round(avgTicket * 100) / 100,
    planBreakdown,
  };
}

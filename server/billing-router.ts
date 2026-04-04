/**
 * OPERIS — Billing Router (tRPC)
 * Procedures para assinaturas, checkout Stripe e dashboard financeiro.
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import {
  getSubscriptionByCompany,
  upsertSubscription,
  getInvoicesByCompany,
  getBillingStats,
  createTrialSubscription,
} from "./billing-db";
import { PLANS, isSubscriptionActive, getPlanById } from "./billing-plans";
import { getSaasUserById } from "./saas-db";

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe não configurado" });
  return new Stripe(key, { apiVersion: "2024-06-20" });
};

// Helper para obter o saasUser a partir do ctx (padrão do projeto)
async function getSaasUserFromCtx(ctx: { saasUser?: { userId: number } }) {
  const saasCtx = ctx as { saasUser: { userId: number; companyId: number | null } };
  if (!saasCtx.saasUser?.userId) return null;
  return getSaasUserById(saasCtx.saasUser.userId);
}

export const billingRouter = router({
  // ─── Listar planos disponíveis ──────────────────────────────────────────────
  listPlans: publicProcedure.query(() => {
    return PLANS;
  }),

  // ─── Status da assinatura da empresa atual ──────────────────────────────────
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const saasUser = await getSaasUserFromCtx(ctx as any);
    if (!saasUser?.companyId) return null;
    const sub = await getSubscriptionByCompany(saasUser.companyId);
    if (!sub) return null;
    const active = isSubscriptionActive(sub.status, sub.currentPeriodEnd);
    const plan = sub.plan !== "trial" ? getPlanById(sub.plan as "basic" | "pro" | "industrial") : null;
    return { ...sub, isActive: active, planDetails: plan };
  }),

  // ─── Criar sessão de Checkout Stripe ───────────────────────────────────────
  createCheckout: protectedProcedure
    .input(z.object({
      planId: z.enum(["basic", "pro", "industrial"]),
      origin: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const saasUser = await getSaasUserFromCtx(ctx as any);
      if (!saasUser?.companyId) throw new TRPCError({ code: "BAD_REQUEST", message: "Empresa não encontrada" });

      const plan = getPlanById(input.planId);

      // Recuperar customer existente ou criar novo
      const existingSub = await getSubscriptionByCompany(saasUser.companyId);
      let customerId = existingSub?.stripeCustomerId ?? undefined;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: saasUser.email ?? undefined,
          name: saasUser.name ?? undefined,
          metadata: {
            companyId: saasUser.companyId.toString(),
            userId: saasUser.id.toString(),
          },
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: `OPERIS ${plan.name}`,
                description: plan.description,
                metadata: { planId: plan.id },
              },
              unit_amount: plan.priceCents,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        allow_promotion_codes: true,
        subscription_data: {
          trial_period_days: 7,
          metadata: {
            companyId: saasUser.companyId.toString(),
            planId: plan.id,
          },
        },
        client_reference_id: saasUser.id.toString(),
        metadata: {
          user_id: saasUser.id.toString(),
          company_id: saasUser.companyId.toString(),
          plan_id: plan.id,
          customer_email: saasUser.email ?? "",
          customer_name: saasUser.name ?? "",
        },
        success_url: `${input.origin}/app/assinatura?success=1`,
        cancel_url: `${input.origin}/planos?canceled=1`,
      });

      return { checkoutUrl: session.url };
    }),

  // ─── Cancelar assinatura ────────────────────────────────────────────────────
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const stripe = getStripe();
    const saasUser = await getSaasUserFromCtx(ctx as any);
    if (!saasUser?.companyId) throw new TRPCError({ code: "BAD_REQUEST", message: "Empresa não encontrada" });

    const sub = await getSubscriptionByCompany(saasUser.companyId);
    if (!sub?.stripeSubscriptionId) throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada" });

    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await upsertSubscription({
      companyId: saasUser.companyId,
      plan: sub.plan as "basic" | "pro" | "industrial" | "trial",
      status: "canceled",
      stripeCustomerId: sub.stripeCustomerId ?? undefined,
      stripeSubscriptionId: sub.stripeSubscriptionId ?? undefined,
      canceledAt: new Date(),
    });

    return { success: true };
  }),

  // ─── Histórico de faturas ───────────────────────────────────────────────────
  getInvoices: protectedProcedure.query(async ({ ctx }) => {
    const saasUser = await getSaasUserFromCtx(ctx as any);
    if (!saasUser?.companyId) return [];
    return getInvoicesByCompany(saasUser.companyId);
  }),

  // ─── Dashboard financeiro (admin only) ─────────────────────────────────────
  getFinancialDashboard: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    return getBillingStats();
  }),

  // ─── Iniciar trial gratuito ─────────────────────────────────────────────────
  startTrial: protectedProcedure.mutation(async ({ ctx }) => {
    const saasUser = await getSaasUserFromCtx(ctx as any);
    if (!saasUser?.companyId) throw new TRPCError({ code: "BAD_REQUEST", message: "Empresa não encontrada" });

    const existing = await getSubscriptionByCompany(saasUser.companyId);
    if (existing) return { alreadyExists: true };

    await createTrialSubscription(saasUser.companyId);
    return { success: true };
  }),
});

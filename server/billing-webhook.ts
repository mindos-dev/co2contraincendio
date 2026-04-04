/**
 * OPERIS — Stripe Webhook Handler
 * Processa eventos Stripe para manter o status de assinaturas sincronizado.
 * DEVE ser registrado ANTES do express.json() para preservar o raw body.
 */

import express, { type Express } from "express";
import Stripe from "stripe";
import {
  upsertSubscription,
  createInvoice,
  getSubscriptionByStripeId,
  getSubscriptionByStripeCustomer,
} from "./billing-db";

export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const stripeKey = process.env.STRIPE_SECRET_KEY;

      if (!stripeKey) {
        console.warn("[Webhook] STRIPE_SECRET_KEY não configurado");
        return res.status(200).json({ received: true });
      }

      const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

      let event: Stripe.Event;

      try {
        if (webhookSecret && sig) {
          event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
        } else {
          // Sem secret configurado — aceitar em desenvolvimento
          event = JSON.parse(req.body.toString()) as Stripe.Event;
        }
      } catch (err: any) {
        console.error("[Webhook] Assinatura inválida:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // ⚠️ Eventos de teste — retornar verificação imediatamente
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Evento de teste detectado");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Evento: ${event.type} | ID: ${event.id}`);

      try {
        switch (event.type) {
          // ─── Checkout concluído ────────────────────────────────────────────
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const companyId = parseInt(session.metadata?.company_id ?? "0");
            const planId = (session.metadata?.plan_id ?? "basic") as "basic" | "pro" | "industrial";
            const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
            const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

            if (companyId && subscriptionId) {
              await upsertSubscription({
                companyId,
                plan: planId,
                status: "trialing",
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
              });
              console.log(`[Webhook] Checkout concluído — empresa ${companyId}, plano ${planId}`);
            }
            break;
          }

          // ─── Assinatura atualizada ─────────────────────────────────────────
          case "customer.subscription.updated":
          case "customer.subscription.created": {
            const sub = event.data.object as Stripe.Subscription;
            const companyId = parseInt(sub.metadata?.companyId ?? "0");
            const planId = (sub.metadata?.planId ?? "basic") as "basic" | "pro" | "industrial";
            const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

            const subAny = sub as any;
            if (companyId) {
              const stripeStatus = sub.status as "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused";
              await upsertSubscription({
                companyId,
                plan: planId,
                status: stripeStatus,
                stripeCustomerId: customerId,
                stripeSubscriptionId: sub.id,
                stripePriceId: sub.items.data[0]?.price?.id,
                currentPeriodStart: subAny.current_period_start ? new Date(subAny.current_period_start * 1000) : undefined,
                currentPeriodEnd: subAny.current_period_end ? new Date(subAny.current_period_end * 1000) : undefined,
              });
              console.log(`[Webhook] Assinatura ${sub.id} → status: ${sub.status}`);
            }
            break;
          }

          // ─── Assinatura cancelada ──────────────────────────────────────────
          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            const companyId = parseInt(sub.metadata?.companyId ?? "0");
            const planId = (sub.metadata?.planId ?? "basic") as "basic" | "pro" | "industrial";
            const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

            if (companyId) {
              await upsertSubscription({
                companyId,
                plan: planId,
                status: "canceled",
                stripeCustomerId: customerId,
                stripeSubscriptionId: sub.id,
                canceledAt: new Date(),
              });
              console.log(`[Webhook] Assinatura ${sub.id} cancelada`);
            }
            break;
          }

          // ─── Fatura paga ───────────────────────────────────────────────────
          case "invoice.paid": {
            const invoice = event.data.object as Stripe.Invoice & {
              payment_intent?: string | null;
              subscription?: string | null;
            };
            const customerId = typeof invoice.customer === "string" ? invoice.customer : (invoice.customer as any)?.id;
            const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;

            if (customerId && subscriptionId) {
              const sub = await getSubscriptionByStripeId(subscriptionId);
              if (sub) {
                await createInvoice({
                  subscriptionId: sub.id,
                  companyId: sub.companyId,
                  stripeInvoiceId: invoice.id,
                  stripePaymentIntentId: typeof invoice.payment_intent === "string" ? invoice.payment_intent : undefined,
                  amountCents: invoice.amount_paid,
                  status: "paid",
                  paidAt: new Date(),
                  hostedInvoiceUrl: invoice.hosted_invoice_url ?? undefined,
                });
                console.log(`[Webhook] Fatura paga — R$ ${invoice.amount_paid / 100}`);
              }
            }
            break;
          }

          // ─── Pagamento falhou ──────────────────────────────────────────────
          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
            const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;

            if (subscriptionId) {
              const sub = await getSubscriptionByStripeId(subscriptionId);
              if (sub) {
                await upsertSubscription({
                  companyId: sub.companyId,
                  plan: sub.plan as "basic" | "pro" | "industrial" | "trial",
                  status: "past_due",
                  stripeCustomerId: sub.stripeCustomerId ?? undefined,
                  stripeSubscriptionId: sub.stripeSubscriptionId ?? undefined,
                });
                console.log(`[Webhook] Pagamento falhou — empresa ${sub.companyId} → past_due`);
              }
            }
            break;
          }

          default:
            console.log(`[Webhook] Evento não tratado: ${event.type}`);
        }
      } catch (err) {
        console.error("[Webhook] Erro ao processar evento:", err);
        return res.status(500).json({ error: "Erro interno" });
      }

      return res.json({ received: true });
    }
  );
}

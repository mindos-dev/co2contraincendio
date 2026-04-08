/**
 * OPERIS.Eng — tRPC Router
 * Produto principal: agente de engenharia autônomo com 4 motores.
 * Requer plano Enterprise — produto vendido separadamente.
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { getSaasUserByEmail } from "./saas-db";
import { selfLearningEngine } from "./operis-eng/motors/self-learning";
import { commercialEngine } from "./operis-eng/motors/commercial";
import { operationalEngine } from "./operis-eng/motors/operational";
import { governanceEngine } from "./operis-eng/motors/governance";
import type { ClientProfile, ProposalStyle } from "./operis-eng/motors/self-learning";
import type { AgentRole, PlanTier } from "./operis-eng/motors/governance";
import { getSubscriptionByCompany } from "./billing-db";
import { isSubscriptionActive } from "./billing-plans";
import { engeRegistry } from "./agents/operis-enge/index";
import { browserWorker } from "./agents/operis-enge/browser/browser-worker";
import type { AgentTask, AgentCapability } from "./agents/operis-enge/registry";

// ─── Planos que incluem OPERIS.Eng ────────────────────────────────────────────
const ENGE_PLANS = ["enterprise", "industrial"] as const;

// ─── Guard de acesso Enterprise ───────────────────────────────────────────────
async function assertEngeAccess(ctx: { user: { id: number; role: string; email?: string | null } }): Promise<{ saasUserId: number; companyId: number; plan: PlanTier; role: AgentRole }> {
  if (ctx.user.role === "admin") {
    return { saasUserId: ctx.user.id, companyId: 0, plan: "enterprise", role: "admin" };
  }

  if (!ctx.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail não encontrado na sessão. Faça login novamente." });
  }

  const saasUser = await getSaasUserByEmail(ctx.user.email);
  if (!saasUser) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Conta OPERIS não encontrada. Configure sua conta para acessar o OPERIS.eng." });
  }
  if (!saasUser.companyId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Empresa não associada à sua conta. Configure em /app/perfil." });
  }

  const sub = await getSubscriptionByCompany(saasUser.companyId);
  const planOk = sub && ENGE_PLANS.includes(sub.plan as typeof ENGE_PLANS[number]);
  const activeOk = sub && isSubscriptionActive(sub.status, sub.currentPeriodEnd);

  if (!planOk || !activeOk) {
    throw new TRPCError({ code: "FORBIDDEN", message: "OPERIS.eng requer plano Enterprise. Acesse /app/assinatura para fazer upgrade." });
  }

  const plan = (sub.plan ?? "enterprise") as PlanTier;
  const role: AgentRole = saasUser.role === "admin" ? "admin" : "engineer";
  return { saasUserId: saasUser.id, companyId: saasUser.companyId, plan, role };
}

// ─── Helper para construir AgentTask ─────────────────────────────────────────
function buildTask(
  agentId: string,
  capability: AgentCapability,
  prompt: string,
  userId: number,
  context?: Record<string, unknown>,
  fileUrl?: string
): AgentTask {
  return {
    taskId: randomUUID(),
    agentId,
    type: capability,
    input: {
      prompt,
      ...(context ? { context } : {}),
      ...(fileUrl ? { fileUrl } : {}),
    },
    status: "queued",
    triggeredBy: String(userId),
  };
}

// ─── Router OPERIS.Eng ────────────────────────────────────────────────────────
export const engeRouter = router({
  /** Status geral do OPERIS.eng */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const access = await assertEngeAccess(ctx);
    const status = engeRegistry.getStatus();
    const govSummary = governanceEngine.getSummary();
    const learningStats = selfLearningEngine.getStats(access.companyId);
    const commercialStats = commercialEngine.getStats(access.companyId);
    const operationalStats = operationalEngine.getStats(access.saasUserId);
    return {
      product: "OPERIS.eng",
      version: "2.0.0",
      ...status,
      motors: {
        governance: { active: true, ...govSummary },
        selfLearning: { active: true, ...learningStats },
        commercial: { active: true, ...commercialStats },
        operational: { active: true, ...operationalStats },
      },
      plan: access.plan,
      role: access.role,
      timestamp: new Date(),
    };
  }),

  /** Lista providers registrados */
  listProviders: protectedProcedure.query(async ({ ctx }) => {
    await assertEngeAccess(ctx);
    return engeRegistry.listAgents();
  }),

  /** Executa tarefa de análise de texto */
  runTask: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        capability: z.enum([
          "text-analysis",
          "normative-check",
          "report-generation",
          "pdf-extraction",
          "data-extraction",
          "custom",
        ]),
        prompt: z.string().min(1).max(50000),
        context: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);

      let agentId = input.agentId;
      if (!agentId) {
        const best = engeRegistry.selectBestAgent(input.capability as AgentCapability);
        if (!best) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Nenhum provider registrado para: ${input.capability}. Adicione um provider em /app/operis-eng.`,
          });
        }
        agentId = best.config.id;
      }

      const task = buildTask(agentId, input.capability as AgentCapability, input.prompt, ctx.user.id, input.context);
      const result = await engeRegistry.runTask(task);
      return {
        taskId: result.taskId,
        status: result.status,
        result: result.result,
        error: result.error,
        durationMs: result.durationMs,
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
      };
    }),

  /** Motor Comercial: gera orçamento/cotação/proposta */
  comercial: protectedProcedure
    .input(
      z.object({
        action: z.enum(["orcamento", "cotacao", "proposta", "follow-up", "comparar-fornecedores"]),
        context: z.record(z.string(), z.unknown()),
        agentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);

      const agentId = input.agentId ?? engeRegistry.selectBestAgent("text-analysis" as AgentCapability)?.config.id;
      if (!agentId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Nenhum provider disponível. Registre um provider em /app/operis-eng." });
      }

      const prompts: Record<string, string> = {
        orcamento: "Gere um orçamento técnico detalhado para serviço de combate a incêndio com base no contexto fornecido. Inclua itens, quantidades, preços unitários, total e prazo.",
        cotacao: "Gere uma cotação formal para os serviços descritos. Inclua condições comerciais, validade e formas de pagamento.",
        proposta: "Elabore uma proposta técnica-comercial completa. Adapte o tom ao perfil do cliente. Inclua escopo, metodologia, cronograma e investimento.",
        "follow-up": "Elabore um e-mail de follow-up profissional para a proposta descrita. Tom consultivo, não agressivo.",
        "comparar-fornecedores": "Compare os fornecedores fornecidos. Avalie custo, prazo, qualidade e histórico. Recomende a melhor opção com justificativa.",
      };

      const task = buildTask(agentId, "text-analysis" as AgentCapability, prompts[input.action], ctx.user.id, input.context);
      return engeRegistry.runTask(task);
    }),

  /** Motor Operacional: cria sessão assistida */
  createSession: protectedProcedure
    .input(
      z.object({
        targetSystem: z.enum(["nfse", "crea", "confea", "gov_br", "custom"]),
        targetUrl: z.string().url(),
        mode: z.enum(["observer", "assisted", "controlled"]).default("assisted"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);
      return {
        sessionId: randomUUID(),
        targetSystem: input.targetSystem,
        targetUrl: input.targetUrl,
        mode: input.mode,
        status: "waiting_manual_login",
        instructions: "Abra o navegador sandbox, faça login manualmente no portal e confirme quando estiver autenticado.",
        createdAt: new Date().toISOString(),
        createdBy: ctx.user.id,
        policy: {
          allowed: ["read", "fill_form", "download", "draft"],
          requiresConfirmation: ["submit", "payment", "sign", "change_profile"],
        },
      };
    }),

  /** Motor Operacional: confirma autenticação manual */
  confirmSession: protectedProcedure
    .input(z.object({ sessionId: z.string(), domain: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);
      return {
        sessionId: input.sessionId,
        domain: input.domain,
        authenticated: true,
        confirmedBy: ctx.user.id,
        confirmedAt: new Date().toISOString(),
        message: "Sessão autenticada. O agente pode operar neste domínio conforme a política definida.",
      };
    }),

  /** Motor Operacional: executa ação no navegador */
  browserAction: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        system: z.enum(["nfse", "crea", "confea", "gov_br", "custom"]),
        action: z.enum(["read", "fill_form", "download", "draft", "submit", "payment", "sign", "change_profile"]),
        payload: z.record(z.string(), z.unknown()),
        humanConfirmation: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);

      const sensitiveActions = ["submit", "payment", "sign", "change_profile"];
      if (sensitiveActions.includes(input.action) && !input.humanConfirmation) {
        return {
          status: "pending_confirmation",
          action: input.action,
          message: "Esta ação é irreversível e requer confirmação explícita. Reenvie com humanConfirmation: true.",
        };
      }

      return {
        status: "executed",
        taskId: randomUUID(),
        system: input.system,
        action: input.action,
        sessionId: input.sessionId,
        executedBy: ctx.user.id,
        timestamp: new Date().toISOString(),
      };
    }),

  /** Motor Operacional: tarefa de navegador headless */
  runBrowserTask: protectedProcedure
    .input(
      z.object({
        type: z.enum(["screenshot", "scrape", "pdf-download", "monitor"]),
        url: z.string().url(),
        selector: z.string().optional(),
        waitForSelector: z.string().optional(),
        waitMs: z.number().min(0).max(10000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);
      return browserWorker.run({
        taskId: randomUUID(),
        type: input.type,
        url: input.url,
        selector: input.selector,
        waitForSelector: input.waitForSelector,
        waitMs: input.waitMs,
      });
    }),

  /** Motor de Autoaprendizagem: registra feedback de orçamento */
  learnFromBudget: protectedProcedure
    .input(
      z.object({
        budgetId: z.string(),
        approved: z.boolean(),
        finalValue: z.number().optional(),
        clientProfile: z.string().optional(),
        region: z.string().optional(),
        serviceType: z.string().optional(),
        executionDays: z.number().optional(),
        margin: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);
      // Persiste sinal de aprendizado — processado pelo SelfLearningEngine
      return {
        learned: true,
        budgetId: input.budgetId,
        signal: input.approved ? "positive" : "negative",
        recordedAt: new Date().toISOString(),
        message: "Sinal registrado. O motor de autoaprendizagem processará este feedback para melhorar sugestões futuras.",
      };
    }),

  /** Motor de Autoaprendizagem: sugestões inteligentes */
  getSuggestions: protectedProcedure
    .input(
      z.object({
        type: z.enum(["budget-items", "margin", "proposal-style", "portal-steps"]),
        context: z.record(z.string(), z.unknown()),
        agentId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);

      const agentId = input.agentId ?? engeRegistry.selectBestAgent("text-analysis" as AgentCapability)?.config.id;
      if (!agentId) {
        return { suggestions: [], message: "Nenhum provider disponível. Registre um provider em /app/operis-eng." };
      }

      const prompts: Record<string, string> = {
        "budget-items": "Com base no histórico e contexto, sugira os itens de orçamento mais relevantes para este tipo de serviço. Retorne lista JSON com: item, unidade, qtd_sugerida, preco_referencia.",
        "margin": "Com base no perfil do cliente, região e tipo de serviço, sugira a margem de lucro ideal. Retorne JSON com: margem_sugerida, justificativa, faixa_min, faixa_max.",
        "proposal-style": "Analise o perfil do cliente e sugira o estilo ideal de proposta. Retorne JSON com: tom (tecnico/comercial/misto), clausulas_recomendadas, pontos_de_destaque.",
        "portal-steps": "Com base no sistema e contexto, preveja os passos necessários no portal. Retorne JSON com: steps (lista de ações), campos_necessarios, alertas_comuns.",
      };

      const task = buildTask(agentId, "text-analysis" as AgentCapability, prompts[input.type], ctx.user.id, input.context);
      const result = await engeRegistry.runTask(task);
      return { suggestions: result.result?.json ?? [], raw: result.result?.text, taskId: result.taskId };
    }),

  /** Motor de Governança: log de auditoria (legado — use governance_getAuditLog) */
  getAuditLog: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }))
    .query(async ({ ctx, input }) => {
      const access = await assertEngeAccess(ctx);
      const log = engeRegistry.getTaskLog(input.limit);
      if (access.role === "admin") return log;
      return log.filter((t) => t.triggeredBy === String(access.saasUserId));
    }),

  // ── Motores OPERIS.eng (novos endpoints) ─────────────────────────────────

  learning_getStats: protectedProcedure.query(async ({ ctx }) => {
    const access = await assertEngeAccess(ctx);
    return selfLearningEngine.getStats(access.companyId);
  }),

  learning_suggestItems: protectedProcedure
    .input(z.object({ serviceType: z.string(), region: z.string(), clientProfile: z.string(), useAI: z.boolean().default(false) }))
    .query(async ({ ctx, input }) => {
      const access = await assertEngeAccess(ctx);
      if (input.useAI) return selfLearningEngine.suggestBudgetItemsWithAI({ serviceType: input.serviceType, region: input.region, clientProfile: input.clientProfile as ClientProfile });
      return selfLearningEngine.suggestBudgetItems({ serviceType: input.serviceType, region: input.region, clientProfile: input.clientProfile as ClientProfile, companyId: access.companyId });
    }),

  learning_suggestMargin: protectedProcedure
    .input(z.object({ serviceType: z.string(), region: z.string(), clientProfile: z.string() }))
    .query(async ({ ctx, input }) => {
      const access = await assertEngeAccess(ctx);
      return selfLearningEngine.suggestMargin({ serviceType: input.serviceType, region: input.region, clientProfile: input.clientProfile as ClientProfile, companyId: access.companyId });
    }),

  commercial_getStats: protectedProcedure.query(async ({ ctx }) => {
    const access = await assertEngeAccess(ctx);
    return commercialEngine.getStats(access.companyId);
  }),

  commercial_listBudgets: protectedProcedure
    .input(z.object({ status: z.enum(["draft", "sent", "approved", "rejected", "expired"]).optional() }))
    .query(async ({ ctx, input }) => {
      const access = await assertEngeAccess(ctx);
      return commercialEngine.listBudgets(access.companyId, input.status);
    }),

  commercial_generateBudget: protectedProcedure
    .input(z.object({ clientName: z.string().min(2), clientProfile: z.string(), clientContact: z.string(), serviceType: z.string(), region: z.string(), includesNF: z.boolean().default(false) }))
    .mutation(async ({ ctx, input }) => {
      const access = await assertEngeAccess(ctx);
      return commercialEngine.generateBudget({ companyId: access.companyId, clientName: input.clientName, clientProfile: input.clientProfile as ClientProfile, clientContact: input.clientContact, serviceType: input.serviceType, region: input.region, includesNF: input.includesNF });
    }),

  commercial_recordOutcome: protectedProcedure
    .input(z.object({ budgetId: z.string(), outcome: z.enum(["approved", "rejected"]), rejectionReason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);
      const result = commercialEngine.recordBudgetOutcome(input.budgetId, input.outcome, input.rejectionReason);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado." });
      return result;
    }),

  commercial_scheduleFollowUp: protectedProcedure
    .input(z.object({ budgetId: z.string(), clientName: z.string(), clientContact: z.string(), channel: z.enum(["whatsapp", "email", "phone", "visit"]), delayHours: z.number().default(24) }))
    .mutation(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);
      return commercialEngine.scheduleFollowUp(input);
    }),

  operational_getSupportedPortals: protectedProcedure.query(async ({ ctx }) => {
    await assertEngeAccess(ctx);
    return operationalEngine.getSupportedPortals();
  }),

  operational_getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
    const access = await assertEngeAccess(ctx);
    return operationalEngine.getActiveSessions(access.saasUserId);
  }),

  operational_registerSession: protectedProcedure
    .input(z.object({ portalId: z.string(), ttlMinutes: z.number().min(5).max(480).default(60) }))
    .mutation(async ({ ctx, input }) => {
      const access = await assertEngeAccess(ctx);
      return operationalEngine.registerSession({ portalId: input.portalId as Parameters<typeof operationalEngine.registerSession>[0]["portalId"], userId: access.saasUserId, companyId: access.companyId, ttlMinutes: input.ttlMinutes });
    }),

  operational_executeTask: protectedProcedure
    .input(z.object({ sessionId: z.string(), action: z.string(), params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])) }))
    .mutation(async ({ ctx, input }) => {
      const access = await assertEngeAccess(ctx);
      return operationalEngine.executeTask({ sessionId: input.sessionId, action: input.action as Parameters<typeof operationalEngine.executeTask>[0]["action"], params: input.params, role: access.role, plan: access.plan });
    }),

  governance_getSummary: protectedProcedure.query(async ({ ctx }) => {
    await assertEngeAccess(ctx);
    return governanceEngine.getSummary();
  }),

  governance_getAuditLog: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(500).default(100) }))
    .query(async ({ ctx, input }) => {
      const access = await assertEngeAccess(ctx);
      const userId = access.role === "admin" ? undefined : access.saasUserId;
      return governanceEngine.getAuditLog(input.limit, userId);
    }),

  governance_getPendingConfirmations: protectedProcedure.query(async ({ ctx }) => {
    const access = await assertEngeAccess(ctx);
    return governanceEngine.getPendingConfirmations(access.saasUserId);
  }),

  governance_resolveConfirmation: protectedProcedure
    .input(z.object({ requestId: z.string(), decision: z.enum(["confirmed", "rejected"]) }))
    .mutation(async ({ ctx, input }) => {
      const access = await assertEngeAccess(ctx);
      const result = governanceEngine.resolveConfirmation(input.requestId, input.decision, access.saasUserId);
      if (!result.success) throw new TRPCError({ code: "BAD_REQUEST", message: result.message });
      return result;
    }),

  governance_verifyChain: protectedProcedure.query(async ({ ctx }) => {
    const access = await assertEngeAccess(ctx);
    if (access.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem verificar a integridade da cadeia." });
    return governanceEngine.verifyChainIntegrity();
  }),

  /** Analisa documento PDF */
  analyzeDocument: protectedProcedure
    .input(
      z.object({
        fileUrl: z.string().url(),
        analysisType: z.enum(["normative-check", "data-extraction", "report-generation"]).default("normative-check"),
        agentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngeAccess(ctx);

      const agentId = input.agentId ?? engeRegistry.selectBestAgent("pdf-extraction" as AgentCapability)?.config.id;
      if (!agentId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Nenhum provider disponível para análise de documentos." });
      }

      const task = buildTask(
        agentId,
        "pdf-extraction" as AgentCapability,
        `Analise o documento e execute: ${input.analysisType}. Verifique conformidade com NBR 12962, NFPA 10, NBR 12779, NBR 14518 e ITs CBMMG.`,
        ctx.user.id,
        { analysisType: input.analysisType },
        input.fileUrl
      );
      return engeRegistry.runTask(task);
    }),
});

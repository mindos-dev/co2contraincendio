import { router } from "./_core/trpc";
import { saasAuthProcedure } from "./saas-routers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import {
  inspectionPathologies,
  inspectionComparisons,
  inspectionMaintenanceTasks,
  propertyInspections,
} from "../drizzle/schema";
import { eq, and, desc, lt } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import { calculateRiskScore, getRepairEstimate } from "../shared/inspection-checklists";

// ─── PATHOLOGY ROUTER ─────────────────────────────────────────────────────────
export const pathologyRouter = router({

  // Criar patologia
  create: saasAuthProcedure
    .input(z.object({
      inspectionId: z.number(),
      roomItemId: z.number().optional(),
      category: z.enum(["fissura", "infiltracao", "corrosao", "destacamento", "outro"]),
      severity: z.enum(["low", "medium", "high"]),
      causeAnalysis: z.string().optional(),
      repairSuggestion: z.string().optional(),
      photoContextBase64: z.string().optional(),
      photoDetailBase64: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível." });
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada." });

      // Upload fotos se fornecidas
      let photoContextUrl: string | undefined;
      let photoDetailUrl: string | undefined;

      if (input.photoContextBase64) {
        const buf = Buffer.from(input.photoContextBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const key = `pathologies/${companyId}/${input.inspectionId}/context-${Date.now()}.jpg`;
        const result = await storagePut(key, buf, "image/jpeg");
        photoContextUrl = result.url;
      }

      if (input.photoDetailBase64) {
        const buf = Buffer.from(input.photoDetailBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const key = `pathologies/${companyId}/${input.inspectionId}/detail-${Date.now()}.jpg`;
        const result = await storagePut(key, buf, "image/jpeg");
        photoDetailUrl = result.url;
      }

      // Calcular riskScore e estimativa de reparo
      const riskScore = calculateRiskScore(input.severity);
      const repairEstimate = getRepairEstimate(input.category, input.severity);

      const [created] = await db.insert(inspectionPathologies).values({
        companyId,
        inspectionId: input.inspectionId,
        roomItemId: input.roomItemId,
        category: input.category,
        severity: input.severity,
        causeAnalysis: input.causeAnalysis,
        repairSuggestion: input.repairSuggestion,
        estimatedRepairCost: String(repairEstimate.min),
        photoContextUrl,
        photoDetailUrl,
        riskScore,
        notifiedOwner: false,
        createdByUserId: ctx.saasUser.userId,
      });

      // Notificar owner se severidade alta
      if (input.severity === "high") {
        const [inspection] = await db.select().from(propertyInspections)
          .where(eq(propertyInspections.id, input.inspectionId));

        await notifyOwner({
          title: "🔴 Patologia de Alta Severidade Detectada",
          content: `Vistoria #${input.inspectionId} — ${inspection?.propertyAddress ?? "Endereço não informado"}\n\nCategoria: ${input.category}\nSeveridade: ALTA\nRisk Score: ${riskScore}/10\n\nEsta ocorrência pode indicar necessidade de serviço presencial de engenharia.\n\nEng. Judson Aleixo Sampaio — (31) 9 9738-3115`,
        });

        await db.update(inspectionPathologies)
          .set({ notifiedOwner: true })
          .where(eq(inspectionPathologies.id, (created as any).insertId ?? 0));
      }

      return { success: true, riskScore, repairEstimate };
    }),

  // Listar patologias de uma vistoria
  list: saasAuthProcedure
    .input(z.object({ inspectionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível." });
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada." });

      const pathologies = await db.select().from(inspectionPathologies)
        .where(and(
          eq(inspectionPathologies.inspectionId, input.inspectionId),
          eq(inspectionPathologies.companyId, companyId),
        ))
        .orderBy(desc(inspectionPathologies.createdAt));

      const totalRiskScore = pathologies.reduce((sum, p) => sum + (p.riskScore ?? 0), 0);
      const maxRisk = pathologies.length > 0 ? Math.max(...pathologies.map(p => p.riskScore ?? 0)) : 0;

      return { pathologies, totalRiskScore, maxRisk };
    }),

  // Deletar patologia
  delete: saasAuthProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível." });
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada." });

      const [existing] = await db.select().from(inspectionPathologies)
        .where(and(
          eq(inspectionPathologies.id, input.id),
          eq(inspectionPathologies.companyId, companyId),
        ));

      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Patologia não encontrada." });

      await db.delete(inspectionPathologies).where(eq(inspectionPathologies.id, input.id));
      return { success: true };
    }),
});

// ─── MAINTENANCE ROUTER ───────────────────────────────────────────────────────
export const maintenanceTaskRouter = router({

  // Criar tarefa de manutenção
  create: saasAuthProcedure
    .input(z.object({
      inspectionId: z.number(),
      pathologyId: z.number().optional(),
      title: z.string().min(3),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      dueDate: z.string().optional(), // ISO date string
      estimatedCost: z.number().optional(),
      assignedTo: z.string().optional(),
      isFireSafetyRelated: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível." });
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada." });

      await db.insert(inspectionMaintenanceTasks).values({
        companyId,
        inspectionId: input.inspectionId,
        pathologyId: input.pathologyId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        estimatedCost: input.estimatedCost ? String(input.estimatedCost) : undefined,
        assignedTo: input.assignedTo,
        isFireSafetyRelated: input.isFireSafetyRelated,
        co2ServiceOffered: false,
        notifiedOwner: false,
        createdByUserId: ctx.saasUser.userId,
      });

      // Notificar se manutenção vence em menos de 30 dias
      if (input.dueDate) {
        const dueMs = new Date(input.dueDate).getTime();
        const nowMs = Date.now();
        const diffDays = Math.floor((dueMs - nowMs) / (1000 * 60 * 60 * 24));

        if (diffDays <= 30 && diffDays >= 0) {
          await notifyOwner({
            title: "⚠️ Manutenção com Prazo Próximo",
            content: `Tarefa: ${input.title}\nVistoria #${input.inspectionId}\nPrazo: ${input.dueDate} (${diffDays} dias)\n\nSolicitar serviço CO2 Contra Incêndio: (31) 9 9738-3115`,
          });
        }
      }

      return { success: true };
    }),

  // Listar tarefas de uma vistoria
  list: saasAuthProcedure
    .input(z.object({ inspectionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível." });
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada." });

      return db.select().from(inspectionMaintenanceTasks)
        .where(and(
          eq(inspectionMaintenanceTasks.inspectionId, input.inspectionId),
          eq(inspectionMaintenanceTasks.companyId, companyId),
        ))
        .orderBy(desc(inspectionMaintenanceTasks.createdAt));
    }),

  // Atualizar status da tarefa
  updateStatus: saasAuthProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pendente", "em_andamento", "concluida", "cancelada"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível." });
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada." });

      await db.update(inspectionMaintenanceTasks)
        .set({ status: input.status })
        .where(and(
          eq(inspectionMaintenanceTasks.id, input.id),
          eq(inspectionMaintenanceTasks.companyId, companyId),
        ));

      return { success: true };
    }),
});

// ─── COMPARISON ROUTER ────────────────────────────────────────────────────────
export const comparisonRouter = router({

  // Criar comparação Entrada vs. Saída
  create: saasAuthProcedure
    .input(z.object({
      entryInspectionId: z.number(),
      exitInspectionId: z.number().optional(),
      overallConditionEntry: z.enum(["otimo", "bom", "regular", "ruim"]).optional(),
      overallConditionExit: z.enum(["otimo", "bom", "regular", "ruim"]).optional(),
      depreciationEstimate: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível." });
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada." });

      const [entry] = await db.select().from(propertyInspections)
        .where(eq(propertyInspections.id, input.entryInspectionId));
      if (!entry) throw new TRPCError({ code: "NOT_FOUND", message: "Vistoria de entrada não encontrada." });

      await db.insert(inspectionComparisons).values({
        companyId,
        entryInspectionId: input.entryInspectionId,
        exitInspectionId: input.exitInspectionId,
        propertyAddress: entry.propertyAddress ?? undefined,
        contractNumber: entry.contractNumber ?? undefined,
        overallConditionEntry: input.overallConditionEntry,
        overallConditionExit: input.overallConditionExit,
        depreciationEstimate: input.depreciationEstimate ? String(input.depreciationEstimate) : undefined,
        createdByUserId: ctx.saasUser.userId,
      });

      return { success: true };
    }),

  // Listar comparações da empresa
  list: saasAuthProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível." });
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada." });

      return db.select().from(inspectionComparisons)
        .where(eq(inspectionComparisons.companyId, companyId))
        .orderBy(desc(inspectionComparisons.createdAt));
    }),

  // Gerar diffSummary via LLM e salvar na comparação
  generateDiff: saasAuthProcedure
    .input(z.object({ comparisonId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível." });
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada." });

      const [comparison] = await db.select().from(inspectionComparisons)
        .where(and(
          eq(inspectionComparisons.id, input.comparisonId),
          eq(inspectionComparisons.companyId, companyId),
        ));
      if (!comparison) throw new TRPCError({ code: "NOT_FOUND", message: "Comparação não encontrada." });

      const [entry] = await db.select().from(propertyInspections)
        .where(eq(propertyInspections.id, comparison.entryInspectionId));
      const exit = comparison.exitInspectionId
        ? (await db.select().from(propertyInspections)
            .where(eq(propertyInspections.id, comparison.exitInspectionId)))[0]
        : null;

      // Buscar patologias das duas vistorias
      const entryPathologies = await db.select().from(inspectionPathologies)
        .where(eq(inspectionPathologies.inspectionId, comparison.entryInspectionId));
      const exitPathologies = exit
        ? await db.select().from(inspectionPathologies)
            .where(eq(inspectionPathologies.inspectionId, comparison.exitInspectionId!))
        : [];

      const { invokeLLM } = await import("./_core/llm");
      const prompt = `Você é um perito em engenharia diagnóstica imobiliária. Compare as duas vistorias abaixo e gere um relatório técnico de diferenças.

VISTORIA DE ENTRADA:
- Endereço: ${entry?.propertyAddress ?? "não informado"}
- Data: ${entry?.createdAt ? new Date(entry.createdAt).toLocaleDateString("pt-BR") : "não informada"}
- Condição geral: ${comparison.overallConditionEntry ?? "não avaliada"}
- Patologias registradas: ${entryPathologies.length} (${entryPathologies.map(p => p.category).join(", ") || "nenhuma"})

VISTORIA DE SAÍDA:
- Data: ${exit?.createdAt ? new Date(exit.createdAt).toLocaleDateString("pt-BR") : "pendente"}
- Condição geral: ${comparison.overallConditionExit ?? "não avaliada"}
- Patologias registradas: ${exitPathologies.length} (${exitPathologies.map(p => p.category).join(", ") || "nenhuma"})

Gere um JSON com a seguinte estrutura:
{
  "resumo": "texto resumido da comparação em 2-3 frases",
  "degradacao": "nenhuma" | "leve" | "moderada" | "severa",
  "itensAfetados": ["lista de itens com degradação"],
  "causasProvaveis": ["lista de causas prováveis"],
  "reparosRecomendados": ["lista de reparos recomendados"],
  "estimativaDepreciacao": numero_em_reais_ou_null,
  "fundamentoLegal": "Art. 23, II da Lei 8.245/91 — responsabilidade do locatário"
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você é um perito em engenharia diagnóstica imobiliária. Responda apenas com JSON válido." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" } as any,
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const diffSummary: string = typeof rawContent === "string" ? rawContent : "{}";

      // Atualizar a comparação com o diffSummary e estimativa de depreciação do LLM
      let parsedDiff: any = {};
      try { parsedDiff = JSON.parse(diffSummary); } catch { /* JSON inválido */ }

      await db.update(inspectionComparisons)
        .set({
          diffSummary,
          depreciationEstimate: parsedDiff.estimativaDepreciacao
            ? String(parsedDiff.estimativaDepreciacao)
            : comparison.depreciationEstimate,
        })
        .where(eq(inspectionComparisons.id, input.comparisonId));

      return { diffSummary, parsed: parsedDiff };
    }),

  // Buscar comparação por ID
  getById: saasAuthProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível." });
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada." });

      const [comparison] = await db.select().from(inspectionComparisons)
        .where(and(
          eq(inspectionComparisons.id, input.id),
          eq(inspectionComparisons.companyId, companyId),
        ));

      if (!comparison) throw new TRPCError({ code: "NOT_FOUND", message: "Comparação não encontrada." });

      // Buscar vistorias de entrada e saída
      const [entry] = await db.select().from(propertyInspections)
        .where(eq(propertyInspections.id, comparison.entryInspectionId));

      const exit = comparison.exitInspectionId
        ? (await db.select().from(propertyInspections)
            .where(eq(propertyInspections.id, comparison.exitInspectionId)))[0]
        : null;

      return { comparison, entry, exit };
    }),
});

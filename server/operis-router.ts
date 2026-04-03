/**
 * OPERIS IA Router — tRPC
 * Procedures para o módulo de inspeção técnica com IA
 * Integrado ao projeto co2-contra-incendio
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "./_core/trpc";
import { saasAuthProcedure } from "./saas-routers";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { sendEmail } from "./notifications";
import {
  operisInspections,
  operisInspectionItems,
  operisReports,
  saasUsers,
  saasCompanies,
} from "../drizzle/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { saasAdminProcedure } from "./saas-routers";
import {
  analyzeInspectionImages,
  generateTechnicalReport,
  type InspectionItem,
} from "./operis/ai-service";
import { calculateInspectionRisk } from "./operis/risk-engine";

// ─── Checklist por tipo de sistema ───────────────────────────────────────────

const CHECKLIST_ITEMS: Record<string, InspectionItem[]> = {
  CO2: [
    { id: "co2-1", title: "Cilindros de CO₂", description: "Verificar peso, pressão e estado de conservação dos cilindros", system: "CO2", norm_reference: "NBR 12615 / NFPA 12" },
    { id: "co2-2", title: "Válvulas e conexões", description: "Inspecionar válvulas de disparo, conexões e tubulações", system: "CO2", norm_reference: "NBR 12615 / NFPA 12" },
    { id: "co2-3", title: "Bicos difusores", description: "Verificar desobstrução e posicionamento dos bicos", system: "CO2", norm_reference: "NBR 12615 / NFPA 12" },
    { id: "co2-4", title: "Painel de controle", description: "Testar painel de controle e sinalização", system: "CO2", norm_reference: "NBR 12615 / NFPA 12" },
    { id: "co2-5", title: "Detectores de incêndio", description: "Verificar detectores que acionam o sistema", system: "CO2", norm_reference: "NBR 17240" },
  ],
  Hidrante: [
    { id: "hid-1", title: "Reservatório de água", description: "Verificar nível, limpeza e estado do reservatório", system: "Hidrante", norm_reference: "NBR 13714" },
    { id: "hid-2", title: "Bomba de incêndio", description: "Testar partida automática e manual da bomba", system: "Hidrante", norm_reference: "NBR 13714" },
    { id: "hid-3", title: "Mangueiras e esguichos", description: "Verificar estado das mangueiras, esguichos e abrigos", system: "Hidrante", norm_reference: "NBR 13714" },
    { id: "hid-4", title: "Hidrantes de parede e coluna", description: "Inspecionar válvulas angulares e pressão disponível", system: "Hidrante", norm_reference: "NBR 13714" },
  ],
  SDAI: [
    { id: "sdai-1", title: "Detectores de fumaça", description: "Testar sensibilidade e funcionamento dos detectores", system: "SDAI", norm_reference: "NBR 17240" },
    { id: "sdai-2", title: "Detectores de calor", description: "Verificar detectores de calor e acionadores manuais", system: "SDAI", norm_reference: "NBR 17240" },
    { id: "sdai-3", title: "Central de alarme", description: "Testar central de alarme, zonas e sinalização", system: "SDAI", norm_reference: "NBR 17240" },
    { id: "sdai-4", title: "Sirenes e strobes", description: "Verificar funcionamento de sirenes e dispositivos visuais", system: "SDAI", norm_reference: "NBR 17240" },
  ],
  SPK: [
    { id: "spk-1", title: "Sprinklers", description: "Verificar estado dos sprinklers e temperatura de ativação", system: "SPK", norm_reference: "NBR 10897 / NFPA 13" },
    { id: "spk-2", title: "Válvula de governo e alarme", description: "Testar VGA e alarme de fluxo de água", system: "SPK", norm_reference: "NBR 10897" },
    { id: "spk-3", title: "Tubulações e suportes", description: "Inspecionar tubulações, suportes e anticorrosão", system: "SPK", norm_reference: "NBR 10897" },
  ],
  PMOC: [
    { id: "pmoc-1", title: "Equipamentos de ar condicionado", description: "Verificar estado e funcionamento das unidades", system: "PMOC", norm_reference: "Portaria MS 3523/98" },
    { id: "pmoc-2", title: "Filtros e serpentinas", description: "Inspecionar filtros, serpentinas e bandejas de condensado", system: "PMOC", norm_reference: "Portaria MS 3523/98" },
    { id: "pmoc-3", title: "Qualidade do ar", description: "Verificar parâmetros de qualidade do ar interior", system: "PMOC", norm_reference: "RE ANVISA 09/2003" },
  ],
};

// ─── Router OPERIS ────────────────────────────────────────────────────────────

export const operisRouter = router({
  // Listar sistemas disponíveis para inspeção
  getSystems: saasAuthProcedure.query(() => {
    return Object.keys(CHECKLIST_ITEMS).map((system) => ({
      id: system,
      name: system,
      itemCount: CHECKLIST_ITEMS[system].length,
    }));
  }),

  // Obter checklist de um sistema
  getChecklist: saasAuthProcedure
    .input(z.object({ system: z.string() }))
    .query(({ input }) => {
      const items = CHECKLIST_ITEMS[input.system];
      if (!items) {
        throw new TRPCError({ code: "NOT_FOUND", message: `Sistema '${input.system}' não encontrado` });
      }
      return items;
    }),

  // Criar nova inspeção
  createInspection: saasAuthProcedure
    .input(
      z.object({
        title: z.string().min(3).max(300),
        location: z.string().min(3).max(300),
        client: z.string().min(2).max(200),
        unit: z.string().max(200).optional(),
        system: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      if (!ctx.saasUser.companyId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário sem empresa associada" });
      }
      const [result] = await db.insert(operisInspections).values({
        companyId: ctx.saasUser.companyId,
        userId: ctx.saasUser.userId,
        title: input.title,
        location: input.location,
        client: input.client,
        unit: input.unit,
        system: input.system,
        status: "em_progresso",
        globalRisk: "R1",
      });

      return { inspectionId: result.insertId };
    }),

  // Analisar imagens de um item do checklist com IA
  analyzeItem: saasAuthProcedure
    .input(
      z.object({
        inspectionId: z.number(),
        itemId: z.string(),
        imageUrls: z.array(z.string().url()).min(1).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verificar que a inspeção pertence à empresa do usuário
      const [inspection] = await db
        .select()
        .from(operisInspections)
        .where(
          and(
            eq(operisInspections.id, input.inspectionId),
            eq(operisInspections.companyId, ctx.saasUser.companyId ?? -1)
          )
        )
        .limit(1);

      if (!inspection) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Inspeção não encontrada" });
      }

      // Buscar o item do checklist
      const systemItems = CHECKLIST_ITEMS[inspection.system] || [];
      const checklistItem = systemItems.find((i) => i.id === input.itemId);
      if (!checklistItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: `Item '${input.itemId}' não encontrado no checklist` });
      }

      // Analisar imagens com IA
      const analysis = await analyzeInspectionImages(checklistItem, input.imageUrls);

      // Salvar resultado no banco
      await db.insert(operisInspectionItems).values({
        inspectionId: input.inspectionId,
        itemId: input.itemId,
        itemTitle: checklistItem.title,
        system: checklistItem.system,
        normReference: checklistItem.norm_reference,
        status: analysis.status,
        findings: analysis.findings,
        riskLevel: analysis.risk_level,
        recommendations: analysis.recommendations,
        aiConfidence: String(analysis.confidence),
        imageUrls: input.imageUrls,
        analyzedAt: new Date(),
      });

      return analysis;
    }),

  // Gerar laudo técnico da inspeção
  generateReport: saasAuthProcedure
    .input(z.object({ inspectionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verificar que a inspeção pertence à empresa do usuário
      const [inspection] = await db
        .select()
        .from(operisInspections)
        .where(
          and(
            eq(operisInspections.id, input.inspectionId),
            eq(operisInspections.companyId, ctx.saasUser.companyId ?? -1)
          )
        )
        .limit(1);

      if (!inspection) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Inspeção não encontrada" });
      }

      // Buscar todos os itens analisados
      const items = await db
        .select()
        .from(operisInspectionItems)
        .where(eq(operisInspectionItems.inspectionId, input.inspectionId));

      if (items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nenhum item analisado. Realize a inspeção dos itens antes de gerar o laudo.",
        });
      }

      // Calcular risco global
      const systemItems = CHECKLIST_ITEMS[inspection.system] || [];
      const riskData = calculateInspectionRisk(
        items.map((item) => ({
          item_id: item.itemId,
          item_title: item.itemTitle,
          system: item.system,
          analysis: {
            item_id: item.itemId,
            status: (item.status || "necessita_revisao") as "conforme" | "nao_conforme" | "necessita_revisao",
            findings: item.findings || "",
            risk_level: (item.riskLevel || "R1") as "R1" | "R2" | "R3" | "R4" | "R5",
            recommendations: (item.recommendations as string[]) || [],
            confidence: parseFloat(item.aiConfidence || "0.8"),
          },
        }))
      );

      // Atualizar risco global na inspeção
      await db
        .update(operisInspections)
        .set({
          globalRisk: riskData.global_risk,
          riskBySytem: riskData.risk_by_system,
          status: "concluida",
        })
        .where(eq(operisInspections.id, input.inspectionId));

      // Buscar dados do técnico responsável (nome + empresa)
      const [techUser] = await db
        .select({ name: saasUsers.name, companyId: saasUsers.companyId })
        .from(saasUsers)
        .where(eq(saasUsers.id, ctx.saasUser.userId))
        .limit(1);
      let companyName: string | undefined;
      if (techUser?.companyId) {
        const [co] = await db
          .select({ name: saasCompanies.name })
          .from(saasCompanies)
          .where(eq(saasCompanies.id, techUser.companyId))
          .limit(1);
        companyName = co?.name;
      }
      // Buscar assinatura existente para este laudo
      const [existingReport] = await db
        .select({ signatureUrl: operisReports.signatureUrl })
        .from(operisReports)
        .where(eq(operisReports.inspectionId, input.inspectionId))
        .orderBy(desc(operisReports.generatedAt))
        .limit(1);
      // Gerar laudo HTML com IA
      const htmlContent = await generateTechnicalReport({
        title: inspection.title,
        location: inspection.location,
        client: inspection.client,
        unit: inspection.unit || undefined,
        system: inspection.system,
        technicianName: techUser?.name ?? undefined,
        companyName,
        signatureUrl: existingReport?.signatureUrl ?? undefined,
        items: items.map((item) => {
          const checklistItem = systemItems.find((ci) => ci.id === item.itemId) || {
            id: item.itemId,
            title: item.itemTitle,
            description: "",
            system: item.system,
            norm_reference: item.normReference || "",
          };
          return {
            item: checklistItem,
            analysis: {
              item_id: item.itemId,
              status: (item.status || "necessita_revisao") as "conforme" | "nao_conforme" | "necessita_revisao",
              findings: item.findings || "",
              risk_level: (item.riskLevel || "R1") as "R1" | "R2" | "R3" | "R4" | "R5",
              recommendations: (item.recommendations as string[]) || [],
              confidence: parseFloat(item.aiConfidence || "0.8"),
            },
            images: (item.imageUrls as string[]) || [],
          };
        }),
      });

      // Gerar slug público para SEO
      const publicSlug = `operis-${input.inspectionId}-${Date.now()}`;

      // Salvar laudo no banco
      const [reportResult] = await db.insert(operisReports).values({
        inspectionId: input.inspectionId,
        companyId: ctx.saasUser.companyId ?? -1,
        htmlContent,
        globalRisk: riskData.global_risk,
        status: "pronto",
        publicSlug,
        generatedAt: new Date(),
      });

      return {
        reportId: reportResult.insertId,
        htmlContent,
        globalRisk: riskData.global_risk,
        riskSummary: riskData.summary,
        criticalItems: riskData.critical_items,
        publicSlug,
      };
    }),

  // Listar inspeções da empresa
  listInspections: saasAuthProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(["em_progresso", "concluida", "revisao"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const conditions = [eq(operisInspections.companyId, ctx.saasUser.companyId ?? -1)];

      if (input.status) {
        conditions.push(eq(operisInspections.status, input.status));
      }

      const inspections = await db
        .select()
        .from(operisInspections)
        .where(and(...conditions))
        .orderBy(desc(operisInspections.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return inspections;
    }),

  // Buscar inspeção por ID
  getInspection: saasAuthProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [inspection] = await db
        .select()
        .from(operisInspections)
        .where(
          and(
            eq(operisInspections.id, input.id),
            eq(operisInspections.companyId, ctx.saasUser.companyId ?? -1)
          )
        )
        .limit(1);

      if (!inspection) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Inspeção não encontrada" });
      }

      const items = await db
        .select()
        .from(operisInspectionItems)
        .where(eq(operisInspectionItems.inspectionId, input.id));

      return { inspection, items };
    }),

  // Buscar laudo por ID
  getReport: saasAuthProcedure
    .input(z.object({ reportId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [report] = await db
        .select()
        .from(operisReports)
        .where(
          and(
            eq(operisReports.id, input.reportId),
            eq(operisReports.companyId, ctx.saasUser.companyId ?? -1)
          )
        )
        .limit(1);

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Laudo não encontrado" });
      }

      return report;
    }),

  // Salvar assinatura digital no laudo
  saveReportSignature: saasAuthProcedure
    .input(
      z.object({
        reportId: z.number(),
        signatureBase64: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verificar que o laudo pertence à empresa
      const [report] = await db
        .select()
        .from(operisReports)
        .where(
          and(
            eq(operisReports.id, input.reportId),
            eq(operisReports.companyId, ctx.saasUser.companyId ?? -1)
          )
        )
        .limit(1);

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Laudo não encontrado" });
      }

      // Upload da assinatura para S3
      const base64Data = input.signatureBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const fileKey = `operis-signatures/${ctx.saasUser.companyId}/${input.reportId}-${Date.now()}.png`;
      const { url } = await storagePut(fileKey, buffer, "image/png");

      // Salvar URL da assinatura no banco
      await db
        .update(operisReports)
        .set({ signatureUrl: url })
        .where(eq(operisReports.id, input.reportId));

      return { signatureUrl: url };
    }),

  // ─── PAINEL ADMIN ────────────────────────────────────────────────────────────

  // Estatísticas globais para o painel admin
  adminStats: saasAdminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [totalInspections] = await db.select({ count: count() }).from(operisInspections);
    const [totalReports] = await db.select({ count: count() }).from(operisReports);
    const riskDist = await db
      .select({ risk: operisInspections.globalRisk, cnt: count() })
      .from(operisInspections)
      .groupBy(operisInspections.globalRisk);
    const [nonConformities] = await db
      .select({ count: count() })
      .from(operisInspectionItems)
      .where(eq(operisInspectionItems.status, "nao_conforme"));
    const technicians = await db
      .select({
        id: saasUsers.id,
        name: saasUsers.name,
        email: saasUsers.email,
        inspectionCount: sql<number>`COUNT(${operisInspections.id})`,
      })
      .from(saasUsers)
      .leftJoin(operisInspections, eq(operisInspections.userId, saasUsers.id))
      .where(eq(saasUsers.role, "tecnico"))
      .groupBy(saasUsers.id, saasUsers.name, saasUsers.email);
    return {
      totalInspections: totalInspections.count,
      totalReports: totalReports.count,
      nonConformities: nonConformities.count,
      riskDistribution: riskDist,
      technicians,
    };
  }),

  // Listar todas as inspeções (admin — todas as empresas)
  adminListInspections: saasAdminProcedure
    .input(z.object({
      status: z.string().optional(),
      technicianId: z.number().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const offset = (input.page - 1) * input.limit;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conditions: any[] = [];
      if (input.status) conditions.push(eq(operisInspections.status, input.status as "em_progresso" | "concluida" | "revisao"));
      if (input.technicianId) conditions.push(eq(operisInspections.userId, input.technicianId));
      const rows = await db
        .select({
          id: operisInspections.id,
          systemType: operisInspections.system,
          status: operisInspections.status,
          globalRisk: operisInspections.globalRisk,
          createdAt: operisInspections.createdAt,
          title: operisInspections.title,
          client: operisInspections.client,
          technicianName: saasUsers.name,
          companyName: saasCompanies.name,
        })
        .from(operisInspections)
        .leftJoin(saasUsers, eq(operisInspections.userId, saasUsers.id))
        .leftJoin(saasCompanies, eq(operisInspections.companyId, saasCompanies.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(operisInspections.createdAt))
        .limit(input.limit)
        .offset(offset);
      return rows;
    }),

  // Listar todos os laudos (admin — todas as empresas)
  adminListReports: saasAdminProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const offset = (input.page - 1) * input.limit;
      const rows = await db
        .select({
          id: operisReports.id,
          publicSlug: operisReports.publicSlug,
          globalRisk: operisReports.globalRisk,
          status: operisReports.status,
          generatedAt: operisReports.generatedAt,
          technicianName: saasUsers.name,
          companyName: saasCompanies.name,
        })
        .from(operisReports)
        .leftJoin(operisInspections, eq(operisReports.inspectionId, operisInspections.id))
        .leftJoin(saasUsers, eq(operisInspections.userId, saasUsers.id))
        .leftJoin(saasCompanies, eq(operisInspections.companyId, saasCompanies.id))
        .orderBy(desc(operisReports.generatedAt))
        .limit(input.limit)
        .offset(offset);
      return rows;
    }),

  // Envio de laudo por e-mail via servidor SMTP
  sendLaudoEmail: saasAuthProcedure
    .input(z.object({
      to: z.string().email(),
      slug: z.string(),
      laudoTitle: z.string().optional(),
      origin: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const laudoUrl = `${input.origin ?? "https://co2contra.com"}/operis/laudo/${input.slug}`;
      const title = input.laudoTitle ?? "Laudo Técnico OPERIS";
      const subject = `${title} — CO2 Contra Incêndio`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#C8102E;padding:20px 24px;">
            <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;letter-spacing:1px;">OPERIS IA</h1>
            <p style="color:#fca5a5;font-size:12px;margin:4px 0 0;">Inspeção e Laudos Inteligentes</p>
          </div>
          <div style="padding:28px 24px;background:#f9fafb;">
            <h2 style="font-size:18px;color:#111827;margin:0 0 12px;">${title}</h2>
            <p style="color:#4B5563;font-size:14px;line-height:1.6;">Segue o laudo técnico gerado pelo sistema OPERIS IA da CO2 Contra Incêndio.</p>
            <div style="margin:24px 0;">
              <a href="${laudoUrl}" style="background:#C8102E;color:#fff;padding:12px 24px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">Acessar Laudo Técnico</a>
            </div>
            <p style="color:#9CA3AF;font-size:12px;">Ou copie o link: <a href="${laudoUrl}" style="color:#C8102E;">${laudoUrl}</a></p>
          </div>
          <div style="padding:16px 24px;background:#1f2937;">
            <p style="color:#9CA3AF;font-size:11px;margin:0;">CO2 Contra Incêndio — Eng. Judson Aleixo Sampaio | CREA 142203671-5</p>
            <p style="color:#6B7280;font-size:11px;margin:4px 0 0;">NBR 12615 · NFPA 12 · UL 300</p>
          </div>
        </div>
      `;
      const result = await sendEmail(input.to, subject, `Acesse o laudo em: ${laudoUrl}`, html);
      if (!result.success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error ?? "Falha ao enviar e-mail" });
      }
      return { success: true };
    }),

  // Laudo público por slug (SEO) — sem autenticação
  getPublicReport: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [report] = await db
        .select()
        .from(operisReports)
        .where(eq(operisReports.publicSlug, input.slug))
        .limit(1);

      if (!report || report.status !== "pronto") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Laudo não encontrado ou não disponível" });
      }

      return {
        htmlContent: report.htmlContent,
        globalRisk: report.globalRisk,
        generatedAt: report.generatedAt,
        signatureUrl: report.signatureUrl,
      };
    }),
});

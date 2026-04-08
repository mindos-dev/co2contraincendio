/**
 * OPERIS — Vistoria de Sistemas Fixos de Incêndio
 * Módulo add-on: requer plano Prêmio ou Industrial
 * Normas: NBR 14518:2019, NBR 13714, NBR 17240, NBR 10897, IT CBMMG
 * Seed: operis_kitchen_module_v1 — 16 seções / 53 itens
 */
import { z } from "zod";
import { createHash } from "crypto";
import { eq, desc } from "drizzle-orm";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import {
  fireSystemInspections,
  fireSystemItems,
  fireSystemAuditLogs,
  type InsertFireSystemInspection,
  type InsertFireSystemItem,
  type InsertFireSystemAuditLog,
} from "../drizzle/schema";

// ─── Checklist Seed (16 seções / 53 itens) ───────────────────────────────────

export const FIRE_SYSTEM_CHECKLIST_SEED = [
  {
    code: "1", name: "Coifas", normRef: "FTR 3.1.1",
    items: [
      { code: "1.1", title: "Coifa instalada sobre todos os equipamentos de cocção", riskLevel: 3, weight: 2.0 },
      { code: "1.2", title: "Dimensionamento conforme cálculo de vazão (m³/h)", riskLevel: 3, weight: 2.0 },
      { code: "1.3", title: "Material em aço inoxidável AISI 304 ou superior", riskLevel: 2, weight: 1.5 },
      { code: "1.4", title: "Soldagem contínua sem frestas (sem rebites ou parafusos expostos)", riskLevel: 4, weight: 2.5 },
      { code: "1.5", title: "Coifa com borda de captação mínima de 150mm além do equipamento", riskLevel: 2, weight: 1.5 },
    ],
  },
  {
    code: "2", name: "Filtros Inerciais", normRef: "FTR 3.1.2",
    items: [
      { code: "2.1", title: "Filtros inerciais instalados em toda a extensão da coifa", riskLevel: 3, weight: 2.0 },
      { code: "2.2", title: "Inclinação dos filtros entre 45° e 60° para drenagem de gordura", riskLevel: 3, weight: 2.0 },
      { code: "2.3", title: "Bandeja coletora de gordura presente e acessível para limpeza", riskLevel: 4, weight: 2.5 },
    ],
  },
  {
    code: "3", name: "Dampers", normRef: "FTR 3.1.3",
    items: [
      { code: "3.1", title: "Damper corta-fogo instalado na passagem do duto pela laje/parede", riskLevel: 5, weight: 3.0 },
      { code: "3.2", title: "Damper com fusível térmico calibrado (geralmente 72°C)", riskLevel: 5, weight: 3.0 },
      { code: "3.3", title: "Damper acessível para inspeção e manutenção", riskLevel: 3, weight: 2.0 },
    ],
  },
  {
    code: "4", name: "Dutos", normRef: "FTR 3.1.4",
    items: [
      { code: "4.1", title: "Dutos em aço carbono ou inoxidável com espessura mínima conforme SMACNA", riskLevel: 3, weight: 2.0 },
      { code: "4.2", title: "Dutos com inclinação mínima de 1% em direção à coifa (drenagem de gordura)", riskLevel: 3, weight: 2.0 },
      { code: "4.3", title: "Dutos sem emendas com rebites ou parafusos expostos internamente", riskLevel: 4, weight: 2.5 },
      { code: "4.4", title: "Portas de inspeção a cada 3m ou em cada mudança de direção", riskLevel: 3, weight: 2.0 },
      { code: "4.5", title: "Dutos com afastamento mínimo de 150mm de materiais combustíveis", riskLevel: 4, weight: 2.5 },
      { code: "4.6", title: "Dutos com isolamento térmico em passagens por áreas não climatizadas", riskLevel: 2, weight: 1.5 },
    ],
  },
  {
    code: "5", name: "Elemento Despoluidor", normRef: "FTR 3.1.5",
    items: [
      { code: "5.1", title: "Elemento despoluidor (filtro eletrostático ou UV) instalado quando exigido", riskLevel: 3, weight: 2.0 },
      { code: "5.2", title: "Eficiência do elemento despoluidor documentada (≥95% para PM10)", riskLevel: 2, weight: 1.5 },
      { code: "5.3", title: "Manutenção periódica do elemento despoluidor documentada", riskLevel: 2, weight: 1.5 },
      { code: "5.4", title: "Alarme de saturação ou indicador de manutenção presente", riskLevel: 2, weight: 1.5 },
    ],
  },
  {
    code: "6", name: "Portas de Inspeção", normRef: "FTR 3.1.6",
    items: [
      { code: "6.1", title: "Portas de inspeção instaladas em pontos estratégicos do duto", riskLevel: 3, weight: 2.0 },
      { code: "6.2", title: "Portas de inspeção com vedação adequada (sem vazamentos)", riskLevel: 3, weight: 2.0 },
      { code: "6.3", title: "Portas de inspeção identificadas e acessíveis", riskLevel: 2, weight: 1.5 },
      { code: "6.4", title: "Registro de limpeza afixado próximo à porta de inspeção", riskLevel: 2, weight: 1.5 },
    ],
  },
  {
    code: "7", name: "Memorial de Cálculo", normRef: "FTR 3.1.7",
    items: [
      { code: "7.1", title: "Memorial de cálculo de vazão disponível e assinado por RT", riskLevel: 3, weight: 2.0 },
      { code: "7.2", title: "Cálculo contempla todos os equipamentos de cocção em operação simultânea", riskLevel: 3, weight: 2.0 },
      { code: "7.3", title: "Memorial atualizado após alterações no layout da cozinha", riskLevel: 2, weight: 1.5 },
    ],
  },
  {
    code: "8", name: "Equipamentos de Cocção Contemplados", normRef: "FTR 3.1.8",
    items: [
      { code: "8.1", title: "Todos os equipamentos de cocção listados no memorial de cálculo", riskLevel: 3, weight: 2.0 },
      { code: "8.2", title: "Equipamentos com BTU/h ou kW declarados e compatíveis com o sistema", riskLevel: 3, weight: 2.0 },
      { code: "8.3", title: "Equipamentos novos ou substituídos reavaliados no sistema de exaustão", riskLevel: 3, weight: 2.0 },
    ],
  },
  {
    code: "9", name: "Classificação do Sistema quanto à NBR 14518", normRef: "FTR 3.1.9",
    items: [
      { code: "9.1", title: "Sistema classificado como Tipo I (alta temperatura) ou Tipo II conforme carga térmica", riskLevel: 3, weight: 2.0 },
      { code: "9.2", title: "Classificação documentada no projeto executivo", riskLevel: 2, weight: 1.5 },
      { code: "9.3", title: "Frequência de limpeza compatível com a classificação do sistema", riskLevel: 3, weight: 2.0 },
    ],
  },
  {
    code: "10", name: "Isolamento Térmico nos Dutos", normRef: "FTR 3.1.10",
    items: [
      { code: "10.1", title: "Isolamento térmico instalado em dutos que passam por áreas climatizadas", riskLevel: 2, weight: 1.5 },
      { code: "10.2", title: "Material de isolamento com classificação de reação ao fogo adequada", riskLevel: 3, weight: 2.0 },
      { code: "10.3", title: "Isolamento sem danos visíveis (rasgos, umidade, desprendimento)", riskLevel: 2, weight: 1.5 },
    ],
  },
  {
    code: "11", name: "Exaustor", normRef: "FTR 3.1.11",
    items: [
      { code: "11.1", title: "Exaustor com capacidade (m³/h) compatível com o cálculo de projeto", riskLevel: 4, weight: 2.5 },
      { code: "11.2", title: "Motor do exaustor externo ao duto (motor fora do fluxo de ar contaminado)", riskLevel: 4, weight: 2.5 },
      { code: "11.3", title: "Exaustor com proteção contra intempéries na descarga (chapéu ou defletor)", riskLevel: 2, weight: 1.5 },
      { code: "11.4", title: "Exaustor com intertravamento com o sistema de supressão de incêndio", riskLevel: 5, weight: 3.0 },
    ],
  },
  {
    code: "12", name: "Detalhes Típicos Construtivos", normRef: "FTR 3.1.12",
    items: [
      { code: "12.1", title: "Projeto executivo com detalhes construtivos disponível no local", riskLevel: 2, weight: 1.5 },
      { code: "12.2", title: "As-built atualizado após modificações no sistema", riskLevel: 2, weight: 1.5 },
    ],
  },
  {
    code: "13", name: "Intertravamento dos Sistemas", normRef: "FTR 3.1.13",
    items: [
      { code: "13.1", title: "Sistema de supressão interligado ao corte de gás/energia dos equipamentos", riskLevel: 5, weight: 3.0 },
      { code: "13.2", title: "Exaustor desliga automaticamente na ativação do sistema de supressão", riskLevel: 5, weight: 3.0 },
      { code: "13.3", title: "Alarme sonoro e visual ativado na detecção de incêndio", riskLevel: 4, weight: 2.5 },
      { code: "13.4", title: "Teste de intertravamento realizado e documentado", riskLevel: 4, weight: 2.5 },
    ],
  },
  {
    code: "14", name: "Sistema de Cocção a Combustível Sólido", normRef: "FTR 3.1.14",
    items: [
      { code: "14.1", title: "Sistema de exaustão dedicado para equipamentos a combustível sólido (lenha/carvão)", riskLevel: 4, weight: 2.5 },
      { code: "14.2", title: "Limpeza de dutos com frequência mínima de 3 meses para combustível sólido", riskLevel: 4, weight: 2.5 },
      { code: "14.3", title: "Cinzeiro e coletor de resíduos sólidos presentes e limpos", riskLevel: 3, weight: 2.0 },
    ],
  },
  {
    code: "15", name: "Sistema Fixo de Incêndio", normRef: "OPERIS Complementar",
    items: [
      { code: "15.1", title: "Sistema fixo de supressão instalado sobre todos os equipamentos de cocção de alto risco", riskLevel: 5, weight: 3.0 },
      { code: "15.2", title: "Agente extintor compatível com o tipo de risco (saponificante para gordura animal/vegetal)", riskLevel: 5, weight: 3.0 },
      { code: "15.3", title: "Bicos de descarga posicionados conforme projeto aprovado", riskLevel: 4, weight: 2.5 },
      { code: "15.4", title: "Cilindro de agente extintor com carga verificada e dentro da validade", riskLevel: 5, weight: 3.0 },
      { code: "15.5", title: "Selo de manutenção afixado no cilindro com data e responsável técnico (CREA)", riskLevel: 4, weight: 2.5 },
    ],
  },
  {
    code: "16", name: "Operação, Inspeção, Manutenção e Ensaios", normRef: "NBR 14518:2019",
    items: [
      { code: "16.1", title: "Manual de operação e manutenção disponível no local (NBR 14518 item 7.1)", riskLevel: 3, weight: 2.0 },
      { code: "16.2", title: "Registro de limpeza e inspeção periódica preenchido e atualizado", riskLevel: 3, weight: 2.0 },
      { code: "16.3", title: "Responsável técnico identificado com CREA ativo", riskLevel: 3, weight: 2.0 },
      { code: "16.4", title: "Treinamento dos operadores da cozinha documentado", riskLevel: 2, weight: 1.5 },
      { code: "16.5", title: "Plano de manutenção preventiva anual elaborado e em execução", riskLevel: 3, weight: 2.0 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateInspectionNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `FSI-${year}${month}-${random}`;
}

function generateAuditHash(inspectionId: number, companyId: number, timestamp: number): string {
  return createHash("sha256")
    .update(`${inspectionId}-${companyId}-${timestamp}-OPERIS-FSI`)
    .digest("hex")
    .substring(0, 16)
    .toUpperCase();
}

function generateReportSlug(inspectionNumber: string): string {
  return inspectionNumber.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

type ScoreItem = { status: string; weight: string | null; riskLevel: number | null };

function calculateScore(items: ScoreItem[]): number {
  if (items.length === 0) return 0;
  let totalWeight = 0;
  let earnedScore = 0;
  for (const item of items) {
    const w = parseFloat(item.weight ?? "1.0");
    if (item.status === "not_applicable") continue;
    totalWeight += w;
    if (item.status === "conforming") earnedScore += w;
  }
  if (totalWeight === 0) return 100;
  return Math.round((earnedScore / totalWeight) * 100 * 100) / 100;
}

function scoreToRisk(score: number): "R1" | "R2" | "R3" | "R4" | "R5" {
  if (score >= 90) return "R1";
  if (score >= 75) return "R2";
  if (score >= 60) return "R3";
  if (score >= 40) return "R4";
  return "R5";
}

async function writeAuditLog(
  inspectionId: number,
  userId: number,
  userName: string,
  action: string,
  entityType = "inspection",
  entityId?: string,
  previousValue?: unknown,
  newValue?: unknown,
  notes?: string
) {
  const db = await getDb();
  if (!db) return;
  const log: InsertFireSystemAuditLog = {
    inspectionId,
    userId,
    userName,
    action,
    entityType,
    entityId: entityId ?? String(inspectionId),
    previousValue: previousValue ? JSON.stringify(previousValue) : null,
    newValue: newValue ? JSON.stringify(newValue) : null,
    notes: notes ?? null,
    createdAt: new Date(),
  };
  await db.insert(fireSystemAuditLogs).values(log);
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const fireSystemRouter = router({
  // ── Criar nova vistoria com checklist completo ──────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        companyId: z.number(),
        enterpriseName: z.string().min(1),
        shoppingName: z.string().optional(),
        storeName: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().max(2).optional(),
        responsibleLocal: z.string().optional(),
        inspectorName: z.string().min(1),
        engineerName: z.string().optional(),
        engineerCrea: z.string().optional(),
        artNumber: z.string().optional(),
        operationType: z.string().optional(),
        fuelType: z.string().optional(),
        cookingClassification: z.string().optional(),
        systemClassification: z.string().optional(),
        generalNotes: z.string().optional(),
        lastMaintenanceProvider: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const inspectionNumber = generateInspectionNumber();
      const reportSlug = generateReportSlug(inspectionNumber);

      const [result] = await db.insert(fireSystemInspections).values({
        ...input,
        inspectionNumber,
        reportSlug,
        status: "in_progress",
        approvalStatus: "pending",
        createdByUserId: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as InsertFireSystemInspection);

      const inspectionId = (result as { insertId: number }).insertId;

      // Criar todos os itens do checklist a partir do seed
      const itemsToInsert: InsertFireSystemItem[] = [];
      for (const section of FIRE_SYSTEM_CHECKLIST_SEED) {
        for (const item of section.items) {
          itemsToInsert.push({
            inspectionId,
            sectionCode: section.code,
            sectionName: section.name,
            itemCode: item.code,
            title: item.title,
            normRef: section.normRef,
            status: "pending",
            riskLevel: item.riskLevel,
            riskCode: `R${item.riskLevel}` as "R1" | "R2" | "R3" | "R4" | "R5",
            weight: String(item.weight),
            score: "0.00",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      await db.insert(fireSystemItems).values(itemsToInsert);

      // Gerar auditHash
      const auditHash = generateAuditHash(inspectionId, input.companyId, Date.now());
      await db
        .update(fireSystemInspections)
        .set({ auditHash })
        .where(eq(fireSystemInspections.id, inspectionId));

      // Log de auditoria
      await writeAuditLog(
        inspectionId,
        ctx.user.id,
        ctx.user.name ?? "Sistema",
        "created",
        "inspection",
        String(inspectionId),
        null,
        { inspectionNumber, enterpriseName: input.enterpriseName },
        `Vistoria criada com ${itemsToInsert.length} itens de checklist`
      );

      return { inspectionId, inspectionNumber, reportSlug, auditHash };
    }),

  // ── Listar vistorias da empresa ─────────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        companyId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      return db
        .select()
        .from(fireSystemInspections)
        .where(eq(fireSystemInspections.companyId, input.companyId))
        .orderBy(desc(fireSystemInspections.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // ── Buscar vistoria por ID com itens e logs ─────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [inspection] = await db
        .select()
        .from(fireSystemInspections)
        .where(eq(fireSystemInspections.id, input.id));
      if (!inspection) throw new Error("Vistoria não encontrada");

      const items = await db
        .select()
        .from(fireSystemItems)
        .where(eq(fireSystemItems.inspectionId, input.id))
        .orderBy(fireSystemItems.sectionCode, fireSystemItems.itemCode);

      const logs = await db
        .select()
        .from(fireSystemAuditLogs)
        .where(eq(fireSystemAuditLogs.inspectionId, input.id))
        .orderBy(desc(fireSystemAuditLogs.createdAt))
        .limit(100);

      // Agrupar itens por seção
      const sections: Record<string, typeof items> = {};
      for (const item of items) {
        if (!sections[item.sectionCode]) sections[item.sectionCode] = [];
        sections[item.sectionCode].push(item);
      }

      return { inspection, items, sections, logs };
    }),

  // ── Buscar laudo por slug ───────────────────────────────────────────────────
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [inspection] = await db
        .select()
        .from(fireSystemInspections)
        .where(eq(fireSystemInspections.reportSlug, input.slug));
      if (!inspection) throw new Error("Laudo não encontrado");

      const items = await db
        .select()
        .from(fireSystemItems)
        .where(eq(fireSystemItems.inspectionId, inspection.id))
        .orderBy(fireSystemItems.sectionCode, fireSystemItems.itemCode);

      return { inspection, items };
    }),

  // ── Atualizar item do checklist ─────────────────────────────────────────────
  updateItem: protectedProcedure
    .input(
      z.object({
        itemId: z.number(),
        inspectionId: z.number(),
        status: z.enum(["pending", "conforming", "non_conforming", "not_applicable", "critical"]),
        manualComment: z.string().optional(),
        shortComment: z.string().optional(),
        recommendedAction: z.string().optional(),
        measurementValueText: z.string().optional(),
        measurementValueNumeric: z.number().optional(),
        measurementUnit: z.string().optional(),
        photoUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const [prev] = await db
        .select()
        .from(fireSystemItems)
        .where(eq(fireSystemItems.id, input.itemId));

      const updateData: Partial<typeof fireSystemItems.$inferInsert> = {
        status: input.status,
        updatedAt: new Date(),
      };
      if (input.manualComment !== undefined) updateData.manualComment = input.manualComment;
      if (input.shortComment !== undefined) updateData.shortComment = input.shortComment;
      if (input.recommendedAction !== undefined) updateData.recommendedAction = input.recommendedAction;
      if (input.measurementValueText !== undefined) updateData.measurementValueText = input.measurementValueText;
      if (input.measurementValueNumeric !== undefined) updateData.measurementValueNumeric = String(input.measurementValueNumeric);
      if (input.measurementUnit !== undefined) updateData.measurementUnit = input.measurementUnit;
      if (input.photoUrls !== undefined) updateData.photoUrls = JSON.stringify(input.photoUrls);

      await db.update(fireSystemItems).set(updateData).where(eq(fireSystemItems.id, input.itemId));

      // Recalcular score total
      const allItems = await db
        .select()
        .from(fireSystemItems)
        .where(eq(fireSystemItems.inspectionId, input.inspectionId));

      const newScore = calculateScore(allItems.map((i) => ({ status: i.status, weight: i.weight, riskLevel: i.riskLevel })));
      const newRisk = scoreToRisk(newScore);

      await db
        .update(fireSystemInspections)
        .set({ scoreTotal: String(newScore), riskClassification: newRisk, updatedAt: new Date() })
        .where(eq(fireSystemInspections.id, input.inspectionId));

      await writeAuditLog(
        input.inspectionId,
        ctx.user.id,
        ctx.user.name ?? "Sistema",
        "item_updated",
        "item",
        String(input.itemId),
        { status: prev?.status },
        { status: input.status, score: newScore },
        `Item ${prev?.itemCode ?? input.itemId} atualizado: ${prev?.status} → ${input.status}`
      );

      return { score: newScore, riskClassification: newRisk };
    }),

  // ── Aprovar ou rejeitar vistoria ────────────────────────────────────────────
  updateApproval: protectedProcedure
    .input(
      z.object({
        inspectionId: z.number(),
        approvalStatus: z.enum(["approved", "rejected"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const [prev] = await db
        .select()
        .from(fireSystemInspections)
        .where(eq(fireSystemInspections.id, input.inspectionId));

      await db
        .update(fireSystemInspections)
        .set({
          approvalStatus: input.approvalStatus,
          status: input.approvalStatus === "approved" ? "approved" : "rejected",
          updatedAt: new Date(),
        })
        .where(eq(fireSystemInspections.id, input.inspectionId));

      await writeAuditLog(
        input.inspectionId,
        ctx.user.id,
        ctx.user.name ?? "Sistema",
        input.approvalStatus,
        "inspection",
        String(input.inspectionId),
        { approvalStatus: prev?.approvalStatus },
        { approvalStatus: input.approvalStatus },
        input.notes
      );

      return { success: true };
    }),

  // ── Finalizar vistoria ──────────────────────────────────────────────────────
  complete: protectedProcedure
    .input(z.object({ inspectionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const allItems = await db
        .select()
        .from(fireSystemItems)
        .where(eq(fireSystemItems.inspectionId, input.inspectionId));

      const score = calculateScore(allItems.map((i) => ({ status: i.status, weight: i.weight, riskLevel: i.riskLevel })));
      const risk = scoreToRisk(score);

      await db
        .update(fireSystemInspections)
        .set({ status: "completed", scoreTotal: String(score), riskClassification: risk, updatedAt: new Date() })
        .where(eq(fireSystemInspections.id, input.inspectionId));

      await writeAuditLog(
        input.inspectionId,
        ctx.user.id,
        ctx.user.name ?? "Sistema",
        "completed",
        "inspection",
        String(input.inspectionId),
        null,
        { score, risk },
        `Vistoria finalizada. Score: ${score}% | Risco: ${risk}`
      );

      return { score, riskClassification: risk };
    }),

  // ── Logs de auditoria ───────────────────────────────────────────────────────
  getAuditLogs: protectedProcedure
    .input(z.object({ inspectionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      return db
        .select()
        .from(fireSystemAuditLogs)
        .where(eq(fireSystemAuditLogs.inspectionId, input.inspectionId))
        .orderBy(desc(fireSystemAuditLogs.createdAt));
    }),

  // ── Estatísticas do módulo ──────────────────────────────────────────────────
  stats: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const all = await db
        .select()
        .from(fireSystemInspections)
        .where(eq(fireSystemInspections.companyId, input.companyId));

      const total = all.length;
      const completed = all.filter((i) => i.status === "completed" || i.status === "approved").length;
      const inProgress = all.filter((i) => i.status === "in_progress").length;
      const draft = all.filter((i) => i.status === "draft").length;
      const avgScore = total > 0
        ? Math.round(all.reduce((acc: number, i) => acc + parseFloat(i.scoreTotal ?? "0"), 0) / total * 100) / 100
        : 0;
      const critical = all.filter((i) => i.riskClassification === "R4" || i.riskClassification === "R5").length;

      return { total, completed, inProgress, draft, avgScore, critical };
    }),
});

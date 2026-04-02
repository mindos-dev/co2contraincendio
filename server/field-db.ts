/**
 * OPERIS Field DB — Helpers para vistorias de campo
 */
import { eq, desc, and, sql, type SQL } from "drizzle-orm";
import { getDb } from "./db";
import {
  fieldInspections,
  checklistAnswers,
  inspectionImages,
  fieldReports,
  type InsertFieldInspection,
  type InsertChecklistAnswer,
  type InsertInspectionImage,
  type InsertFieldReport,
} from "../drizzle/schema";

// ─── Field Inspections ────────────────────────────────────────────────────────

export async function createFieldInspection(data: InsertFieldInspection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(fieldInspections).values(data);
  return { id: Number((result as any).insertId ?? 0) };
}

export async function getFieldInspectionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(fieldInspections).where(eq(fieldInspections.id, id));
  return row ?? null;
}

export async function listFieldInspections(filters: {
  companyId?: number;
  status?: "rascunho" | "em_andamento" | "concluida" | "cancelada";
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: SQL[] = [];
  if (filters.companyId) conditions.push(eq(fieldInspections.companyId, filters.companyId));
  if (filters.status) conditions.push(eq(fieldInspections.status, filters.status));

  return db
    .select()
    .from(fieldInspections)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(fieldInspections.createdAt))
    .limit(filters.limit ?? 20)
    .offset(filters.offset ?? 0);
}

export async function updateFieldInspectionStatus(id: number, status: "rascunho" | "em_andamento" | "concluida" | "cancelada") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(fieldInspections).set({ status }).where(eq(fieldInspections.id, id));
}

// ─── Checklist Answers ────────────────────────────────────────────────────────

export async function saveChecklistAnswersBatch(inspectionId: number, answers: InsertChecklistAnswer[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Deletar respostas anteriores
  await db.delete(checklistAnswers).where(eq(checklistAnswers.inspectionId, inspectionId));
  if (answers.length > 0) {
    await db.insert(checklistAnswers).values(answers);
  }
  return { count: answers.length };
}

export async function getChecklistAnswers(inspectionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checklistAnswers).where(eq(checklistAnswers.inspectionId, inspectionId));
}

// ─── Inspection Images ────────────────────────────────────────────────────────

export async function createInspectionImage(data: InsertInspectionImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(inspectionImages).values(data);
  return { id: Number((result as any).insertId ?? 0) };
}

export async function getInspectionImages(inspectionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(inspectionImages)
    .where(eq(inspectionImages.inspectionId, inspectionId))
    .orderBy(desc(inspectionImages.createdAt));
}

// ─── Field Reports ────────────────────────────────────────────────────────────

export async function createFieldReport(data: InsertFieldReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(fieldReports).values(data);
  return { id: Number((result as any).insertId ?? 0) };
}

export async function updateFieldReport(id: number, data: Partial<InsertFieldReport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(fieldReports).set(data).where(eq(fieldReports.id, id));
}

export async function getFieldReport(filters: { reportId?: number; inspectionId?: number }) {
  const db = await getDb();
  if (!db) return null;
  const condition = filters.reportId
    ? eq(fieldReports.id, filters.reportId)
    : eq(fieldReports.inspectionId, filters.inspectionId!);

  const [row] = await db.select().from(fieldReports).where(condition).orderBy(desc(fieldReports.createdAt));
  return row ?? null;
}

export async function listFieldReports(filters: {
  companyId?: number;
  type?: "pmoc" | "incendio" | "eletrica" | "outros";
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: SQL[] = [];
  if (filters.companyId) conditions.push(eq(fieldReports.companyId, filters.companyId));
  if (filters.type) conditions.push(eq(fieldReports.type, filters.type));
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    conditions.push(sql`${fieldReports.createdAt} >= ${start}`);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(sql`${fieldReports.createdAt} <= ${end}`);
  }

  return db
    .select({
      report: fieldReports,
      inspection: fieldInspections,
    })
    .from(fieldReports)
    .leftJoin(fieldInspections, eq(fieldReports.inspectionId, fieldInspections.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(fieldReports.createdAt))
    .limit(filters.limit ?? 20)
    .offset(filters.offset ?? 0);
}

// ─── Offline Sync ─────────────────────────────────────────────────────────────

export async function syncOfflineInspection(data: {
  offlineId: string;
  type: "pmoc" | "incendio" | "eletrica" | "outros";
  title: string;
  location?: string;
  notes?: string;
  companyId?: number;
  technicianId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se já foi sincronizado
  const existing = await db.select().from(fieldInspections).where(eq(fieldInspections.offlineId, data.offlineId));

  if (existing.length > 0) {
    return { id: existing[0].id, alreadySynced: true };
  }

  const [result] = await db.insert(fieldInspections).values({
    offlineId: data.offlineId,
    type: data.type,
    title: data.title,
    location: data.location ?? null,
    notes: data.notes ?? null,
    companyId: data.companyId ?? null,
    technicianId: data.technicianId ?? null,
    status: "em_andamento",
    syncedAt: new Date(),
  });

  return { id: Number((result as any).insertId ?? 0), alreadySynced: false };
}

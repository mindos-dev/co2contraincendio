/**
 * ART OPERIS — Database Helpers
 * Funções de acesso ao banco para o módulo de Responsabilidade Técnica Digital.
 */
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  artServices,
  artEvidences,
  artApprovals,
  type ArtService,
  type ArtEvidence,
  type InsertArtService,
  type InsertArtEvidence,
  type InsertArtApproval,
} from "../drizzle/schema";

// ─── ART Services ─────────────────────────────────────────────────────────────

export async function createArtService(data: InsertArtService): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(artServices).values(data);
  return { id: (result as { insertId: number }).insertId };
}

export async function getArtServiceById(id: number): Promise<ArtService | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(artServices).where(eq(artServices.id, id));
  return row ?? null;
}

export async function getArtServicesByCompany(
  companyId: number,
  options?: { cursor?: number; limit?: number; status?: string }
): Promise<{ items: ArtService[]; nextCursor: number | null }> {
  const db = await getDb();
  if (!db) return { items: [], nextCursor: null };
  const limit = options?.limit ?? 50;
  const conditions = [eq(artServices.companyId, companyId)];
  if (options?.status) {
    conditions.push(eq(artServices.status, options.status as ArtService["status"]));
  }
  if (options?.cursor) {
    conditions.push(sql`${artServices.id} < ${options.cursor}`);
  }
  const items = await db
    .select()
    .from(artServices)
    .where(and(...conditions))
    .orderBy(desc(artServices.id))
    .limit(limit + 1);
  const hasMore = items.length > limit;
  const nextCursor = hasMore ? items[limit - 1].id : null;
  return { items: items.slice(0, limit), nextCursor };
}

export async function getArtServicesByTechnician(
  technicianId: number,
  options?: { cursor?: number; limit?: number }
): Promise<{ items: ArtService[]; nextCursor: number | null }> {
  const db = await getDb();
  if (!db) return { items: [], nextCursor: null };
  const limit = options?.limit ?? 50;
  const conditions = [eq(artServices.technicianId, technicianId)];
  if (options?.cursor) {
    conditions.push(sql`${artServices.id} < ${options.cursor}`);
  }
  const items = await db
    .select()
    .from(artServices)
    .where(and(...conditions))
    .orderBy(desc(artServices.id))
    .limit(limit + 1);
  const hasMore = items.length > limit;
  const nextCursor = hasMore ? items[limit - 1].id : null;
  return { items: items.slice(0, limit), nextCursor };
}

export async function getPendingApprovalArts(companyId: number): Promise<ArtService[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(artServices)
    .where(and(eq(artServices.companyId, companyId), eq(artServices.status, "aguardando_aprovacao")))
    .orderBy(desc(artServices.createdAt))
    .limit(100);
}

/** Admin global: todas as ARTs aguardando aprovação (todas as empresas) */
export async function getAllPendingApprovalArts(): Promise<ArtService[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(artServices)
    .where(eq(artServices.status, "aguardando_aprovacao"))
    .orderBy(desc(artServices.createdAt))
    .limit(200);
}

/** Gera próximo número sequencial ART-YYYY-NNNN */
export async function generateArtNumber(year: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const prefix = `ART-${year}-`;
  const [row] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(artServices)
    .where(sql`${artServices.artNumber} LIKE ${prefix + "%"}`);
  const next = (Number(row?.count ?? 0) + 1).toString().padStart(4, "0");
  return `${prefix}${next}`;
}

export async function updateArtService(
  id: number,
  data: Partial<Pick<ArtService,
    | "status"
    | "engineerId"
    | "technicianDeclaration"
    | "technicianSignatureTs"
    | "submissionHash"
    | "serverTimestamp"
    | "geoLatitude"
    | "geoLongitude"
    | "rejectionReason"
    | "approvedAt"
    | "pdfUrl"
    | "pdfGeneratedAt"
    | "paymentStatus"
    | "stripePaymentIntentId"
    | "paidAt"
    | "updatedAt"
    | "artNumber"
  >>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(artServices).set(data).where(eq(artServices.id, id));
}

// ─── ART Evidences ────────────────────────────────────────────────────────────

export async function createArtEvidence(data: InsertArtEvidence): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(artEvidences).values(data);
  return { id: (result as { insertId: number }).insertId };
}

export async function getEvidencesByArtService(artServiceId: number): Promise<ArtEvidence[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(artEvidences)
    .where(eq(artEvidences.artServiceId, artServiceId))
    .orderBy(desc(artEvidences.createdAt));
}

export async function lockEvidence(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(artEvidences).set({
    isLocked: true,
    lockedAt: new Date(),
  }).where(eq(artEvidences.id, id));
}

export async function updateEvidenceOcr(
  id: number,
  ocrData: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(artEvidences).set({
    ocrExtractedData: ocrData,
    ocrProcessedAt: new Date(),
  }).where(eq(artEvidences.id, id));
}

// ─── ART Approvals ────────────────────────────────────────────────────────────

export async function createArtApproval(data: InsertArtApproval): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(artApprovals).values(data);
  return { id: (result as { insertId: number }).insertId };
}

export async function getApprovalsByArtService(artServiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(artApprovals)
    .where(eq(artApprovals.artServiceId, artServiceId))
    .orderBy(desc(artApprovals.reviewedAt));
}

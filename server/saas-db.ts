import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  accessLogs,
  alertEvents,
  documents,
  equipment,
  maintenanceRecords,
  notificationSettings,
  saasCompanies,
  saasUsers,
  subscriptions,
  type InsertAccessLog,
  type InsertAlertEvent,
  type InsertDocument,
  type InsertEquipment,
  type InsertMaintenanceRecord,
  type InsertNotificationSettings,
  type InsertSaasCompany,
  type InsertSaasUser,
  type InsertSubscription,
} from "../drizzle/schema";

// ─── Companies ───────────────────────────────────────────────────────────────

export async function getAllCompanies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(saasCompanies).orderBy(desc(saasCompanies.createdAt));
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(saasCompanies).where(eq(saasCompanies.id, id));
  return rows[0] ?? null;
}

export async function createCompany(data: InsertSaasCompany) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(saasCompanies).values(data);
}

export async function updateCompany(id: number, data: Partial<InsertSaasCompany>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.update(saasCompanies).set(data).where(eq(saasCompanies.id, id));
}

// ─── SaaS Users ──────────────────────────────────────────────────────────────

export async function getSaasUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(saasUsers).where(eq(saasUsers.email, email));
  return rows[0] ?? null;
}

export async function getSaasUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(saasUsers).where(eq(saasUsers.id, id));
  return rows[0] ?? null;
}

export async function createSaasUser(data: InsertSaasUser) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(saasUsers).values(data);
}

export async function getUsersByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(saasUsers).where(eq(saasUsers.companyId, companyId));
}

export async function getAllSaasUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(saasUsers).orderBy(desc(saasUsers.createdAt));
}

// ─── Equipment ───────────────────────────────────────────────────────────────

export async function getEquipmentFiltered(params: {
  companyId?: number;
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const { companyId, search, category, status, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [];
  if (companyId) conditions.push(eq(equipment.companyId, companyId));
  if (category) conditions.push(eq(equipment.category, category as "extintor" | "hidrante" | "sprinkler" | "detector" | "sinalizacao" | "complementar"));
  if (status) conditions.push(eq(equipment.status, status as "ok" | "proximo_vencimento" | "vencido" | "inativo"));
  if (search) {
    conditions.push(
      or(
        like(equipment.code, `%${search}%`),
        like(equipment.installationLocation, `%${search}%`),
        like(equipment.agentType, `%${search}%`),
        like(equipment.manufacturer, `%${search}%`),
        like(equipment.sector, `%${search}%`),
        like(equipment.serialNumber, `%${search}%`)
      ) as ReturnType<typeof eq>
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db.select().from(equipment).where(where).orderBy(desc(equipment.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(equipment).where(where),
  ]);

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getEquipmentByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(equipment).where(eq(equipment.code, code));
  return rows[0] ?? null;
}

export async function getEquipmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(equipment).where(eq(equipment.id, id));
  return rows[0] ?? null;
}

export async function createEquipment(data: InsertEquipment) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(equipment).values(data);
}

export async function updateEquipment(id: number, data: Partial<InsertEquipment>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.update(equipment).set(data).where(eq(equipment.id, id));
}

export async function deleteEquipment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.delete(equipment).where(eq(equipment.id, id));
}

export async function getAllEquipmentForExport(companyId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = companyId ? eq(equipment.companyId, companyId) : undefined;
  return db.select().from(equipment).where(where).orderBy(equipment.code);
}

export async function getExpiringEquipment(daysAhead: number, companyId?: number) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  const future = new Date();
  future.setDate(future.getDate() + daysAhead);
  const todayStr = today.toISOString().split("T")[0];
  const futureStr = future.toISOString().split("T")[0];
  const conditions = [
    sql`${equipment.nextMaintenanceDate} >= ${todayStr}`,
    sql`${equipment.nextMaintenanceDate} <= ${futureStr}`,
  ];
  if (companyId) conditions.push(eq(equipment.companyId, companyId) as ReturnType<typeof eq>);
  return db.select().from(equipment).where(and(...conditions)).orderBy(equipment.nextMaintenanceDate);
}

export async function getExpiredEquipment(companyId?: number) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date().toISOString().split("T")[0];
  const conditions = [
    sql`${equipment.nextMaintenanceDate} < ${today}`,
  ];
  if (companyId) conditions.push(eq(equipment.companyId, companyId) as ReturnType<typeof eq>);
  return db.select().from(equipment).where(and(...conditions)).orderBy(equipment.nextMaintenanceDate);
}

// ─── Maintenance Records ─────────────────────────────────────────────────────

export async function getMaintenanceByEquipment(equipmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(maintenanceRecords).where(eq(maintenanceRecords.equipmentId, equipmentId)).orderBy(desc(maintenanceRecords.serviceDate));
}

export async function createMaintenance(data: InsertMaintenanceRecord) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(maintenanceRecords).values(data);
}

export async function getAllMaintenance(companyId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (companyId) {
    return db
      .select({ mr: maintenanceRecords, equip: equipment })
      .from(maintenanceRecords)
      .innerJoin(equipment, eq(maintenanceRecords.equipmentId, equipment.id))
      .where(eq(equipment.companyId, companyId))
      .orderBy(desc(maintenanceRecords.serviceDate));
  }
  return db.select().from(maintenanceRecords).orderBy(desc(maintenanceRecords.serviceDate));
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(documents).values(data);
}

export async function getDocumentsByEquipment(equipmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.equipmentId, equipmentId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.companyId, companyId)).orderBy(desc(documents.createdAt));
}

export async function updateDocumentStatus(id: number, status: "pending" | "processed" | "error", extractedData?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.update(documents).set({ processingStatus: status, extractedData }).where(eq(documents.id, id));
}

// ─── Access Logs ─────────────────────────────────────────────────────────────

export async function createAccessLog(data: InsertAccessLog) {
  const db = await getDb();
  if (!db) return;
  return db.insert(accessLogs).values(data);
}

export async function getAccessLogs(equipmentId?: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const where = equipmentId ? eq(accessLogs.equipmentId, equipmentId) : undefined;
  return db.select().from(accessLogs).where(where).orderBy(desc(accessLogs.createdAt)).limit(limit);
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export async function getSubscriptionByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.companyId, companyId)).orderBy(desc(subscriptions.createdAt));
  return rows[0] ?? null;
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(subscriptions).values(data);
}

// ─── Alert Events ────────────────────────────────────────────────────────────

export async function createAlertEvent(data: InsertAlertEvent) {
  const db = await getDb();
  if (!db) return;
  return db.insert(alertEvents).values(data);
}

export async function getAlertEvents(companyId?: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  const where = companyId ? eq(alertEvents.companyId, companyId) : undefined;
  return db.select().from(alertEvents).where(where).orderBy(desc(alertEvents.sentAt)).limit(limit);
}

export async function acknowledgeAlert(id: number) {
  const db = await getDb();
  if (!db) return;
  return db.update(alertEvents).set({ acknowledged: true }).where(eq(alertEvents.id, id));
}

// ─── Notification Settings ───────────────────────────────────────────────────

export async function getNotificationSettingsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(notificationSettings).where(eq(notificationSettings.companyId, companyId));
  return rows[0] ?? null;
}

export async function upsertNotificationSettings(data: Omit<InsertNotificationSettings, "id" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getNotificationSettingsByCompany(data.companyId);
  if (existing) {
    return db.update(notificationSettings).set(data).where(eq(notificationSettings.companyId, data.companyId));
  } else {
    return db.insert(notificationSettings).values(data);
  }
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getDashboardStats(companyId?: number) {
  const db = await getDb();
  if (!db) return null;

  const where = companyId ? eq(equipment.companyId, companyId) : undefined;
  const today = new Date().toISOString().split("T")[0];
  const in30days = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const [total, expired, expiring, byCategory] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(equipment).where(where),
    db.select({ count: sql<number>`count(*)` }).from(equipment).where(
      where ? and(where, sql`${equipment.nextMaintenanceDate} < ${today}`) : sql`${equipment.nextMaintenanceDate} < ${today}`
    ),
    db.select({ count: sql<number>`count(*)` }).from(equipment).where(
      where
        ? and(where, sql`${equipment.nextMaintenanceDate} >= ${today}`, sql`${equipment.nextMaintenanceDate} <= ${in30days}`)
        : and(sql`${equipment.nextMaintenanceDate} >= ${today}`, sql`${equipment.nextMaintenanceDate} <= ${in30days}`)
    ),
    db.select({ category: equipment.category, count: sql<number>`count(*)` })
      .from(equipment)
      .where(where)
      .groupBy(equipment.category),
  ]);

  return {
    total: Number(total[0]?.count ?? 0),
    expired: Number(expired[0]?.count ?? 0),
    expiring: Number(expiring[0]?.count ?? 0),
    ok: Number(total[0]?.count ?? 0) - Number(expired[0]?.count ?? 0) - Number(expiring[0]?.count ?? 0),
    byCategory: byCategory.map(r => ({ category: r.category, count: Number(r.count) })),
  };
}

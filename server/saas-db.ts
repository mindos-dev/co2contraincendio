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
  workOrders,
  checklistTemplates,
  checklistItems,
  checklistExecutions,
  type InsertWorkOrder,
  cookieConsents,
  lgpdRequests,
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

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function getUsageReport() {
  const db = await getDb();
  if (!db) return null;

  const today = new Date().toISOString().split("T")[0];
  const in30days = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  const in90days = new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0];

  const [
    totalCompanies, activeCompanies,
    totalEquipment, expiredEquipment, expiringEquipment,
    totalMaintenance, totalDocuments, totalAlerts, unacknowledgedAlerts,
    equipmentByCategory, equipmentByStatus, maintenanceByType,
    recentAlerts, companiesWithEquipment,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(saasCompanies),
    db.select({ count: sql<number>`count(*)` }).from(saasCompanies).where(eq(saasCompanies.active, true)),
    db.select({ count: sql<number>`count(*)` }).from(equipment),
    db.select({ count: sql<number>`count(*)` }).from(equipment).where(sql`${equipment.nextMaintenanceDate} < ${today}`),
    db.select({ count: sql<number>`count(*)` }).from(equipment).where(
      and(sql`${equipment.nextMaintenanceDate} >= ${today}`, sql`${equipment.nextMaintenanceDate} <= ${in30days}`)
    ),
    db.select({ count: sql<number>`count(*)` }).from(maintenanceRecords),
    db.select({ count: sql<number>`count(*)` }).from(documents),
    db.select({ count: sql<number>`count(*)` }).from(alertEvents),
    db.select({ count: sql<number>`count(*)` }).from(alertEvents).where(eq(alertEvents.acknowledged, false)),
    db.select({ category: equipment.category, count: sql<number>`count(*)` }).from(equipment).groupBy(equipment.category),
    db.select({ status: equipment.status, count: sql<number>`count(*)` }).from(equipment).groupBy(equipment.status),
    db.select({ serviceType: maintenanceRecords.serviceType, count: sql<number>`count(*)` }).from(maintenanceRecords).groupBy(maintenanceRecords.serviceType),
    db.select().from(alertEvents).orderBy(desc(alertEvents.sentAt)).limit(10),
    db.select({
      companyId: equipment.companyId,
      total: sql<number>`count(*)`,
      expired: sql<number>`sum(case when ${equipment.nextMaintenanceDate} < ${today} then 1 else 0 end)`,
      expiring: sql<number>`sum(case when ${equipment.nextMaintenanceDate} >= ${today} and ${equipment.nextMaintenanceDate} <= ${in90days} then 1 else 0 end)`,
    }).from(equipment).groupBy(equipment.companyId),
  ]);

  return {
    summary: {
      totalCompanies: Number(totalCompanies[0]?.count ?? 0),
      activeCompanies: Number(activeCompanies[0]?.count ?? 0),
      totalEquipment: Number(totalEquipment[0]?.count ?? 0),
      expiredEquipment: Number(expiredEquipment[0]?.count ?? 0),
      expiringEquipment: Number(expiringEquipment[0]?.count ?? 0),
      okEquipment: Number(totalEquipment[0]?.count ?? 0) - Number(expiredEquipment[0]?.count ?? 0) - Number(expiringEquipment[0]?.count ?? 0),
      totalMaintenance: Number(totalMaintenance[0]?.count ?? 0),
      totalDocuments: Number(totalDocuments[0]?.count ?? 0),
      totalAlerts: Number(totalAlerts[0]?.count ?? 0),
      unacknowledgedAlerts: Number(unacknowledgedAlerts[0]?.count ?? 0),
    },
    equipmentByCategory: equipmentByCategory.map(r => ({ category: r.category ?? "N/A", count: Number(r.count) })),
    equipmentByStatus: equipmentByStatus.map(r => ({ status: r.status ?? "N/A", count: Number(r.count) })),
    maintenanceByType: maintenanceByType.map(r => ({ type: r.serviceType ?? "N/A", count: Number(r.count) })),
    recentAlerts,
    companiesWithEquipment: companiesWithEquipment.map(r => ({
      companyId: r.companyId,
      total: Number(r.total ?? 0),
      expired: Number(r.expired ?? 0),
      expiring: Number(r.expiring ?? 0),
    })),
    generatedAt: new Date().toISOString(),
  };
}

export async function getCompanyReport(companyId: number) {
  const db = await getDb();
  if (!db) return null;

  const today = new Date().toISOString().split("T")[0];
  const in30days = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const [company, allEquipment, allMaintenance, allAlerts, allDocs, subscription] = await Promise.all([
    db.select().from(saasCompanies).where(eq(saasCompanies.id, companyId)).limit(1),
    db.select().from(equipment).where(eq(equipment.companyId, companyId)).orderBy(equipment.code),
    db.select().from(maintenanceRecords)
      .innerJoin(equipment, eq(maintenanceRecords.equipmentId, equipment.id))
      .where(eq(equipment.companyId, companyId))
      .orderBy(desc(maintenanceRecords.serviceDate)).limit(50),
    db.select().from(alertEvents).where(eq(alertEvents.companyId, companyId)).orderBy(desc(alertEvents.sentAt)).limit(20),
    db.select().from(documents).where(eq(documents.companyId, companyId)).orderBy(desc(documents.createdAt)).limit(20),
    db.select().from(subscriptions).where(eq(subscriptions.companyId, companyId)).limit(1),
  ]);

  const expired = allEquipment.filter(e => e.nextMaintenanceDate && e.nextMaintenanceDate.toISOString().split("T")[0] < today);
  const expiring = allEquipment.filter(e => {
    const d = e.nextMaintenanceDate?.toISOString().split("T")[0];
    return d && d >= today && d <= in30days;
  });

  return {
    company: company[0] ?? null,
    subscription: subscription[0] ?? null,
    equipment: {
      all: allEquipment,
      total: allEquipment.length,
      expired: expired.length,
      expiring: expiring.length,
      ok: allEquipment.length - expired.length - expiring.length,
      byCategory: allEquipment.reduce((acc, e) => {
        const cat = e.category ?? "N/A";
        acc[cat] = (acc[cat] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
    recentMaintenance: allMaintenance,
    recentAlerts: allAlerts,
    recentDocuments: allDocs,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Import Companies from CSV ───────────────────────────────────────────────

export async function importCompaniesFromCsv(rows: Array<{
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const results: Array<{ name: string; status: "created" | "skipped"; id?: number }> = [];

  for (const row of rows) {
    if (!row.name?.trim()) {
      results.push({ name: row.name ?? "(vazio)", status: "skipped" });
      continue;
    }
    try {
      const existing = await db.select({ id: saasCompanies.id })
        .from(saasCompanies).where(eq(saasCompanies.name, row.name.trim())).limit(1);

      if (existing.length > 0) {
        results.push({ name: row.name, status: "skipped", id: existing[0].id });
        continue;
      }

      const inserted = await db.insert(saasCompanies).values({
        name: row.name.trim(),
        cnpj: row.cnpj?.trim() ?? null,
        email: row.email?.trim() ?? null,
        phone: row.phone?.trim() ?? null,
        address: row.address?.trim() ?? null,
        type: (row.type?.trim() as "shopping" | "industria" | "comercio" | "residencial" | "outro") ?? "comercio",
        active: true,
      });
      results.push({ name: row.name, status: "created", id: Number((inserted as { insertId?: number }).insertId ?? 0) });
    } catch {
      results.push({ name: row.name, status: "skipped" });
    }
  }

  return results;
}

// ─── User Management Helpers ─────────────────────────────────────────────────
export async function updateSaasUserRole(id: number, role: "superadmin" | "admin" | "tecnico" | "cliente") {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(saasUsers).set({ role }).where(eq(saasUsers.id, id));
  return { success: true };
}

export async function toggleSaasUserActive(id: number, active: boolean) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(saasUsers).set({ active }).where(eq(saasUsers.id, id));
  return { success: true };
}

// ─── Password Reset Helpers ───────────────────────────────────────────────────
export async function getSaasUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(saasUsers).where(eq(saasUsers.resetToken, token));
  return rows[0] ?? null;
}

export async function setResetToken(userId: number, token: string, expiry: Date) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(saasUsers).set({ resetToken: token, resetTokenExpiry: expiry }).where(eq(saasUsers.id, userId));
  return { success: true };
}

export async function clearResetToken(userId: number, newPasswordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(saasUsers).set({ resetToken: null, resetTokenExpiry: null, passwordHash: newPasswordHash }).where(eq(saasUsers.id, userId));
  return { success: true };
}

// ─── Work Orders (OS) ─────────────────────────────────────────────────────────

export async function getWorkOrders(companyId?: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (companyId) conditions.push(eq(workOrders.companyId, companyId));
  if (status) conditions.push(eq(workOrders.status, status as "aberta" | "em_andamento" | "aguardando_peca" | "concluida" | "cancelada"));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(workOrders).where(where).orderBy(desc(workOrders.createdAt));
}

export async function getWorkOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(workOrders).where(eq(workOrders.id, id));
  return rows[0] ?? null;
}

export async function createWorkOrder(data: InsertWorkOrder) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(workOrders).values(data);
  return result;
}

export async function updateWorkOrder(id: number, data: Partial<InsertWorkOrder>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.update(workOrders).set(data).where(eq(workOrders.id, id));
}

export async function deleteWorkOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.delete(workOrders).where(eq(workOrders.id, id));
}

// ─── Checklist ────────────────────────────────────────────────────────────────

export async function getChecklistTemplates(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checklistTemplates)
    .where(and(eq(checklistTemplates.companyId, companyId), eq(checklistTemplates.isActive, true)))
    .orderBy(checklistTemplates.name);
}

export async function getChecklistItems(templateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checklistItems)
    .where(eq(checklistItems.templateId, templateId))
    .orderBy(checklistItems.order);
}

export async function createChecklistExecution(data: {
  workOrderId?: number;
  templateId: number;
  companyId: number;
  equipmentId?: number;
  executedById?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(checklistExecutions).values({ ...data, status: "em_andamento" });
  return result;
}

export async function updateChecklistExecution(id: number, data: { responses?: unknown; score?: number; status?: "em_andamento" | "concluido" | "cancelado"; completedAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.update(checklistExecutions).set(data as Record<string, unknown>).where(eq(checklistExecutions.id, id));
}

export async function getChecklistExecutions(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checklistExecutions)
    .where(eq(checklistExecutions.companyId, companyId))
    .orderBy(desc(checklistExecutions.createdAt));
}

// ─── LGPD: Cookie Consent ─────────────────────────────────────────────────────

export async function saveCookieConsent(data: {
  userId?: number;
  sessionId?: string;
  consentType: "all" | "custom" | "essential_only";
  essential: boolean;
  performance: boolean;
  analytics: boolean;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(cookieConsents).values(data);
}

// ─── LGPD: Data Requests ──────────────────────────────────────────────────────

export async function createLgpdRequest(data: {
  userId: number;
  type: "export" | "delete" | "correction" | "access" | "portability";
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(lgpdRequests).values({ ...data, status: "pending" });
}

export async function getLgpdRequestsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lgpdRequests)
    .where(eq(lgpdRequests.userId, userId))
    .orderBy(desc(lgpdRequests.createdAt));
}

export async function exportUserData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const rows = await db.select().from(saasUsers).where(eq(saasUsers.id, userId));
  const user = rows[0];
  if (!user) return null;
  const userEquipment = user.companyId
    ? await db.select().from(equipment).where(eq(equipment.companyId, user.companyId))
    : [];
  const userMaintenance = user.companyId
    ? await db.select({ mr: maintenanceRecords }).from(maintenanceRecords)
        .innerJoin(equipment, eq(maintenanceRecords.equipmentId, equipment.id))
        .where(eq(equipment.companyId, user.companyId))
    : [];
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    equipment: userEquipment.map(e => ({ id: e.id, code: e.code, category: e.category, installationLocation: e.installationLocation })),
    maintenanceCount: userMaintenance.length,
    exportedAt: new Date().toISOString(),
  };
}


import { boolean, date, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// ─── Core Auth ───────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Orçamentos (site público) ───────────────────────────────────────────────

export const orcamentos = mysqlTable("orcamentos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 120 }).notNull(),
  telefone: varchar("telefone", { length: 30 }).notNull(),
  email: varchar("email", { length: 320 }),
  empresa: varchar("empresa", { length: 160 }),
  servico: varchar("servico", { length: 80 }).notNull().default("sistema-saponificante"),
  mensagem: text("mensagem"),
  status: mysqlEnum("status", ["novo", "em_andamento", "respondido"]).default("novo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Orcamento = typeof orcamentos.$inferSelect;
export type InsertOrcamento = typeof orcamentos.$inferInsert;

// ─── SaaS: Empresas clientes ─────────────────────────────────────────────────

export const saasCompanies = mysqlTable("saas_companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  type: mysqlEnum("type", ["shopping", "industria", "comercio", "residencial", "outro"]).default("comercio").notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SaasCompany = typeof saasCompanies.$inferSelect;
export type InsertSaasCompany = typeof saasCompanies.$inferInsert;

// ─── SaaS: Usuários da plataforma ────────────────────────────────────────────

export const saasUsers = mysqlTable("saas_users", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["superadmin", "admin", "tecnico", "cliente"]).default("cliente").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SaasUser = typeof saasUsers.$inferSelect;
export type InsertSaasUser = typeof saasUsers.$inferInsert;

// ─── SaaS: Equipamentos ──────────────────────────────────────────────────────

export const equipment = mysqlTable("equipment", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id),
  code: varchar("code", { length: 50 }).notNull().unique(),
  // Categoria NBR
  category: mysqlEnum("category", ["extintor", "hidrante", "sprinkler", "detector", "sinalizacao", "complementar"]).default("extintor").notNull(),
  subType: varchar("subType", { length: 80 }),
  // Identificação
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  serialNumber: varchar("serialNumber", { length: 80 }),
  // Localização
  installationLocation: varchar("installationLocation", { length: 200 }),
  floor: varchar("floor", { length: 30 }),
  sector: varchar("sector", { length: 100 }),
  // Dados técnicos
  agentType: varchar("agentType", { length: 80 }),
  capacity: varchar("capacity", { length: 30 }),
  pressure: varchar("pressure", { length: 30 }),
  riskClass: varchar("riskClass", { length: 30 }),
  // Campos específicos por categoria
  flowRate: varchar("flowRate", { length: 30 }),
  activationTemp: varchar("activationTemp", { length: 30 }),
  coverageArea: varchar("coverageArea", { length: 30 }),
  detectorType: varchar("detectorType", { length: 80 }),
  sensitivity: varchar("sensitivity", { length: 30 }),
  signageType: varchar("signageType", { length: 80 }),
  signageDimensions: varchar("signageDimensions", { length: 50 }),
  // Status e datas
  status: mysqlEnum("status", ["ok", "proximo_vencimento", "vencido", "inativo"]).default("ok").notNull(),
  installationDate: date("installationDate"),
  lastMaintenanceDate: date("lastMaintenanceDate"),
  nextMaintenanceDate: date("nextMaintenanceDate"),
  // QR Code
  qrCodeUrl: text("qrCodeUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;

// ─── SaaS: Registros de manutenção ───────────────────────────────────────────

export const maintenanceRecords = mysqlTable("maintenance_records", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipmentId").references(() => equipment.id).notNull(),
  serviceDate: date("serviceDate").notNull(),
  serviceType: mysqlEnum("serviceType", ["recarga", "inspecao", "substituicao", "instalacao", "teste", "outro"]).notNull(),
  description: text("description"),
  agentType: varchar("agentType", { length: 80 }),
  capacity: varchar("capacity", { length: 30 }),
  pressure: varchar("pressure", { length: 30 }),
  quantity: int("quantity").default(1),
  technicianName: varchar("technicianName", { length: 200 }),
  engineerName: varchar("engineerName", { length: 200 }),
  crea: varchar("crea", { length: 30 }),
  rnp: varchar("rnp", { length: 30 }),
  nextMaintenanceDate: date("nextMaintenanceDate"),
  invoiceNumber: varchar("invoiceNumber", { length: 80 }),
  serviceOrderNumber: varchar("serviceOrderNumber", { length: 80 }),
  reportNumber: varchar("reportNumber", { length: 80 }),
  fileUrl: text("fileUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = typeof maintenanceRecords.$inferInsert;

// ─── SaaS: Documentos ────────────────────────────────────────────────────────

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  maintenanceId: int("maintenanceId").references(() => maintenanceRecords.id),
  equipmentId: int("equipmentId").references(() => equipment.id),
  companyId: int("companyId").references(() => saasCompanies.id),
  type: mysqlEnum("type", ["nota_fiscal", "ordem_servico", "relatorio", "laudo", "art", "outro"]).notNull(),
  documentNumber: varchar("documentNumber", { length: 80 }),
  fileUrl: text("fileUrl"),
  fileName: varchar("fileName", { length: 255 }),
  // Dados extraídos via LLM
  extractedData: text("extractedData"), // JSON string
  processingStatus: mysqlEnum("processingStatus", ["pending", "processed", "error"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ─── SaaS: Logs de acesso (QR Code scan) ─────────────────────────────────────

export const accessLogs = mysqlTable("access_logs", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipmentId").references(() => equipment.id).notNull(),
  equipmentCode: varchar("equipmentCode", { length: 50 }),
  storeName: varchar("storeName", { length: 200 }),
  storeNumber: varchar("storeNumber", { length: 30 }),
  shoppingName: varchar("shoppingName", { length: 200 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AccessLog = typeof accessLogs.$inferSelect;
export type InsertAccessLog = typeof accessLogs.$inferInsert;

// ─── SaaS: Assinaturas ───────────────────────────────────────────────────────

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  plan: mysqlEnum("plan", ["basico", "profissional", "enterprise"]).default("basico").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["ativo", "suspenso", "cancelado", "trial"]).default("trial").notNull(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─── SaaS: Eventos de alertas (scheduler) ────────────────────────────────────

export const alertEvents = mysqlTable("alert_events", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipmentId").references(() => equipment.id).notNull(),
  companyId: int("companyId").references(() => saasCompanies.id),
  alertType: mysqlEnum("alertType", ["proximo_vencimento", "vencido", "sem_manutencao"]).notNull(),
  message: text("message"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  acknowledged: boolean("acknowledged").default(false).notNull(),
});
export type AlertEvent = typeof alertEvents.$inferSelect;
export type InsertAlertEvent = typeof alertEvents.$inferInsert;

// ─── Configurações de Notificação ─────────────────────────────────────────────
export const notificationSettings = mysqlTable("notification_settings", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  emailEnabled: boolean("emailEnabled").default(false).notNull(),
  whatsappEnabled: boolean("whatsappEnabled").default(false).notNull(),
  emailRecipients: text("emailRecipients"),    // JSON array de e-mails
  whatsappNumbers: text("whatsappNumbers"),    // JSON array de números
  daysBeforeAlert: int("daysBeforeAlert").default(30).notNull(), // dias antes do vencimento
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;

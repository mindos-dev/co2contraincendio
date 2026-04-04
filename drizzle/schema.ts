import { boolean, date, decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  // Perfil profissional
  cargo: varchar("cargo", { length: 100 }),
  crea: varchar("crea", { length: 30 }),
  telefone: varchar("telefone", { length: 30 }),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
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
  signageColor: varchar("signageColor", { length: 50 }),
  // Identificação patrimonial e normativa (ABNT NBR / NFPA 25)
  patrimonyTag: varchar("patrimonyTag", { length: 80 }),
  normReference: varchar("normReference", { length: 120 }),
  certificationUL: varchar("certificationUL", { length: 80 }),
  weightKg: varchar("weightKg", { length: 30 }),
  workingPressureBar: varchar("workingPressureBar", { length: 30 }),
  testPressureBar: varchar("testPressureBar", { length: 30 }),
  description: text("description"),
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

// ─── Módulo Mobile: Vistorias de Campo ───────────────────────────────────────

export const fieldInspections = mysqlTable("field_inspections", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id),
  technicianId: int("technicianId").references(() => saasUsers.id),
  type: mysqlEnum("type", ["pmoc", "incendio", "eletrica", "outros"]).notNull(),
  status: mysqlEnum("status", ["rascunho", "em_andamento", "concluida", "cancelada"]).default("rascunho").notNull(),
  title: varchar("title", { length: 200 }),
  notes: text("notes"),
  location: varchar("location", { length: 300 }),
  // Sync offline
  offlineId: varchar("offlineId", { length: 64 }), // UUID gerado no cliente
  syncedAt: timestamp("syncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FieldInspection = typeof fieldInspections.$inferSelect;
export type InsertFieldInspection = typeof fieldInspections.$inferInsert;

// ─── Módulo Mobile: Respostas do Checklist ────────────────────────────────────

export const checklistAnswers = mysqlTable("checklist_answers", {
  id: int("id").autoincrement().primaryKey(),
  inspectionId: int("inspectionId").references(() => fieldInspections.id).notNull(),
  questionKey: varchar("questionKey", { length: 100 }).notNull(), // ex: "extintor_carga"
  questionText: text("questionText").notNull(),
  answer: mysqlEnum("answer", ["conforme", "nao_conforme", "nao_aplicavel", "pendente"]).default("pendente").notNull(),
  observation: text("observation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ChecklistAnswer = typeof checklistAnswers.$inferSelect;
export type InsertChecklistAnswer = typeof checklistAnswers.$inferInsert;

// ─── Módulo Mobile: Imagens da Vistoria ──────────────────────────────────────

export const inspectionImages = mysqlTable("inspection_images", {
  id: int("id").autoincrement().primaryKey(),
  inspectionId: int("inspectionId").references(() => fieldInspections.id).notNull(),
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 300 }).notNull(),
  caption: varchar("caption", { length: 200 }),
  mimeType: varchar("mimeType", { length: 50 }).default("image/jpeg"),
  sizeBytes: int("sizeBytes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InspectionImage = typeof inspectionImages.$inferSelect;
export type InsertInspectionImage = typeof inspectionImages.$inferInsert;

// ─── Módulo Mobile: Laudos de Campo ──────────────────────────────────────────

export const fieldReports = mysqlTable("field_reports", {
  id: int("id").autoincrement().primaryKey(),
  inspectionId: int("inspectionId").references(() => fieldInspections.id).notNull(),
  companyId: int("companyId").references(() => saasCompanies.id),
  type: mysqlEnum("type", ["pmoc", "incendio", "eletrica", "outros"]).notNull(),
  content: text("content"), // HTML gerado pelo LLM
  pdfUrl: text("pdfUrl"),   // URL S3 do PDF
  pdfKey: varchar("pdfKey", { length: 300 }),
  status: mysqlEnum("status", ["gerando", "pronto", "erro"]).default("gerando").notNull(),
  generatedAt: timestamp("generatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FieldReport = typeof fieldReports.$inferSelect;
export type InsertFieldReport = typeof fieldReports.$inferInsert;

// ─── Módulo OPERIS IA — Inspeções Técnicas com IA ────────────────────────────

export const operisInspections = mysqlTable("operis_inspections", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  userId: int("userId").references(() => saasUsers.id).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  location: varchar("location", { length: 300 }).notNull(),
  client: varchar("client", { length: 200 }).notNull(),
  unit: varchar("unit", { length: 200 }),
  system: varchar("system", { length: 100 }).notNull(), // CO2, Hidrante, SDAI, SPK, etc.
  status: mysqlEnum("status", ["em_progresso", "concluida", "revisao"]).default("em_progresso").notNull(),
  globalRisk: mysqlEnum("globalRisk", ["R1", "R2", "R3", "R4", "R5"]).default("R1"),
  riskBySytem: json("riskBySystem"), // {"CO2": "R3", "SDAI": "R4"}
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OperisInspection = typeof operisInspections.$inferSelect;
export type InsertOperisInspection = typeof operisInspections.$inferInsert;

export const operisInspectionItems = mysqlTable("operis_inspection_items", {
  id: int("id").autoincrement().primaryKey(),
  inspectionId: int("inspectionId").references(() => operisInspections.id).notNull(),
  itemId: varchar("itemId", { length: 100 }).notNull(), // ID do item do checklist
  itemTitle: varchar("itemTitle", { length: 300 }).notNull(),
  system: varchar("system", { length: 100 }).notNull(),
  normReference: varchar("normReference", { length: 200 }),
  status: mysqlEnum("status", ["conforme", "nao_conforme", "necessita_revisao", "pendente"]).default("pendente"),
  findings: text("findings"), // Achados da análise de IA
  riskLevel: mysqlEnum("riskLevel", ["R1", "R2", "R3", "R4", "R5"]).default("R1"),
  recommendations: json("recommendations"), // string[]
  aiConfidence: varchar("aiConfidence", { length: 10 }), // "0.95"
  imageUrls: json("imageUrls"), // string[]
  analyzedAt: timestamp("analyzedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OperisInspectionItem = typeof operisInspectionItems.$inferSelect;
export type InsertOperisInspectionItem = typeof operisInspectionItems.$inferInsert;

export const operisReports = mysqlTable("operis_reports", {
  id: int("id").autoincrement().primaryKey(),
  inspectionId: int("inspectionId").references(() => operisInspections.id).notNull(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  htmlContent: text("htmlContent"), // Laudo em HTML gerado pela IA
  pdfUrl: text("pdfUrl"),           // URL pública do PDF (SEO)
  pdfKey: varchar("pdfKey", { length: 300 }),
  signatureUrl: text("signatureUrl"), // Assinatura digital do responsável
  globalRisk: mysqlEnum("globalRisk", ["R1", "R2", "R3", "R4", "R5"]),
  status: mysqlEnum("status", ["gerando", "pronto", "erro"]).default("gerando").notNull(),
  publicSlug: varchar("publicSlug", { length: 100 }), // URL amigável para SEO
  generatedAt: timestamp("generatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OperisReport = typeof operisReports.$inferSelect;
export type InsertOperisReport = typeof operisReports.$inferInsert;

// ─── Work Orders (OS) ─────────────────────────────────────────────────────────
export const workOrders = mysqlTable("work_orders", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  equipmentId: int("equipmentId").references(() => equipment.id),
  number: varchar("number", { length: 30 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["preventiva", "corretiva", "inspecao", "instalacao", "desativacao"]).notNull().default("preventiva"),
  priority: mysqlEnum("priority", ["baixa", "media", "alta", "critica"]).notNull().default("media"),
  status: mysqlEnum("status", ["aberta", "em_andamento", "aguardando_peca", "concluida", "cancelada"]).notNull().default("aberta"),
  assignedToId: int("assignedToId").references(() => saasUsers.id),
  scheduledDate: date("scheduledDate"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  estimatedHours: int("estimatedHours"),
  actualHours: int("actualHours"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = typeof workOrders.$inferInsert;

// ─── Checklist Templates ──────────────────────────────────────────────────────
export const checklistTemplates = mysqlTable("checklist_templates", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }),
  normReference: varchar("normReference", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ChecklistTemplate = typeof checklistTemplates.$inferSelect;

export const checklistItems = mysqlTable("checklist_items", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").references(() => checklistTemplates.id).notNull(),
  order: int("order").notNull().default(0),
  section: varchar("section", { length: 100 }),
  description: varchar("description", { length: 500 }).notNull(),
  normClause: varchar("normClause", { length: 50 }),
  required: boolean("required").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ChecklistItem = typeof checklistItems.$inferSelect;

export const checklistExecutions = mysqlTable("checklist_executions", {
  id: int("id").autoincrement().primaryKey(),
  workOrderId: int("workOrderId").references(() => workOrders.id),
  templateId: int("templateId").references(() => checklistTemplates.id).notNull(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  equipmentId: int("equipmentId").references(() => equipment.id),
  executedById: int("executedById").references(() => saasUsers.id),
  status: mysqlEnum("status", ["em_andamento", "concluido", "cancelado"]).default("em_andamento").notNull(),
  responses: json("responses"),
  score: int("score"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ChecklistExecution = typeof checklistExecutions.$inferSelect;

// ─── LGPD: Consentimento de Cookies ──────────────────────────────────────────
export const cookieConsents = mysqlTable("cookie_consents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => saasUsers.id),
  sessionId: varchar("sessionId", { length: 100 }),
  consentType: mysqlEnum("consentType", ["all", "custom", "essential_only"]).notNull(),
  essential: boolean("essential").default(true).notNull(),
  performance: boolean("performance").default(false).notNull(),
  analytics: boolean("analytics").default(false).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CookieConsent = typeof cookieConsents.$inferSelect;

// ─── LGPD: Solicitações de Direitos ──────────────────────────────────────────
export const lgpdRequests = mysqlTable("lgpd_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => saasUsers.id).notNull(),
  type: mysqlEnum("type", ["export", "delete", "correction", "access", "portability"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "rejected"]).default("pending").notNull(),
  notes: text("notes"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LgpdRequest = typeof lgpdRequests.$inferSelect;

// ─── Monetização — Assinaturas Recorrentes ────────────────────────────────────

export const billingSubscriptions = mysqlTable("billing_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  // Plano contratado
  plan: mysqlEnum("plan", ["basic", "pro", "industrial", "trial"]).notNull().default("trial"),
  // Status da assinatura (sincronizado via webhook Stripe)
  status: mysqlEnum("status", ["trialing", "active", "past_due", "canceled", "unpaid", "paused"]).notNull().default("trialing"),
  // IDs Stripe (fonte da verdade)
  stripeCustomerId: varchar("stripeCustomerId", { length: 100 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 100 }),
  stripePriceId: varchar("stripePriceId", { length: 100 }),
  // Datas de controle
  trialEndsAt: timestamp("trialEndsAt"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  canceledAt: timestamp("canceledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BillingSubscription = typeof billingSubscriptions.$inferSelect;
export type InsertBillingSubscription = typeof billingSubscriptions.$inferInsert;

export const billingInvoices = mysqlTable("billing_invoices", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").references(() => billingSubscriptions.id).notNull(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 100 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 100 }),
  amountCents: int("amountCents").notNull(), // valor em centavos
  currency: varchar("currency", { length: 3 }).default("brl").notNull(),
  status: mysqlEnum("status", ["draft", "open", "paid", "void", "uncollectible"]).notNull().default("open"),
  paidAt: timestamp("paidAt"),
  dueDate: timestamp("dueDate"),
  hostedInvoiceUrl: text("hostedInvoiceUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BillingInvoice = typeof billingInvoices.$inferSelect;
export type InsertBillingInvoice = typeof billingInvoices.$inferInsert;

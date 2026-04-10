import { boolean, date, decimal, index, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
}, (t) => ({
  // Índices para acelerar queries filtradas por empresa
  idxCompanyCreatedAt: index("idx_equipment_company_created").on(t.companyId, t.createdAt),
  idxCompanyStatus: index("idx_equipment_company_status").on(t.companyId, t.status),
  idxCompanyNextMaint: index("idx_equipment_company_next_maint").on(t.companyId, t.nextMaintenanceDate),
}));
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
}, (t) => ({
  // Índice para acelerar queries de manutenções por equipamento e data
  idxEquipmentServiceDate: index("idx_maint_equipment_date").on(t.equipmentId, t.serviceDate),
  idxCreatedAt: index("idx_maint_created").on(t.createdAt),
}));
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
}, (t) => ({
  // Índices para acelerar listagem de documentos por empresa e por equipamento
  idxDocCompanyCreated: index("idx_doc_company_created").on(t.companyId, t.createdAt),
  idxDocEquipment: index("idx_doc_equipment").on(t.equipmentId),
}));
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
}, (t) => ({
  // Índices para acelerar queries de OS por empresa e status
  idxCompanyStatus: index("idx_wo_company_status").on(t.companyId, t.status),
  idxCompanyCreatedAt: index("idx_wo_company_created").on(t.companyId, t.createdAt),
}));
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
}, (t) => ({
  // Índices para acelerar listagem de execuções por empresa e por equipamento
  idxExecCompanyCreated: index("idx_exec_company_created").on(t.companyId, t.createdAt),
  idxExecEquipment: index("idx_exec_equipment").on(t.equipmentId),
  idxExecStatus: index("idx_exec_status").on(t.companyId, t.status),
}));
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

// ─── Vistorias de Imóveis ─────────────────────────────────────────────────────

export const propertyInspections = mysqlTable("property_inspections", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  createdByUserId: int("createdByUserId").references(() => saasUsers.id).notNull(),
  // Tipo de vistoria
  type: mysqlEnum("type", ["entrada", "saida", "periodica", "devolucao"]).notNull().default("entrada"),
  status: mysqlEnum("status", ["rascunho", "em_andamento", "pending_validation", "aguardando_assinatura", "concluida", "cancelada"]).notNull().default("rascunho"),
  // Contrato gerado sequencialmente no Passo 4
  contractId: varchar("contractId", { length: 30 }).unique(), // ex: CONT-2026-0001
  auditHash: varchar("auditHash", { length: 64 }), // SHA-256 do payload no momento do fechamento
  lockedAt: timestamp("lockedAt"), // timestamp do LOCK_EDITION
  lockedByUserId: int("lockedByUserId"), // quem fechou o registro
  // Engenheiro Parceiro / Freelancer (DYNAMIC_FOOTER)
  engineerPartnerId: int("engineer_partner_id"), // FK para engineer_partners
  engineerName: varchar("engineer_name", { length: 255 }), // snapshot no momento do fechamento
  engineerCrea: varchar("engineer_crea", { length: 60 }),  // snapshot no momento do fechamento
  engineerContractUrl: text("engineer_contract_url"), // contrato de prest. de serviço
  // Dados do imóvel
  propertyAddress: text("propertyAddress").notNull(),
  propertyType: mysqlEnum("propertyType", ["apartamento", "casa", "sala_comercial", "galpao", "outro"]).notNull().default("apartamento"),
  propertyArea: varchar("propertyArea", { length: 20 }),
  propertyRegistration: varchar("propertyRegistration", { length: 100 }),
  // Dados do locador
  landlordName: varchar("landlordName", { length: 200 }).notNull(),
  landlordCpfCnpj: varchar("landlordCpfCnpj", { length: 20 }),
  landlordPhone: varchar("landlordPhone", { length: 30 }),
  landlordEmail: varchar("landlordEmail", { length: 320 }),
  // Dados do inquilino
  tenantName: varchar("tenantName", { length: 200 }).notNull(),
  tenantCpfCnpj: varchar("tenantCpfCnpj", { length: 20 }),
  tenantPhone: varchar("tenantPhone", { length: 30 }),
  tenantEmail: varchar("tenantEmail", { length: 320 }),
  // Dados do contrato
  contractNumber: varchar("contractNumber", { length: 100 }),
  contractStartDate: timestamp("contractStartDate"),
  contractEndDate: timestamp("contractEndDate"),
  rentValue: varchar("rentValue", { length: 30 }),
  // Dados do vistoriador
  inspectorName: varchar("inspectorName", { length: 200 }),
  inspectorCrea: varchar("inspectorCrea", { length: 50 }),
  inspectorCompany: varchar("inspectorCompany", { length: 200 }),
  // Laudo gerado
  reportHtml: text("reportHtml"),
  reportSlug: varchar("reportSlug", { length: 100 }).unique(),
  // Assinaturas
  landlordSignatureUrl: text("landlordSignatureUrl"),
  tenantSignatureUrl: text("tenantSignatureUrl"),
  inspectorSignatureUrl: text("inspectorSignatureUrl"),
  landlordSignedAt: timestamp("landlordSignedAt"),
  tenantSignedAt: timestamp("tenantSignedAt"),
  inspectorSignedAt: timestamp("inspectorSignedAt"),
  // Log de conformidade de assinaturas (SIGNATURE_COMPLIANCE)
  landlordSignedIp: varchar("landlordSignedIp", { length: 45 }),
  tenantSignedIp: varchar("tenantSignedIp", { length: 45 }),
  inspectorSignedIp: varchar("inspectorSignedIp", { length: 45 }),
  landlordSignedHash: varchar("landlordSignedHash", { length: 64 }),  // SHA-256 do payload no momento da firma
  tenantSignedHash: varchar("tenantSignedHash", { length: 64 }),
  inspectorSignedHash: varchar("inspectorSignedHash", { length: 64 }),
  // Reforma Tributária 2026 (LC 214/2025)
  redutorSocial: boolean("redutorSocial").default(false),
  clausulaVigencia: boolean("clausulaVigencia").default(false),
  garantiaType: mysqlEnum("garantiaType", ["caucao", "fiador", "seguro_fianca", "sem_garantia"]).default("seguro_fianca"),
  // CEP e endereço estruturado
  propertyCep: varchar("propertyCep", { length: 10 }),
  propertyStreet: varchar("propertyStreet", { length: 200 }),
  propertyNeighborhood: varchar("propertyNeighborhood", { length: 100 }),
  propertyCity: varchar("propertyCity", { length: 100 }),
  propertyState: varchar("propertyState", { length: 2 }),
  // Observações gerais
  generalNotes: text("generalNotes"),
  inspectedAt: timestamp("inspectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PropertyInspection = typeof propertyInspections.$inferSelect;
export type InsertPropertyInspection = typeof propertyInspections.$inferInsert;

export const inspectionRooms = mysqlTable("inspection_rooms", {
  id: int("id").autoincrement().primaryKey(),
  inspectionId: int("inspectionId").references(() => propertyInspections.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(), // ex: "Sala de Estar", "Quarto 1"
  type: mysqlEnum("type", ["sala", "quarto", "cozinha", "banheiro", "area_servico", "garagem", "varanda", "corredor", "outro"]).notNull().default("outro"),
  order: int("order").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InspectionRoom = typeof inspectionRooms.$inferSelect;
export type InsertInspectionRoom = typeof inspectionRooms.$inferInsert;

export const roomItems = mysqlTable("room_items", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").references(() => inspectionRooms.id).notNull(),
  inspectionId: int("inspectionId").references(() => propertyInspections.id).notNull(),
  name: varchar("name", { length: 150 }).notNull(), // ex: "Piso", "Parede", "Janela"
  category: mysqlEnum("category", ["piso", "parede", "teto", "porta", "janela", "eletrico", "hidraulico", "movel", "equipamento", "outro"]).notNull().default("outro"),
  condition: mysqlEnum("condition", ["otimo", "bom", "regular", "ruim", "pessimo", "inexistente"]).default("bom"),
  notes: text("notes"),
  photoUrl: text("photoUrl"),
  photoUrl2: text("photoUrl2"),          // Foto de Detalhe (obrigatória para REGULAR/RUIM/PESSIMO)
  photoGps: varchar("photoGps", { length: 60 }),  // "lat,lng" capturado no momento do upload
  photoTimestamp: timestamp("photoTimestamp"),     // Timestamp exato do upload da foto
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type RoomItem = typeof roomItems.$inferSelect;
export type InsertRoomItem = typeof roomItems.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// ERP ENTERPRISE — GESTÃO DE OBRAS, CUSTOS E COMPLIANCE
// ─────────────────────────────────────────────────────────────────────────────

// ── OBRAS (multi-obra, multi-filial) ─────────────────────────────────────────
export const obras = mysqlTable("obras", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  codigo: varchar("codigo", { length: 30 }).notNull(),
  nome: varchar("nome", { length: 200 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo_obra", ["instalacao", "manutencao", "reforma", "inspecao", "projeto", "outro"]).default("instalacao"),
  status: mysqlEnum("status_obra", ["planejamento", "em_andamento", "pausada", "concluida", "cancelada"]).default("planejamento"),
  endereco: varchar("endereco", { length: 300 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 9 }),
  responsavelId: int("responsavel_id"),
  clienteId: int("cliente_id"),
  dataInicioPrevista: date("data_inicio_prevista"),
  dataFimPrevista: date("data_fim_prevista"),
  dataInicioReal: date("data_inicio_real"),
  dataFimReal: date("data_fim_real"),
  orcamentoTotal: decimal("orcamento_total", { precision: 15, scale: 2 }).default("0"),
  custoRealTotal: decimal("custo_real_total", { precision: 15, scale: 2 }).default("0"),
  receitaContratada: decimal("receita_contratada", { precision: 15, scale: 2 }).default("0"),
  margemPrevista: decimal("margem_prevista", { precision: 5, scale: 2 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
export type Obra = typeof obras.$inferSelect;
export type InsertObra = typeof obras.$inferInsert;

// ── CENTROS DE CUSTO ──────────────────────────────────────────────────────────
export const centrosCusto = mysqlTable("centros_custo", {
  id: int("id").primaryKey().autoincrement(),
  obraId: int("obra_id").notNull(),
  companyId: int("company_id").notNull(),
  codigo: varchar("codigo", { length: 20 }).notNull(),
  nome: varchar("nome", { length: 150 }).notNull(),
  categoria: mysqlEnum("categoria_cc", ["material", "mao_obra", "equipamento", "subempreiteiro", "indireto", "servico"]).notNull(),
  orcado: decimal("orcado", { precision: 15, scale: 2 }).default("0"),
  realizado: decimal("realizado", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type CentroCusto = typeof centrosCusto.$inferSelect;
export type InsertCentroCusto = typeof centrosCusto.$inferInsert;

// ── LANÇAMENTOS DE CUSTO ──────────────────────────────────────────────────────
export const lancamentosCusto = mysqlTable("lancamentos_custo", {
  id: int("id").primaryKey().autoincrement(),
  obraId: int("obra_id").notNull(),
  centroCustoId: int("centro_custo_id"),
  companyId: int("company_id").notNull(),
  tipo: mysqlEnum("tipo_lancamento", ["material", "mao_obra", "equipamento", "subempreiteiro", "indireto", "servico"]).notNull(),
  descricao: varchar("descricao", { length: 300 }).notNull(),
  fornecedor: varchar("fornecedor", { length: 200 }),
  quantidade: decimal("quantidade", { precision: 10, scale: 3 }).default("1"),
  unidade: varchar("unidade", { length: 20 }).default("un"),
  valorUnitario: decimal("valor_unitario", { precision: 15, scale: 2 }).notNull(),
  valorTotal: decimal("valor_total", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status_lancamento", ["pendente", "aprovado", "pago", "cancelado"]).default("pendente"),
  dataCompetencia: date("data_competencia"),
  dataPagamento: date("data_pagamento"),
  nfeId: int("nfe_id"),
  nfeNumero: varchar("nfe_numero", { length: 50 }),
  classificadoPorIA: boolean("classificado_por_ia").default(false),
  confiancaIA: decimal("confianca_ia", { precision: 5, scale: 2 }),
  lancadoPorId: int("lancado_por_id"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
export type LancamentoCusto = typeof lancamentosCusto.$inferSelect;
export type InsertLancamentoCusto = typeof lancamentosCusto.$inferInsert;

// ── MÃO DE OBRA ───────────────────────────────────────────────────────────────
export const maoDeObra = mysqlTable("mao_de_obra", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  obraId: int("obra_id"),
  nome: varchar("nome", { length: 150 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  tipo: mysqlEnum("tipo_mdo", ["funcionario", "terceiro", "empreiteiro"]).default("funcionario"),
  funcao: varchar("funcao", { length: 100 }),
  custoDiario: decimal("custo_diario", { precision: 10, scale: 2 }),
  custoHora: decimal("custo_hora", { precision: 10, scale: 2 }),
  ativo: boolean("ativo").default(true),
  dataAdmissao: date("data_admissao"),
  dataDemissao: date("data_demissao"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type MaoDeObra = typeof maoDeObra.$inferSelect;
export type InsertMaoDeObra = typeof maoDeObra.$inferInsert;

// ── PONTO / PRESENÇA ──────────────────────────────────────────────────────────
export const registrosPonto = mysqlTable("registros_ponto", {
  id: int("id").primaryKey().autoincrement(),
  maoDeObraId: int("mao_de_obra_id").notNull(),
  obraId: int("obra_id").notNull(),
  companyId: int("company_id").notNull(),
  data: date("data").notNull(),
  entrada: varchar("entrada", { length: 5 }),
  saida: varchar("saida", { length: 5 }),
  horasTrabalhadas: decimal("horas_trabalhadas", { precision: 5, scale: 2 }),
  custoCalculado: decimal("custo_calculado", { precision: 10, scale: 2 }),
  observacao: varchar("observacao", { length: 300 }),
  registradoPorId: int("registrado_por_id"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type RegistroPonto = typeof registrosPonto.$inferSelect;
export type InsertRegistroPonto = typeof registrosPonto.$inferInsert;

// ── CONTAS A PAGAR ────────────────────────────────────────────────────────────
export const contasPagar = mysqlTable("contas_pagar", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  obraId: int("obra_id"),
  centroCustoId: int("centro_custo_id"),
  descricao: varchar("descricao", { length: 300 }).notNull(),
  fornecedor: varchar("fornecedor", { length: 200 }),
  categoria: mysqlEnum("categoria_cp", ["material", "servico", "equipamento", "subempreiteiro", "imposto", "outro"]).default("servico"),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  vencimento: date("vencimento").notNull(),
  dataPagamento: date("data_pagamento"),
  status: mysqlEnum("status_cp", ["pendente", "pago", "vencido", "cancelado"]).default("pendente"),
  nfeId: int("nfe_id"),
  comprovante: varchar("comprovante", { length: 500 }),
  observacoes: text("observacoes"),
  lancadoPorId: int("lancado_por_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
export type ContaPagar = typeof contasPagar.$inferSelect;
export type InsertContaPagar = typeof contasPagar.$inferInsert;

// ── CONTAS A RECEBER ──────────────────────────────────────────────────────────
export const contasReceber = mysqlTable("contas_receber", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  obraId: int("obra_id"),
  clienteId: int("cliente_id"),
  descricao: varchar("descricao", { length: 300 }).notNull(),
  numeroMedicao: varchar("numero_medicao", { length: 50 }),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  vencimento: date("vencimento").notNull(),
  dataRecebimento: date("data_recebimento"),
  status: mysqlEnum("status_cr", ["pendente", "recebido", "vencido", "cancelado"]).default("pendente"),
  comprovante: varchar("comprovante", { length: 500 }),
  observacoes: text("observacoes"),
  lancadoPorId: int("lancado_por_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
export type ContaReceber = typeof contasReceber.$inferSelect;
export type InsertContaReceber = typeof contasReceber.$inferInsert;

// ── NF-e / NFS-e ──────────────────────────────────────────────────────────────
export const notasFiscais = mysqlTable("notas_fiscais", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  obraId: int("obra_id"),
  tipo: mysqlEnum("tipo_nf", ["nfe", "nfse", "nfce"]).default("nfe"),
  numero: varchar("numero", { length: 20 }),
  serie: varchar("serie", { length: 5 }),
  chaveAcesso: varchar("chave_acesso", { length: 44 }),
  dataEmissao: date("data_emissao"),
  emitenteCnpj: varchar("emitente_cnpj", { length: 18 }),
  emitenteNome: varchar("emitente_nome", { length: 200 }),
  destinatarioCnpj: varchar("destinatario_cnpj", { length: 18 }),
  destinatarioNome: varchar("destinatario_nome", { length: 200 }),
  valorTotal: decimal("valor_total", { precision: 15, scale: 2 }),
  valorProdutos: decimal("valor_produtos", { precision: 15, scale: 2 }),
  valorServicos: decimal("valor_servicos", { precision: 15, scale: 2 }),
  valorImpostos: decimal("valor_impostos", { precision: 15, scale: 2 }),
  xmlUrl: varchar("xml_url", { length: 500 }),
  pdfUrl: varchar("pdf_url", { length: 500 }),
  itensClassificados: json("itens_classificados"),
  classificadoPorIA: boolean("classificado_por_ia").default(false),
  obraVinculadaPorIA: boolean("obra_vinculada_por_ia").default(false),
  status: mysqlEnum("status_nf", ["importada", "processando", "classificada", "vinculada", "erro"]).default("importada"),
  erroProcessamento: text("erro_processamento"),
  importadaPorId: int("importada_por_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
export type NotaFiscal = typeof notasFiscais.$inferSelect;
export type InsertNotaFiscal = typeof notasFiscais.$inferInsert;

// ── DRE POR OBRA ──────────────────────────────────────────────────────────────
export const dreObra = mysqlTable("dre_obra", {
  id: int("id").primaryKey().autoincrement(),
  obraId: int("obra_id").notNull(),
  companyId: int("company_id").notNull(),
  periodo: varchar("periodo", { length: 7 }).notNull(),
  receitaBruta: decimal("receita_bruta", { precision: 15, scale: 2 }).default("0"),
  deducoes: decimal("deducoes", { precision: 15, scale: 2 }).default("0"),
  receitaLiquida: decimal("receita_liquida", { precision: 15, scale: 2 }).default("0"),
  custoMaterial: decimal("custo_material", { precision: 15, scale: 2 }).default("0"),
  custoMaoObra: decimal("custo_mao_obra", { precision: 15, scale: 2 }).default("0"),
  custoEquipamento: decimal("custo_equipamento", { precision: 15, scale: 2 }).default("0"),
  custoSubempreiteiro: decimal("custo_subempreiteiro", { precision: 15, scale: 2 }).default("0"),
  custoIndireto: decimal("custo_indireto", { precision: 15, scale: 2 }).default("0"),
  custoTotal: decimal("custo_total", { precision: 15, scale: 2 }).default("0"),
  lucroBruto: decimal("lucro_bruto", { precision: 15, scale: 2 }).default("0"),
  margemBruta: decimal("margem_bruta", { precision: 5, scale: 2 }).default("0"),
  geradoEm: timestamp("gerado_em").defaultNow(),
  geradoPorId: int("gerado_por_id"),
});
export type DreObra = typeof dreObra.$inferSelect;
export type InsertDreObra = typeof dreObra.$inferInsert;

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────
export const auditLog = mysqlTable("audit_log", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id"),
  userId: int("user_id"),
  userName: varchar("user_name", { length: 150 }),
  acao: varchar("acao", { length: 100 }).notNull(),
  entidade: varchar("entidade", { length: 50 }),
  entidadeId: int("entidade_id"),
  dadosAntes: json("dados_antes"),
  dadosDepois: json("dados_depois"),
  ip: varchar("ip", { length: 45 }),
  userAgent: varchar("user_agent", { length: 300 }),
  createdAt: timestamp("created_at").defaultNow(),
});
export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

// ─── ART OPERIS — Responsabilidade Técnica Digital ───────────────────────────

export const artServices = mysqlTable("art_services", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => saasCompanies.id).notNull(),
  technicianId: int("technicianId").references(() => saasUsers.id).notNull(),
  engineerId: int("engineerId").references(() => saasUsers.id),
  // Dados do serviço
  serviceType: mysqlEnum("serviceType", [
    "pmoc", "incendio", "eletrica", "gas", "hidraulico", "co2", "outro"
  ]).notNull(),
  description: text("description").notNull(),
  clientName: varchar("clientName", { length: 200 }).notNull(),
  clientDocument: varchar("clientDocument", { length: 30 }),
  serviceAddress: varchar("serviceAddress", { length: 500 }),
  serviceDate: date("serviceDate").notNull(),
  // Declaração do técnico (assinatura obrigatória)
  technicianDeclaration: boolean("technicianDeclaration").default(false).notNull(),
  technicianSignatureTs: timestamp("technicianSignatureTs"),
  // Antifraude
  submissionHash: varchar("submissionHash", { length: 64 }), // SHA256
  serverTimestamp: timestamp("serverTimestamp"),
  geoLatitude: decimal("geoLatitude", { precision: 10, scale: 7 }),
  geoLongitude: decimal("geoLongitude", { precision: 10, scale: 7 }),
  // Fluxo de aprovação
  status: mysqlEnum("status", [
    "rascunho", "aguardando_aprovacao", "aprovado", "reprovado"
  ]).default("rascunho").notNull(),
  rejectionReason: text("rejectionReason"),
  approvedAt: timestamp("approvedAt"),
  // PDF gerado
  pdfUrl: text("pdfUrl"),
  pdfGeneratedAt: timestamp("pdfGeneratedAt"),
  // Monetização
  paymentStatus: mysqlEnum("paymentStatus", [
    "free_plan", "pending_payment", "paid", "exempt"
  ]).default("pending_payment").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 100 }),
  paidAt: timestamp("paidAt"),
  // Número oficial sequencial (ART-YYYY-NNNN)
  artNumber: varchar("artNumber", { length: 20 }),
  // Auditoria
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
  idxArtCompanyStatus: index("idx_art_company_status").on(t.companyId, t.status),
  idxArtTechnician: index("idx_art_technician").on(t.technicianId),
  idxArtCreated: index("idx_art_created").on(t.companyId, t.createdAt),
  idxArtNumber: index("idx_art_number").on(t.artNumber),
}));
export type ArtService = typeof artServices.$inferSelect;
export type InsertArtService = typeof artServices.$inferInsert;

export const artEvidences = mysqlTable("art_evidences", {
  id: int("id").autoincrement().primaryKey(),
  artServiceId: int("artServiceId").references(() => artServices.id).notNull(),
  uploadedById: int("uploadedById").references(() => saasUsers.id).notNull(),
  // Arquivo
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSizeBytes: int("fileSizeBytes"),
  evidenceType: mysqlEnum("evidenceType", [
    "foto", "video", "nota_fiscal", "laudo", "outro"
  ]).notNull(),
  // Antifraude — imutabilidade garantida por hash
  sha256Hash: varchar("sha256Hash", { length: 64 }).notNull(), // hash do arquivo
  serverTimestamp: timestamp("serverTimestamp").defaultNow().notNull(),
  geoLatitude: decimal("geoLatitude", { precision: 10, scale: 7 }),
  geoLongitude: decimal("geoLongitude", { precision: 10, scale: 7 }),
  // OCR / IA (apenas para nota_fiscal)
  ocrExtractedData: json("ocrExtractedData"), // dados extraídos via LLM
  ocrProcessedAt: timestamp("ocrProcessedAt"),
  // Evidência imutável — não pode ser editada após upload
  isLocked: boolean("isLocked").default(false).notNull(),
  lockedAt: timestamp("lockedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  idxEvidenceArt: index("idx_evidence_art").on(t.artServiceId),
}));
export type ArtEvidence = typeof artEvidences.$inferSelect;
export type InsertArtEvidence = typeof artEvidences.$inferInsert;

export const artApprovals = mysqlTable("art_approvals", {
  id: int("id").autoincrement().primaryKey(),
  artServiceId: int("artServiceId").references(() => artServices.id).notNull(),
  reviewerId: int("reviewerId").references(() => saasUsers.id).notNull(),
  action: mysqlEnum("action", ["aprovado", "reprovado"]).notNull(),
  notes: text("notes"),
  reviewedAt: timestamp("reviewedAt").defaultNow().notNull(),
}, (t) => ({
  idxApprovalArt: index("idx_approval_art").on(t.artServiceId),
}));
export type ArtApproval = typeof artApprovals.$inferSelect;
export type InsertArtApproval = typeof artApprovals.$inferInsert;

// ─── MÓDULO DIAGNÓSTICO DE PATOLOGIAS ───────────────────────────────────────
export const inspectionPathologies = mysqlTable("inspection_pathologies", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  inspectionId: int("inspection_id").notNull(),
  roomItemId: int("room_item_id"),
  category: varchar("category", { length: 50 }).notNull(), // fissura | infiltracao | corrosao | destacamento | outro
  severity: varchar("severity", { length: 20 }).notNull(), // low | medium | high
  causeAnalysis: text("cause_analysis"),
  repairSuggestion: text("repair_suggestion"),
  estimatedRepairCost: decimal("estimated_repair_cost", { precision: 10, scale: 2 }),
  photoContextUrl: varchar("photo_context_url", { length: 500 }),
  photoDetailUrl: varchar("photo_detail_url", { length: 500 }),
  riskScore: int("risk_score").default(0), // 1-10
  notifiedOwner: boolean("notified_owner").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdByUserId: int("created_by_user_id").notNull(),
});

// ─── COMPARAÇÃO ENTRADA vs. SAÍDA ────────────────────────────────────────────
export const inspectionComparisons = mysqlTable("inspection_comparisons", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  entryInspectionId: int("entry_inspection_id").notNull(),
  exitInspectionId: int("exit_inspection_id"),
  propertyAddress: varchar("property_address", { length: 500 }),
  contractNumber: varchar("contract_number", { length: 100 }),
  diffSummary: text("diff_summary"), // JSON com diferenças por cômodo
  overallConditionEntry: varchar("overall_condition_entry", { length: 20 }), // otimo | bom | regular | ruim
  overallConditionExit: varchar("overall_condition_exit", { length: 20 }),
  depreciationEstimate: decimal("depreciation_estimate", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  createdByUserId: int("created_by_user_id").notNull(),
});

// ─── PLANEJADOR DE MANUTENÇÃO ─────────────────────────────────────────────────
export const inspectionMaintenanceTasks = mysqlTable("inspection_maintenance_tasks", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  inspectionId: int("inspection_id").notNull(),
  pathologyId: int("pathology_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low | medium | high | critical
  status: varchar("status", { length: 30 }).notNull().default("pendente"), // pendente | em_andamento | concluida | cancelada
  dueDate: date("due_date"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  assignedTo: varchar("assigned_to", { length: 255 }),
  isFireSafetyRelated: boolean("is_fire_safety_related").default(false),
  co2ServiceOffered: boolean("co2_service_offered").default(false),
  notifiedOwner: boolean("notified_owner").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdByUserId: int("created_by_user_id").notNull(),
});

// ─── ENGENHEIROS PARCEIROS / FREELANCERS ──────────────────────────────────────
export const engineerPartners = mysqlTable("engineer_partners", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  crea: varchar("crea", { length: 60 }).notNull(),
  specialty: varchar("specialty", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  cpf: varchar("cpf", { length: 20 }),
  // Financeiro
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0.00"), // % sobre rentValue
  fixedFee: decimal("fixed_fee", { precision: 10, scale: 2 }).default("0.00"),            // valor fixo por vistoria
  pixKey: varchar("pix_key", { length: 255 }),
  bankAccount: varchar("bank_account", { length: 255 }),
  // Contrato de prestação de serviço
  serviceContractUrl: text("service_contract_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdByUserId: int("created_by_user_id").notNull(),
});
export type EngineerPartner = typeof engineerPartners.$inferSelect;
export type InsertEngineerPartner = typeof engineerPartners.$inferInsert;

// ─── PAGAMENTOS FREELANCERS ───────────────────────────────────────────────────
export const freelancePayouts = mysqlTable("freelance_payouts", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  inspectionId: int("inspection_id").notNull(),
  engineerPartnerId: int("engineer_partner_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending_approval", "approved", "paid", "cancelled"]).default("pending_approval").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }), // pix | bank_transfer | stripe
  paymentReference: varchar("payment_reference", { length: 255 }), // ID Stripe ou chave PIX
  approvedByUserId: int("approved_by_user_id"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  auditLog: text("audit_log"), // JSON com histórico de ações
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdByUserId: int("created_by_user_id").notNull(),
});
export type FreelancePayout = typeof freelancePayouts.$inferSelect;
export type InsertFreelancePayout = typeof freelancePayouts.$inferInsert;

// ─── VISTORIA DE SISTEMAS FIXOS DE INCÊNDIO ──────────────────────────────────
// Módulo add-on: requer plano Prêmio ou Industrial
// Normas: NBR 14518:2019, NBR 13714, NBR 17240, NBR 10897, IT CBMMG

export const fireSystemInspections = mysqlTable("fire_system_inspections", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  inspectionNumber: varchar("inspection_number", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["draft", "in_progress", "completed", "approved", "rejected"]).default("draft").notNull(),
  approvalStatus: mysqlEnum("approval_status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  enterpriseName: varchar("enterprise_name", { length: 255 }).notNull(),
  shoppingName: varchar("shopping_name", { length: 255 }),
  storeName: varchar("store_name", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  responsibleLocal: varchar("responsible_local", { length: 255 }),
  inspectorName: varchar("inspector_name", { length: 255 }).notNull(),
  engineerName: varchar("engineer_name", { length: 255 }),
  engineerCrea: varchar("engineer_crea", { length: 50 }),
  artNumber: varchar("art_number", { length: 50 }),
  inspectionDate: timestamp("inspection_date").defaultNow(),
  operationType: varchar("operation_type", { length: 100 }),
  fuelType: varchar("fuel_type", { length: 100 }),
  cookingClassification: varchar("cooking_classification", { length: 100 }),
  systemClassification: varchar("system_classification", { length: 100 }),
  generalNotes: text("general_notes"),
  scoreTotal: decimal("score_total", { precision: 5, scale: 2 }).default("0.00"),
  riskClassification: mysqlEnum("risk_classification", ["R1", "R2", "R3", "R4", "R5"]).default("R1").notNull(),
  auditHash: varchar("audit_hash", { length: 64 }),
  reportSlug: varchar("report_slug", { length: 100 }),
  reportUrl: text("report_url"),
  lastMaintenanceProvider: varchar("last_maintenance_provider", { length: 255 }),
  createdByUserId: int("created_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
export type FireSystemInspection = typeof fireSystemInspections.$inferSelect;
export type InsertFireSystemInspection = typeof fireSystemInspections.$inferInsert;

export const fireSystemItems = mysqlTable("fire_system_items", {
  id: int("id").primaryKey().autoincrement(),
  inspectionId: int("inspection_id").notNull(),
  sectionCode: varchar("section_code", { length: 10 }).notNull(),
  sectionName: varchar("section_name", { length: 255 }).notNull(),
  itemCode: varchar("item_code", { length: 10 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  normRef: varchar("norm_ref", { length: 50 }),
  status: mysqlEnum("status", ["pending", "conforming", "non_conforming", "not_applicable", "critical"]).default("pending").notNull(),
  riskLevel: int("risk_level").default(1),
  riskCode: varchar("risk_code", { length: 5 }).default("R1"),
  weight: decimal("weight", { precision: 4, scale: 1 }).default("1.0"),
  score: decimal("score", { precision: 4, scale: 2 }).default("0.00"),
  measurementType: varchar("measurement_type", { length: 50 }),
  measurementValueText: text("measurement_value_text"),
  measurementValueNumeric: decimal("measurement_value_numeric", { precision: 10, scale: 3 }),
  measurementUnit: varchar("measurement_unit", { length: 30 }),
  expectedMin: decimal("expected_min", { precision: 10, scale: 3 }),
  expectedMax: decimal("expected_max", { precision: 10, scale: 3 }),
  manualComment: text("manual_comment"),
  shortComment: text("short_comment"),
  aiComment: text("ai_comment"),
  recommendedAction: text("recommended_action"),
  photoUrls: text("photo_urls"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
export type FireSystemItem = typeof fireSystemItems.$inferSelect;
export type InsertFireSystemItem = typeof fireSystemItems.$inferInsert;

export const fireSystemAuditLogs = mysqlTable("fire_system_audit_logs", {
  id: int("id").primaryKey().autoincrement(),
  inspectionId: int("inspection_id").notNull(),
  userId: int("user_id").notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).default("inspection"),
  entityId: varchar("entity_id", { length: 50 }),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type FireSystemAuditLog = typeof fireSystemAuditLogs.$inferSelect;
export type InsertFireSystemAuditLog = typeof fireSystemAuditLogs.$inferInsert;

// ─── OPERIS.eng — Motor de Busca Semântica ────────────────────────────────────
export const operisKnowledgeChunks = mysqlTable("operis_knowledge_chunks", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id"),                              // null = base global
  source: varchar("source", { length: 255 }).notNull(),      // ex: "NBR 12615", "NFPA 12"
  sourceType: mysqlEnum("source_type", ["norm", "manual", "inspection", "budget", "custom"]).default("norm").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  embedding: text("embedding"),                              // JSON array float32 (384 dims)
  tags: varchar("tags", { length: 1000 }),                   // JSON array de tags
  normCode: varchar("norm_code", { length: 50 }),            // ex: "NBR12615"
  section: varchar("section", { length: 100 }),              // ex: "5.3.2"
  riskLevel: varchar("risk_level", { length: 5 }),           // R1-R5
  language: varchar("language", { length: 10 }).default("pt-BR"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
export type OperisKnowledgeChunk = typeof operisKnowledgeChunks.$inferSelect;
export type InsertOperisKnowledgeChunk = typeof operisKnowledgeChunks.$inferInsert;

// ─── PROJECT-CENTERED ARCHITECTURE ───────────────────────────────────────────
// Entidade central: PROJECT — unifica Inspeção, Fire System e OS
export const projects = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["inspection", "fire", "work_order"]).notNull(),
  status: mysqlEnum("status", ["draft", "in_progress", "completed", "cancelled"]).default("draft").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  responsibleId: int("responsible_id"),
  clientName: varchar("client_name", { length: 255 }),
  clientContact: varchar("client_contact", { length: 255 }),
  address: text("address"),
  description: text("description"),
  inspectionId: int("inspection_id"),
  fireSystemId: int("fire_system_id"),
  workOrderId: int("work_order_id"),
  totalCost: int("total_cost").default(0),
  totalPaid: int("total_paid").default(0),
  reportGenerated: int("report_generated").default(0),
  reportUrl: varchar("report_url", { length: 1000 }),
  tags: varchar("tags", { length: 500 }),
  notes: text("notes"),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Itens financeiros por projeto (custos, pagamentos, anexos)
export const projectFinancialItems = mysqlTable("project_financial_items", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("project_id").notNull(),
  companyId: int("company_id").notNull(),
  type: mysqlEnum("type", ["cost", "payment", "invoice"]).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  amount: int("amount").notNull(),
  paidAt: timestamp("paid_at"),
  attachmentUrl: varchar("attachment_url", { length: 1000 }),
  attachmentType: varchar("attachment_type", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type ProjectFinancialItem = typeof projectFinancialItems.$inferSelect;
export type InsertProjectFinancialItem = typeof projectFinancialItems.$inferInsert;

// Checklist simplificado por projeto (máx 5 itens — Bloco 3)
export const projectChecklistItems = mysqlTable("project_checklist_items", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("project_id").notNull(),
  companyId: int("company_id").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["ok", "warning", "critical", "pending"]).default("pending").notNull(),
  notes: text("notes"),
  photoUrl: varchar("photo_url", { length: 1000 }),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
export type ProjectChecklistItem = typeof projectChecklistItems.$inferSelect;
export type InsertProjectChecklistItem = typeof projectChecklistItems.$inferInsert;

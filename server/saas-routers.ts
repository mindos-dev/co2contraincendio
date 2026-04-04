import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import {
  searchOperis,
  getChunksByModule,
  getChunksByType,
  getPendingItems,
  getSystemStatus,
  ingestChunk,
  type KnowledgeModule,
  type KnowledgeChunkType,
} from "./operis-knowledge";
import {
  acknowledgeAlert,
  createAccessLog,
  createAlertEvent,
  createCompany,
  createDocument,
  createEquipment,
  createMaintenance,
  createSaasUser,
  createSubscription,
  deleteEquipment,
  getAllCompanies,
  getAllEquipmentForExport,
  getAllMaintenance,
  getAllSaasUsers,
  getAccessLogs,
  getAlertEvents,
  getCompanyById,
  getDashboardStats,
  getDocumentsByCompany,
  getDocumentsByEquipment,
  getEquipmentByCode,
  getEquipmentById,
  getEquipmentFiltered,
  getExpiredEquipment,
  getExpiringEquipment,
  getMaintenanceByEquipment,
  getSaasUserByEmail,
  getSaasUserById,
  getNotificationSettingsByCompany,
  getSubscriptionByCompany,
  updateCompany,
  updateDocumentStatus,
  updateEquipment,
  upsertNotificationSettings,
  getUsageReport,
  getCompanyReport,
  importCompaniesFromCsv,
  updateSaasUserRole,
  toggleSaasUserActive,
  getSaasUserByResetToken,
  setResetToken,
  clearResetToken,
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getChecklistTemplates,
  getChecklistItems,
  createChecklistExecution,
  updateChecklistExecution,
  getChecklistExecutions,
  saveCookieConsent,
  createLgpdRequest,
  getLgpdRequestsByUser,
  exportUserData,
  updateSaasUserProfile,
} from "./saas-db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { sendAlertNotification, sendEmail, buildWelcomeEmail, buildOsEmail } from "./notifications";
import { getSubscriptionsByCompany, sendPushNotification } from "./push-notifications";

const JWT_SECRET = process.env.JWT_SECRET ?? "co2-saas-secret-2025";

function signToken(payload: { userId: number; role: string; companyId: number | null }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string; companyId: number | null };
  } catch {
    return null;
  }
}

export const saasAuthProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const raw = ctx as Record<string, unknown>;
  const req = raw.req as { headers?: Record<string, string> } | undefined;
  const authHeader = req?.headers?.["x-saas-token"];
  if (!authHeader) throw new TRPCError({ code: "UNAUTHORIZED", message: "Token requerido" });
  const payload = verifyToken(authHeader);
  if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Token inválido" });
  return next({ ctx: { ...ctx, saasUser: payload } });
});

export const saasAdminProcedure = saasAuthProcedure.use(async ({ ctx, next }) => {
  const user = (ctx as { saasUser: { role: string } }).saasUser;
  if (!["superadmin", "admin"].includes(user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  }
  return next({ ctx });
});

function buildCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
}

export async function runDailyAlertJob() {
  try {
    const expiring = await getExpiringEquipment(30);
    const expired = await getExpiredEquipment();
    let notifSent = 0;
    for (const eq of expiring) {
      await createAlertEvent({
        equipmentId: eq.id,
        companyId: eq.companyId ?? undefined,
        alertType: "proximo_vencimento",
        message: `Equipamento ${eq.code} vence em breve (${eq.nextMaintenanceDate})`,
      });
      if (eq.companyId) {
        const cfg = await getNotificationSettingsByCompany(eq.companyId);
        if (cfg) {
          const emails: string[] = cfg.emailEnabled && cfg.emailRecipients ? JSON.parse(cfg.emailRecipients) : [];
          const phones: string[] = cfg.whatsappEnabled && cfg.whatsappNumbers ? JSON.parse(cfg.whatsappNumbers) : [];
          for (const email of emails) { const r = await sendAlertNotification({ email, type: "proximo_vencimento", equipment: eq }); if (r.some(x => x.success)) notifSent++; }
          for (const phone of phones) { const r = await sendAlertNotification({ whatsappPhone: phone, type: "proximo_vencimento", equipment: eq }); if (r.some(x => x.success)) notifSent++; }
          // Push notifications para técnicos mobile
          const pushSubs = await getSubscriptionsByCompany(eq.companyId);
          for (const sub of pushSubs) {
            const ok = await sendPushNotification(sub, { title: "⚠️ Manutenção Próxima", body: `Equipamento ${eq.code} vence em breve (${eq.nextMaintenanceDate})`, icon: "/icon-192.png", data: { equipmentId: eq.id } });
            if (ok) notifSent++;
          }
        }
      }
    }
    for (const eq of expired) {
      await createAlertEvent({
        equipmentId: eq.id,
        companyId: eq.companyId ?? undefined,
        alertType: "vencido",
        message: `Equipamento ${eq.code} está VENCIDO desde ${eq.nextMaintenanceDate}`,
      });
      await updateEquipment(eq.id, { status: "vencido" });
      if (eq.companyId) {
        const cfg = await getNotificationSettingsByCompany(eq.companyId);
        if (cfg) {
          const emails: string[] = cfg.emailEnabled && cfg.emailRecipients ? JSON.parse(cfg.emailRecipients) : [];
          const phones: string[] = cfg.whatsappEnabled && cfg.whatsappNumbers ? JSON.parse(cfg.whatsappNumbers) : [];
          for (const email of emails) { const r = await sendAlertNotification({ email, type: "vencido", equipment: eq }); if (r.some(x => x.success)) notifSent++; }
          for (const phone of phones) { const r = await sendAlertNotification({ whatsappPhone: phone, type: "vencido", equipment: eq }); if (r.some(x => x.success)) notifSent++; }
          // Push notifications para técnicos mobile
          const pushSubs2 = await getSubscriptionsByCompany(eq.companyId);
          for (const sub of pushSubs2) {
            const ok = await sendPushNotification(sub, { title: "🔴 Manutenção VENCIDA", body: `Equipamento ${eq.code} está VENCIDO desde ${eq.nextMaintenanceDate}`, icon: "/icon-192.png", data: { equipmentId: eq.id } });
            if (ok) notifSent++;
          }
        }
      }
    }
    console.log(`[AlertJob] ${expiring.length} próximos, ${expired.length} vencidos, ${notifSent} notificações enviadas`);
    return { expiring: expiring.length, expired: expired.length, notifSent };
  } catch (err) {
    console.error("[AlertJob] Erro:", err);
    return { error: String(err) };
  }
}

export const saasRouter = router({

  auth: router({
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const user = await getSaasUserByEmail(input.email);
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais inválidas" });
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais inválidas" });
        if (!user.active) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário inativo" });
        const token = signToken({ userId: user.id, role: user.role, companyId: user.companyId });
        return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId } };
      }),

    me: saasAuthProcedure.query(async ({ ctx }) => {
      const { saasUser } = ctx as { saasUser: { userId: number; role: string; companyId: number | null } };
      const user = await getSaasUserById(saasUser.userId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId };
    }),

    register: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
      }))
      .mutation(async ({ input }) => {
        const existing = await getSaasUserByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "E-mail já cadastrado" });
        const passwordHash = await bcrypt.hash(input.password, 10);
        await createSaasUser({ name: input.name, email: input.email, passwordHash, role: "cliente", active: true });
        const user = await getSaasUserByEmail(input.email);
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar usuário" });
        const token = signToken({ userId: user.id, role: user.role, companyId: user.companyId });
        // Envia e-mail de boas-vindas de forma assíncrona (não bloqueia o cadastro)
        const welcome = buildWelcomeEmail(user.name ?? input.name);
        sendEmail(user.email, welcome.subject, welcome.text, welcome.html).catch(() => {
          // Falha silenciosa: o cadastro já foi concluído com sucesso
        });
        return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId } };
      }),

    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email("E-mail inválido") }))
      .mutation(async ({ input }) => {
        const user = await getSaasUserByEmail(input.email);
        // Sempre retorna sucesso para não vazar quais e-mails existem
        if (!user) return { success: true };
        const token = randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        await setResetToken(user.id, token, expiry);
        const appUrl = process.env.APP_URL ?? "https://co2contra.com";
        const resetUrl = `${appUrl}/app/redefinir-senha?token=${token}`;
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
            <div style="background:#111;padding:24px;text-align:center;">
              <span style="background:#C8102E;color:#fff;font-weight:900;font-size:14px;padding:6px 12px;letter-spacing:2px;">OPERIS</span>
            </div>
            <div style="padding:32px 24px;background:#f8f8f8;">
              <h2 style="color:#111;font-size:20px;margin-bottom:8px;">Redefinição de Senha</h2>
              <p style="color:#555;font-size:14px;">Olá, <strong>${user.name}</strong>.</p>
              <p style="color:#555;font-size:14px;">Recebemos uma solicitação para redefinir a senha da sua conta OPERIS.</p>
              <p style="color:#555;font-size:14px;">Clique no botão abaixo para criar uma nova senha. Este link expira em <strong>1 hora</strong>.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}" style="background:#C8102E;color:#fff;padding:12px 28px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:1px;">REDEFINIR SENHA</a>
              </div>
              <p style="color:#999;font-size:12px;">Se você não solicitou isso, ignore este e-mail. Sua senha permanece a mesma.</p>
              <p style="color:#999;font-size:12px;">Link: <a href="${resetUrl}" style="color:#C8102E;">${resetUrl}</a></p>
            </div>
            <div style="background:#111;padding:16px;text-align:center;">
              <span style="color:#555;font-size:11px;">OPERIS IA · CO2 Contra Incêndio · co2contra.com</span>
            </div>
          </div>`;
        await sendEmail(input.email, "Redefinição de Senha — OPERIS", `Acesse: ${resetUrl}`, html);
        return { success: true };
      }),

    resetPassword: publicProcedure
      .input(z.object({
        token: z.string().min(1, "Token inválido"),
        password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
      }))
      .mutation(async ({ input }) => {
        const user = await getSaasUserByResetToken(input.token);
        if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Link inválido ou expirado" });
        if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Link expirado. Solicite um novo." });
        }
        const passwordHash = await bcrypt.hash(input.password, 10);
        await clearResetToken(user.id, passwordHash);
        return { success: true };
      }),
  }),

  companies: router({
    list: saasAdminProcedure.query(() => getAllCompanies()),
    get: saasAuthProcedure.input(z.object({ id: z.number() })).query(({ input }) => getCompanyById(input.id)),
    create: saasAdminProcedure
      .input(z.object({
        name: z.string().min(2),
        cnpj: z.string().optional(),
        type: z.enum(["shopping", "industria", "comercio", "residencial", "outro"]).optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(({ input }) => createCompany(input)),
    update: saasAdminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        cnpj: z.string().optional(),
        type: z.enum(["shopping", "industria", "comercio", "residencial", "outro"]).optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => updateCompany(id, data)),
  }),

  users: router({
    list: saasAdminProcedure.query(() => getAllSaasUsers()),
    create: saasAdminProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["superadmin", "admin", "tecnico", "cliente"]).optional(),
        companyId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const passwordHash = await bcrypt.hash(input.password, 10);
        const { password: _p, ...rest } = input;
        return createSaasUser({ ...rest, passwordHash });
      }),
    updateRole: saasAdminProcedure
      .input(z.object({
        id: z.number(),
        role: z.enum(["superadmin", "admin", "tecnico", "cliente"]),
      }))
      .mutation(({ input }) => updateSaasUserRole(input.id, input.role)),
    toggleActive: saasAdminProcedure
      .input(z.object({ id: z.number(), active: z.boolean() }))
      .mutation(({ input }) => toggleSaasUserActive(input.id, input.active)),
  }),

  equipment: router({
    list: saasAuthProcedure
      .input(z.object({
        companyId: z.number().optional(),
        search: z.string().optional(),
        category: z.string().optional(),
        status: z.string().optional(),
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
      }))
      .query(({ input }) => getEquipmentFiltered(input)),

    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(({ input }) => getEquipmentByCode(input.code)),

    getById: saasAuthProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getEquipmentById(input.id)),

    create: saasAuthProcedure
      .input(z.object({
        code: z.string().min(1),
        companyId: z.number().optional(),
        category: z.enum(["extintor", "hidrante", "sprinkler", "detector", "sinalizacao", "complementar"]).optional(),
        subType: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        serialNumber: z.string().optional(),
        fabricationYear: z.string().optional(),
        installationLocation: z.string().optional(),
        floor: z.string().optional(),
        sector: z.string().optional(),
        agentType: z.string().optional(),
        capacity: z.string().optional(),
        pressure: z.string().optional(),
        riskClass: z.string().optional(),
        installationDate: z.string().optional(),
        lastMaintenanceDate: z.string().optional(),
        nextMaintenanceDate: z.string().optional(),
        // Campos ABNT NBR / NFPA 25
        patrimonyTag: z.string().optional(),
        normReference: z.string().optional(),
        certificationUL: z.string().optional(),
        weightKg: z.string().optional(),
        workingPressureBar: z.string().optional(),
        testPressureBar: z.string().optional(),
        description: z.string().optional(),
        flowRate: z.string().optional(),
        activationTemp: z.string().optional(),
        coverageArea: z.string().optional(),
        detectorType: z.string().optional(),
        sensitivity: z.string().optional(),
        signageType: z.string().optional(),
        signageDimensions: z.string().optional(),
        signageColor: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const data: Record<string, unknown> = { ...input };
        if (input.installationDate) data.installationDate = new Date(input.installationDate);
        if (input.lastMaintenanceDate) data.lastMaintenanceDate = new Date(input.lastMaintenanceDate);
        if (input.nextMaintenanceDate) data.nextMaintenanceDate = new Date(input.nextMaintenanceDate);
        return createEquipment(data as Parameters<typeof createEquipment>[0]);
      }),

    update: saasAuthProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        category: z.enum(["extintor", "hidrante", "sprinkler", "detector", "sinalizacao", "complementar"]).optional(),
        subType: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        serialNumber: z.string().optional(),
        fabricationYear: z.string().optional(),
        installationLocation: z.string().optional(),
        floor: z.string().optional(),
        sector: z.string().optional(),
        agentType: z.string().optional(),
        capacity: z.string().optional(),
        pressure: z.string().optional(),
        riskClass: z.string().optional(),
        status: z.enum(["ok", "proximo_vencimento", "vencido", "inativo"]).optional(),
        installationDate: z.string().optional(),
        nextMaintenanceDate: z.string().optional(),
        // Campos ABNT NBR / NFPA 25
        patrimonyTag: z.string().optional(),
        normReference: z.string().optional(),
        certificationUL: z.string().optional(),
        weightKg: z.string().optional(),
        workingPressureBar: z.string().optional(),
        testPressureBar: z.string().optional(),
        description: z.string().optional(),
        flowRate: z.string().optional(),
        activationTemp: z.string().optional(),
        coverageArea: z.string().optional(),
        detectorType: z.string().optional(),
        sensitivity: z.string().optional(),
        signageType: z.string().optional(),
        signageDimensions: z.string().optional(),
        signageColor: z.string().optional(),
      }))
      .mutation(async ({ input: { id, ...data } }) => {
        const upd: Record<string, unknown> = { ...data };
        if (data.nextMaintenanceDate) upd.nextMaintenanceDate = new Date(data.nextMaintenanceDate);
        if (data.installationDate) upd.installationDate = new Date(data.installationDate);
        return updateEquipment(id, upd as Parameters<typeof updateEquipment>[1]);
      }),

    delete: saasAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteEquipment(input.id)),

    exportCsv: saasAuthProcedure
      .input(z.object({ companyId: z.number().optional() }))
      .query(async ({ input }) => {
        const rows = await getAllEquipmentForExport(input.companyId);
        const csvRows = rows.map(r => ({
          "Código": r.code,
          "Categoria": r.category,
          "Subtipo": r.subType ?? "",
          "Fabricante": r.manufacturer ?? "",
          "Modelo": r.model ?? "",
          "Nº Série": r.serialNumber ?? "",
          "Localização": r.installationLocation ?? "",
          "Andar": r.floor ?? "",
          "Setor": r.sector ?? "",
          "Agente Extintor": r.agentType ?? "",
          "Capacidade": r.capacity ?? "",
          "Pressão": r.pressure ?? "",
          "Status": r.status,
          "Última Manutenção": r.lastMaintenanceDate ? String(r.lastMaintenanceDate) : "",
          "Próxima Manutenção": r.nextMaintenanceDate ? String(r.nextMaintenanceDate) : "",
          "Data Instalação": r.installationDate ? String(r.installationDate) : "",
        }));
        return { csv: buildCsv(csvRows), total: rows.length };
      }),

    generateQr: saasAuthProcedure
      .input(z.object({ id: z.number(), baseUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        const eq = await getEquipmentById(input.id);
        if (!eq) throw new TRPCError({ code: "NOT_FOUND" });
        const url = `${input.baseUrl}/extintor/${eq.code}`;
        const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: "#111111", light: "#FFFFFF" } });
        const buf = Buffer.from(qrDataUrl.split(",")[1], "base64");
        const { url: cdnUrl } = await storagePut(`qrcodes/${eq.code}.png`, buf, "image/png");
        await updateEquipment(input.id, { qrCodeUrl: cdnUrl });
        return { qrCodeUrl: cdnUrl, pageUrl: url };
      }),

    generateQrBatch: saasAuthProcedure
      .input(z.object({ companyId: z.number(), baseUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        const { items } = await getEquipmentFiltered({ companyId: input.companyId, limit: 500 });
        const results = [];
        for (const eq of items) {
          const url = `${input.baseUrl}/extintor/${eq.code}`;
          const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
          const buf = Buffer.from(qrDataUrl.split(",")[1], "base64");
          const { url: cdnUrl } = await storagePut(`qrcodes/${eq.code}.png`, buf, "image/png");
          await updateEquipment(eq.id, { qrCodeUrl: cdnUrl });
          results.push({ code: eq.code, qrCodeUrl: cdnUrl });
        }
        return { generated: results.length, results };
      }),
  }),

  maintenance: router({
    listByEquipment: saasAuthProcedure
      .input(z.object({ equipmentId: z.number() }))
      .query(({ input }) => getMaintenanceByEquipment(input.equipmentId)),

    listAll: saasAuthProcedure
      .input(z.object({
        companyId: z.number().optional(),
        cursor: z.number().optional(), // id do último item para paginação cursor-based
        limit: z.number().min(1).max(200).optional(),
      }))
      .query(({ input }) => getAllMaintenance(input.companyId, input.limit ?? 50, input.cursor)),

    create: saasAuthProcedure
      .input(z.object({
        equipmentId: z.number(),
        serviceDate: z.string(),
        serviceType: z.enum(["recarga", "inspecao", "substituicao", "instalacao", "teste", "outro"]),
        description: z.string().optional(),
        agentType: z.string().optional(),
        capacity: z.string().optional(),
        pressure: z.string().optional(),
        quantity: z.number().optional(),
        technicianName: z.string().optional(),
        engineerName: z.string().optional(),
        crea: z.string().optional(),
        rnp: z.string().optional(),
        nextMaintenanceDate: z.string().optional(),
        invoiceNumber: z.string().optional(),
        serviceOrderNumber: z.string().optional(),
        reportNumber: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const data: Record<string, unknown> = { ...input };
        data.serviceDate = new Date(input.serviceDate);
        if (input.nextMaintenanceDate) {
          data.nextMaintenanceDate = new Date(input.nextMaintenanceDate);
          await updateEquipment(input.equipmentId, {
            lastMaintenanceDate: new Date(input.serviceDate),
            nextMaintenanceDate: new Date(input.nextMaintenanceDate),
            status: "ok",
          });
        }
        return createMaintenance(data as Parameters<typeof createMaintenance>[0]);
      }),

    /** Trigger manual de alerta a partir de uma manutenção */
    triggerAlert: saasAuthProcedure
      .input(z.object({
        equipmentId: z.number(),
        alertType: z.enum(["vencido", "proximo_vencimento", "sem_manutencao"]),
        message: z.string().min(5).max(500),
        severity: z.enum(["critical", "warning", "info"]).default("warning"),
      }))
      .mutation(async ({ input }) => {
        const equipment = await getEquipmentById(input.equipmentId);
        if (!equipment) throw new TRPCError({ code: "NOT_FOUND", message: "Equipamento não encontrado" });
        const alert = await createAlertEvent({
          equipmentId: input.equipmentId,
          alertType: input.alertType,
          message: input.message,
          sentAt: new Date(),
          acknowledged: false,
        });
        return { success: true, alertId: (alert as { insertId?: number }).insertId, equipmentCode: equipment.code };
      }),
  }),

  documents: router({
    listByEquipment: saasAuthProcedure
      .input(z.object({ equipmentId: z.number() }))
      .query(({ input }) => getDocumentsByEquipment(input.equipmentId)),

    listByCompany: saasAuthProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => getDocumentsByCompany(input.companyId)),

    uploadMultiple: saasAuthProcedure
      .input(z.object({
        companyId: z.number().optional(),
        equipmentId: z.number().optional(),
        files: z.array(z.object({
          name: z.string().max(255),
          base64: z.string().max(20_000_000, "Arquivo muito grande (máx 15MB)"), // ~15MB base64
          mimeType: z.enum([
            "image/jpeg", "image/png", "image/webp", "image/gif",
            "application/pdf",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain", "text/csv",
          ], { message: "Tipo de arquivo não permitido." }),
          type: z.enum(["nota_fiscal", "ordem_servico", "relatorio", "laudo", "art", "outro"]),
        })).max(10, "Máximo de 10 arquivos por upload"),
      }))
      .mutation(async ({ input }) => {
        const results = [];
        for (const file of input.files) {
          const buf = Buffer.from(file.base64, "base64");
          const key = `documents/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
          const { url: fileUrl } = await storagePut(key, buf, file.mimeType);
          await createDocument({
            companyId: input.companyId,
            equipmentId: input.equipmentId,
            type: file.type,
            fileUrl,
            fileName: file.name,
            processingStatus: "pending",
          });
          results.push({ fileName: file.name, fileUrl });
        }
        return { uploaded: results.length, results };
      }),

    processWithLlm: saasAuthProcedure
      .input(z.object({ documentId: z.number(), rawText: z.string() }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are a silent fire safety document parser. Extract structured data and return ONLY JSON. No explanations.
Output schema: {"equipment_code":"","type":"","service_date":"YYYY-MM-DD","next_maintenance":"YYYY-MM-DD","status":"OK|NEAR|EXPIRED","agent":"","capacity":"","pressure":"","document_number":""}
STATUS: OK=valid, NEAR=expires in 30 days, EXPIRED=past date. Missing fields = null. If unreadable: {"error":"invalid"}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.rawText.slice(0, 4000) },
          ],
        });

        const rawContent = response.choices[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : '{"error":"no_response"}';
        let extracted: Record<string, unknown> = {};
        try { extracted = JSON.parse(content); } catch { extracted = { error: "parse_error" }; }
        await updateDocumentStatus(input.documentId, "processed", JSON.stringify(extracted));
        return { extracted };
      }),
  }),

  logs: router({
    register: publicProcedure
      .input(z.object({
        equipmentId: z.number(),
        equipmentCode: z.string().optional(),
        storeName: z.string().optional(),
        storeNumber: z.string().optional(),
        shoppingName: z.string().optional(),
      }))
      .mutation(({ input, ctx }) => {
        const req = (ctx as { req?: { headers?: Record<string, string>; ip?: string } }).req;
        return createAccessLog({
          ...input,
          ipAddress: req?.headers?.["x-forwarded-for"] ?? req?.ip ?? "unknown",
          userAgent: req?.headers?.["user-agent"] ?? "",
        });
      }),

    list: saasAuthProcedure
      .input(z.object({ equipmentId: z.number().optional(), limit: z.number().optional() }))
      .query(({ input }) => getAccessLogs(input.equipmentId, input.limit)),
  }),

  alerts: router({
    list: saasAuthProcedure
      .input(z.object({ companyId: z.number().optional() }))
      .query(({ input }) => getAlertEvents(input.companyId)),

    expiring: saasAuthProcedure
      .input(z.object({ days: z.number().default(30), companyId: z.number().optional() }))
      .query(({ input }) => getExpiringEquipment(input.days, input.companyId)),

    expired: saasAuthProcedure
      .input(z.object({ companyId: z.number().optional() }))
      .query(({ input }) => getExpiredEquipment(input.companyId)),

    acknowledge: saasAuthProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => acknowledgeAlert(input.id)),

    runJob: saasAdminProcedure.mutation(() => runDailyAlertJob()),
  }),

  dashboard: router({
    stats: saasAuthProcedure
      .input(z.object({ companyId: z.number().optional() }))
      .query(({ input }) => getDashboardStats(input.companyId)),
  }),

  notifications: router({
    getSettings: saasAuthProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => getNotificationSettingsByCompany(input.companyId)),
    saveSettings: saasAuthProcedure
      .input(z.object({
        companyId: z.number(),
        emailEnabled: z.boolean(),
        whatsappEnabled: z.boolean(),
        emailRecipients: z.array(z.string().email()).optional(),
        whatsappNumbers: z.array(z.string()).optional(),
        daysBeforeAlert: z.number().min(1).max(365).optional(),
      }))
      .mutation(async ({ input }) => {
        return upsertNotificationSettings({
          companyId: input.companyId,
          emailEnabled: input.emailEnabled,
          whatsappEnabled: input.whatsappEnabled,
          emailRecipients: input.emailRecipients ? JSON.stringify(input.emailRecipients) : null,
          whatsappNumbers: input.whatsappNumbers ? JSON.stringify(input.whatsappNumbers) : null,
          daysBeforeAlert: input.daysBeforeAlert ?? 30,
        });
      }),
    testEmail: saasAuthProcedure
      .input(z.object({ email: z.string().email(), companyId: z.number() }))
      .mutation(async ({ input }) => {
        const fakeEq = { code: "TESTE-001", installationLocation: "Teste de configuração", nextMaintenanceDate: new Date() };
        const results = await sendAlertNotification({ email: input.email, type: "proximo_vencimento", equipment: fakeEq, companyName: "Teste" });
        return { results };
      }),
    testWhatsapp: saasAuthProcedure
      .input(z.object({ phone: z.string(), companyId: z.number() }))
      .mutation(async ({ input }) => {
        const fakeEq = { code: "TESTE-001", installationLocation: "Teste de configuração", nextMaintenanceDate: new Date() };
        const results = await sendAlertNotification({ whatsappPhone: input.phone, type: "proximo_vencimento", equipment: fakeEq, companyName: "Teste" });
        return { results };
      }),
  }),

   subscriptions: router({
    get: saasAuthProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => getSubscriptionByCompany(input.companyId)),
    create: saasAdminProcedure
      .input(z.object({
        companyId: z.number(),
        plan: z.enum(["basico", "profissional", "enterprise"]),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const data: Record<string, unknown> = { ...input };
        if (input.startDate) data.startDate = new Date(input.startDate);
        if (input.endDate) data.endDate = new Date(input.endDate);
        return createSubscription(data as Parameters<typeof createSubscription>[0]);
      }),
  }),

  reports: router({
    usage: saasAdminProcedure.query(() => getUsageReport()),

    company: saasAuthProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => getCompanyReport(input.companyId)),

    exportUsageCsv: saasAdminProcedure.query(async () => {
      const report = await getUsageReport();
      if (!report) return { csv: "" };
      const rows = [
        { metrica: "Total de Empresas", valor: report.summary.totalCompanies },
        { metrica: "Empresas Ativas", valor: report.summary.activeCompanies },
        { metrica: "Total de Equipamentos", valor: report.summary.totalEquipment },
        { metrica: "Equipamentos OK", valor: report.summary.okEquipment },
        { metrica: "Equipamentos Vencendo (30d)", valor: report.summary.expiringEquipment },
        { metrica: "Equipamentos Vencidos", valor: report.summary.expiredEquipment },
        { metrica: "Total de Manutenções", valor: report.summary.totalMaintenance },
        { metrica: "Total de Documentos", valor: report.summary.totalDocuments },
        { metrica: "Total de Alertas", valor: report.summary.totalAlerts },
        { metrica: "Alertas Pendentes", valor: report.summary.unacknowledgedAlerts },
        { metrica: "Gerado em", valor: report.generatedAt },
      ];
      return { csv: buildCsv(rows as Record<string, unknown>[]) };
    }),
  }),

  importCompanies: router({
    fromCsv: saasAdminProcedure
      .input(z.object({
        rows: z.array(z.object({
          name: z.string(),
          cnpj: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          type: z.string().optional(),
        })).min(1).max(500),
      }))
      .mutation(({ input }) => importCompaniesFromCsv(input.rows)),
  }),

  // ── WORK ORDERS (OS) ──────────────────────────────────────────────────────
  workOrders: router({
    list: saasAuthProcedure
      .input(z.object({
        companyId: z.number().optional(),
        status: z.string().optional(),
        cursor: z.number().optional(), // id do último item para paginação cursor-based
        limit: z.number().min(1).max(500).optional(),
      }))
      .query(({ input }) => getWorkOrders(input.companyId, input.status, input.limit ?? 50, input.cursor)),

    get: saasAuthProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getWorkOrderById(input.id)),

    create: saasAuthProcedure
      .input(z.object({
        companyId: z.number(),
        equipmentId: z.number().optional(),
        number: z.string().min(1),
        title: z.string().min(3),
        description: z.string().optional(),
        type: z.enum(["preventiva", "corretiva", "inspecao", "instalacao", "desativacao"]).default("preventiva"),
        priority: z.enum(["baixa", "media", "alta", "critica"]).default("media"),
        assignedToId: z.number().optional(),
        scheduledDate: z.string().optional(),
        estimatedHours: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const data: Record<string, unknown> = { ...input };
        if (input.scheduledDate) data.scheduledDate = new Date(input.scheduledDate);
        const wo = await createWorkOrder(data as Parameters<typeof createWorkOrder>[0]);
        // E-mail de confirmação ao técnico responsável (assíncrono)
        if (input.assignedToId) {
          getSaasUserById(input.assignedToId).then(async (assignee) => {
            if (assignee?.email) {
              const { subject, text, html } = buildOsEmail({
                name: assignee.name,
                osNumber: input.number,
                title: input.title,
                type: input.type ?? "preventiva",
                priority: input.priority ?? "media",
                status: "criada",
                scheduledDate: input.scheduledDate,
              });
              await sendEmail(assignee.email, subject, text, html);
            }
          }).catch(() => {});
        }
        return wo;
      }),

    update: saasAuthProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["aberta", "em_andamento", "aguardando_peca", "concluida", "cancelada"]).optional(),
        priority: z.enum(["baixa", "media", "alta", "critica"]).optional(),
        assignedToId: z.number().optional(),
        notes: z.string().optional(),
        actualHours: z.number().optional(),
        completedAt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const upd: Record<string, unknown> = { ...data };
        if (input.completedAt) upd.completedAt = new Date(input.completedAt);
        if (input.status === "em_andamento") upd.startedAt = new Date();
        if (input.status === "concluida") upd.completedAt = new Date();
        const updated = await updateWorkOrder(id, upd as Parameters<typeof updateWorkOrder>[1]);
        // E-mail ao concluir OS (assíncrono)
        if (input.status === "concluida") {
          getWorkOrderById(id).then(async (wo) => {
            if (wo?.assignedToId) {
              const assignee = await getSaasUserById(wo.assignedToId);
              if (assignee?.email) {
                const { subject, text, html } = buildOsEmail({
                  name: assignee.name,
                  osNumber: wo.number,
                  title: wo.title,
                  type: wo.type ?? "preventiva",
                  priority: wo.priority ?? "media",
                  status: "concluida",
                });
                await sendEmail(assignee.email, subject, text, html);
              }
            }
          }).catch(() => {});
        }
        return updated;
      }),

    delete: saasAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteWorkOrder(input.id)),
  }),

  // ── CHECKLIST ─────────────────────────────────────────────────────────────
  checklist: router({
    templates: saasAuthProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => getChecklistTemplates(input.companyId)),

    items: saasAuthProcedure
      .input(z.object({ templateId: z.number() }))
      .query(({ input }) => getChecklistItems(input.templateId)),

    startExecution: saasAuthProcedure
      .input(z.object({
        templateId: z.number(),
        companyId: z.number(),
        workOrderId: z.number().optional(),
        equipmentId: z.number().optional(),
        executedById: z.number().optional(),
      }))
      .mutation(({ input }) => createChecklistExecution(input)),

    saveResponses: saasAuthProcedure
      .input(z.object({
        id: z.number(),
        responses: z.array(z.object({
          itemId: z.number(),
          result: z.enum(["C", "NC", "NA"]),
          obs: z.string().optional(),
        })),
        score: z.number().optional(),
        status: z.enum(["em_andamento", "concluido", "cancelado"]).optional(),
      }))
      .mutation(({ input }) => updateChecklistExecution(input.id, {
        responses: input.responses,
        score: input.score,
        status: input.status,
        completedAt: input.status === "concluido" ? new Date() : undefined,
      })),

    executions: saasAuthProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => getChecklistExecutions(input.companyId)),
  }),

  // ── OPERIS KNOWLEDGE LAYER ─────────────────────────────────────────────────
  knowledge: router({
    /** Busca semântica no knowledge base do OPERIS */
    search: saasAuthProcedure
      .input(z.object({
        query: z.string().min(2).max(200),
        limit: z.number().min(1).max(20).default(8),
      }))
      .query(({ input }) => searchOperis(input.query, input.limit)),

    /** Retorna chunks por módulo */
    byModule: saasAuthProcedure
      .input(z.object({ module: z.string() }))
      .query(({ input }) => getChunksByModule(input.module as KnowledgeModule)),

    /** Retorna chunks por tipo */
    byType: saasAuthProcedure
      .input(z.object({ type: z.string() }))
      .query(({ input }) => getChunksByType(input.type as KnowledgeChunkType)),

    /** Retorna todos os itens pendentes ou com erro (por prioridade) */
    pending: saasAuthProcedure
      .query(() => getPendingItems()),

    /** Retorna o status geral do sistema */
    systemStatus: saasAuthProcedure
      .query(() => getSystemStatus()),

    /** Ingere um novo chunk no knowledge base */
    ingest: saasAdminProcedure
      .input(z.object({
        id: z.string(),
        module: z.string(),
        type: z.string(),
        title: z.string().min(3).max(200),
        content: z.string().min(10).max(5000),
        keywords: z.array(z.string()).min(1).max(30),
        relatedModules: z.array(z.string()).default([]),
        status: z.enum(["done", "pending", "error", "partial"]).default("pending"),
        priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
        suggestedActions: z.array(z.string()).optional(),
      }))
      .mutation(({ input }) =>
        ingestChunk({
          id: input.id,
          module: input.module as KnowledgeModule,
          type: input.type as KnowledgeChunkType,
          title: input.title,
          content: input.content,
          keywords: input.keywords,
          relatedModules: input.relatedModules as KnowledgeModule[],
          status: input.status,
          priority: input.priority,
          suggestedActions: input.suggestedActions,
        })
      ),
  }),

  // ─── LGPD ────────────────────────────────────────────────────────────────────
  lgpd: router({
    /** Registra consentimento de cookies (público) */
    saveConsent: publicProcedure
      .input(z.object({
        sessionId: z.string().optional(),
        consentType: z.enum(["all", "custom", "essential_only"]),
        essential: z.boolean().default(true),
        performance: z.boolean().default(false),
        analytics: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const raw = ctx as Record<string, unknown>;
        const req = raw.req as { headers?: Record<string, string>; ip?: string } | undefined;
        const ip = req?.headers?.["x-forwarded-for"] ?? req?.ip ?? undefined;
        const ua = req?.headers?.["user-agent"] ?? undefined;
        await saveCookieConsent({
          sessionId: input.sessionId,
          consentType: input.consentType,
          essential: input.essential,
          performance: input.performance,
          analytics: input.analytics,
          ipAddress: ip,
          userAgent: ua,
        });
        return { success: true };
      }),

    /** Solicita exportação de dados pessoais */
    requestExport: saasAuthProcedure
      .mutation(async ({ ctx }) => {
        const { saasUser } = ctx as { saasUser: { userId: number } };
        await createLgpdRequest({ userId: saasUser.userId, type: "export" });
        return { success: true, message: "Solicitação registrada. Você receberá seus dados em até 15 dias úteis." };
      }),

    /** Solicita exclusão de dados pessoais */
    requestDeletion: saasAuthProcedure
      .input(z.object({ notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const { saasUser } = ctx as { saasUser: { userId: number } };
        await createLgpdRequest({ userId: saasUser.userId, type: "delete", notes: input.notes });
        return { success: true, message: "Solicitação de exclusão registrada. Processaremos em até 15 dias úteis." };
      }),

    /** Exporta dados do usuário autenticado */
    exportMyData: saasAuthProcedure
      .query(async ({ ctx }) => {
        const { saasUser } = ctx as { saasUser: { userId: number } };
        const data = await exportUserData(saasUser.userId);
        if (!data) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
        return data;
      }),

    /** Lista solicitações LGPD do usuário */
    myRequests: saasAuthProcedure
      .query(async ({ ctx }) => {
        const { saasUser } = ctx as { saasUser: { userId: number } };
        return getLgpdRequestsByUser(saasUser.userId);
      }),
  }),

  // ─── Perfil do Usuário ──────────────────────────────────────────────────────
  perfil: router({
    /** Retorna dados do perfil do usuário autenticado */
    get: saasAuthProcedure
      .query(async ({ ctx }) => {
        const { saasUser } = ctx as { saasUser: { userId: number } };
        const user = await getSaasUserById(saasUser.userId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cargo: user.cargo ?? null,
          crea: user.crea ?? null,
          telefone: user.telefone ?? null,
          avatarUrl: user.avatarUrl ?? null,
          bio: user.bio ?? null,
          createdAt: user.createdAt,
        };
      }),

    /** Atualiza dados do perfil */
    update: saasAuthProcedure
      .input(z.object({
        name: z.string().min(2).max(200).optional(),
        cargo: z.string().max(100).optional(),
        crea: z.string().max(30).optional(),
        telefone: z.string().max(30).optional(),
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { saasUser } = ctx as { saasUser: { userId: number } };
        const updated = await updateSaasUserProfile(saasUser.userId, input);
        if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
        return {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          cargo: updated.cargo ?? null,
          crea: updated.crea ?? null,
          telefone: updated.telefone ?? null,
          avatarUrl: updated.avatarUrl ?? null,
          bio: updated.bio ?? null,
        };
      }),

    /** Upload de foto de perfil */
    uploadAvatar: saasAuthProcedure
      .input(z.object({
        fileBase64: z.string().max(5_000_000, "Imagem muito grande (máx 3.5MB)"), // ~3.5MB base64
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"], {
          message: "Tipo de arquivo inválido. Use JPEG, PNG ou WebP.",
        }).default("image/jpeg"),
      }))
      .mutation(async ({ ctx, input }) => {
        const { saasUser } = ctx as { saasUser: { userId: number } };
        const buffer = Buffer.from(input.fileBase64, "base64");
        // Validação adicional: máx 3.5MB após decodificação
        if (buffer.length > 3_670_016) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Imagem muito grande (máx 3.5MB)" });
        }
        const ext = input.mimeType.includes("png") ? "png" : input.mimeType.includes("webp") ? "webp" : "jpg";
        const key = `avatars/user-${saasUser.userId}-${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await updateSaasUserProfile(saasUser.userId, { avatarUrl: url });
        return { avatarUrl: url };
      }),
  }),
});

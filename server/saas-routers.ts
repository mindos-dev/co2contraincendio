import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
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
  getSubscriptionByCompany,
  updateCompany,
  updateDocumentStatus,
  updateEquipment,
} from "./saas-db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";

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

const saasAuthProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const raw = ctx as Record<string, unknown>;
  const req = raw.req as { headers?: Record<string, string> } | undefined;
  const authHeader = req?.headers?.["x-saas-token"];
  if (!authHeader) throw new TRPCError({ code: "UNAUTHORIZED", message: "Token requerido" });
  const payload = verifyToken(authHeader);
  if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Token inválido" });
  return next({ ctx: { ...ctx, saasUser: payload } });
});

const saasAdminProcedure = saasAuthProcedure.use(async ({ ctx, next }) => {
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
    for (const eq of expiring) {
      await createAlertEvent({
        equipmentId: eq.id,
        companyId: eq.companyId ?? undefined,
        alertType: "proximo_vencimento",
        message: `Equipamento ${eq.code} vence em breve (${eq.nextMaintenanceDate})`,
      });
    }
    for (const eq of expired) {
      await createAlertEvent({
        equipmentId: eq.id,
        companyId: eq.companyId ?? undefined,
        alertType: "vencido",
        message: `Equipamento ${eq.code} está VENCIDO desde ${eq.nextMaintenanceDate}`,
      });
      await updateEquipment(eq.id, { status: "vencido" });
    }
    console.log(`[AlertJob] ${expiring.length} próximos, ${expired.length} vencidos`);
    return { expiring: expiring.length, expired: expired.length };
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
        installationLocation: z.string().optional(),
        floor: z.string().optional(),
        sector: z.string().optional(),
        agentType: z.string().optional(),
        capacity: z.string().optional(),
        pressure: z.string().optional(),
        riskClass: z.string().optional(),
        installationDate: z.string().optional(),
        nextMaintenanceDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const data: Record<string, unknown> = { ...input };
        if (input.installationDate) data.installationDate = new Date(input.installationDate);
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
        installationLocation: z.string().optional(),
        floor: z.string().optional(),
        sector: z.string().optional(),
        agentType: z.string().optional(),
        capacity: z.string().optional(),
        pressure: z.string().optional(),
        status: z.enum(["ok", "proximo_vencimento", "vencido", "inativo"]).optional(),
        nextMaintenanceDate: z.string().optional(),
      }))
      .mutation(async ({ input: { id, ...data } }) => {
        const upd: Record<string, unknown> = { ...data };
        if (data.nextMaintenanceDate) upd.nextMaintenanceDate = new Date(data.nextMaintenanceDate);
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
      .input(z.object({ companyId: z.number().optional() }))
      .query(({ input }) => getAllMaintenance(input.companyId)),

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
          name: z.string(),
          base64: z.string(),
          mimeType: z.string(),
          type: z.enum(["nota_fiscal", "ordem_servico", "relatorio", "laudo", "art", "outro"]),
        })),
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
});

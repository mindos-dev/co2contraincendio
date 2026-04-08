/**
 * engineer-router.ts
 * CRUD de Engenheiros Parceiros / Freelancers + Lógica de Pagamento (Partner Payout)
 * Conformidade: AUDIT_HASH englobando dados do engenheiro (LEGAL_COMPLIANCE)
 */
import { z } from "zod";
import { router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { saasAuthProcedure } from "./saas-routers";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { engineerPartners, freelancePayouts, propertyInspections } from "../drizzle/schema";
import { createHash } from "crypto";

// ─── CRUD Engenheiros Parceiros ───────────────────────────────────────────────

export const engineerRouter = router({

  // Listar todos os engenheiros parceiros da empresa
  list: saasAuthProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário não vinculado a empresa." });

      const partners = await db
        .select()
        .from(engineerPartners)
        .where(and(
          eq(engineerPartners.companyId, companyId),
          eq(engineerPartners.isActive, true)
        ))
        .orderBy(desc(engineerPartners.createdAt));

      return partners;
    }),

  // Criar novo engenheiro parceiro
  create: saasAuthProcedure
    .input(z.object({
      name: z.string().min(3, "Nome obrigatório"),
      crea: z.string().min(5, "CREA obrigatório"),
      specialty: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      cpf: z.string().optional(),
      commissionRate: z.number().min(0).max(100).optional().default(0),
      fixedFee: z.number().min(0).optional().default(0),
      pixKey: z.string().optional(),
      bankAccount: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário não vinculado a empresa." });

      const [result] = await db.insert(engineerPartners).values({
        companyId,
        name: input.name,
        crea: input.crea,
        specialty: input.specialty,
        phone: input.phone,
        email: input.email,
        cpf: input.cpf,
        commissionRate: String(input.commissionRate ?? 0),
        fixedFee: String(input.fixedFee ?? 0),
        pixKey: input.pixKey,
        bankAccount: input.bankAccount,
        isActive: true,
        createdByUserId: ctx.saasUser.userId,
      });

      return { id: (result as any).insertId, ok: true };
    }),

  // Atualizar engenheiro parceiro
  update: saasAuthProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(3).optional(),
      crea: z.string().min(5).optional(),
      specialty: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      cpf: z.string().optional(),
      commissionRate: z.number().min(0).max(100).optional(),
      fixedFee: z.number().min(0).optional(),
      pixKey: z.string().optional(),
      bankAccount: z.string().optional(),
      serviceContractUrl: z.string().url().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const { id, ...fields } = input;
      const updateData: Record<string, unknown> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.crea !== undefined) updateData.crea = fields.crea;
      if (fields.specialty !== undefined) updateData.specialty = fields.specialty;
      if (fields.phone !== undefined) updateData.phone = fields.phone;
      if (fields.email !== undefined) updateData.email = fields.email;
      if (fields.cpf !== undefined) updateData.cpf = fields.cpf;
      if (fields.commissionRate !== undefined) updateData.commissionRate = String(fields.commissionRate);
      if (fields.fixedFee !== undefined) updateData.fixedFee = String(fields.fixedFee);
      if (fields.pixKey !== undefined) updateData.pixKey = fields.pixKey;
      if (fields.bankAccount !== undefined) updateData.bankAccount = fields.bankAccount;
      if (fields.serviceContractUrl !== undefined) updateData.serviceContractUrl = fields.serviceContractUrl;
      if (fields.isActive !== undefined) updateData.isActive = fields.isActive;

      await db.update(engineerPartners)
        .set(updateData as any)
        .where(and(
          eq(engineerPartners.id, id),
          eq(engineerPartners.companyId, companyId)
        ));

      return { ok: true };
    }),

  // Desativar engenheiro parceiro (soft delete)
  deactivate: saasAuthProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      await db.update(engineerPartners)
        .set({ isActive: false })
        .where(and(
          eq(engineerPartners.id, input.id),
          eq(engineerPartners.companyId, companyId)
        ));

      return { ok: true };
    }),

  // ─── PARTNER PAYOUT ─────────────────────────────────────────────────────────

  // Listar pagamentos pendentes de aprovação (Admin)
  listPayouts: saasAuthProcedure
    .input(z.object({
      status: z.enum(["pending_approval", "approved", "paid", "cancelled", "all"]).optional().default("all"),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const conditions = [eq(freelancePayouts.companyId, companyId)];
      if (input.status !== "all") {
        conditions.push(eq(freelancePayouts.status, input.status));
      }

      const payouts = await db
        .select({
          payout: freelancePayouts,
          engineer: engineerPartners,
          inspection: {
            id: propertyInspections.id,
            contractId: propertyInspections.contractId,
            propertyAddress: propertyInspections.propertyAddress,
            landlordName: propertyInspections.landlordName,
          },
        })
        .from(freelancePayouts)
        .leftJoin(engineerPartners, eq(freelancePayouts.engineerPartnerId, engineerPartners.id))
        .leftJoin(propertyInspections, eq(freelancePayouts.inspectionId, propertyInspections.id))
        .where(and(...conditions))
        .orderBy(desc(freelancePayouts.createdAt));

      return payouts;
    }),

  // Aprovar pagamento (Admin)
  approvePayout: saasAuthProcedure
    .input(z.object({
      payoutId: z.number(),
      paymentMethod: z.enum(["pix", "bank_transfer", "stripe"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const [payout] = await db
        .select()
        .from(freelancePayouts)
        .where(and(
          eq(freelancePayouts.id, input.payoutId),
          eq(freelancePayouts.companyId, companyId)
        ));

      if (!payout) throw new TRPCError({ code: "NOT_FOUND", message: "Pagamento não encontrado." });
      if (payout.status !== "pending_approval") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Pagamento não está pendente de aprovação." });
      }

      // AUDIT_LOG: registrar ação de aprovação
      const auditEntry = {
        action: "FREELANCE_PAYOUT_APPROVED",
        userId: ctx.saasUser.userId,
        timestamp: new Date().toISOString(),
        paymentMethod: input.paymentMethod,
        notes: input.notes,
      };
      const existingLog = payout.auditLog ? JSON.parse(payout.auditLog) : [];
      const newLog = JSON.stringify([...existingLog, auditEntry]);

      await db.update(freelancePayouts)
        .set({
          status: "approved",
          paymentMethod: input.paymentMethod,
          approvedByUserId: ctx.saasUser.userId,
          approvedAt: new Date(),
          notes: input.notes,
          auditLog: newLog,
        })
        .where(eq(freelancePayouts.id, input.payoutId));

      return { ok: true };
    }),

  // Marcar como pago (Admin)
  markAsPaid: saasAuthProcedure
    .input(z.object({
      payoutId: z.number(),
      paymentReference: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const [payout] = await db
        .select()
        .from(freelancePayouts)
        .where(and(
          eq(freelancePayouts.id, input.payoutId),
          eq(freelancePayouts.companyId, companyId)
        ));

      if (!payout) throw new TRPCError({ code: "NOT_FOUND" });
      if (payout.status !== "approved") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Pagamento precisa ser aprovado antes de ser marcado como pago." });
      }

      const auditEntry = {
        action: "FREELANCE_PAYOUT_PAID",
        userId: ctx.saasUser.userId,
        timestamp: new Date().toISOString(),
        paymentReference: input.paymentReference,
      };
      const existingLog = payout.auditLog ? JSON.parse(payout.auditLog) : [];
      const newLog = JSON.stringify([...existingLog, auditEntry]);

      await db.update(freelancePayouts)
        .set({
          status: "paid",
          paymentReference: input.paymentReference,
          paidAt: new Date(),
          auditLog: newLog,
        })
        .where(eq(freelancePayouts.id, input.payoutId));

      return { ok: true };
    }),

  // Criar payout automaticamente (chamado internamente quando vistoria é concluída)
  triggerPayout: saasAuthProcedure
    .input(z.object({ inspectionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const [inspection] = await db
        .select()
        .from(propertyInspections)
        .where(and(
          eq(propertyInspections.id, input.inspectionId),
          eq(propertyInspections.companyId, companyId)
        ));

      if (!inspection) throw new TRPCError({ code: "NOT_FOUND" });
      if (!inspection.engineerPartnerId) {
        return { ok: false, reason: "Sem engenheiro parceiro vinculado" };
      }

      const [engineer] = await db
        .select()
        .from(engineerPartners)
        .where(eq(engineerPartners.id, inspection.engineerPartnerId));

      if (!engineer) return { ok: false, reason: "Engenheiro não encontrado" };

      // Calcular valor do pagamento
      const rentValue = parseFloat(inspection.rentValue ?? "0");
      const commissionRate = parseFloat(engineer.commissionRate ?? "0");
      const fixedFee = parseFloat(engineer.fixedFee ?? "0");
      const amount = fixedFee > 0 ? fixedFee : (rentValue * commissionRate / 100);

      if (amount <= 0) {
        return { ok: false, reason: "Valor calculado é zero — configure commission_rate ou fixed_fee" };
      }

      // Verificar se já existe payout para esta vistoria
      const existing = await db
        .select()
        .from(freelancePayouts)
        .where(eq(freelancePayouts.inspectionId, input.inspectionId));

      if (existing.length > 0) {
        return { ok: false, reason: "Payout já existe para esta vistoria" };
      }

      // AUDIT_LOG: registrar trigger inicial
      const auditLog = JSON.stringify([{
        action: "FREELANCE_PAYOUT_INITIATED",
        userId: ctx.saasUser.userId,
        timestamp: new Date().toISOString(),
        inspectionId: input.inspectionId,
        engineerPartnerId: inspection.engineerPartnerId,
        amount,
        calculationMethod: fixedFee > 0 ? "fixed_fee" : `commission_rate_${commissionRate}%`,
      }]);

      const [result] = await db.insert(freelancePayouts).values({
        companyId,
        inspectionId: input.inspectionId,
        engineerPartnerId: inspection.engineerPartnerId,
        amount: String(amount),
        status: "pending_approval",
        auditLog,
        createdByUserId: ctx.saasUser.userId,
      });

      return { ok: true, payoutId: (result as any).insertId, amount };
    }),
});

/**
 * project-router.ts — Router tRPC para a entidade central PROJECT
 * Arquitetura PROJECT-CENTERED: unifica Inspeção, Fire System e OS
 * Blocos 1-9 do prompt de refatoração
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import {
  projects,
  projectFinancialItems,
  projectChecklistItems,
  type InsertProject,
  type InsertProjectFinancialItem,
  type InsertProjectChecklistItem,
} from "../drizzle/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { getSaasUserByEmail } from "./saas-db";
import { invokeLLM } from "./_core/llm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getCompanyId(email: string | null): Promise<number> {
  if (!email) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email não informado" });
  const user = await getSaasUserByEmail(email);
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não encontrado na plataforma OPERIS" });
  if (!user.companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem empresa vinculada" });
  return user.companyId;
}

async function assertProjectOwner(projectId: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
  const rows = await db.select().from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.companyId, companyId)))
    .limit(1);
  if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
  return rows[0];
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const projectRouter = router({

  // ── CRUD de Projetos ────────────────────────────────────────────────────────

  list: protectedProcedure
    .input(z.object({
      type: z.enum(["inspection", "fire", "work_order"]).optional(),
      status: z.enum(["draft", "in_progress", "completed", "cancelled"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { projects: [], total: 0 };
      const companyId = await getCompanyId(ctx.user.email);
      const conditions = [eq(projects.companyId, companyId)];
      if (input.type) conditions.push(eq(projects.type, input.type));
      if (input.status) conditions.push(eq(projects.status, input.status));

      const rows = await db.select().from(projects)
        .where(and(...conditions))
        .orderBy(desc(projects.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const countRows = await db.select({ count: sql<number>`count(*)` })
        .from(projects).where(and(...conditions));

      return { projects: rows, total: Number(countRows[0]?.count ?? 0) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const companyId = await getCompanyId(ctx.user.email);
      const project = await assertProjectOwner(input.id, companyId);

      const checklist = await db.select().from(projectChecklistItems)
        .where(and(eq(projectChecklistItems.projectId, input.id), eq(projectChecklistItems.companyId, companyId)))
        .orderBy(asc(projectChecklistItems.sortOrder));

      const financial = await db.select().from(projectFinancialItems)
        .where(and(eq(projectFinancialItems.projectId, input.id), eq(projectFinancialItems.companyId, companyId)))
        .orderBy(desc(projectFinancialItems.createdAt));

      return { project, checklist, financial };
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(3).max(255),
      type: z.enum(["inspection", "fire", "work_order"]),
      priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      clientName: z.string().max(255).optional(),
      clientContact: z.string().max(255).optional(),
      address: z.string().optional(),
      description: z.string().optional(),
      startDate: z.string().optional(),
      dueDate: z.string().optional(),
      notes: z.string().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const companyId = await getCompanyId(ctx.user.email);
      const user = await getSaasUserByEmail(ctx.user.email ?? "");

      const data: InsertProject = {
        companyId,
        title: input.title,
        type: input.type,
        priority: input.priority,
        status: "draft",
        responsibleId: user?.id ?? null,
        clientName: input.clientName ?? null,
        clientContact: input.clientContact ?? null,
        address: input.address ?? null,
        description: input.description ?? null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        notes: input.notes ?? null,
        tags: input.tags ?? null,
      };

      const result = await db.insert(projects).values(data);
      const newId = (result as unknown as { insertId: number }).insertId;

      // Criar checklist padrão por tipo (máx 5 itens — Bloco 3)
      const defaultChecklists: Record<string, string[]> = {
        inspection: [
          "Verificar condições estruturais",
          "Inspecionar instalações elétricas",
          "Avaliar sistemas de combate a incêndio",
          "Verificar saídas de emergência",
          "Documentar não-conformidades",
        ],
        fire: [
          "Verificar pressão dos cilindros",
          "Testar acionadores manuais e automáticos",
          "Inspecionar tubulações e bocais",
          "Verificar painel de controle",
          "Conferir sinalização de emergência",
        ],
        work_order: [
          "Receber ordem de serviço assinada",
          "Verificar materiais e ferramentas",
          "Executar serviço conforme especificação",
          "Registrar fotos antes/depois",
          "Coletar assinatura do responsável",
        ],
      };

      const checklistLabels = defaultChecklists[input.type] ?? [];
      if (checklistLabels.length > 0) {
        await db.insert(projectChecklistItems).values(
          checklistLabels.map((label, i): InsertProjectChecklistItem => ({
            projectId: newId,
            companyId,
            label,
            status: "pending",
            sortOrder: i,
            notes: null,
            photoUrl: null,
          }))
        );
      }

      return { id: newId, message: "Projeto criado com sucesso" };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(3).max(255).optional(),
      status: z.enum(["draft", "in_progress", "completed", "cancelled"]).optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      clientName: z.string().max(255).optional(),
      clientContact: z.string().max(255).optional(),
      address: z.string().optional(),
      description: z.string().optional(),
      startDate: z.string().optional(),
      dueDate: z.string().optional(),
      notes: z.string().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const companyId = await getCompanyId(ctx.user.email);
      await assertProjectOwner(input.id, companyId);

      const updateData: Partial<InsertProject> = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.clientName !== undefined) updateData.clientName = input.clientName;
      if (input.clientContact !== undefined) updateData.clientContact = input.clientContact;
      if (input.address !== undefined) updateData.address = input.address;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
      if (input.dueDate !== undefined) updateData.dueDate = new Date(input.dueDate);
      if (input.status === "completed") updateData.completedAt = new Date();

      await db.update(projects).set(updateData).where(eq(projects.id, input.id));
      return { message: "Projeto atualizado com sucesso" };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const companyId = await getCompanyId(ctx.user.email);
      await assertProjectOwner(input.id, companyId);

      await db.delete(projectChecklistItems).where(eq(projectChecklistItems.projectId, input.id));
      await db.delete(projectFinancialItems).where(eq(projectFinancialItems.projectId, input.id));
      await db.delete(projects).where(eq(projects.id, input.id));

      return { message: "Projeto removido com sucesso" };
    }),

  // ── Checklist ───────────────────────────────────────────────────────────────

  updateChecklistItem: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["ok", "warning", "critical", "pending"]).optional(),
      notes: z.string().optional(),
      photoUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const companyId = await getCompanyId(ctx.user.email);
      const { id, ...data } = input;
      await db.update(projectChecklistItems)
        .set(data)
        .where(and(eq(projectChecklistItems.id, id), eq(projectChecklistItems.companyId, companyId)));
      return { message: "Item atualizado" };
    }),

  addChecklistItem: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      label: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const companyId = await getCompanyId(ctx.user.email);
      await assertProjectOwner(input.projectId, companyId);

      const countRows = await db.select({ count: sql<number>`count(*)` })
        .from(projectChecklistItems)
        .where(and(eq(projectChecklistItems.projectId, input.projectId), eq(projectChecklistItems.companyId, companyId)));
      const count = Number(countRows[0]?.count ?? 0);
      if (count >= 5) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Máximo de 5 itens no checklist por projeto" });
      }

      const data: InsertProjectChecklistItem = {
        projectId: input.projectId,
        companyId,
        label: input.label,
        status: "pending",
        sortOrder: count,
        notes: null,
        photoUrl: null,
      };
      await db.insert(projectChecklistItems).values(data);
      return { message: "Item adicionado ao checklist" };
    }),

  // ── Financeiro ──────────────────────────────────────────────────────────────

  addFinancialItem: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      type: z.enum(["cost", "payment", "invoice"]),
      description: z.string().min(1).max(500),
      amount: z.number().min(1),
      paidAt: z.string().optional(),
      attachmentUrl: z.string().optional(),
      attachmentType: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const companyId = await getCompanyId(ctx.user.email);
      await assertProjectOwner(input.projectId, companyId);

      const data: InsertProjectFinancialItem = {
        projectId: input.projectId,
        companyId,
        type: input.type,
        description: input.description,
        amount: input.amount,
        paidAt: input.paidAt ? new Date(input.paidAt) : null,
        attachmentUrl: input.attachmentUrl ?? null,
        attachmentType: input.attachmentType ?? null,
        notes: input.notes ?? null,
      };
      await db.insert(projectFinancialItems).values(data);

      const items = await db.select().from(projectFinancialItems)
        .where(and(eq(projectFinancialItems.projectId, input.projectId), eq(projectFinancialItems.companyId, companyId)));

      const totalCost = items.filter((i: typeof items[0]) => i.type === "cost").reduce((s: number, i: typeof items[0]) => s + i.amount, 0);
      const totalPaid = items.filter((i: typeof items[0]) => i.type === "payment").reduce((s: number, i: typeof items[0]) => s + i.amount, 0);

      await db.update(projects)
        .set({ totalCost, totalPaid })
        .where(eq(projects.id, input.projectId));

      return { message: "Item financeiro adicionado" };
    }),

  deleteFinancialItem: protectedProcedure
    .input(z.object({ id: z.number(), projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const companyId = await getCompanyId(ctx.user.email);
      await assertProjectOwner(input.projectId, companyId);
      await db.delete(projectFinancialItems)
        .where(and(eq(projectFinancialItems.id, input.id), eq(projectFinancialItems.companyId, companyId)));
      return { message: "Item removido" };
    }),

  // ── IA Assistente (Bloco 9) ─────────────────────────────────────────────────

  aiAnalyze: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      question: z.string().min(5).max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const companyId = await getCompanyId(ctx.user.email);
      const project = await assertProjectOwner(input.projectId, companyId);

      const checklist = await db.select().from(projectChecklistItems)
        .where(and(eq(projectChecklistItems.projectId, input.projectId), eq(projectChecklistItems.companyId, companyId)));

      const checklistSummary = checklist.map((c: typeof checklist[0]) =>
        `- ${c.label}: ${c.status.toUpperCase()}${c.notes ? ` (${c.notes})` : ""}`
      ).join("\n");

      const typeLabels: Record<string, string> = {
        inspection: "Inspeção Predial",
        fire: "Sistema de Incêndio",
        work_order: "Ordem de Serviço",
      };

      const systemPrompt = `Você é o OPERIS.eng, assistente técnico especializado em sistemas de proteção contra incêndio (CO₂, Saponificante, Hidrantes, Alarmes) e engenharia de segurança. 
Responda sempre em português brasileiro, de forma técnica e objetiva.
Cite normas ABNT NBR e NFPA quando relevante.
Mantenha respostas concisas (máx 300 palavras).`;

      const userMessage = `Projeto: "${project.title}" (${typeLabels[project.type] ?? project.type})
Status: ${project.status}
Prioridade: ${project.priority}
Cliente: ${project.clientName ?? "Não informado"}
Descrição: ${project.description ?? "Não informada"}

Checklist:
${checklistSummary || "Nenhum item registrado"}

${input.question ? `Pergunta específica: ${input.question}` : "Analise este projeto e forneça: (1) diagnóstico do status atual, (2) itens críticos que precisam de atenção, (3) recomendações técnicas, (4) normas aplicáveis."}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });

      const analysis = (response as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content ?? "Análise não disponível no momento.";
      return { analysis };
    }),

  // ── Gerar Relatório (Bloco 7) ────────────────────────────────────────────────

  generateReport: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const companyId = await getCompanyId(ctx.user.email);
      const project = await assertProjectOwner(input.projectId, companyId);

      const checklist = await db.select().from(projectChecklistItems)
        .where(and(eq(projectChecklistItems.projectId, input.projectId), eq(projectChecklistItems.companyId, companyId)));

      const financial = await db.select().from(projectFinancialItems)
        .where(and(eq(projectFinancialItems.projectId, input.projectId), eq(projectFinancialItems.companyId, companyId)));

      const typeLabels: Record<string, string> = {
        inspection: "RELATÓRIO DE INSPEÇÃO",
        fire: "RELATÓRIO DE SISTEMA DE INCÊNDIO",
        work_order: "RELATÓRIO DE ORDEM DE SERVIÇO",
      };

      const statusLabels: Record<string, string> = {
        ok: "✅ Conforme",
        warning: "⚠️ Atenção",
        critical: "🔴 Crítico",
        pending: "⏳ Pendente",
      };

      const totalCost = financial.filter((f: typeof financial[0]) => f.type === "cost").reduce((s: number, f: typeof financial[0]) => s + f.amount, 0);
      const totalPaid = financial.filter((f: typeof financial[0]) => f.type === "payment").reduce((s: number, f: typeof financial[0]) => s + f.amount, 0);

      const reportContent = `# ${typeLabels[project.type] ?? "RELATÓRIO DE PROJETO"}

**Projeto:** ${project.title}
**Data:** ${new Date().toLocaleDateString("pt-BR")}
**Status:** ${project.status}
**Prioridade:** ${project.priority}
**Cliente:** ${project.clientName ?? "Não informado"}
**Endereço:** ${project.address ?? "Não informado"}

---

## Descrição
${project.description ?? "Não informada"}

---

## Checklist de Inspeção
${checklist.map((c: typeof checklist[0]) => `- **${c.label}:** ${statusLabels[c.status] ?? c.status}${c.notes ? `\n  *Observação: ${c.notes}*` : ""}`).join("\n") || "Nenhum item registrado"}

**Resumo:** ${checklist.filter((c: typeof checklist[0]) => c.status === "ok").length} conformes / ${checklist.filter((c: typeof checklist[0]) => c.status === "warning").length} atenção / ${checklist.filter((c: typeof checklist[0]) => c.status === "critical").length} críticos

---

## Resumo Financeiro
| Tipo | Descrição | Valor |
|------|-----------|-------|
${financial.map((f: typeof financial[0]) => `| ${f.type === "cost" ? "Custo" : f.type === "payment" ? "Pagamento" : "NF"} | ${f.description} | R$ ${(f.amount / 100).toFixed(2)} |`).join("\n") || "| — | Nenhum registro | — |"}

**Total de Custos:** R$ ${(totalCost / 100).toFixed(2)}
**Total Pago:** R$ ${(totalPaid / 100).toFixed(2)}
**Saldo:** R$ ${((totalCost - totalPaid) / 100).toFixed(2)}

---

## Notas Técnicas
${project.notes ?? "Nenhuma nota registrada"}

---

*Relatório gerado automaticamente pelo OPERIS.eng — CO₂ Contra Incêndio LTDA*
*CNPJ: 29.905.123/0001-53 | Eng. Judson Aleixo Sampaio — CREA/MG: 142203671-5*`;

      await db.update(projects)
        .set({ reportGenerated: 1 })
        .where(eq(projects.id, input.projectId));

      return { report: reportContent, generatedAt: new Date().toISOString() };
    }),

  // ── Estatísticas ─────────────────────────────────────────────────────────────

  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { total: 0, byStatus: {}, byType: {}, critical: 0, totalRevenue: 0 };
      const companyId = await getCompanyId(ctx.user.email);

      const allProjects = await db.select().from(projects)
        .where(eq(projects.companyId, companyId));

      type P = typeof allProjects[0];

      const byStatus = {
        draft: allProjects.filter((p: P) => p.status === "draft").length,
        in_progress: allProjects.filter((p: P) => p.status === "in_progress").length,
        completed: allProjects.filter((p: P) => p.status === "completed").length,
        cancelled: allProjects.filter((p: P) => p.status === "cancelled").length,
      };

      const byType = {
        inspection: allProjects.filter((p: P) => p.type === "inspection").length,
        fire: allProjects.filter((p: P) => p.type === "fire").length,
        work_order: allProjects.filter((p: P) => p.type === "work_order").length,
      };

      const critical = allProjects.filter((p: P) => p.priority === "critical" && p.status !== "completed").length;
      const totalRevenue = allProjects.reduce((s: number, p: P) => s + (p.totalPaid ?? 0), 0);

      return { total: allProjects.length, byStatus, byType, critical, totalRevenue };
    }),
});

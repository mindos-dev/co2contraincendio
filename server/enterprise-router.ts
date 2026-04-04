import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import {
  obras, centrosCusto, lancamentosCusto, maoDeObra,
  registrosPonto, contasPagar, contasReceber, notasFiscais,
  dreObra, auditLog
} from "../drizzle/schema";
import { eq, and, desc, gte, lte, sql, sum } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

// ─── Helper: registrar audit log ─────────────────────────────────────────────
async function logAudit(params: {
  companyId: number;
  userId: number;
  userName: string;
  acao: string;
  entidade: string;
  entidadeId?: number;
  dadosAntes?: unknown;
  dadosDepois?: unknown;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values({
    companyId: params.companyId,
    userId: params.userId,
    userName: params.userName,
    acao: params.acao,
    entidade: params.entidade,
    entidadeId: params.entidadeId,
    dadosAntes: params.dadosAntes as Record<string, unknown> | null,
    dadosDepois: params.dadosDepois as Record<string, unknown> | null,
  });
}

// ─── OBRAS ROUTER ─────────────────────────────────────────────────────────────
const obrasRouter = router({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["planejamento", "em_andamento", "pausada", "concluida", "cancelada"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Empresa não encontrada" });

      const conditions = [eq(obras.companyId, companyId)];
      if (input?.status) conditions.push(eq(obras.status, input.status));

      return db.select().from(obras).where(and(...conditions)).orderBy(desc(obras.createdAt)).limit(500);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const [obra] = await db.select().from(obras)
        .where(and(eq(obras.id, input.id), eq(obras.companyId, companyId)));
      if (!obra) throw new TRPCError({ code: "NOT_FOUND" });

      // Buscar centros de custo e totais
      const centros = await db.select().from(centrosCusto)
        .where(eq(centrosCusto.obraId, input.id));

      return { ...obra, centrosCusto: centros };
    }),

  create: protectedProcedure
    .input(z.object({
      codigo: z.string().min(1).max(30),
      nome: z.string().min(1).max(200),
      descricao: z.string().optional(),
      tipo: z.enum(["instalacao", "manutencao", "reforma", "inspecao", "projeto", "outro"]).optional(),
      endereco: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().max(2).optional(),
      cep: z.string().optional(),
      dataInicioPrevista: z.string().optional(),
      dataFimPrevista: z.string().optional(),
      orcamentoTotal: z.string().optional(),
      receitaContratada: z.string().optional(),
      margemPrevista: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null; id: number; name: string } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const [result] = await db.insert(obras).values({
        companyId,
        codigo: input.codigo,
        nome: input.nome,
        descricao: input.descricao,
        tipo: input.tipo,
        endereco: input.endereco,
        cidade: input.cidade,
        estado: input.estado,
        cep: input.cep,
        dataInicioPrevista: input.dataInicioPrevista ? new Date(input.dataInicioPrevista) : undefined,
        dataFimPrevista: input.dataFimPrevista ? new Date(input.dataFimPrevista) : undefined,
        orcamentoTotal: input.orcamentoTotal,
        receitaContratada: input.receitaContratada,
        margemPrevista: input.margemPrevista,
        observacoes: input.observacoes,
      });

      const obraId = (result as { insertId: number }).insertId;
      await logAudit({
        companyId,
        userId: saasUser!.id,
        userName: saasUser!.name,
        acao: "obra.create",
        entidade: "obras",
        entidadeId: obraId,
        dadosDepois: input,
      });

      return { id: obraId, message: "Obra criada com sucesso" };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional(),
      status: z.enum(["planejamento", "em_andamento", "pausada", "concluida", "cancelada"]).optional(),
      dataInicioReal: z.string().optional(),
      dataFimReal: z.string().optional(),
      custoRealTotal: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null; id: number; name: string } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const { id, ...data } = input;
      await db.update(obras).set({
        ...data,
        dataInicioReal: data.dataInicioReal ? new Date(data.dataInicioReal) : undefined,
        dataFimReal: data.dataFimReal ? new Date(data.dataFimReal) : undefined,
      }).where(and(eq(obras.id, id), eq(obras.companyId, companyId)));

      await logAudit({
        companyId,
        userId: saasUser!.id,
        userName: saasUser!.name,
        acao: "obra.update",
        entidade: "obras",
        entidadeId: id,
        dadosDepois: data,
      });

      return { message: "Obra atualizada com sucesso" };
    }),

  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
    const companyId = saasUser?.companyId;
    if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

    const todasObras = await db.select().from(obras).where(eq(obras.companyId, companyId));

    const total = todasObras.length;
    const emAndamento = todasObras.filter(o => o.status === "em_andamento").length;
    const concluidas = todasObras.filter(o => o.status === "concluida").length;
    const planejamento = todasObras.filter(o => o.status === "planejamento").length;

    const receitaTotal = todasObras.reduce((acc, o) => acc + parseFloat(o.receitaContratada || "0"), 0);
    const custoTotal = todasObras.reduce((acc, o) => acc + parseFloat(o.custoRealTotal || "0"), 0);
    const orcamentoTotal = todasObras.reduce((acc, o) => acc + parseFloat(o.orcamentoTotal || "0"), 0);

    return {
      total, emAndamento, concluidas, planejamento,
      receitaTotal, custoTotal, orcamentoTotal,
      margemMedia: receitaTotal > 0 ? ((receitaTotal - custoTotal) / receitaTotal * 100).toFixed(1) : "0",
      obras: todasObras.slice(0, 10),
    };
  }),
});

// ─── CUSTOS ROUTER ────────────────────────────────────────────────────────────
const custosRouter = router({
  listByObra: protectedProcedure
    .input(z.object({
      obraId: z.number(),
      tipo: z.enum(["material", "mao_obra", "equipamento", "subempreiteiro", "indireto", "servico"]).optional(),
      status: z.enum(["pendente", "aprovado", "pago", "cancelado"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const conditions = [
        eq(lancamentosCusto.obraId, input.obraId),
        eq(lancamentosCusto.companyId, companyId),
      ];
      if (input.tipo) conditions.push(eq(lancamentosCusto.tipo, input.tipo));
      if (input.status) conditions.push(eq(lancamentosCusto.status, input.status));

      return db.select().from(lancamentosCusto)
        .where(and(...conditions))
        .orderBy(desc(lancamentosCusto.createdAt))
        .limit(500);
    }),

  create: protectedProcedure
    .input(z.object({
      obraId: z.number(),
      centroCustoId: z.number().optional(),
      tipo: z.enum(["material", "mao_obra", "equipamento", "subempreiteiro", "indireto", "servico"]),
      descricao: z.string().min(1).max(300),
      fornecedor: z.string().optional(),
      quantidade: z.string().default("1"),
      unidade: z.string().default("un"),
      valorUnitario: z.string(),
      dataCompetencia: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null; id: number; name: string } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const qtd = parseFloat(input.quantidade);
      const vUnit = parseFloat(input.valorUnitario);
      const vTotal = (qtd * vUnit).toFixed(2);

      await db.insert(lancamentosCusto).values({
        obraId: input.obraId,
        centroCustoId: input.centroCustoId,
        companyId,
        tipo: input.tipo,
        descricao: input.descricao,
        fornecedor: input.fornecedor,
        quantidade: input.quantidade,
        unidade: input.unidade,
        valorUnitario: input.valorUnitario,
        valorTotal: vTotal,
        dataCompetencia: input.dataCompetencia ? new Date(input.dataCompetencia) : undefined,
        lancadoPorId: saasUser!.id,
        observacoes: input.observacoes,
      });

      // Atualizar custo real total da obra
      const [totais] = await db.select({
        total: sql<string>`SUM(valor_total)`,
      }).from(lancamentosCusto)
        .where(and(
          eq(lancamentosCusto.obraId, input.obraId),
          eq(lancamentosCusto.companyId, companyId),
        ));

      await db.update(obras).set({
        custoRealTotal: totais?.total || "0",
      }).where(eq(obras.id, input.obraId));

      return { message: "Lançamento registrado com sucesso" };
    }),

  aprovar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null; id: number; name: string } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      await db.update(lancamentosCusto)
        .set({ status: "aprovado" })
        .where(and(eq(lancamentosCusto.id, input.id), eq(lancamentosCusto.companyId, companyId)));

      await logAudit({
        companyId,
        userId: saasUser!.id,
        userName: saasUser!.name,
        acao: "lancamento.aprovar",
        entidade: "lancamentos_custo",
        entidadeId: input.id,
      });

      return { message: "Lançamento aprovado" };
    }),

  resumoPorObra: protectedProcedure
    .input(z.object({ obraId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const lancamentos = await db.select().from(lancamentosCusto)
        .where(and(
          eq(lancamentosCusto.obraId, input.obraId),
          eq(lancamentosCusto.companyId, companyId),
        ));

      const porTipo: Record<string, number> = {};
      let totalGeral = 0;
      for (const l of lancamentos) {
        const v = parseFloat(l.valorTotal || "0");
        porTipo[l.tipo] = (porTipo[l.tipo] || 0) + v;
        totalGeral += v;
      }

      const [obra] = await db.select().from(obras).where(eq(obras.id, input.obraId));
      const orcamento = parseFloat(obra?.orcamentoTotal || "0");
      const desvio = orcamento > 0 ? ((totalGeral - orcamento) / orcamento * 100).toFixed(1) : "0";

      return { porTipo, totalGeral, orcamento, desvio, totalLancamentos: lancamentos.length };
    }),
});

// ─── FINANCEIRO ROUTER ────────────────────────────────────────────────────────
const financeiroRouter = router({
  contasPagarList: protectedProcedure
    .input(z.object({
      obraId: z.number().optional(),
      status: z.enum(["pendente", "pago", "vencido", "cancelado"]).optional(),
      vencimentoAte: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const conditions = [eq(contasPagar.companyId, companyId)];
      if (input?.obraId) conditions.push(eq(contasPagar.obraId, input.obraId));
      if (input?.status) conditions.push(eq(contasPagar.status, input.status));

      return db.select().from(contasPagar)
        .where(and(...conditions))
        .orderBy(contasPagar.vencimento)
        .limit(500);
    }),

  contasPagarCreate: protectedProcedure
    .input(z.object({
      obraId: z.number().optional(),
      descricao: z.string().min(1),
      fornecedor: z.string().optional(),
      categoria: z.enum(["material", "servico", "equipamento", "subempreiteiro", "imposto", "outro"]).optional(),
      valor: z.string(),
      vencimento: z.string(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null; id: number } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      await db.insert(contasPagar).values({
        companyId,
        obraId: input.obraId,
        descricao: input.descricao,
        fornecedor: input.fornecedor,
        categoria: input.categoria,
        valor: input.valor,
        vencimento: new Date(input.vencimento),
        lancadoPorId: saasUser!.id,
        observacoes: input.observacoes,
      });

      return { message: "Conta a pagar registrada" };
    }),

  contasPagarPagar: protectedProcedure
    .input(z.object({ id: z.number(), dataPagamento: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      await db.update(contasPagar).set({
        status: "pago",
        dataPagamento: input.dataPagamento ? new Date(input.dataPagamento) : new Date(),
      }).where(and(eq(contasPagar.id, input.id), eq(contasPagar.companyId, companyId)));

      return { message: "Conta marcada como paga" };
    }),

  contasReceberList: protectedProcedure
    .input(z.object({
      obraId: z.number().optional(),
      status: z.enum(["pendente", "recebido", "vencido", "cancelado"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const conditions = [eq(contasReceber.companyId, companyId)];
      if (input?.obraId) conditions.push(eq(contasReceber.obraId, input.obraId));
      if (input?.status) conditions.push(eq(contasReceber.status, input.status));

      return db.select().from(contasReceber)
        .where(and(...conditions))
        .orderBy(contasReceber.vencimento)
        .limit(500);
    }),

  contasReceberCreate: protectedProcedure
    .input(z.object({
      obraId: z.number().optional(),
      descricao: z.string().min(1),
      numeroMedicao: z.string().optional(),
      valor: z.string(),
      vencimento: z.string(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null; id: number } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      await db.insert(contasReceber).values({
        companyId,
        obraId: input.obraId,
        descricao: input.descricao,
        numeroMedicao: input.numeroMedicao,
        valor: input.valor,
        vencimento: new Date(input.vencimento),
        lancadoPorId: saasUser!.id,
        observacoes: input.observacoes,
      });

      return { message: "Conta a receber registrada" };
    }),

  fluxoCaixa: protectedProcedure
    .input(z.object({
      obraId: z.number().optional(),
      periodo: z.string().optional(), // YYYY-MM
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const pagar = await db.select().from(contasPagar)
        .where(eq(contasPagar.companyId, companyId));
      const receber = await db.select().from(contasReceber)
        .where(eq(contasReceber.companyId, companyId));

      const totalPagar = pagar.filter(c => c.status === "pendente")
        .reduce((acc, c) => acc + parseFloat(c.valor || "0"), 0);
      const totalReceber = receber.filter(c => c.status === "pendente")
        .reduce((acc, c) => acc + parseFloat(c.valor || "0"), 0);
      const totalPago = pagar.filter(c => c.status === "pago")
        .reduce((acc, c) => acc + parseFloat(c.valor || "0"), 0);
      const totalRecebido = receber.filter(c => c.status === "recebido")
        .reduce((acc, c) => acc + parseFloat(c.valor || "0"), 0);

      const vencidos = pagar.filter(c => {
        if (c.status !== "pendente") return false;
        return new Date(c.vencimento) < new Date();
      }).length;

      return {
        totalPagar, totalReceber, totalPago, totalRecebido,
        saldoPrevisto: totalReceber - totalPagar,
        saldoRealizado: totalRecebido - totalPago,
        contasVencidas: vencidos,
      };
    }),
});

// ─── MÃO DE OBRA ROUTER ───────────────────────────────────────────────────────
const maoDeObraRouter = router({
  list: protectedProcedure
    .input(z.object({ obraId: z.number().optional(), ativo: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const conditions = [eq(maoDeObra.companyId, companyId)];
      if (input?.obraId) conditions.push(eq(maoDeObra.obraId, input.obraId));
      if (input?.ativo !== undefined) conditions.push(eq(maoDeObra.ativo, input.ativo));

      return db.select().from(maoDeObra).where(and(...conditions)).orderBy(maoDeObra.nome);
    }),

  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1).max(150),
      cpf: z.string().optional(),
      tipo: z.enum(["funcionario", "terceiro", "empreiteiro"]).default("funcionario"),
      funcao: z.string().optional(),
      custoDiario: z.string().optional(),
      custoHora: z.string().optional(),
      obraId: z.number().optional(),
      dataAdmissao: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      await db.insert(maoDeObra).values({
        companyId,
        nome: input.nome,
        cpf: input.cpf,
        tipo: input.tipo,
        funcao: input.funcao,
        custoDiario: input.custoDiario,
        custoHora: input.custoHora,
        obraId: input.obraId,
        dataAdmissao: input.dataAdmissao ? new Date(input.dataAdmissao) : undefined,
      });

      return { message: "Colaborador cadastrado com sucesso" };
    }),

  registrarPonto: protectedProcedure
    .input(z.object({
      maoDeObraId: z.number(),
      obraId: z.number(),
      data: z.string(),
      entrada: z.string().optional(),
      saida: z.string().optional(),
      observacao: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null; id: number } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      // Calcular horas trabalhadas
      let horasTrabalhadas: string | undefined;
      let custoCalculado: string | undefined;

      if (input.entrada && input.saida) {
        const [hE, mE] = input.entrada.split(":").map(Number);
        const [hS, mS] = input.saida.split(":").map(Number);
        const minutos = (hS * 60 + mS) - (hE * 60 + mE);
        horasTrabalhadas = (minutos / 60).toFixed(2);

        // Buscar custo/hora do colaborador
        const [colaborador] = await db.select().from(maoDeObra)
          .where(eq(maoDeObra.id, input.maoDeObraId));
        if (colaborador?.custoHora) {
          custoCalculado = (parseFloat(horasTrabalhadas) * parseFloat(colaborador.custoHora)).toFixed(2);
        }
      }

      await db.insert(registrosPonto).values({
        maoDeObraId: input.maoDeObraId,
        obraId: input.obraId,
        companyId,
        data: new Date(input.data),
        entrada: input.entrada,
        saida: input.saida,
        horasTrabalhadas,
        custoCalculado,
        observacao: input.observacao,
        registradoPorId: saasUser!.id,
      });

      return { message: "Ponto registrado com sucesso", horasTrabalhadas, custoCalculado };
    }),

  listPonto: protectedProcedure
    .input(z.object({
      obraId: z.number(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const conditions = [
        eq(registrosPonto.obraId, input.obraId),
        eq(registrosPonto.companyId, companyId),
      ];

      return db.select().from(registrosPonto)
        .where(and(...conditions))
        .orderBy(desc(registrosPonto.data))
        .limit(500);
    }),
});

// ─── NF-e ROUTER ──────────────────────────────────────────────────────────────
const nfeRouter = router({
  list: protectedProcedure
    .input(z.object({ obraId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const conditions = [eq(notasFiscais.companyId, companyId)];
      if (input?.obraId) conditions.push(eq(notasFiscais.obraId, input.obraId));

      return db.select().from(notasFiscais)
        .where(and(...conditions))
        .orderBy(desc(notasFiscais.createdAt))
        .limit(500);
    }),

  importar: protectedProcedure
    .input(z.object({
      obraId: z.number().optional(),
      tipo: z.enum(["nfe", "nfse", "nfce"]).default("nfe"),
      numero: z.string().optional(),
      serie: z.string().optional(),
      chaveAcesso: z.string().optional(),
      dataEmissao: z.string().optional(),
      emitenteCnpj: z.string().optional(),
      emitenteNome: z.string().optional(),
      valorTotal: z.string().optional(),
      xmlUrl: z.string().optional(),
      pdfUrl: z.string().optional(),
      // Itens para classificação por IA
      itensTexto: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null; id: number } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      // Classificar itens por IA se houver texto
      let itensClassificados = null;
      let classificadoPorIA = false;

      if (input.itensTexto) {
        try {
          const resp = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `Você é um especialista em classificação de itens de NF-e para obras de proteção contra incêndio. 
Classifique cada item nos tipos: material, mao_obra, equipamento, subempreiteiro, indireto, servico.
Retorne JSON com array de objetos: [{descricao, quantidade, valorUnitario, valorTotal, tipo, confianca}]`,
              },
              {
                role: "user",
                content: `Classifique os itens desta NF-e:\n${input.itensTexto}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "nfe_itens",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    itens: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          descricao: { type: "string" },
                          tipo: { type: "string" },
                          confianca: { type: "number" },
                        },
                        required: ["descricao", "tipo", "confianca"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["itens"],
                  additionalProperties: false,
                },
              },
            },
          });

          const rawContent = resp.choices?.[0]?.message?.content;
          const content = typeof rawContent === "string" ? rawContent : null;
          if (content) {
            const parsed = JSON.parse(content);
            itensClassificados = parsed.itens;
            classificadoPorIA = true;
          }
        } catch {
          // IA falhou — continua sem classificação
        }
      }

      const [result] = await db.insert(notasFiscais).values({
        companyId,
        obraId: input.obraId,
        tipo: input.tipo,
        numero: input.numero,
        serie: input.serie,
        chaveAcesso: input.chaveAcesso,
        dataEmissao: input.dataEmissao ? new Date(input.dataEmissao) : undefined,
        emitenteCnpj: input.emitenteCnpj,
        emitenteNome: input.emitenteNome,
        valorTotal: input.valorTotal,
        xmlUrl: input.xmlUrl,
        pdfUrl: input.pdfUrl,
        itensClassificados: itensClassificados as Record<string, unknown>[] | null,
        classificadoPorIA,
        status: classificadoPorIA ? "classificada" : "importada",
        importadaPorId: saasUser!.id,
      });

      return {
        id: (result as { insertId: number }).insertId,
        classificadoPorIA,
        itensClassificados,
        message: classificadoPorIA
          ? "NF-e importada e classificada por IA com sucesso"
          : "NF-e importada com sucesso",
      };
    }),

  vincularObra: protectedProcedure
    .input(z.object({ id: z.number(), obraId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      await db.update(notasFiscais).set({
        obraId: input.obraId,
        status: "vinculada",
      }).where(and(eq(notasFiscais.id, input.id), eq(notasFiscais.companyId, companyId)));

      return { message: "NF-e vinculada à obra com sucesso" };
    }),
});

// ─── DRE ROUTER ───────────────────────────────────────────────────────────────
const dreRouter = router({
  gerarPorObra: protectedProcedure
    .input(z.object({ obraId: z.number(), periodo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null; id: number } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      // Buscar lançamentos do período
      const lancamentos = await db.select().from(lancamentosCusto)
        .where(and(
          eq(lancamentosCusto.obraId, input.obraId),
          eq(lancamentosCusto.companyId, companyId),
        ));

      const custos: Record<string, number> = {
        material: 0, mao_obra: 0, equipamento: 0,
        subempreiteiro: 0, indireto: 0, servico: 0,
      };

      for (const l of lancamentos) {
        custos[l.tipo] = (custos[l.tipo] || 0) + parseFloat(l.valorTotal || "0");
      }

      const custoTotal = Object.values(custos).reduce((a, b) => a + b, 0);

      // Buscar receita da obra
      const [obra] = await db.select().from(obras).where(eq(obras.id, input.obraId));
      const receitaBruta = parseFloat(obra?.receitaContratada || "0");
      const receitaLiquida = receitaBruta * 0.85; // Dedução estimada de impostos 15%
      const lucroBruto = receitaLiquida - custoTotal;
      const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida * 100) : 0;

      // Upsert DRE
      const existing = await db.select().from(dreObra)
        .where(and(eq(dreObra.obraId, input.obraId), eq(dreObra.periodo, input.periodo)));

      const dreData = {
        obraId: input.obraId,
        companyId,
        periodo: input.periodo,
        receitaBruta: receitaBruta.toFixed(2),
        deducoes: (receitaBruta * 0.15).toFixed(2),
        receitaLiquida: receitaLiquida.toFixed(2),
        custoMaterial: custos.material.toFixed(2),
        custoMaoObra: custos.mao_obra.toFixed(2),
        custoEquipamento: custos.equipamento.toFixed(2),
        custoSubempreiteiro: custos.subempreiteiro.toFixed(2),
        custoIndireto: custos.indireto.toFixed(2),
        custoTotal: custoTotal.toFixed(2),
        lucroBruto: lucroBruto.toFixed(2),
        margemBruta: margemBruta.toFixed(2),
        geradoPorId: saasUser!.id,
      };

      if (existing.length > 0) {
        await db.update(dreObra).set(dreData).where(eq(dreObra.id, existing[0].id));
      } else {
        await db.insert(dreObra).values(dreData);
      }

      return { ...dreData, message: "DRE gerado com sucesso" };
    }),

  list: protectedProcedure
    .input(z.object({ obraId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      return db.select().from(dreObra)
        .where(and(eq(dreObra.obraId, input.obraId), eq(dreObra.companyId, companyId)))
        .orderBy(desc(dreObra.periodo));
    }),
});

// ─── AUDIT ROUTER ─────────────────────────────────────────────────────────────
const auditRouter = router({
  list: protectedProcedure
    .input(z.object({
      entidade: z.string().optional(),
      entidadeId: z.number().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const saasUser = (ctx as { saasUser?: { companyId: number | null } }).saasUser;
      const companyId = saasUser?.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN" });

      const conditions = [eq(auditLog.companyId, companyId)];
      if (input?.entidade) conditions.push(eq(auditLog.entidade, input.entidade));
      if (input?.entidadeId) conditions.push(eq(auditLog.entidadeId, input.entidadeId));

      return db.select().from(auditLog)
        .where(and(...conditions))
        .orderBy(desc(auditLog.createdAt))
        .limit(input?.limit || 50);
    }),
});

// ─── EXPORT ENTERPRISE ROUTER ─────────────────────────────────────────────────
export const enterpriseRouter = router({
  obras: obrasRouter,
  custos: custosRouter,
  financeiro: financeiroRouter,
  maoDeObra: maoDeObraRouter,
  nfe: nfeRouter,
  dre: dreRouter,
  audit: auditRouter,
});

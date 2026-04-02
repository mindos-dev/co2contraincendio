/**
 * OPERIS Field Router — Módulo Mobile de Vistorias de Campo
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "co2-saas-secret-2025";

const saasAuthProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const token = ctx.req.cookies?.saas_token;
  if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Token não fornecido." });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string; companyId: number | null };
    return next({ ctx: { ...ctx, saasUser: payload } });
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Token inválido." });
  }
});
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import {
  createFieldInspection,
  getFieldInspectionById,
  listFieldInspections,
  updateFieldInspectionStatus,
  saveChecklistAnswersBatch,
  getChecklistAnswers,
  createInspectionImage,
  getInspectionImages,
  createFieldReport,
  updateFieldReport,
  getFieldReport,
  listFieldReports,
  syncOfflineInspection,
} from "./field-db";

// ─── Checklists por tipo ──────────────────────────────────────────────────────

const CHECKLISTS: Record<string, Array<{ key: string; text: string }>> = {
  incendio: [
    { key: "extintor_carga", text: "Extintor com carga dentro do prazo de validade?" },
    { key: "extintor_lacre", text: "Lacre e pino de segurança do extintor intactos?" },
    { key: "extintor_sinalizacao", text: "Sinalização do extintor visível e correta?" },
    { key: "extintor_acesso", text: "Extintor acessível (sem obstáculos no raio de 1m)?" },
    { key: "extintor_suporte", text: "Suporte/gancho do extintor em bom estado?" },
    { key: "hidrante_mangueira", text: "Mangueira do hidrante sem rasgos ou dobras?" },
    { key: "hidrante_registro", text: "Registro do hidrante operacional (abre/fecha)?" },
    { key: "hidrante_sinalizacao", text: "Caixa do hidrante sinalizada e desobstruída?" },
    { key: "alarme_central", text: "Central de alarme energizada e sem falhas?" },
    { key: "alarme_detector", text: "Detectores de fumaça/calor sem danos físicos?" },
    { key: "alarme_sirene", text: "Sirene de alarme funcional (teste de som)?" },
    { key: "saida_emergencia", text: "Saídas de emergência desobstruídas e sinalizadas?" },
    { key: "iluminacao_emergencia", text: "Iluminação de emergência funcionando?" },
    { key: "planta_fuga", text: "Planta de fuga afixada e atualizada?" },
    { key: "brigada_treinada", text: "Brigada de incêndio com treinamento em dia?" },
  ],
  pmoc: [
    { key: "filtro_ar", text: "Filtros de ar limpos e sem obstrução?" },
    { key: "serpentina_evaporadora", text: "Serpentina evaporadora sem incrustações?" },
    { key: "serpentina_condensadora", text: "Serpentina condensadora sem sujeira?" },
    { key: "dreno_condensado", text: "Dreno de condensado limpo e desobstruído?" },
    { key: "bandeja_condensado", text: "Bandeja de condensado sem acúmulo de água?" },
    { key: "correia_ventilador", text: "Correia do ventilador sem desgaste excessivo?" },
    { key: "nivel_gas", text: "Nível de gás refrigerante adequado?" },
    { key: "temperatura_operacao", text: "Temperatura de operação dentro do especificado?" },
    { key: "ruido_vibracao", text: "Ausência de ruídos ou vibrações anormais?" },
    { key: "quadro_eletrico", text: "Quadro elétrico sem sinais de aquecimento?" },
    { key: "termostato", text: "Termostato calibrado e funcionando corretamente?" },
    { key: "limpeza_geral", text: "Limpeza geral do equipamento realizada?" },
  ],
  eletrica: [
    { key: "qdf_identificacao", text: "QDF com identificação de todos os circuitos?" },
    { key: "qdf_disjuntores", text: "Disjuntores sem sinais de queima ou aquecimento?" },
    { key: "qdf_aterramento", text: "Aterramento do QDF medido e dentro do padrão?" },
    { key: "cabos_isolamento", text: "Cabos com isolamento íntegro (sem fissuras)?" },
    { key: "tomadas_estado", text: "Tomadas e interruptores sem danos físicos?" },
    { key: "dps_instalado", text: "DPS (Dispositivo de Proteção contra Surtos) instalado?" },
    { key: "dr_funcionamento", text: "DR (Dispositivo Residual) testado e funcional?" },
    { key: "luminarias_estado", text: "Luminárias sem lâmpadas queimadas ou piscando?" },
    { key: "nobreak_bateria", text: "No-break com bateria em bom estado (se aplicável)?" },
    { key: "medicao_tensao", text: "Tensão de alimentação dentro do especificado?" },
  ],
  outros: [
    { key: "item_1", text: "Condições gerais do ambiente inspecionado?" },
    { key: "item_2", text: "Equipamentos de segurança presentes e funcionais?" },
    { key: "item_3", text: "Documentação técnica disponível e atualizada?" },
    { key: "item_4", text: "Sinalização de segurança adequada?" },
    { key: "item_5", text: "Condições de higiene e limpeza satisfatórias?" },
  ],
};

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

// ─── Field Router ─────────────────────────────────────────────────────────────

export const fieldRouter = router({

  getChecklist: saasAuthProcedure
    .input(z.object({ type: z.enum(["pmoc", "incendio", "eletrica", "outros"]) }))
    .query(({ input }) => CHECKLISTS[input.type] ?? CHECKLISTS.outros),

  createInspection: saasAuthProcedure
    .input(z.object({
      type: z.enum(["pmoc", "incendio", "eletrica", "outros"]),
      title: z.string().min(2).max(200),
      companyId: z.number().optional(),
      location: z.string().max(300).optional(),
      notes: z.string().max(2000).optional(),
      offlineId: z.string().max(64).optional(),
    }))
    .mutation(async ({ input }) => {
      return createFieldInspection({
        type: input.type,
        title: input.title,
        companyId: input.companyId ?? null,
        location: input.location ?? null,
        notes: input.notes ?? null,
        offlineId: input.offlineId ?? null,
        status: "em_andamento",
      });
    }),

  listInspections: saasAuthProcedure
    .input(z.object({
      companyId: z.number().optional(),
      status: z.enum(["rascunho", "em_andamento", "concluida", "cancelada"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => listFieldInspections(input)),

  getInspection: saasAuthProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const row = await getFieldInspectionById(input.id);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Vistoria não encontrada." });
      return row;
    }),

  saveChecklistAnswers: saasAuthProcedure
    .input(z.object({
      inspectionId: z.number(),
      answers: z.array(z.object({
        questionKey: z.string(),
        questionText: z.string(),
        answer: z.enum(["conforme", "nao_conforme", "nao_aplicavel", "pendente"]),
        observation: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      return saveChecklistAnswersBatch(
        input.inspectionId,
        input.answers.map(a => ({
          inspectionId: input.inspectionId,
          questionKey: a.questionKey,
          questionText: a.questionText,
          answer: a.answer,
          observation: a.observation ?? null,
        }))
      );
    }),

  getChecklistAnswers: saasAuthProcedure
    .input(z.object({ inspectionId: z.number() }))
    .query(async ({ input }) => getChecklistAnswers(input.inspectionId)),

  uploadImage: saasAuthProcedure
    .input(z.object({
      inspectionId: z.number(),
      base64: z.string().max(10_000_000),
      mimeType: z.string().default("image/jpeg"),
      caption: z.string().max(200).optional(),
    }))
    .mutation(async ({ input }) => {
      const ext = input.mimeType.split("/")[1] || "jpg";
      const key = `field-inspections/${input.inspectionId}/img-${Date.now()}-${randomSuffix()}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");
      const { url } = await storagePut(key, buffer, input.mimeType);
      const { id } = await createInspectionImage({
        inspectionId: input.inspectionId,
        url,
        fileKey: key,
        caption: input.caption ?? null,
        mimeType: input.mimeType,
        sizeBytes: buffer.length,
      });
      return { id, url, key };
    }),

  getImages: saasAuthProcedure
    .input(z.object({ inspectionId: z.number() }))
    .query(async ({ input }) => getInspectionImages(input.inspectionId)),

  generateReport: saasAuthProcedure
    .input(z.object({
      inspectionId: z.number(),
      companyName: z.string().optional(),
      technicianName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const inspection = await getFieldInspectionById(input.inspectionId);
      if (!inspection) throw new TRPCError({ code: "NOT_FOUND", message: "Vistoria não encontrada." });

      const answers = await getChecklistAnswers(input.inspectionId);
      const images = await getInspectionImages(input.inspectionId);

      const { id: reportId } = await createFieldReport({
        inspectionId: input.inspectionId,
        companyId: inspection.companyId,
        type: inspection.type,
        status: "gerando",
      });

      const conformes = answers.filter(a => a.answer === "conforme").length;
      const naoConformes = answers.filter(a => a.answer === "nao_conforme").length;
      const naoAplicaveis = answers.filter(a => a.answer === "nao_aplicavel").length;
      const total = answers.length;
      const pct = total > 0 ? Math.round((conformes / Math.max(1, total - naoAplicaveis)) * 100) : 0;

      const tipoLabel: Record<string, string> = {
        incendio: "Vistoria de Sistemas de Combate a Incêndio",
        pmoc: "PMOC — Plano de Manutenção, Operação e Controle",
        eletrica: "Vistoria de Instalações Elétricas",
        outros: "Vistoria Técnica Geral",
      };

      const checklistSummary = answers
        .map(a => `- ${a.questionText}: **${a.answer.replace(/_/g, " ")}**${a.observation ? ` (${a.observation})` : ""}`)
        .join("\n");

      const prompt = `Você é um engenheiro de segurança sênior. Gere um laudo técnico profissional em HTML para:

**Tipo:** ${tipoLabel[inspection.type] ?? inspection.type}
**Cliente:** ${input.companyName || "Não informado"}
**Técnico:** ${input.technicianName || "Técnico OPERIS"}
**Local:** ${inspection.location || "Não informado"}
**Data:** ${new Date().toLocaleDateString("pt-BR")}
**Observações:** ${inspection.notes || "Nenhuma"}

**Resultado do Checklist:**
- Total: ${total} | Conformes: ${conformes} | Não conformes: ${naoConformes} | N/A: ${naoAplicaveis}
- Índice de conformidade: ${pct}%

**Detalhamento:**
${checklistSummary}

**Imagens registradas:** ${images.length} foto(s)

Gere um laudo HTML profissional com: cabeçalho CO2 Contra Incêndio, identificação da vistoria, resumo executivo, tabela de checklist, análise de não conformidades, recomendações técnicas, conclusão com índice de conformidade e rodapé com assinatura. Use CSS inline. Paleta: #0a1628 (azul), #C8102E (vermelho), branco. Fonte Arial. Formato A4.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um engenheiro de segurança sênior especializado em laudos técnicos. Gere laudos profissionais em HTML com CSS inline." },
            { role: "user", content: prompt },
          ],
        });

        const rawContent = response.choices?.[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : "<p>Erro ao gerar laudo.</p>";
        await updateFieldReport(reportId, { content, status: "pronto", generatedAt: new Date() });
        await updateFieldInspectionStatus(input.inspectionId, "concluida");
        return { reportId, content, status: "pronto" };
      } catch {
        await updateFieldReport(reportId, { status: "erro" });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao gerar laudo via IA." });
      }
    }),

  getReport: saasAuthProcedure
    .input(z.object({
      reportId: z.number().optional(),
      inspectionId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      if (!input.reportId && !input.inspectionId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Informe reportId ou inspectionId." });
      }
      return getFieldReport({ reportId: input.reportId, inspectionId: input.inspectionId });
    }),

  listReports: saasAuthProcedure
    .input(z.object({
      companyId: z.number().optional(),
      type: z.enum(["pmoc", "incendio", "eletrica", "outros"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => listFieldReports(input)),

  syncOffline: saasAuthProcedure
    .input(z.object({
      inspections: z.array(z.object({
        offlineId: z.string(),
        type: z.enum(["pmoc", "incendio", "eletrica", "outros"]),
        title: z.string(),
        location: z.string().optional(),
        notes: z.string().optional(),
        companyId: z.number().optional(),
        answers: z.array(z.object({
          questionKey: z.string(),
          questionText: z.string(),
          answer: z.enum(["conforme", "nao_conforme", "nao_aplicavel", "pendente"]),
          observation: z.string().optional(),
        })).optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const synced: number[] = [];
      for (const item of input.inspections) {
        const { id } = await syncOfflineInspection({
          offlineId: item.offlineId,
          type: item.type,
          title: item.title,
          location: item.location,
          notes: item.notes,
          companyId: item.companyId,
        });
        if (item.answers && item.answers.length > 0) {
          await saveChecklistAnswersBatch(id, item.answers.map(a => ({
            inspectionId: id,
            questionKey: a.questionKey,
            questionText: a.questionText,
            answer: a.answer,
            observation: a.observation ?? null,
          })));
        }
        synced.push(id);
      }
      return { synced, count: synced.length };
    }),
});

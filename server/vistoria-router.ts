import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { saasAuthProcedure } from "./saas-routers";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  propertyInspections,
  inspectionRooms,
  roomItems,
} from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { createHash } from "crypto";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

// Itens padrão por tipo de cômodo
const DEFAULT_ITEMS: Record<string, Array<{ name: string; category: string }>> = {
  sala: [
    { name: "Piso", category: "piso" },
    { name: "Parede", category: "parede" },
    { name: "Teto", category: "teto" },
    { name: "Porta", category: "porta" },
    { name: "Janela", category: "janela" },
    { name: "Tomadas e Interruptores", category: "eletrico" },
    { name: "Iluminação", category: "eletrico" },
  ],
  quarto: [
    { name: "Piso", category: "piso" },
    { name: "Parede", category: "parede" },
    { name: "Teto", category: "teto" },
    { name: "Porta", category: "porta" },
    { name: "Janela", category: "janela" },
    { name: "Armário Embutido", category: "movel" },
    { name: "Tomadas e Interruptores", category: "eletrico" },
  ],
  cozinha: [
    { name: "Piso", category: "piso" },
    { name: "Parede / Azulejo", category: "parede" },
    { name: "Teto", category: "teto" },
    { name: "Porta", category: "porta" },
    { name: "Janela", category: "janela" },
    { name: "Pia / Cuba", category: "hidraulico" },
    { name: "Torneira", category: "hidraulico" },
    { name: "Armários", category: "movel" },
    { name: "Tomadas e Interruptores", category: "eletrico" },
  ],
  banheiro: [
    { name: "Piso", category: "piso" },
    { name: "Parede / Azulejo", category: "parede" },
    { name: "Teto", category: "teto" },
    { name: "Porta", category: "porta" },
    { name: "Vaso Sanitário", category: "hidraulico" },
    { name: "Pia / Cuba", category: "hidraulico" },
    { name: "Torneira", category: "hidraulico" },
    { name: "Chuveiro / Box", category: "hidraulico" },
    { name: "Espelho", category: "outro" },
    { name: "Tomadas e Interruptores", category: "eletrico" },
  ],
  area_servico: [
    { name: "Piso", category: "piso" },
    { name: "Parede", category: "parede" },
    { name: "Teto", category: "teto" },
    { name: "Porta", category: "porta" },
    { name: "Tanque / Pia", category: "hidraulico" },
    { name: "Torneira", category: "hidraulico" },
    { name: "Tomadas e Interruptores", category: "eletrico" },
  ],
  garagem: [
    { name: "Piso", category: "piso" },
    { name: "Parede", category: "parede" },
    { name: "Portão", category: "porta" },
    { name: "Iluminação", category: "eletrico" },
  ],
  varanda: [
    { name: "Piso", category: "piso" },
    { name: "Parede / Gradil", category: "parede" },
    { name: "Teto", category: "teto" },
    { name: "Porta", category: "porta" },
    { name: "Iluminação", category: "eletrico" },
  ],
  outro: [
    { name: "Piso", category: "piso" },
    { name: "Parede", category: "parede" },
    { name: "Teto", category: "teto" },
    { name: "Porta", category: "porta" },
    { name: "Iluminação", category: "eletrico" },
  ],
};

// ─── Router ───────────────────────────────────────────────────────────────────

export const vistoriaRouter = router({
  // Listar vistorias da empresa
  list: saasAuthProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      if (!db) return [];
      const offset = (input.page - 1) * input.limit;
      const companyId = ctx.saasUser.companyId;
      if (!companyId) return [];
      const rows = await db
        .select()
        .from(propertyInspections)
        .where(eq(propertyInspections.companyId, companyId))
        .orderBy(desc(propertyInspections.createdAt))
        .limit(input.limit)
        .offset(offset);
      return rows;
    }),

  // Obter vistoria completa com cômodos e itens
  get: saasAuthProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [inspection] = await db
        .select()
        .from(propertyInspections)
        .where(
          and(
            eq(propertyInspections.id, input.id),
            eq(propertyInspections.companyId, (ctx.saasUser.companyId ?? 0))
          )
        );
      if (!inspection) throw new Error("Vistoria não encontrada");

      const rooms = await db
        .select()
        .from(inspectionRooms)
        .where(eq(inspectionRooms.inspectionId, input.id))
        .orderBy(inspectionRooms.order);

      const items = await db
        .select()
        .from(roomItems)
        .where(eq(roomItems.inspectionId, input.id))
        .orderBy(roomItems.order);

      return { inspection, rooms, items };
    }),

  // Criar nova vistoria
  create: saasAuthProcedure
    .input(
      z.object({
        type: z.enum(["entrada", "saida", "periodica", "devolucao"]),
        propertyAddress: z.string().min(5),
        propertyType: z.enum(["apartamento", "casa", "sala_comercial", "galpao", "outro"]),
        propertyArea: z.string().optional(),
        propertyRegistration: z.string().optional(),
        landlordName: z.string().min(2),
        landlordCpfCnpj: z.string().optional(),
        landlordPhone: z.string().optional(),
        landlordEmail: z.string().optional(),
        tenantName: z.string().min(2),
        tenantCpfCnpj: z.string().optional(),
        tenantPhone: z.string().optional(),
        tenantEmail: z.string().optional(),
        contractNumber: z.string().optional(),
        contractStartDate: z.string().optional(),
        contractEndDate: z.string().optional(),
        rentValue: z.string().optional(),
        inspectorName: z.string().optional(),
        inspectorCrea: z.string().optional(),
        inspectorCompany: z.string().optional(),
        generalNotes: z.string().optional(),
        // Cômodos iniciais
        rooms: z.array(z.object({
          name: z.string(),
          type: z.enum(["sala", "quarto", "cozinha", "banheiro", "area_servico", "garagem", "varanda", "corredor", "outro"]),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário não está vinculado a nenhuma empresa. Contate o administrador." });
      const { rooms: roomsInput, ...inspectionData } = input;

      const [result] = await db.insert(propertyInspections).values({
        ...inspectionData,
        companyId,
        createdByUserId: ctx.saasUser.userId,
        contractStartDate: inspectionData.contractStartDate ? new Date(inspectionData.contractStartDate) : undefined,
        contractEndDate: inspectionData.contractEndDate ? new Date(inspectionData.contractEndDate) : undefined,
        status: "em_andamento",
      });

      const inspectionId = (result as any).insertId as number;

      // Criar cômodos com itens padrão
      if (roomsInput && roomsInput.length > 0) {
        for (let i = 0; i < roomsInput.length; i++) {
          const room = roomsInput[i];
          const [roomResult] = await db.insert(inspectionRooms).values({
            inspectionId,
            name: room.name,
            type: room.type,
            order: i,
          });
          const roomId = (roomResult as any).insertId as number;

          // Adicionar itens padrão do tipo de cômodo
          const defaultItems = DEFAULT_ITEMS[room.type] || DEFAULT_ITEMS.outro;
          for (let j = 0; j < defaultItems.length; j++) {
            await db.insert(roomItems).values({
              roomId,
              inspectionId,
              name: defaultItems[j].name,
              category: defaultItems[j].category as any,
              condition: "bom",
              order: j,
            });
          }
        }
      }

      return { id: inspectionId };
    }),

  // Adicionar cômodo
  addRoom: saasAuthProcedure
    .input(z.object({
      inspectionId: z.number(),
      name: z.string(),
      type: z.enum(["sala", "quarto", "cozinha", "banheiro", "area_servico", "garagem", "varanda", "corredor", "outro"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Verificar que a vistoria pertence à empresa
      const [inspection] = await db
        .select()
        .from(propertyInspections)
        .where(and(
          eq(propertyInspections.id, input.inspectionId),
          eq(propertyInspections.companyId, (ctx.saasUser.companyId ?? 0))
        ));
      if (!inspection) throw new Error("Vistoria não encontrada");

      const existingRooms = await db
        .select()
        .from(inspectionRooms)
        .where(eq(inspectionRooms.inspectionId, input.inspectionId));

      const [roomResult] = await db.insert(inspectionRooms).values({
        inspectionId: input.inspectionId,
        name: input.name,
        type: input.type,
        order: existingRooms.length,
      });
      const roomId = (roomResult as any).insertId as number;

      // Adicionar itens padrão
      const defaultItems = DEFAULT_ITEMS[input.type] || DEFAULT_ITEMS.outro;
      for (let j = 0; j < defaultItems.length; j++) {
        await db.insert(roomItems).values({
          roomId,
          inspectionId: input.inspectionId,
          name: defaultItems[j].name,
          category: defaultItems[j].category as any,
          condition: "bom",
          order: j,
        });
      }

      return { roomId };
    }),

  // Atualizar item de cômodo
  updateItem: saasAuthProcedure
    .input(z.object({
      itemId: z.number(),
      condition: z.enum(["otimo", "bom", "regular", "ruim", "pessimo", "inexistente"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(roomItems)
        .set({
          condition: input.condition,
          notes: input.notes,
        })
        .where(eq(roomItems.id, input.itemId));
      return { ok: true };
    }),

  // Upload de foto por item
  uploadItemPhoto: saasAuthProcedure
    .input(z.object({
      itemId: z.number(),
      photoBase64: z.string(),
      mimeType: z.string().default("image/jpeg"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const buffer = Buffer.from(input.photoBase64.replace(/^data:[^;]+;base64,/, ""), "base64");
      const key = `vistoria-fotos/${input.itemId}-${randomSuffix()}.jpg`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await db.update(roomItems).set({ photoUrl: url }).where(eq(roomItems.id, input.itemId));
      return { url };
    }),

  // Salvar assinatura
  sign: saasAuthProcedure
    .input(z.object({
      inspectionId: z.number(),
      role: z.enum(["landlord", "tenant", "inspector"]),
      signatureBase64: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [inspection] = await db
        .select()
        .from(propertyInspections)
        .where(and(
          eq(propertyInspections.id, input.inspectionId),
          eq(propertyInspections.companyId, (ctx.saasUser.companyId ?? 0))
        ));
      if (!inspection) throw new Error("Vistoria não encontrada");

      const buffer = Buffer.from(input.signatureBase64.replace(/^data:[^;]+;base64,/, ""), "base64");
      const key = `vistoria-assinaturas/${input.inspectionId}-${input.role}-${randomSuffix()}.png`;
      const { url } = await storagePut(key, buffer, "image/png");

      const now = new Date();
      if (input.role === "landlord") {
        await db.update(propertyInspections).set({ landlordSignatureUrl: url, landlordSignedAt: now }).where(eq(propertyInspections.id, input.inspectionId));
      } else if (input.role === "tenant") {
        await db.update(propertyInspections).set({ tenantSignatureUrl: url, tenantSignedAt: now }).where(eq(propertyInspections.id, input.inspectionId));
      } else {
        await db.update(propertyInspections).set({ inspectorSignatureUrl: url, inspectorSignedAt: now }).where(eq(propertyInspections.id, input.inspectionId));
      }

      // Verificar se todas as assinaturas foram coletadas
      const [updated] = await db.select().from(propertyInspections).where(eq(propertyInspections.id, input.inspectionId));
      if (updated.landlordSignatureUrl && updated.tenantSignatureUrl && updated.inspectorSignatureUrl) {
        await db.update(propertyInspections).set({ status: "concluida" }).where(eq(propertyInspections.id, input.inspectionId));
      } else {
        await db.update(propertyInspections).set({ status: "aguardando_assinatura" }).where(eq(propertyInspections.id, input.inspectionId));
      }

      return { url };
    }),

  // Gerar laudo com IA
  generateReport: saasAuthProcedure
    .input(z.object({ inspectionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [inspection] = await db
        .select()
        .from(propertyInspections)
        .where(and(
          eq(propertyInspections.id, input.inspectionId),
          eq(propertyInspections.companyId, (ctx.saasUser.companyId ?? 0))
        ));
      if (!inspection) throw new Error("Vistoria não encontrada");

      const rooms = await db.select().from(inspectionRooms).where(eq(inspectionRooms.inspectionId, input.inspectionId)).orderBy(inspectionRooms.order);
      const items = await db.select().from(roomItems).where(eq(roomItems.inspectionId, input.inspectionId)).orderBy(roomItems.order);

      // Montar sumário dos cômodos para o prompt
      const roomSummary = rooms.map(room => {
        const roomItemsList = items.filter(i => i.roomId === room.id);
        const itemLines = roomItemsList.map(item =>
          `  - ${item.name}: ${item.condition || "não avaliado"}${item.notes ? ` (${item.notes})` : ""}`
        ).join("\n");
        return `${room.name}:\n${itemLines}`;
      }).join("\n\n");

      const tipoVistoria = { entrada: "Entrada", saida: "Saída", periodica: "Periódica", devolucao: "Devolução" }[inspection.type] || inspection.type;

      const prompt = `Você é um vistoriador imobiliário profissional. Gere um laudo técnico completo de vistoria de imóvel em HTML.

DADOS DA VISTORIA:
- Tipo: ${tipoVistoria}
- Imóvel: ${inspection.propertyAddress}
- Tipo de Imóvel: ${inspection.propertyType}
- Data: ${new Date(inspection.inspectedAt).toLocaleDateString("pt-BR")}
- Locador: ${inspection.landlordName} ${inspection.landlordCpfCnpj ? `(CPF/CNPJ: ${inspection.landlordCpfCnpj})` : ""}
- Inquilino: ${inspection.tenantName} ${inspection.tenantCpfCnpj ? `(CPF/CNPJ: ${inspection.tenantCpfCnpj})` : ""}
- Vistoriador: ${inspection.inspectorName || "Não informado"} ${inspection.inspectorCrea ? `(CREA: ${inspection.inspectorCrea})` : ""}
- Contrato: ${inspection.contractNumber || "Não informado"}
- Valor do Aluguel: ${inspection.rentValue || "Não informado"}

ESTADO DOS CÔMODOS:
${roomSummary}

${inspection.generalNotes ? `OBSERVAÇÕES GERAIS: ${inspection.generalNotes}` : ""}

Gere um laudo HTML profissional com:
1. Cabeçalho com dados do imóvel e partes
2. Tabela de estado por cômodo (com cores: verde=ótimo/bom, amarelo=regular, vermelho=ruim/pessimo)
3. Seção de observações gerais
4. Cláusula legal baseada na Lei do Inquilinato 8.245/91 protegendo ambas as partes
5. Espaço para assinaturas (locador, inquilino, vistoriador)
6. Rodapé com data e local

Use CSS inline para garantir compatibilidade. Paleta: #0a1628 (azul escuro), #dc2626 (vermelho), branco.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você é um especialista em laudos imobiliários. Gere HTML profissional e completo." },
          { role: "user", content: prompt },
        ],
      });

      const reportHtml = response.choices[0].message.content as string;
      const slug = `vistoria-${input.inspectionId}-${nanoid(8)}`;

      await db.update(propertyInspections).set({
        reportHtml,
        reportSlug: slug,
        status: "aguardando_assinatura",
      }).where(eq(propertyInspections.id, input.inspectionId));

      return { slug, reportHtml };
    }),

  // Visualizar laudo público (sem autenticação)
  getPublicReport: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [inspection] = await db
        .select()
        .from(propertyInspections)
        .where(eq(propertyInspections.reportSlug, input.slug));
      if (!inspection || !inspection.reportHtml) throw new Error("Laudo não encontrado");
      return {
        reportHtml: inspection.reportHtml,
        propertyAddress: inspection.propertyAddress,
        type: inspection.type,
        landlordName: inspection.landlordName,
        tenantName: inspection.tenantName,
        inspectedAt: inspection.inspectedAt,
        status: inspection.status,
        landlordSignatureUrl: inspection.landlordSignatureUrl,
        tenantSignatureUrl: inspection.tenantSignatureUrl,
        inspectorSignatureUrl: inspection.inspectorSignatureUrl,
      };
    }),

  // Gerar contrato inteligente com cláusulas da Lei 2026
  generateContract: saasAuthProcedure
    .input(z.object({ inspectionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [inspection] = await db
        .select()
        .from(propertyInspections)
        .where(and(
          eq(propertyInspections.id, input.inspectionId),
          eq(propertyInspections.companyId, (ctx.saasUser.companyId ?? 0))
        ));
      if (!inspection) throw new Error("Vistoria não encontrada");

      const garantiaMap: Record<string, string> = {
        seguro_fianca: "Seguro-Fiança",
        caucao: "Caução (Depósito de 3 alugueis)",
        fiador: "Fiador / Avalista",
        sem_garantia: "Sem Garantia",
      };
      const garantiaLabel = garantiaMap[(inspection as any).garantiaType || "seguro_fianca"] || "Seguro-Fiança";

      const redutorSocial = (inspection as any).redutorSocial;
      const clausulaVigencia = (inspection as any).clausulaVigencia;
      const rentNum = parseFloat((inspection.rentValue || "0").replace(/[^0-9,]/g, "").replace(",", ".")) || 0;
      const baseCalculo = redutorSocial ? Math.max(0, rentNum - 600) : rentNum;

      const contractStart = inspection.contractStartDate
        ? new Date(inspection.contractStartDate).toLocaleDateString("pt-BR")
        : "___/___/______";
      const contractEnd = inspection.contractEndDate
        ? new Date(inspection.contractEndDate).toLocaleDateString("pt-BR")
        : "___/___/______";

      const prompt = `Você é um advogado especialista em direito imobiliário brasileiro. Gere um CONTRATO DE LOCAÇÃO completo e juridicamente válido em HTML, conforme a Lei 8.245/91 atualizada pela LC 214/2025 (Reforma Tributária).

DADOS DO CONTRATO:
- Imóvel: ${inspection.propertyAddress}
- Tipo: ${inspection.propertyType}
- Locador: ${inspection.landlordName} ${inspection.landlordCpfCnpj ? `(CPF/CNPJ: ${inspection.landlordCpfCnpj})` : ""}
- Locatário: ${inspection.tenantName} ${inspection.tenantCpfCnpj ? `(CPF/CNPJ: ${inspection.tenantCpfCnpj})` : ""}
- Valor do Aluguel: R$ ${inspection.rentValue || "___"}
- Vigência: ${contractStart} a ${contractEnd}
- Modalidade de Garantia: ${garantiaLabel}
- Número do Contrato: ${inspection.contractNumber || "___"}

CLÁUSULAS OBRIGATÓRIAS (Lei 2026):
${redutorSocial ? `- CLÁUSULA FISCAL: O locador declara que este imóvel residencial se enquadra no Redutor Social de R$ 600,00 previsto na LC 214/2025. A base de cálculo do IBS/CBS sobre o aluguel será de R$ ${baseCalculo.toFixed(2)} (aluguel menos redutor).` : ""}
${clausulaVigencia ? `- CLÁUSULA DE VIGÊNCIA: Este contrato deverá ser averbado na matrícula do imóvel. Em caso de alienação do imóvel, o adquirente deverá respeitar o prazo contratual, conforme art. 8º da Lei 8.245/91.` : ""}
${garantiaLabel === "Sem Garantia" ? `- DESPEJO LIMINAR: Por não haver garantia locaticia, o locador poderá requerer despejo liminar em até 15 dias em caso de inadimplência, conforme alterações da Lei 2026.` : ""}
- CLÁUSULA DE VISTORIA: O laudo de vistoria de entrada (Vistoria OPERIS #${input.inspectionId}) é parte integrante deste contrato.

Gere o contrato completo em HTML com:
1. Cabeçalho formal com dados das partes
2. Cláusulas numeradas (objeto, prazo, valor, reajuste IGPM, garantia, obrigações, rescisão, foro)
3. Cláusulas específicas da Reforma Tributária 2026 conforme acima
4. Espaço para assinaturas de locador, locatário e 2 testemunhas
5. Rodapé com data e local

Use CSS inline. Paleta: branco com bordas cinza, texto preto, cabeçalho azul escuro #0a1628.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você é um advogado especialista em direito imobiliário. Gere contratos HTML completos, formais e juridicamente corretos." },
          { role: "user", content: prompt },
        ],
      });

      const contractHtml = response.choices[0].message.content as string;
      const slug = `contrato-${input.inspectionId}-${nanoid(8)}`;

      return { slug, contractHtml };
    }),

  // Passo 4: Finalizar vistoria — gerar CONT-YYYY-XXXX + audit hash + lock
  finalizeAndGenerateContract: saasAuthProcedure
    .input(z.object({ inspectionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const companyId = ctx.saasUser.companyId;
      if (!companyId) throw new TRPCError({ code: "FORBIDDEN", message: "Usuário não está vinculado a nenhuma empresa." });

      const [inspection] = await db
        .select()
        .from(propertyInspections)
        .where(and(
          eq(propertyInspections.id, input.inspectionId),
          eq(propertyInspections.companyId, companyId)
        ));
      if (!inspection) throw new TRPCError({ code: "NOT_FOUND", message: "Vistoria não encontrada." });
      if (inspection.lockedAt) throw new TRPCError({ code: "FORBIDDEN", message: "Esta vistoria já foi finalizada e não pode ser editada." });

      // Validar campos obrigatórios antes de gerar o contrato
      if (!inspection.landlordName || !inspection.tenantName || !inspection.propertyAddress) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Preencha todos os campos obrigatórios antes de finalizar." });
      }

      // Gerar número sequencial CONT-YYYY-XXXX
      const year = new Date().getFullYear();
      const [countRow] = await db.execute(
        `SELECT COUNT(*) as cnt FROM property_inspections WHERE contractId LIKE 'CONT-${year}-%'`
      ) as any;
      const count = Number((countRow as any)[0]?.cnt ?? 0) + 1;
      const contractId = `CONT-${year}-${String(count).padStart(4, "0")}`;

      // Gerar audit hash SHA-256 do payload
      const payload = JSON.stringify({
        inspectionId: inspection.id,
        contractId,
        landlordName: inspection.landlordName,
        tenantName: inspection.tenantName,
        propertyAddress: inspection.propertyAddress,
        rentValue: inspection.rentValue,
        lockedByUserId: ctx.saasUser.userId,
        lockedAt: new Date().toISOString(),
      });
      const auditHash = createHash("sha256").update(payload).digest("hex");
      const now = new Date();

      await db.update(propertyInspections).set({
        contractId,
        contractNumber: contractId,
        auditHash,
        lockedAt: now,
        lockedByUserId: ctx.saasUser.userId,
        status: "pending_validation",
      }).where(eq(propertyInspections.id, input.inspectionId));

      return { contractId, auditHash, lockedAt: now };
    }),

  // Atualizar status
  updateStatus: saasAuthProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["rascunho", "em_andamento", "aguardando_assinatura", "concluida", "cancelada"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(propertyInspections)
        .set({ status: input.status })
        .where(and(
          eq(propertyInspections.id, input.id),
          eq(propertyInspections.companyId, (ctx.saasUser.companyId ?? 0))
        ));
      return { ok: true };
    }),
});

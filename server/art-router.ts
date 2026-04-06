/**
 * ART OPERIS — Router tRPC
 * Responsabilidade Técnica Digital: cadastro, evidências, antifraude, aprovação, PDF, monetização.
 */
import { createHash, randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router } from "./_core/trpc";
import { saasAuthProcedure, saasAdminProcedure } from "./saas-routers";
import { getSaasUserById, getSubscriptionByCompany } from "./saas-db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import {
  createArtService,
  getArtServiceById,
  getArtServicesByCompany,
  getArtServicesByTechnician,
  getPendingApprovalArts,
  getAllPendingApprovalArts,
  generateArtNumber,
  updateArtService,
  createArtEvidence,
  getEvidencesByArtService,
  lockEvidence,
  updateEvidenceOcr,
  createArtApproval,
  getApprovalsByArtService,
  deleteArtEvidence,
} from "./art-db";
import { notifyOwner } from "./_core/notification";

// ─── Tipos internos ──────────────────────────────────────────────────────────

type SaasCtx = { saasUser: { userId: number; role: string; companyId: number | null } };

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Verifica se a empresa tem plano premium (pro ou industrial) */
async function hasPremiumPlan(companyId: number): Promise<boolean> {
  const sub = await getSubscriptionByCompany(companyId);
  if (!sub) return false;
  const premiumPlans = ["pro", "industrial"];
  const isActive = sub.status === "ativo" || sub.status === "trial";
  return isActive && premiumPlans.includes(sub.plan);
}

/** Calcula SHA256 de uma string base64 */
function sha256FromBase64(base64: string): string {
  const buffer = Buffer.from(base64.split(",")[1] ?? base64, "base64");
  return createHash("sha256").update(buffer).digest("hex");
}

/** Gera hash de submissão para antifraude */
function buildSubmissionHash(data: {
  technicianId: number;
  companyId: number;
  serviceType: string;
  serviceDate: string;
  clientName: string;
  serverTimestamp: string;
}): string {
  const payload = JSON.stringify(data);
  return createHash("sha256").update(payload).digest("hex");
}

// ─── Tipos de evidência permitidos ──────────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic",
  "video/mp4", "video/quicktime",
  "application/pdf",
] as const;
type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

const EVIDENCE_TYPE_MAP: Record<AllowedMimeType, "foto" | "video" | "nota_fiscal" | "laudo"> = {
  "image/jpeg": "foto",
  "image/png": "foto",
  "image/webp": "foto",
  "image/heic": "foto",
  "video/mp4": "video",
  "video/quicktime": "video",
  "application/pdf": "nota_fiscal",
};

// ─── Router ──────────────────────────────────────────────────────────────────

export const artRouter = router({

  // ── 1. Criar rascunho de ART ───────────────────────────────────────────────
  create: saasAuthProcedure
    .input(z.object({
      serviceType: z.enum(["pmoc", "incendio", "eletrica", "gas", "hidraulico", "co2", "outro"]),
      description: z.string().min(10).max(2000),
      clientName: z.string().min(2).max(200),
      clientDocument: z.string().max(30).optional(),
      serviceAddress: z.string().max(500).optional(),
      serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD"),
      geoLatitude: z.number().min(-90).max(90).optional(),
      geoLongitude: z.number().min(-180).max(180).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { saasUser } = ctx as SaasCtx;
      if (!saasUser.companyId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário sem empresa vinculada" });

      // Verificar monetização: plano premium ou pagamento por ART
      const premium = await hasPremiumPlan(saasUser.companyId);

      const { id } = await createArtService({
        companyId: saasUser.companyId,
        technicianId: saasUser.userId,
        serviceType: input.serviceType,
        description: input.description,
        clientName: input.clientName,
        clientDocument: input.clientDocument ?? null,
        serviceAddress: input.serviceAddress ?? null,
        serviceDate: new Date(input.serviceDate),
        status: "rascunho",
        paymentStatus: premium ? "free_plan" : "pending_payment",
        technicianDeclaration: false,
        geoLatitude: input.geoLatitude?.toString() ?? null,
        geoLongitude: input.geoLongitude?.toString() ?? null,
      });

      return { id, paymentRequired: !premium };
    }),

  // ── 2. Listar ARTs da empresa ──────────────────────────────────────────────
  list: saasAuthProcedure
    .input(z.object({
      cursor: z.number().optional(),
      limit: z.number().min(1).max(100).default(50),
      status: z.enum(["rascunho", "aguardando_aprovacao", "aprovado", "reprovado"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { saasUser } = ctx as SaasCtx;
      if (!saasUser.companyId) return { items: [], nextCursor: null };
      return getArtServicesByCompany(saasUser.companyId, input);
    }),

  // ── 3. Listar ARTs do técnico (visão própria) ──────────────────────────────
  myList: saasAuthProcedure
    .input(z.object({
      cursor: z.number().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { saasUser } = ctx as SaasCtx;
      return getArtServicesByTechnician(saasUser.userId, input);
    }),

  // ── 4. Obter ART por ID (com evidências e aprovações) ─────────────────────
  getById: saasAuthProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const { saasUser } = ctx as SaasCtx;
      const art = await getArtServiceById(input.id);
      if (!art) throw new TRPCError({ code: "NOT_FOUND", message: "ART não encontrada" });
      // Garantir que o usuário pertence à mesma empresa
      if (art.companyId !== saasUser.companyId && saasUser.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      const [evidences, approvals] = await Promise.all([
        getEvidencesByArtService(input.id),
        getApprovalsByArtService(input.id),
      ]);
      return { ...art, evidences, approvals };
    }),

  // ── 5. Upload de evidência (foto, vídeo, NF-e, laudo) ─────────────────────
  uploadEvidence: saasAuthProcedure
    .input(z.object({
      artServiceId: z.number().int().positive(),
      fileName: z.string().max(255),
      mimeType: z.enum(ALLOWED_MIME_TYPES),
      base64Data: z.string().max(20 * 1024 * 1024), // 20MB base64 ≈ 15MB arquivo
      evidenceType: z.enum(["foto", "video", "nota_fiscal", "laudo", "outro"]).optional(),
      geoLatitude: z.number().min(-90).max(90).optional(),
      geoLongitude: z.number().min(-180).max(180).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { saasUser } = ctx as SaasCtx;

      // Verificar que a ART existe e pertence à empresa
      const art = await getArtServiceById(input.artServiceId);
      if (!art) throw new TRPCError({ code: "NOT_FOUND", message: "ART não encontrada" });
      if (art.companyId !== saasUser.companyId) throw new TRPCError({ code: "FORBIDDEN" });

      // Não permitir upload em ART aprovada (imutabilidade)
      if (art.status === "aprovado") {
        throw new TRPCError({ code: "FORBIDDEN", message: "ART aprovada — evidências imutáveis" });
      }

      // Calcular SHA256 do arquivo (antifraude — imutabilidade)
      const sha256Hash = sha256FromBase64(input.base64Data);

      // Upload para S3
      const suffix = randomBytes(6).toString("hex");
      const ext = input.fileName.split(".").pop() ?? "bin";
      const fileKey = `art-evidences/${art.companyId}/${input.artServiceId}/${suffix}.${ext}`;
      const fileBuffer = Buffer.from(input.base64Data.split(",")[1] ?? input.base64Data, "base64");
      const { url: fileUrl } = await storagePut(fileKey, fileBuffer, input.mimeType);

      // Determinar tipo de evidência automaticamente se não fornecido
      const evidenceType = input.evidenceType ?? EVIDENCE_TYPE_MAP[input.mimeType] ?? "outro";

      // Criar registro imutável no banco
      const { id } = await createArtEvidence({
        artServiceId: input.artServiceId,
        uploadedById: saasUser.userId,
        fileUrl,
        fileKey,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: fileBuffer.length,
        evidenceType,
        sha256Hash,
        geoLatitude: input.geoLatitude?.toString() ?? null,
        geoLongitude: input.geoLongitude?.toString() ?? null,
        isLocked: false,
      });

      // Disparar OCR assíncrono para notas fiscais (economia de tokens — só quando necessário)
      if (evidenceType === "nota_fiscal" && input.mimeType === "application/pdf") {
        // Não aguardar — processa em background
        void (async () => {
          try {
            const result = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: "Você é um extrator de dados de notas fiscais. Retorne apenas JSON válido.",
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "file_url",
                      file_url: { url: fileUrl, mime_type: "application/pdf" },
                    },
                    {
                      type: "text",
                      text: "Extraia: numero_nf, data_emissao, cnpj_emitente, nome_emitente, valor_total, descricao_servico. Retorne JSON.",
                    },
                  ],
                },
              ],
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "nota_fiscal_data",
                  strict: true,
                  schema: {
                    type: "object",
                    properties: {
                      numero_nf: { type: "string" },
                      data_emissao: { type: "string" },
                      cnpj_emitente: { type: "string" },
                      nome_emitente: { type: "string" },
                      valor_total: { type: "string" },
                      descricao_servico: { type: "string" },
                    },
                    required: ["numero_nf", "data_emissao", "cnpj_emitente", "nome_emitente", "valor_total", "descricao_servico"],
                    additionalProperties: false,
                  },
                },
              },
            });
            const content = result.choices?.[0]?.message?.content;
            if (content) {
              const parsed = typeof content === "string" ? JSON.parse(content) : content;
              await updateEvidenceOcr(id, parsed);
            }
          } catch (err) {
            console.error("[ART OCR] Erro ao processar NF-e:", err);
          }
        })();
      }

      return { id, fileUrl, sha256Hash, evidenceType };
    }),

  // ── 6. Assinar e enviar para aprovação ────────────────────────────────────
  submitForApproval: saasAuthProcedure
    .input(z.object({
      artServiceId: z.number().int().positive(),
      declaration: z.literal(true, { message: "Você deve aceitar a declaração de responsabilidade técnica" }),
      geoLatitude: z.number().min(-90).max(90).optional(),
      geoLongitude: z.number().min(-180).max(180).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { saasUser } = ctx as SaasCtx;

      const art = await getArtServiceById(input.artServiceId);
      if (!art) throw new TRPCError({ code: "NOT_FOUND" });
      if (art.technicianId !== saasUser.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas o técnico responsável pode assinar" });
      }
      if (art.status !== "rascunho") {
        throw new TRPCError({ code: "BAD_REQUEST", message: `ART já está em status: ${art.status}` });
      }

      // Verificar pagamento (se necessário)
      if (art.paymentStatus === "pending_payment") {
        throw new TRPCError({
          code: "PAYMENT_REQUIRED",
          message: "Pagamento necessário para emitir ART. Seu plano não inclui este módulo.",
        });
      }

      // Verificar que há pelo menos uma evidência
      const evidences = await getEvidencesByArtService(input.artServiceId);
      if (evidences.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Adicione pelo menos uma evidência antes de enviar" });
      }

      // Gerar hash de submissão (antifraude)
      const serverTimestamp = new Date();
      const submissionHash = buildSubmissionHash({
        technicianId: saasUser.userId,
        companyId: art.companyId,
        serviceType: art.serviceType,
        serviceDate: art.serviceDate?.toString() ?? "",
        clientName: art.clientName,
        serverTimestamp: serverTimestamp.toISOString(),
      });

      // Bloquear todas as evidências (imutabilidade)
      await Promise.all(evidences.map(e => lockEvidence(e.id)));

      // Atualizar ART
      await updateArtService(input.artServiceId, {
        status: "aguardando_aprovacao",
        technicianDeclaration: true,
        technicianSignatureTs: serverTimestamp,
        submissionHash,
        serverTimestamp,
        geoLatitude: input.geoLatitude?.toString() ?? null,
        geoLongitude: input.geoLongitude?.toString() ?? null,
        updatedAt: serverTimestamp,
      });

      // Notificar engenheiro/admin que há ART aguardando aprovação
      void notifyOwner({
        title: "📌 ART OPERIS aguardando aprovação",
        content: `Técnico (ID ${saasUser.userId}) submeteu ART #${input.artServiceId} para aprovação.\nTipo: ${art.serviceType.toUpperCase()} | Cliente: ${art.clientName}\nHash: ${submissionHash.slice(0, 16)}...`,
      }).catch(() => {});

      return { submissionHash, submittedAt: serverTimestamp.toISOString() };
    }),

  // ── 7. Aprovar ou reprovar ART (engenheiro/admin) ─────────────────────────
  review: saasAdminProcedure
    .input(z.object({
      artServiceId: z.number().int().positive(),
      action: z.enum(["aprovado", "reprovado"]),
      notes: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { saasUser } = ctx as SaasCtx;

      const art = await getArtServiceById(input.artServiceId);
      if (!art) throw new TRPCError({ code: "NOT_FOUND" });
      if (art.companyId !== saasUser.companyId && saasUser.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (art.status !== "aguardando_aprovacao") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "ART não está aguardando aprovação" });
      }

      const now = new Date();

      // Registrar aprovação/reprovação
      await createArtApproval({
        artServiceId: input.artServiceId,
        reviewerId: saasUser.userId,
        action: input.action,
        notes: input.notes ?? null,
      });

      // Gerar número sequencial ART-YYYY-NNNN ao aprovar
      let artNumber: string | undefined;
      if (input.action === "aprovado") {
        artNumber = await generateArtNumber(now.getFullYear());
      }

      // Atualizar status da ART
      await updateArtService(input.artServiceId, {
        status: input.action,
        engineerId: saasUser.userId,
        approvedAt: input.action === "aprovado" ? now : null,
        rejectionReason: input.action === "reprovado" ? (input.notes ?? null) : null,
        ...(artNumber ? { artNumber } : {}),
        updatedAt: now,
      });

      // Notificar técnico sobre resultado da aprovação
      const emoji = input.action === "aprovado" ? "✅" : "❌";
      const statusText = input.action === "aprovado" ? "APROVADA" : "REPROVADA";
      void notifyOwner({
        title: `${emoji} ART OPERIS ${statusText}`,
        content: `ART #${input.artServiceId}${artNumber ? ` (${artNumber})` : ""} foi ${statusText} pelo engenheiro (ID ${saasUser.userId}).${input.notes ? `\nMotivo: ${input.notes}` : ""}`,
      }).catch(() => {});

      // Se aprovado, gerar PDF (assíncrono)
      if (input.action === "aprovado") {
        void generateArtPdf(input.artServiceId);
      }

      return { success: true, action: input.action, artNumber };
    }),

  // ── 8. Listar ARTs pendentes de aprovação (empresa) ─────────────────────────
  pendingApproval: saasAdminProcedure
    .query(async ({ ctx }) => {
      const { saasUser } = ctx as SaasCtx;
      if (!saasUser.companyId) return [];
      return getPendingApprovalArts(saasUser.companyId);
    }),

  // ── 8b. Listar TODAS as ARTs pendentes (superadmin — painel global) ─────────
  allPendingApprovals: saasAdminProcedure
    .query(async ({ ctx }) => {
      const { saasUser } = ctx as SaasCtx;
      if (saasUser.role !== "superadmin" && saasUser.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      return getAllPendingApprovalArts();
    }),

  // ── 9. Criar checkout Stripe para pagamento por ART ───────────────────────
  createPaymentCheckout: saasAuthProcedure
    .input(z.object({
      artServiceId: z.number().int().positive(),
      origin: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { saasUser } = ctx as SaasCtx;

      const art = await getArtServiceById(input.artServiceId);
      if (!art) throw new TRPCError({ code: "NOT_FOUND" });
      if (art.technicianId !== saasUser.userId && saasUser.role !== "admin" && saasUser.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (art.paymentStatus === "paid" || art.paymentStatus === "free_plan") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Esta ART já está paga ou isenta" });
      }

      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe não configurado" });

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

      const user = await getSaasUserById(saasUser.userId);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: user?.email ?? undefined,
        line_items: [{
          price_data: {
            currency: "brl",
            unit_amount: 4900, // R$ 49,00 por ART
            product_data: {
              name: "ART OPERIS — Responsabilidade Técnica Digital",
              description: `ART #${input.artServiceId} — ${art.serviceType.toUpperCase()} — ${art.clientName}`,
            },
          },
          quantity: 1,
        }],
        allow_promotion_codes: true,
        client_reference_id: saasUser.userId.toString(),
        metadata: {
          art_service_id: input.artServiceId.toString(),
          user_id: saasUser.userId.toString(),
          company_id: saasUser.companyId?.toString() ?? "",
          customer_email: user?.email ?? "",
          customer_name: user?.name ?? "",
        },
        success_url: `${input.origin}/app/art?paid=1&art_id=${input.artServiceId}`,
        cancel_url: `${input.origin}/app/art/${input.artServiceId}`,
      });

      return { checkoutUrl: session.url };
    }),

  // ── 10. Confirmar pagamento (webhook interno) ─────────────────────────────
  confirmPayment: saasAdminProcedure
    .input(z.object({
      artServiceId: z.number().int().positive(),
      stripePaymentIntentId: z.string().max(100),
    }))
    .mutation(async ({ input }) => {
      await updateArtService(input.artServiceId, {
        paymentStatus: "paid",
        stripePaymentIntentId: input.stripePaymentIntentId,
        paidAt: new Date(),
        updatedAt: new Date(),
      });
      return { success: true };
    }),

  // ── 11. Verificar acesso (premium ou pago) ────────────────────────────────
  checkAccess: saasAuthProcedure
    .query(async ({ ctx }) => {
      const { saasUser } = ctx as SaasCtx;
      if (!saasUser.companyId) return { hasAccess: false, reason: "no_company" as const };
      const premium = await hasPremiumPlan(saasUser.companyId);
      if (premium) return { hasAccess: true, reason: "premium" as const };
      // Verificar se tem créditos de ART pagos não utilizados
      const { items: arts } = await getArtServicesByTechnician(saasUser.userId);
      const paidUnused = arts.filter(
        (a: { paymentStatus: string; status: string }) => a.paymentStatus === "paid" && a.status === "rascunho"
      );
      if (paidUnused.length > 0) return { hasAccess: true, reason: "paid_credit" as const };
      return { hasAccess: false, reason: "requires_payment" as const };
    }),

  // ── 12. OCR de nota fiscal via LLM ───────────────────────────────────────
  ocrInvoice: saasAuthProcedure
    .input(z.object({
      evidenceId: z.number().int().positive(),
      artServiceId: z.number().int().positive(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { saasUser } = ctx as SaasCtx;
      const art = await getArtServiceById(input.artServiceId);
      if (!art) throw new TRPCError({ code: "NOT_FOUND", message: "ART não encontrada" });
      if (art.technicianId !== saasUser.userId)
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      const evidences = await getEvidencesByArtService(input.artServiceId);
      const evidence = evidences.find(e => e.id === input.evidenceId);
      if (!evidence) throw new TRPCError({ code: "NOT_FOUND", message: "Evidência não encontrada" });
      if (!evidence.fileUrl)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Evidência sem arquivo" });
      // Chamar LLM para extrair dados da NF-e
      const result = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um especialista em leitura de Notas Fiscais Eletrônicas (NF-e) brasileiras.
Extraia os dados estruturados da nota fiscal fornecida e retorne JSON com os campos:
numeroNF, dataEmissao, valorTotal, cnpjEmitente, nomeEmitente, cnpjDestinatario, nomeDestinatario, descricaoServico, chaveAcesso.
Se um campo não existir, use null. Retorne APENAS o JSON, sem explicações.`,
          },
          {
            role: "user",
            content: [
              { type: "text" as const, text: "Extraia os dados desta nota fiscal:" },
              { type: "image_url" as const, image_url: { url: evidence.fileUrl, detail: "high" as const } },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "nfe_data",
            strict: true,
            schema: {
              type: "object",
              properties: {
                numeroNF: { type: ["string", "null"] },
                dataEmissao: { type: ["string", "null"] },
                valorTotal: { type: ["string", "null"] },
                cnpjEmitente: { type: ["string", "null"] },
                nomeEmitente: { type: ["string", "null"] },
                cnpjDestinatario: { type: ["string", "null"] },
                nomeDestinatario: { type: ["string", "null"] },
                descricaoServico: { type: ["string", "null"] },
                chaveAcesso: { type: ["string", "null"] },
              },
              required: ["numeroNF","dataEmissao","valorTotal","cnpjEmitente","nomeEmitente","cnpjDestinatario","nomeDestinatario","descricaoServico","chaveAcesso"],
              additionalProperties: false,
            },
          },
        },
      });
      const raw = result.choices?.[0]?.message?.content;
      const ocrData = typeof raw === "string" ? JSON.parse(raw) : raw;
      // Salvar resultado do OCR na evidência
      await updateEvidenceOcr(input.evidenceId, JSON.stringify(ocrData));
      return { success: true, data: ocrData };
    }),

  // ── 13. Remover evidência (apenas em rascunho) ────────────────────────────
  deleteEvidence: saasAuthProcedure
    .input(z.object({
      evidenceId: z.number().int().positive(),
      artServiceId: z.number().int().positive(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { saasUser } = ctx as SaasCtx;
      const art = await getArtServiceById(input.artServiceId);
      if (!art) throw new TRPCError({ code: "NOT_FOUND", message: "ART não encontrada" });
      if (art.technicianId !== saasUser.userId)
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      if (art.status !== "rascunho")
        throw new TRPCError({ code: "BAD_REQUEST", message: "Evidências só podem ser removidas em rascunho" });
      const evidences = await getEvidencesByArtService(input.artServiceId);
      const evidence = evidences.find(e => e.id === input.evidenceId);
      if (!evidence) throw new TRPCError({ code: "NOT_FOUND", message: "Evidência não encontrada" });
      if (evidence.isLocked)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Evidência bloqueada — ART já submetida" });
      await deleteArtEvidence(input.evidenceId);
      return { success: true };
    }),
});

// ─── Geração de PDF (assíncrona, pós-aprovação) ───────────────────────────────

async function generateArtPdf(artServiceId: number): Promise<void> {
  try {
    const art = await getArtServiceById(artServiceId);
    if (!art) return;
    const evidences = await getEvidencesByArtService(artServiceId);
    const approvals = await getApprovalsByArtService(artServiceId);

    // Gerar conteúdo HTML do PDF via LLM
    const pdfContent = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um gerador de ARTs (Anotações de Responsabilidade Técnica) para engenharia.
Gere um documento HTML profissional e completo para a ART com os dados fornecidos.
O documento deve incluir: cabeçalho OPERIS, dados do serviço, declaração do técnico, lista de evidências, assinatura do engenheiro aprovador e rodapé com hash de autenticidade.
Use tabelas HTML para organizar os dados. Inclua estilos CSS inline para impressão.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            artId: art.id,
            serviceType: art.serviceType,
            description: art.description,
            clientName: art.clientName,
            clientDocument: art.clientDocument,
            serviceAddress: art.serviceAddress,
            serviceDate: art.serviceDate,
            technicianId: art.technicianId,
            technicianSignatureTs: art.technicianSignatureTs,
            submissionHash: art.submissionHash,
            approvedAt: art.approvedAt,
            evidenceCount: evidences.length,
            approvals: approvals.map(a => ({ action: a.action, notes: a.notes, reviewedAt: a.reviewedAt })),
            company: "CO2 Contra Incêndio Ltda",
            cnpj: "29.905.123/0001-53",
            responsavelTecnico: "Eng. Judson Aleixo Sampaio",
            crea: "CREA/MG 142203671-5",
          }),
        },
      ],
    });

    const htmlContent = pdfContent.choices?.[0]?.message?.content;
    if (!htmlContent || typeof htmlContent !== "string") return;

    // Salvar HTML como "PDF" no S3 (renderização real pode ser adicionada com puppeteer)
    const fileKey = `art-pdfs/${art.companyId}/${artServiceId}/art-${artServiceId}.html`;
    const { url: pdfUrl } = await storagePut(
      fileKey,
      Buffer.from(htmlContent, "utf-8"),
      "text/html"
    );

    await updateArtService(artServiceId, {
      pdfUrl,
      pdfGeneratedAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`[ART PDF] Gerado para ART #${artServiceId}: ${pdfUrl}`);
  } catch (err) {
    console.error(`[ART PDF] Erro ao gerar PDF para ART #${artServiceId}:`, err);
  }
}

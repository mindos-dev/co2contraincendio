/**
 * Tipos compartilhados para o contexto SAAS.
 * Centraliza as type assertions usadas nos routers para evitar repetição.
 */

// ─── Payload do JWT SAAS ──────────────────────────────────────────────────────

export type SaasUserPayload = {
  userId: number;
  role: "superadmin" | "admin" | "tecnico" | "cliente";
  companyId: number | null;
  id?: number;
  name?: string;
};

// ─── Contexto tRPC com saasUser injetado ──────────────────────────────────────

export type SaasCtx = {
  saasUser: SaasUserPayload;
};

/**
 * Helper para extrair o saasUser do contexto tRPC com tipagem segura.
 * Lança TRPCError se o saasUser não estiver presente.
 *
 * @example
 * const saasUser = getSaasUser(ctx);
 * const companyId = saasUser.companyId;
 */
export function getSaasUser(ctx: unknown): SaasUserPayload {
  const saasUser = (ctx as SaasCtx).saasUser;
  if (!saasUser) {
    throw new Error("[saas-types] saasUser não encontrado no contexto — use saasAuthProcedure");
  }
  return saasUser;
}

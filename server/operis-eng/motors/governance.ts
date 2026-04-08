/**
 * OPERIS.Eng — Motor de Governança
 * Responsável por: regras de permissão, logs imutáveis, gate de confirmação
 * humana para ações sensíveis, e exportação de trilha de auditoria.
 *
 * Princípios AOG (Digital Sovereignty):
 *   - Nenhuma ação sensível é executada sem confirmação explícita do usuário
 *   - Todos os logs são imutáveis (append-only, hash encadeado)
 *   - Matriz de permissões por plano/papel
 */

import { createHash } from "crypto";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ActionCategory =
  | "read"        // Consulta pública ou interna
  | "draft"       // Preenche rascunho sem submeter
  | "generate"    // Gera documento/proposta/ART
  | "download"    // Baixa arquivo/recibo
  | "submit"      // Submete formulário (requer confirmação)
  | "sign"        // Assina documento (requer confirmação)
  | "pay"         // Realiza pagamento (requer confirmação)
  | "register"    // Altera cadastro (requer confirmação)
  | "delete";     // Remove dado (requer confirmação)

export type AgentRole = "viewer" | "operator" | "engineer" | "admin";
export type PlanTier = "basic" | "pro" | "industrial" | "enterprise" | "trial";

export interface GovernanceRule {
  action: ActionCategory;
  allowedRoles: AgentRole[];
  allowedPlans: PlanTier[];
  requiresHumanConfirmation: boolean;
  description: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;          // ISO 8601 UTC
  userId: number;
  companyId: number | null;
  agentId: string;
  action: ActionCategory;
  resource: string;           // ex: "crea_portal", "nfe_portal", "budget"
  detail: string;
  result: "allowed" | "blocked" | "pending_confirmation" | "confirmed" | "rejected";
  previousHash: string;       // hash da entrada anterior (cadeia imutável)
  hash: string;               // SHA-256 desta entrada
  metadata?: Record<string, unknown>;
}

export interface ConfirmationRequest {
  requestId: string;
  createdAt: string;
  userId: number;
  agentId: string;
  action: ActionCategory;
  resource: string;
  description: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "pending" | "confirmed" | "rejected" | "expired";
  expiresAt: string;
}

// ─── Matriz de Permissões ─────────────────────────────────────────────────────

export const GOVERNANCE_RULES: GovernanceRule[] = [
  {
    action: "read",
    allowedRoles: ["viewer", "operator", "engineer", "admin"],
    allowedPlans: ["basic", "pro", "industrial", "enterprise", "trial"],
    requiresHumanConfirmation: false,
    description: "Consulta de dados públicos e internos — sempre permitida",
  },
  {
    action: "draft",
    allowedRoles: ["operator", "engineer", "admin"],
    allowedPlans: ["pro", "industrial", "enterprise"],
    requiresHumanConfirmation: false,
    description: "Preenchimento de rascunho sem submissão — permitido sem confirmação",
  },
  {
    action: "generate",
    allowedRoles: ["operator", "engineer", "admin"],
    allowedPlans: ["pro", "industrial", "enterprise"],
    requiresHumanConfirmation: false,
    description: "Geração de documentos, propostas, ARTs — sem confirmação",
  },
  {
    action: "download",
    allowedRoles: ["operator", "engineer", "admin"],
    allowedPlans: ["pro", "industrial", "enterprise"],
    requiresHumanConfirmation: false,
    description: "Download de arquivos e recibos — sem confirmação",
  },
  {
    action: "submit",
    allowedRoles: ["engineer", "admin"],
    allowedPlans: ["industrial", "enterprise"],
    requiresHumanConfirmation: true,
    description: "Submissão de formulário — REQUER confirmação humana explícita",
  },
  {
    action: "sign",
    allowedRoles: ["engineer", "admin"],
    allowedPlans: ["industrial", "enterprise"],
    requiresHumanConfirmation: true,
    description: "Assinatura de documento — REQUER confirmação humana explícita",
  },
  {
    action: "pay",
    allowedRoles: ["admin"],
    allowedPlans: ["enterprise"],
    requiresHumanConfirmation: true,
    description: "Pagamento — REQUER confirmação humana explícita + plano Enterprise",
  },
  {
    action: "register",
    allowedRoles: ["engineer", "admin"],
    allowedPlans: ["industrial", "enterprise"],
    requiresHumanConfirmation: true,
    description: "Alteração de cadastro — REQUER confirmação humana explícita",
  },
  {
    action: "delete",
    allowedRoles: ["admin"],
    allowedPlans: ["enterprise"],
    requiresHumanConfirmation: true,
    description: "Remoção de dado — REQUER confirmação humana explícita",
  },
];

// ─── Motor de Governança ──────────────────────────────────────────────────────

class GovernanceEngine {
  private auditLog: AuditEntry[] = [];
  private confirmationQueue = new Map<string, ConfirmationRequest>();
  private lastHash = "GENESIS";

  /** Verifica se uma ação é permitida para o papel/plano informados */
  checkPermission(
    action: ActionCategory,
    role: AgentRole,
    plan: PlanTier
  ): { allowed: boolean; requiresConfirmation: boolean; reason: string } {
    const rule = GOVERNANCE_RULES.find((r) => r.action === action);
    if (!rule) {
      return { allowed: false, requiresConfirmation: false, reason: `Ação '${action}' não mapeada na matriz de governança` };
    }
    if (!rule.allowedRoles.includes(role)) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: `Papel '${role}' não autorizado para ação '${action}'. Necessário: ${rule.allowedRoles.join(", ")}`,
      };
    }
    if (!rule.allowedPlans.includes(plan)) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: `Plano '${plan}' não autorizado para ação '${action}'. Necessário: ${rule.allowedPlans.join(", ")}`,
      };
    }
    return {
      allowed: true,
      requiresConfirmation: rule.requiresHumanConfirmation,
      reason: rule.description,
    };
  }

  /** Registra uma entrada imutável no log de auditoria */
  appendAuditLog(entry: Omit<AuditEntry, "id" | "timestamp" | "previousHash" | "hash">): AuditEntry {
    const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const timestamp = new Date().toISOString();
    const previousHash = this.lastHash;

    const rawData = JSON.stringify({ id, timestamp, previousHash, ...entry });
    const hash = createHash("sha256").update(rawData).digest("hex");

    const fullEntry: AuditEntry = {
      id,
      timestamp,
      previousHash,
      hash,
      ...entry,
    };

    this.auditLog.push(fullEntry);
    this.lastHash = hash;

    return fullEntry;
  }

  /** Cria uma solicitação de confirmação humana para ação sensível */
  createConfirmationRequest(params: {
    userId: number;
    agentId: string;
    action: ActionCategory;
    resource: string;
    description: string;
    riskLevel: ConfirmationRequest["riskLevel"];
    ttlMinutes?: number;
  }): ConfirmationRequest {
    const requestId = `confirm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const ttl = params.ttlMinutes ?? 15;
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000).toISOString();

    const req: ConfirmationRequest = {
      requestId,
      createdAt: new Date().toISOString(),
      userId: params.userId,
      agentId: params.agentId,
      action: params.action,
      resource: params.resource,
      description: params.description,
      riskLevel: params.riskLevel,
      status: "pending",
      expiresAt,
    };

    this.confirmationQueue.set(requestId, req);

    // Log da solicitação
    this.appendAuditLog({
      userId: params.userId,
      companyId: null,
      agentId: params.agentId,
      action: params.action,
      resource: params.resource,
      detail: `Solicitação de confirmação criada: ${params.description}`,
      result: "pending_confirmation",
      metadata: { requestId, riskLevel: params.riskLevel, expiresAt },
    });

    return req;
  }

  /** Processa a resposta do usuário a uma solicitação de confirmação */
  resolveConfirmation(
    requestId: string,
    decision: "confirmed" | "rejected",
    userId: number
  ): { success: boolean; message: string; request?: ConfirmationRequest } {
    const req = this.confirmationQueue.get(requestId);
    if (!req) {
      return { success: false, message: `Solicitação '${requestId}' não encontrada` };
    }
    if (req.userId !== userId) {
      return { success: false, message: "Apenas o usuário que solicitou pode confirmar/rejeitar" };
    }
    if (req.status !== "pending") {
      return { success: false, message: `Solicitação já processada: ${req.status}` };
    }
    if (new Date() > new Date(req.expiresAt)) {
      req.status = "expired";
      return { success: false, message: "Solicitação expirada. Crie uma nova." };
    }

    req.status = decision;
    this.confirmationQueue.set(requestId, req);

    this.appendAuditLog({
      userId,
      companyId: null,
      agentId: req.agentId,
      action: req.action,
      resource: req.resource,
      detail: `Confirmação ${decision} pelo usuário ${userId}`,
      result: decision,
      metadata: { requestId },
    });

    return {
      success: true,
      message: decision === "confirmed" ? "Ação autorizada pelo usuário" : "Ação rejeitada pelo usuário",
      request: req,
    };
  }

  /** Retorna solicitações pendentes de um usuário */
  getPendingConfirmations(userId: number): ConfirmationRequest[] {
    return Array.from(this.confirmationQueue.values()).filter(
      (r) => r.userId === userId && r.status === "pending" && new Date() <= new Date(r.expiresAt)
    );
  }

  /** Retorna o log de auditoria (últimas N entradas) */
  getAuditLog(limit = 100, userId?: number): AuditEntry[] {
    let entries = this.auditLog;
    if (userId !== undefined) {
      entries = entries.filter((e) => e.userId === userId);
    }
    return entries.slice(-limit).reverse();
  }

  /** Exporta o log de auditoria como JSON para download */
  exportAuditLog(userId?: number): string {
    const entries = userId !== undefined
      ? this.auditLog.filter((e) => e.userId === userId)
      : this.auditLog;

    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalEntries: entries.length,
        genesisHash: "GENESIS",
        lastHash: this.lastHash,
        entries,
      },
      null,
      2
    );
  }

  /** Verifica integridade da cadeia de hashes */
  verifyChainIntegrity(): { valid: boolean; brokenAt?: string; message: string } {
    let previousHash = "GENESIS";
    for (const entry of this.auditLog) {
      if (entry.previousHash !== previousHash) {
        return {
          valid: false,
          brokenAt: entry.id,
          message: `Integridade comprometida na entrada ${entry.id}`,
        };
      }
      previousHash = entry.hash;
    }
    return { valid: true, message: `Cadeia íntegra — ${this.auditLog.length} entradas verificadas` };
  }

  /** Resumo do estado de governança */
  getSummary() {
    const pending = Array.from(this.confirmationQueue.values()).filter((r) => r.status === "pending");
    return {
      totalAuditEntries: this.auditLog.length,
      pendingConfirmations: pending.length,
      lastHash: this.lastHash,
      rules: GOVERNANCE_RULES.length,
      chainValid: this.verifyChainIntegrity().valid,
    };
  }
}

// Singleton global do Motor de Governança
export const governanceEngine = new GovernanceEngine();

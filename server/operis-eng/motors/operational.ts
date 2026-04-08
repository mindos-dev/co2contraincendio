/**
 * OPERIS.eng — Motor Operacional Assistido
 *
 * Arquitetura de sessão de browser autenticada:
 *   1. Usuário faz login manualmente no portal (CREA, NF-e, NFS-e)
 *   2. Agente assume a sessão autenticada
 *   3. Agente executa APENAS ações permitidas (consulta, rascunho, download)
 *   4. Ações sensíveis (submit, sign, pay) BLOQUEADAS — exigem confirmação humana
 *
 * Portais suportados:
 *   - CREA-MG: consulta profissionais, títulos, ART Online (rascunho)
 *   - NF-e/NFS-e: consulta via portais gov.br, montagem de rascunho
 *   - Portais estaduais: camada por estado (sem integração nacional única)
 *
 * NUNCA: bypass de CAPTCHA, submissão automática, pagamento automático.
 */

import { governanceEngine, type ActionCategory, type AgentRole, type PlanTier } from "./governance";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type PortalId =
  | "crea_mg"
  | "crea_sp"
  | "crea_rj"
  | "crea_pr"
  | "crea_rs"
  | "nfe_nacional"
  | "nfse_bh"
  | "nfse_contagem"
  | "nfse_betim"
  | "gov_br_servicos";

export type OperationalAction =
  | "consult_professional"    // Consulta profissional no CREA
  | "consult_art"             // Consulta ART emitida
  | "draft_art"               // Monta rascunho de ART (não submete)
  | "consult_nfe"             // Consulta NF-e emitida
  | "draft_nfse"              // Monta rascunho NFS-e (não emite)
  | "download_receipt"        // Baixa recibo/comprovante
  | "consult_registration"    // Consulta dados cadastrais
  | "submit_form"             // BLOQUEADO — requer confirmação humana
  | "sign_document"           // BLOQUEADO — requer confirmação humana
  | "make_payment"            // BLOQUEADO — requer confirmação humana
  | "change_registration";    // BLOQUEADO — requer confirmação humana

export interface PortalSession {
  sessionId: string;
  portalId: PortalId;
  userId: number;
  companyId: number | null;
  authenticatedAt: string;
  expiresAt: string;
  status: "active" | "expired" | "terminated";
  /** Cookie/token da sessão autenticada pelo usuário — NUNCA exposto ao frontend */
  sessionToken?: string;
  lastActivity: string;
}

export interface OperationalTask {
  taskId: string;
  sessionId: string;
  portalId: PortalId;
  action: OperationalAction;
  params: Record<string, string | number | boolean>;
  status: "queued" | "running" | "done" | "blocked" | "failed" | "awaiting_confirmation";
  result?: OperationalResult;
  confirmationRequestId?: string;
  createdAt: string;
  completedAt?: string;
  userId: number;
}

export interface OperationalResult {
  success: boolean;
  data?: Record<string, unknown>;
  message: string;
  requiresHumanAction?: boolean;
  humanActionDescription?: string;
  downloadUrl?: string;
  draftContent?: string;
}

export interface CreaConsultResult {
  nome: string;
  registro: string;
  situacao: string;
  titulo: string;
  especialidade: string;
  uf: string;
  validade: string;
}

export interface ArtDraft {
  numero?: string;
  tipo: string;
  descricaoServico: string;
  localServico: string;
  contratante: string;
  cnpjContratante: string;
  valorServico: number;
  dataInicio: string;
  dataConclusao: string;
  responsavelTecnico: string;
  crea: string;
  observacoes?: string;
  status: "rascunho";
  avisoLegal: string;
}

// ─── Configuração dos Portais ─────────────────────────────────────────────────

export const PORTAL_CONFIG: Record<PortalId, {
  name: string;
  baseUrl: string;
  loginUrl: string;
  requiresManualLogin: boolean;
  supportedActions: OperationalAction[];
  notes: string;
}> = {
  crea_mg: {
    name: "CREA-MG",
    baseUrl: "https://www.crea-mg.org.br",
    loginUrl: "https://www.crea-mg.org.br/portal/login",
    requiresManualLogin: true,
    supportedActions: ["consult_professional", "consult_art", "draft_art", "download_receipt", "consult_registration"],
    notes: "Login manual obrigatório. Consulta pública disponível sem login para profissionais.",
  },
  crea_sp: {
    name: "CREA-SP",
    baseUrl: "https://www.creasp.org.br",
    loginUrl: "https://www.creasp.org.br/portal/login",
    requiresManualLogin: true,
    supportedActions: ["consult_professional", "consult_art", "draft_art", "download_receipt"],
    notes: "Login manual obrigatório. Portal ART Online disponível após autenticação.",
  },
  crea_rj: {
    name: "CREA-RJ",
    baseUrl: "https://www.crearj.org.br",
    loginUrl: "https://www.crearj.org.br/portal/login",
    requiresManualLogin: true,
    supportedActions: ["consult_professional", "consult_art", "download_receipt"],
    notes: "Login manual obrigatório.",
  },
  crea_pr: {
    name: "CREA-PR",
    baseUrl: "https://www.crea-pr.org.br",
    loginUrl: "https://www.crea-pr.org.br/portal/login",
    requiresManualLogin: true,
    supportedActions: ["consult_professional", "consult_art", "download_receipt"],
    notes: "Login manual obrigatório.",
  },
  crea_rs: {
    name: "CREA-RS",
    baseUrl: "https://www.crea-rs.org.br",
    loginUrl: "https://www.crea-rs.org.br/portal/login",
    requiresManualLogin: true,
    supportedActions: ["consult_professional", "consult_art", "download_receipt"],
    notes: "Login manual obrigatório.",
  },
  nfe_nacional: {
    name: "NF-e Nacional (SEFAZ)",
    baseUrl: "https://www.nfe.fazenda.gov.br",
    loginUrl: "https://www.nfe.fazenda.gov.br/portal/login.aspx",
    requiresManualLogin: true,
    supportedActions: ["consult_nfe", "download_receipt"],
    notes: "Consulta pública disponível. Emissão requer certificado digital A1/A3 — NUNCA automatizado.",
  },
  nfse_bh: {
    name: "NFS-e Belo Horizonte",
    baseUrl: "https://bhiss.pbh.gov.br",
    loginUrl: "https://bhiss.pbh.gov.br/bhiss-web/login",
    requiresManualLogin: true,
    supportedActions: ["consult_nfe", "draft_nfse", "download_receipt"],
    notes: "Login manual com certificado digital. Rascunho de NFS-e permitido sem emissão.",
  },
  nfse_contagem: {
    name: "NFS-e Contagem",
    baseUrl: "https://nfse.contagem.mg.gov.br",
    loginUrl: "https://nfse.contagem.mg.gov.br/login",
    requiresManualLogin: true,
    supportedActions: ["consult_nfe", "draft_nfse", "download_receipt"],
    notes: "Login manual obrigatório.",
  },
  nfse_betim: {
    name: "NFS-e Betim",
    baseUrl: "https://nfse.betim.mg.gov.br",
    loginUrl: "https://nfse.betim.mg.gov.br/login",
    requiresManualLogin: true,
    supportedActions: ["consult_nfe", "draft_nfse", "download_receipt"],
    notes: "Login manual obrigatório.",
  },
  gov_br_servicos: {
    name: "gov.br — Serviços Digitais",
    baseUrl: "https://www.gov.br",
    loginUrl: "https://sso.acesso.gov.br/login",
    requiresManualLogin: true,
    supportedActions: ["consult_professional", "consult_registration", "download_receipt"],
    notes: "Login via conta gov.br (CPF + senha). Acesso a serviços federais.",
  },
};

// ─── Ações BLOQUEADAS — sempre requerem confirmação humana ───────────────────

const BLOCKED_ACTIONS = new Set<OperationalAction>([
  "submit_form" as OperationalAction,
  "sign_document" as OperationalAction,
  "make_payment" as OperationalAction,
  "change_registration" as OperationalAction,
]);

// ─── Motor Operacional Assistido ──────────────────────────────────────────────

class OperationalEngine {
  private sessions = new Map<string, PortalSession>();
  private tasks: OperationalTask[] = [];

  // ── Sessões ────────────────────────────────────────────────────────────────

  /**
   * Registra uma sessão autenticada pelo usuário.
   * O usuário faz login manualmente; o agente recebe apenas o sessionId.
   */
  registerSession(params: {
    portalId: PortalId;
    userId: number;
    companyId: number | null;
    sessionToken?: string;
    ttlMinutes?: number;
  }): PortalSession {
    const sessionId = `sess_${params.portalId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const ttl = params.ttlMinutes ?? 60;
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000).toISOString();

    const session: PortalSession = {
      sessionId,
      portalId: params.portalId,
      userId: params.userId,
      companyId: params.companyId,
      authenticatedAt: new Date().toISOString(),
      expiresAt,
      status: "active",
      sessionToken: params.sessionToken,
      lastActivity: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);

    governanceEngine.appendAuditLog({
      userId: params.userId,
      companyId: params.companyId,
      agentId: "operational_engine",
      action: "read",
      resource: params.portalId,
      detail: `Sessão registrada para portal ${PORTAL_CONFIG[params.portalId].name}`,
      result: "allowed",
      metadata: { sessionId, expiresAt },
    });

    return session;
  }

  /** Verifica se uma sessão está ativa */
  isSessionActive(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    if (session.status !== "active") return false;
    if (new Date() > new Date(session.expiresAt)) {
      session.status = "expired";
      return false;
    }
    return true;
  }

  /** Encerra uma sessão */
  terminateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = "terminated";
      session.sessionToken = undefined; // Limpa token
    }
  }

  // ── Execução de Tarefas ────────────────────────────────────────────────────

  /**
   * Executa uma tarefa operacional.
   * Ações bloqueadas criam solicitação de confirmação humana.
   */
  async executeTask(params: {
    sessionId: string;
    action: OperationalAction;
    params: Record<string, string | number | boolean>;
    role: AgentRole;
    plan: PlanTier;
  }): Promise<OperationalTask> {
    const session = this.sessions.get(params.sessionId);
    if (!session) {
      throw new Error(`Sessão '${params.sessionId}' não encontrada. Faça login no portal primeiro.`);
    }
    if (!this.isSessionActive(params.sessionId)) {
      throw new Error(`Sessão expirada ou encerrada. Faça login novamente em ${PORTAL_CONFIG[session.portalId].loginUrl}`);
    }

    const task: OperationalTask = {
      taskId: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sessionId: params.sessionId,
      portalId: session.portalId,
      action: params.action,
      params: params.params,
      status: "queued",
      createdAt: new Date().toISOString(),
      userId: session.userId,
    };

    this.tasks.push(task);

    // Verificar se ação é bloqueada
    if (BLOCKED_ACTIONS.has(params.action)) {
      task.status = "blocked";
      const actionMap: Record<OperationalAction, ActionCategory> = {
        consult_professional: "read",
        consult_art: "read",
        draft_art: "draft",
        consult_nfe: "read",
        draft_nfse: "draft",
        download_receipt: "download",
        consult_registration: "read",
        submit_form: "submit",
        sign_document: "sign",
        make_payment: "pay",
        change_registration: "register",
      };

      const confirmReq = governanceEngine.createConfirmationRequest({
        userId: session.userId,
        agentId: "operational_engine",
        action: actionMap[params.action],
        resource: session.portalId,
        description: `Ação '${params.action}' no portal ${PORTAL_CONFIG[session.portalId].name} — requer autorização explícita`,
        riskLevel: params.action === "make_payment" ? "critical" : "high",
      });

      task.status = "awaiting_confirmation";
      task.confirmationRequestId = confirmReq.requestId;

      task.result = {
        success: false,
        requiresHumanAction: true,
        humanActionDescription: `Esta ação requer sua confirmação explícita. ID da solicitação: ${confirmReq.requestId}. Acesse o painel OPERIS.eng para aprovar ou rejeitar.`,
        message: `Ação bloqueada — aguardando confirmação humana (ID: ${confirmReq.requestId})`,
      };

      return task;
    }

    // Verificar permissão pelo Motor de Governança
    const actionMap2: Record<OperationalAction, ActionCategory> = {
      consult_professional: "read",
      consult_art: "read",
      draft_art: "draft",
      consult_nfe: "read",
      draft_nfse: "draft",
      download_receipt: "download",
      consult_registration: "read",
      submit_form: "submit",
      sign_document: "sign",
      make_payment: "pay",
      change_registration: "register",
    };

    const perm = governanceEngine.checkPermission(actionMap2[params.action], params.role, params.plan);
    if (!perm.allowed) {
      task.status = "failed";
      task.result = { success: false, message: perm.reason };
      return task;
    }

    // Verificar se portal suporta a ação
    const portalConfig = PORTAL_CONFIG[session.portalId];
    if (!portalConfig.supportedActions.includes(params.action)) {
      task.status = "failed";
      task.result = {
        success: false,
        message: `Portal ${portalConfig.name} não suporta a ação '${params.action}'. Ações disponíveis: ${portalConfig.supportedActions.join(", ")}`,
      };
      return task;
    }

    // Executar ação permitida
    task.status = "running";
    session.lastActivity = new Date().toISOString();

    try {
      const result = await this.performAction(session, params.action, params.params);
      task.status = "done";
      task.result = result;
      task.completedAt = new Date().toISOString();

      governanceEngine.appendAuditLog({
        userId: session.userId,
        companyId: session.companyId,
        agentId: "operational_engine",
        action: actionMap2[params.action],
        resource: session.portalId,
        detail: `Ação '${params.action}' executada com sucesso`,
        result: "allowed",
        metadata: { taskId: task.taskId, params: params.params },
      });
    } catch (err) {
      task.status = "failed";
      task.result = {
        success: false,
        message: err instanceof Error ? err.message : "Erro desconhecido na execução",
      };
    }

    return task;
  }

  // ── Implementações das Ações ───────────────────────────────────────────────

  private async performAction(
    session: PortalSession,
    action: OperationalAction,
    params: Record<string, string | number | boolean>
  ): Promise<OperationalResult> {
    switch (action) {
      case "consult_professional":
        return this.consultProfessional(session, params);
      case "consult_art":
        return this.consultArt(session, params);
      case "draft_art":
        return this.draftArt(session, params);
      case "consult_nfe":
        return this.consultNfe(session, params);
      case "draft_nfse":
        return this.draftNfse(session, params);
      case "download_receipt":
        return this.downloadReceipt(session, params);
      case "consult_registration":
        return this.consultRegistration(session, params);
      default:
        return { success: false, message: `Ação '${action}' não implementada` };
    }
  }

  private async consultProfessional(
    session: PortalSession,
    params: Record<string, string | number | boolean>
  ): Promise<OperationalResult> {
    // Consulta pública — não requer sessão autenticada para CREA
    const registro = String(params["registro"] ?? "");
    const nome = String(params["nome"] ?? "");

    if (!registro && !nome) {
      return { success: false, message: "Informe o número de registro CREA ou nome do profissional." };
    }

    // Retorna estrutura para o frontend montar a consulta no portal
    return {
      success: true,
      message: "Consulta preparada. Acesse o portal para visualizar os dados.",
      data: {
        portalUrl: `${PORTAL_CONFIG[session.portalId].baseUrl}/portal/consulta-profissional?registro=${registro}&nome=${encodeURIComponent(nome)}`,
        instructions: [
          "1. Acesse a URL do portal acima",
          "2. Os dados serão exibidos diretamente no portal",
          "3. Use Ctrl+P ou 'Salvar como PDF' para exportar",
        ],
        searchParams: { registro, nome },
      },
      requiresHumanAction: false,
    };
  }

  private async consultArt(
    session: PortalSession,
    params: Record<string, string | number | boolean>
  ): Promise<OperationalResult> {
    const numeroArt = String(params["numeroArt"] ?? "");
    return {
      success: true,
      message: "Consulta de ART preparada.",
      data: {
        portalUrl: `${PORTAL_CONFIG[session.portalId].baseUrl}/portal/art/consulta?numero=${numeroArt}`,
        instructions: ["Acesse o portal com a sessão autenticada para visualizar a ART."],
        searchParams: { numeroArt },
      },
    };
  }

  private async draftArt(
    session: PortalSession,
    params: Record<string, string | number | boolean>
  ): Promise<OperationalResult> {
    const draft: ArtDraft = {
      tipo: String(params["tipo"] ?? "Execução"),
      descricaoServico: String(params["descricaoServico"] ?? ""),
      localServico: String(params["localServico"] ?? ""),
      contratante: String(params["contratante"] ?? ""),
      cnpjContratante: String(params["cnpjContratante"] ?? ""),
      valorServico: Number(params["valorServico"] ?? 0),
      dataInicio: String(params["dataInicio"] ?? new Date().toISOString().slice(0, 10)),
      dataConclusao: String(params["dataConclusao"] ?? ""),
      responsavelTecnico: String(params["responsavelTecnico"] ?? ""),
      crea: String(params["crea"] ?? ""),
      observacoes: String(params["observacoes"] ?? ""),
      status: "rascunho",
      avisoLegal: "⚠️ RASCUNHO — Não submetido. Revise todos os dados antes de registrar a ART no portal CREA. A submissão requer sua confirmação explícita.",
    };

    return {
      success: true,
      message: "Rascunho de ART montado. Revise e confirme para submeter.",
      draftContent: JSON.stringify(draft, null, 2),
      requiresHumanAction: true,
      humanActionDescription: "Revise o rascunho e acesse o portal CREA para submeter a ART manualmente.",
      data: { draft, portalLoginUrl: PORTAL_CONFIG[session.portalId].loginUrl },
    };
  }

  private async consultNfe(
    _session: PortalSession,
    params: Record<string, string | number | boolean>
  ): Promise<OperationalResult> {
    const chaveAcesso = String(params["chaveAcesso"] ?? "");
    return {
      success: true,
      message: "Consulta de NF-e preparada.",
      data: {
        portalUrl: `https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&tipoConteudo=XbSeqxE8pl8=&nfe=${chaveAcesso}`,
        instructions: [
          "1. Acesse o portal da SEFAZ",
          "2. Informe a chave de acesso da NF-e",
          "3. Resolva o CAPTCHA manualmente",
          "4. Visualize e baixe o DANFE",
        ],
        chaveAcesso,
      },
      requiresHumanAction: true,
      humanActionDescription: "O portal da SEFAZ requer resolução de CAPTCHA pelo usuário.",
    };
  }

  private async draftNfse(
    session: PortalSession,
    params: Record<string, string | number | boolean>
  ): Promise<OperationalResult> {
    const draft = {
      prestador: String(params["prestador"] ?? ""),
      cnpjPrestador: String(params["cnpjPrestador"] ?? ""),
      tomador: String(params["tomador"] ?? ""),
      cnpjTomador: String(params["cnpjTomador"] ?? ""),
      descricaoServico: String(params["descricaoServico"] ?? ""),
      valorServico: Number(params["valorServico"] ?? 0),
      aliquotaISS: Number(params["aliquotaISS"] ?? 2.0),
      codigoServico: String(params["codigoServico"] ?? "7.09"),
      competencia: String(params["competencia"] ?? new Date().toISOString().slice(0, 7)),
      status: "rascunho",
      avisoLegal: "⚠️ RASCUNHO — Não emitido. A emissão da NFS-e requer certificado digital e confirmação manual no portal municipal.",
    };

    return {
      success: true,
      message: "Rascunho de NFS-e montado. Revise e emita manualmente no portal.",
      draftContent: JSON.stringify(draft, null, 2),
      requiresHumanAction: true,
      humanActionDescription: `Acesse ${PORTAL_CONFIG[session.portalId].baseUrl} com seu certificado digital para emitir a NFS-e.`,
      data: { draft, portalLoginUrl: PORTAL_CONFIG[session.portalId].loginUrl },
    };
  }

  private async downloadReceipt(
    session: PortalSession,
    params: Record<string, string | number | boolean>
  ): Promise<OperationalResult> {
    const docType = String(params["docType"] ?? "recibo");
    const docId = String(params["docId"] ?? "");
    return {
      success: true,
      message: `Download de ${docType} preparado.`,
      data: {
        portalUrl: `${PORTAL_CONFIG[session.portalId].baseUrl}/portal/download?tipo=${docType}&id=${docId}`,
        instructions: ["Acesse o portal com a sessão autenticada para baixar o documento."],
      },
      requiresHumanAction: false,
    };
  }

  private async consultRegistration(
    session: PortalSession,
    params: Record<string, string | number | boolean>
  ): Promise<OperationalResult> {
    const cnpj = String(params["cnpj"] ?? "");
    return {
      success: true,
      message: "Consulta de cadastro preparada.",
      data: {
        portalUrl: `${PORTAL_CONFIG[session.portalId].baseUrl}/portal/cadastro?cnpj=${cnpj}`,
        instructions: ["Acesse o portal para visualizar os dados cadastrais."],
        cnpj,
      },
    };
  }

  // ── Consultas ──────────────────────────────────────────────────────────────

  getActiveSessions(userId: number): PortalSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.userId === userId && s.status === "active" && new Date() <= new Date(s.expiresAt)
    );
  }

  getTaskHistory(userId: number, limit = 50): OperationalTask[] {
    return this.tasks
      .filter((t) => t.userId === userId)
      .slice(-limit)
      .reverse();
  }

  getSupportedPortals(): Array<{ id: PortalId; name: string; actions: OperationalAction[]; loginUrl: string }> {
    return Object.entries(PORTAL_CONFIG).map(([id, cfg]) => ({
      id: id as PortalId,
      name: cfg.name,
      actions: cfg.supportedActions,
      loginUrl: cfg.loginUrl,
    }));
  }

  getStats(userId: number) {
    const userTasks = this.tasks.filter((t) => t.userId === userId);
    const sessions = this.getActiveSessions(userId);
    return {
      activeSessions: sessions.length,
      totalTasks: userTasks.length,
      completedTasks: userTasks.filter((t) => t.status === "done").length,
      blockedTasks: userTasks.filter((t) => t.status === "blocked" || t.status === "awaiting_confirmation").length,
      failedTasks: userTasks.filter((t) => t.status === "failed").length,
      supportedPortals: Object.keys(PORTAL_CONFIG).length,
    };
  }
}

export const operationalEngine = new OperationalEngine();

/**
 * OPERIS.enge — Agent Registry
 * Framework plug-and-play: qualquer agente pode ser registrado e ativado via configuração.
 * Nenhum agente está pré-instalado — o sistema está pronto para receber qualquer um.
 *
 * COMO ADICIONAR UM AGENTE:
 *   1. Crie um arquivo em providers/ implementando a interface AgentProvider
 *   2. Chame registerAgent(meuAgente) no seu arquivo
 *   3. Importe o arquivo em server/agents/operis-enge/index.ts
 *   Pronto — o agente aparece automaticamente no painel OPERIS.
 */

// ─── Tipos base ───────────────────────────────────────────────────────────────

export type AgentCapability =
  | "text-analysis"       // análise de texto / documentos
  | "pdf-extraction"      // extração de texto de PDFs
  | "dwg-parsing"         // leitura de arquivos DWG/DXF
  | "normative-check"     // verificação de conformidade normativa
  | "report-generation"   // geração de laudos e relatórios
  | "browser-automation"  // automação de navegador headless
  | "web-search"          // busca na web
  | "image-analysis"      // análise de imagens
  | "code-generation"     // geração de código
  | "data-extraction"     // extração estruturada de dados
  | "custom";             // capacidade customizada

export type AgentStatus = "available" | "busy" | "offline" | "error" | "unconfigured";

export type AgentTier = "free" | "local" | "paid" | "enterprise";

export interface AgentConfig {
  /** Identificador único do agente (slug) */
  id: string;
  /** Nome de exibição */
  name: string;
  /** Descrição do que o agente faz */
  description: string;
  /** Provedor da IA (ex: "anthropic", "openai", "google", "ollama", "custom") */
  provider: string;
  /** Modelo específico (ex: "claude-3-haiku", "gpt-4o", "gemini-pro") */
  model: string;
  /** Capacidades declaradas */
  capabilities: AgentCapability[];
  /** Tier de custo */
  tier: AgentTier;
  /** Se requer chave de API externa */
  requiresApiKey: boolean;
  /** Nome da variável de ambiente com a chave (ex: "OPENAI_API_KEY") */
  apiKeyEnvVar?: string;
  /** URL base para agentes self-hosted (ex: Ollama) */
  baseUrl?: string;
  /** Timeout máximo em ms para uma tarefa */
  timeoutMs: number;
  /** Máximo de tokens de contexto */
  maxContextTokens: number;
  /** Custo estimado por 1k tokens de input (USD) */
  costPer1kInputTokens: number;
  /** Custo estimado por 1k tokens de output (USD) */
  costPer1kOutputTokens: number;
  /** Metadados extras livres */
  meta?: Record<string, unknown>;
}

export interface AgentTask {
  taskId: string;
  agentId: string;
  type: AgentCapability;
  input: AgentTaskInput;
  status: "queued" | "running" | "done" | "failed" | "cancelled";
  result?: AgentTaskResult;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  tokensUsed?: number;
  costUsd?: number;
  triggeredBy: string; // userId
  companyId?: number;
}

export interface AgentTaskInput {
  prompt?: string;
  text?: string;
  fileUrl?: string;
  url?: string;
  context?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export interface AgentTaskResult {
  text?: string;
  json?: Record<string, unknown>;
  fileUrl?: string;
  screenshots?: string[];
  logs?: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentProvider {
  config: AgentConfig;
  /** Verifica se o agente está configurado e acessível */
  healthCheck(): Promise<AgentStatus>;
  /** Executa uma tarefa e retorna o resultado */
  execute(task: AgentTask): Promise<AgentTaskResult>;
}

// ─── Registry singleton ───────────────────────────────────────────────────────

class OperisEngeRegistry {
  private agents = new Map<string, AgentProvider>();
  private taskLog: AgentTask[] = [];

  /** Registra um agente no sistema */
  register(agent: AgentProvider): void {
    this.agents.set(agent.config.id, agent);
    console.info(`[OPERIS.enge] Agente registrado: ${agent.config.name} (${agent.config.id})`);
  }

  /** Remove um agente do sistema */
  unregister(agentId: string): void {
    this.agents.delete(agentId);
  }

  /** Lista todos os agentes registrados */
  listAgents(): AgentConfig[] {
    return Array.from(this.agents.values()).map((a) => a.config);
  }

  /** Obtém um agente por ID */
  getAgent(agentId: string): AgentProvider | undefined {
    return this.agents.get(agentId);
  }

  /** Verifica se há algum agente registrado */
  hasAgents(): boolean {
    return this.agents.size > 0;
  }

  /** Encontra agentes com uma capacidade específica */
  findByCapability(capability: AgentCapability): AgentProvider[] {
    return Array.from(this.agents.values()).filter((a) =>
      a.config.capabilities.includes(capability)
    );
  }

  /** Seleciona o melhor agente para uma tarefa (menor custo + disponível) */
  selectBestAgent(capability: AgentCapability): AgentProvider | null {
    const candidates = this.findByCapability(capability);
    if (candidates.length === 0) return null;

    // Ordena por custo (tier: free > local > paid > enterprise)
    const tierOrder: Record<AgentTier, number> = {
      free: 0,
      local: 1,
      paid: 2,
      enterprise: 3,
    };

    return candidates.sort(
      (a, b) => tierOrder[a.config.tier] - tierOrder[b.config.tier]
    )[0] ?? null;
  }

  /** Executa uma tarefa no agente selecionado */
  async runTask(task: AgentTask): Promise<AgentTask> {
    const agent = this.agents.get(task.agentId);
    if (!agent) {
      task.status = "failed";
      task.error = `Agente '${task.agentId}' não encontrado no registry`;
      return task;
    }

    task.status = "running";
    task.startedAt = new Date();

    try {
      const result = await Promise.race([
        agent.execute(task),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout após ${agent.config.timeoutMs}ms`)),
            agent.config.timeoutMs
          )
        ),
      ]);

      task.status = "done";
      task.result = result;
      task.completedAt = new Date();
      task.durationMs = task.completedAt.getTime() - task.startedAt.getTime();
    } catch (err) {
      task.status = "failed";
      task.error = err instanceof Error ? err.message : String(err);
      task.completedAt = new Date();
    }

    this.taskLog.push(task);
    return task;
  }

  /** Retorna o log de tarefas (últimas N) */
  getTaskLog(limit = 50): AgentTask[] {
    return this.taskLog.slice(-limit).reverse();
  }

  /** Status geral do registry */
  getStatus() {
    return {
      totalAgents: this.agents.size,
      agentIds: Array.from(this.agents.keys()),
      totalTasksRun: this.taskLog.length,
      ready: this.agents.size > 0,
      message:
        this.agents.size === 0
          ? "Nenhum agente registrado. Adicione um provider em server/agents/operis-enge/providers/"
          : `${this.agents.size} agente(s) disponível(is)`,
    };
  }
}

// Singleton global
export const engeRegistry = new OperisEngeRegistry();

/**
 * ─── Service Manager — Ponte de Comando com Streaming Real ──────────────────
 * JULY AOG | OPERIS Command Center
 *
 * Usa node:child_process.spawn (NÃO exec) para streaming em tempo real.
 * Cada linha de stdout/stderr é emitida imediatamente ao cliente via SSE/polling.
 * Diagnóstico de erros via Gemma 2 local (Ollama).
 *
 * Whitelist de Manutenção:
 *   - Gestão de Código:    npm install, npm run build, npm run dev
 *   - Gestão de Serviços:  docker compose restart/up/down/pull
 *   - Manutenção Linux:    sudo apt update, sudo apt upgrade, df -h, free -h
 *   - OPERIS Sync:         ~/sync_operis.sh, ollama pull/run
 *   - Limpeza Docker:      docker system prune, truncate logs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { spawn, ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import axios from "axios";

const OLLAMA_BASE = process.env.OLLAMA_HOST ?? "http://localhost:11434";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type CommandStatus = "idle" | "running" | "success" | "error" | "killed";
export type OutputLine = {
  type: "stdout" | "stderr" | "system" | "error_diagnosis";
  text: string;
  timestamp: string;
};

export interface ManagedCommand {
  id: string;
  commandId: string;
  label: string;
  fullCommand: string;
  args: string[];
  status: CommandStatus;
  pid?: number;
  startedAt: string;
  completedAt?: string;
  exitCode?: number;
  output: OutputLine[];
  errorDiagnosis?: string;
  errorModel?: string;
}

// ─── Whitelist de Comandos de Manutenção ─────────────────────────────────────
export interface MaintenanceCommand {
  id: string;
  label: string;
  description: string;
  category: "code" | "services" | "linux" | "sync" | "cleanup" | "ai";
  command: string;
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
  dangerous: boolean;
  requiresConfirm: boolean;
  timeout: number; // ms
  icon: string;
  successPattern?: RegExp;  // regex para detectar sucesso no output
  errorPattern?: RegExp;    // regex para detectar erro no output
}

export const MAINTENANCE_COMMANDS: MaintenanceCommand[] = [
  // ── Gestão de Código ──────────────────────────────────────────────────────
  {
    id: "npm-install",
    label: "npm install",
    description: "Instala todas as dependências do projeto",
    category: "code",
    command: "npm",
    args: ["install"],
    cwd: process.cwd(),
    dangerous: false,
    requiresConfirm: false,
    timeout: 300_000,
    icon: "📦",
    successPattern: /added \d+ packages/,
    errorPattern: /npm ERR!|ENOENT|EACCES/,
  },
  {
    id: "npm-install-prod",
    label: "npm install --production",
    description: "Instala apenas dependências de produção",
    category: "code",
    command: "npm",
    args: ["install", "--production"],
    cwd: process.cwd(),
    dangerous: false,
    requiresConfirm: false,
    timeout: 300_000,
    icon: "📦",
    errorPattern: /npm ERR!/,
  },
  {
    id: "npm-build",
    label: "npm run build",
    description: "Compila o projeto para produção",
    category: "code",
    command: "npm",
    args: ["run", "build"],
    cwd: process.cwd(),
    dangerous: false,
    requiresConfirm: false,
    timeout: 600_000,
    icon: "🔨",
    successPattern: /built in|Build complete|✓/,
    errorPattern: /error TS|Build failed|ERROR/,
  },
  {
    id: "npm-typecheck",
    label: "npm run typecheck",
    description: "Verifica erros TypeScript",
    category: "code",
    command: "npm",
    args: ["run", "typecheck"],
    cwd: process.cwd(),
    dangerous: false,
    requiresConfirm: false,
    timeout: 120_000,
    icon: "🔍",
    errorPattern: /error TS/,
  },
  {
    id: "pnpm-install",
    label: "pnpm install",
    description: "Instala dependências via pnpm (mais rápido)",
    category: "code",
    command: "pnpm",
    args: ["install"],
    cwd: process.cwd(),
    dangerous: false,
    requiresConfirm: false,
    timeout: 300_000,
    icon: "📦",
    errorPattern: /ERR_PNPM|ENOENT/,
  },

  // ── Gestão de Serviços Docker ─────────────────────────────────────────────
  {
    id: "docker-compose-restart",
    label: "docker compose restart",
    description: "Reinicia todos os containers do OPERIS",
    category: "services",
    command: "docker",
    args: ["compose", "restart"],
    dangerous: false,
    requiresConfirm: true,
    timeout: 120_000,
    icon: "🔄",
    successPattern: /Started|Running/,
    errorPattern: /Error|failed/i,
  },
  {
    id: "docker-compose-up",
    label: "docker compose up -d",
    description: "Inicia todos os containers em background",
    category: "services",
    command: "docker",
    args: ["compose", "up", "-d"],
    dangerous: false,
    requiresConfirm: false,
    timeout: 180_000,
    icon: "▶️",
    successPattern: /Started|Running/,
    errorPattern: /Error|failed/i,
  },
  {
    id: "docker-compose-down",
    label: "docker compose down",
    description: "Para e remove todos os containers",
    category: "services",
    command: "docker",
    args: ["compose", "down"],
    dangerous: true,
    requiresConfirm: true,
    timeout: 60_000,
    icon: "⏹️",
  },
  {
    id: "docker-compose-pull",
    label: "docker compose pull",
    description: "Atualiza as imagens Docker do projeto",
    category: "services",
    command: "docker",
    args: ["compose", "pull"],
    dangerous: false,
    requiresConfirm: false,
    timeout: 600_000,
    icon: "⬇️",
  },
  {
    id: "docker-compose-logs",
    label: "docker compose logs --tail=50",
    description: "Exibe os últimos 50 logs de todos os containers",
    category: "services",
    command: "docker",
    args: ["compose", "logs", "--tail=50"],
    dangerous: false,
    requiresConfirm: false,
    timeout: 15_000,
    icon: "📋",
  },
  {
    id: "docker-prune",
    label: "docker system prune -f",
    description: "Remove containers, imagens e volumes não utilizados",
    category: "cleanup",
    command: "docker",
    args: ["system", "prune", "-f"],
    dangerous: true,
    requiresConfirm: true,
    timeout: 120_000,
    icon: "🗑️",
    successPattern: /Total reclaimed space/,
  },
  {
    id: "docker-logs-clean",
    label: "Limpar Logs Docker (SSD)",
    description: "Trunca os logs dos containers para liberar espaço no SSD de 240GB",
    category: "cleanup",
    command: "bash",
    args: ["-c", "find /var/lib/docker/containers -name '*.log' -exec truncate -s 0 {} \\; && echo 'Logs limpos com sucesso'"],
    dangerous: true,
    requiresConfirm: true,
    timeout: 30_000,
    icon: "🧹",
    successPattern: /Logs limpos/,
  },

  // ── Manutenção Linux Mint ─────────────────────────────────────────────────
  {
    id: "apt-update",
    label: "sudo apt update",
    description: "Atualiza a lista de pacotes do Linux Mint",
    category: "linux",
    command: "sudo",
    args: ["apt", "update", "-y"],
    dangerous: false,
    requiresConfirm: false,
    timeout: 120_000,
    icon: "🐧",
    successPattern: /packages can be upgraded|All packages are up to date/,
    errorPattern: /E:|Err:/,
  },
  {
    id: "apt-upgrade",
    label: "sudo apt upgrade -y",
    description: "Instala atualizações de segurança do sistema",
    category: "linux",
    command: "sudo",
    args: ["apt", "upgrade", "-y"],
    dangerous: false,
    requiresConfirm: true,
    timeout: 600_000,
    icon: "🔒",
    errorPattern: /E:|Err:|dpkg/,
  },
  {
    id: "apt-autoremove",
    label: "sudo apt autoremove -y",
    description: "Remove pacotes desnecessários do sistema",
    category: "linux",
    command: "sudo",
    args: ["apt", "autoremove", "-y"],
    dangerous: false,
    requiresConfirm: false,
    timeout: 120_000,
    icon: "🗑️",
  },
  {
    id: "disk-check",
    label: "df -h",
    description: "Verifica o uso de disco em todos os pontos de montagem",
    category: "linux",
    command: "df",
    args: ["-h"],
    dangerous: false,
    requiresConfirm: false,
    timeout: 10_000,
    icon: "💾",
  },
  {
    id: "memory-check",
    label: "free -h",
    description: "Verifica o uso de memória RAM e SWAP",
    category: "linux",
    command: "free",
    args: ["-h"],
    dangerous: false,
    requiresConfirm: false,
    timeout: 5_000,
    icon: "🧠",
  },

  // ── OPERIS Sync & IA ──────────────────────────────────────────────────────
  {
    id: "sync-operis",
    label: "~/sync_operis.sh",
    description: "Executa o script de sincronização do OPERIS para o HD 1TB",
    category: "sync",
    command: "bash",
    args: ["-c", "[ -f ~/sync_operis.sh ] && bash ~/sync_operis.sh || echo 'Script ~/sync_operis.sh não encontrado. Crie-o primeiro.'"],
    dangerous: false,
    requiresConfirm: false,
    timeout: 600_000,
    icon: "🔄",
    successPattern: /sync.*complete|rsync.*done/i,
    errorPattern: /error|failed|not found/i,
  },
  {
    id: "ollama-list",
    label: "ollama list",
    description: "Lista todos os modelos de IA instalados",
    category: "ai",
    command: "ollama",
    args: ["list"],
    dangerous: false,
    requiresConfirm: false,
    timeout: 15_000,
    icon: "🤖",
  },
  {
    id: "ollama-ps",
    label: "ollama ps",
    description: "Mostra os modelos de IA em execução",
    category: "ai",
    command: "ollama",
    args: ["ps"],
    dangerous: false,
    requiresConfirm: false,
    timeout: 10_000,
    icon: "🤖",
  },
];

// ─── Armazenamento de processos ativos ────────────────────────────────────────
const activeProcesses = new Map<string, ChildProcess>();
const commandHistory = new Map<string, ManagedCommand>();
const commandEmitter = new EventEmitter();
commandEmitter.setMaxListeners(100);

// ─── Executor principal com spawn ─────────────────────────────────────────────
export function spawnCommand(
  commandId: string,
  extraArgs: string[] = [],
  onOutput?: (line: OutputLine) => void
): { runId: string; promise: Promise<ManagedCommand> } {
  const cmdDef = MAINTENANCE_COMMANDS.find(c => c.id === commandId);
  if (!cmdDef) throw new Error(`Comando '${commandId}' não está na whitelist de manutenção`);

  const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const allArgs = [...cmdDef.args, ...extraArgs];
  const fullCommand = `${cmdDef.command} ${allArgs.join(" ")}`;

  const managed: ManagedCommand = {
    id: runId,
    commandId,
    label: cmdDef.label,
    fullCommand,
    args: allArgs,
    status: "running",
    startedAt: new Date().toISOString(),
    output: [],
  };

  commandHistory.set(runId, managed);

  const emit = (line: OutputLine) => {
    managed.output.push(line);
    onOutput?.(line);
    commandEmitter.emit(`output:${runId}`, line);
    commandEmitter.emit("output:any", { runId, line });
  };

  emit({
    type: "system",
    text: `▶ Iniciando: ${fullCommand}`,
    timestamp: new Date().toISOString(),
  });

  const promise = new Promise<ManagedCommand>((resolve) => {
    const child = spawn(cmdDef.command, allArgs, {
      cwd: cmdDef.cwd ?? process.cwd(),
      env: {
        ...process.env,
        ...cmdDef.env,
        FORCE_COLOR: "1",
        TERM: "xterm-256color",
      },
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    managed.pid = child.pid;
    activeProcesses.set(runId, child);

    // ── stdout streaming ──────────────────────────────────────────────────
    child.stdout?.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n").filter(l => l.trim());
      for (const line of lines) {
        emit({ type: "stdout", text: line, timestamp: new Date().toISOString() });
      }
    });

    // ── stderr streaming ──────────────────────────────────────────────────
    child.stderr?.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n").filter(l => l.trim());
      for (const line of lines) {
        // npm usa stderr para progresso normal — não tratar como erro
        const isProgress = /^npm (warn|notice)|^\s*[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]|^added|^changed|^removed/.test(line);
        emit({
          type: isProgress ? "stdout" : "stderr",
          text: line,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // ── Timeout ───────────────────────────────────────────────────────────
    const timeoutHandle = setTimeout(() => {
      child.kill("SIGTERM");
      emit({
        type: "system",
        text: `⏱ Timeout após ${cmdDef.timeout / 1000}s — processo encerrado`,
        timestamp: new Date().toISOString(),
      });
    }, cmdDef.timeout);

    // ── Conclusão ─────────────────────────────────────────────────────────
    child.on("close", async (code) => {
      clearTimeout(timeoutHandle);
      activeProcesses.delete(runId);

      managed.exitCode = code ?? -1;
      managed.completedAt = new Date().toISOString();

      const hasError = code !== 0 || managed.output.some(l =>
        l.type === "stderr" && cmdDef.errorPattern?.test(l.text)
      );

      managed.status = hasError ? "error" : "success";

      const statusIcon = hasError ? "✗" : "✓";
      const duration = Math.round(
        (new Date(managed.completedAt).getTime() - new Date(managed.startedAt).getTime()) / 1000
      );

      emit({
        type: "system",
        text: `${statusIcon} Concluído em ${duration}s — Exit code: ${code}`,
        timestamp: new Date().toISOString(),
      });

      // ── Diagnóstico de erro com Gemma 2 ──────────────────────────────────
      if (hasError) {
        emit({
          type: "system",
          text: "🔍 Analisando erro com Gemma 2...",
          timestamp: new Date().toISOString(),
        });

        const diagnosis = await diagnoseError(
          fullCommand,
          managed.output.filter(l => l.type === "stderr").map(l => l.text).join("\n"),
          managed.output.filter(l => l.type === "stdout").slice(-20).map(l => l.text).join("\n")
        );

        if (diagnosis) {
          managed.errorDiagnosis = diagnosis.diagnosis;
          managed.errorModel = diagnosis.model;
          emit({
            type: "error_diagnosis",
            text: diagnosis.diagnosis,
            timestamp: new Date().toISOString(),
          });
        }
      }

      commandEmitter.emit(`complete:${runId}`, managed);
      resolve(managed);
    });

    child.on("error", (err) => {
      clearTimeout(timeoutHandle);
      activeProcesses.delete(runId);
      managed.status = "error";
      managed.completedAt = new Date().toISOString();
      emit({
        type: "stderr",
        text: `Erro ao iniciar processo: ${err.message}`,
        timestamp: new Date().toISOString(),
      });
      commandEmitter.emit(`complete:${runId}`, managed);
      resolve(managed);
    });
  });

  return { runId, promise };
}

// ─── Diagnóstico de Erro com Gemma 2 ─────────────────────────────────────────
async function diagnoseError(
  command: string,
  stderrOutput: string,
  stdoutContext: string
): Promise<{ diagnosis: string; model: string } | null> {
  // Tentar Gemma 2 primeiro, depois Llama 3, depois Mistral
  const models = ["gemma2", "llama3", "mistral", "phi3"];

  for (const model of models) {
    try {
      const prompt = `Você é um engenheiro DevOps especialista em Node.js, Docker e Linux.

O seguinte comando falhou:
\`\`\`
${command}
\`\`\`

Saída de erro:
\`\`\`
${stderrOutput.slice(0, 1500)}
\`\`\`

Contexto (últimas linhas de stdout):
\`\`\`
${stdoutContext.slice(0, 500)}
\`\`\`

Forneça um diagnóstico CIRÚRGICO e DIRETO em português brasileiro:
1. **Causa raiz** do erro (1 frase)
2. **Solução imediata** (comando ou ação específica)
3. **Prevenção** (como evitar no futuro)

Seja conciso. Máximo 120 palavras. Use markdown.`;

      const res = await axios.post(
        `${OLLAMA_BASE}/api/generate`,
        {
          model,
          prompt,
          stream: false,
          options: { temperature: 0.2, top_p: 0.9, num_predict: 400 },
        },
        { timeout: 45_000 }
      );

      const diagnosis = res.data?.response?.trim();
      if (diagnosis && diagnosis.length > 20) {
        return { diagnosis, model };
      }
    } catch {
      continue; // tentar próximo modelo
    }
  }

  return null;
}

// ─── Controle de processos ────────────────────────────────────────────────────
export function killProcess(runId: string): boolean {
  const child = activeProcesses.get(runId);
  if (!child) return false;
  child.kill("SIGTERM");
  setTimeout(() => {
    if (activeProcesses.has(runId)) child.kill("SIGKILL");
  }, 3000);
  const managed = commandHistory.get(runId);
  if (managed) {
    managed.status = "killed";
    managed.completedAt = new Date().toISOString();
  }
  return true;
}

export function getCommandHistory(limit = 20): ManagedCommand[] {
  return Array.from(commandHistory.values())
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}

export function getCommandRun(runId: string): ManagedCommand | null {
  return commandHistory.get(runId) ?? null;
}

export function getActiveRuns(): ManagedCommand[] {
  return Array.from(commandHistory.values()).filter(c => c.status === "running");
}

// ─── Polling de output (para SSE-like via tRPC) ───────────────────────────────
export function getOutputSince(runId: string, sinceIndex: number): {
  lines: OutputLine[];
  status: CommandStatus;
  completed: boolean;
  errorDiagnosis?: string;
  errorModel?: string;
} {
  const managed = commandHistory.get(runId);
  if (!managed) {
    return { lines: [], status: "idle", completed: true };
  }
  return {
    lines: managed.output.slice(sinceIndex),
    status: managed.status,
    completed: managed.status !== "running",
    errorDiagnosis: managed.errorDiagnosis,
    errorModel: managed.errorModel,
  };
}

// ─── Estatísticas do Service Manager ─────────────────────────────────────────
export function getServiceManagerStats() {
  const all = Array.from(commandHistory.values());
  return {
    totalRuns: all.length,
    activeRuns: all.filter(c => c.status === "running").length,
    successRuns: all.filter(c => c.status === "success").length,
    errorRuns: all.filter(c => c.status === "error").length,
    killedRuns: all.filter(c => c.status === "killed").length,
    commandsAvailable: MAINTENANCE_COMMANDS.length,
    lastRun: all.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0] ?? null,
  };
}

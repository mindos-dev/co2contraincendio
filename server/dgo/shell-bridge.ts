/**
 * ─── Shell Bridge — Execução Segura de Comandos no Host ─────────────────────
 * JULY AOG — Soberania Digital: Zero execução arbitrária.
 * Apenas comandos da whitelist são permitidos.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface AllowedCommand {
  id: string;
  label: string;
  description: string;
  category: "ai" | "disk" | "system" | "sync" | "network";
  command: string;
  args?: string[];
  dangerous?: boolean;
  timeout?: number; // ms
}

export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// ─── Whitelist de Comandos Permitidos ─────────────────────────────────────────
export const ALLOWED_COMMANDS: AllowedCommand[] = [
  // ── Ollama / IA ──────────────────────────────────────────────────────────
  {
    id: "ollama-list",
    label: "Listar Modelos IA",
    description: "Lista todos os modelos Ollama instalados",
    category: "ai",
    command: "ollama list",
    timeout: 10_000,
  },
  {
    id: "ollama-run-gemma2",
    label: "Ativar Gemma 2",
    description: "Inicia o modelo Gemma 2 no Ollama",
    category: "ai",
    command: "ollama run gemma2 --keepalive 24h &",
    timeout: 30_000,
  },
  {
    id: "ollama-run-llama3",
    label: "Ativar Llama 3",
    description: "Inicia o modelo Llama 3 no Ollama",
    category: "ai",
    command: "ollama run llama3 --keepalive 24h &",
    timeout: 30_000,
  },
  {
    id: "ollama-run-mistral",
    label: "Ativar Mistral",
    description: "Inicia o modelo Mistral 7B no Ollama",
    category: "ai",
    command: "ollama run mistral --keepalive 24h &",
    timeout: 30_000,
  },
  {
    id: "ollama-run-deepseek",
    label: "Ativar DeepSeek R1",
    description: "Inicia o modelo DeepSeek R1 no Ollama",
    category: "ai",
    command: "ollama run deepseek-r1 --keepalive 24h &",
    timeout: 30_000,
  },
  {
    id: "ollama-run-phi3",
    label: "Ativar Phi-3",
    description: "Inicia o modelo Phi-3 Mini no Ollama",
    category: "ai",
    command: "ollama run phi3 --keepalive 24h &",
    timeout: 30_000,
  },
  {
    id: "ollama-stop",
    label: "Parar Ollama",
    description: "Para o processo Ollama em execução",
    category: "ai",
    command: "pkill -f 'ollama run' || true",
    timeout: 10_000,
    dangerous: true,
  },
  // ── Disco ────────────────────────────────────────────────────────────────
  {
    id: "df-all",
    label: "Uso de Disco (Todos)",
    description: "Exibe uso de disco de todos os pontos de montagem",
    category: "disk",
    command: "df -h",
    timeout: 5_000,
  },
  {
    id: "df-backup",
    label: "Disco BACKUP_CO2",
    description: "Exibe uso do HD de backup /media/aleixo/BACKUP_CO2",
    category: "disk",
    command: "df -h /media/aleixo/BACKUP_CO2",
    timeout: 5_000,
  },
  {
    id: "du-backup",
    label: "Tamanho Pasta Backup",
    description: "Calcula tamanho total da pasta de backup",
    category: "disk",
    command: "du -sh /media/aleixo/BACKUP_CO2/* 2>/dev/null | sort -rh | head -20",
    timeout: 30_000,
  },
  // ── Sistema ──────────────────────────────────────────────────────────────
  {
    id: "top-snapshot",
    label: "Snapshot CPU/RAM",
    description: "Snapshot instantâneo de uso de CPU e memória",
    category: "system",
    command: "top -bn1 | head -20",
    timeout: 5_000,
  },
  {
    id: "free-mem",
    label: "Memória RAM",
    description: "Uso atual de memória RAM e swap",
    category: "system",
    command: "free -h",
    timeout: 5_000,
  },
  {
    id: "uptime",
    label: "Uptime do Sistema",
    description: "Tempo de atividade e carga do sistema",
    category: "system",
    command: "uptime",
    timeout: 5_000,
  },
  {
    id: "sensors",
    label: "Temperatura (Sensores)",
    description: "Temperatura dos sensores de hardware",
    category: "system",
    command: "sensors 2>/dev/null || cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null | awk '{print $1/1000\"°C\"}' || echo 'Sensores indisponíveis'",
    timeout: 5_000,
  },
  {
    id: "nvidia-smi",
    label: "GPU NVIDIA",
    description: "Status da GPU NVIDIA (temperatura, uso, VRAM)",
    category: "system",
    command: "nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv,noheader 2>/dev/null || echo 'GPU NVIDIA não detectada'",
    timeout: 10_000,
  },
  // ── Sincronização ────────────────────────────────────────────────────────
  {
    id: "sync-operis",
    label: "Sincronizar OPERIS",
    description: "Executa o script de sincronização ~/sync_operis.sh",
    category: "sync",
    command: "bash ~/sync_operis.sh 2>&1",
    timeout: 120_000,
    dangerous: true,
  },
  {
    id: "docker-ps",
    label: "Containers Docker",
    description: "Lista containers Docker em execução",
    category: "system",
    command: "docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'",
    timeout: 10_000,
  },
  {
    id: "docker-stats-snapshot",
    label: "Stats Docker (Snapshot)",
    description: "Snapshot de CPU/RAM de todos os containers",
    category: "system",
    command: "docker stats --no-stream --format 'table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}'",
    timeout: 15_000,
  },
  // ── Rede ─────────────────────────────────────────────────────────────────
  {
    id: "netstat",
    label: "Conexões de Rede",
    description: "Lista portas abertas e conexões ativas",
    category: "network",
    command: "ss -tulnp 2>/dev/null | head -30",
    timeout: 5_000,
  },
  {
    id: "ping-ollama",
    label: "Ping Ollama API",
    description: "Verifica se a API do Ollama está respondendo",
    category: "network",
    command: "curl -s --max-time 5 http://localhost:11434/api/tags | head -c 200 || echo 'Ollama offline'",
    timeout: 10_000,
  },
];

// ─── Mapa de comandos por ID ──────────────────────────────────────────────────
const COMMAND_MAP = new Map<string, AllowedCommand>(
  ALLOWED_COMMANDS.map((cmd) => [cmd.id, cmd])
);

// ─── Executar comando da whitelist ────────────────────────────────────────────
export async function executeShellCommand(
  commandId: string,
  extraArgs: string[] = []
): Promise<ShellResult> {
  const cmd = COMMAND_MAP.get(commandId);

  if (!cmd) {
    throw new Error(
      `Comando '${commandId}' não está na whitelist. Apenas comandos autorizados são permitidos.`
    );
  }

  // Sanitizar argumentos extras (apenas alphanumeric, /, -, _, .)
  const sanitizedArgs = extraArgs.map((arg) => {
    if (!/^[a-zA-Z0-9\-_./: ]+$/.test(arg)) {
      throw new Error(`Argumento inválido detectado: '${arg}'`);
    }
    return arg;
  });

  const fullCommand = sanitizedArgs.length > 0
    ? `${cmd.command} ${sanitizedArgs.join(" ")}`
    : cmd.command;

  const timeout = cmd.timeout ?? 30_000;

  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout,
      maxBuffer: 1024 * 1024, // 1MB max output
      shell: "/bin/bash",
    });

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout?.trim() ?? "",
      stderr: error.stderr?.trim() ?? error.message,
      exitCode: error.code ?? 1,
    };
  }
}

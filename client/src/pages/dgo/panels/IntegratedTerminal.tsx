/**
 * ─── Integrated Terminal — Terminal de Automação ─────────────────────────────
 * ENTREGA DIAMANTE | Módulo 4: Terminal Integrado
 *
 * Console funcional para disparar comandos de automação direto no Dashboard
 * Whitelist de segurança + spawn streaming + histórico de comandos
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import {
  Terminal, Play, X, ChevronRight, Clock, CheckCircle2,
  AlertTriangle, Loader2, RefreshCw, Copy, Trash2,
  ChevronUp, ChevronDown, Zap, Shield
} from "lucide-react";

// ─── Paleta dark industrial ───────────────────────────────────────────────────
const D = {
  s1:   "bg-[#111111]",
  s2:   "bg-[#0d0d0d]",
  b1:   "border-[#222222]",
  b2:   "border-[#2a2a2a]",
  text: "text-[#e5e5e5]",
  muted:"text-[#888888]",
  dim:  "text-[#555555]",
  green:"text-[#4ade80]",
  red:  "text-[#f87171]",
  yellow:"text-[#facc15]",
  blue: "text-[#60a5fa]",
  orange:"text-[#fb923c]",
};

// ─── Comandos rápidos da whitelist ────────────────────────────────────────────
const QUICK_COMMANDS = [
  {
    group: "SINCRONIZAÇÃO",
    commands: [
      { label: "Sync OPERIS",     cmd: "~/sync_operis.sh",                     icon: "🔄", color: "orange" },
      { label: "Git Pull",        cmd: "git -C /app pull origin main",          icon: "⬇️", color: "blue" },
    ],
  },
  {
    group: "DOCKER",
    commands: [
      { label: "Status",          cmd: "docker compose ps",                     icon: "📋", color: "cyan" },
      { label: "Restart App",     cmd: "docker compose restart app",            icon: "🔁", color: "yellow" },
      { label: "Restart DB",      cmd: "docker compose restart db",             icon: "🔁", color: "yellow" },
      { label: "Logs App",        cmd: "docker compose logs --tail=50 app",     icon: "📄", color: "gray" },
      { label: "Limpar Logs",     cmd: "docker system prune -f --volumes=false",icon: "🧹", color: "red" },
    ],
  },
  {
    group: "OLLAMA / IAs",
    commands: [
      { label: "Gemma 2",         cmd: "ollama run gemma2",                     icon: "🤖", color: "purple" },
      { label: "Llama 3",         cmd: "ollama run llama3",                     icon: "🦙", color: "purple" },
      { label: "Listar Modelos",  cmd: "ollama list",                           icon: "📋", color: "purple" },
      { label: "Status Ollama",   cmd: "ollama ps",                             icon: "📊", color: "purple" },
    ],
  },
  {
    group: "SISTEMA",
    commands: [
      { label: "Uso de Disco",    cmd: "df -h",                                 icon: "💾", color: "green" },
      { label: "Uso de RAM",      cmd: "free -h",                               icon: "🧠", color: "green" },
      { label: "CPU & Processos", cmd: "top -bn1 | head -20",                   icon: "⚡", color: "green" },
      { label: "Temperatura",     cmd: "cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null | head -5", icon: "🌡️", color: "red" },
      { label: "Apt Update",      cmd: "sudo apt update -y",                    icon: "📦", color: "blue" },
    ],
  },
  {
    group: "BUILD",
    commands: [
      { label: "npm install",     cmd: "npm install --legacy-peer-deps",        icon: "📦", color: "green" },
      { label: "npm build",       cmd: "npm run build",                         icon: "🔨", color: "green" },
      { label: "DB Push",         cmd: "npx drizzle-kit push",                  icon: "🗄️", color: "blue" },
    ],
  },
];

// ─── Linha do terminal ────────────────────────────────────────────────────────
interface TermLine {
  type: "cmd" | "stdout" | "stderr" | "info" | "success" | "error";
  text: string;
  time: string;
}

function TerminalLine({ line }: { line: TermLine }) {
  const colorMap = {
    cmd:     `${D.orange} font-bold`,
    stdout:  D.text,
    stderr:  D.red,
    info:    D.blue,
    success: D.green,
    error:   D.red,
  };
  const prefix = {
    cmd:     "$ ",
    stdout:  "  ",
    stderr:  "✗ ",
    info:    "ℹ ",
    success: "✓ ",
    error:   "✗ ",
  };
  return (
    <div className={`flex gap-2 text-xs font-mono leading-relaxed ${colorMap[line.type]}`}>
      <span className={`flex-shrink-0 ${D.dim} text-[10px]`}>{line.time}</span>
      <span className="flex-shrink-0 opacity-60">{prefix[line.type]}</span>
      <span className="break-all whitespace-pre-wrap">{line.text}</span>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function IntegratedTerminal() {
  const [lines, setLines]           = useState<TermLine[]>([
    { type: "info", text: "OPERIS Command Center — Terminal de Automação", time: "" },
    { type: "info", text: "Comandos da whitelist disponíveis. Digite ou clique em um atalho.", time: "" },
    { type: "info", text: "─────────────────────────────────────────────────────────", time: "" },
  ]);
  const [input, setInput]           = useState("");
  const [isRunning, setIsRunning]   = useState(false);
  const [history, setHistory]       = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [jobId, setJobId]           = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const execMutation = trpc.dgo.serviceManager.execute.useMutation();
  const outputQuery  = trpc.dgo.serviceManager.getOutput.useQuery(
    { jobId: jobId ?? "" },
    { enabled: !!jobId && isRunning, refetchInterval: 800 }
  );

  const addLine = useCallback((type: TermLine["type"], text: string) => {
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLines(prev => [...prev, { type, text, time }]);
  }, []);

  // Processar output do servidor
  useEffect(() => {
    const data = outputQuery.data as any;
    if (!data) return;

    if (data.lines?.length > 0) {
      data.lines.forEach((l: any) => {
        addLine(l.stream === "stderr" ? "stderr" : "stdout", l.text);
      });
    }

    if (data.status === "completed") {
      addLine("success", `Processo concluído (exit code: ${data.exitCode ?? 0})`);
      setIsRunning(false);
      setJobId(null);
    } else if (data.status === "error" || data.status === "failed") {
      addLine("error", `Processo falhou: ${data.error ?? "erro desconhecido"}`);
      setIsRunning(false);
      setJobId(null);
    }
  }, [outputQuery.data, addLine]);

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const runCommand = useCallback(async (cmd: string) => {
    if (!cmd.trim() || isRunning) return;

    addLine("cmd", cmd);
    setHistory(prev => [cmd, ...prev.slice(0, 49)]);
    setHistoryIdx(-1);
    setInput("");
    setIsRunning(true);

    try {
      const result = await execMutation.mutateAsync({ command: cmd }) as any;
      if (result?.jobId) {
        setJobId(result.jobId);
        addLine("info", `Processo iniciado (job: ${result.jobId})`);
      } else if (result?.output) {
        addLine("stdout", result.output);
        setIsRunning(false);
      } else if (result?.error) {
        addLine("error", result.error);
        setIsRunning(false);
      }
    } catch (err: any) {
      addLine("error", err.message ?? "Erro ao executar comando");
      setIsRunning(false);
    }
  }, [isRunning, execMutation, addLine]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(idx);
      setInput(history[idx] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(idx);
      setInput(idx === -1 ? "" : history[idx] ?? "");
    } else if (e.key === "c" && e.ctrlKey) {
      if (isRunning) {
        setIsRunning(false);
        setJobId(null);
        addLine("error", "^C — Processo interrompido pelo usuário");
      }
    }
  };

  const clearTerminal = () => {
    setLines([
      { type: "info", text: "Terminal limpo.", time: new Date().toLocaleTimeString("pt-BR") },
    ]);
  };

  const copyOutput = () => {
    const text = lines.map(l => `${l.time} ${l.text}`).join("\n");
    navigator.clipboard.writeText(text);
    addLine("info", "Output copiado para a área de transferência");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-sm font-mono font-bold ${D.text} tracking-wider flex items-center gap-2`}>
            <Terminal className="w-4 h-4 text-green-400" />
            TERMINAL INTEGRADO
          </h2>
          <p className={`text-xs ${D.muted} mt-0.5`}>Console de automação com whitelist de segurança</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
            <span className={`text-[10px] font-mono ${isRunning ? "text-yellow-400" : "text-green-400"}`}>
              {isRunning ? "EXECUTANDO" : "PRONTO"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Terminal principal */}
        <div className="flex-1 min-w-0">
          <div className={`${D.s2} border ${D.b1} rounded-lg overflow-hidden`}>
            {/* Barra de título */}
            <div className={`flex items-center justify-between px-3 py-2 border-b ${D.b1} bg-[#0a0a0a]`}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/60" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <span className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className={`text-[10px] font-mono ${D.dim}`}>operis-terminal</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={copyOutput} className={`p-1 rounded ${D.dim} hover:${D.muted} transition-colors`} title="Copiar output">
                  <Copy className="w-3 h-3" />
                </button>
                <button onClick={clearTerminal} className={`p-1 rounded ${D.dim} hover:text-red-400 transition-colors`} title="Limpar terminal">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Output */}
            <div
              ref={outputRef}
              className="p-3 h-80 overflow-y-auto space-y-0.5 cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              {lines.map((line, i) => (
                <TerminalLine key={i} line={line} />
              ))}

              {/* Cursor de input */}
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-mono ${D.green} flex-shrink-0`}>
                  operis@dgo:~$
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isRunning}
                  placeholder={isRunning ? "Aguardando... (Ctrl+C para cancelar)" : "Digite um comando..."}
                  className={`flex-1 bg-transparent text-xs font-mono ${D.text} placeholder:${D.dim} focus:outline-none disabled:opacity-50`}
                  autoFocus
                />
                {isRunning && <Loader2 className="w-3 h-3 text-yellow-400 animate-spin flex-shrink-0" />}
              </div>
            </div>
          </div>

          {/* Dica de atalhos */}
          <div className={`flex items-center gap-3 mt-2 text-[10px] font-mono ${D.dim}`}>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-[#1a1a1a] border border-[#333] rounded">↑↓</kbd> histórico</span>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-[#1a1a1a] border border-[#333] rounded">Enter</kbd> executar</span>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-[#1a1a1a] border border-[#333] rounded">Ctrl+C</kbd> cancelar</span>
          </div>
        </div>

        {/* Sidebar de atalhos */}
        <div className="w-52 flex-shrink-0">
          <div className={`${D.s1} border ${D.b1} rounded-lg overflow-hidden`}>
            <div className={`flex items-center justify-between px-3 py-2 border-b ${D.b1}`}>
              <span className={`text-[10px] font-mono font-bold ${D.dim} tracking-widest`}>ATALHOS</span>
              <Shield className={`w-3 h-3 ${D.dim}`} title="Whitelist de segurança" />
            </div>
            <div className="overflow-y-auto max-h-96">
              {QUICK_COMMANDS.map((group) => (
                <div key={group.group}>
                  <p className={`text-[9px] font-mono font-bold ${D.dim} tracking-widest px-3 py-1.5 bg-[#0d0d0d]`}>
                    {group.group}
                  </p>
                  {group.commands.map((qc, i) => (
                    <button
                      key={i}
                      onClick={() => runCommand(qc.cmd)}
                      disabled={isRunning}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors border-b ${D.b1} last:border-0 ${
                        isRunning
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-[#161616] cursor-pointer"
                      }`}
                    >
                      <span className="text-sm flex-shrink-0">{qc.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-[10px] font-mono font-bold ${D.text} truncate`}>{qc.label}</p>
                        <p className={`text-[9px] font-mono ${D.dim} truncate`}>{qc.cmd.slice(0, 28)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

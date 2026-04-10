/**
 * ─── Service Manager Panel — Terminal de Manutenção com Streaming ────────────
 * JULY AOG | OPERIS Command Center
 *
 * Terminal interativo com spawn streaming em tempo real.
 * Whitelist de manutenção: npm, docker compose, apt, sync, ollama.
 * Diagnóstico de erros com Gemma 2 local.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import {
  Terminal, Play, Square, Package, Server, Cpu,
  RefreshCw, Trash2, CheckCircle2, XCircle, Loader2,
  AlertTriangle, Brain, ChevronRight, Clock, Zap,
  Code, Shield, RotateCcw, HardDrive
} from "lucide-react";

// ─── Ícone por categoria ──────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  code: { icon: <Code className="w-4 h-4" />, color: "blue", label: "Código" },
  services: { icon: <Server className="w-4 h-4" />, color: "cyan", label: "Serviços" },
  linux: { icon: <Shield className="w-4 h-4" />, color: "emerald", label: "Linux" },
  sync: { icon: <RefreshCw className="w-4 h-4" />, color: "amber", label: "Sync" },
  cleanup: { icon: <Trash2 className="w-4 h-4" />, color: "red", label: "Limpeza" },
  ai: { icon: <Brain className="w-4 h-4" />, color: "purple", label: "IA" },
};

// ─── Cor de linha de output ───────────────────────────────────────────────────
function lineColor(type: string, text: string): string {
  if (type === "error_diagnosis") return "text-amber-300";
  if (type === "system") {
    if (text.startsWith("✓") || text.includes("sucesso") || text.includes("Concluído")) return "text-emerald-400";
    if (text.startsWith("✗") || text.includes("Timeout")) return "text-red-400";
    if (text.startsWith("▶")) return "text-cyan-400";
    if (text.includes("Analisando erro")) return "text-amber-400";
    return "text-zinc-500";
  }
  if (type === "stderr") return "text-red-400";
  // stdout — detectar padrões
  if (/added \d+ packages|✓|success|done|complete/i.test(text)) return "text-emerald-400";
  if (/warn|warning/i.test(text)) return "text-yellow-400";
  if (/error|fail/i.test(text)) return "text-red-400";
  return "text-zinc-300";
}

// ─── Componente de Terminal ───────────────────────────────────────────────────
function TerminalOutput({
  lines,
  status,
  errorDiagnosis,
  errorModel,
}: {
  lines: Array<{ type: string; text: string; timestamp: string }>;
  status: string;
  errorDiagnosis?: string;
  errorModel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Barra do terminal */}
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        <span className="text-xs text-zinc-500 ml-2 font-mono">operis-service-manager</span>
        <div className="ml-auto flex items-center gap-2">
          {status === "running" && (
            <span className="flex items-center gap-1 text-xs text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Executando...
            </span>
          )}
          {status === "success" && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Concluído
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <XCircle className="w-3 h-3" /> Erro
            </span>
          )}
        </div>
      </div>

      {/* Output */}
      <div ref={ref} className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-0.5">
        {lines.length === 0 ? (
          <div className="text-zinc-600 flex items-center gap-2">
            <ChevronRight className="w-3 h-3" />
            <span>Aguardando comando...</span>
          </div>
        ) : (
          lines.map((line, i) => (
            <div key={i} className={`leading-relaxed ${lineColor(line.type, line.text)}`}>
              {line.type === "error_diagnosis" ? (
                <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Brain className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400 font-semibold">
                      Diagnóstico Gemma 2 {errorModel ? `(${errorModel})` : ""}
                    </span>
                  </div>
                  <div className="text-amber-200/80 whitespace-pre-wrap">{line.text}</div>
                </div>
              ) : (
                <span>{line.text}</span>
              )}
            </div>
          ))
        )}
        {status === "running" && (
          <div className="flex items-center gap-1 text-zinc-500">
            <span className="animate-pulse">█</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Painel Principal ─────────────────────────────────────────────────────────
export default function ServiceManagerPanel() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [outputLines, setOutputLines] = useState<Array<{ type: string; text: string; timestamp: string }>>([]);
  const [outputStatus, setOutputStatus] = useState<string>("idle");
  const [errorDiagnosis, setErrorDiagnosis] = useState<string | undefined>();
  const [errorModel, setErrorModel] = useState<string | undefined>();
  const [pollingIndex, setPollingIndex] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const commandsQuery = trpc.dgo.serviceManager.commands.useQuery();
  const spawnMutation = trpc.dgo.serviceManager.spawn.useMutation();
  const killMutation = trpc.dgo.serviceManager.kill.useMutation();
  const statsQuery = trpc.dgo.serviceManager.stats.useQuery(undefined, { refetchInterval: 10_000 });
  const pollQuery = trpc.dgo.serviceManager.poll.useQuery(
    { runId: activeRunId ?? "", sinceIndex: pollingIndex },
    { enabled: !!activeRunId && outputStatus === "running", refetchInterval: 500 }
  );

  // Processar polling
  useEffect(() => {
    if (!pollQuery.data) return;
    const data = pollQuery.data;

    if (data.lines.length > 0) {
      setOutputLines(prev => [...prev, ...data.lines]);
      setPollingIndex(data.nextIndex);
    }

    if (data.completed) {
      setOutputStatus(data.status);
      if (data.errorDiagnosis) {
        setErrorDiagnosis(data.errorDiagnosis);
        setErrorModel(data.errorModel);
        setOutputLines(prev => [
          ...prev,
          { type: "error_diagnosis", text: data.errorDiagnosis!, timestamp: new Date().toISOString() },
        ]);
      }
    }
  }, [pollQuery.data]);

  const commands = (commandsQuery.data ?? []) as any[];
  const stats = statsQuery.data as any;

  const filteredCommands = activeCategory === "all"
    ? commands
    : commands.filter(c => c.category === activeCategory);

  const categories = ["all", ...Object.keys(CATEGORY_CONFIG)];

  const runCommand = async (commandId: string, dangerous: boolean) => {
    if (dangerous && !confirm("Este comando é perigoso. Confirmar execução?")) return;

    setOutputLines([]);
    setOutputStatus("running");
    setErrorDiagnosis(undefined);
    setErrorModel(undefined);
    setPollingIndex(0);

    try {
      const result = await spawnMutation.mutateAsync({ commandId });
      setActiveRunId(result.runId);
    } catch (err: any) {
      setOutputLines([{ type: "stderr", text: err.message, timestamp: new Date().toISOString() }]);
      setOutputStatus("error");
    }
  };

  const killProcess = async () => {
    if (!activeRunId) return;
    await killMutation.mutateAsync({ runId: activeRunId });
    setOutputStatus("killed");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            Service Manager
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ponte de Comando · Spawn Streaming · Diagnóstico Gemma 2
          </p>
        </div>
        {stats && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-500">{stats.commandsAvailable} comandos</span>
            {stats.activeRuns > 0 && (
              <span className="text-cyan-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {stats.activeRuns} ativo(s)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filtros de categoria */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {categories.map(cat => {
          const cfg = CATEGORY_CONFIG[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                activeCategory === cat
                  ? "bg-zinc-700 border-zinc-600 text-zinc-200"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {cfg?.icon}
              {cfg?.label ?? "Todos"}
            </button>
          );
        })}
      </div>

      {/* Grade de comandos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredCommands.map((cmd: any) => {
          const cfg = CATEGORY_CONFIG[cmd.category] ?? CATEGORY_CONFIG.code;
          return (
            <button
              key={cmd.id}
              onClick={() => runCommand(cmd.id, cmd.dangerous)}
              disabled={outputStatus === "running"}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all group ${
                cmd.dangerous
                  ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10"
                  : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                cmd.dangerous ? "bg-red-500/10 text-red-400" : `bg-zinc-800 text-zinc-400`
              } group-hover:scale-110 transition-transform`}>
                {cmd.icon ? <span className="text-base">{cmd.icon}</span> : cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-200 truncate">{cmd.label}</span>
                  {cmd.dangerous && (
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">{cmd.description}</p>
                <p className="text-xs text-zinc-700 font-mono mt-0.5 truncate">{cmd.fullCommand}</p>
              </div>
              <Play className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 shrink-0 mt-1 transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Terminal de Output */}
      {(outputLines.length > 0 || outputStatus === "running") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Output em Tempo Real</span>
            {outputStatus === "running" && (
              <button
                onClick={killProcess}
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Square className="w-3 h-3" /> Cancelar
              </button>
            )}
          </div>
          <TerminalOutput
            lines={outputLines}
            status={outputStatus}
            errorDiagnosis={errorDiagnosis}
            errorModel={errorModel}
          />
        </div>
      )}
    </div>
  );
}

/**
 * ─── Docker Panel — Monitor Interativo de Containers ────────────────────────
 * JULY AOG | OPERIS Command Center
 * Leitura em tempo real via /var/run/docker.sock
 * Gráficos Recharts, ícones animados, logs ao vivo, start/stop/restart
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  Container, Play, Square, RotateCcw, Pause, ChevronDown,
  ChevronUp, Terminal, Cpu, MemoryStick, Clock, Wifi,
  WifiOff, AlertTriangle, CheckCircle2, Loader2, RefreshCw,
  Database, Globe, Zap
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: string[];
  created: number;
}

interface ContainerStats {
  cpuPercent: number;
  memUsageMB: number;
  memLimitMB: number;
  memPercent: number;
  netRxMB: number;
  netTxMB: number;
  blockReadMB: number;
  blockWriteMB: number;
}

// ─── Histórico de métricas por container ─────────────────────────────────────
const metricsHistory: Record<string, Array<{ time: string; cpu: number; mem: number }>> = {};

function addMetric(id: string, cpu: number, mem: number) {
  if (!metricsHistory[id]) metricsHistory[id] = [];
  metricsHistory[id].push({
    time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    cpu: Math.round(cpu * 10) / 10,
    mem: Math.round(mem * 10) / 10,
  });
  if (metricsHistory[id].length > 30) metricsHistory[id].shift();
}

// ─── Ícone de container por nome ─────────────────────────────────────────────
function ContainerIcon({ name, state }: { name: string; state: string }) {
  const isRunning = state === "running";
  const pulse = isRunning ? "animate-pulse" : "";

  if (name.includes("db") || name.includes("mysql") || name.includes("postgres")) {
    return <Database className={`w-5 h-5 ${isRunning ? "text-blue-400" : "text-zinc-600"} ${pulse}`} />;
  }
  if (name.includes("ai") || name.includes("ollama") || name.includes("llm")) {
    return <Zap className={`w-5 h-5 ${isRunning ? "text-purple-400" : "text-zinc-600"} ${pulse}`} />;
  }
  if (name.includes("app") || name.includes("web") || name.includes("nginx")) {
    return <Globe className={`w-5 h-5 ${isRunning ? "text-emerald-400" : "text-zinc-600"} ${pulse}`} />;
  }
  return <Container className={`w-5 h-5 ${isRunning ? "text-cyan-400" : "text-zinc-600"} ${pulse}`} />;
}

// ─── Badge de status ──────────────────────────────────────────────────────────
function StatusBadge({ state }: { state: string }) {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    running: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="w-3 h-3" />, label: "Running" },
    exited: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <Square className="w-3 h-3" />, label: "Stopped" },
    paused: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Pause className="w-3 h-3" />, label: "Paused" },
    restarting: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Loader2 className="w-3 h-3 animate-spin" />, label: "Restarting" },
    created: { color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", icon: <Clock className="w-3 h-3" />, label: "Created" },
  };
  const cfg = config[state] ?? config.exited;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Card de Container ────────────────────────────────────────────────────────
function ContainerCard({ container }: { container: ContainerInfo }) {
  const [expanded, setExpanded] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [stats, setStats] = useState<ContainerStats | null>(null);
  const logsRef = useRef<HTMLDivElement>(null);

  const controlMutation = trpc.dgo.docker.control.useMutation();
  const statsQuery = trpc.dgo.docker.stats.useQuery(
    { containerId: container.id },
    { enabled: container.state === "running", refetchInterval: 3000 }
  );
  const logsQuery = trpc.dgo.docker.logs.useQuery(
    { containerId: container.id, tail: 50 },
    { enabled: showLogs, refetchInterval: 5000 }
  );

  useEffect(() => {
    if (statsQuery.data) {
      const s = statsQuery.data as any;
      setStats(s);
      addMetric(container.id, s.cpuPercent ?? 0, s.memPercent ?? 0);
    }
  }, [statsQuery.data, container.id]);

  useEffect(() => {
    if (logsQuery.data) {
      const lines = (logsQuery.data as any)?.logs ?? [];
      setLogLines(lines.slice(-100));
      setTimeout(() => {
        if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
      }, 50);
    }
  }, [logsQuery.data]);

  const handleControl = async (action: "start" | "stop" | "restart" | "pause" | "unpause") => {
    await controlMutation.mutateAsync({ containerId: container.id, action });
  };

  const history = metricsHistory[container.id] ?? [];
  const isRunning = container.state === "running";

  return (
    <div className={`bg-zinc-900/60 border rounded-xl overflow-hidden transition-all duration-300 ${
      isRunning ? "border-zinc-700 hover:border-zinc-600" : "border-zinc-800/50"
    }`}>
      {/* Header do card */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Ícone animado */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isRunning ? "bg-zinc-800" : "bg-zinc-900"
        }`}>
          <ContainerIcon name={container.name} state={container.state} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-200 truncate">
              {container.name.replace(/^\//, "")}
            </span>
            <StatusBadge state={container.state} />
          </div>
          <p className="text-xs text-zinc-500 truncate mt-0.5">{container.image}</p>
        </div>

        {/* Métricas rápidas */}
        {isRunning && stats && (
          <div className="hidden sm:flex items-center gap-4 mr-2">
            <div className="text-center">
              <div className="text-xs font-bold text-cyan-400">{stats.cpuPercent?.toFixed(1)}%</div>
              <div className="text-xs text-zinc-600">CPU</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-purple-400">{stats.memPercent?.toFixed(1)}%</div>
              <div className="text-xs text-zinc-600">RAM</div>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {isRunning ? (
            <>
              <button
                onClick={() => handleControl("restart")}
                disabled={controlMutation.isPending}
                title="Reiniciar"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleControl("stop")}
                disabled={controlMutation.isPending}
                title="Parar"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => handleControl("start")}
              disabled={controlMutation.isPending}
              title="Iniciar"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-600 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-600 ml-1" />
          )}
        </div>
      </div>

      {/* Painel expandido */}
      {expanded && (
        <div className="border-t border-zinc-800 p-4 space-y-4">
          {/* Gráficos de CPU e RAM */}
          {isRunning && history.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs text-zinc-400">CPU %</span>
                  <span className="ml-auto text-xs font-bold text-cyan-400">
                    {stats?.cpuPercent?.toFixed(1)}%
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id={`cpu-${container.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="cpu" stroke="#22d3ee" strokeWidth={1.5}
                      fill={`url(#cpu-${container.id})`} dot={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "6px", fontSize: "11px" }}
                      formatter={(v: any) => [`${v}%`, "CPU"]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <MemoryStick className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-zinc-400">RAM %</span>
                  <span className="ml-auto text-xs font-bold text-purple-400">
                    {stats?.memPercent?.toFixed(1)}%
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id={`mem-${container.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="mem" stroke="#a855f7" strokeWidth={1.5}
                      fill={`url(#mem-${container.id})`} dot={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "6px", fontSize: "11px" }}
                      formatter={(v: any) => [`${v}%`, "RAM"]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Stats detalhados */}
          {isRunning && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Mem Usada", value: `${stats.memUsageMB?.toFixed(0)} MB`, color: "text-purple-400" },
                { label: "Mem Limite", value: `${stats.memLimitMB?.toFixed(0)} MB`, color: "text-zinc-400" },
                { label: "Net RX", value: `${stats.netRxMB?.toFixed(2)} MB`, color: "text-emerald-400" },
                { label: "Net TX", value: `${stats.netTxMB?.toFixed(2)} MB`, color: "text-blue-400" },
              ].map(item => (
                <div key={item.label} className="bg-zinc-950/50 rounded-lg p-2 text-center">
                  <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-zinc-600">{item.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Portas */}
          {container.ports.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Wifi className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-500">Portas:</span>
              {container.ports.map((p, i) => (
                <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  {p}
                </span>
              ))}
            </div>
          )}

          {/* Botão de logs */}
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            {showLogs ? "Ocultar Logs" : "Ver Logs ao Vivo"}
            {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Logs */}
          {showLogs && (
            <div
              ref={logsRef}
              className="bg-zinc-950 rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs space-y-0.5 border border-zinc-800"
            >
              {logsQuery.isLoading ? (
                <div className="text-zinc-500 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Carregando logs...
                </div>
              ) : logLines.length === 0 ? (
                <div className="text-zinc-600">Nenhum log disponível.</div>
              ) : (
                logLines.map((line, i) => (
                  <div key={i} className={`${
                    line.toLowerCase().includes("error") || line.toLowerCase().includes("err")
                      ? "text-red-400"
                      : line.toLowerCase().includes("warn")
                      ? "text-yellow-400"
                      : "text-zinc-400"
                  }`}>
                    {line}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Docker Info Card ─────────────────────────────────────────────────────────
function DockerInfoCard() {
  const infoQuery = trpc.dgo.docker.info.useQuery(undefined, { refetchInterval: 30_000 });
  const info = infoQuery.data as any;

  if (!info) return null;

  return (
    <div className="bg-zinc-900/60 border border-zinc-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Container className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold text-zinc-300">Docker Engine</span>
        <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Online
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Versão", value: info.serverVersion ?? "—" },
          { label: "Containers", value: info.containers ?? "—" },
          { label: "Running", value: info.containersRunning ?? "—" },
          { label: "Imagens", value: info.images ?? "—" },
        ].map(item => (
          <div key={item.label} className="text-center">
            <div className="text-sm font-bold text-zinc-200">{item.value}</div>
            <div className="text-xs text-zinc-600">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Painel Principal ─────────────────────────────────────────────────────────
export default function DockerPanel() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const containersQuery = trpc.dgo.docker.list.useQuery(undefined, {
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const containers = (containersQuery.data as ContainerInfo[]) ?? [];
  const running = containers.filter(c => c.state === "running").length;
  const stopped = containers.filter(c => c.state !== "running").length;

  // Gráfico de resumo
  const summaryData = containers.map(c => ({
    name: c.name.replace(/^\//, "").slice(0, 12),
    cpu: (metricsHistory[c.id]?.slice(-1)[0]?.cpu ?? 0),
    mem: (metricsHistory[c.id]?.slice(-1)[0]?.mem ?? 0),
    running: c.state === "running" ? 1 : 0,
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Container className="w-5 h-5 text-cyan-400" />
            Docker Monitor
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {running} rodando · {stopped} parado(s) · {containers.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              autoRefresh
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-500"
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto" : "Manual"}
          </button>
          <button
            onClick={() => containersQuery.refetch()}
            className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Docker Info */}
      <DockerInfoCard />

      {/* Gráfico de barras — visão geral */}
      {containers.length > 0 && summaryData.some(d => d.cpu > 0 || d.mem > 0) && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-3">Uso de CPU/RAM por Container</p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={summaryData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#71717a" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#71717a" }} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "6px", fontSize: "11px" }}
                formatter={(v: any, name: string) => [`${v}%`, name === "cpu" ? "CPU" : "RAM"]}
              />
              <Bar dataKey="cpu" fill="#22d3ee" radius={[2, 2, 0, 0]} />
              <Bar dataKey="mem" fill="#a855f7" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lista de containers */}
      {containersQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="ml-2 text-sm text-zinc-500">Conectando ao Docker Socket...</span>
        </div>
      ) : containersQuery.error ? (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <WifiOff className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-400">Docker Socket Inacessível</p>
            <p className="text-xs text-red-300/70 mt-0.5">
              Verifique se o volume <code className="bg-red-500/10 px-1 rounded">/var/run/docker.sock</code> está montado no container.
            </p>
          </div>
        </div>
      ) : containers.length === 0 ? (
        <div className="text-center py-12 text-zinc-600">
          <Container className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum container encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {containers.map(container => (
            <ContainerCard key={container.id} container={container} />
          ))}
        </div>
      )}
    </div>
  );
}

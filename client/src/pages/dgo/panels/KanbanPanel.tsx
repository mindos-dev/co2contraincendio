/**
 * ─── Kanban Panel — Gestão de Metas e Progresso OPERIS ──────────────────────
 * JULY AOG | OPERIS Command Center
 *
 * Kanban Board: leitura de TODO.md / project_tasks
 * Burnup Chart: progresso rumo às 45.000 linhas de código
 * OPERIS Engines: status dos 5 motores do projeto
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import {
  Target, CheckSquare, Clock, AlertCircle, TrendingUp,
  Zap, Search, DollarSign, Shield, BookOpen, RefreshCw,
  Loader2, Plus, ChevronRight, BarChart2, Layers
} from "lucide-react";

// ─── Ícones dos Engines ───────────────────────────────────────────────────────
const ENGINE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  commercial: { icon: <DollarSign className="w-4 h-4" />, color: "emerald", label: "Comercial" },
  governance: { icon: <Shield className="w-4 h-4" />, color: "blue", label: "Governança" },
  semantic: { icon: <Search className="w-4 h-4" />, color: "purple", label: "Busca Semântica" },
  financial: { icon: <BarChart2 className="w-4 h-4" />, color: "amber", label: "Financeiro" },
  knowledge: { icon: <BookOpen className="w-4 h-4" />, color: "cyan", label: "Knowledge Layer" },
};

// ─── Card de tarefa Kanban ────────────────────────────────────────────────────
function TaskCard({ task }: { task: any }) {
  const priorityColor: Record<string, string> = {
    critical: "border-l-red-500",
    high: "border-l-orange-500",
    medium: "border-l-yellow-500",
    low: "border-l-zinc-600",
  };

  return (
    <div className={`bg-zinc-900/60 border border-zinc-800 border-l-2 ${priorityColor[task.priority] ?? "border-l-zinc-600"} rounded-r-xl p-3 hover:border-zinc-700 transition-all`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-200 leading-snug">{task.title}</p>
          {task.description && (
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.engine && (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                {task.engine}
              </span>
            )}
            {task.lines && (
              <span className="text-xs text-zinc-600">
                ~{task.lines.toLocaleString()} linhas
              </span>
            )}
          </div>
        </div>
        {task.priority === "critical" && (
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
        )}
      </div>
    </div>
  );
}

// ─── Coluna Kanban ────────────────────────────────────────────────────────────
function KanbanColumn({
  title, tasks, color, icon, count
}: {
  title: string; tasks: any[]; color: string; icon: React.ReactNode; count: number;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800`}>
        <span className={`text-${color}-400`}>{icon}</span>
        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{title}</span>
        <span className={`ml-auto text-xs bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 px-2 py-0.5 rounded-full`}>
          {count}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task: any) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-4 text-zinc-700 text-xs">Vazio</div>
        )}
      </div>
    </div>
  );
}

// ─── Engine Status Card ───────────────────────────────────────────────────────
function EngineCard({ engine }: { engine: any }) {
  const cfg = ENGINE_CONFIG[engine.id] ?? ENGINE_CONFIG.commercial;
  const pct = engine.progress ?? 0;

  return (
    <div className={`bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg bg-${cfg.color}-500/10 flex items-center justify-center text-${cfg.color}-400`}>
          {cfg.icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-zinc-200">{engine.name ?? cfg.label}</div>
          <div className="text-xs text-zinc-500">{engine.description ?? ""}</div>
        </div>
        <span className={`text-xs font-bold text-${cfg.color}-400`}>{pct}%</span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-zinc-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full bg-${cfg.color}-500 transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs ${
          engine.status === "active" ? "text-emerald-400" :
          engine.status === "in_progress" ? "text-blue-400" :
          engine.status === "planned" ? "text-zinc-500" : "text-zinc-600"
        }`}>
          {engine.status === "active" ? "● Ativo" :
           engine.status === "in_progress" ? "◐ Em desenvolvimento" :
           engine.status === "planned" ? "○ Planejado" : engine.status}
        </span>
        {engine.linesCompleted && (
          <span className="text-xs text-zinc-600">
            {engine.linesCompleted.toLocaleString()} linhas
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Painel Principal ─────────────────────────────────────────────────────────
export default function KanbanPanel() {
  const [activeView, setActiveView] = useState<"kanban" | "burnup" | "engines">("kanban");

  const tasksQuery = trpc.dgo.project.tasks.useQuery(undefined, { refetchInterval: 30_000 });
  const burnupQuery = trpc.dgo.project.burnup.useQuery(undefined, { refetchInterval: 60_000 });
  const enginesQuery = trpc.dgo.project.engines.useQuery(undefined, { refetchInterval: 30_000 });

  const tasks = (tasksQuery.data as any[]) ?? [];
  const burnup = (burnupQuery.data as any) ?? {};
  const engines = (enginesQuery.data as any[]) ?? [];

  const todo = tasks.filter((t: any) => t.status === "todo");
  const inProgress = tasks.filter((t: any) => t.status === "in_progress");
  const done = tasks.filter((t: any) => t.status === "done");

  const views = [
    { id: "kanban", label: "Kanban", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "burnup", label: "Burnup", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: "engines", label: "Engines", icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Gestão de Metas
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {tasks.length} tarefas · {done.length} concluídas · {inProgress.length} em progresso
          </p>
        </div>
        <button
          onClick={() => { tasksQuery.refetch(); burnupQuery.refetch(); enginesQuery.refetch(); }}
          className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800 rounded-xl p-1">
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition-all ${
              activeView === v.id
                ? "bg-zinc-800 text-zinc-200 font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      {activeView === "kanban" && (
        <>
          {tasksQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span className="ml-2 text-sm text-zinc-500">Carregando tarefas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KanbanColumn
                title="A Fazer"
                tasks={todo}
                count={todo.length}
                color="zinc"
                icon={<Clock className="w-3.5 h-3.5" />}
              />
              <KanbanColumn
                title="Em Progresso"
                tasks={inProgress}
                count={inProgress.length}
                color="blue"
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              />
              <KanbanColumn
                title="Concluído"
                tasks={done}
                count={done.length}
                color="emerald"
                icon={<CheckSquare className="w-3.5 h-3.5" />}
              />
            </div>
          )}
        </>
      )}

      {/* Burnup Chart */}
      {activeView === "burnup" && (
        <div className="space-y-4">
          {/* Métricas de topo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Linhas Atuais", value: (burnup.currentLines ?? 45000).toLocaleString(), color: "text-emerald-400" },
              { label: "Meta Total", value: (burnup.targetLines ?? 80000).toLocaleString(), color: "text-zinc-300" },
              { label: "Progresso", value: `${burnup.progressPercent ?? 56}%`, color: "text-blue-400" },
              { label: "Velocidade", value: `${burnup.velocityPerDay ?? 320} /dia`, color: "text-purple-400" },
            ].map(item => (
              <div key={item.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center">
                <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-zinc-600">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Gráfico de burnup */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-zinc-300">Burnup — Linhas de Código</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={burnup.history ?? []}>
                <defs>
                  <linearGradient id="burnup-actual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="burnup-ideal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "6px", fontSize: "11px" }}
                  formatter={(v: any, name: string) => [v?.toLocaleString(), name === "actual" ? "Real" : "Ideal"]}
                />
                <Legend formatter={(v) => v === "actual" ? "Progresso Real" : "Curva Ideal"} />
                <Area type="monotone" dataKey="ideal" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 4"
                  fill="url(#burnup-ideal)" dot={false} name="ideal" />
                <Area type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={2}
                  fill="url(#burnup-actual)" dot={false} name="actual" />
                <ReferenceLine
                  y={burnup.targetLines ?? 80000}
                  stroke="#10b981"
                  strokeDasharray="6 3"
                  label={{ value: "Meta", fill: "#10b981", fontSize: 10 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* OPERIS Engines */}
      {activeView === "engines" && (
        <div>
          {enginesQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              <span className="ml-2 text-sm text-zinc-500">Carregando engines...</span>
            </div>
          ) : engines.length === 0 ? (
            <div className="text-center py-8 text-zinc-600">
              <Zap className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum engine configurado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {engines.map((engine: any) => (
                <EngineCard key={engine.id} engine={engine} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

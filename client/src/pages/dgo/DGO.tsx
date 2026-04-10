/**
 * ─── OPERIS Command Center — D.G.O. ─────────────────────────────────────────
 * Dashboard de Governança e Operação
 * JULY AOG | Soberania Digital · Zero Cloud Dependency
 *
 * Módulos:
 *  1. Docker Monitor     — containers em tempo real com gráficos e ícones
 *  2. AI Control         — múltiplas IAs + alertas + AI Flow Builder
 *  3. Service Manager    — terminal spawn streaming + diagnóstico Gemma 2
 *  4. Hardware Monitor   — disco, CPU, RAM, temperatura do host
 *  5. Kanban / Burnup    — metas, progresso e OPERIS Engines
 *  6. Web Search         — busca técnica com resumo IA local
 *  7. Governance         — logs de auditoria e sessões
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { DgoAuthProvider, useDgoAuth } from "@/contexts/DgoAuthContext";
import DgoLogin from "./DgoLogin";
import DockerPanel from "./panels/DockerPanel";
import AIControlPanel from "./panels/AIControlPanel";
import ServiceManagerPanel from "./panels/ServiceManagerPanel";
import HardwarePanel from "./panels/HardwarePanel";
import KanbanPanel from "./panels/KanbanPanel";
import WebSearchPanel from "./panels/WebSearchPanel";
import { trpc } from "@/lib/trpc";
import {
  Container, Brain, Terminal, Server, Target, Search,
  Shield, LogOut, User, ChevronRight, Zap, Menu, X,
  AlertTriangle, CheckCircle2, Activity, Cpu, MemoryStick,
  LayoutDashboard, GitBranch, HardDrive, BarChart2
} from "lucide-react";

// ─── Configuração de navegação ────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview",    label: "Visão Geral",      icon: <LayoutDashboard className="w-4 h-4" />, color: "indigo",  desc: "Status consolidado" },
  { id: "docker",      label: "Docker Monitor",   icon: <Container className="w-4 h-4" />,       color: "cyan",    desc: "Containers em tempo real" },
  { id: "ai",          label: "Controle de IAs",  icon: <Brain className="w-4 h-4" />,           color: "purple",  desc: "Gemma 2, Llama 3, Flow Builder" },
  { id: "service",     label: "Service Manager",  icon: <Terminal className="w-4 h-4" />,         color: "amber",   desc: "Terminal spawn streaming" },
  { id: "hardware",    label: "Hardware Monitor", icon: <Server className="w-4 h-4" />,           color: "blue",    desc: "CPU, RAM, Disco, Temperatura" },
  { id: "kanban",      label: "Gestão de Metas",  icon: <Target className="w-4 h-4" />,           color: "emerald", desc: "Kanban, Burnup, Engines" },
  { id: "search",      label: "Busca Técnica",    icon: <Search className="w-4 h-4" />,           color: "sky",     desc: "Web Search + Resumo IA" },
  { id: "governance",  label: "Governança",       icon: <Shield className="w-4 h-4" />,           color: "zinc",    desc: "Logs de auditoria" },
];

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ label, status }: { label: string; status: "online" | "offline" | "warning" }) {
  const cfg = {
    online:  "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    offline: "bg-red-500/10 border-red-500/30 text-red-400",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  };
  const dot = { online: "bg-emerald-400 animate-pulse", offline: "bg-red-400", warning: "bg-yellow-400 animate-pulse" };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${cfg[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {label}
    </div>
  );
}

// ─── Overview Panel ───────────────────────────────────────────────────────────
function OverviewPanel({ onNavigate }: { onNavigate: (id: string) => void }) {
  const dockerInfo = trpc.dgo.docker.info.useQuery(undefined, { refetchInterval: 15_000, retry: false });
  const ollamaStatus = trpc.dgo.ollama.status.useQuery(undefined, { refetchInterval: 10_000, retry: false });
  const systemInfo = trpc.dgo.system.info.useQuery(undefined, { refetchInterval: 8_000, retry: false });
  const alerts = trpc.dgo.alerts.active.useQuery(undefined, { refetchInterval: 20_000 });

  const docker = dockerInfo.data as any;
  const ollama = ollamaStatus.data as any;
  const sys = systemInfo.data as any;
  const alertList = (alerts.data as any[]) ?? [];

  const quickCards = [
    {
      id: "docker",
      title: "Docker Engine",
      icon: <Container className="w-5 h-5" />,
      color: "cyan",
      status: docker ? "online" : "offline",
      primary: docker ? `${docker.containersRunning ?? 0} rodando` : "Offline",
      secondary: docker ? `${docker.containers ?? 0} total · v${docker.serverVersion ?? "—"}` : "Socket inacessível",
    },
    {
      id: "ai",
      title: "Ollama IA",
      icon: <Brain className="w-5 h-5" />,
      color: "purple",
      status: ollama?.online ? "online" : "offline",
      primary: ollama?.online ? `${ollama.totalModels ?? 0} modelos` : "Offline",
      secondary: ollama?.online ? `v${ollama.version ?? "—"} · ${ollama.modelsLoaded ?? 0} ativo(s)` : "Serviço parado",
    },
    {
      id: "hardware",
      title: "CPU & RAM",
      icon: <Cpu className="w-5 h-5" />,
      color: "blue",
      status: sys ? (sys.cpu?.usage > 85 ? "warning" : "online") : "offline",
      primary: sys ? `CPU ${sys.cpu?.usage?.toFixed(0) ?? 0}% · RAM ${sys.memory?.usedGB?.toFixed(1) ?? 0}GB` : "Indisponível",
      secondary: sys ? `${sys.memory?.totalGB ?? 0}GB total · Uptime: ${sys.uptime ?? "—"}` : "",
    },
    {
      id: "governance",
      title: "Alertas Ativos",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: alertList.length > 0 ? "red" : "emerald",
      status: alertList.length > 0 ? "warning" : "online",
      primary: alertList.length > 0 ? `${alertList.length} alerta(s)` : "Sistema saudável",
      secondary: alertList.length > 0 ? alertList[0]?.message?.slice(0, 50) : "Nenhum alerta ativo",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">Visão Geral do Sistema</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Status consolidado de toda a infraestrutura OPERIS</p>
      </div>

      {/* Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickCards.map(card => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className={`bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-left hover:border-zinc-700 transition-all group`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg bg-${card.color}-500/10 flex items-center justify-center text-${card.color}-400`}>
                {card.icon}
              </div>
              <StatusPill label={card.status === "online" ? "Online" : card.status === "warning" ? "Alerta" : "Offline"} status={card.status as any} />
            </div>
            <div className="text-xs text-zinc-500 mb-1">{card.title}</div>
            <div className={`text-sm font-bold text-${card.color}-400`}>{card.primary}</div>
            <div className="text-xs text-zinc-600 mt-0.5 truncate">{card.secondary}</div>
          </button>
        ))}
      </div>

      {/* Atalhos rápidos */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 mb-3">Acesso Rápido</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {NAV_ITEMS.filter(n => n.id !== "overview").map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center gap-2.5 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900 transition-all group text-left"
            >
              <span className={`text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-300 truncate">{item.label}</div>
                <div className="text-xs text-zinc-600 truncate">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Alertas ativos */}
      {alertList.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Alertas Ativos ({alertList.length})
          </h3>
          <div className="space-y-2">
            {alertList.slice(0, 5).map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-400">{alert.type?.replace(/_/g, " ")}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{alert.message}</p>
                </div>
                <span className="text-xs text-zinc-600 ml-auto shrink-0">
                  {new Date(alert.timestamp).toLocaleTimeString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Painel de Governança ─────────────────────────────────────────────────────
function GovernancePanel({ token }: { token: string }) {
  const auditQuery = trpc.dgoAuth.auditLog.useQuery({ token, limit: 50 }, { refetchInterval: 15_000 });
  const data = auditQuery.data as any;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-zinc-400" />
          Governança e Auditoria
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          {data?.activeSessions ?? 0} sessão(ões) ativa(s) · {data?.totalUsers ?? 0} usuário(s)
        </p>
      </div>
      <div className="space-y-2">
        {(data?.logs ?? []).map((log: any, i: number) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
            log.success ? "bg-zinc-900/60 border-zinc-800" : "bg-red-500/5 border-red-500/20"
          }`}>
            {log.success
              ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-zinc-300">{log.event?.replace(/_/g, " ")}</span>
              <span className="text-xs text-zinc-500 ml-2">· {log.username}</span>
            </div>
            <span className="text-xs text-zinc-600 shrink-0">
              {new Date(log.timestamp).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
        {(!data?.logs || data.logs.length === 0) && (
          <div className="text-center py-8 text-zinc-600">
            <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum evento de auditoria registrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Layout principal do Command Center ──────────────────────────────────────
function CommandCenter() {
  const { user, token, logout } = useDgoAuth();
  const [activePanel, setActivePanel] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState(0);

  const alertsQuery = trpc.dgo.alerts.active.useQuery(undefined, { refetchInterval: 30_000 });
  useEffect(() => {
    setAlerts((alertsQuery.data as any[])?.length ?? 0);
  }, [alertsQuery.data]);

  const activeNav = NAV_ITEMS.find(n => n.id === activePanel);

  const renderPanel = () => {
    switch (activePanel) {
      case "overview":    return <OverviewPanel onNavigate={setActivePanel} />;
      case "docker":      return <DockerPanel />;
      case "ai":          return <AIControlPanel />;
      case "service":     return <ServiceManagerPanel />;
      case "hardware":    return <HardwarePanel />;
      case "kanban":      return <KanbanPanel />;
      case "search":      return <WebSearchPanel />;
      case "governance":  return <GovernancePanel token={token ?? ""} />;
      default:            return <OverviewPanel onNavigate={setActivePanel} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex font-mono">
      {/* Grid de fundo */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-zinc-950 border-r border-zinc-800/60 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-200 tracking-wider">OPERIS</div>
              <div className="text-xs text-emerald-400 tracking-widest">COMMAND CENTER</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-zinc-600 hover:text-zinc-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = activePanel === item.id;
            const hasAlert = item.id === "governance" && alerts > 0;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePanel(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                  isActive ? "bg-zinc-800 text-zinc-200" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60"
                }`}
              >
                <span className={isActive ? `text-${item.color}-400` : ""}>{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{item.label}</div>
                </div>
                {hasAlert && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {alerts}
                  </span>
                )}
                {isActive && <ChevronRight className={`w-3 h-3 text-${item.color}-400 shrink-0`} />}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-zinc-800/60">
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-zinc-900/60">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-300 truncate">{user?.displayName ?? user?.username}</div>
              <div className="text-xs text-zinc-600 capitalize">{user?.role}</div>
            </div>
            <button onClick={logout} title="Sair" className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-zinc-800 text-center mt-2">JULY AOG · Zero Cloud</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-12 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-${activeNav?.color ?? "zinc"}-400`}>{activeNav?.icon}</span>
            <span className="text-sm font-semibold text-zinc-300">{activeNav?.label}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>
            <div className="text-xs text-zinc-600 font-mono">
              {new Date().toLocaleTimeString("pt-BR")}
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {renderPanel()}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Root com Provider e Guard ────────────────────────────────────────────────
function DGOInner() {
  const { isAuthenticated, isLoading } = useDgoAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-zinc-500 font-mono">Verificando sessão...</p>
        </div>
      </div>
    );
  }
  return isAuthenticated ? <CommandCenter /> : <DgoLogin />;
}

export default function DGO() {
  return (
    <DgoAuthProvider>
      <DGOInner />
    </DgoAuthProvider>
  );
}

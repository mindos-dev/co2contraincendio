import React, { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FolderOpen, Plus, Search, Filter, AlertTriangle, CheckCircle2,
  Clock, XCircle, Flame, ClipboardList, Building2, ChevronRight,
  BarChart3, DollarSign, Calendar
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ProjectType = "inspection" | "fire" | "work_order";
type ProjectStatus = "draft" | "in_progress" | "completed" | "cancelled";
type ProjectPriority = "low" | "medium" | "high" | "critical";

const TYPE_LABELS: Record<ProjectType, string> = {
  inspection: "Inspeção",
  fire: "Sistema de Incêndio",
  work_order: "Ordem de Serviço",
};

const TYPE_ICONS: Record<ProjectType, React.ReactNode> = {
  inspection: <Building2 size={16} />,
  fire: <Flame size={16} />,
  work_order: <ClipboardList size={16} />,
};

const TYPE_COLORS: Record<ProjectType, string> = {
  inspection: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  fire: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  work_order: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_ICONS: Record<ProjectStatus, React.ReactNode> = {
  draft: <Clock size={14} />,
  in_progress: <AlertTriangle size={14} />,
  completed: <CheckCircle2 size={14} />,
  cancelled: <XCircle size={14} />,
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  low: "text-gray-400",
  medium: "text-blue-400",
  high: "text-yellow-400",
  critical: "text-red-400",
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ProjetosPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);

  // Form de criação
  const [form, setForm] = useState({
    title: "",
    type: "inspection" as ProjectType,
    priority: "medium" as ProjectPriority,
    clientName: "",
    clientContact: "",
    address: "",
    description: "",
  });

  const { data, isLoading, refetch } = trpc.project.list.useQuery({
    type: filterType !== "all" ? (filterType as ProjectType) : undefined,
    status: filterStatus !== "all" ? (filterStatus as ProjectStatus) : undefined,
    limit: 100,
  });

  const { data: stats } = trpc.project.stats.useQuery();

  const createMutation = trpc.project.create.useMutation({
    onSuccess: () => {
      toast.success("Projeto criado com sucesso!");
      setCreateOpen(false);
      setForm({ title: "", type: "inspection", priority: "medium", clientName: "", clientContact: "", address: "", description: "" });
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (data?.projects ?? []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.clientName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a1628] text-white font-['Barlow_Condensed',sans-serif]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d1f3c] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f97316] rounded flex items-center justify-center">
              <FolderOpen size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide uppercase text-white">Projetos</h1>
              <p className="text-xs text-gray-400 tracking-wider">OPERIS.eng — Gestão Centrada em Projetos</p>
            </div>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold tracking-wide uppercase text-sm">
                <Plus size={16} className="mr-2" /> Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0d1f3c] border-white/10 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-bold tracking-wide uppercase text-[#f97316]">Criar Novo Projeto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-gray-300 text-xs uppercase tracking-wider">Título *</Label>
                  <Input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Inspeção Anual Shopping BH"
                    className="bg-[#0a1628] border-white/10 text-white mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-300 text-xs uppercase tracking-wider">Tipo *</Label>
                    <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as ProjectType }))}>
                      <SelectTrigger className="bg-[#0a1628] border-white/10 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1f3c] border-white/10 text-white">
                        <SelectItem value="inspection">Inspeção</SelectItem>
                        <SelectItem value="fire">Sistema de Incêndio</SelectItem>
                        <SelectItem value="work_order">Ordem de Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300 text-xs uppercase tracking-wider">Prioridade</Label>
                    <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as ProjectPriority }))}>
                      <SelectTrigger className="bg-[#0a1628] border-white/10 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1f3c] border-white/10 text-white">
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300 text-xs uppercase tracking-wider">Cliente</Label>
                  <Input
                    value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                    placeholder="Nome do cliente / empresa"
                    className="bg-[#0a1628] border-white/10 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs uppercase tracking-wider">Endereço</Label>
                  <Input
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Endereço do local"
                    className="bg-[#0a1628] border-white/10 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs uppercase tracking-wider">Descrição</Label>
                  <Textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Descreva o escopo do projeto..."
                    className="bg-[#0a1628] border-white/10 text-white mt-1 resize-none"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => createMutation.mutate(form)}
                  disabled={!form.title || createMutation.isPending}
                  className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold uppercase tracking-wide"
                >
                  {createMutation.isPending ? "Criando..." : "Criar Projeto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border-b border-white/10">
          {[
            { label: "Total", value: stats.total, icon: <FolderOpen size={14} />, color: "text-white" },
            { label: "Em Andamento", value: (stats.byStatus as Record<string, number>).in_progress ?? 0, icon: <Clock size={14} />, color: "text-yellow-400" },
            { label: "Críticos", value: stats.critical, icon: <AlertTriangle size={14} />, color: "text-red-400" },
            { label: "Receita", value: `R$ ${((stats.totalRevenue ?? 0) / 100).toFixed(0)}`, icon: <DollarSign size={14} />, color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="bg-[#0a1628] px-4 py-3 flex items-center gap-3">
              <span className={s.color}>{s.icon}</span>
              <div>
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="px-6 py-4 flex flex-wrap gap-3 border-b border-white/10 bg-[#0a1628]">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar projetos..."
            className="pl-9 bg-[#0d1f3c] border-white/10 text-white text-sm"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44 bg-[#0d1f3c] border-white/10 text-white text-sm">
            <Filter size={12} className="mr-2 text-gray-400" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d1f3c] border-white/10 text-white">
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="inspection">Inspeção</SelectItem>
            <SelectItem value="fire">Sistema de Incêndio</SelectItem>
            <SelectItem value="work_order">Ordem de Serviço</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 bg-[#0d1f3c] border-white/10 text-white text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d1f3c] border-white/10 text-white">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Projetos */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Carregando projetos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">Nenhum projeto encontrado</p>
            <p className="text-gray-600 text-sm mt-1">Crie seu primeiro projeto clicando em "Novo Projeto"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(project => {
              const type = project.type as ProjectType;
              const status = project.status as ProjectStatus;
              const priority = project.priority as ProjectPriority;
              return (
                <Link key={project.id} href={`/app/projetos/${project.id}`}>
                  <div className="group bg-[#0d1f3c] border border-white/10 rounded-lg p-4 hover:border-[#f97316]/50 hover:bg-[#0d1f3c]/80 transition-all cursor-pointer flex items-center gap-4">
                    {/* Ícone tipo */}
                    <div className={`w-9 h-9 rounded flex items-center justify-center flex-shrink-0 border ${TYPE_COLORS[type]}`}>
                      {TYPE_ICONS[type]}
                    </div>

                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white truncate">{project.title}</span>
                        <span className={`text-xs font-bold uppercase ${PRIORITY_COLORS[priority]}`}>
                          {priority === "critical" ? "🔴 CRÍTICO" : priority === "high" ? "⚠️ ALTA" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {project.clientName && <span>{project.clientName}</span>}
                        {project.address && <span className="truncate max-w-[200px]">{project.address}</span>}
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {project.createdAt ? new Date(project.createdAt).toLocaleDateString("pt-BR") : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${TYPE_COLORS[type]}`}>
                        {TYPE_LABELS[type]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${STATUS_COLORS[status]}`}>
                        {STATUS_ICONS[status]}
                        {STATUS_LABELS[status]}
                      </span>
                      {(project.totalCost ?? 0) > 0 && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <DollarSign size={10} />
                          R$ {((project.totalPaid ?? 0) / 100).toFixed(0)}/{((project.totalCost ?? 0) / 100).toFixed(0)}
                        </span>
                      )}
                    </div>

                    <ChevronRight size={16} className="text-gray-600 group-hover:text-[#f97316] transition-colors flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

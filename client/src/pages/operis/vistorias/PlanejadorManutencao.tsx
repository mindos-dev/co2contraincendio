import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, Wrench, Plus, Calendar, AlertTriangle, CheckCircle2,
  Clock, Flame, DollarSign, User, ChevronDown, ChevronUp
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  low: { label: "Baixa", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", icon: <CheckCircle2 size={12} /> },
  medium: { label: "Média", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: <Clock size={12} /> },
  high: { label: "Alta", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", icon: <AlertTriangle size={12} /> },
  critical: { label: "Crítica", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: <Flame size={12} /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "text-yellow-400" },
  em_andamento: { label: "Em Andamento", color: "text-blue-400" },
  concluida: { label: "Concluída", color: "text-green-400" },
  cancelada: { label: "Cancelada", color: "text-gray-500" },
};

export default function PlanejadorManutencao() {
  const [, navigate] = useLocation();
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [dueDate, setDueDate] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isFireSafety, setIsFireSafety] = useState(false);

  const { data: vistorias } = trpc.vistoria.list.useQuery({ page: 1, limit: 100 });
  const { data: tasks, isLoading, refetch } = trpc.maintenanceTask.list.useQuery(
    { inspectionId: parseInt(selectedInspectionId) },
    { enabled: !!selectedInspectionId }
  );

  const createMutation = trpc.maintenanceTask.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso!");
      setShowForm(false);
      setTitle(""); setDescription(""); setDueDate(""); setEstimatedCost(""); setAssignedTo("");
      refetch();
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const updateStatusMutation = trpc.maintenanceTask.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); refetch(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const handleCreate = () => {
    if (!selectedInspectionId) { toast.error("Selecione uma vistoria"); return; }
    if (!title.trim()) { toast.error("Informe o título da tarefa"); return; }
    createMutation.mutate({
      inspectionId: parseInt(selectedInspectionId),
      title,
      description: description || undefined,
      priority,
      dueDate: dueDate || undefined,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      assignedTo: assignedTo || undefined,
      isFireSafetyRelated: isFireSafety,
    });
  };

  // Calcular dias até o prazo
  const getDaysUntilDue = (dueDate: Date | null) => {
    if (!dueDate) return null;
    const diff = Math.floor((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Totais
  const totalCost = tasks?.reduce((acc, t) => acc + (t.estimatedCost ? parseFloat(t.estimatedCost) : 0), 0) ?? 0;
  const pendingCount = tasks?.filter(t => t.status === "pendente").length ?? 0;
  const criticalCount = tasks?.filter(t => t.priority === "critical").length ?? 0;
  const fireSafetyCount = tasks?.filter(t => t.isFireSafetyRelated).length ?? 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/80 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/operis/vistorias")} className="text-gray-400 hover:text-white">
              <ArrowLeft size={16} className="mr-1" /> Voltar
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench size={18} className="text-orange-400" /> Planejador de Manutenção
              </h1>
              <p className="text-xs text-gray-500">Calendário de tarefas por vistoria</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedInspectionId} onValueChange={setSelectedInspectionId}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-64"><SelectValue placeholder="Selecionar vistoria..." /></SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {vistorias?.map(v => (
                  <SelectItem key={v.id} value={String(v.id)} className="text-gray-300">
                    #{v.id} — {v.propertyAddress?.slice(0, 35)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedInspectionId && (
              <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <Plus size={14} /> Nova Tarefa
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {!selectedInspectionId ? (
          <div className="text-center py-20">
            <Wrench size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Selecione uma vistoria para ver o plano de manutenção</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            {tasks && tasks.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Pendentes", value: pendingCount, color: "text-yellow-400", icon: <Clock size={16} /> },
                  { label: "Críticas", value: criticalCount, color: "text-red-400", icon: <Flame size={16} /> },
                  { label: "Incêndio", value: fireSafetyCount, color: "text-orange-400", icon: <Flame size={16} /> },
                  { label: "Custo Est.", value: `R$ ${totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, color: "text-green-400", icon: <DollarSign size={16} /> },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center gap-3">
                    <span className={kpi.color}>{kpi.icon}</span>
                    <div>
                      <p className="text-xs text-gray-500">{kpi.label}</p>
                      <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulário */}
            {showForm && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6 space-y-4">
                <h3 className="text-white font-semibold">Nova Tarefa de Manutenção</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-xs block mb-1">Título *</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Reparo de fissura na parede da sala"
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-xs block mb-1">Descrição</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                      placeholder="Detalhes técnicos do serviço necessário..."
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm resize-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Prioridade</label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                          <SelectItem key={v} value={v} className="text-gray-300">{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Prazo</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Custo Estimado (R$)</label>
                    <input type="number" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} placeholder="Ex: 1500"
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Responsável</label>
                    <input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Nome do técnico ou empresa"
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <input type="checkbox" id="fireSafety" checked={isFireSafety} onChange={e => setIsFireSafety(e.target.checked)}
                      className="w-4 h-4 accent-orange-500" />
                    <label htmlFor="fireSafety" className="text-gray-300 text-sm flex items-center gap-2">
                      <Flame size={14} className="text-orange-400" /> Relacionado à segurança contra incêndio (CO₂ / Sprinklers)
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-orange-600 hover:bg-orange-700 text-white">
                    {createMutation.isPending ? "Criando..." : "Criar Tarefa"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-600 text-gray-300">Cancelar</Button>
                </div>
              </div>
            )}

            {/* Lista de tarefas */}
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : !tasks?.length ? (
              <div className="text-center py-16">
                <Calendar size={36} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Nenhuma tarefa de manutenção</p>
                <p className="text-gray-600 text-sm mt-1">Adicione tarefas para planejar a manutenção do imóvel.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => {
                  const daysLeft = getDaysUntilDue(task.dueDate);
                  const isOverdue = daysLeft !== null && daysLeft < 0;
                  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
                  const pConf = PRIORITY_CONFIG[task.priority ?? "medium"];
                  const sConf = STATUS_CONFIG[task.status ?? "pendente"];

                  return (
                    <div key={task.id} className={`bg-gray-800/40 border rounded-xl transition-colors ${
                      isOverdue ? "border-red-500/40" : isUrgent ? "border-orange-500/30" : "border-gray-700"
                    }`}>
                      <div className="p-4 flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}>
                        <div className="flex items-start gap-3 flex-1">
                          <span className={`mt-0.5 ${pConf.color}`}>{pConf.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-medium text-sm">{task.title}</p>
                              {task.isFireSafetyRelated && (
                                <Badge className="bg-orange-500/10 border-orange-500/30 text-orange-400 text-xs gap-1">
                                  <Flame size={10} /> CO₂
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <Badge className={`text-xs ${pConf.bg} ${pConf.color}`}>{pConf.label}</Badge>
                              <span className={`text-xs ${sConf.color}`}>{sConf.label}</span>
                              {task.dueDate && (
                                <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-400" : isUrgent ? "text-orange-400" : "text-gray-500"}`}>
                                  <Calendar size={10} />
                                  {isOverdue ? `Atrasado ${Math.abs(daysLeft!)}d` : daysLeft === 0 ? "Vence hoje" : `${daysLeft}d restantes`}
                                </span>
                              )}
                              {task.estimatedCost && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <DollarSign size={10} /> R$ {parseFloat(task.estimatedCost).toLocaleString("pt-BR")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          {expandedId === task.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                        </div>
                      </div>

                      {expandedId === task.id && (
                        <div className="px-4 pb-4 border-t border-gray-700 pt-3 space-y-3">
                          {task.description && <p className="text-gray-400 text-sm">{task.description}</p>}
                          {task.assignedTo && (
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <User size={11} /> Responsável: <span className="text-gray-300">{task.assignedTo}</span>
                            </p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            {(["pendente", "em_andamento", "concluida", "cancelada"] as const).map(s => (
                              <Button key={s} size="sm" variant="outline"
                                className={`text-xs border-gray-600 ${task.status === s ? "bg-gray-600 text-white" : "text-gray-400"}`}
                                onClick={() => updateStatusMutation.mutate({ id: task.id, status: s })}>
                                {STATUS_CONFIG[s].label}
                              </Button>
                            ))}
                          </div>
                          {task.isFireSafetyRelated && (
                            <div className="bg-orange-900/10 border border-orange-600/20 rounded-lg p-3 text-xs text-orange-300 flex items-start gap-2">
                              <Flame size={12} className="mt-0.5 shrink-0" />
                              <span>Serviço relacionado à segurança contra incêndio. Contate a CO₂ Contra Incêndio: <strong>(31) 9 9738-3115</strong></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Clock, Flame,
  Building2, ClipboardList, DollarSign, FileText, Brain, Plus,
  Trash2, RefreshCw, Download, ChevronDown, ChevronUp
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ChecklistStatus = "ok" | "warning" | "critical" | "pending";
type FinancialType = "cost" | "payment" | "invoice";

const CHECKLIST_STATUS_CONFIG: Record<ChecklistStatus, { label: string; color: string; icon: React.ReactNode }> = {
  ok: { label: "Conforme", color: "text-green-400 border-green-500/30 bg-green-500/10", icon: <CheckCircle2 size={14} /> },
  warning: { label: "Atenção", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10", icon: <AlertTriangle size={14} /> },
  critical: { label: "Crítico", color: "text-red-400 border-red-500/30 bg-red-500/10", icon: <XCircle size={14} /> },
  pending: { label: "Pendente", color: "text-gray-400 border-gray-500/30 bg-gray-500/10", icon: <Clock size={14} /> },
};

const PROJECT_STATUS_OPTIONS = [
  { value: "draft", label: "Rascunho" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
];

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ProjetoDetalhePage() {
  const [, params] = useRoute("/app/projetos/:id");
  const [, navigate] = useLocation();
  const projectId = parseInt(params?.id ?? "0");

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showFinancialForm, setShowFinancialForm] = useState(false);
  const [financialForm, setFinancialForm] = useState({ type: "cost" as FinancialType, description: "", amount: "" });
  const [newChecklistLabel, setNewChecklistLabel] = useState("");
  const [showChecklist, setShowChecklist] = useState(true);
  const [showFinancial, setShowFinancial] = useState(true);

  const { data, isLoading, refetch } = trpc.project.getById.useQuery(
    { id: projectId },
    { enabled: projectId > 0 }
  );

  const updateMutation = trpc.project.update.useMutation({
    onSuccess: () => { toast.success("Projeto atualizado"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const updateChecklistMutation = trpc.project.updateChecklistItem.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });

  const addChecklistMutation = trpc.project.addChecklistItem.useMutation({
    onSuccess: () => { setNewChecklistLabel(""); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const addFinancialMutation = trpc.project.addFinancialItem.useMutation({
    onSuccess: () => { setShowFinancialForm(false); setFinancialForm({ type: "cost", description: "", amount: "" }); refetch(); toast.success("Item financeiro adicionado"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteFinancialMutation = trpc.project.deleteFinancialItem.useMutation({
    onSuccess: () => { refetch(); toast.success("Item removido"); },
    onError: (e) => toast.error(e.message),
  });

  const aiMutation = trpc.project.aiAnalyze.useMutation({
    onSuccess: (d) => setAiResult(d.analysis),
    onError: (e) => toast.error(e.message),
  });

  const reportMutation = trpc.project.generateReport.useMutation({
    onSuccess: (d) => { setReportContent(d.report); setShowReport(true); toast.success("Relatório gerado!"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => { toast.success("Projeto removido"); navigate("/app/projetos"); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data?.project) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Projeto não encontrado</p>
        <Button onClick={() => navigate("/app/projetos")} variant="outline" className="border-white/20 text-white">
          <ArrowLeft size={14} className="mr-2" /> Voltar
        </Button>
      </div>
    </div>
  );

  const { project, checklist, financial } = data;
  const totalCost = financial.filter(f => f.type === "cost").reduce((s, f) => s + f.amount, 0);
  const totalPaid = financial.filter(f => f.type === "payment").reduce((s, f) => s + f.amount, 0);

  const typeIcons: Record<string, React.ReactNode> = {
    inspection: <Building2 size={18} />,
    fire: <Flame size={18} />,
    work_order: <ClipboardList size={18} />,
  };

  const typeLabels: Record<string, string> = {
    inspection: "Inspeção",
    fire: "Sistema de Incêndio",
    work_order: "Ordem de Serviço",
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white font-['Barlow_Condensed',sans-serif]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d1f3c] px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/projetos")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} className="mr-1" /> Projetos
          </Button>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[#f97316]">{typeIcons[project.type]}</span>
            <h1 className="text-lg font-bold tracking-wide text-white truncate">{project.title}</h1>
            <span className="text-xs text-gray-500 uppercase tracking-wider">#{project.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={project.status}
              onValueChange={v => updateMutation.mutate({ id: project.id, status: v as "draft" | "in_progress" | "completed" | "cancelled" })}
            >
              <SelectTrigger className="w-36 bg-[#0a1628] border-white/10 text-white text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1f3c] border-white/10 text-white">
                {PROJECT_STATUS_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => reportMutation.mutate({ projectId: project.id })}
              disabled={reportMutation.isPending}
              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white text-xs uppercase tracking-wide"
            >
              <FileText size={12} className="mr-1" />
              {reportMutation.isPending ? "Gerando..." : "Relatório"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda: Info + Checklist */}
        <div className="lg:col-span-2 space-y-4">

          {/* Info do Projeto */}
          <div className="bg-[#0d1f3c] border border-white/10 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Tipo</p>
                <p className="text-white font-medium">{typeLabels[project.type]}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Prioridade</p>
                <p className={`font-bold uppercase ${project.priority === "critical" ? "text-red-400" : project.priority === "high" ? "text-yellow-400" : "text-blue-400"}`}>
                  {project.priority}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Cliente</p>
                <p className="text-white">{project.clientName ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Endereço</p>
                <p className="text-white text-xs">{project.address ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Criado em</p>
                <p className="text-white text-xs">{project.createdAt ? new Date(project.createdAt).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Prazo</p>
                <p className="text-white text-xs">{project.dueDate ? new Date(project.dueDate).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
            </div>
            {project.description && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Descrição</p>
                <p className="text-gray-300 text-sm">{project.description}</p>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="bg-[#0d1f3c] border border-white/10 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
              onClick={() => setShowChecklist(v => !v)}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#f97316]" />
                <span className="font-bold uppercase tracking-wide text-sm">Checklist</span>
                <span className="text-xs text-gray-500">({checklist.filter(c => c.status === "ok").length}/{checklist.length} OK)</span>
              </div>
              {showChecklist ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {showChecklist && (
              <div className="px-4 pb-4 space-y-2">
                {checklist.map(item => {
                  const cfg = CHECKLIST_STATUS_CONFIG[item.status as ChecklistStatus] ?? CHECKLIST_STATUS_CONFIG.pending;
                  return (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded border ${cfg.color}`}>
                      <span className="flex-shrink-0">{cfg.icon}</span>
                      <span className="flex-1 text-sm">{item.label}</span>
                      <Select
                        value={item.status}
                        onValueChange={v => updateChecklistMutation.mutate({ id: item.id, status: v as ChecklistStatus })}
                      >
                        <SelectTrigger className="w-28 h-6 text-xs bg-transparent border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d1f3c] border-white/10 text-white text-xs">
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="ok">Conforme</SelectItem>
                          <SelectItem value="warning">Atenção</SelectItem>
                          <SelectItem value="critical">Crítico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
                {checklist.length < 5 && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newChecklistLabel}
                      onChange={e => setNewChecklistLabel(e.target.value)}
                      placeholder="Novo item do checklist..."
                      className="bg-[#0a1628] border-white/10 text-white text-sm h-8"
                      onKeyDown={e => e.key === "Enter" && newChecklistLabel && addChecklistMutation.mutate({ projectId: project.id, label: newChecklistLabel })}
                    />
                    <Button
                      size="sm"
                      onClick={() => newChecklistLabel && addChecklistMutation.mutate({ projectId: project.id, label: newChecklistLabel })}
                      className="bg-[#f97316] hover:bg-[#ea6c0a] h-8 px-3"
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Relatório gerado */}
          {showReport && reportContent && (
            <div className="bg-[#0d1f3c] border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-green-400 font-bold uppercase tracking-wide text-sm flex items-center gap-2">
                  <FileText size={14} /> Relatório Gerado
                </span>
                <Button size="sm" variant="ghost" onClick={() => setShowReport(false)} className="text-gray-400 h-6 px-2">
                  <XCircle size={12} />
                </Button>
              </div>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">{reportContent}</pre>
            </div>
          )}
        </div>

        {/* Coluna direita: Financeiro + IA */}
        <div className="space-y-4">

          {/* Financeiro */}
          <div className="bg-[#0d1f3c] border border-white/10 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
              onClick={() => setShowFinancial(v => !v)}
            >
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-400" />
                <span className="font-bold uppercase tracking-wide text-sm">Financeiro</span>
              </div>
              {showFinancial ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {showFinancial && (
              <div className="px-4 pb-4">
                {/* Resumo */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-[#0a1628] rounded p-2 text-center">
                    <p className="text-xs text-gray-500 uppercase">Custo</p>
                    <p className="text-red-400 font-bold">R$ {(totalCost / 100).toFixed(2)}</p>
                  </div>
                  <div className="bg-[#0a1628] rounded p-2 text-center">
                    <p className="text-xs text-gray-500 uppercase">Pago</p>
                    <p className="text-green-400 font-bold">R$ {(totalPaid / 100).toFixed(2)}</p>
                  </div>
                </div>

                {/* Lista */}
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {financial.map(f => (
                    <div key={f.id} className="flex items-center gap-2 text-xs py-1 border-b border-white/5">
                      <span className={`flex-1 truncate ${f.type === "cost" ? "text-red-300" : "text-green-300"}`}>
                        {f.description}
                      </span>
                      <span className="font-bold">R$ {(f.amount / 100).toFixed(2)}</span>
                      <button onClick={() => deleteFinancialMutation.mutate({ id: f.id, projectId: project.id })} className="text-gray-600 hover:text-red-400">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Adicionar item */}
                {showFinancialForm ? (
                  <div className="mt-3 space-y-2">
                    <Select value={financialForm.type} onValueChange={v => setFinancialForm(f => ({ ...f, type: v as FinancialType }))}>
                      <SelectTrigger className="bg-[#0a1628] border-white/10 text-white text-xs h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1f3c] border-white/10 text-white text-xs">
                        <SelectItem value="cost">Custo</SelectItem>
                        <SelectItem value="payment">Pagamento</SelectItem>
                        <SelectItem value="invoice">Nota Fiscal</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={financialForm.description}
                      onChange={e => setFinancialForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Descrição"
                      className="bg-[#0a1628] border-white/10 text-white text-xs h-7"
                    />
                    <Input
                      value={financialForm.amount}
                      onChange={e => setFinancialForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="Valor (R$)"
                      type="number"
                      className="bg-[#0a1628] border-white/10 text-white text-xs h-7"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => addFinancialMutation.mutate({
                          projectId: project.id,
                          type: financialForm.type,
                          description: financialForm.description,
                          amount: Math.round(parseFloat(financialForm.amount) * 100),
                        })}
                        disabled={!financialForm.description || !financialForm.amount || addFinancialMutation.isPending}
                        className="flex-1 bg-[#f97316] hover:bg-[#ea6c0a] h-7 text-xs"
                      >
                        Adicionar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowFinancialForm(false)} className="h-7 text-xs text-gray-400">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFinancialForm(true)}
                    className="w-full mt-2 text-xs text-gray-400 hover:text-white border border-white/10 h-7"
                  >
                    <Plus size={10} className="mr-1" /> Adicionar Item
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* IA Assistente */}
          <div className="bg-[#0d1f3c] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-purple-400" />
              <span className="font-bold uppercase tracking-wide text-sm">OPERIS.eng IA</span>
            </div>
            <Textarea
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              placeholder="Faça uma pergunta técnica sobre este projeto... (ou deixe em branco para análise geral)"
              className="bg-[#0a1628] border-white/10 text-white text-xs resize-none mb-2"
              rows={3}
            />
            <Button
              onClick={() => aiMutation.mutate({ projectId: project.id, question: aiQuestion || undefined })}
              disabled={aiMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs uppercase tracking-wide h-8"
            >
              {aiMutation.isPending ? (
                <><RefreshCw size={12} className="mr-1 animate-spin" /> Analisando...</>
              ) : (
                <><Brain size={12} className="mr-1" /> Analisar com IA</>
              )}
            </Button>
            {aiResult && (
              <div className="mt-3 p-3 bg-[#0a1628] rounded border border-purple-500/20 text-xs text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {aiResult}
              </div>
            )}
          </div>

          {/* Ações perigosas */}
          <div className="bg-[#0d1f3c] border border-red-500/20 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Zona de Perigo</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm(`Tem certeza que deseja remover o projeto "${project.title}"? Esta ação não pode ser desfeita.`)) {
                  deleteMutation.mutate({ id: project.id });
                }
              }}
              disabled={deleteMutation.isPending}
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 text-xs uppercase tracking-wide h-8"
            >
              <Trash2 size={12} className="mr-1" /> Remover Projeto
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, GitCompare, Building2, Calendar, User, Shield,
  CheckCircle2, AlertTriangle, TrendingDown, Plus, Eye,
  Wand2, Loader2, ChevronRight, Wrench, Lightbulb, Scale
} from "lucide-react";

const CONDITION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  otimo: { label: "Ótimo", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  bom: { label: "Bom", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  regular: { label: "Regular", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  ruim: { label: "Ruim", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
};

export default function ComparadorVistorias() {
  const [, navigate] = useLocation();
  const [showNew, setShowNew] = useState(false);
  const [entryId, setEntryId] = useState<string>("");
  const [exitId, setExitId] = useState<string>("");
  const [condEntry, setCondEntry] = useState<string>("");
  const [condExit, setCondExit] = useState<string>("");
  const [depreciation, setDepreciation] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: comparisons, isLoading, refetch } = trpc.comparison.list.useQuery();
  const { data: vistorias } = trpc.vistoria.list.useQuery({ page: 1, limit: 100 });
  const { data: detail, refetch: detailRefetch } = trpc.comparison.getById.useQuery(
    { id: selectedId! },
    { enabled: selectedId !== null }
  );

  // Parse do diffSummary JSON
  const parsedDiff = (() => {
    if (!detail?.comparison.diffSummary) return null;
    try { return JSON.parse(detail.comparison.diffSummary); } catch { return null; }
  })();

  const DEGRADACAO_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    nenhuma: { label: "Sem Degradação", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", icon: "✅" },
    leve: { label: "Degradação Leve", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: "⚠️" },
    moderada: { label: "Degradação Moderada", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", icon: "🔶" },
    severa: { label: "Degradação Severa", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: "🔴" },
  };

  const generateDiffMutation = trpc.comparison.generateDiff.useMutation({
    onSuccess: () => {
      toast.success("Análise LLM gerada com sucesso!");
      refetch();
      if (selectedId) detailRefetch();
    },
    onError: (e) => toast.error("Erro ao gerar análise: " + e.message),
  });

  const createMutation = trpc.comparison.create.useMutation({
    onSuccess: () => {
      toast.success("Comparação criada com sucesso!");
      setShowNew(false);
      setEntryId(""); setExitId(""); setCondEntry(""); setCondExit(""); setDepreciation("");
      refetch();
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const handleCreate = () => {
    if (!entryId) { toast.error("Selecione a vistoria de entrada"); return; }
    createMutation.mutate({
      entryInspectionId: parseInt(entryId),
      exitInspectionId: exitId ? parseInt(exitId) : undefined,
      overallConditionEntry: condEntry as any || undefined,
      overallConditionExit: condExit as any || undefined,
      depreciationEstimate: depreciation ? parseFloat(depreciation) : undefined,
    });
  };

  const entryVistorias = vistorias?.filter(v => v.type === "entrada") ?? [];
  const exitVistorias = vistorias?.filter(v => v.type === "saida" || v.type === "devolucao") ?? [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/operis/vistorias")} className="text-gray-400 hover:text-white">
              <ArrowLeft size={16} className="mr-1" /> Voltar
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <GitCompare size={18} className="text-blue-400" /> Comparador de Vistorias
              </h1>
              <p className="text-xs text-gray-500">Entrada vs. Saída — Análise de Depreciação</p>
            </div>
          </div>
          <Button onClick={() => setShowNew(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus size={14} /> Nova Comparação
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Formulário de nova comparação */}
        {showNew && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8 space-y-4">
            <h3 className="text-white font-semibold">Nova Comparação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Vistoria de Entrada *</label>
                <Select value={entryId} onValueChange={setEntryId}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {entryVistorias.map(v => (
                      <SelectItem key={v.id} value={String(v.id)} className="text-gray-300">
                        #{v.id} — {v.propertyAddress?.slice(0, 40)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Vistoria de Saída (opcional)</label>
                <Select value={exitId} onValueChange={setExitId}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="none" className="text-gray-400">Nenhuma (comparação parcial)</SelectItem>
                    {exitVistorias.map(v => (
                      <SelectItem key={v.id} value={String(v.id)} className="text-gray-300">
                        #{v.id} — {v.propertyAddress?.slice(0, 40)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Condição Geral — Entrada</label>
                <Select value={condEntry} onValueChange={setCondEntry}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Object.entries(CONDITION_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-gray-300">{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Condição Geral — Saída</label>
                <Select value={condExit} onValueChange={setCondExit}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Object.entries(CONDITION_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-gray-300">{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Estimativa de Depreciação (R$)</label>
                <input
                  type="number" value={depreciation} onChange={e => setDepreciation(e.target.value)}
                  placeholder="Ex: 2500.00"
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {createMutation.isPending ? "Criando..." : "Criar Comparação"}
              </Button>
              <Button variant="outline" onClick={() => setShowNew(false)} className="border-gray-600 text-gray-300">Cancelar</Button>
            </div>
          </div>
        )}

        {/* Lista de comparações */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-500">Carregando...</div>
        ) : !comparisons?.length ? (
          <div className="text-center py-16">
            <GitCompare size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Nenhuma comparação criada</p>
            <p className="text-gray-600 text-sm mt-1">Crie uma comparação para analisar a evolução do imóvel entre entrada e saída.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comparisons.map(comp => (
              <div key={comp.id} className="bg-gray-800/40 border border-gray-700 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-white font-medium flex items-center gap-2">
                      <Building2 size={14} className="text-blue-400" />
                      {comp.propertyAddress || "Endereço não informado"}
                    </p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Calendar size={11} /> {new Date(comp.createdAt!).toLocaleDateString("pt-BR")}
                      {comp.contractNumber && <span className="ml-2">· Contrato: {comp.contractNumber}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {comp.overallConditionEntry && (
                        <Badge className={`text-xs ${CONDITION_LABELS[comp.overallConditionEntry]?.bg} ${CONDITION_LABELS[comp.overallConditionEntry]?.color}`}>
                          Entrada: {CONDITION_LABELS[comp.overallConditionEntry]?.label}
                        </Badge>
                      )}
                      {comp.overallConditionExit && (
                        <Badge className={`text-xs ${CONDITION_LABELS[comp.overallConditionExit]?.bg} ${CONDITION_LABELS[comp.overallConditionExit]?.color}`}>
                          Saída: {CONDITION_LABELS[comp.overallConditionExit]?.label}
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 gap-1"
                      onClick={() => setSelectedId(comp.id === selectedId ? null : comp.id)}>
                      <Eye size={13} /> {comp.id === selectedId ? "Fechar" : "Ver"}
                    </Button>
                  </div>
                </div>

                {/* Painel side-by-side */}
                {selectedId === comp.id && detail && (
                  <div className="mt-5 border-t border-gray-700 pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Entrada */}
                      <div className="bg-gray-900 rounded-xl border border-blue-500/20 p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Vistoria de Entrada</p>
                        </div>
                        {detail.entry ? (
                          <>
                            {[
                              ["Data", detail.entry.createdAt ? new Date(detail.entry.createdAt).toLocaleDateString("pt-BR") : "—"],
                              ["Endereço", detail.entry.propertyAddress],
                              ["Locador", detail.entry.landlordName],
                              ["Locatário", detail.entry.tenantName],
                              ["Vistoriador", detail.entry.inspectorName],
                              ["Aluguel", detail.entry.rentValue ? `R$ ${detail.entry.rentValue}` : "—"],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between text-sm">
                                <span className="text-gray-500">{k}</span>
                                <span className="text-white text-right max-w-[180px] truncate">{v || "—"}</span>
                              </div>
                            ))}
                            {detail.comparison.overallConditionEntry && (
                              <div className="mt-2">
                                <Badge className={`${CONDITION_LABELS[detail.comparison.overallConditionEntry]?.bg} ${CONDITION_LABELS[detail.comparison.overallConditionEntry]?.color} text-xs`}>
                                  Condição: {CONDITION_LABELS[detail.comparison.overallConditionEntry]?.label}
                                </Badge>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">Vistoria de entrada não encontrada</p>
                        )}
                      </div>

                      {/* Saída */}
                      <div className="bg-gray-900 rounded-xl border border-purple-500/20 p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                          <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Vistoria de Saída</p>
                        </div>
                        {detail.exit ? (
                          <>
                            {[
                              ["Data", detail.exit.createdAt ? new Date(detail.exit.createdAt).toLocaleDateString("pt-BR") : "—"],
                              ["Endereço", detail.exit.propertyAddress],
                              ["Locador", detail.exit.landlordName],
                              ["Locatário", detail.exit.tenantName],
                              ["Vistoriador", detail.exit.inspectorName],
                              ["Aluguel", detail.exit.rentValue ? `R$ ${detail.exit.rentValue}` : "—"],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between text-sm">
                                <span className="text-gray-500">{k}</span>
                                <span className="text-white text-right max-w-[180px] truncate">{v || "—"}</span>
                              </div>
                            ))}
                            {detail.comparison.overallConditionExit && (
                              <div className="mt-2">
                                <Badge className={`${CONDITION_LABELS[detail.comparison.overallConditionExit]?.bg} ${CONDITION_LABELS[detail.comparison.overallConditionExit]?.color} text-xs`}>
                                  Condição: {CONDITION_LABELS[detail.comparison.overallConditionExit]?.label}
                                </Badge>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                            <AlertTriangle size={24} className="text-yellow-500 mb-2" />
                            <p className="text-yellow-400 text-sm font-medium">Vistoria de saída pendente</p>
                            <p className="text-gray-500 text-xs mt-1">Vincule uma vistoria de saída para completar a comparação.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Depreciação */}
                    {detail.comparison.depreciationEstimate && (
                      <div className="mt-4 bg-red-900/10 border border-red-600/20 rounded-xl p-4 flex items-center gap-3">
                        <TrendingDown size={18} className="text-red-400" />
                        <div>
                          <p className="text-red-400 text-sm font-semibold">Estimativa de Depreciação</p>
                          <p className="text-2xl font-bold text-white">R$ {parseFloat(detail.comparison.depreciationEstimate).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xs text-gray-500">Responsável</p>
                          <p className="text-sm text-gray-300 flex items-center gap-1"><User size={11} /> {detail.entry?.inspectorName || "—"}</p>
                          <p className="text-xs text-gray-500">{detail.entry?.inspectorCrea || ""}</p>
                        </div>
                      </div>
                    )}

                    {/* Botão Gerar Análise LLM */}
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        size="sm"
                        onClick={() => generateDiffMutation.mutate({ comparisonId: comp.id })}
                        disabled={generateDiffMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                      >
                        {generateDiffMutation.isPending
                          ? <><Loader2 size={13} className="animate-spin" /> Analisando...</>
                          : <><Wand2 size={13} /> Gerar Análise Pericial (IA)</>
                        }
                      </Button>
                      {parsedDiff && (
                        <Badge className={`text-xs ${DEGRADACAO_CONFIG[parsedDiff.degradacao]?.bg ?? "bg-gray-500/10"} ${DEGRADACAO_CONFIG[parsedDiff.degradacao]?.color ?? "text-gray-400"}`}>
                          {DEGRADACAO_CONFIG[parsedDiff.degradacao]?.icon} {DEGRADACAO_CONFIG[parsedDiff.degradacao]?.label ?? parsedDiff.degradacao}
                        </Badge>
                      )}
                    </div>

                    {/* Painel de Diff Visual LLM */}
                    {parsedDiff && (
                      <div className="mt-4 space-y-4">
                        {/* Resumo */}
                        <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-4">
                          <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Wand2 size={11} /> Análise Pericial — OPERIS IA
                          </p>
                          <p className="text-gray-300 text-sm leading-relaxed">{parsedDiff.resumo}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Itens Afetados */}
                          {parsedDiff.itensAfetados?.length > 0 && (
                            <div className="bg-gray-900 border border-orange-500/20 rounded-xl p-4">
                              <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1">
                                <AlertTriangle size={11} /> Itens com Degradação
                              </p>
                              <ul className="space-y-1">
                                {parsedDiff.itensAfetados.map((item: string, i: number) => (
                                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                    <ChevronRight size={12} className="text-orange-400 mt-0.5 shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Causas Prováveis */}
                          {parsedDiff.causasProvaveis?.length > 0 && (
                            <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-4">
                              <p className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1">
                                <Lightbulb size={11} /> Causas Prováveis
                              </p>
                              <ul className="space-y-1">
                                {parsedDiff.causasProvaveis.map((causa: string, i: number) => (
                                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                    <ChevronRight size={12} className="text-yellow-400 mt-0.5 shrink-0" />
                                    {causa}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Reparos Recomendados */}
                          {parsedDiff.reparosRecomendados?.length > 0 && (
                            <div className="bg-gray-900 border border-blue-500/20 rounded-xl p-4">
                              <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1">
                                <Wrench size={11} /> Reparos Recomendados
                              </p>
                              <ul className="space-y-1">
                                {parsedDiff.reparosRecomendados.map((reparo: string, i: number) => (
                                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                    <ChevronRight size={12} className="text-blue-400 mt-0.5 shrink-0" />
                                    {reparo}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Fundamento Legal */}
                          {parsedDiff.fundamentoLegal && (
                            <div className="bg-gray-900 border border-green-500/20 rounded-xl p-4">
                              <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Scale size={11} /> Fundamento Legal
                              </p>
                              <p className="text-gray-300 text-sm">{parsedDiff.fundamentoLegal}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Conformidade */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <Shield size={12} className="text-green-400" />
                      <span>Comparação gerada em conformidade com a Lei 8.245/91 e LC 214/2025</span>
                      {detail.entry?.lockedAt && (
                        <><CheckCircle2 size={12} className="text-green-400 ml-2" /><span className="text-green-400">Registro selado</span></>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

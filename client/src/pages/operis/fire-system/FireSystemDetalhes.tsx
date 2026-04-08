/**
 * FireSystemDetalhes — Checklist interativo de Vistoria de Sistemas Fixos
 * 16 seções / 53 itens | NBR 14518:2019
 */
import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { FireSystemPaywallGuard } from "@/components/FireSystemPaywallGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Flame, ArrowLeft, CheckCircle2, XCircle, MinusCircle,
  AlertTriangle, Clock, ChevronDown, ChevronRight,
  FileText, ShieldCheck, History, Loader2
} from "lucide-react";

type ItemStatus = "pending" | "conforming" | "non_conforming" | "not_applicable" | "critical";

const STATUS_OPTIONS: { value: ItemStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { value: "pending", label: "Pendente", color: "border-slate-600 text-slate-400 bg-slate-800/30", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "conforming", label: "Conforme", color: "border-green-600 text-green-300 bg-green-900/30", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { value: "non_conforming", label: "Não Conforme", color: "border-orange-600 text-orange-300 bg-orange-900/30", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  { value: "critical", label: "Crítico", color: "border-red-600 text-red-300 bg-red-900/30", icon: <XCircle className="h-3.5 w-3.5" /> },
  { value: "not_applicable", label: "N/A", color: "border-slate-600 text-slate-500 bg-slate-900/30", icon: <MinusCircle className="h-3.5 w-3.5" /> },
];

const RISK_COLORS: Record<string, string> = {
  R1: "text-green-400", R2: "text-teal-400", R3: "text-yellow-400", R4: "text-orange-400", R5: "text-red-400",
};

function FireSystemDetalhesContent() {
  const { id } = useParams<{ id: string }>();
  const inspectionId = parseInt(id ?? "0");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["1"]));
  const [activeTab, setActiveTab] = useState<"checklist" | "logs">("checklist");
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.fireSystem.getById.useQuery(
    { id: inspectionId },
    { enabled: inspectionId > 0 }
  );

  const updateItemMutation = trpc.fireSystem.updateItem.useMutation({
    onSuccess: (result) => {
      toast.success(`Score atualizado: ${result.score}% | Risco: ${result.riskClassification}`);
      utils.fireSystem.getById.invalidate({ id: inspectionId });
      setEditingItem(null);
      setComment("");
    },
    onError: (err) => toast.error("Erro ao atualizar item", { description: err.message }),
  });

  const completeMutation = trpc.fireSystem.complete.useMutation({
    onSuccess: (result) => {
      toast.success(`Vistoria finalizada! Score: ${result.score}% | Risco: ${result.riskClassification}`);
      utils.fireSystem.getById.invalidate({ id: inspectionId });
    },
    onError: (err) => toast.error("Erro ao finalizar", { description: err.message }),
  });

  const toggleSection = (code: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleStatusChange = (itemId: number, status: ItemStatus) => {
    updateItemMutation.mutate({
      itemId,
      inspectionId,
      status,
      manualComment: comment || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[var(--operis-bg,#0A1628)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 bg-[var(--operis-bg,#0A1628)] text-slate-400">
        Vistoria não encontrada
      </div>
    );
  }

  const { inspection, sections, logs } = data;
  const score = parseFloat(inspection.scoreTotal ?? "0");
  const risk = inspection.riskClassification ?? "R3";

  const sectionCodes = Object.keys(sections).sort((a, b) => {
    const na = parseInt(a); const nb = parseInt(b);
    return na - nb;
  });

  return (
    <div className="min-h-screen bg-[var(--operis-bg,#0A1628)] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A1628]/95 backdrop-blur border-b border-slate-700/50 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/app/fire-system">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-8 px-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400" />
              <div>
                <p className="font-bold text-white text-sm">{inspection.inspectionNumber}</p>
                <p className="text-slate-400 text-xs">{inspection.enterpriseName}{inspection.storeName ? ` · ${inspection.storeName}` : ""}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className={`text-lg font-bold ${RISK_COLORS[risk]}`}>{score}%</p>
              <p className="text-xs text-slate-400">{risk}</p>
            </div>
            {inspection.status === "in_progress" && (
              <Button
                size="sm"
                onClick={() => completeMutation.mutate({ inspectionId })}
                disabled={completeMutation.isPending}
                className="bg-green-700 hover:bg-green-600 text-white gap-1.5 h-8"
              >
                {completeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                Finalizar
              </Button>
            )}
            <Link href={`/app/fire-system/${inspectionId}/laudo`}>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-1.5 h-8">
                <FileText className="h-3.5 w-3.5" />
                Laudo
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {[
            { key: "checklist", label: "Checklist", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
            { key: "logs", label: `Logs (${logs.length})`, icon: <History className="h-3.5 w-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "checklist" | "logs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-orange-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === "checklist" ? (
          <div className="space-y-3 max-w-4xl">
            {sectionCodes.map((code) => {
              const items = sections[code];
              const expanded = expandedSections.has(code);
              const sectionName = items[0]?.sectionName ?? `Seção ${code}`;
              const conforming = items.filter((i) => i.status === "conforming").length;
              const total = items.filter((i) => i.status !== "not_applicable").length;
              const hasCritical = items.some((i) => i.status === "critical");

              return (
                <div key={code} className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection(code)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400 font-mono text-xs w-6">{code}.</span>
                      <span className="font-medium text-white text-sm">{sectionName}</span>
                      {hasCritical && (
                        <Badge className="bg-red-900/50 text-red-300 border border-red-700 text-xs px-1.5 py-0">
                          <AlertTriangle className="h-3 w-3 mr-0.5" />
                          Crítico
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{conforming}/{total}</span>
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-slate-700/50">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`px-4 py-3 border-b border-slate-700/30 last:border-0 ${
                            item.status === "critical" ? "bg-red-950/20" :
                            item.status === "non_conforming" ? "bg-orange-950/10" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-slate-500 font-mono text-xs mt-0.5 w-8 flex-shrink-0">{item.itemCode}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-200 leading-relaxed">{item.title}</p>
                              {item.normRef && (
                                <p className="text-xs text-slate-500 mt-0.5">{item.normRef}</p>
                              )}
                              {item.manualComment && (
                                <p className="text-xs text-slate-400 mt-1 italic">"{item.manualComment}"</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className={`text-xs font-medium ${RISK_COLORS[item.riskCode ?? "R3"]}`}>
                                {item.riskCode}
                              </span>
                            </div>
                          </div>

                          {/* Status buttons */}
                          <div className="flex flex-wrap gap-1.5 mt-2 ml-11">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  if (editingItem === item.id && opt.value !== "pending") {
                                    handleStatusChange(item.id, opt.value);
                                  } else {
                                    setEditingItem(item.id);
                                    handleStatusChange(item.id, opt.value);
                                  }
                                }}
                                disabled={updateItemMutation.isPending && updateItemMutation.variables?.itemId === item.id}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all ${
                                  item.status === opt.value
                                    ? opt.color + " ring-1 ring-current"
                                    : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300 bg-transparent"
                                }`}
                              >
                                {updateItemMutation.isPending && updateItemMutation.variables?.itemId === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : opt.icon}
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          {/* Comment box for non-conforming/critical */}
                          {(item.status === "non_conforming" || item.status === "critical") && editingItem === item.id && (
                            <div className="mt-2 ml-11">
                              <Textarea
                                placeholder="Descreva a não conformidade..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={2}
                                className="bg-slate-900/50 border-slate-600 text-white text-xs placeholder:text-slate-500 resize-none"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Logs de auditoria */
          <div className="max-w-3xl space-y-2">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Nenhum log de auditoria registrado</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{log.action.replace(/_/g, " ").toUpperCase()}</p>
                      {log.notes && <p className="text-xs text-slate-400 mt-0.5">{log.notes}</p>}
                      <p className="text-xs text-slate-500 mt-1">por {log.userName}</p>
                    </div>
                    <p className="text-xs text-slate-500 flex-shrink-0">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("pt-BR") : "-"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FireSystemDetalhes() {
  return (
    <FireSystemPaywallGuard>
      <FireSystemDetalhesContent />
    </FireSystemPaywallGuard>
  );
}

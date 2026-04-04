import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { toast } from "sonner";
import {
  CheckSquare, Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, MinusCircle, Send,
  ClipboardList, AlertTriangle, BarChart3, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";

type CheckResult = "C" | "NC" | "NA";

interface CheckResponse {
  itemId: number;
  result: CheckResult;
  obs?: string;
}

const RESULT_CONFIG: Record<CheckResult, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  C:  { label: "Conforme",     color: "#34D399", bg: "rgba(52,211,153,0.15)",  icon: <CheckCircle2 size={16} /> },
  NC: { label: "Não Conforme", color: "#EF4444", bg: "rgba(239,68,68,0.15)",   icon: <XCircle size={16} /> },
  NA: { label: "Não Aplica",   color: "#6B7280", bg: "rgba(107,114,128,0.15)", icon: <MinusCircle size={16} /> },
};

// Fallback demo items when no templates exist in DB
const DEMO_ITEMS = [
  { id: 1, section: "Identificação",  description: "Equipamento identificado com etiqueta/plaqueta legível",  normClause: "NBR 12615 §5.1", required: true },
  { id: 2, section: "Identificação",  description: "Número de série visível e correspondente ao registro",     normClause: "NBR 12615 §5.2", required: true },
  { id: 3, section: "Condição Física", description: "Cilindro sem amassados, corrosão ou danos visíveis",      normClause: "NBR 12615 §6.1", required: true },
  { id: 4, section: "Condição Física", description: "Mangueira sem rachaduras, ressecamento ou obstrução",     normClause: "NBR 12615 §6.2", required: true },
  { id: 5, section: "Condição Física", description: "Bico difusor limpo e sem obstrução",                      normClause: "NBR 12615 §6.3", required: true },
  { id: 6, section: "Pressurização",  description: "Manômetro na faixa verde (pressão adequada)",             normClause: "NBR 12615 §7.1", required: true },
  { id: 7, section: "Pressurização",  description: "Lacre de segurança intacto",                              normClause: "NBR 12615 §7.2", required: true },
  { id: 8, section: "Localização",    description: "Equipamento acessível e desobstruído (raio 1m)",          normClause: "NBR 12615 §8.1", required: true },
  { id: 9, section: "Localização",    description: "Sinalização de localização visível e legível",            normClause: "NBR 12615 §8.2", required: true },
  { id: 10, section: "Documentação",  description: "Etiqueta de última manutenção presente e dentro do prazo", normClause: "NBR 12615 §9.1", required: true },
  { id: 11, section: "Documentação",  description: "Próxima data de manutenção indicada",                     normClause: "NBR 12615 §9.2", required: false },
  { id: 12, section: "Instalação",    description: "Altura de instalação conforme norma (1,60m max)",         normClause: "NBR 12615 §10.1", required: true },
];

type AnyItem = { id: number; section: string; description: string; normClause: string; required: boolean };

function groupBySection(items: AnyItem[]) {
  const groups: Record<string, AnyItem[]> = {};
  for (const item of items) {
    const sec = item.section ?? "Geral";
    if (!groups[sec]) groups[sec] = [];
    groups[sec].push(item);
  }
  return groups;
}

export default function Checklist() {
  const { user } = useSaasAuth();
  const companyId = (user as any)?.companyId ?? 0;

  const { data: templates, isLoading: loadingTemplates, refetch } = trpc.saas.checklist.templates.useQuery(
    { companyId },
    { enabled: !!companyId }
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [executionId, setExecutionId] = useState<number | null>(null);
  const [activeExecution, setActiveExecution] = useState(false);
  const [responses, setResponses] = useState<Record<number, CheckResponse>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Identificação": true, "Condição Física": true, "Pressurização": true,
    "Localização": true, "Documentação": true, "Instalação": true, "Geral": true,
  });
  const [showSummary, setShowSummary] = useState(false);

  const { data: templateItems, isLoading: loadingItems } = trpc.saas.checklist.items.useQuery(
    { templateId: selectedTemplateId! },
    { enabled: !!selectedTemplateId }
  );

  const startExecution = trpc.saas.checklist.startExecution.useMutation({
    onSuccess: (data: any) => { if (data?.insertId) setExecutionId(data.insertId); },
  });

  const saveResponses = trpc.saas.checklist.saveResponses.useMutation({
    onSuccess: () => toast.success("Checklist salvo com sucesso!"),
    onError: () => toast.error("Erro ao salvar checklist"),
  });

  const items: AnyItem[] = useMemo(() => {
    if (selectedTemplateId && templateItems && templateItems.length > 0) {
      return templateItems.map(i => ({
        id: i.id,
        section: i.section ?? "Geral",
        description: i.description,
        normClause: i.normClause ?? "",
        required: i.required ?? true,
      }));
    }
    return DEMO_ITEMS;
  }, [selectedTemplateId, templateItems]);

  const groups = useMemo(() => groupBySection(items), [items]);
  const answered = Object.keys(responses).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;
  const conformes = Object.values(responses).filter(r => r.result === "C").length;
  const naoConformes = Object.values(responses).filter(r => r.result === "NC").length;
  const naoAplica = Object.values(responses).filter(r => r.result === "NA").length;
  const score = answered > 0 ? Math.round((conformes / Math.max(answered - naoAplica, 1)) * 100) : 0;
  const scoreColor = score >= 90 ? "#34D399" : score >= 70 ? "#FBBF24" : "#EF4444";

  const setResponse = (itemId: number, result: CheckResult) =>
    setResponses(prev => ({ ...prev, [itemId]: { itemId, result } }));

  const toggleSection = (section: string) =>
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const handleStart = async (templateId?: number) => {
    if (templateId && companyId) {
      setSelectedTemplateId(templateId);
      try {
        await startExecution.mutateAsync({ templateId, companyId, executedById: user?.id });
      } catch { /* fallback to local mode */ }
    }
    setActiveExecution(true);
    setResponses({});
    setShowSummary(false);
  };

  const handleFinish = () => {
    const missing = items.filter(i => i.required && !responses[i.id]).length;
    if (missing > 0) { toast.error(`${missing} item(s) obrigatório(s) sem resposta`); return; }
    setShowSummary(true);
  };

  const handleSave = async () => {
    if (executionId) {
      await saveResponses.mutateAsync({
        id: executionId,
        responses: Object.values(responses),
        score,
        status: "concluido",
      });
    } else {
      toast.success("Checklist concluído! (modo demonstração)");
    }
    setResponses({}); setActiveExecution(false); setShowSummary(false);
    setSelectedTemplateId(null); setExecutionId(null);
  };

  const handleReset = () => {
    setResponses({}); setActiveExecution(false); setShowSummary(false);
    setSelectedTemplateId(null); setExecutionId(null);
  };

  // ── TELA INICIAL ──────────────────────────────────────────────────────────
  if (!activeExecution) {
    return (
      <SaasDashboardLayout>
        <div style={{ padding: "24px", background: "#0A0A0F", minHeight: "100vh", color: "#E8E8E8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckSquare size={20} color="#C8102E" />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Checklist de Campo</h1>
                <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Inspeção conforme ABNT NBR 12615</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "#9CA3AF", background: "transparent" }}>
              <RefreshCw size={14} style={{ marginRight: 6 }} /> Atualizar
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600 }}>
            {loadingTemplates && <div style={{ color: "#6B7280", fontSize: 14 }}>Carregando templates...</div>}

            {!loadingTemplates && templates && templates.map(t => (
              <div key={t.id} onClick={() => handleStart(t.id)}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,16,46,0.3)", borderRadius: 14, padding: "20px 24px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,16,46,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(200,16,46,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ClipboardList size={18} color="#C8102E" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "#FFFFFF", fontSize: 15 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{t.normReference ?? "Checklist de inspeção"}</div>
                  </div>
                  <Plus size={18} color="#C8102E" />
                </div>
              </div>
            ))}

            {/* Demo fallback card */}
            <div onClick={() => handleStart()}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 24px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(107,114,128,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ClipboardList size={18} color="#6B7280" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#9CA3AF", fontSize: 15 }}>Checklist Padrão NBR 12615</div>
                  <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>12 itens — Extintores de incêndio</div>
                </div>
                <Plus size={18} color="#6B7280" />
              </div>
            </div>
          </div>
        </div>
      </SaasDashboardLayout>
    );
  }

  // ── TELA DE RESUMO ────────────────────────────────────────────────────────
  if (showSummary) {
    return (
      <SaasDashboardLayout>
        <div style={{ padding: "24px", background: "#0A0A0F", minHeight: "100vh", color: "#E8E8E8" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", marginBottom: 24 }}>Resumo da Inspeção</h2>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}%</div>
              <div style={{ fontSize: 14, color: "#9CA3AF", marginTop: 8 }}>Score de Conformidade</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
                {[{ v: conformes, c: "#34D399", l: "Conformes" }, { v: naoConformes, c: "#EF4444", l: "Não Conformes" }, { v: naoAplica, c: "#6B7280", l: "Não Aplica" }].map(s => (
                  <div key={s.l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {naoConformes > 0 && (
              <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={16} color="#EF4444" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>Itens Não Conformes</span>
                </div>
                {items.filter(i => responses[i.id]?.result === "NC").map(i => (
                  <div key={i.id} style={{ fontSize: 12, color: "#FCA5A5", padding: "4px 0", borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
                    • {i.description}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <Button onClick={handleSave} disabled={saveResponses.isPending}
                style={{ flex: 1, background: "#C8102E", color: "#fff", border: "none" }}>
                <Send size={16} style={{ marginRight: 8 }} />
                {saveResponses.isPending ? "Salvando..." : "Salvar e Finalizar"}
              </Button>
              <Button variant="outline" onClick={() => setShowSummary(false)}
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#9CA3AF", background: "transparent" }}>
                Revisar
              </Button>
            </div>
          </div>
        </div>
      </SaasDashboardLayout>
    );
  }

  // Modo demonstração: quando não há template selecionado ou os itens são os DEMO_ITEMS
  const isDemoMode = !selectedTemplateId || !templateItems || templateItems.length === 0;

  // ── TELA DE EXECUÇÃO ────────────────────────────────────────────
  return (
    <SaasDashboardLayout>
      <div style={{ background: "#0A0A0F", minHeight: "100vh", color: "#E8E8E8", paddingBottom: 100 }}>
        {/* Banner modo demonstração */}
        {isDemoMode && (
          <div style={{ background: "rgba(251,191,36,0.1)", borderBottom: "1px solid rgba(251,191,36,0.3)", padding: "8px 24px", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={14} color="#FBBF24" />
            <span style={{ fontSize: 12, color: "#FBBF24", fontWeight: 500 }}>Modo demonstração — checklist padrão NBR 12615. Crie um template personalizado em Configurações para usar dados reais.</span>
          </div>
        )}
        {/* Sticky Header */}
        <div style={{ position: "sticky", top: 0, zIndex: 30, background: "#0A0A0F", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>Checklist de Campo</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor }}>{score}%</span>
              <span style={{ fontSize: 12, color: "#6B7280" }}>{answered}/{total}</span>
            </div>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
            {[{ l: "C", v: conformes, c: "#34D399" }, { l: "NC", v: naoConformes, c: "#EF4444" }, { l: "NA", v: naoAplica, c: "#6B7280" }].map(s => (
              <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <span style={{ color: s.c, fontWeight: 700 }}>{s.v}</span>
                <span style={{ color: "#6B7280" }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div style={{ padding: "16px 24px" }}>
          {loadingItems ? (
            <div style={{ color: "#6B7280", fontSize: 14, padding: "20px 0" }}>Carregando itens...</div>
          ) : (
            Object.entries(groups).map(([section, sectionItems]) => (
              <div key={section} style={{ marginBottom: 16 }}>
                <button onClick={() => toggleSection(section)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 16px", cursor: "pointer", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>{section}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#4B5563" }}>{sectionItems.filter(i => responses[i.id]).length}/{sectionItems.length}</span>
                    {expandedSections[section] ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
                  </div>
                </button>
                {(expandedSections[section] ?? true) && sectionItems.map(item => {
                  const resp = responses[item.id];
                  return (
                    <div key={item.id}
                      style={{ background: resp ? RESULT_CONFIG[resp.result].bg : "rgba(255,255,255,0.02)", border: `1px solid ${resp ? RESULT_CONFIG[resp.result].color + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, transition: "all 0.2s" }}>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 13, color: "#E8E8E8", lineHeight: 1.5, marginBottom: 4 }}>
                          {item.required && <span style={{ color: "#EF4444", marginRight: 4 }}>*</span>}
                          {item.description}
                        </div>
                        {item.normClause && <div style={{ fontSize: 11, color: "#4B5563" }}>{item.normClause}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["C", "NC", "NA"] as CheckResult[]).map(r => {
                          const cfg = RESULT_CONFIG[r];
                          const active = resp?.result === r;
                          return (
                            <button key={r} onClick={() => setResponse(item.id, r)}
                              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 4px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, background: active ? cfg.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? cfg.color : "rgba(255,255,255,0.08)"}`, color: active ? cfg.color : "#6B7280", transition: "all 0.15s" }}>
                              {cfg.icon}
                              <span>{r}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Sticky Footer */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, marginLeft: "var(--sidebar-offset, 0px)", background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 24px", display: "flex", gap: 12 }}>
          <Button variant="outline" onClick={handleReset}
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#9CA3AF", background: "transparent" }}>
            Cancelar
          </Button>
          <Button onClick={handleFinish} style={{ flex: 1, background: "#C8102E", color: "#fff", border: "none" }}>
            <BarChart3 size={16} style={{ marginRight: 8 }} />
            Finalizar ({progress}%)
          </Button>
        </div>
      </div>
    </SaasDashboardLayout>
  );
}

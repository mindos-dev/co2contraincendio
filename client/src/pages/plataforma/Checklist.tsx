import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { toast } from "sonner";
import {
  CheckSquare, Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, MinusCircle, Send,
  ClipboardList, AlertTriangle, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

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

// Demo checklist items for when no templates exist
const DEMO_ITEMS = [
  { id: 1, section: "Identificação", description: "Equipamento identificado com etiqueta/plaqueta legível", normClause: "NBR 12615 §5.1", required: true },
  { id: 2, section: "Identificação", description: "Número de série visível e correspondente ao registro", normClause: "NBR 12615 §5.2", required: true },
  { id: 3, section: "Condição Física", description: "Cilindro sem amassados, corrosão ou danos visíveis", normClause: "NBR 12615 §6.1", required: true },
  { id: 4, section: "Condição Física", description: "Mangueira sem rachaduras, ressecamento ou obstrução", normClause: "NBR 12615 §6.2", required: true },
  { id: 5, section: "Condição Física", description: "Bico difusor limpo e sem obstrução", normClause: "NBR 12615 §6.3", required: true },
  { id: 6, section: "Pressurização", description: "Manômetro na faixa verde (pressão adequada)", normClause: "NBR 12615 §7.1", required: true },
  { id: 7, section: "Pressurização", description: "Lacre de segurança intacto", normClause: "NBR 12615 §7.2", required: true },
  { id: 8, section: "Localização", description: "Equipamento acessível e desobstruído (raio 1m)", normClause: "NBR 12615 §8.1", required: true },
  { id: 9, section: "Localização", description: "Sinalização de localização visível e legível", normClause: "NBR 12615 §8.2", required: true },
  { id: 10, section: "Documentação", description: "Etiqueta de última manutenção presente e dentro do prazo", normClause: "NBR 12615 §9.1", required: true },
  { id: 11, section: "Documentação", description: "Próxima data de manutenção indicada", normClause: "NBR 12615 §9.2", required: false },
  { id: 12, section: "Instalação", description: "Altura de instalação conforme norma (1,60m max)", normClause: "NBR 12615 §10.1", required: true },
];

function groupBySection(items: typeof DEMO_ITEMS) {
  const groups: Record<string, typeof DEMO_ITEMS> = {};
  for (const item of items) {
    const sec = item.section ?? "Geral";
    if (!groups[sec]) groups[sec] = [];
    groups[sec].push(item);
  }
  return groups;
}

export default function Checklist() {
  const { user } = useSaasAuth();
  const [activeExecution, setActiveExecution] = useState(false);
  const [responses, setResponses] = useState<Record<number, CheckResponse>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Identificação": true, "Condição Física": true, "Pressurização": true,
    "Localização": true, "Documentação": true, "Instalação": true,
  });
  const [showSummary, setShowSummary] = useState(false);

  const items = DEMO_ITEMS;
  const groups = useMemo(() => groupBySection(items), []);

  const answered = Object.keys(responses).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  const conformes = Object.values(responses).filter(r => r.result === "C").length;
  const naoConformes = Object.values(responses).filter(r => r.result === "NC").length;
  const naoAplica = Object.values(responses).filter(r => r.result === "NA").length;
  const score = answered > 0 ? Math.round((conformes / (answered - naoAplica || 1)) * 100) : 0;

  const setResponse = (itemId: number, result: CheckResult) => {
    setResponses(prev => ({ ...prev, [itemId]: { itemId, result } }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFinish = () => {
    if (answered < items.filter(i => i.required).length) {
      const missing = items.filter(i => i.required && !responses[i.id]).length;
      toast.error(`${missing} item(s) obrigatório(s) sem resposta`);
      return;
    }
    setShowSummary(true);
  };

  const handleReset = () => {
    setResponses({});
    setActiveExecution(false);
    setShowSummary(false);
  };

  const scoreColor = score >= 90 ? "#34D399" : score >= 70 ? "#FBBF24" : "#EF4444";

  if (!activeExecution) {
    return (
      <div style={{ padding: "24px", background: "#0A0A0F", minHeight: "100vh", color: "#E8E8E8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckSquare size={20} color="#C8102E" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Checklist de Campo</h1>
            <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Inspeção conforme ABNT NBR 12615</p>
          </div>
        </div>

        {/* Available Checklists */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,16,46,0.3)",
              borderRadius: 14, padding: "20px 24px", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => setActiveExecution(true)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, background: "rgba(200,16,46,0.15)", color: "#C8102E", border: "1px solid rgba(200,16,46,0.3)", borderRadius: 6, padding: "2px 8px" }}>NBR 12615</span>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>12 itens</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", margin: "0 0 4px" }}>Inspeção de Extintores</h3>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Verificação completa conforme norma ABNT</p>
              </div>
              <Button style={{ background: "#C8102E", color: "#fff", border: "none", gap: 6 }}>
                <Plus size={14} /> Iniciar
              </Button>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px 24px", opacity: 0.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, background: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 6, padding: "2px 8px" }}>NBR 13714</span>
              <span style={{ fontSize: 11, color: "#6B7280" }}>Em breve</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", margin: "0 0 4px" }}>Inspeção de Hidrantes</h3>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Verificação de sistemas de hidrantes</p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px 24px", opacity: 0.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, background: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 6, padding: "2px 8px" }}>NBR 17240</span>
              <span style={{ fontSize: 11, color: "#6B7280" }}>Em breve</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", margin: "0 0 4px" }}>Inspeção de Detectores</h3>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Verificação de sistemas de detecção</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0A0A0F", minHeight: "100vh", color: "#E8E8E8", paddingBottom: 100 }}>
      {/* Sticky Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Inspeção de Extintores</h2>
            <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>NBR 12615 — {answered}/{total} respondidos</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor }}>{score}%</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>conformidade</div>
          </div>
        </div>
        <Progress value={progress} style={{ height: 6, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {[
            { label: "C", count: conformes, color: "#34D399" },
            { label: "NC", count: naoConformes, color: "#EF4444" },
            { label: "NA", count: naoAplica, color: "#6B7280" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
              <span style={{ color: s.color, fontWeight: 700 }}>{s.count}</span>
              <span style={{ color: "#6B7280" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist Items */}
      <div style={{ padding: "16px 20px" }}>
        {Object.entries(groups).map(([section, sectionItems]) => {
          const expanded = expandedSections[section] ?? true;
          const sectionAnswered = sectionItems.filter(i => responses[i.id]).length;
          const sectionNc = sectionItems.filter(i => responses[i.id]?.result === "NC").length;
          return (
            <div key={section} style={{ marginBottom: 16 }}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "10px 16px", cursor: "pointer", color: "#E8E8E8",
                  marginBottom: expanded ? 8 : 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{section}</span>
                  {sectionNc > 0 && (
                    <span style={{ fontSize: 10, background: "rgba(239,68,68,0.15)", color: "#EF4444", borderRadius: 4, padding: "1px 6px" }}>
                      {sectionNc} NC
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>{sectionAnswered}/{sectionItems.length}</span>
                  {expanded ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
                </div>
              </button>

              {/* Items */}
              {expanded && sectionItems.map((item, idx) => {
                const resp = responses[item.id];
                const isNC = resp?.result === "NC";
                return (
                  <div
                    key={item.id}
                    style={{
                      background: isNC ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isNC ? "rgba(239,68,68,0.25)" : resp ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 10, padding: "14px 16px", marginBottom: 8,
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "monospace" }}>{item.normClause}</span>
                          {item.required && <span style={{ fontSize: 10, color: "#C8102E" }}>*</span>}
                        </div>
                        <p style={{ fontSize: 13, color: "#E8E8E8", margin: 0, lineHeight: 1.5 }}>{item.description}</p>
                      </div>
                    </div>

                    {/* C / NC / NA Buttons */}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      {(["C", "NC", "NA"] as CheckResult[]).map(r => {
                        const cfg = RESULT_CONFIG[r];
                        const selected = resp?.result === r;
                        return (
                          <button
                            key={r}
                            onClick={() => setResponse(item.id, r)}
                            style={{
                              flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
                              background: selected ? cfg.bg : "rgba(255,255,255,0.04)",
                              border: `2px solid ${selected ? cfg.color : "rgba(255,255,255,0.08)"}`,
                              color: selected ? cfg.color : "#6B7280",
                              fontSize: 12, fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              transition: "all 0.15s",
                              transform: selected ? "scale(1.02)" : "scale(1)",
                            }}
                          >
                            {selected && cfg.icon}
                            {r === "C" ? "Conforme" : r === "NC" ? "Não Conf." : "N/A"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Sticky Footer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(10,10,15,0.97)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 20px",
        display: "flex", gap: 10,
      }}>
        <Button
          variant="outline"
          onClick={handleReset}
          style={{ flex: 1, borderColor: "rgba(255,255,255,0.15)", color: "#9CA3AF", background: "transparent" }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleFinish}
          disabled={answered === 0}
          style={{ flex: 2, background: "#C8102E", color: "#fff", border: "none", gap: 6 }}
        >
          <Send size={14} />
          Finalizar Checklist ({progress}%)
        </Button>
      </div>

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#FFFFFF", display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart3 size={20} color="#C8102E" /> Resultado da Inspeção
            </DialogTitle>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Score */}
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 56, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}%</div>
              <div style={{ fontSize: 14, color: "#9CA3AF", marginTop: 4 }}>
                {score >= 90 ? "✅ Aprovado — Conforme NBR 12615" : score >= 70 ? "⚠️ Atenção — Itens para correção" : "❌ Reprovado — Ação imediata necessária"}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "Conformes", value: conformes, color: "#34D399" },
                { label: "Não Conf.", value: naoConformes, color: "#EF4444" },
                { label: "N/A", value: naoAplica, color: "#6B7280" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* NC Items */}
            {naoConformes > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={14} /> Itens Não Conformes
                </div>
                {items.filter(i => responses[i.id]?.result === "NC").map(i => (
                  <div key={i.id} style={{ fontSize: 12, color: "#9CA3AF", padding: "6px 10px", background: "rgba(239,68,68,0.08)", borderRadius: 6, marginBottom: 4 }}>
                    {i.description}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="outline" onClick={handleReset} style={{ flex: 1, borderColor: "rgba(255,255,255,0.15)", color: "#9CA3AF" }}>
                Nova Inspeção
              </Button>
              <Button
                onClick={() => { toast.success("Checklist salvo com sucesso!"); setShowSummary(false); setActiveExecution(false); setResponses({}); }}
                style={{ flex: 2, background: "#C8102E", color: "#fff", border: "none" }}
              >
                Salvar & Concluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { EmptyState } from "@/components/operis";
import { OPERIS_COLORS } from "@/lib/operis-tokens";
import { FileText, Plus, Cpu, CheckCircle, AlertTriangle, Upload } from "lucide-react";
import { toast } from "sonner";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(v);

interface NFeForm {
  obraId: string;
  numeroNfe: string;
  chaveAcesso: string;
  emitenteNome: string;
  emitenteCnpj: string;
  dataEmissao: string;
  valorTotal: string;
  xmlConteudo: string;
}

export default function GestaoNFe() {
  const [showModal, setShowModal] = useState(false);
  const [classifyingId, setClassifyingId] = useState<number | null>(null);
  const [form, setForm] = useState<NFeForm>({
    obraId: "", numeroNfe: "", chaveAcesso: "", emitenteNome: "",
    emitenteCnpj: "", dataEmissao: "", valorTotal: "", xmlConteudo: "",
  });

  const { data: nfes, isLoading, refetch } = trpc.enterprise.nfe.list.useQuery();
  const { data: obras } = trpc.enterprise.obras.list.useQuery();

  const createMutation = trpc.enterprise.nfe.importar.useMutation({
    onSuccess: (data: { message: string }) => {
      toast.success(data.message || "NF-e registrada com sucesso!");
      setShowModal(false);
      setForm({ obraId: "", numeroNfe: "", chaveAcesso: "", emitenteNome: "", emitenteCnpj: "", dataEmissao: "", valorTotal: "", xmlConteudo: "" });
      refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const classifyMutation = trpc.enterprise.nfe.vincularObra.useMutation({
    onSuccess: (data: { message: string }) => {
      toast.success(data.message || "NF-e vinculada!");
      setClassifyingId(null);
      refetch();
    },
    onError: (e: { message: string }) => { toast.error(e.message); setClassifyingId(null); },
  });

  const inputStyle = {
    background: OPERIS_COLORS.bgSurface, border: `1px solid ${OPERIS_COLORS.border}`,
    borderRadius: 6, padding: "0.5rem 0.75rem",
    color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem", outline: "none",
    width: "100%", boxSizing: "border-box" as const,
  };
  const labelStyle = { color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem", fontWeight: 500 as const };

  const totalNFes = nfes?.length ?? 0;
  const totalValor = (nfes ?? []).reduce((acc: number, n: { valorTotal?: string | null }) =>
    acc + parseFloat(n.valorTotal || "0"), 0);
  const classificadas = (nfes ?? []).filter((n: { status?: string | null }) => n.status === "classificada").length;

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1280 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: OPERIS_COLORS.textPrimary, margin: 0 }}>
              Notas Fiscais (NF-e)
            </h1>
            <p style={{ color: OPERIS_COLORS.textMuted, fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Importação de XML, classificação automática por IA e vinculação a obras
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: OPERIS_COLORS.primary, color: "#fff",
              border: "none", borderRadius: 6, padding: "0.5rem 1rem",
              fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.5rem",
            }}
          >
            <Plus size={16} /> Registrar NF-e
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total NF-e", value: String(totalNFes), color: OPERIS_COLORS.primary, icon: <FileText size={18} /> },
            { label: "Valor Total", value: fmt(totalValor), color: OPERIS_COLORS.success, icon: <CheckCircle size={18} /> },
            { label: "Classificadas por IA", value: String(classificadas), color: OPERIS_COLORS.primary, icon: <Cpu size={18} /> },
            { label: "Pendentes Classificação", value: String(totalNFes - classificadas), color: OPERIS_COLORS.warning, icon: <AlertTriangle size={18} /> },
          ].map(k => (
            <div key={k.label} style={{
              background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`,
              borderRadius: 10, padding: "1.25rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ color: OPERIS_COLORS.textMuted, fontSize: "0.8125rem", fontWeight: 500 }}>{k.label}</div>
                <div style={{ color: k.color }}>{k.icon}</div>
              </div>
              <div style={{ color: k.color, fontSize: "1.375rem", fontWeight: 700, marginTop: "0.5rem" }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: OPERIS_COLORS.textMuted }}>Carregando...</div>
          ) : !nfes?.length ? (
            <EmptyState
              title="Nenhuma NF-e registrada"
              description="Importe XMLs de notas fiscais para classificação automática por IA e vinculação a obras."
              action={
                <button onClick={() => setShowModal(true)} style={{ background: OPERIS_COLORS.primary, color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", marginTop: "0.75rem" }}>
                  Registrar NF-e
                </button>
              }
            />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                  {["Número", "Emitente", "CNPJ", "Data", "Valor", "Obra", "Status", "IA"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: OPERIS_COLORS.textMuted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(nfes as Array<{
                  id: number;
                  numeroNfe?: string | null;
                  emitente?: string | null;
                  cnpjEmitente?: string | null;
                  dataEmissao?: Date | string | null;
                  valorTotal?: string | null;
                  obraId?: number | null;
                  status?: string | null;
                  categoriaIa?: string | null;
                }>).map(n => (
                  <tr key={n.id} style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                    <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.primary, fontFamily: "monospace", fontSize: "0.8125rem", fontWeight: 700 }}>
                      {n.numeroNfe || `NF-${n.id}`}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem" }}>{n.emitente || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textMuted, fontFamily: "monospace", fontSize: "0.75rem" }}>{n.cnpjEmitente || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                      {n.dataEmissao ? new Date(n.dataEmissao).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.success, fontWeight: 700, fontSize: "0.875rem" }}>
                      {n.valorTotal ? fmt(parseFloat(n.valorTotal)) : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                      {n.obraId ? (obras ?? []).find((o: { id: number; codigo?: string }) => o.id === n.obraId)?.codigo || `#${n.obraId}` : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        background: n.status === "classificada" ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
                        color: n.status === "classificada" ? OPERIS_COLORS.success : OPERIS_COLORS.warning,
                        border: `1px solid ${n.status === "classificada" ? "rgba(34,197,94,0.3)" : "rgba(234,179,8,0.3)"}`,
                        borderRadius: 5, padding: "0.2rem 0.5rem", fontSize: "0.75rem", fontWeight: 600,
                      }}>
                        {n.status || "pendente"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {n.categoriaIa ? (
                        <span style={{ color: OPERIS_COLORS.primary, fontSize: "0.75rem", fontWeight: 600 }}>{n.categoriaIa}</span>
                      ) : (
                        <button
                          onClick={() => { setClassifyingId(n.id); classifyMutation.mutate({ id: n.id, obraId: n.obraId ?? 0 }); }}
                          disabled={classifyingId === n.id}
                          style={{
                            background: "rgba(59,130,246,0.12)", color: "#3b82f6",
                            border: "1px solid rgba(59,130,246,0.3)", borderRadius: 5,
                            padding: "0.25rem 0.625rem", cursor: "pointer", fontSize: "0.75rem",
                            display: "flex", alignItems: "center", gap: "0.25rem",
                          }}
                        >
                          <Cpu size={12} /> {classifyingId === n.id ? "Classificando..." : "Classificar IA"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
            <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 12, padding: "1.75rem", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ color: OPERIS_COLORS.textPrimary, fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                  <FileText size={18} style={{ marginRight: "0.5rem", verticalAlign: "middle", color: OPERIS_COLORS.primary }} />
                  Registrar NF-e
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: OPERIS_COLORS.textMuted, cursor: "pointer", fontSize: "1.25rem" }}>×</button>
              </div>

              {/* Info ABNT */}
              <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", gap: "0.5rem" }}>
                <Cpu size={16} style={{ color: "#3b82f6", flexShrink: 0, marginTop: "0.1rem" }} />
                <p style={{ color: "#3b82f6", fontSize: "0.8125rem", margin: 0 }}>
                  Após registrar, clique em "Classificar IA" para que o OPERIS categorize automaticamente os itens da NF-e por tipo de custo (material, mão de obra, equipamento, etc.).
                </p>
              </div>

              <div style={{ display: "grid", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Número NF-e</label>
                    <input style={inputStyle} value={form.numeroNfe} onChange={e => setForm(f => ({ ...f, numeroNfe: e.target.value }))} placeholder="000001" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Data de Emissão</label>
                    <input style={inputStyle} type="date" value={form.dataEmissao} onChange={e => setForm(f => ({ ...f, dataEmissao: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Emitente (Fornecedor)</label>
                    <input style={inputStyle} value={form.emitenteNome} onChange={e => setForm(f => ({ ...f, emitenteNome: e.target.value }))} placeholder="Distribuidora XYZ Ltda" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>CNPJ Emitente</label>
                    <input style={inputStyle} value={form.emitenteCnpj} onChange={e => setForm(f => ({ ...f, emitenteCnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Valor Total (R$)</label>
                    <input style={inputStyle} type="number" value={form.valorTotal} onChange={e => setForm(f => ({ ...f, valorTotal: e.target.value }))} placeholder="5000.00" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Obra Vinculada</label>
                    <select style={inputStyle} value={form.obraId} onChange={e => setForm(f => ({ ...f, obraId: e.target.value }))}>
                      <option value="">Sem obra</option>
                      {(obras ?? []).map((o: { id: number; codigo?: string; nome?: string }) => <option key={o.id} value={String(o.id)}>{o.codigo} — {o.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={labelStyle}>Chave de Acesso NF-e (44 dígitos)</label>
                  <input style={inputStyle} value={form.chaveAcesso} onChange={e => setForm(f => ({ ...f, chaveAcesso: e.target.value }))} placeholder="00000000000000000000000000000000000000000000" maxLength={44} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={labelStyle}>Conteúdo XML (opcional — para classificação IA)</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: "vertical" as const, fontFamily: "monospace", fontSize: "0.75rem" }}
                    value={form.xmlConteudo}
                    onChange={e => setForm(f => ({ ...f, xmlConteudo: e.target.value }))}
                    placeholder="Cole o conteúdo do XML da NF-e aqui para classificação automática por IA..."
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <button onClick={() => setShowModal(false)} style={{ background: "transparent", color: OPERIS_COLORS.textSecondary, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 6, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem" }}>Cancelar</button>
                  <button
                    onClick={() => createMutation.mutate({
                      obraId: form.obraId ? parseInt(form.obraId) : undefined,
                      numero: form.numeroNfe || undefined,
                      chaveAcesso: form.chaveAcesso || undefined,
                      emitenteNome: form.emitenteNome || undefined,
                      emitenteCnpj: form.emitenteCnpj || undefined,
                      dataEmissao: form.dataEmissao || undefined,
                      valorTotal: form.valorTotal || undefined,
                      itensTexto: form.xmlConteudo || undefined,
                    })}
                    disabled={!form.emitenteNome || !form.valorTotal || createMutation.isPending}
                    style={{ background: OPERIS_COLORS.primary, color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, opacity: !form.emitenteNome || !form.valorTotal ? 0.5 : 1 }}
                  >
                    {createMutation.isPending ? "Salvando..." : "Registrar NF-e"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

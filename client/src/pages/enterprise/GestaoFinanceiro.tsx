import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { SectionHeader, StatusBadge, EmptyState } from "@/components/operis";
import { OPERIS_COLORS } from "@/lib/operis-tokens";
import { DollarSign, Plus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(v);

type TabType = "pagar" | "receber";

interface PagarForm {
  descricao: string;
  fornecedor: string;
  categoria: string;
  valor: string;
  vencimento: string;
  obraId: string;
  observacoes: string;
}

interface ReceberForm {
  descricao: string;
  numeroMedicao: string;
  valor: string;
  vencimento: string;
  obraId: string;
  observacoes: string;
}

const CATEGORIAS = ["material", "equipamento", "subempreiteiro", "servico", "imposto", "outro"];

export default function GestaoFinanceiro() {
  const [tab, setTab] = useState<TabType>("pagar");
  const [showModal, setShowModal] = useState(false);
  const [pagarForm, setPagarForm] = useState<PagarForm>({
    descricao: "", fornecedor: "", categoria: "material",
    valor: "", vencimento: "", obraId: "", observacoes: "",
  });
  const [receberForm, setReceberForm] = useState<ReceberForm>({
    descricao: "", numeroMedicao: "", valor: "", vencimento: "", obraId: "", observacoes: "",
  });

  const { data: fluxo, isLoading: loadingFluxo, refetch: refetchFluxo } = trpc.enterprise.financeiro.fluxoCaixa.useQuery();
  const { data: contasPagar, isLoading: loadingPagar, refetch: refetchPagar } = trpc.enterprise.financeiro.contasPagarList.useQuery();
  const { data: contasReceber, isLoading: loadingReceber, refetch: refetchReceber } = trpc.enterprise.financeiro.contasReceberList.useQuery();
  const { data: obras } = trpc.enterprise.obras.list.useQuery();

  const createPagarMutation = trpc.enterprise.financeiro.contasPagarCreate.useMutation({
    onSuccess: () => {
      toast.success("Conta a pagar registrada!");
      setShowModal(false);
      setPagarForm({ descricao: "", fornecedor: "", categoria: "material", valor: "", vencimento: "", obraId: "", observacoes: "" });
      refetchPagar(); refetchFluxo();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const createReceberMutation = trpc.enterprise.financeiro.contasReceberCreate.useMutation({
    onSuccess: () => {
      toast.success("Conta a receber registrada!");
      setShowModal(false);
      setReceberForm({ descricao: "", numeroMedicao: "", valor: "", vencimento: "", obraId: "", observacoes: "" });
      refetchReceber(); refetchFluxo();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const pagarMutation = trpc.enterprise.financeiro.contasPagarPagar.useMutation({
    onSuccess: () => { toast.success("Conta quitada!"); refetchPagar(); refetchFluxo(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const inputStyle = {
    background: OPERIS_COLORS.bgSurface, border: `1px solid ${OPERIS_COLORS.border}`,
    borderRadius: 6, padding: "0.5rem 0.75rem",
    color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem", outline: "none",
    width: "100%", boxSizing: "border-box" as const,
  };

  const labelStyle = { color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem", fontWeight: 500 as const };

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1280 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: OPERIS_COLORS.textPrimary, margin: 0 }}>
              Gestão Financeira
            </h1>
            <p style={{ color: OPERIS_COLORS.textMuted, fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Fluxo de caixa, contas a pagar e a receber por obra
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
            <Plus size={16} /> Novo Lançamento
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "A Receber", value: fluxo?.totalReceber ?? 0, color: OPERIS_COLORS.success, icon: <TrendingUp size={18} /> },
            { label: "A Pagar", value: fluxo?.totalPagar ?? 0, color: OPERIS_COLORS.danger, icon: <TrendingDown size={18} /> },
            { label: "Saldo Previsto", value: fluxo?.saldoPrevisto ?? 0, color: (fluxo?.saldoPrevisto ?? 0) >= 0 ? OPERIS_COLORS.success : OPERIS_COLORS.danger, icon: <DollarSign size={18} /> },
            { label: "Contas Vencidas", value: fluxo?.contasVencidas ?? 0, color: OPERIS_COLORS.danger, icon: <AlertTriangle size={18} />, isCount: true },
          ].map(k => (
            <div key={k.label} style={{
              background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`,
              borderRadius: 10, padding: "1.25rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ color: OPERIS_COLORS.textMuted, fontSize: "0.8125rem", fontWeight: 500 }}>{k.label}</div>
                <div style={{ color: k.color }}>{k.icon}</div>
              </div>
              <div style={{ color: k.color, fontSize: "1.375rem", fontWeight: 700, marginTop: "0.5rem" }}>
                {loadingFluxo ? "..." : k.isCount ? String(k.value) : fmt(k.value as number)}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {(["pagar", "receber"] as TabType[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? OPERIS_COLORS.primaryMuted : OPERIS_COLORS.bgCard,
                color: tab === t ? OPERIS_COLORS.primary : OPERIS_COLORS.textSecondary,
                border: `1px solid ${tab === t ? OPERIS_COLORS.primaryBorder : OPERIS_COLORS.border}`,
                borderRadius: 6, padding: "0.5rem 1.25rem",
                cursor: "pointer", fontSize: "0.875rem", fontWeight: 600,
              }}
            >
              {t === "pagar" ? `Contas a Pagar (${contasPagar?.length ?? 0})` : `Contas a Receber (${contasReceber?.length ?? 0})`}
            </button>
          ))}
        </div>

        {/* Tabela */}
        <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
          {tab === "pagar" ? (
            loadingPagar ? (
              <div style={{ padding: "3rem", textAlign: "center", color: OPERIS_COLORS.textMuted }}>Carregando...</div>
            ) : !contasPagar?.length ? (
              <EmptyState title="Nenhuma conta a pagar" description="Registre despesas e custos por obra." />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                    {["Descrição", "Fornecedor", "Categoria", "Vencimento", "Valor", "Status", "Ações"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: OPERIS_COLORS.textMuted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contasPagar.map(c => {
                    const vencido = c.status === "pendente" && new Date(c.vencimento) < new Date();
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem" }}>{c.descricao}</td>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>{c.fornecedor || "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>{c.categoria || "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: vencido ? OPERIS_COLORS.danger : OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                          {new Date(c.vencimento).toLocaleDateString("pt-BR")}
                          {vencido && <span style={{ marginLeft: "0.25rem", fontSize: "0.7rem" }}>⚠</span>}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.danger, fontWeight: 700, fontSize: "0.875rem" }}>
                          -{fmt(parseFloat(c.valor || "0"))}
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <StatusBadge status={c.status === "pago" ? "completed" : vencido ? "expired" : "open"} />
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          {c.status === "pendente" && (
                            <button
                              onClick={() => pagarMutation.mutate({ id: c.id })}
                              style={{
                                background: "rgba(34,197,94,0.12)", color: OPERIS_COLORS.success,
                                border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 5,
                                padding: "0.25rem 0.625rem", cursor: "pointer", fontSize: "0.75rem",
                                display: "flex", alignItems: "center", gap: "0.25rem",
                              }}
                            >
                              <CheckCircle size={12} /> Quitar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          ) : (
            loadingReceber ? (
              <div style={{ padding: "3rem", textAlign: "center", color: OPERIS_COLORS.textMuted }}>Carregando...</div>
            ) : !contasReceber?.length ? (
              <EmptyState title="Nenhuma conta a receber" description="Registre medições e receitas por obra." />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                    {["Descrição", "Medição", "Vencimento", "Valor", "Status"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: OPERIS_COLORS.textMuted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contasReceber.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                      <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem" }}>{c.descricao}</td>
                      <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>{c.numeroMedicao || "—"}</td>
                      <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                        {new Date(c.vencimento).toLocaleDateString("pt-BR")}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.success, fontWeight: 700, fontSize: "0.875rem" }}>
                        +{fmt(parseFloat(c.valor || "0"))}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <StatusBadge status={c.status === "recebido" ? "completed" : "open"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "1rem",
          }}>
            <div style={{
              background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`,
              borderRadius: 12, padding: "1.75rem", width: "100%", maxWidth: 540,
              maxHeight: "90vh", overflowY: "auto",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ color: OPERIS_COLORS.textPrimary, fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                  Novo Lançamento
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: OPERIS_COLORS.textMuted, cursor: "pointer", fontSize: "1.25rem" }}>×</button>
              </div>

              {/* Tab selector */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {(["pagar", "receber"] as TabType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      flex: 1, padding: "0.5rem",
                      background: tab === t ? OPERIS_COLORS.primaryMuted : OPERIS_COLORS.bgSurface,
                      color: tab === t ? OPERIS_COLORS.primary : OPERIS_COLORS.textSecondary,
                      border: `1px solid ${tab === t ? OPERIS_COLORS.primaryBorder : OPERIS_COLORS.border}`,
                      borderRadius: 6, cursor: "pointer", fontSize: "0.875rem", fontWeight: 600,
                    }}
                  >
                    {t === "pagar" ? "↓ A Pagar" : "↑ A Receber"}
                  </button>
                ))}
              </div>

              {tab === "pagar" ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Descrição *</label>
                    <input style={inputStyle} value={pagarForm.descricao} onChange={e => setPagarForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Material hidráulico" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      <label style={labelStyle}>Fornecedor</label>
                      <input style={inputStyle} value={pagarForm.fornecedor} onChange={e => setPagarForm(f => ({ ...f, fornecedor: e.target.value }))} placeholder="Nome do fornecedor" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      <label style={labelStyle}>Categoria</label>
                      <select style={inputStyle} value={pagarForm.categoria} onChange={e => setPagarForm(f => ({ ...f, categoria: e.target.value }))}>
                        {CATEGORIAS.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      <label style={labelStyle}>Valor (R$) *</label>
                      <input style={inputStyle} type="number" value={pagarForm.valor} onChange={e => setPagarForm(f => ({ ...f, valor: e.target.value }))} placeholder="1500.00" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      <label style={labelStyle}>Vencimento *</label>
                      <input style={inputStyle} type="date" value={pagarForm.vencimento} onChange={e => setPagarForm(f => ({ ...f, vencimento: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Obra (opcional)</label>
                    <select style={inputStyle} value={pagarForm.obraId} onChange={e => setPagarForm(f => ({ ...f, obraId: e.target.value }))}>
                      <option value="">Sem obra vinculada</option>
                      {(obras ?? []).map(o => <option key={o.id} value={String(o.id)}>{o.codigo} — {o.nome}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    <button onClick={() => setShowModal(false)} style={{ background: "transparent", color: OPERIS_COLORS.textSecondary, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 6, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem" }}>Cancelar</button>
                    <button
                      onClick={() => createPagarMutation.mutate({
                        descricao: pagarForm.descricao,
                        fornecedor: pagarForm.fornecedor || undefined,
                        categoria: pagarForm.categoria as "material" | "equipamento" | "subempreiteiro" | "servico" | "imposto" | "outro",
                        valor: pagarForm.valor,
                        vencimento: pagarForm.vencimento,
                        obraId: pagarForm.obraId ? parseInt(pagarForm.obraId) : undefined,
                        observacoes: pagarForm.observacoes || undefined,
                      })}
                      disabled={!pagarForm.descricao || !pagarForm.valor || !pagarForm.vencimento || createPagarMutation.isPending}
                      style={{ background: OPERIS_COLORS.primary, color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, opacity: !pagarForm.descricao || !pagarForm.valor || !pagarForm.vencimento ? 0.5 : 1 }}
                    >
                      {createPagarMutation.isPending ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Descrição *</label>
                    <input style={inputStyle} value={receberForm.descricao} onChange={e => setReceberForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Medição 01 — Obra XYZ" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      <label style={labelStyle}>Nº Medição</label>
                      <input style={inputStyle} value={receberForm.numeroMedicao} onChange={e => setReceberForm(f => ({ ...f, numeroMedicao: e.target.value }))} placeholder="MED-001" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      <label style={labelStyle}>Valor (R$) *</label>
                      <input style={inputStyle} type="number" value={receberForm.valor} onChange={e => setReceberForm(f => ({ ...f, valor: e.target.value }))} placeholder="10000.00" />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      <label style={labelStyle}>Vencimento *</label>
                      <input style={inputStyle} type="date" value={receberForm.vencimento} onChange={e => setReceberForm(f => ({ ...f, vencimento: e.target.value }))} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      <label style={labelStyle}>Obra (opcional)</label>
                      <select style={inputStyle} value={receberForm.obraId} onChange={e => setReceberForm(f => ({ ...f, obraId: e.target.value }))}>
                        <option value="">Sem obra vinculada</option>
                        {(obras ?? []).map(o => <option key={o.id} value={String(o.id)}>{o.codigo} — {o.nome}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    <button onClick={() => setShowModal(false)} style={{ background: "transparent", color: OPERIS_COLORS.textSecondary, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 6, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem" }}>Cancelar</button>
                    <button
                      onClick={() => createReceberMutation.mutate({
                        descricao: receberForm.descricao,
                        numeroMedicao: receberForm.numeroMedicao || undefined,
                        valor: receberForm.valor,
                        vencimento: receberForm.vencimento,
                        obraId: receberForm.obraId ? parseInt(receberForm.obraId) : undefined,
                        observacoes: receberForm.observacoes || undefined,
                      })}
                      disabled={!receberForm.descricao || !receberForm.valor || !receberForm.vencimento || createReceberMutation.isPending}
                      style={{ background: OPERIS_COLORS.primary, color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, opacity: !receberForm.descricao || !receberForm.valor || !receberForm.vencimento ? 0.5 : 1 }}
                    >
                      {createReceberMutation.isPending ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

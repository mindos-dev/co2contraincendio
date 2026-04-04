import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { EmptyState } from "@/components/operis";
import { OPERIS_COLORS } from "@/lib/operis-tokens";
import { Users, Plus, Clock, DollarSign, HardHat } from "lucide-react";
import { toast } from "sonner";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(v);

type TabType = "colaboradores" | "ponto";

interface ColabForm {
  nome: string;
  cpf: string;
  tipo: "funcionario" | "terceiro" | "empreiteiro";
  funcao: string;
  custoHora: string;
  custoDiario: string;
  obraId: string;
}

interface PontoForm {
  maoDeObraId: string;
  obraId: string;
  data: string;
  entrada: string;
  saida: string;
  observacao: string;
}

export default function GestaoMaoDeObra() {
  const [tab, setTab] = useState<TabType>("colaboradores");
  const [showColabModal, setShowColabModal] = useState(false);
  const [showPontoModal, setShowPontoModal] = useState(false);
  const [selectedObraId, setSelectedObraId] = useState<number | undefined>();
  const [colabForm, setColabForm] = useState<ColabForm>({
    nome: "", cpf: "", tipo: "funcionario", funcao: "",
    custoHora: "", custoDiario: "", obraId: "",
  });
  const [pontoForm, setPontoForm] = useState<PontoForm>({
    maoDeObraId: "", obraId: "", data: new Date().toISOString().split("T")[0],
    entrada: "08:00", saida: "17:00", observacao: "",
  });

  const { data: colaboradores, isLoading: loadingColab, refetch: refetchColab } = trpc.enterprise.maoDeObra.list.useQuery();
  const { data: pontos, isLoading: loadingPonto, refetch: refetchPonto } = trpc.enterprise.maoDeObra.listPonto.useQuery(
    { obraId: selectedObraId! },
    { enabled: !!selectedObraId }
  );
  const { data: obras } = trpc.enterprise.obras.list.useQuery();

  const createColabMutation = trpc.enterprise.maoDeObra.create.useMutation({
    onSuccess: () => {
      toast.success("Colaborador cadastrado!");
      setShowColabModal(false);
      setColabForm({ nome: "", cpf: "", tipo: "funcionario", funcao: "", custoHora: "", custoDiario: "", obraId: "" });
      refetchColab();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const registrarPontoMutation = trpc.enterprise.maoDeObra.registrarPonto.useMutation({
    onSuccess: (data: { message: string; horasTrabalhadas?: string; custoCalculado?: string }) => {
      toast.success(`Ponto registrado! ${data.horasTrabalhadas ? `${data.horasTrabalhadas}h trabalhadas` : ""}`);
      setShowPontoModal(false);
      setPontoForm({ maoDeObraId: "", obraId: "", data: new Date().toISOString().split("T")[0], entrada: "08:00", saida: "17:00", observacao: "" });
      refetchPonto();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const inputStyle = {
    background: OPERIS_COLORS.bgSurface, border: `1px solid ${OPERIS_COLORS.border}`,
    borderRadius: 6, padding: "0.5rem 0.75rem",
    color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem", outline: "none",
    width: "100%", boxSizing: "border-box" as const,
  };
  const labelStyle = { color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem", fontWeight: 500 as const };

  const ativos = (colaboradores ?? []).filter((c: { ativo?: boolean | null }) => c.ativo !== false);
  const totalCustoHora = (colaboradores ?? []).reduce((acc: number, c: { custoHora?: string | null }) =>
    acc + parseFloat(c.custoHora || "0"), 0);

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1280 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: OPERIS_COLORS.textPrimary, margin: 0 }}>
              Mão de Obra
            </h1>
            <p style={{ color: OPERIS_COLORS.textMuted, fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Colaboradores, registro de ponto e custo por obra
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setShowPontoModal(true)}
              style={{
                background: OPERIS_COLORS.bgCard, color: OPERIS_COLORS.textPrimary,
                border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 6, padding: "0.5rem 1rem",
                fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}
            >
              <Clock size={16} /> Registrar Ponto
            </button>
            <button
              onClick={() => setShowColabModal(true)}
              style={{
                background: OPERIS_COLORS.primary, color: "#fff",
                border: "none", borderRadius: 6, padding: "0.5rem 1rem",
                fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}
            >
              <Plus size={16} /> Novo Colaborador
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Colaboradores Ativos", value: String(ativos.length), color: OPERIS_COLORS.primary, icon: <Users size={18} /> },
            { label: "Total Cadastrados", value: String(colaboradores?.length ?? 0), color: OPERIS_COLORS.textSecondary, icon: <HardHat size={18} /> },
            { label: "Custo/Hora Total", value: fmt(totalCustoHora), color: OPERIS_COLORS.warning, icon: <Clock size={18} /> },
            { label: "Obras Ativas", value: String((obras ?? []).filter((o: { status?: string | null }) => o.status === "em_andamento").length), color: OPERIS_COLORS.success, icon: <DollarSign size={18} /> },
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

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {(["colaboradores", "ponto"] as TabType[]).map(t => (
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
              {t === "colaboradores" ? `Colaboradores (${colaboradores?.length ?? 0})` : "Registro de Ponto"}
            </button>
          ))}
        </div>

        {/* Tabela Colaboradores */}
        {tab === "colaboradores" && (
          <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
            {loadingColab ? (
              <div style={{ padding: "3rem", textAlign: "center", color: OPERIS_COLORS.textMuted }}>Carregando...</div>
            ) : !colaboradores?.length ? (
              <EmptyState
                title="Nenhum colaborador cadastrado"
                description="Cadastre técnicos e operadores para registrar ponto e calcular custo por obra."
                action={
                  <button onClick={() => setShowColabModal(true)} style={{ background: OPERIS_COLORS.primary, color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", marginTop: "0.75rem" }}>
                    Novo Colaborador
                  </button>
                }
              />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                    {["Nome", "CPF", "Tipo", "Função", "Custo/Hora", "Custo/Dia", "Obra Vinculada"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: OPERIS_COLORS.textMuted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(colaboradores as Array<{ id: number; nome: string; cpf?: string | null; tipo?: string | null; funcao?: string | null; custoHora?: string | null; custoDiario?: string | null; obraId?: number | null }>).map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                      <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem", fontWeight: 600 }}>{c.nome}</td>
                      <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textMuted, fontSize: "0.8125rem", fontFamily: "monospace" }}>{c.cpf || "—"}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{
                          background: c.tipo === "funcionario" ? "rgba(59,130,246,0.12)" : c.tipo === "terceiro" ? "rgba(234,179,8,0.12)" : "rgba(168,85,247,0.12)",
                          color: c.tipo === "funcionario" ? "#3b82f6" : c.tipo === "terceiro" ? "#ca8a04" : "#a855f7",
                          border: `1px solid ${c.tipo === "funcionario" ? "rgba(59,130,246,0.3)" : c.tipo === "terceiro" ? "rgba(234,179,8,0.3)" : "rgba(168,85,247,0.3)"}`,
                          borderRadius: 5, padding: "0.2rem 0.5rem", fontSize: "0.75rem", fontWeight: 600,
                        }}>
                          {c.tipo || "funcionario"}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>{c.funcao || "—"}</td>
                      <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.warning, fontWeight: 700, fontSize: "0.875rem" }}>
                        {c.custoHora ? fmt(parseFloat(c.custoHora)) + "/h" : "—"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                        {c.custoDiario ? fmt(parseFloat(c.custoDiario)) + "/dia" : "—"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                        {c.obraId ? (obras ?? []).find((o: { id: number; codigo?: string }) => o.id === c.obraId)?.codigo || `Obra #${c.obraId}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tabela Ponto */}
        {tab === "ponto" && (
          <div>
            <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <label style={labelStyle}>Filtrar por Obra:</label>
              <select
                style={{ ...inputStyle, width: "auto", minWidth: 220 }}
                value={selectedObraId ?? ""}
                onChange={e => setSelectedObraId(e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Selecione uma obra...</option>
                {(obras ?? []).map((o: { id: number; codigo?: string; nome?: string }) => (
                  <option key={o.id} value={o.id}>{o.codigo} — {o.nome}</option>
                ))}
              </select>
            </div>
            <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
              {!selectedObraId ? (
                <div style={{ padding: "3rem", textAlign: "center", color: OPERIS_COLORS.textMuted }}>
                  Selecione uma obra para ver os registros de ponto.
                </div>
              ) : loadingPonto ? (
                <div style={{ padding: "3rem", textAlign: "center", color: OPERIS_COLORS.textMuted }}>Carregando...</div>
              ) : !pontos?.length ? (
                <EmptyState title="Nenhum ponto registrado" description="Registre o ponto dos colaboradores nesta obra." />
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                      {["Data", "Colaborador", "Entrada", "Saída", "Horas", "Custo", "Obs."].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: OPERIS_COLORS.textMuted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(pontos as Array<{ id: number; data: Date | string; maoDeObraId: number; entrada?: string | null; saida?: string | null; horasTrabalhadas?: string | null; custoCalculado?: string | null; observacao?: string | null }>).map(p => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                          {new Date(p.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem" }}>
                          {(colaboradores ?? []).find((c: { id: number; nome: string }) => c.id === p.maoDeObraId)?.nome || `ID ${p.maoDeObraId}`}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>{p.entrada || "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>{p.saida || "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.primary, fontWeight: 700, fontSize: "0.875rem" }}>
                          {p.horasTrabalhadas ? `${parseFloat(p.horasTrabalhadas).toFixed(1)}h` : "—"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.danger, fontWeight: 700, fontSize: "0.875rem" }}>
                          {p.custoCalculado ? fmt(parseFloat(p.custoCalculado)) : "—"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: OPERIS_COLORS.textMuted, fontSize: "0.8125rem" }}>{p.observacao || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Modal Colaborador */}
        {showColabModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
            <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 12, padding: "1.75rem", width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ color: OPERIS_COLORS.textPrimary, fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Novo Colaborador</h2>
                <button onClick={() => setShowColabModal(false)} style={{ background: "none", border: "none", color: OPERIS_COLORS.textMuted, cursor: "pointer", fontSize: "1.25rem" }}>×</button>
              </div>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={labelStyle}>Nome Completo *</label>
                  <input style={inputStyle} value={colabForm.nome} onChange={e => setColabForm(f => ({ ...f, nome: e.target.value }))} placeholder="João da Silva" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>CPF</label>
                    <input style={inputStyle} value={colabForm.cpf} onChange={e => setColabForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Tipo</label>
                    <select style={inputStyle} value={colabForm.tipo} onChange={e => setColabForm(f => ({ ...f, tipo: e.target.value as "funcionario" | "terceiro" | "empreiteiro" }))}>
                      <option value="funcionario">Funcionário CLT</option>
                      <option value="terceiro">Terceiro / PJ</option>
                      <option value="empreiteiro">Empreiteiro</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Função</label>
                    <input style={inputStyle} value={colabForm.funcao} onChange={e => setColabForm(f => ({ ...f, funcao: e.target.value }))} placeholder="Técnico CO₂" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Custo/Hora (R$)</label>
                    <input style={inputStyle} type="number" value={colabForm.custoHora} onChange={e => setColabForm(f => ({ ...f, custoHora: e.target.value }))} placeholder="35.00" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Custo/Dia (R$)</label>
                    <input style={inputStyle} type="number" value={colabForm.custoDiario} onChange={e => setColabForm(f => ({ ...f, custoDiario: e.target.value }))} placeholder="280.00" />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={labelStyle}>Vincular a Obra (opcional)</label>
                  <select style={inputStyle} value={colabForm.obraId} onChange={e => setColabForm(f => ({ ...f, obraId: e.target.value }))}>
                    <option value="">Sem obra vinculada</option>
                    {(obras ?? []).map((o: { id: number; codigo?: string; nome?: string }) => <option key={o.id} value={String(o.id)}>{o.codigo} — {o.nome}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <button onClick={() => setShowColabModal(false)} style={{ background: "transparent", color: OPERIS_COLORS.textSecondary, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 6, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem" }}>Cancelar</button>
                  <button
                    onClick={() => createColabMutation.mutate({
                      nome: colabForm.nome,
                      cpf: colabForm.cpf || undefined,
                      tipo: colabForm.tipo,
                      funcao: colabForm.funcao || undefined,
                      custoHora: colabForm.custoHora || undefined,
                      custoDiario: colabForm.custoDiario || undefined,
                      obraId: colabForm.obraId ? parseInt(colabForm.obraId) : undefined,
                    })}
                    disabled={!colabForm.nome || createColabMutation.isPending}
                    style={{ background: OPERIS_COLORS.primary, color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, opacity: !colabForm.nome ? 0.5 : 1 }}
                  >
                    {createColabMutation.isPending ? "Salvando..." : "Cadastrar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ponto */}
        {showPontoModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
            <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 12, padding: "1.75rem", width: "100%", maxWidth: 480 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ color: OPERIS_COLORS.textPrimary, fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Registrar Ponto</h2>
                <button onClick={() => setShowPontoModal(false)} style={{ background: "none", border: "none", color: OPERIS_COLORS.textMuted, cursor: "pointer", fontSize: "1.25rem" }}>×</button>
              </div>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Colaborador *</label>
                    <select style={inputStyle} value={pontoForm.maoDeObraId} onChange={e => setPontoForm(f => ({ ...f, maoDeObraId: e.target.value }))}>
                      <option value="">Selecione...</option>
                      {(colaboradores ?? []).map((c: { id: number; nome: string }) => <option key={c.id} value={String(c.id)}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Obra *</label>
                    <select style={inputStyle} value={pontoForm.obraId} onChange={e => setPontoForm(f => ({ ...f, obraId: e.target.value }))}>
                      <option value="">Selecione...</option>
                      {(obras ?? []).map((o: { id: number; codigo?: string; nome?: string }) => <option key={o.id} value={String(o.id)}>{o.codigo} — {o.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Data *</label>
                    <input style={inputStyle} type="date" value={pontoForm.data} onChange={e => setPontoForm(f => ({ ...f, data: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Entrada</label>
                    <input style={inputStyle} type="time" value={pontoForm.entrada} onChange={e => setPontoForm(f => ({ ...f, entrada: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={labelStyle}>Saída</label>
                    <input style={inputStyle} type="time" value={pontoForm.saida} onChange={e => setPontoForm(f => ({ ...f, saida: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={labelStyle}>Observação</label>
                  <input style={inputStyle} value={pontoForm.observacao} onChange={e => setPontoForm(f => ({ ...f, observacao: e.target.value }))} placeholder="Opcional..." />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <button onClick={() => setShowPontoModal(false)} style={{ background: "transparent", color: OPERIS_COLORS.textSecondary, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 6, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem" }}>Cancelar</button>
                  <button
                    onClick={() => registrarPontoMutation.mutate({
                      maoDeObraId: parseInt(pontoForm.maoDeObraId),
                      obraId: parseInt(pontoForm.obraId),
                      data: pontoForm.data,
                      entrada: pontoForm.entrada || undefined,
                      saida: pontoForm.saida || undefined,
                      observacao: pontoForm.observacao || undefined,
                    })}
                    disabled={!pontoForm.maoDeObraId || !pontoForm.obraId || !pontoForm.data || registrarPontoMutation.isPending}
                    style={{ background: OPERIS_COLORS.primary, color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, opacity: !pontoForm.maoDeObraId || !pontoForm.obraId || !pontoForm.data ? 0.5 : 1 }}
                  >
                    {registrarPontoMutation.isPending ? "Salvando..." : "Registrar"}
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

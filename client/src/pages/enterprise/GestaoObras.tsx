import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { SectionHeader, StatusBadge, EmptyState } from "@/components/operis";
import { OPERIS_COLORS } from "@/lib/operis-tokens";
import { Building2, Plus, Search, Filter, Edit, Eye, DollarSign, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "planejamento", label: "Planejamento" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "pausada", label: "Pausada" },
  { value: "concluida", label: "Concluída" },
  { value: "cancelada", label: "Cancelada" },
];

const TIPO_OPTIONS = [
  { value: "instalacao", label: "Instalação" },
  { value: "manutencao", label: "Manutenção" },
  { value: "reforma", label: "Reforma" },
  { value: "inspecao", label: "Inspeção" },
  { value: "projeto", label: "Projeto" },
  { value: "outro", label: "Outro" },
];

type ObraStatus = "planejamento" | "em_andamento" | "pausada" | "concluida" | "cancelada";

interface NovaObraForm {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: string;
  endereco: string;
  cidade: string;
  estado: string;
  dataInicioPrevista: string;
  dataFimPrevista: string;
  orcamentoTotal: string;
  receitaContratada: string;
}

export default function GestaoObras() {
  const [statusFilter, setStatusFilter] = useState<ObraStatus | "">("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NovaObraForm>({
    codigo: "", nome: "", descricao: "", tipo: "instalacao",
    endereco: "", cidade: "", estado: "",
    dataInicioPrevista: "", dataFimPrevista: "",
    orcamentoTotal: "", receitaContratada: "",
  });

  const { data: obras, isLoading, refetch } = trpc.enterprise.obras.list.useQuery(
    statusFilter ? { status: statusFilter } : undefined
  );

  const createMutation = trpc.enterprise.obras.create.useMutation({
    onSuccess: () => {
      toast.success("Obra criada com sucesso!");
      setShowModal(false);
      setForm({ codigo: "", nome: "", descricao: "", tipo: "instalacao", endereco: "", cidade: "", estado: "", dataInicioPrevista: "", dataFimPrevista: "", orcamentoTotal: "", receitaContratada: "" });
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (obras ?? []).filter(o =>
    !search || o.nome.toLowerCase().includes(search.toLowerCase()) || o.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const input = (field: keyof NovaObraForm, label: string, type = "text", placeholder = "") => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label style={{ color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem", fontWeight: 500 }}>{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        style={{
          background: OPERIS_COLORS.bgSurface,
          border: `1px solid ${OPERIS_COLORS.border}`,
          borderRadius: 6,
          padding: "0.5rem 0.75rem",
          color: OPERIS_COLORS.textPrimary,
          fontSize: "0.875rem",
          outline: "none",
        }}
      />
    </div>
  );

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1280 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: OPERIS_COLORS.textPrimary, margin: 0 }}>
              Gestão de Obras
            </h1>
            <p style={{ color: OPERIS_COLORS.textMuted, fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Portfólio completo de obras — instalação, manutenção e inspeção
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
            <Plus size={16} /> Nova Obra
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: OPERIS_COLORS.textMuted }} />
            <input
              type="text"
              placeholder="Buscar por código ou nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", background: OPERIS_COLORS.bgCard,
                border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 6,
                padding: "0.5rem 0.75rem 0.5rem 2rem",
                color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem", outline: "none",
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ObraStatus | "")}
            style={{
              background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`,
              borderRadius: 6, padding: "0.5rem 0.75rem",
              color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem", outline: "none",
            }}
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div style={{ color: OPERIS_COLORS.textMuted, fontSize: "0.8125rem" }}>
            {filtered.length} obra{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Tabela */}
        <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: OPERIS_COLORS.textMuted }}>Carregando obras...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nenhuma obra encontrada"
              description="Crie sua primeira obra para começar a controlar custos, mão de obra e financeiro."
              action={
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    background: OPERIS_COLORS.primary, color: "#fff",
                    border: "none", borderRadius: 6, padding: "0.5rem 1rem",
                    fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                    marginTop: "0.75rem",
                  }}
                >
                  Nova Obra
                </button>
              }
            />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                  {["Código", "Nome / Endereço", "Tipo", "Status", "Período", "Orçamento", "Custo Real", "Margem", "Ações"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "0.75rem 1rem",
                      color: OPERIS_COLORS.textMuted, fontSize: "0.75rem",
                      fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const orcamento = parseFloat((o.orcamentoTotal as string) || "0");
                  const custo = parseFloat((o.custoRealTotal as string) || "0");
                  const receita = parseFloat((o.receitaContratada as string) || "0");
                  const margem = receita > 0 ? ((receita - custo) / receita * 100).toFixed(1) : null;
                  const desvio = orcamento > 0 && custo > 0 ? ((custo - orcamento) / orcamento * 100).toFixed(1) : null;

                  return (
                    <tr key={o.id} style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ color: OPERIS_COLORS.primary, fontFamily: "monospace", fontSize: "0.8125rem", fontWeight: 700 }}>
                          {o.codigo}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ color: OPERIS_COLORS.textPrimary, fontSize: "0.875rem", fontWeight: 600 }}>{o.nome}</div>
                        {o.cidade && (
                          <div style={{ color: OPERIS_COLORS.textMuted, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.125rem" }}>
                            <MapPin size={11} /> {o.cidade}{o.estado ? `, ${o.estado}` : ""}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                        {o.tipo || "—"}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <StatusBadge status={o.status ?? ""} />
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.75rem" }}>
                        {o.dataInicioPrevista ? new Date(o.dataInicioPrevista).toLocaleDateString("pt-BR") : "—"}
                        {o.dataFimPrevista ? ` → ${new Date(o.dataFimPrevista).toLocaleDateString("pt-BR")}` : ""}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                        {orcamento > 0 ? fmt(orcamento) : "—"}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        {custo > 0 ? (
                          <div>
                            <div style={{ color: custo > orcamento && orcamento > 0 ? OPERIS_COLORS.danger : OPERIS_COLORS.textPrimary, fontSize: "0.8125rem" }}>
                              {fmt(custo)}
                            </div>
                            {desvio && (
                              <div style={{ fontSize: "0.7rem", color: parseFloat(desvio) > 0 ? OPERIS_COLORS.danger : OPERIS_COLORS.success }}>
                                {parseFloat(desvio) > 0 ? "+" : ""}{desvio}% vs orç.
                              </div>
                            )}
                          </div>
                        ) : <span style={{ color: OPERIS_COLORS.textMuted }}>—</span>}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        {margem ? (
                          <span style={{
                            color: parseFloat(margem) >= 20 ? OPERIS_COLORS.success : parseFloat(margem) >= 10 ? OPERIS_COLORS.warning : OPERIS_COLORS.danger,
                            fontSize: "0.8125rem", fontWeight: 700,
                          }}>
                            {margem}%
                          </span>
                        ) : <span style={{ color: OPERIS_COLORS.textMuted }}>—</span>}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Link href={`/app/enterprise/obras/${o.id}`}>
                            <button style={{
                              background: OPERIS_COLORS.primaryMuted, color: OPERIS_COLORS.primary,
                              border: `1px solid ${OPERIS_COLORS.primaryBorder}`, borderRadius: 5,
                              padding: "0.375rem 0.625rem", cursor: "pointer", fontSize: "0.75rem",
                              display: "flex", alignItems: "center", gap: "0.25rem",
                            }}>
                              <Eye size={12} /> Ver
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Nova Obra */}
        {showModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "1rem",
          }}>
            <div style={{
              background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`,
              borderRadius: 12, padding: "1.75rem", width: "100%", maxWidth: 680,
              maxHeight: "90vh", overflowY: "auto",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ color: OPERIS_COLORS.textPrimary, fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                  <Building2 size={18} style={{ marginRight: "0.5rem", verticalAlign: "middle", color: OPERIS_COLORS.primary }} />
                  Nova Obra
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: OPERIS_COLORS.textMuted, cursor: "pointer", fontSize: "1.25rem" }}>×</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1rem" }}>
                {input("codigo", "Código *", "text", "EX-001")}
                {input("nome", "Nome da Obra *", "text", "Instalação CO₂ — Empresa XYZ")}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem", fontWeight: 500, display: "block", marginBottom: "0.375rem" }}>Tipo</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  style={{
                    width: "100%", background: OPERIS_COLORS.bgSurface,
                    border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 6,
                    padding: "0.5rem 0.75rem", color: OPERIS_COLORS.textPrimary,
                    fontSize: "0.875rem", outline: "none",
                  }}
                >
                  {TIPO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                {input("endereco", "Endereço", "text", "Rua das Flores, 123")}
                {input("cidade", "Cidade", "text", "São Paulo")}
                {input("estado", "UF", "text", "SP")}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                {input("dataInicioPrevista", "Início Previsto", "date")}
                {input("dataFimPrevista", "Fim Previsto", "date")}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                {input("orcamentoTotal", "Orçamento Total (R$)", "number", "50000")}
                {input("receitaContratada", "Receita Contratada (R$)", "number", "65000")}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem", fontWeight: 500, display: "block", marginBottom: "0.375rem" }}>Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  rows={3}
                  placeholder="Descreva o escopo da obra..."
                  style={{
                    width: "100%", background: OPERIS_COLORS.bgSurface,
                    border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 6,
                    padding: "0.5rem 0.75rem", color: OPERIS_COLORS.textPrimary,
                    fontSize: "0.875rem", outline: "none", resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "transparent", color: OPERIS_COLORS.textSecondary,
                    border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 6,
                    padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => createMutation.mutate({
                    codigo: form.codigo,
                    nome: form.nome,
                    descricao: form.descricao || undefined,
                    tipo: form.tipo as "instalacao" | "manutencao" | "reforma" | "inspecao" | "projeto" | "outro",
                    endereco: form.endereco || undefined,
                    cidade: form.cidade || undefined,
                    estado: form.estado || undefined,
                    dataInicioPrevista: form.dataInicioPrevista || undefined,
                    dataFimPrevista: form.dataFimPrevista || undefined,
                    orcamentoTotal: form.orcamentoTotal || undefined,
                    receitaContratada: form.receitaContratada || undefined,
                  })}
                  disabled={!form.codigo || !form.nome || createMutation.isPending}
                  style={{
                    background: OPERIS_COLORS.primary, color: "#fff",
                    border: "none", borderRadius: 6, padding: "0.5rem 1.25rem",
                    cursor: "pointer", fontSize: "0.875rem", fontWeight: 600,
                    opacity: !form.codigo || !form.nome ? 0.5 : 1,
                  }}
                >
                  {createMutation.isPending ? "Criando..." : "Criar Obra"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { KPIWidget, SectionHeader, StatusBadge, EmptyState } from "@/components/operis";
import { OPERIS_COLORS } from "@/lib/operis-tokens";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Building2, TrendingUp, DollarSign, Users, AlertTriangle, CheckCircle, Clock, Hammer } from "lucide-react";
import { Link } from "wouter";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

const DarkTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: OPERIS_COLORS.bgSurface, border: `1px solid ${OPERIS_COLORS.border}`, padding: "0.625rem 0.875rem", fontSize: "0.8125rem", borderRadius: 6 }}>
      {label && <div style={{ color: OPERIS_COLORS.textMuted, marginBottom: "0.375rem", fontSize: "0.75rem" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === "number" && p.value > 1000 ? fmt(p.value) : p.value}</div>
      ))}
    </div>
  );
};

const PIE_COLORS = [OPERIS_COLORS.primary, OPERIS_COLORS.success, OPERIS_COLORS.warning, OPERIS_COLORS.danger, "#8B5CF6"];

export default function DashboardExecutivo() {
  const { data: obras, isLoading: loadingObras } = trpc.enterprise.obras.dashboard.useQuery();
  const { data: fluxo, isLoading: loadingFluxo } = trpc.enterprise.financeiro.fluxoCaixa.useQuery();

  const obraStatusData = obras ? [
    { name: "Em Andamento", value: obras.emAndamento, color: OPERIS_COLORS.primary },
    { name: "Planejamento", value: obras.planejamento, color: OPERIS_COLORS.warning },
    { name: "Concluídas", value: obras.concluidas, color: OPERIS_COLORS.success },
  ].filter(d => d.value > 0) : [];

  const fluxoData = fluxo ? [
    { name: "A Pagar", valor: fluxo.totalPagar, color: OPERIS_COLORS.danger },
    { name: "A Receber", valor: fluxo.totalReceber, color: OPERIS_COLORS.success },
    { name: "Pago", valor: fluxo.totalPago, color: OPERIS_COLORS.textMuted },
    { name: "Recebido", valor: fluxo.totalRecebido, color: OPERIS_COLORS.primary },
  ] : [];

  const margem = obras && obras.receitaTotal > 0
    ? ((obras.receitaTotal - obras.custoTotal) / obras.receitaTotal * 100).toFixed(1)
    : "0";

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1280 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: OPERIS_COLORS.textPrimary, margin: 0 }}>
              Dashboard Executivo
            </h1>
            <p style={{ color: OPERIS_COLORS.textMuted, fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Visão consolidada de obras, custos e financeiro
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href="/app/enterprise/obras">
              <button style={{
                background: OPERIS_COLORS.primary, color: "#fff",
                border: "none", borderRadius: 6, padding: "0.5rem 1rem",
                fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <Building2 size={16} /> Gerenciar Obras
              </button>
            </Link>
          </div>
        </div>

        {/* KPIs Obras */}
        <SectionHeader title="Gestão de Obras" subtitle="Visão geral do portfólio de obras" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          <KPIWidget
            label="Total de Obras"
            value={loadingObras ? "..." : String(obras?.total ?? 0)}
            icon={<Building2 size={20} color={OPERIS_COLORS.primary} />}
            sub={obras?.emAndamento ? `${obras.emAndamento} em andamento` : undefined}
            accent="blue"
          />
          <KPIWidget
            label="Receita Contratada"
            value={loadingObras ? "..." : fmt(obras?.receitaTotal ?? 0)}
            icon={<TrendingUp size={20} color={OPERIS_COLORS.success} />}
            sub={`Orçamento: ${fmt(obras?.orcamentoTotal ?? 0)}`}
            accent="green"
          />
          <KPIWidget
            label="Custo Real Total"
            value={loadingObras ? "..." : fmt(obras?.custoTotal ?? 0)}
            icon={<DollarSign size={20} color={OPERIS_COLORS.warning} />}
            sub={`Margem: ${margem}%`}
            accent="yellow"
          />
          <KPIWidget
            label="Obras Concluídas"
            value={loadingObras ? "..." : String(obras?.concluidas ?? 0)}
            icon={<CheckCircle size={20} color={OPERIS_COLORS.success} />}
            sub={obras?.planejamento ? `${obras.planejamento} em planejamento` : undefined}
            accent="green"
          />
        </div>

        {/* KPIs Financeiro */}
        <SectionHeader title="Fluxo de Caixa" subtitle="Contas a pagar e a receber" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          <KPIWidget
            label="A Receber"
            value={loadingFluxo ? "..." : fmt(fluxo?.totalReceber ?? 0)}
            icon={<TrendingUp size={20} color={OPERIS_COLORS.success} />}
            accent="green"
          />
          <KPIWidget
            label="A Pagar"
            value={loadingFluxo ? "..." : fmt(fluxo?.totalPagar ?? 0)}
            icon={<DollarSign size={20} color={OPERIS_COLORS.danger} />}
            accent="red"
          />
          <KPIWidget
            label="Saldo Previsto"
            value={loadingFluxo ? "..." : fmt(fluxo?.saldoPrevisto ?? 0)}
            icon={<TrendingUp size={20} color={(fluxo?.saldoPrevisto ?? 0) >= 0 ? OPERIS_COLORS.success : OPERIS_COLORS.danger} />}
            accent={(fluxo?.saldoPrevisto ?? 0) >= 0 ? "green" : "red"}
          />
          <KPIWidget
            label="Contas Vencidas"
            value={loadingFluxo ? "..." : String(fluxo?.contasVencidas ?? 0)}
            icon={<AlertTriangle size={20} color={OPERIS_COLORS.danger} />}
            accent="red"
          />
        </div>

        {/* Gráficos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
          {/* Status das Obras */}
          <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ color: OPERIS_COLORS.textPrimary, fontWeight: 600, marginBottom: "1rem" }}>Status das Obras</div>
            {obraStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={obraStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {obraStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="Nenhuma obra cadastrada" description="Crie sua primeira obra para ver o status aqui." />
            )}
          </div>

          {/* Fluxo de Caixa */}
          <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ color: OPERIS_COLORS.textPrimary, fontWeight: 600, marginBottom: "1rem" }}>Fluxo de Caixa</div>
            {fluxoData.some(d => d.valor > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={fluxoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={OPERIS_COLORS.border} />
                  <XAxis dataKey="name" tick={{ fill: OPERIS_COLORS.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: OPERIS_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="valor" name="Valor" radius={[4, 4, 0, 0]}>
                    {fluxoData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="Sem dados financeiros" description="Registre contas a pagar e receber para ver o fluxo." />
            )}
          </div>
        </div>

        {/* Últimas Obras */}
        {obras?.obras && obras.obras.length > 0 && (
          <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ color: OPERIS_COLORS.textPrimary, fontWeight: 600 }}>Obras Recentes</div>
              <Link href="/app/enterprise/obras">
                <span style={{ color: OPERIS_COLORS.primary, fontSize: "0.8125rem", cursor: "pointer" }}>Ver todas →</span>
              </Link>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Código", "Nome", "Tipo", "Status", "Orçamento", "Custo Real"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: OPERIS_COLORS.textMuted, fontSize: "0.75rem", fontWeight: 600, borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {obras.obras.slice(0, 6).map((o) => (
                  <tr key={o.id} style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                    <td style={{ padding: "0.625rem 0.75rem", color: OPERIS_COLORS.primary, fontSize: "0.8125rem", fontFamily: "monospace" }}>{o.codigo}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: OPERIS_COLORS.textPrimary, fontSize: "0.8125rem" }}>{o.nome}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>{o.tipo || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>
                      <StatusBadge status={o.status ?? ""} />
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                      {o.orcamentoTotal ? fmt(parseFloat(o.orcamentoTotal as string)) : "—"}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", color: OPERIS_COLORS.textSecondary, fontSize: "0.8125rem" }}>
                      {o.custoRealTotal ? fmt(parseFloat(o.custoRealTotal as string)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

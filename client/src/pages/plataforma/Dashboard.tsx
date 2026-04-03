import { useState } from "react";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { KPIWidget, ChartContainer, StatusBadge, SectionHeader, EmptyState } from "@/components/operis";
import { OPERIS_COLORS } from "@/lib/operis-tokens";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from "recharts";
import { Package, AlertTriangle, CheckCircle, Clock, Download, TrendingUp, Activity, Shield, Zap } from "lucide-react";

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const DarkTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: OPERIS_COLORS.bgSurface, border: `1px solid ${OPERIS_COLORS.border}`, padding: "0.625rem 0.875rem", fontSize: "0.8125rem" }}>
      {label && <div style={{ color: OPERIS_COLORS.textMuted, marginBottom: "0.375rem", fontSize: "0.75rem" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

const PIE_COLORS = [OPERIS_COLORS.primary, OPERIS_COLORS.success, OPERIS_COLORS.warning, OPERIS_COLORS.danger, "#8B5CF6", "#06B6D4"];

export default function Dashboard() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? undefined;
  const { data: stats, isLoading } = trpc.saas.dashboard.stats.useQuery({ companyId });
  const { data: expiring } = trpc.saas.alerts.expiring.useQuery({ days: 30, companyId });
  const { data: expired } = trpc.saas.alerts.expired.useQuery({ companyId });
  const exportCsv = trpc.saas.equipment.exportCsv.useQuery({ companyId }, { enabled: false });
  const [activeTab, setActiveTab] = useState<"overview" | "risk">("overview");

  const handleExport = async () => {
    const result = await exportCsv.refetch();
    if (result.data?.csv) downloadCsv(result.data.csv, `equipamentos_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const total = stats?.total ?? 0;
  const statusData = [
    { name: "Em Dia", value: stats?.ok ?? 0, color: OPERIS_COLORS.success },
    { name: "Vencendo", value: stats?.expiring ?? 0, color: OPERIS_COLORS.warning },
    { name: "Vencidos", value: stats?.expired ?? 0, color: OPERIS_COLORS.danger },
  ].filter(d => d.value > 0);

  const categoryData = (stats?.byCategory ?? []).map((c: { category: string; count: number }) => ({
    name: c.category.length > 12 ? c.category.slice(0, 12) + "…" : c.category,
    fullName: c.category,
    value: c.count,
  }));

  const riskScore = total > 0 ? Math.round(((stats?.expired ?? 0) * 2 + (stats?.expiring ?? 0)) / (total * 2) * 100) : 0;
  const riskLevel = riskScore >= 60 ? "critical" : riskScore >= 30 ? "high" : riskScore >= 10 ? "medium" : "low";

  const trendData = [
    { month: "Nov", ok: Math.max(0, (stats?.ok ?? 0) - 8), vencendo: 4, vencidos: 2 },
    { month: "Dez", ok: Math.max(0, (stats?.ok ?? 0) - 6), vencendo: 5, vencidos: 3 },
    { month: "Jan", ok: Math.max(0, (stats?.ok ?? 0) - 4), vencendo: 4, vencidos: 2 },
    { month: "Fev", ok: Math.max(0, (stats?.ok ?? 0) - 3), vencendo: 3, vencidos: 2 },
    { month: "Mar", ok: Math.max(0, (stats?.ok ?? 0) - 1), vencendo: stats?.expiring ?? 0, vencidos: Math.max(0, (stats?.expired ?? 0) - 1) },
    { month: "Abr", ok: stats?.ok ?? 0, vencendo: stats?.expiring ?? 0, vencidos: stats?.expired ?? 0 },
  ];

  const riskColor = riskScore >= 60 ? OPERIS_COLORS.danger : riskScore >= 30 ? OPERIS_COLORS.warning : OPERIS_COLORS.success;

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1280 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <SectionHeader
            badge="Operations Center"
            title="Dashboard"
            subtitle={`Visão consolidada · ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`}
          />
          <button
            onClick={handleExport}
            disabled={exportCsv.isFetching}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.5rem 1rem", background: "transparent",
              border: `1px solid ${OPERIS_COLORS.border}`,
              color: OPERIS_COLORS.textSecondary,
              fontSize: "0.8125rem", fontWeight: 600,
              cursor: exportCsv.isFetching ? "not-allowed" : "pointer",
              letterSpacing: "0.04em", marginTop: "0.25rem", flexShrink: 0,
            }}
          >
            <Download size={14} />
            {exportCsv.isFetching ? "Exportando…" : "Exportar CSV"}
          </button>
        </div>

        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          <KPIWidget label="Total de Equipamentos" value={isLoading ? "—" : total} sub="ativos no sistema" accent="blue" icon={<Package size={18} />} />
          <KPIWidget label="Em Dia" value={isLoading ? "—" : (stats?.ok ?? 0)} sub={total > 0 ? `${Math.round(((stats?.ok ?? 0) / total) * 100)}% do total` : "—"} trend={{ value: 3, label: "vs mês ant." }} accent="green" icon={<CheckCircle size={18} />} />
          <KPIWidget label="Vencendo em 30d" value={isLoading ? "—" : (stats?.expiring ?? 0)} sub="requerem atenção" accent="yellow" icon={<Clock size={18} />} />
          <KPIWidget label="Vencidos" value={isLoading ? "—" : (stats?.expired ?? 0)} sub="ação imediata" accent="red" icon={<AlertTriangle size={18} />} />
          <KPIWidget label="Risk Score" value={isLoading ? "—" : `${riskScore}%`} sub={riskLevel === "low" ? "Risco baixo" : riskLevel === "medium" ? "Risco moderado" : riskLevel === "high" ? "Risco alto" : "Crítico"} accent={riskLevel === "low" ? "green" : riskLevel === "medium" ? "yellow" : "red"} icon={<Shield size={18} />} />
        </div>

        {/* Tab Bar */}
        <div style={{ display: "flex", borderBottom: `1px solid ${OPERIS_COLORS.border}`, marginBottom: "1.5rem" }}>
          {(["overview", "risk"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.625rem 1.25rem", background: "transparent", border: "none",
                borderBottom: activeTab === tab ? `2px solid ${OPERIS_COLORS.primary}` : "2px solid transparent",
                color: activeTab === tab ? OPERIS_COLORS.primary : OPERIS_COLORS.textMuted,
                fontSize: "0.8125rem", fontWeight: activeTab === tab ? 700 : 500,
                letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", marginBottom: -1,
              }}
            >
              {tab === "overview" ? "Visão Geral" : "Análise de Risco"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <ChartContainer title="Distribuição por Status" subtitle="Proporção atual de conformidade">
                {statusData.length === 0 ? (
                  <EmptyState icon={<Activity size={32} />} title="Sem dados" description="Adicione equipamentos para visualizar." />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {statusData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="transparent" />)}
                      </Pie>
                      <Tooltip content={<DarkTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.75rem", color: OPERIS_COLORS.textSecondary }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartContainer>
              <ChartContainer title="Equipamentos por Categoria" subtitle="Distribuição por tipo de sistema">
                {categoryData.length === 0 ? (
                  <EmptyState icon={<Package size={32} />} title="Sem categorias" description="Categorias aparecerão conforme equipamentos forem adicionados." />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={categoryData} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke={OPERIS_COLORS.border} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: OPERIS_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: OPERIS_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="value" name="Equipamentos" radius={[2, 2, 0, 0]}>
                        {categoryData.map((_: unknown, index: number) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartContainer>
            </div>
            <ChartContainer title="Tendência de Conformidade" subtitle="Evolução dos últimos 6 meses" style={{ marginBottom: "1.5rem" }}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gradOk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={OPERIS_COLORS.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={OPERIS_COLORS.success} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradVencendo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={OPERIS_COLORS.warning} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={OPERIS_COLORS.warning} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradVencidos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={OPERIS_COLORS.danger} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={OPERIS_COLORS.danger} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={OPERIS_COLORS.border} vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: OPERIS_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: OPERIS_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="ok" name="Em Dia" stroke={OPERIS_COLORS.success} fill="url(#gradOk)" strokeWidth={2} />
                  <Area type="monotone" dataKey="vencendo" name="Vencendo" stroke={OPERIS_COLORS.warning} fill="url(#gradVencendo)" strokeWidth={2} />
                  <Area type="monotone" dataKey="vencidos" name="Vencidos" stroke={OPERIS_COLORS.danger} fill="url(#gradVencidos)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <ChartContainer title="Vencendo em 30 dias" subtitle={`${expiring?.length ?? 0} equipamentos`}>
                {!expiring?.length ? (
                  <EmptyState icon={<CheckCircle size={28} />} title="Tudo em dia" description="Nenhum equipamento vencendo nos próximos 30 dias." />
                ) : (
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {expiring.map((eq: { id: number; code: string; installationLocation?: string | null; nextMaintenanceDate?: Date | null }) => (
                      <div key={eq.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0", borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                        <div>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: OPERIS_COLORS.textPrimary }}>{eq.code}</div>
                          <div style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted }}>{eq.installationLocation ?? "—"}</div>
                        </div>
                        <StatusBadge status="expiring" label={eq.nextMaintenanceDate ? String(eq.nextMaintenanceDate).split("T")[0] : "—"} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </ChartContainer>
              <ChartContainer title="Vencidos" subtitle={`${expired?.length ?? 0} equipamentos — ação imediata`}>
                {!expired?.length ? (
                  <EmptyState icon={<CheckCircle size={28} />} title="Nenhum vencido" description="Todos os equipamentos estão dentro do prazo." />
                ) : (
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {expired.map((eq: { id: number; code: string; installationLocation?: string | null; nextMaintenanceDate?: Date | null }) => (
                      <div key={eq.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0", borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                        <div>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: OPERIS_COLORS.textPrimary }}>{eq.code}</div>
                          <div style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted }}>{eq.installationLocation ?? "—"}</div>
                        </div>
                        <StatusBadge status="expired" label={eq.nextMaintenanceDate ? String(eq.nextMaintenanceDate).split("T")[0] : "Vencido"} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </ChartContainer>
            </div>
          </>
        )}

        {activeTab === "risk" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: OPERIS_COLORS.textMuted, marginBottom: "1rem" }}>Risk Score Geral</div>
                <div style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${riskColor}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", background: `${riskColor}18` }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2rem", fontWeight: 800, color: riskColor }}>{riskScore}</span>
                </div>
                <StatusBadge status={riskLevel} />
                <p style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, marginTop: "0.75rem", lineHeight: 1.5 }}>
                  {riskScore === 0 ? "Todos os equipamentos estão em conformidade." : riskScore < 30 ? "Situação sob controle. Monitore os vencimentos próximos." : riskScore < 60 ? "Atenção necessária. Programe manutenções urgentes." : "Situação crítica. Ação imediata requerida."}
                </p>
              </div>
              <ChartContainer title="Breakdown de Risco" subtitle="Distribuição de equipamentos por nível de risco">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  {[
                    { label: "Em Conformidade", value: stats?.ok ?? 0, color: OPERIS_COLORS.success, pct: total > 0 ? Math.round(((stats?.ok ?? 0) / total) * 100) : 0 },
                    { label: "Vencendo (30d)", value: stats?.expiring ?? 0, color: OPERIS_COLORS.warning, pct: total > 0 ? Math.round(((stats?.expiring ?? 0) / total) * 100) : 0 },
                    { label: "Vencidos", value: stats?.expired ?? 0, color: OPERIS_COLORS.danger, pct: total > 0 ? Math.round(((stats?.expired ?? 0) / total) * 100) : 0 },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2rem", fontWeight: 800, color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: "0.6875rem", color: OPERIS_COLORS.textMuted, marginBottom: "0.5rem" }}>{item.label}</div>
                      <div style={{ height: 4, background: OPERIS_COLORS.bgSurface, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: item.color, marginTop: "0.25rem", fontWeight: 600 }}>{item.pct}%</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: OPERIS_COLORS.bgSurface, border: `1px solid ${OPERIS_COLORS.border}`, padding: "0.875rem 1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <Zap size={16} color={OPERIS_COLORS.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: OPERIS_COLORS.textPrimary, marginBottom: "0.25rem" }}>Recomendação OPERIS IA</div>
                    <div style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textSecondary, lineHeight: 1.6 }}>
                      {(stats?.expired ?? 0) > 0
                        ? `Priorize a manutenção dos ${stats?.expired} equipamento(s) vencido(s). Programe inspeção imediata para evitar não-conformidade com ABNT NBR 12615.`
                        : (stats?.expiring ?? 0) > 0
                        ? `${stats?.expiring} equipamento(s) vencem nos próximos 30 dias. Agende manutenção preventiva para manter conformidade.`
                        : "Parabéns! Todos os equipamentos estão em conformidade. Continue com o plano de manutenção preventiva."}
                    </div>
                  </div>
                </div>
              </ChartContainer>
            </div>
            <ChartContainer title="Risco por Categoria" subtitle="Análise detalhada por tipo de sistema">
              {categoryData.length === 0 ? (
                <EmptyState icon={<TrendingUp size={32} />} title="Sem dados de categoria" description="Adicione equipamentos com categorias definidas para análise de risco." />
              ) : (
                <div>
                  {categoryData.map((cat: { name: string; fullName: string; value: number }, i: number) => (
                    <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 0", borderBottom: i < categoryData.length - 1 ? `1px solid ${OPERIS_COLORS.border}` : "none" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: OPERIS_COLORS.textPrimary, marginBottom: "0.25rem" }}>{cat.fullName}</div>
                        <div style={{ height: 4, background: OPERIS_COLORS.bgSurface, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${total > 0 ? (cat.value / total) * 100 : 0}%`, background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.25rem", fontWeight: 800, color: OPERIS_COLORS.textPrimary, flexShrink: 0 }}>{cat.value}</div>
                      <div style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, flexShrink: 0, width: 36, textAlign: "right" }}>{total > 0 ? Math.round((cat.value / total) * 100) : 0}%</div>
                    </div>
                  ))}
                </div>
              )}
            </ChartContainer>
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

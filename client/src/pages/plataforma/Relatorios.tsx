import { useState } from "react";
import SaasDashboardLayout from "../../components/SaasDashboardLayout";
import { useSaasAuth } from "../../contexts/SaasAuthContext";
import { trpc } from "../../lib/trpc";

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function BarChart({ data, title, colorFn }: {
  data: Array<{ label: string; count: number }>;
  title: string;
  colorFn?: (i: number) => string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const colors = ["#C8102E", "#1a3a5c", "#4a7fb5", "#e05a7a", "#6b9fd4", "#8b4a6b"];
  return (
    <div className="chart-block">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-bars">
        {data.map((d, i) => (
          <div key={d.label} className="chart-bar-row">
            <span className="chart-bar-label">{d.label}</span>
            <div className="chart-bar-track">
              <div
                className="chart-bar-fill"
                style={{
                  width: `${(d.count / max) * 100}%`,
                  background: colorFn ? colorFn(i) : colors[i % colors.length],
                }}
              />
            </div>
            <span className="chart-bar-count">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  extintor: "Extintores",
  hidrante: "Hidrantes",
  sprinkler: "Sprinklers",
  detector: "Detectores",
  sinalizacao: "Sinalização",
  complementar: "Complementar",
};

const STATUS_LABELS: Record<string, string> = {
  ok: "Em dia",
  proximo_vencimento: "Próximo venc.",
  vencido: "Vencido",
  inativo: "Inativo",
};

const STATUS_COLORS: Record<string, string> = {
  ok: "#22c55e",
  proximo_vencimento: "#f59e0b",
  vencido: "#C8102E",
  inativo: "#6b7280",
};

const MAINT_LABELS: Record<string, string> = {
  recarga: "Recarga",
  inspecao: "Inspeção",
  substituicao: "Substituição",
  instalacao: "Instalação",
  teste: "Teste",
  outro: "Outro",
};

export default function Relatorios() {
  const { user } = useSaasAuth();
  const isAdmin = user?.role === "superadmin" || user?.role === "admin";

  const { data: report, isLoading, error: reportError } = trpc.saas.reports.usage.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: csvData, refetch: fetchCsv } = trpc.saas.reports.exportUsageCsv.useQuery(undefined, {
    enabled: false,
  });

  const [exporting, setExporting] = useState(false);

  async function handleExportCsv() {
    setExporting(true);
    try {
      const result = await fetchCsv();
      const csv = result.data?.csv;
      if (!csv) return;
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-plataforma-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (!isAdmin) {
    return (
      <SaasDashboardLayout>
        <div className="saas-page">
          <div className="saas-page-header">
            <h1 className="saas-page-title">Relatórios</h1>
          </div>
          <div className="saas-empty-state">
            <p>Acesso restrito a administradores.</p>
          </div>
        </div>
      </SaasDashboardLayout>
    );
  }

  return (
    <SaasDashboardLayout>
      <div className="saas-page">
        <div className="saas-page-header">
          <div>
            <h1 className="saas-page-title">Relatórios da Plataforma</h1>
            <p className="saas-page-subtitle">Visão consolidada de todos os dados da plataforma</p>
          </div>
          <button
            className="saas-btn saas-btn-primary"
            onClick={handleExportCsv}
            disabled={exporting || isLoading}
          >
            {exporting ? "Exportando..." : "⬇ Exportar CSV"}
          </button>
        </div>

        {isLoading && (
          <div className="saas-loading">
            <div className="saas-spinner" />
            <span>Carregando relatório...</span>
          </div>
        )}

        {reportError && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "16px 20px", color: "#991b1b", fontFamily: "Inter, sans-serif", fontSize: 14 }}>
            <strong>Erro ao carregar relatório:</strong> {reportError.message}
          </div>
        )}

        {!isLoading && !reportError && !report && (
          <div className="saas-empty-state">
            <p>Nenhum dado disponível para gerar o relatório.</p>
          </div>
        )}

        {report && (
          <>
            {/* Resumo Geral */}
            <section className="report-section">
              <h2 className="report-section-title">Resumo Geral</h2>
              <div className="report-generated">
                Gerado em: {new Date(report.generatedAt).toLocaleString("pt-BR")}
              </div>
              <div className="stats-grid-4">
                <StatCard label="Total de Empresas" value={report.summary.totalCompanies} color="#1a3a5c" />
                <StatCard label="Empresas Ativas" value={report.summary.activeCompanies} color="#22c55e" />
                <StatCard label="Total de Equipamentos" value={report.summary.totalEquipment} color="#1a3a5c" />
                <StatCard label="Equipamentos em Dia" value={report.summary.okEquipment} color="#22c55e" />
                <StatCard label="Vencendo em 30 dias" value={report.summary.expiringEquipment} color="#f59e0b" />
                <StatCard label="Equipamentos Vencidos" value={report.summary.expiredEquipment} color="#C8102E" />
                <StatCard label="Total de Manutenções" value={report.summary.totalMaintenance} color="#4a7fb5" />
                <StatCard label="Total de Documentos" value={report.summary.totalDocuments} color="#6b9fd4" />
                <StatCard label="Total de Alertas" value={report.summary.totalAlerts} color="#e05a7a" />
                <StatCard label="Alertas Pendentes" value={report.summary.unacknowledgedAlerts} color="#C8102E" />
              </div>
            </section>

            {/* Gráficos */}
            <section className="report-section">
              <h2 className="report-section-title">Distribuição por Categoria</h2>
              <div className="charts-grid">
                <BarChart
                  title="Equipamentos por Categoria"
                  data={report.equipmentByCategory.map(r => ({
                    label: CATEGORY_LABELS[r.category] ?? r.category,
                    count: r.count,
                  }))}
                />
                <BarChart
                  title="Equipamentos por Status"
                  data={report.equipmentByStatus.map(r => ({
                    label: STATUS_LABELS[r.status] ?? r.status,
                    count: r.count,
                  }))}
                  colorFn={(i) => {
                    const statuses = report.equipmentByStatus.map(r => r.status);
                    return STATUS_COLORS[statuses[i]] ?? "#4a7fb5";
                  }}
                />
                <BarChart
                  title="Manutenções por Tipo"
                  data={report.maintenanceByType.map(r => ({
                    label: MAINT_LABELS[r.type] ?? r.type,
                    count: r.count,
                  }))}
                />
              </div>
            </section>

            {/* Alertas Recentes */}
            {report.recentAlerts.length > 0 && (
              <section className="report-section">
                <h2 className="report-section-title">Alertas Recentes</h2>
                <div className="saas-table-wrapper">
                  <table className="saas-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Mensagem</th>
                        <th>Data</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recentAlerts.map((a) => (
                        <tr key={a.id}>
                          <td>
                            <span className={`badge badge-${a.alertType === "vencido" ? "danger" : "warning"}`}>
                              {a.alertType === "vencido" ? "Vencido" : a.alertType === "proximo_vencimento" ? "Próx. Venc." : "Sem Manutenção"}
                            </span>
                          </td>
                          <td>{a.message ?? "—"}</td>
                          <td>{a.sentAt ? new Date(a.sentAt).toLocaleDateString("pt-BR") : "—"}</td>
                          <td>
                            <span className={`badge ${a.acknowledged ? "badge-ok" : "badge-pending"}`}>
                              {a.acknowledged ? "Reconhecido" : "Pendente"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Equipamentos por Empresa */}
            {report.companiesWithEquipment.length > 0 && (
              <section className="report-section">
                <h2 className="report-section-title">Equipamentos por Empresa (ID)</h2>
                <div className="saas-table-wrapper">
                  <table className="saas-table">
                    <thead>
                      <tr>
                        <th>Empresa (ID)</th>
                        <th>Total</th>
                        <th>Em Dia</th>
                        <th>Vencendo</th>
                        <th>Vencidos</th>
                        <th>% Conformidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.companiesWithEquipment.map((c) => {
                        const ok = c.total - c.expired - c.expiring;
                        const pct = c.total > 0 ? Math.round((ok / c.total) * 100) : 100;
                        return (
                          <tr key={c.companyId}>
                            <td>Empresa #{c.companyId}</td>
                            <td>{c.total}</td>
                            <td><span className="badge badge-ok">{ok}</span></td>
                            <td><span className="badge badge-warning">{c.expiring}</span></td>
                            <td><span className="badge badge-danger">{c.expired}</span></td>
                            <td>
                              <div className="pct-bar-track">
                                <div
                                  className="pct-bar-fill"
                                  style={{ width: `${pct}%`, background: pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#C8102E" }}
                                />
                              </div>
                              <span className="pct-label">{pct}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <style>{`
        .report-section { margin-bottom: 2.5rem; }
        .report-section-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--navy);
          border-bottom: 2px solid var(--red-primary);
          padding-bottom: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .report-generated {
          font-size: 0.8rem;
          color: var(--gray-500);
          margin-bottom: 1rem;
        }
        .stats-grid-4 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }
        .stat-card {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: 6px;
          padding: 1rem 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .stat-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
        }
        .stat-label {
          font-size: 0.78rem;
          color: var(--gray-600);
          margin-top: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .chart-block {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: 6px;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .chart-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--navy);
          margin-bottom: 1rem;
        }
        .chart-bars { display: flex; flex-direction: column; gap: 0.6rem; }
        .chart-bar-row { display: flex; align-items: center; gap: 0.5rem; }
        .chart-bar-label { font-size: 0.78rem; color: var(--gray-600); width: 110px; flex-shrink: 0; }
        .chart-bar-track { flex: 1; background: var(--gray-100); border-radius: 3px; height: 16px; overflow: hidden; }
        .chart-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
        .chart-bar-count { font-size: 0.78rem; font-weight: 600; color: var(--navy); width: 28px; text-align: right; }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .badge-ok { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef9c3; color: #854d0e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .pct-bar-track { display: inline-block; width: 80px; background: var(--gray-100); border-radius: 3px; height: 10px; overflow: hidden; vertical-align: middle; margin-right: 0.4rem; }
        .pct-bar-fill { height: 100%; border-radius: 3px; }
        .pct-label { font-size: 0.78rem; font-weight: 600; }
      `}</style>
    </SaasDashboardLayout>
  );
}

import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? undefined;

  const { data: stats } = trpc.saas.dashboard.stats.useQuery({ companyId });
  const { data: expiring } = trpc.saas.alerts.expiring.useQuery({ days: 30, companyId });
  const { data: expired } = trpc.saas.alerts.expired.useQuery({ companyId });
  const exportCsv = trpc.saas.equipment.exportCsv.useQuery({ companyId }, { enabled: false });

  const handleExport = async () => {
    const result = await exportCsv.refetch();
    if (result.data?.csv) downloadCsv(result.data.csv, `equipamentos_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const cards = [
    { label: "TOTAL", value: stats?.total ?? 0, color: "#111111" },
    { label: "EM DIA", value: stats?.ok ?? 0, color: "#16A34A" },
    { label: "PRÓX. VENCIMENTO", value: stats?.expiring ?? 0, color: "#D97706" },
    { label: "VENCIDOS", value: stats?.expired ?? 0, color: "#C8102E" },
  ];

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ width: 24, height: 3, background: "#C8102E", marginBottom: 10 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>DASHBOARD</h1>
            <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>Visão geral dos equipamentos e alertas</p>
          </div>
          <button onClick={handleExport} disabled={exportCsv.isFetching}
            style={{ padding: "9px 18px", background: "#111111", color: "#fff", border: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", cursor: "pointer" }}>
            {exportCsv.isFetching ? "EXPORTANDO..." : "⬇ EXPORTAR CSV"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
          {cards.map(c => (
            <div key={c.label} style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: `3px solid ${c.color}`, padding: "20px 24px" }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 36, color: c.color, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#8A8A8A", marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {stats?.byCategory && stats.byCategory.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", color: "#111111", marginBottom: 12 }}>POR CATEGORIA</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {stats.byCategory.map((c: { category: string; count: number }) => (
                <div key={c.category} style={{ background: "#fff", border: "1px solid #D8D8D8", padding: "12px 16px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 22, color: "#111111" }}>{c.count}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#8A8A8A", textTransform: "uppercase" }}>{c.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: "3px solid #D97706" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #F2F2F2" }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: "#D97706" }}>⚠ PRÓXIMOS DO VENCIMENTO (30 dias)</span>
            </div>
            <div style={{ maxHeight: 260, overflowY: "auto" }}>
              {!expiring?.length ? <div style={{ padding: "16px 18px", color: "#8A8A8A", fontSize: 13 }}>Nenhum.</div>
                : expiring.map((eq: { id: number; code: string; installationLocation?: string | null; nextMaintenanceDate?: Date | null }) => (
                  <div key={eq.id} style={{ padding: "9px 18px", borderBottom: "1px solid #F2F2F2", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{eq.code}</div>
                      <div style={{ fontSize: 11, color: "#8A8A8A" }}>{eq.installationLocation ?? "—"}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#D97706", fontWeight: 600 }}>{eq.nextMaintenanceDate ? String(eq.nextMaintenanceDate).split("T")[0] : "—"}</div>
                  </div>
                ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: "3px solid #C8102E" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #F2F2F2" }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: "#C8102E" }}>✕ VENCIDOS</span>
            </div>
            <div style={{ maxHeight: 260, overflowY: "auto" }}>
              {!expired?.length ? <div style={{ padding: "16px 18px", color: "#8A8A8A", fontSize: 13 }}>Nenhum.</div>
                : expired.map((eq: { id: number; code: string; installationLocation?: string | null; nextMaintenanceDate?: Date | null }) => (
                  <div key={eq.id} style={{ padding: "9px 18px", borderBottom: "1px solid #F2F2F2", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{eq.code}</div>
                      <div style={{ fontSize: 11, color: "#8A8A8A" }}>{eq.installationLocation ?? "—"}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#C8102E", fontWeight: 600 }}>{eq.nextMaintenanceDate ? String(eq.nextMaintenanceDate).split("T")[0] : "—"}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </SaasDashboardLayout>
  );
}

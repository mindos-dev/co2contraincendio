import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";

const STATUS_COLORS: Record<string, string> = { ok: "#16A34A", near_expiration: "#D97706", expired: "#C8102E" };
const STATUS_LABELS: Record<string, string> = { ok: "EM DIA", near_expiration: "PRÓX. VENCIMENTO", expired: "VENCIDO" };
type AlertItem = { id: number; code: string; category: string | null; installationLocation: string | null; nextMaintenanceDate: Date | null; status: string | null };

export default function Alertas() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? undefined;
  const { data, isLoading } = trpc.saas.equipment.list.useQuery({ companyId, limit: 500 });
  const all: AlertItem[] = (data?.items ?? []) as AlertItem[];
  const expired = all.filter(e => e.status === "vencido" || e.status === "expired");
  const near = all.filter(e => e.status === "proximo_vencimento" || e.status === "near_expiration");
  const ok = all.filter(e => !["vencido","expired","proximo_vencimento","near_expiration"].includes(e.status ?? ""));

  const renderTable = (items: AlertItem[], statusKey: string) => (
    <div style={{ background: "#fff", border: "1px solid #D8D8D8", marginBottom: 24 }}>
      <div style={{ background: STATUS_COLORS[statusKey], padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", color: "#fff" }}>{STATUS_LABELS[statusKey]}</span>
        <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{items.length}</span>
      </div>
      {!items.length ? (
        <div style={{ padding: "20px 16px", color: "#8A8A8A", fontSize: 13 }}>Nenhum equipamento nesta categoria.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8F8F8", borderBottom: "1px solid #E8E8E8" }}>
              {["CÓDIGO", "CATEGORIA", "LOCALIZAÇÃO", "PRÓXIMA MANUTENÇÃO"].map(h => (
                <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", color: "#4A4A4A" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((eq, i: number) => (
              <tr key={eq.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F2F2F2" }}>
                <td style={{ padding: "9px 14px", fontWeight: 600, fontSize: 13, color: "#111111" }}>{eq.code}</td>
                <td style={{ padding: "9px 14px", fontSize: 12, color: "#4A4A4A" }}>{eq.category ?? "—"}</td>
                <td style={{ padding: "9px 14px", fontSize: 12, color: "#4A4A4A" }}>{eq.installationLocation ?? "—"}</td>
                <td style={{ padding: "9px 14px", fontSize: 12, color: STATUS_COLORS[statusKey], fontWeight: 600 }}>{eq.nextMaintenanceDate ? String(eq.nextMaintenanceDate).split("T")[0] : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ width: 24, height: 3, background: "#C8102E", marginBottom: 10 }} />
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>ALERTAS DE VENCIMENTO</h1>
          <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>Monitoramento de status dos equipamentos por data de manutenção</p>
        </div>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#8A8A8A" }}>Carregando...</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
              {[{ key: "expired", count: expired.length, label: "VENCIDOS" }, { key: "near_expiration", count: near.length, label: "PRÓX. VENCIMENTO" }, { key: "ok", count: ok.length, label: "EM DIA" }].map(s => (
                <div key={s.key} style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: `3px solid ${STATUS_COLORS[s.key]}`, padding: "16px 20px" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Barlow Condensed',sans-serif", color: STATUS_COLORS[s.key] }}>{s.count}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#4A4A4A", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {renderTable(expired, "expired")}
            {renderTable(near, "near_expiration")}
            {renderTable(ok, "ok")}
          </>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

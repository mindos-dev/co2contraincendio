import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";

type Equip = { id: number; code: string; category: string | null; installationLocation: string | null; status: string | null };

export default function QRCodes() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? undefined;
  const [search, setSearch] = useState("");
  const { data, isLoading } = trpc.saas.equipment.list.useQuery({ companyId, limit: 200 });
  const items: Equip[] = (data?.items ?? []) as Equip[];
  const filtered = search ? items.filter(e => e.code.toLowerCase().includes(search.toLowerCase()) || (e.installationLocation ?? "").toLowerCase().includes(search.toLowerCase())) : items;
  const baseUrl = window.location.origin;

  const printAll = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>QR Codes</title><style>body{font-family:sans-serif;}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:16px;}.card{border:1px solid #ddd;padding:12px;text-align:center;page-break-inside:avoid;}.code{font-weight:700;font-size:13px;margin-top:8px;}.loc{font-size:11px;color:#666;}</style></head><body><h2 style="text-align:center;">QR Codes — CO2 Contra Incêndio</h2><div class="grid">${filtered.map(e => `<div class="card"><div style="font-size:9px;color:#888;word-break:break-all;">${baseUrl}/extintor/${e.code}</div><div class="code">${e.code}</div><div class="loc">${e.installationLocation ?? ""}</div></div>`).join("")}</div></body></html>`);
    win.document.close(); win.print();
  };

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ width: 24, height: 3, background: "#C8102E", marginBottom: 10 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>QR CODES</h1>
            <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>Geração e impressão de QR Codes por equipamento</p>
          </div>
          <button onClick={printAll} style={{ padding: "9px 18px", background: "#111111", color: "#fff", border: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", cursor: "pointer" }}>
            🖨 IMPRIMIR TODOS
          </button>
        </div>

        <div style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: "3px solid #111111", padding: "14px 16px", marginBottom: 20 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código ou localização..." style={{ padding: "8px 12px", border: "1px solid #D8D8D8", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" }} />
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#8A8A8A" }}>Carregando...</div>
        ) : !filtered.length ? (
          <div style={{ textAlign: "center", padding: 40, color: "#8A8A8A" }}>Nenhum equipamento encontrado.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {filtered.map(eq => (
              <div key={eq.id} style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: "3px solid #C8102E", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 120, height: 120, background: "#F8F8F8", border: "1px solid #E8E8E8", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, padding: 8 }}>
                  <div style={{ fontSize: 40, lineHeight: 1 }}>▦</div>
                  <div style={{ fontSize: 8, color: "#8A8A8A", textAlign: "center", wordBreak: "break-all" }}>{baseUrl}/extintor/{eq.code}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "0.06em", color: "#111111" }}>{eq.code}</div>
                  <div style={{ fontSize: 11, color: "#8A8A8A", marginTop: 2 }}>{eq.category ?? "—"}</div>
                  {eq.installationLocation && <div style={{ fontSize: 11, color: "#4A4A4A", marginTop: 2 }}>{eq.installationLocation}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, width: "100%" }}>
                  <a href={`/extintor/${eq.code}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "7px 0", background: "transparent", border: "1px solid #D8D8D8", color: "#4A4A4A", fontSize: 11, fontWeight: 600, textAlign: "center", textDecoration: "none", letterSpacing: "0.04em" }}>VER</a>
                  <a href={`/extintor/${eq.code}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "7px 0", background: "#C8102E", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, textAlign: "center", textDecoration: "none", letterSpacing: "0.04em" }}>ABRIR</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

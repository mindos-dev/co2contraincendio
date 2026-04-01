import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Download, Printer, RefreshCw, QrCode, AlertCircle, CheckCircle } from "lucide-react";

type Equip = { id: number; code: string; category: string | null; installationLocation: string | null; status: string | null; qrCodeUrl?: string | null };

export default function QRCodes() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? undefined;
  const [search, setSearch] = useState("");
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [generatedIds, setGeneratedIds] = useState<Set<number>>(new Set());
  const [errorId, setErrorId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.saas.equipment.list.useQuery({ companyId, limit: 200 });
  const items: Equip[] = (data?.items ?? []) as Equip[];

  const generateQr = trpc.saas.equipment.generateQr.useMutation({
    onSuccess: () => utils.saas.equipment.list.invalidate(),
  });
  const generateBatch = trpc.saas.equipment.generateQrBatch.useMutation({
    onSuccess: () => utils.saas.equipment.list.invalidate(),
  });

  const filtered = search
    ? items.filter(e => e.code.toLowerCase().includes(search.toLowerCase()) || (e.installationLocation ?? "").toLowerCase().includes(search.toLowerCase()))
    : items;

  const withQr = filtered.filter(e => e.qrCodeUrl);
  const withoutQr = filtered.filter(e => !e.qrCodeUrl);
  const baseUrl = window.location.origin;

  const handleGenerateSingle = async (eq: Equip) => {
    setGeneratingId(eq.id);
    setErrorId(null);
    try {
      await generateQr.mutateAsync({ id: eq.id, baseUrl });
      setGeneratedIds(prev => new Set(prev).add(eq.id));
    } catch {
      setErrorId(eq.id);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateAll = async () => {
    if (!companyId) return;
    try { await generateBatch.mutateAsync({ companyId, baseUrl }); } catch (err) { console.error(err); }
  };

  const printAll = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const cards = withQr.map(e => `<div class="card"><img src="${e.qrCodeUrl}" alt="QR ${e.code}" style="width:120px;height:120px;" /><div class="code">${e.code}</div><div class="loc">${e.category ?? ""}</div><div class="loc">${e.installationLocation ?? ""}</div><div style="font-size:8px;color:#888;word-break:break-all;margin-top:4px;">${baseUrl}/extintor/${e.code}</div></div>`).join("");
    win.document.write(`<html><head><title>QR Codes</title><style>body{font-family:sans-serif;margin:0;padding:16px;}h2{text-align:center;font-size:16px;margin-bottom:16px;}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}.card{border:1px solid #ddd;padding:12px;text-align:center;page-break-inside:avoid;border-top:3px solid #C8102E;}.code{font-weight:700;font-size:13px;margin-top:6px;}.loc{font-size:10px;color:#666;}</style></head><body><h2>QR Codes — CO₂ Contra Incêndio</h2><div class="grid">${cards}</div></body></html>`);
    win.document.close(); win.print();
  };

  const downloadQr = (eq: Equip) => {
    if (!eq.qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = eq.qrCodeUrl;
    a.download = `qr-${eq.code}.png`;
    a.target = "_blank";
    a.click();
  };

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ width: 24, height: 3, background: "#C8102E", marginBottom: 10 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>QR CODES</h1>
            <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>{withQr.length} gerados · {withoutQr.length} pendentes</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {withoutQr.length > 0 && (
              <button onClick={handleGenerateAll} disabled={generateBatch.isPending} style={{ padding: "9px 16px", background: "#1A3A5C", color: "#fff", border: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: generateBatch.isPending ? 0.7 : 1 }}>
                <RefreshCw size={13} />{generateBatch.isPending ? "GERANDO..." : `GERAR ${withoutQr.length} PENDENTES`}
              </button>
            )}
            {withQr.length > 0 && (
              <button onClick={printAll} style={{ padding: "9px 16px", background: "#111111", color: "#fff", border: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Printer size={13} /> IMPRIMIR TODOS
              </button>
            )}
          </div>
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
            {filtered.map(eq => {
              const isGenerating = generatingId === eq.id;
              const isGenerated = generatedIds.has(eq.id);
              const hasError = errorId === eq.id;
              const hasQr = !!eq.qrCodeUrl;
              return (
                <div key={eq.id} style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: `3px solid ${hasQr ? "#C8102E" : "#D8D8D8"}`, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 140, height: 140, background: "#F8F8F8", border: "1px solid #E8E8E8", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                    {hasQr ? (
                      <img src={eq.qrCodeUrl!} alt={`QR ${eq.code}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#C0C0C0" }}>
                        <QrCode size={48} strokeWidth={1} />
                        <span style={{ fontSize: 10, color: "#B0B0B0" }}>Não gerado</span>
                      </div>
                    )}
                    {isGenerated && !isGenerating && <div style={{ position: "absolute", top: 4, right: 4 }}><CheckCircle size={16} color="#22C55E" /></div>}
                  </div>
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "0.06em", color: "#111111" }}>{eq.code}</div>
                    <div style={{ fontSize: 11, color: "#8A8A8A", marginTop: 2 }}>{eq.category ?? "—"}</div>
                    {eq.installationLocation && <div style={{ fontSize: 11, color: "#4A4A4A", marginTop: 2 }}>{eq.installationLocation}</div>}
                  </div>
                  {hasError && <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#B91C1C", fontSize: 11 }}><AlertCircle size={12} /><span>Falha ao gerar</span></div>}
                  <div style={{ display: "flex", gap: 6, width: "100%" }}>
                    {!hasQr ? (
                      <button onClick={() => handleGenerateSingle(eq)} disabled={isGenerating} style={{ flex: 1, padding: "8px 0", background: "#C8102E", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em", opacity: isGenerating ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        {isGenerating ? <><RefreshCw size={11} style={{ animation: "spin 1s linear infinite" }} /> GERANDO...</> : <><QrCode size={11} /> GERAR QR</>}
                      </button>
                    ) : (
                      <>
                        <button onClick={() => downloadQr(eq)} style={{ flex: 1, padding: "7px 0", background: "transparent", border: "1px solid #D8D8D8", color: "#4A4A4A", fontSize: 11, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <Download size={11} /> BAIXAR
                        </button>
                        <a href={`/extintor/${eq.code}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "7px 0", background: "#C8102E", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, textAlign: "center", textDecoration: "none", letterSpacing: "0.04em", display: "flex", alignItems: "center", justifyContent: "center" }}>VER</a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </SaasDashboardLayout>
  );
}

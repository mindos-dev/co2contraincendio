import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";

const CATEGORIES = ["extintor", "hidrante", "sprinkler", "detector", "sinalizacao", "complementar"] as const;
const CATEGORY_LABELS: Record<string, string> = { extintor: "Extintor", hidrante: "Hidrante", sprinkler: "Sprinkler", detector: "Detector", sinalizacao: "Sinalização", complementar: "Complementar" };
type CategoryType = typeof CATEGORIES[number];
const STATUS_LABELS: Record<string, string> = { ok: "Em dia", near_expiration: "Próx. vencimento", expired: "Vencido" };
const STATUS_COLORS: Record<string, string> = { ok: "#16A34A", near_expiration: "#D97706", expired: "#C8102E" };
const inputStyle: React.CSSProperties = { padding: "8px 10px", border: "1px solid #D8D8D8", background: "#fff", fontSize: 13, color: "#111111", outline: "none", width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#4A4A4A", marginBottom: 4 };

export default function Equipamentos() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? undefined;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: "", category: "extintor" as CategoryType, description: "", installationLocation: "", serialNumber: "", manufacturer: "", capacity: "", agentType: "", nextMaintenanceDate: "" });
  const [formError, setFormError] = useState("");

  const { data, isLoading, refetch } = trpc.saas.equipment.list.useQuery({ companyId, search: search || undefined, category: category || undefined, status: status || undefined, page, limit: PAGE_SIZE });
  const createMutation = trpc.saas.equipment.create.useMutation({
    onSuccess: () => { setShowModal(false); setForm({ code: "", category: "extintor" as CategoryType, description: "", installationLocation: "", serialNumber: "", manufacturer: "", capacity: "", agentType: "", nextMaintenanceDate: "" }); void refetch(); },
    onError: (e: { message: string }) => setFormError(e.message),
  });

  const clearFilters = () => { setSearch(""); setCategory(""); setStatus(""); setLocation(""); setPage(1); };
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1200 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ width: 24, height: 3, background: "#C8102E", marginBottom: 10 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>EQUIPAMENTOS</h1>
            <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>Cadastro e controle de equipamentos contra incêndio</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ padding: "9px 18px", background: "#C8102E", color: "#fff", border: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", cursor: "pointer" }}>
            + NOVO EQUIPAMENTO
          </button>
        </div>

        {/* Search + Filters */}
        <div style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: "3px solid #111111", padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: "#111111", marginBottom: 12 }}>🔍 FILTROS DE BUSCA</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={labelStyle}>BUSCA RÁPIDA</label>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Código, localização, fabricante, nº série..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CATEGORIA</label>
              <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={inputStyle}>
                <option value="">Todas</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>STATUS</label>
              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={inputStyle}>
                <option value="">Todos</option>
                <option value="ok">Em dia</option>
                <option value="near_expiration">Próx. vencimento</option>
                <option value="expired">Vencido</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>LOCALIZAÇÃO</label>
              <input value={location} onChange={e => { setLocation(e.target.value); setPage(1); }} placeholder="Andar, setor..." style={inputStyle} />
            </div>
            <button onClick={clearFilters} style={{ padding: "8px 14px", background: "transparent", border: "1px solid #D8D8D8", color: "#4A4A4A", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap" }}>LIMPAR</button>
          </div>
          {(search || category || status || location) && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#8A8A8A" }}>
              {data?.total ?? 0} resultado(s)
              {search && <span style={{ marginLeft: 8, background: "#F2F2F2", padding: "2px 8px", fontSize: 11 }}>"{search}"</span>}
              {category && <span style={{ marginLeft: 6, background: "#F2F2F2", padding: "2px 8px", fontSize: 11 }}>{category}</span>}
              {status && <span style={{ marginLeft: 6, background: "#F2F2F2", padding: "2px 8px", fontSize: 11, color: STATUS_COLORS[status] }}>{STATUS_LABELS[status]}</span>}
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #D8D8D8" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#111111" }}>
                {["CÓDIGO", "CATEGORIA", "LOCALIZAÇÃO", "AGENTE / CAPACIDADE", "PRÓX. MANUTENÇÃO", "STATUS", ""].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#D8D8D8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>Carregando...</td></tr>
              ) : !data?.items?.length ? (
                <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>Nenhum equipamento encontrado.</td></tr>
              ) : (data as { items: Array<{ id: number; code: string; category: string | null; installationLocation: string | null; agentType: string | null; capacity: string | null; nextMaintenanceDate: Date | null; status: string | null }> }).items.map((eq, i: number) => (
                <tr key={eq.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8F8F8", borderBottom: "1px solid #F2F2F2" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, fontSize: 13, color: "#111111" }}>{eq.code}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "#4A4A4A" }}>{eq.category}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "#4A4A4A" }}>{eq.installationLocation ?? "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A4A4A" }}>{[eq.agentType, eq.capacity].filter(Boolean).join(" / ") || "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A4A4A" }}>{eq.nextMaintenanceDate ? String(eq.nextMaintenanceDate).split("T")[0] : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", background: `${STATUS_COLORS[eq.status ?? "ok"]}18`, color: STATUS_COLORS[eq.status ?? "ok"], border: `1px solid ${STATUS_COLORS[eq.status ?? "ok"]}40` }}>
                      {STATUS_LABELS[eq.status ?? "ok"] ?? eq.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                    <a href={`/app/equipamentos/${eq.id}`} style={{ fontSize: 11, color: "#0a1628", textDecoration: "none", fontWeight: 700, padding: "3px 10px", border: "1px solid #0a1628", letterSpacing: "0.04em" }}>DETALHES</a>
                    <a href={`/equipamento/${eq.code}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#C8102E", textDecoration: "none", fontWeight: 600 }}>QR ▦</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #D8D8D8", cursor: "pointer", fontSize: 12 }}>‹ ANT</button>
            <span style={{ fontSize: 12, color: "#4A4A4A" }}>Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #D8D8D8", cursor: "pointer", fontSize: 12 }}>PRÓX ›</button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div style={{ background: "#fff", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ background: "#111111", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.06em", color: "#fff" }}>NOVO EQUIPAMENTO</span>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>
              <form onSubmit={e => { e.preventDefault(); setFormError(""); createMutation.mutate({ ...form, companyId: companyId ?? 0, nextMaintenanceDate: form.nextMaintenanceDate || undefined }); }}
                style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={labelStyle}>CÓDIGO *</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required style={inputStyle} placeholder="EXT-001" /></div>
                  <div><label style={labelStyle}>CATEGORIA</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as CategoryType }))} style={inputStyle}>{CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}</select></div>
                  <div><label style={labelStyle}>AGENTE</label><input value={form.agentType} onChange={e => setForm(f => ({ ...f, agentType: e.target.value }))} style={inputStyle} placeholder="CO2, Pó ABC..." /></div>
                  <div><label style={labelStyle}>CAPACIDADE</label><input value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} style={inputStyle} placeholder="6kg, 4kg..." /></div>
                  <div><label style={labelStyle}>Nº SÉRIE</label><input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FABRICANTE</label><input value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} style={inputStyle} /></div>
                </div>
                <div><label style={labelStyle}>LOCALIZAÇÃO</label><input value={form.installationLocation} onChange={e => setForm(f => ({ ...f, installationLocation: e.target.value }))} style={inputStyle} placeholder="Andar, setor, sala..." /></div>
                <div><label style={labelStyle}>PRÓXIMA MANUTENÇÃO</label><input type="date" value={form.nextMaintenanceDate} onChange={e => setForm(f => ({ ...f, nextMaintenanceDate: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>DESCRIÇÃO</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
                {formError && <div style={{ background: "#FFF0F0", border: "1px solid #C8102E", padding: "9px 11px", color: "#C8102E", fontSize: 12 }}>{formError}</div>}
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: "9px 18px", background: "transparent", border: "1px solid #D8D8D8", color: "#4A4A4A", fontSize: 12, cursor: "pointer" }}>CANCELAR</button>
                  <button type="submit" disabled={createMutation.isPending} style={{ padding: "9px 18px", background: "#C8102E", color: "#fff", border: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", cursor: "pointer" }}>
                    {createMutation.isPending ? "SALVANDO..." : "SALVAR"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

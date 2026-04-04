import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";

const SERVICE_LABELS: Record<string, string> = { recarga: "Recarga", inspecao: "Inspeção", substituicao: "Substituição", instalacao: "Instalação", teste: "Teste", outro: "Outro" };
const SERVICE_COLORS: Record<string, string> = { recarga: "#2563EB", inspecao: "#16A34A", substituicao: "#7C3AED", instalacao: "#0891B2", teste: "#D97706", outro: "#8A8A8A" };
const inputStyle: React.CSSProperties = { padding: "8px 10px", border: "1px solid #D8D8D8", background: "#fff", fontSize: 13, color: "#111111", outline: "none", width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#4A4A4A", marginBottom: 4 };
type Maint = { id: number; serviceDate: Date | null; serviceType: string | null; description: string | null; technicianName: string | null; nextMaintenanceDate: Date | null; equipment?: { code: string } | null; equipmentId?: number };

export default function Manutencoes() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? undefined;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ equipmentId: "", serviceType: "inspecao" as "recarga" | "inspecao" | "substituicao" | "instalacao" | "outro" | "teste", serviceDate: "", description: "", technicianName: "", nextMaintenanceDate: "" });
  const [formError, setFormError] = useState("");
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [allItems, setAllItems] = useState<Maint[]>([]);

  const { data: pageData, isLoading, refetch } = trpc.saas.maintenance.listAll.useQuery(
    { companyId, cursor, limit: 50 }
  );

  useEffect(() => {
    if (!pageData) return;
    const newItems = ((pageData.items ?? []) as Array<{ mr?: Maint; equip?: { code: string } } | Maint>).map((row) => {
      if ('mr' in row && row.mr) return { ...row.mr, equipment: row.equip ?? null } as Maint;
      return row as Maint;
    });
    if (!cursor) setAllItems(newItems);
    else setAllItems(prev => [...prev, ...newItems]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageData]);

  const maintenances = allItems;
  const nextCursor = pageData?.nextCursor ?? null;
  const { data: equipList } = trpc.saas.equipment.list.useQuery({ companyId, limit: 200 });
  const createMutation = trpc.saas.maintenance.create.useMutation({
    onSuccess: () => { setShowModal(false); setForm({ equipmentId: "", serviceType: "inspecao", serviceDate: "", description: "", technicianName: "", nextMaintenanceDate: "" }); void refetch(); },
    onError: (e: { message: string }) => setFormError(e.message),
  });
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const triggerAlertMutation = trpc.saas.maintenance.triggerAlert.useMutation({
    onSuccess: (data) => { setAlertSuccess(`Alerta criado para ${data.equipmentCode}`); setTimeout(() => setAlertSuccess(null), 4000); },
  });

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ width: 24, height: 3, background: "#C8102E", marginBottom: 10 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>MANUTENÇÕES</h1>
            <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>Registro de serviços realizados nos equipamentos</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ padding: "9px 18px", background: "#C8102E", color: "#fff", border: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", cursor: "pointer" }}>
            + REGISTRAR MANUTENÇÃO
          </button>
        </div>

        {alertSuccess && (
          <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", padding: "10px 16px", marginBottom: 12, fontSize: 13, color: "#92400E", display: "flex", alignItems: "center", gap: 8 }}>
            ⚠️ {alertSuccess}
          </div>
        )}
        <div style={{ background: "#fff", border: "1px solid #D8D8D8" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#111111" }}>
                {["EQUIPAMENTO", "TIPO DE SERVIÇO", "DATA", "TÉCNICO", "PRÓX. MANUTENÇÃO", "DESCRIÇÃO", "ALERTA"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#D8D8D8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>Carregando...</td></tr>
              ) : !maintenances.length ? (
                <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>Nenhuma manutenção registrada.</td></tr>
              ) : maintenances.map((m, i: number) => (
                <tr key={m.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8F8F8", borderBottom: "1px solid #F2F2F2" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, fontSize: 13, color: "#111111" }}>{m.equipment?.code ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", background: `${SERVICE_COLORS[m.serviceType ?? "inspecao"]}18`, color: SERVICE_COLORS[m.serviceType ?? "inspecao"], border: `1px solid ${SERVICE_COLORS[m.serviceType ?? "inspecao"]}40` }}>
                      {SERVICE_LABELS[m.serviceType ?? ""] ?? m.serviceType}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A4A4A" }}>{m.serviceDate ? String(m.serviceDate).split("T")[0] : "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A4A4A" }}>{m.technicianName ?? "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A4A4A" }}>{m.nextMaintenanceDate ? String(m.nextMaintenanceDate).split("T")[0] : "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A4A4A", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.description ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <button
                      onClick={() => triggerAlertMutation.mutate({ equipmentId: m.equipment ? (m as Maint & { equipmentId?: number }).equipmentId ?? 0 : 0, alertType: "sem_manutencao", message: `Alerta manual: ${m.equipment?.code ?? "equipamento"} — ${SERVICE_LABELS[m.serviceType ?? ""] ?? m.serviceType}` })}
                      disabled={triggerAlertMutation.isPending}
                      style={{ padding: "4px 10px", background: "transparent", border: "1px solid #D97706", color: "#D97706", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      ⚠ ALERTAR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {nextCursor && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              onClick={() => setCursor(nextCursor)}
              disabled={isLoading}
              style={{ padding: "9px 24px", background: "transparent", border: "1px solid #D8D8D8", color: "#4A4A4A", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em" }}
            >
              {isLoading ? "CARREGANDO..." : "CARREGAR MAIS"}
            </button>
          </div>
        )}

        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div style={{ background: "#fff", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ background: "#111111", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.06em", color: "#fff" }}>REGISTRAR MANUTENÇÃO</span>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>
              <form onSubmit={e => { e.preventDefault(); setFormError(""); createMutation.mutate({ equipmentId: Number(form.equipmentId), serviceType: form.serviceType, serviceDate: form.serviceDate, description: form.description || undefined, technicianName: form.technicianName || undefined, nextMaintenanceDate: form.nextMaintenanceDate || undefined }); }}
                style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>EQUIPAMENTO *</label>
                  <select value={form.equipmentId} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))} required style={inputStyle}>
                    <option value="">Selecione...</option>
                    {(equipList?.items ?? []).map((eq: { id: number; code: string }) => <option key={eq.id} value={eq.id}>{eq.code}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={labelStyle}>TIPO DE SERVIÇO *</label><select value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value as "recarga" | "inspecao" | "substituicao" | "instalacao" | "outro" | "teste" }))} style={inputStyle}>{Object.entries(SERVICE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                  <div><label style={labelStyle}>DATA DO SERVIÇO *</label><input type="date" value={form.serviceDate} onChange={e => setForm(f => ({ ...f, serviceDate: e.target.value }))} required style={inputStyle} /></div>
                  <div><label style={labelStyle}>TÉCNICO</label><input value={form.technicianName} onChange={e => setForm(f => ({ ...f, technicianName: e.target.value }))} style={inputStyle} placeholder="Nome do técnico" /></div>
                  <div><label style={labelStyle}>PRÓXIMA MANUTENÇÃO</label><input type="date" value={form.nextMaintenanceDate} onChange={e => setForm(f => ({ ...f, nextMaintenanceDate: e.target.value }))} style={inputStyle} /></div>
                </div>
                <div><label style={labelStyle}>DESCRIÇÃO</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Descreva o serviço realizado..." /></div>
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

import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  ok: { label: "EM DIA", color: "#16A34A", bg: "#F0FDF4" },
  proximo_vencimento: { label: "PRÓXIMO DO VENCIMENTO", color: "#D97706", bg: "#FFFBEB" },
  near_expiration: { label: "PRÓXIMO DO VENCIMENTO", color: "#D97706", bg: "#FFFBEB" },
  vencido: { label: "VENCIDO", color: "#C8102E", bg: "#FFF5F5" },
  expired: { label: "VENCIDO", color: "#C8102E", bg: "#FFF5F5" },
};

const CATEGORY_LABELS: Record<string, string> = {
  extintor_co2: "Extintor CO₂",
  extintor_po: "Extintor Pó Químico",
  extintor_agua: "Extintor Água",
  extintor_espuma: "Extintor Espuma",
  sistema_co2: "Sistema CO₂",
  sistema_saponificante: "Sistema Saponificante",
};

export default function ExtintorPublico() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const { data: eq, isLoading, error } = trpc.saas.equipment.getByCode.useQuery({ code }, { enabled: !!code });
  const statusInfo = STATUS_MAP[(eq?.status ?? "ok").toLowerCase()] ?? STATUS_MAP.ok;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5", fontFamily: "'Inter', sans-serif" }}>
      <header style={{ background: "#111111", borderBottom: "3px solid #C8102E" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>CO₂</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "0.06em", color: "#FFFFFF" }}>CO2 CONTRA INCÊNDIO</div>
              <div style={{ fontSize: 10, color: "#8A8A8A", letterSpacing: "0.04em" }}>SISTEMAS DE PROTEÇÃO CONTRA INCÊNDIO</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: "#8A8A8A", textAlign: "right" }}>
            <div>CNPJ: 29.905.123/0001-53</div>
            <div>Eng. Judson Aleixo Sampaio</div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px" }}>
        {isLoading && (
          <div style={{ background: "#fff", border: "1px solid #D8D8D8", padding: "40px", textAlign: "center" }}>
            <div style={{ color: "#8A8A8A", fontSize: 14 }}>Carregando dados do equipamento...</div>
          </div>
        )}

        {error && (
          <div style={{ background: "#fff", border: "1px solid #C8102E", borderTop: "3px solid #C8102E", padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, color: "#C8102E", letterSpacing: "0.04em" }}>EQUIPAMENTO NÃO ENCONTRADO</div>
            <div style={{ fontSize: 13, color: "#8A8A8A", marginTop: 8 }}>Código: <strong>{code}</strong></div>
          </div>
        )}

        {eq && (
          <>
            <div style={{ background: statusInfo.bg, border: `2px solid ${statusInfo.color}`, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: statusInfo.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "0.06em", color: statusInfo.color }}>{statusInfo.label}</div>
                <div style={{ fontSize: 11, color: "#4A4A4A", marginTop: 2 }}>
                  {eq.nextMaintenanceDate ? `Próxima manutenção: ${String(eq.nextMaintenanceDate).split("T")[0]}` : "Data de manutenção não informada"}
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: "3px solid #111111", marginBottom: 16 }}>
              <div style={{ background: "#111111", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "0.06em", color: "#FFFFFF" }}>{eq.code}</div>
                  <div style={{ fontSize: 11, color: "#8A8A8A", marginTop: 2 }}>{CATEGORY_LABELS[eq.category ?? ""] ?? eq.category ?? "Equipamento"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#8A8A8A" }}>NÚMERO DE SÉRIE</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#D8D8D8" }}>{eq.serialNumber ?? "—"}</div>
                </div>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "LOCALIZAÇÃO", value: eq.installationLocation ?? "—" },
                    { label: "FABRICANTE", value: eq.manufacturer ?? "—" },
                    { label: "MODELO", value: eq.model ?? "—" },
                    { label: "CAPACIDADE", value: eq.capacity ?? "—" },
                    { label: "AGENTE EXTINTOR", value: eq.agentType ?? "—" },
                    { label: "PRESSÃO", value: eq.pressure ?? "—" },
                  ].map(f => (
                    <div key={f.label} style={{ borderBottom: "1px solid #F2F2F2", paddingBottom: 10 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#8A8A8A", marginBottom: 3 }}>{f.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111111" }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>



            <div style={{ background: "#fff", border: "1px solid #D8D8D8", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#8A8A8A" }}>
                <div style={{ fontWeight: 600, color: "#4A4A4A" }}>Eng. Judson Aleixo Sampaio</div>
                <div>CREA: 385625 | RNP: 1422036715</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 11, color: "#8A8A8A" }}>
                <div>Verificado em {new Date().toLocaleDateString("pt-BR")}</div>
                <div style={{ color: "#C8102E", fontWeight: 600 }}>co2contraincendio.com.br</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle, AlertTriangle, XCircle, Clock,
  Flame, Droplets, Wind, Bell, Zap, Shield,
  MapPin, Calendar, Wrench, Phone, Mail, ExternalLink
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  extintor: "Extintor",
  hidrante: "Hidrante",
  sprinkler: "Sprinkler",
  detector: "Detector de Fumaça/Gás",
  sinalizacao: "Sinalização",
  complementar: "Complementar",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  extintor: Flame,
  hidrante: Droplets,
  sprinkler: Wind,
  detector: Bell,
  sinalizacao: Zap,
  complementar: Shield,
};

const SERVICE_LABELS: Record<string, string> = {
  recarga: "Recarga",
  inspecao: "Inspeção",
  substituicao: "Substituição",
  instalacao: "Instalação",
  teste: "Teste",
  outro: "Outro",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  ok: { label: "Em Dia", color: "#059669", bg: "#D1FAE5", border: "#6EE7B7", Icon: CheckCircle },
  proximo_vencimento: { label: "Próximo ao Vencimento", color: "#D97706", bg: "#FEF3C7", border: "#FCD34D", Icon: AlertTriangle },
  vencido: { label: "Vencido — Requer Manutenção Imediata", color: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5", Icon: XCircle },
  inativo: { label: "Inativo", color: "#6B7280", bg: "#F3F4F6", border: "#D1D5DB", Icon: Clock },
};

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EquipamentoPublico() {
  const [, params] = useRoute("/equipamento/:code");
  const code = params?.code ?? "";

  const { data: equipment, isLoading } = trpc.saas.equipment.getByCode.useQuery(
    { code },
    { enabled: !!code }
  );

  const { data: maintenance } = trpc.saas.maintenance.listByEquipment.useQuery(
    { equipmentId: (equipment as { id?: number })?.id ?? 0 },
    { enabled: !!(equipment as { id?: number })?.id }
  );

  const status = STATUS_CONFIG[(equipment as { status?: string })?.status ?? "ok"] ?? STATUS_CONFIG.ok;
  const StatusIcon = status.Icon;
  const CategoryIcon = CATEGORY_ICONS[(equipment as { category?: string })?.category ?? "extintor"] ?? Flame;

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", fontFamily: "'Barlow Condensed', Arial, sans-serif" }}>

      {/* ── Header institucional ── */}
      <header style={{ background: "#0a1628", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff" }}>CO2</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "0.04em" }}>CO2 CONTRA INCÊNDIO</div>
            <div style={{ fontSize: 10, color: "#9CA3AF", letterSpacing: "0.06em" }}>OPERIS IA · RASTREAMENTO DE EQUIPAMENTOS</div>
          </div>
        </div>
        <a href="tel:+5511997383115" style={{ display: "flex", alignItems: "center", gap: 6, color: "#C8102E", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
          <Phone size={14} /> (11) 9 9738-3115
        </a>
      </header>

      {/* ── Conteúdo ── */}
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 48px" }}>

        {isLoading && (
          <div style={{ background: "#fff", padding: 48, textAlign: "center", color: "#9CA3AF", fontSize: 14, border: "1px solid #E5E7EB" }}>
            Carregando dados do equipamento...
          </div>
        )}

        {!isLoading && !equipment && (
          <div style={{ background: "#fff", padding: 48, textAlign: "center", border: "1px solid #E5E7EB" }}>
            <XCircle size={40} color="#DC2626" style={{ display: "block", margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 700, color: "#DC2626", fontSize: 16 }}>Equipamento não encontrado</p>
            <p style={{ color: "#6B7280", fontSize: 13 }}>O código <strong>{code}</strong> não está cadastrado no sistema.</p>
            <a href="https://co2contra.com/contato" style={{ display: "inline-block", marginTop: 16, padding: "10px 24px", background: "#C8102E", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
              Entrar em Contato
            </a>
          </div>
        )}

        {!isLoading && equipment && (
          <>
            {/* Status banner */}
            <div style={{ background: status.bg, border: `1px solid ${status.border}`, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <StatusIcon size={22} color={status.color} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: status.color, letterSpacing: "0.04em" }}>{status.label}</div>
                <div style={{ fontSize: 12, color: status.color, opacity: 0.8 }}>
                  {(equipment as { status?: string }).status === "ok"
                    ? "Este equipamento está em conformidade com as normas vigentes."
                    : (equipment as { status?: string }).status === "vencido"
                    ? "Contate imediatamente a CO2 Contra Incêndio para manutenção corretiva."
                    : "Agende a manutenção preventiva com a CO2 Contra Incêndio."}
                </div>
              </div>
            </div>

            {/* Card principal */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderTop: "4px solid #0a1628", marginBottom: 16 }}>
              <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CategoryIcon size={22} color="#C8102E" />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 22, color: "#0a1628", letterSpacing: "0.06em" }}>
                    {(equipment as { code?: string }).code}
                  </div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>
                    {CATEGORY_LABELS[(equipment as { category?: string }).category ?? ""] ?? (equipment as { category?: string }).category}
                    {(equipment as { subType?: string }).subType ? ` · ${(equipment as { subType?: string }).subType}` : ""}
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
                {[
                  { label: "Fabricante", value: (equipment as { manufacturer?: string }).manufacturer },
                  { label: "Modelo", value: (equipment as { model?: string }).model },
                  { label: "Agente Extintor", value: (equipment as { agentType?: string }).agentType },
                  { label: "Capacidade", value: (equipment as { capacity?: string }).capacity },
                  { label: "Pressão", value: (equipment as { pressure?: string }).pressure },
                  { label: "Classe de Risco", value: (equipment as { riskClass?: string }).riskClass },
                  { label: "Nº de Série", value: (equipment as { serialNumber?: string }).serialNumber },
                ].filter(f => f.value).map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.06em" }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Localização */}
              {((equipment as { installationLocation?: string }).installationLocation || (equipment as { floor?: string }).floor || (equipment as { sector?: string }).sector) && (
                <div style={{ padding: "12px 20px", background: "#F9FAFB", borderTop: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={14} color="#C8102E" />
                  <span style={{ fontSize: 13, color: "#374151" }}>
                    {[(equipment as { installationLocation?: string }).installationLocation, (equipment as { floor?: string }).floor, (equipment as { sector?: string }).sector].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}
            </div>

            {/* Datas importantes */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", marginBottom: 16 }}>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #E5E7EB" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#0a1628", letterSpacing: "0.06em" }}>DATAS IMPORTANTES</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
                {[
                  { label: "Instalação", value: fmtDate((equipment as { installationDate?: Date | string }).installationDate), icon: Calendar },
                  { label: "Última Manutenção", value: fmtDate((equipment as { lastMaintenanceDate?: Date | string }).lastMaintenanceDate), icon: Wrench },
                  { label: "Próxima Manutenção", value: fmtDate((equipment as { nextMaintenanceDate?: Date | string }).nextMaintenanceDate), icon: AlertTriangle },
                ].map(({ label, value, icon: Icon }, i) => (
                  <div key={label} style={{ padding: "14px 16px", borderRight: i < 2 ? "1px solid #E5E7EB" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Icon size={12} color="#C8102E" />
                      <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.06em" }}>{label.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico de manutenções */}
            {(maintenance ?? []).length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderTop: "3px solid #C8102E", marginBottom: 16 }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #E5E7EB" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#0a1628", letterSpacing: "0.06em" }}>
                    HISTÓRICO DE MANUTENÇÕES ({(maintenance ?? []).length})
                  </span>
                </div>
                {(maintenance as Array<{
                  id: number;
                  serviceDate: Date | string;
                  serviceType: string;
                  description?: string | null;
                  technicianName?: string | null;
                  engineerName?: string | null;
                  nextMaintenanceDate?: Date | string | null;
                }>).slice(0, 5).map((m, idx) => (
                  <div key={m.id} style={{ padding: "14px 20px", borderBottom: idx < Math.min((maintenance ?? []).length, 5) - 1 ? "1px solid #F3F4F6" : "none", display: "flex", gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: "#F3F4F6", border: "2px solid #E5E7EB", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Wrench size={13} color="#C8102E" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#0a1628" }}>
                          {SERVICE_LABELS[m.serviceType] ?? m.serviceType}
                        </span>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                          <Calendar size={10} style={{ display: "inline", marginRight: 3 }} />
                          {fmtDate(m.serviceDate)}
                        </span>
                      </div>
                      {m.description && (
                        <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6B7280" }}>{m.description}</p>
                      )}
                      {(m.technicianName || m.engineerName) && (
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                          {m.technicianName && `Técnico: ${m.technicianName}`}
                          {m.technicianName && m.engineerName && " · "}
                          {m.engineerName && `Eng: ${m.engineerName}`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA contato */}
            <div style={{ background: "#0a1628", padding: "24px 20px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 6, letterSpacing: "0.04em" }}>
                PRECISA DE MANUTENÇÃO?
              </div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>
                Entre em contato com a CO2 Contra Incêndio para agendar a manutenção preventiva ou corretiva.
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <a
                  href="tel:+5511997383115"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#C8102E", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em" }}
                >
                  <Phone size={15} /> (11) 9 9738-3115
                </a>
                <a
                  href="mailto:co2contraincendio@gmail.com"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "transparent", border: "1px solid #4B5563", color: "#D1D5DB", textDecoration: "none", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em" }}
                >
                  <Mail size={15} /> E-mail
                </a>
                <a
                  href="https://co2contra.com"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "transparent", border: "1px solid #4B5563", color: "#D1D5DB", textDecoration: "none", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em" }}
                >
                  <ExternalLink size={15} /> Site
                </a>
              </div>
              <div style={{ marginTop: 20, fontSize: 10, color: "#4B5563", letterSpacing: "0.06em" }}>
                OPERIS IA · SISTEMA DE GESTÃO DE EQUIPAMENTOS CONTRA INCÊNDIO
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

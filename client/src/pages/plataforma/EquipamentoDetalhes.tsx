import { useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import {
  ArrowLeft, Printer, MapPin, Calendar, Wrench, FileText,
  CheckCircle, AlertTriangle, XCircle, Clock, Package,
  Flame, Droplets, Wind, Bell, Zap, Shield
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  ok: { label: "Em Dia", color: "#059669", bg: "#D1FAE5", Icon: CheckCircle },
  proximo_vencimento: { label: "Próx. Vencimento", color: "#D97706", bg: "#FEF3C7", Icon: AlertTriangle },
  vencido: { label: "Vencido", color: "#DC2626", bg: "#FEE2E2", Icon: XCircle },
  inativo: { label: "Inativo", color: "#6B7280", bg: "#F3F4F6", Icon: Clock },
};

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EquipamentoDetalhes() {
  const [, params] = useRoute("/app/equipamentos/:id");
  const [, setLocation] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);

  const id = parseInt(params?.id ?? "0", 10);

  const { data: equipment, isLoading: loadingEq } = trpc.saas.equipment.getById.useQuery(
    { id },
    { enabled: id > 0 }
  );

  const { data: maintenance, isLoading: loadingMaint } = trpc.saas.maintenance.listByEquipment.useQuery(
    { equipmentId: id },
    { enabled: id > 0 }
  );

  const { data: documents } = trpc.saas.documents.listByEquipment.useQuery(
    { equipmentId: id },
    { enabled: id > 0 }
  );

  const publicUrl = equipment?.code
    ? `${window.location.origin}/equipamento/${equipment.code}`
    : "";

  const handlePrintQR = () => {
    if (!printRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Code — ${equipment?.code ?? ""}</title>
      <style>
        body { font-family: 'Barlow Condensed', Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fff; }
        .box { border: 2px solid #0a1628; padding: 24px 32px; text-align: center; max-width: 320px; }
        .code { font-size: 22px; font-weight: 800; color: #0a1628; letter-spacing: 0.08em; margin-top: 12px; }
        .label { font-size: 11px; color: #6B7280; margin-top: 4px; letter-spacing: 0.06em; }
        .bar { width: 40px; height: 3px; background: #C8102E; margin: 10px auto; }
        .company { font-size: 10px; color: #9CA3AF; margin-top: 8px; }
      </style></head><body>
      <div class="box">
        ${printRef.current.innerHTML}
        <div class="bar"></div>
        <div class="code">${equipment?.code ?? ""}</div>
        <div class="label">${CATEGORY_LABELS[equipment?.category ?? ""] ?? ""} · ${equipment?.installationLocation ?? ""}</div>
        <div class="company">CO2 Contra Incêndio · OPERIS IA</div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  if (loadingEq) {
    return (
      <SaasDashboardLayout>
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
          Carregando equipamento...
        </div>
      </SaasDashboardLayout>
    );
  }

  if (!equipment) {
    return (
      <SaasDashboardLayout>
        <div style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: "#DC2626", fontWeight: 700 }}>Equipamento não encontrado.</p>
          <button onClick={() => setLocation("/app/equipamentos")} style={{ marginTop: 16, padding: "8px 20px", background: "#0a1628", color: "#fff", border: "none", cursor: "pointer", fontSize: 13 }}>
            ← Voltar
          </button>
        </div>
      </SaasDashboardLayout>
    );
  }

  const status = STATUS_CONFIG[equipment.status ?? "ok"] ?? STATUS_CONFIG.ok;
  const StatusIcon = status.Icon;
  const CategoryIcon = CATEGORY_ICONS[equipment.category ?? "extintor"] ?? Flame;

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1100, padding: "32px 0" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <button
            onClick={() => setLocation("/app/equipamentos")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "transparent", border: "1px solid #D1D5DB", color: "#374151", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}
          >
            <ArrowLeft size={14} /> EQUIPAMENTOS
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CategoryIcon size={22} color="#C8102E" />
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 26, color: "#0a1628", margin: 0 }}>
                {equipment.code}
              </h1>
              <span style={{ padding: "3px 12px", background: status.bg, color: status.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <StatusIcon size={12} /> {status.label}
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
              {CATEGORY_LABELS[equipment.category ?? ""] ?? equipment.category}
              {equipment.subType ? ` · ${equipment.subType}` : ""}
              {equipment.manufacturer ? ` · ${equipment.manufacturer}` : ""}
            </p>
          </div>
          <button
            onClick={handlePrintQR}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#0a1628", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}
          >
            <Printer size={14} /> IMPRIMIR QR CODE
          </button>
        </div>

        {/* ── Grid principal ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>

          {/* ── Coluna esquerda: dados técnicos + histórico ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Dados técnicos */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderTop: "3px solid #0a1628" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 8 }}>
                <Package size={15} color="#C8102E" />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "#0a1628", letterSpacing: "0.06em" }}>DADOS TÉCNICOS</span>
              </div>
              <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px 24px" }}>
                {[
                  { label: "Código", value: equipment.code },
                  { label: "Categoria", value: CATEGORY_LABELS[equipment.category ?? ""] ?? equipment.category },
                  { label: "Subtipo", value: equipment.subType },
                  { label: "Fabricante", value: equipment.manufacturer },
                  { label: "Modelo", value: equipment.model },
                  { label: "Nº de Série", value: equipment.serialNumber },
                  { label: "Agente Extintor", value: equipment.agentType },
                  { label: "Capacidade", value: equipment.capacity },
                  { label: "Pressão", value: equipment.pressure },
                  { label: "Classe de Risco", value: equipment.riskClass },
                  { label: "Localização", value: equipment.installationLocation },
                  { label: "Andar", value: equipment.floor },
                  { label: "Setor", value: equipment.sector },
                  { label: "Instalação", value: fmtDate(equipment.installationDate) },
                  { label: "Última Manutenção", value: fmtDate(equipment.lastMaintenanceDate) },
                  { label: "Próxima Manutenção", value: fmtDate(equipment.nextMaintenanceDate) },
                ].filter(f => f.value).map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 2 }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Localização */}
            {(equipment.installationLocation || equipment.floor || equipment.sector) && (
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                <MapPin size={16} color="#C8102E" />
                <div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.06em" }}>LOCALIZAÇÃO</div>
                  <div style={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>
                    {[equipment.installationLocation, equipment.floor, equipment.sector].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            )}

            {/* Histórico de manutenções */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderTop: "3px solid #C8102E" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 8 }}>
                <Wrench size={15} color="#C8102E" />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "#0a1628", letterSpacing: "0.06em" }}>
                  HISTÓRICO DE MANUTENÇÕES
                </span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#9CA3AF" }}>
                  {(maintenance ?? []).length} registro(s)
                </span>
              </div>

              {loadingMaint ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>Carregando histórico...</div>
              ) : (maintenance ?? []).length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                  <Wrench size={28} color="#D1D5DB" style={{ display: "block", margin: "0 auto 8px" }} />
                  Nenhuma manutenção registrada.
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  {/* Timeline line */}
                  <div style={{ position: "absolute", left: 36, top: 0, bottom: 0, width: 2, background: "#E5E7EB" }} />
                  {(maintenance as Array<{
                    id: number;
                    serviceDate: Date | string;
                    serviceType: string;
                    description?: string | null;
                    agentType?: string | null;
                    capacity?: string | null;
                    pressure?: string | null;
                    technicianName?: string | null;
                    engineerName?: string | null;
                    crea?: string | null;
                    nextMaintenanceDate?: Date | string | null;
                    invoiceNumber?: string | null;
                    serviceOrderNumber?: string | null;
                    reportNumber?: string | null;
                  }>).map((m, idx) => (
                    <div key={m.id} style={{ display: "flex", gap: 16, padding: "20px 20px 20px 20px", borderBottom: idx < (maintenance ?? []).length - 1 ? "1px solid #F3F4F6" : "none" }}>
                      {/* Dot */}
                      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, marginLeft: 4 }}>
                        <Wrench size={14} color="#fff" />
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "#0a1628" }}>
                            {SERVICE_LABELS[m.serviceType] ?? m.serviceType}
                          </span>
                          <span style={{ fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={11} /> {fmtDate(m.serviceDate)}
                          </span>
                          {m.nextMaintenanceDate && (
                            <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>
                              Próx: {fmtDate(m.nextMaintenanceDate)}
                            </span>
                          )}
                        </div>
                        {m.description && (
                          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{m.description}</p>
                        )}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 12, color: "#6B7280" }}>
                          {m.agentType && <span>Agente: <strong>{m.agentType}</strong></span>}
                          {m.capacity && <span>Capacidade: <strong>{m.capacity}</strong></span>}
                          {m.pressure && <span>Pressão: <strong>{m.pressure}</strong></span>}
                          {m.technicianName && <span>Técnico: <strong>{m.technicianName}</strong></span>}
                          {m.engineerName && <span>Engenheiro: <strong>{m.engineerName}</strong></span>}
                          {m.crea && <span>CREA: <strong>{m.crea}</strong></span>}
                          {m.invoiceNumber && <span>NF: <strong>{m.invoiceNumber}</strong></span>}
                          {m.serviceOrderNumber && <span>OS: <strong>{m.serviceOrderNumber}</strong></span>}
                          {m.reportNumber && <span>Laudo: <strong>{m.reportNumber}</strong></span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documentos */}
            {(documents ?? []).length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={15} color="#C8102E" />
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "#0a1628", letterSpacing: "0.06em" }}>DOCUMENTOS</span>
                </div>
                <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {(documents as Array<{ id: number; fileName?: string | null; fileUrl?: string | null; documentType?: string | null; createdAt: Date | string }>).map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#F9FAFB", border: "1px solid #E5E7EB", textDecoration: "none", color: "#0a1628" }}
                    >
                      <FileText size={14} color="#C8102E" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.fileName ?? "Documento"}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{doc.documentType ?? ""} · {fmtDate(doc.createdAt)}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Coluna direita: QR Code ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderTop: "3px solid #0a1628", padding: "24px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 16 }}>
                QR CODE DO EQUIPAMENTO
              </div>

              {/* QR Code para impressão */}
              <div ref={printRef} style={{ display: "inline-block", padding: 12, border: "1px solid #E5E7EB", background: "#fff" }}>
                <QRCodeSVG
                  value={publicUrl || `https://co2contra.com/equipamento/${equipment.code}`}
                  size={180}
                  fgColor="#0a1628"
                  bgColor="#ffffff"
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: "#0a1628", letterSpacing: "0.06em" }}>
                  {equipment.code}
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                  {CATEGORY_LABELS[equipment.category ?? ""] ?? ""}
                </div>
              </div>

              <div style={{ marginTop: 16, padding: "8px 12px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 4 }}>LINK PÚBLICO</div>
                <div style={{ fontSize: 11, color: "#0a1628", wordBreak: "break-all", fontFamily: "monospace" }}>
                  {publicUrl || `co2contra.com/equipamento/${equipment.code}`}
                </div>
              </div>

              <button
                onClick={handlePrintQR}
                style={{ marginTop: 12, width: "100%", padding: "10px", background: "#0a1628", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Printer size={13} /> IMPRIMIR QR CODE
              </button>
            </div>

            {/* Resumo de datas */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", padding: "16px 20px" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 12 }}>DATAS IMPORTANTES</div>
              {[
                { label: "Instalação", value: fmtDate(equipment.installationDate), icon: Calendar },
                { label: "Última Manutenção", value: fmtDate(equipment.lastMaintenanceDate), icon: Wrench },
                { label: "Próxima Manutenção", value: fmtDate(equipment.nextMaintenanceDate), icon: AlertTriangle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Icon size={14} color="#C8102E" />
                  <div>
                    <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SaasDashboardLayout>
  );
}

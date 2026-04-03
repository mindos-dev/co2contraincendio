import jsPDF from "jspdf";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface EquipamentoPDFData {
  equipment: {
    id: number;
    code: string;
    category?: string | null;
    subType?: string | null;
    description?: string | null;
    manufacturer?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    agentType?: string | null;
    capacity?: string | null;
    pressure?: string | null;
    riskClass?: string | null;
    installationLocation?: string | null;
    floor?: string | null;
    sector?: string | null;
    status?: string | null;
    installationDate?: Date | string | null;
    lastMaintenanceDate?: Date | string | null;
    nextMaintenanceDate?: Date | string | null;
  };
  maintenance: Array<{
    id: number;
    serviceDate: Date | string;
    serviceType: string;
    description?: string | null;
    technicianName?: string | null;
    engineerName?: string | null;
    nextMaintenanceDate?: Date | string | null;
    cost?: number | null;
  }>;
  companyName?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RED = [200, 16, 46] as const;
const DARK = [10, 22, 40] as const;
const GRAY = [100, 100, 100] as const;
const LIGHT_GRAY = [240, 240, 240] as const;

const CATEGORY_LABELS: Record<string, string> = {
  extintor: "Extintor",
  hidrante: "Hidrante",
  sprinkler: "Sprinkler",
  detector: "Detector de Fumaça/Gás",
  sinalizacao: "Sinalização",
  complementar: "Complementar",
};

const SERVICE_LABELS: Record<string, string> = {
  recarga: "Recarga",
  inspecao: "Inspeção",
  substituicao: "Substituição",
  instalacao: "Instalação",
  teste: "Teste Hidrostático",
  outro: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  ok: "EM DIA",
  proximo_vencimento: "PRÓXIMO AO VENCIMENTO",
  vencido: "VENCIDO",
  inativo: "INATIVO",
};

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function addPageIfNeeded(pdf: jsPDF, y: number, margin = 20): number {
  if (y > pdf.internal.pageSize.getHeight() - 30) {
    pdf.addPage();
    return margin;
  }
  return y;
}

// ─── Função principal ─────────────────────────────────────────────────────────

export async function exportEquipamentoPDF(data: EquipamentoPDFData): Promise<void> {
  const { equipment, maintenance } = data;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ── Cabeçalho ──────────────────────────────────────────────────────────────
  pdf.setFillColor(...DARK);
  pdf.rect(0, 0, pageW, 28, "F");

  // Logo CO2
  pdf.setFillColor(...RED);
  pdf.rect(margin, 6, 16, 16, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("CO2", margin + 8, 15, { align: "center" });

  // Nome empresa
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.text("CO2 CONTRA INCÊNDIO", margin + 20, 12);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(180, 180, 180);
  pdf.text("ENGENHARIA E AUTOMAÇÃO · NBR 12615 · NFPA 12 · UL LISTED", margin + 20, 17);

  // OPERIS badge
  pdf.setFillColor(...RED);
  pdf.rect(pageW - margin - 30, 8, 30, 12, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("OPERIS IA", pageW - margin - 15, 15, { align: "center" });

  y = 36;

  // ── Título do relatório ────────────────────────────────────────────────────
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("RELATÓRIO TÉCNICO DE EQUIPAMENTO", margin, y);
  y += 6;

  pdf.setFillColor(...RED);
  pdf.rect(margin, y, 60, 1, "F");
  y += 6;

  // Código e categoria
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...DARK);
  pdf.text(`${equipment.code}`, margin, y);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...GRAY);
  pdf.setFontSize(9);
  pdf.text(
    `${CATEGORY_LABELS[equipment.category ?? ""] ?? equipment.category ?? ""}${equipment.subType ? " · " + equipment.subType : ""}`,
    margin,
    y + 5
  );

  // Status badge
  const statusLabel = STATUS_LABELS[equipment.status ?? "ok"] ?? "EM DIA";
  const statusColor: [number, number, number] =
    equipment.status === "ok" ? [5, 150, 105] :
    equipment.status === "vencido" ? [220, 38, 38] :
    equipment.status === "proximo_vencimento" ? [217, 119, 6] :
    [107, 114, 128];

  pdf.setFillColor(...statusColor);
  pdf.rect(pageW - margin - 50, y - 4, 50, 12, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(statusLabel, pageW - margin - 25, y + 3, { align: "center" });

  y += 18;

  // ── Ficha Técnica ──────────────────────────────────────────────────────────
  pdf.setFillColor(...DARK);
  pdf.rect(margin, y, contentW, 7, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("FICHA TÉCNICA", margin + 3, y + 5);
  y += 12;

  const fields: Array<[string, string | null | undefined]> = [
    ["Fabricante", equipment.manufacturer],
    ["Modelo", equipment.model],
    ["Número de Série", equipment.serialNumber],
    ["Agente Extintor", equipment.agentType],
    ["Capacidade", equipment.capacity],
    ["Pressão", equipment.pressure],
    ["Classe de Risco", equipment.riskClass],
    ["Localização", equipment.installationLocation],
    ["Andar / Setor", [equipment.floor, equipment.sector].filter(Boolean).join(" · ") || null],
  ].filter(([, v]) => v) as Array<[string, string]>;

  // Grid 2 colunas
  const colW = contentW / 2 - 3;
  fields.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xPos = margin + col * (colW + 6);
    const yPos = y + row * 12;

    y = addPageIfNeeded(pdf, yPos + 12);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...GRAY);
    pdf.text(label.toUpperCase(), xPos, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...DARK);
    pdf.text(String(value), xPos, yPos + 5);
  });

  y += Math.ceil(fields.length / 2) * 12 + 6;
  y = addPageIfNeeded(pdf, y + 20);

  // ── Datas importantes ──────────────────────────────────────────────────────
  pdf.setFillColor(...DARK);
  pdf.rect(margin, y, contentW, 7, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("DATAS IMPORTANTES", margin + 3, y + 5);
  y += 12;

  const dates = [
    ["Data de Instalação", fmtDate(equipment.installationDate)],
    ["Última Manutenção", fmtDate(equipment.lastMaintenanceDate)],
    ["Próxima Manutenção", fmtDate(equipment.nextMaintenanceDate)],
  ];

  const dateColW = contentW / 3;
  dates.forEach(([label, value], i) => {
    const xPos = margin + i * dateColW;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...GRAY);
    pdf.text(label.toUpperCase(), xPos, y);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...DARK);
    pdf.text(value, xPos, y + 7);
  });

  y += 20;

  // ── Histórico de Manutenções ───────────────────────────────────────────────
  if (maintenance.length > 0) {
    y = addPageIfNeeded(pdf, y + 20);

    pdf.setFillColor(...RED);
    pdf.rect(margin, y, contentW, 7, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(`HISTÓRICO DE MANUTENÇÕES (${maintenance.length} registros)`, margin + 3, y + 5);
    y += 12;

    // Cabeçalho da tabela
    pdf.setFillColor(...LIGHT_GRAY);
    pdf.rect(margin, y, contentW, 7, "F");
    pdf.setTextColor(...DARK);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text("DATA", margin + 2, y + 5);
    pdf.text("TIPO DE SERVIÇO", margin + 28, y + 5);
    pdf.text("TÉCNICO", margin + 90, y + 5);
    pdf.text("ENGENHEIRO", margin + 130, y + 5);
    y += 9;

    maintenance.forEach((m, i) => {
      y = addPageIfNeeded(pdf, y + 12);

      if (i % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, y - 2, contentW, 10, "F");
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...DARK);
      pdf.text(fmtDate(m.serviceDate), margin + 2, y + 4);
      pdf.text(SERVICE_LABELS[m.serviceType] ?? m.serviceType, margin + 28, y + 4);
      pdf.text(m.technicianName ?? "—", margin + 90, y + 4);
      pdf.text(m.engineerName ?? "—", margin + 130, y + 4);

      if (m.description) {
        y += 8;
        y = addPageIfNeeded(pdf, y + 8);
        pdf.setFontSize(7);
        pdf.setTextColor(...GRAY);
        const lines = pdf.splitTextToSize(`  ${m.description}`, contentW - 4);
        pdf.text(lines, margin + 2, y + 2);
        y += lines.length * 4;
      }

      y += 8;
    });
  }

  // ── Rodapé em todas as páginas ─────────────────────────────────────────────
  const totalPages = (pdf.internal as { getNumberOfPages?: () => number }).getNumberOfPages?.() ?? 1;
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFillColor(...DARK);
    pdf.rect(0, pageH - 12, pageW, 12, "F");
    pdf.setTextColor(180, 180, 180);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text(
      `CO2 Contra Incêndio · OPERIS IA · Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} · Eng. Judson Aleixo Sampaio · CREA/MG 142203671-5`,
      pageW / 2,
      pageH - 5,
      { align: "center" }
    );
    pdf.text(`Página ${p} de ${totalPages}`, pageW - margin, pageH - 5, { align: "right" });
  }

  // ── Download ───────────────────────────────────────────────────────────────
  const date = new Date().toISOString().split("T")[0];
  pdf.save(`relatorio-equipamento-${equipment.code}-${date}.pdf`);
}

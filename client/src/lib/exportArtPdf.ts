import jsPDF from "jspdf";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ArtPdfData {
  id: number;
  artNumber?: string | null;
  serviceType: string;
  description: string;
  clientName: string;
  clientDocument?: string | null;
  serviceAddress?: string | null;
  serviceDate: string | Date;
  status: string;
  submissionHash?: string | null;
  technicianSignatureTs?: string | Date | null;
  approvedAt?: string | Date | null;
  pdfUrl?: string | null;
  technician: {
    name: string;
    email: string;
  };
  approvals: Array<{
    action: string;
    notes?: string | null;
    reviewedAt: string | Date;
    reviewer?: { name: string } | null;
  }>;
  evidences: Array<{
    id: number;
    fileName: string;
    evidenceType: string;
    sha256Hash: string;
    fileUrl: string;
    isLocked: boolean;
  }>;
  companyName?: string;
}

// ─── Paleta OPERIS ────────────────────────────────────────────────────────────

const RED    = [200, 16, 46]  as const;
const DARK   = [10, 22, 40]   as const;
const GRAY   = [100, 100, 100] as const;
const LIGHT  = [240, 240, 240] as const;
const WHITE  = [255, 255, 255] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SERVICE_LABELS: Record<string, string> = {
  pmoc: "PMOC — Plano de Manutenção, Operação e Controle",
  incendio: "Proteção Contra Incêndio",
  eletrica: "Instalação Elétrica",
  gas: "Instalação de Gás",
  hidraulico: "Sistema Hidráulico",
  co2: "Sistema CO₂ / Supressão",
  outro: "Outro Serviço Técnico",
};

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  aguardando_aprovacao: "Aguardando Aprovação",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function addPageIfNeeded(pdf: jsPDF, y: number, margin = 20): number {
  if (y > 270) {
    pdf.addPage();
    return margin;
  }
  return y;
}

function drawHRule(pdf: jsPDF, y: number, margin: number, pageWidth: number): void {
  pdf.setDrawColor(...LIGHT);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageWidth - margin, y);
}

// ─── Exportação principal ─────────────────────────────────────────────────────

export function exportArtPdf(data: ArtPdfData): void {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Cabeçalho ────────────────────────────────────────────────────────────────
  pdf.setFillColor(...RED);
  pdf.rect(0, 0, pageWidth, 28, "F");

  pdf.setTextColor(...WHITE);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("OPERIS", margin, 12);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Responsabilidade Técnica Digital", margin, 18);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  const artLabel = data.artNumber ?? `ART #${data.id}`;
  pdf.text(artLabel, pageWidth - margin, 12, { align: "right" });

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  const statusLabel = STATUS_LABELS[data.status] ?? data.status;
  pdf.text(statusLabel.toUpperCase(), pageWidth - margin, 18, { align: "right" });

  y = 36;

  // ── Dados da empresa ──────────────────────────────────────────────────────────
  pdf.setTextColor(...DARK);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  const companyLine = `${data.companyName ?? "CO2 Contra Incêndio Ltda"} · CNPJ 29.905.123/0001-53 · Belo Horizonte, MG`;
  pdf.text(companyLine, margin, y);
  y += 6;

  drawHRule(pdf, y, margin, pageWidth);
  y += 5;

  // ── Seção: Dados do Serviço ───────────────────────────────────────────────────
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...RED);
  pdf.text("DADOS DO SERVIÇO", margin, y);
  y += 5;

  drawHRule(pdf, y, margin, pageWidth);
  y += 5;

  const fields: [string, string][] = [
    ["Tipo de Serviço",   SERVICE_LABELS[data.serviceType] ?? data.serviceType],
    ["Data do Serviço",   formatDate(data.serviceDate)],
    ["Cliente",           data.clientName],
    ["CPF/CNPJ Cliente",  data.clientDocument ?? "—"],
    ["Endereço",          data.serviceAddress ?? "—"],
    ["Técnico Responsável", data.technician.name],
    ["E-mail do Técnico", data.technician.email],
  ];

  pdf.setFontSize(9);
  for (const [label, value] of fields) {
    y = addPageIfNeeded(pdf, y, margin);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...GRAY);
    pdf.text(`${label}:`, margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...DARK);
    const lines = pdf.splitTextToSize(value, contentWidth - 55);
    pdf.text(lines, margin + 55, y);
    y += Math.max(5, lines.length * 4.5);
  }

  y += 3;
  drawHRule(pdf, y, margin, pageWidth);
  y += 5;

  // ── Seção: Descrição ──────────────────────────────────────────────────────────
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...RED);
  pdf.text("DESCRIÇÃO DO SERVIÇO", margin, y);
  y += 5;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...DARK);
  const descLines = pdf.splitTextToSize(data.description, contentWidth);
  y = addPageIfNeeded(pdf, y, margin);
  pdf.text(descLines, margin, y);
  y += descLines.length * 4.5 + 5;

  drawHRule(pdf, y, margin, pageWidth);
  y += 5;

  // ── Seção: Declaração do Técnico ──────────────────────────────────────────────
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...RED);
  pdf.text("DECLARAÇÃO DO TÉCNICO", margin, y);
  y += 5;

  y = addPageIfNeeded(pdf, y, margin);
  pdf.setFillColor(...LIGHT);
  pdf.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...DARK);
  const declaration = "\"Declaro que o serviço foi executado conforme normas técnicas aplicáveis.\"";
  const declLines = pdf.splitTextToSize(declaration, contentWidth - 8);
  pdf.text(declLines, margin + 4, y + 5);
  y += 18;

  if (data.technicianSignatureTs) {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...GRAY);
    pdf.text(`Assinado digitalmente em: ${formatDate(data.technicianSignatureTs)}`, margin, y);
    y += 5;
  }

  y += 2;
  drawHRule(pdf, y, margin, pageWidth);
  y += 5;

  // ── Seção: Evidências ─────────────────────────────────────────────────────────
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...RED);
  pdf.text(`EVIDÊNCIAS (${data.evidences.length})`, margin, y);
  y += 5;

  if (data.evidences.length === 0) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(...GRAY);
    pdf.text("Nenhuma evidência registrada.", margin, y);
    y += 6;
  } else {
    // Cabeçalho da tabela
    pdf.setFillColor(...DARK);
    pdf.rect(margin, y, contentWidth, 6, "F");
    pdf.setTextColor(...WHITE);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("Arquivo", margin + 2, y + 4);
    pdf.text("Tipo", margin + 80, y + 4);
    pdf.text("Hash SHA256 (16 chars)", margin + 115, y + 4);
    y += 6;

    for (let i = 0; i < data.evidences.length; i++) {
      const ev = data.evidences[i];
      y = addPageIfNeeded(pdf, y, margin);

      if (i % 2 === 0) {
        pdf.setFillColor(248, 248, 248);
        pdf.rect(margin, y, contentWidth, 6, "F");
      }

      pdf.setTextColor(...DARK);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);

      const fname = ev.fileName.length > 35 ? ev.fileName.substring(0, 32) + "..." : ev.fileName;
      pdf.text(fname, margin + 2, y + 4);
      pdf.text(ev.evidenceType, margin + 80, y + 4);
      pdf.text(ev.sha256Hash.substring(0, 16) + "...", margin + 115, y + 4);

      if (ev.isLocked) {
        pdf.setTextColor(245, 158, 11);
        pdf.text("🔒", margin + contentWidth - 8, y + 4);
        pdf.setTextColor(...DARK);
      }

      y += 6;
    }
    y += 3;
  }

  drawHRule(pdf, y, margin, pageWidth);
  y += 5;

  // ── Seção: Histórico de Aprovação ─────────────────────────────────────────────
  if (data.approvals.length > 0) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...RED);
    pdf.text("HISTÓRICO DE APROVAÇÃO", margin, y);
    y += 5;

    for (const ap of data.approvals) {
      y = addPageIfNeeded(pdf, y, margin);
      if (ap.action === "aprovado") {
        pdf.setFillColor(22, 163, 74);
      } else {
        pdf.setFillColor(239, 68, 68);
      }
      pdf.roundedRect(margin, y, 22, 5, 1, 1, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "bold");
      pdf.text(ap.action.toUpperCase(), margin + 11, y + 3.5, { align: "center" });

      pdf.setTextColor(...DARK);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const reviewer = ap.reviewer?.name ?? "Engenheiro";
      pdf.text(`${reviewer} — ${formatDate(ap.reviewedAt)}`, margin + 26, y + 3.5);
      y += 7;

      if (ap.notes) {
        pdf.setTextColor(...GRAY);
        pdf.setFontSize(8);
        const noteLines = pdf.splitTextToSize(`Observação: ${ap.notes}`, contentWidth - 4);
        pdf.text(noteLines, margin + 2, y);
        y += noteLines.length * 4 + 2;
      }
    }

    y += 3;
    drawHRule(pdf, y, margin, pageWidth);
    y += 5;
  }

  // ── Seção: Autenticidade ──────────────────────────────────────────────────────
  if (data.submissionHash) {
    y = addPageIfNeeded(pdf, y, margin);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...RED);
    pdf.text("AUTENTICIDADE", margin, y);
    y += 5;

    pdf.setFillColor(240, 253, 244);
    pdf.roundedRect(margin, y, contentWidth, 16, 2, 2, "F");
    pdf.setDrawColor(22, 163, 74);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, y, contentWidth, 16, 2, 2, "D");

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(22, 163, 74);
    pdf.text("Hash de Submissão (SHA256):", margin + 3, y + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...DARK);
    const hashLines = pdf.splitTextToSize(data.submissionHash, contentWidth - 6);
    pdf.text(hashLines, margin + 3, y + 10);
    y += 20;
  }

  // ── Rodapé em todas as páginas ────────────────────────────────────────────────
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFillColor(10, 22, 40);
    pdf.rect(0, pageHeight - 10, pageWidth, 10, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `OPERIS — ${data.artNumber ?? `ART #${data.id}`} · CO2 Contra Incêndio Ltda · Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
      margin,
      pageHeight - 4
    );
    pdf.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 4, { align: "right" });
  }

  // ── Salvar ────────────────────────────────────────────────────────────────────
  pdf.save(`ART-OPERIS-${data.id}-${data.clientName.replace(/\s+/g, "_")}.pdf`);
}

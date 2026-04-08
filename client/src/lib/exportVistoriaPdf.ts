import jsPDF from "jspdf";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface VistoriaPdfData {
  id: number;
  type: string;
  propertyAddress: string;
  propertyType?: string | null;
  contractId?: string | null;
  contractNumber?: string | null;
  auditHash?: string | null;
  inspectedAt?: Date | string | null;
  lockedAt?: Date | string | null;
  status: string;
  // Partes
  landlordName: string;
  landlordCpfCnpj?: string | null;
  tenantName: string;
  tenantCpfCnpj?: string | null;
  inspectorName?: string | null;
  inspectorCrea?: string | null;
  inspectorCompany?: string | null;
  // Assinaturas
  landlordSignedAt?: Date | string | null;
  tenantSignedAt?: Date | string | null;
  inspectorSignedAt?: Date | string | null;
  // Cláusulas 2026
  redutorSocial?: boolean | null;
  clausulaVigencia?: boolean | null;
  garantiaType?: string | null;
  // Cômodos
  rooms?: Array<{
    id: number;
    name: string;
    type?: string | null;
    notes?: string | null;
    items: Array<{
      id: number;
      name: string;
      category?: string | null;
      condition?: string | null;
      notes?: string | null;
      photoUrl?: string | null;
    }>;
  }>;
  // Fotos
  photos?: Array<{
    itemName: string;
    photoUrl: string;
    condition?: string | null;
    createdAt?: Date | string | null;
  }>;
  // Patologias
  pathologies?: Array<{
    id: number;
    category: string;
    severity: string;
    causeAnalysis?: string | null;
    repairSuggestion?: string | null;
    estimatedRepairCost?: number | string | null;
    riskScore?: number | null;
    photoContextUrl?: string | null;
    photoDetailUrl?: string | null;
  }>;
  totalRiskScore?: number;
  maxRisk?: number;
}

// ─── Paleta OPERIS ────────────────────────────────────────────────────────────

const DARK   = [10, 22, 40]    as const;
const RED    = [200, 16, 46]   as const;
const GRAY   = [100, 100, 100] as const;
const LIGHT  = [240, 240, 240] as const;
const WHITE  = [255, 255, 255] as const;
const GREEN  = [22, 163, 74]   as const;
const ORANGE: [number, number, number] = [234, 88, 12];

// ─── Dicionários ──────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  entrada:   "Vistoria de Entrada",
  saida:     "Vistoria de Saída",
  periodica: "Vistoria Periódica",
  devolucao: "Vistoria de Devolução",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartamento:   "Apartamento",
  casa:          "Casa",
  sala_comercial:"Sala Comercial",
  galpao:        "Galpão",
  outro:         "Outro",
};

const CONDITION_LABELS: Record<string, string> = {
  otimo:       "Ótimo",
  bom:         "Bom",
  regular:     "Regular",
  ruim:        "Ruim",
  pessimo:     "Péssimo",
  inexistente: "Inexistente",
};

const SEVERITY_LABELS: Record<string, string> = {
  low:    "Baixa",
  medium: "Média",
  high:   "Alta",
};

const CATEGORY_LABELS: Record<string, string> = {
  fissura:      "Fissura / Trinca",
  infiltracao:  "Infiltração / Vazamento",
  corrosao:     "Corrosão / Oxidação",
  destacamento: "Descolamento / Destacamento",
  outro:        "Outro",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date | string | null | undefined): string {
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

function sectionTitle(pdf: jsPDF, title: string, y: number, margin: number, pageWidth: number): number {
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...RED);
  pdf.text(title, margin, y);
  y += 4;
  drawHRule(pdf, y, margin, pageWidth);
  return y + 4;
}

function riskColor(score: number): [number, number, number] {
  if (score === 0) return [22, 163, 74];
  if (score <= 3) return [101, 163, 13];
  if (score <= 5) return [217, 119, 6];
  if (score <= 7) return [234, 88, 12];
  return [220, 38, 38];
}

function riskLabel(score: number): string {
  if (score === 0) return "Sem Risco";
  if (score <= 3) return "Risco Baixo";
  if (score <= 5) return "Risco Moderado";
  if (score <= 7) return "Risco Alto";
  return "Risco Crítico";
}

// ─── Exportação principal ─────────────────────────────────────────────────────

export function exportVistoriaPdf(data: VistoriaPdfData): void {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Cabeçalho ─────────────────────────────────────────────────────────────────
  pdf.setFillColor(...DARK);
  pdf.rect(0, 0, pageWidth, 30, "F");

  pdf.setTextColor(...WHITE);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("OPERIS", margin, 13);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Plataforma de Inspeção e Laudos Técnicos", margin, 20);

  // Tipo e status no canto direito
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(TYPE_LABELS[data.type] ?? data.type, pageWidth - margin, 13, { align: "right" });

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  const propTypeLabel = data.propertyType ? (PROPERTY_TYPE_LABELS[data.propertyType] ?? data.propertyType) : "";
  pdf.text(propTypeLabel, pageWidth - margin, 20, { align: "right" });

  y = 38;

  // ── Identificação do imóvel ───────────────────────────────────────────────────
  pdf.setTextColor(...DARK);
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  const addrLines = pdf.splitTextToSize(data.propertyAddress, contentWidth);
  pdf.text(addrLines, margin, y);
  y += addrLines.length * 6 + 2;

  if (data.contractId) {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...GRAY);
    pdf.text(`Contrato: ${data.contractId}`, margin, y);
    y += 5;
  }

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...GRAY);
  pdf.text(`Vistoriado em: ${formatDate(data.inspectedAt)}`, margin, y);
  y += 5;

  drawHRule(pdf, y, margin, pageWidth);
  y += 5;

  // ── Partes ────────────────────────────────────────────────────────────────────
  y = sectionTitle(pdf, "PARTES ENVOLVIDAS", y, margin, pageWidth);

  const colW = contentWidth / 3;
  const parties = [
    { label: "LOCADOR", name: data.landlordName, doc: data.landlordCpfCnpj, signedAt: data.landlordSignedAt },
    { label: "INQUILINO", name: data.tenantName, doc: data.tenantCpfCnpj, signedAt: data.tenantSignedAt },
    { label: "VISTORIADOR", name: data.inspectorName ?? "Eng. Judson Aleixo Sampaio", doc: data.inspectorCrea ?? "CREA/MG 142203671-5", signedAt: data.inspectorSignedAt },
  ];

  const partyBoxH = 22;
  for (let i = 0; i < parties.length; i++) {
    const p = parties[i];
    const x = margin + i * colW;
    pdf.setFillColor(248, 249, 250);
    pdf.roundedRect(x, y, colW - 2, partyBoxH, 2, 2, "F");

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...GRAY);
    pdf.text(p.label, x + 3, y + 5);

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...DARK);
    const nameLines = pdf.splitTextToSize(p.name, colW - 8);
    pdf.text(nameLines[0], x + 3, y + 10);

    if (p.doc) {
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...GRAY);
      pdf.text(p.doc, x + 3, y + 15);
    }

    if (p.signedAt) {
      pdf.setFontSize(7);
      pdf.setTextColor(...GREEN);
      pdf.text("✓ Assinado em " + formatDate(p.signedAt), x + 3, y + 20);
    }
  }
  y += partyBoxH + 6;

  drawHRule(pdf, y, margin, pageWidth);
  y += 5;

  // ── Risk Score ────────────────────────────────────────────────────────────────
  const pathCount = data.pathologies?.length ?? 0;
  if (pathCount > 0) {
    y = sectionTitle(pdf, "ÍNDICE DE RISCO ESTRUTURAL", y, margin, pageWidth);
    y = addPageIfNeeded(pdf, y, margin);

    const riskScore = data.totalRiskScore ?? 0;
    const rc = riskColor(riskScore);

    // Caixa de risco
    pdf.setFillColor(rc[0], rc[1], rc[2]);
    pdf.roundedRect(margin, y, 28, 16, 2, 2, "F");
    pdf.setTextColor(...WHITE);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(String(riskScore), margin + 14, y + 11, { align: "center" });

    pdf.setTextColor(...DARK);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(riskLabel(riskScore), margin + 32, y + 7);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...GRAY);
    pdf.text(`${pathCount} patologia(s) registrada(s) · Risk Score máximo: ${data.maxRisk ?? 0}/10`, margin + 32, y + 13);

    // Barra de progresso
    const barW = contentWidth - 32;
    const barX = margin + 32;
    const barY = y + 17;
    pdf.setFillColor(...LIGHT);
    pdf.roundedRect(barX, barY, barW, 3, 1, 1, "F");
    const fillW = Math.min(barW, (riskScore / (pathCount * 10)) * barW);
    pdf.setFillColor(rc[0], rc[1], rc[2]);
    pdf.roundedRect(barX, barY, fillW, 3, 1, 1, "F");

    y += 26;
    drawHRule(pdf, y, margin, pageWidth);
    y += 5;
  }

  // ── Checklist por cômodo ──────────────────────────────────────────────────────
  if ((data.rooms?.length ?? 0) > 0) {
    y = sectionTitle(pdf, "CHECKLIST POR CÔMODO", y, margin, pageWidth);

    for (const room of data.rooms!) {
      y = addPageIfNeeded(pdf, y, margin);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...DARK);
      pdf.text(room.name.toUpperCase(), margin, y);
      y += 4;

      if (room.notes) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(...GRAY);
        const noteLines = pdf.splitTextToSize(room.notes, contentWidth);
        pdf.text(noteLines, margin, y);
        y += noteLines.length * 4;
      }

      // Tabela de itens
      if (room.items.length > 0) {
        // Cabeçalho
        pdf.setFillColor(...DARK);
        pdf.rect(margin, y, contentWidth, 5, "F");
        pdf.setTextColor(...WHITE);
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "bold");
        pdf.text("Item", margin + 2, y + 3.5);
        pdf.text("Categoria", margin + 70, y + 3.5);
        pdf.text("Condição", margin + 120, y + 3.5);
        y += 5;

        for (let i = 0; i < room.items.length; i++) {
          const item = room.items[i];
          y = addPageIfNeeded(pdf, y, margin);

          if (i % 2 === 0) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(margin, y, contentWidth, 5.5, "F");
          }

          pdf.setTextColor(...DARK);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7.5);

          const itemName = item.name.length > 38 ? item.name.substring(0, 35) + "..." : item.name;
          pdf.text(itemName, margin + 2, y + 3.8);
          pdf.text(item.category ?? "—", margin + 70, y + 3.8);

          const condLabel = item.condition ? (CONDITION_LABELS[item.condition] ?? item.condition) : "—";
          // Colorir condição
          if (item.condition === "otimo" || item.condition === "bom") {
            pdf.setTextColor(...GREEN);
          } else if (item.condition === "ruim" || item.condition === "pessimo") {
            pdf.setTextColor(220, 38, 38);
          } else if (item.condition === "regular") {
            pdf.setTextColor(...ORANGE);
          } else {
            pdf.setTextColor(...GRAY);
          }
          pdf.text(condLabel, margin + 120, y + 3.8);
          pdf.setTextColor(...DARK);

          y += 5.5;
        }
        y += 3;
      }

      drawHRule(pdf, y, margin, pageWidth);
      y += 4;
    }
  }

  // ── Patologias ────────────────────────────────────────────────────────────────
  if (pathCount > 0) {
    y = addPageIfNeeded(pdf, y, margin);
    y = sectionTitle(pdf, `PATOLOGIAS IDENTIFICADAS (${pathCount})`, y, margin, pageWidth);

    for (let i = 0; i < data.pathologies!.length; i++) {
      const p = data.pathologies![i];
      y = addPageIfNeeded(pdf, y, margin);

      const sev = p.severity;
      let sevColor: [number, number, number] = ORANGE;
      if (sev === "high") sevColor = [220, 38, 38];
      else if (sev === "low") sevColor = [217, 119, 6];

      // Fundo da patologia
      pdf.setFillColor(sevColor[0], sevColor[1], sevColor[2], 0.08);
      const boxH = 22 + (p.causeAnalysis ? 6 : 0) + (p.repairSuggestion ? 6 : 0) + (p.estimatedRepairCost ? 5 : 0);
      pdf.setFillColor(255, 250, 245);
      pdf.roundedRect(margin, y, contentWidth, boxH, 2, 2, "F");
      pdf.setDrawColor(sevColor[0], sevColor[1], sevColor[2]);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(margin, y, contentWidth, boxH, 2, 2, "D");

      // Badge de severidade
      pdf.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
      pdf.roundedRect(margin + 2, y + 2, 22, 5, 1, 1, "F");
      pdf.setTextColor(...WHITE);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text((SEVERITY_LABELS[sev] ?? sev).toUpperCase(), margin + 13, y + 5.5, { align: "center" });

      // Número e categoria
      pdf.setTextColor(...DARK);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${i + 1}. ${CATEGORY_LABELS[p.category] ?? p.category}`, margin + 27, y + 5.5);

      // Risk Score individual
      if (p.riskScore != null) {
        const rc = riskColor(p.riskScore);
        pdf.setTextColor(rc[0], rc[1], rc[2]);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(String(p.riskScore), pageWidth - margin - 4, y + 6, { align: "right" });
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...GRAY);
        pdf.text("/10", pageWidth - margin - 4, y + 10, { align: "right" });
      }

      let py = y + 12;

      if (p.causeAnalysis) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...GRAY);
        pdf.text("Causa:", margin + 3, py);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...DARK);
        const causeLines = pdf.splitTextToSize(p.causeAnalysis, contentWidth - 25);
        pdf.text(causeLines[0], margin + 18, py);
        py += 5;
      }

      if (p.repairSuggestion) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...GRAY);
        pdf.text("Reparo:", margin + 3, py);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...DARK);
        const repairLines = pdf.splitTextToSize(p.repairSuggestion, contentWidth - 25);
        pdf.text(repairLines[0], margin + 18, py);
        py += 5;
      }

      if (p.estimatedRepairCost) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...GRAY);
        pdf.text("Custo est.:", margin + 3, py);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...DARK);
        pdf.text(
          `R$ ${Number(p.estimatedRepairCost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          margin + 25, py
        );
      }

      y += boxH + 3;
    }

    drawHRule(pdf, y, margin, pageWidth);
    y += 5;
  }

  // ── Cláusulas 2026 ────────────────────────────────────────────────────────────
  if (data.redutorSocial || data.clausulaVigencia) {
    y = addPageIfNeeded(pdf, y, margin);
    y = sectionTitle(pdf, "CLÁUSULAS ESPECIAIS — REFORMA TRIBUTÁRIA 2026", y, margin, pageWidth);

    if (data.redutorSocial) {
      pdf.setFillColor(239, 246, 255);
      pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, "D");

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(29, 78, 216);
      pdf.text("Redutor Social — LC 214/2025", margin + 3, y + 5);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.text("Imóvel residencial enquadrado no Redutor Social de R$ 600,00 sobre a base de cálculo do IBS/CBS.", margin + 3, y + 10);
      y += 15;
    }

    if (data.clausulaVigencia) {
      pdf.setFillColor(240, 253, 244);
      pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
      pdf.setDrawColor(...GREEN);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, "D");

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(21, 128, 61);
      pdf.text("Cláusula de Vigência — Art. 8º Lei 8.245/91", margin + 3, y + 5);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.text("Contrato averbado na matrícula do imóvel. Em caso de alienação, o adquirente deverá respeitar o prazo contratual.", margin + 3, y + 10);
      y += 15;
    }

    drawHRule(pdf, y, margin, pageWidth);
    y += 5;
  }

  // ── Hash de Auditoria ─────────────────────────────────────────────────────────
  if (data.auditHash) {
    y = addPageIfNeeded(pdf, y, margin);
    pdf.setFillColor(240, 253, 244);
    pdf.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");
    pdf.setDrawColor(...GREEN);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(margin, y, contentWidth, 14, 2, 2, "D");

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...GREEN);
    pdf.text("Hash de Auditoria SHA-256:", margin + 3, y + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...DARK);
    const hashLines = pdf.splitTextToSize(data.auditHash, contentWidth - 6);
    pdf.text(hashLines, margin + 3, y + 10);
    y += 18;
  }

  // ── Rodapé jurídico em todas as páginas ───────────────────────────────────────
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);

    // Faixa escura
    pdf.setFillColor(...DARK);
    pdf.rect(0, pageHeight - 18, pageWidth, 18, "F");

    pdf.setTextColor(...WHITE);
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "bold");
    pdf.text("OPERIS IA — Plataforma de Inspeção e Laudos Técnicos", margin, pageHeight - 13);

    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(180, 190, 200);
    pdf.text(
      "CO₂ Contra Incêndio LTDA · CNPJ 29.905.123/0001-53 · BH/MG · Resp. Técnico: Eng. Judson Aleixo Sampaio · CREA/MG 142203671-5",
      margin,
      pageHeight - 8
    );
    pdf.text(
      "Validade jurídica: Lei 13.709/2018 (LGPD) e Lei 8.245/1991 (Lei do Inquilinato)",
      margin,
      pageHeight - 4
    );

    pdf.setTextColor(...WHITE);
    pdf.setFontSize(7);
    pdf.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    pdf.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
      pageWidth - margin,
      pageHeight - 4,
      { align: "right" }
    );
  }

  // ── Salvar ────────────────────────────────────────────────────────────────────
  const fileName = `Laudo-OPERIS-${data.id}-${data.propertyAddress.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30)}.pdf`;
  pdf.save(fileName);
}

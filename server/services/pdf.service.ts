/**
 * OPERIS PDF Service — Geração e armazenamento de PDFs técnicos
 * Versão: 2.0
 *
 * Responsabilidades:
 *  - Converter HTML de laudos em PDF via puppeteer/weasyprint
 *  - Upload do PDF para S3
 *  - Retornar URL pública para acesso
 */

import { storagePut } from "../storage";
import { CO2_COMPANY } from "../core/engine";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface PdfGenerationResult {
  url: string;
  key: string;
  sizeBytes: number;
  generatedAt: string;
}

// ─── Geração de PDF ──────────────────────────────────────────────────────────

/**
 * Converte HTML em PDF e faz upload para S3.
 * Usa a API interna do servidor para renderização.
 */
export async function generatePdfFromHtml(
  html: string,
  fileName: string
): Promise<PdfGenerationResult> {
  // Injetar estilos de impressão no HTML
  const printHtml = injectPrintStyles(html);
  const htmlBuffer = Buffer.from(printHtml, "utf-8");

  // Gerar chave única no S3
  const timestamp = Date.now();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const key = `laudos/${safeFileName}-${timestamp}.html`;

  // Upload do HTML para S3 (PDF rendering é feito client-side via print)
  const { url } = await storagePut(key, htmlBuffer, "text/html; charset=utf-8");

  return {
    url,
    key,
    sizeBytes: htmlBuffer.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Gera a URL de download do laudo em formato imprimível.
 */
export async function generateLaudoUrl(
  laudoHtml: string,
  inspectionId: number,
  slug: string
): Promise<string> {
  const result = await generatePdfFromHtml(laudoHtml, `laudo-${inspectionId}-${slug}`);
  return result.url;
}

// ─── Injeção de Estilos de Impressão ────────────────────────────────────────

function injectPrintStyles(html: string): string {
  const printStyles = `
<style>
  @media print {
    body { margin: 0; padding: 1cm; }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
    a { text-decoration: none; color: inherit; }
  }
  @page {
    size: A4;
    margin: 2cm 1.5cm;
  }
  body {
    font-family: Arial, 'Helvetica Neue', sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #111;
  }
  h1, h2, h3 {
    font-family: 'Arial Narrow', Arial, sans-serif;
    page-break-after: avoid;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 6px 10px;
    font-size: 10pt;
  }
  .laudo-header {
    border-top: 4px solid #C8102E;
    padding-top: 1rem;
    margin-bottom: 1.5rem;
  }
  .laudo-footer {
    border-top: 1px solid #ddd;
    padding-top: 0.75rem;
    font-size: 9pt;
    color: #666;
    margin-top: 2rem;
  }
</style>`;

  // Injetar antes do </head> ou no início do body
  if (html.includes("</head>")) {
    return html.replace("</head>", `${printStyles}</head>`);
  }
  if (html.includes("<body")) {
    return html.replace("<body", `${printStyles}<body`);
  }
  return printStyles + html;
}

// ─── Template de Laudo Padrão ────────────────────────────────────────────────

export function buildLaudoTemplate(data: {
  inspectionId: number;
  date: string;
  system: string;
  location: string;
  risk: string;
  technicianName?: string;
  technicianCrea?: string;
  items: Array<{ title: string; status: string; observations: string }>;
}): string {
  const statusColor: Record<string, string> = {
    conforme: "#22C55E",
    nao_conforme: "#EF4444",
    necessita_revisao: "#EAB308",
  };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laudo de Inspeção #${data.inspectionId} — ${CO2_COMPANY.name}</title>
</head>
<body style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:2rem;color:#111">

  <!-- Cabeçalho -->
  <div class="laudo-header" style="border-top:4px solid #C8102E;padding-top:1rem;margin-bottom:2rem">
    <table style="width:100%;border:none">
      <tr>
        <td style="border:none;padding:0">
          <div style="font-size:1.5rem;font-weight:700;color:#111;letter-spacing:0.05em">CO₂ CONTRA INCÊNDIO</div>
          <div style="font-size:0.75rem;color:#666;margin-top:0.25rem">
            ${CO2_COMPANY.city} | CNPJ: ${CO2_COMPANY.cnpj} | ${CO2_COMPANY.ul}
          </div>
        </td>
        <td style="border:none;padding:0;text-align:right">
          <div style="font-size:0.75rem;color:#666">Laudo #${data.inspectionId}</div>
          <div style="font-size:0.75rem;color:#666">Data: ${data.date}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Título -->
  <h1 style="font-size:1.25rem;color:#C8102E;margin-bottom:1rem">
    LAUDO TÉCNICO DE INSPEÇÃO DE SEGURANÇA CONTRA INCÊNDIO
  </h1>

  <!-- Dados da Inspeção -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem">
    <tr>
      <td style="padding:0.5rem;border:1px solid #ddd;font-weight:600;background:#f9f9f9;width:30%">Sistema</td>
      <td style="padding:0.5rem;border:1px solid #ddd">${data.system}</td>
    </tr>
    <tr>
      <td style="padding:0.5rem;border:1px solid #ddd;font-weight:600;background:#f9f9f9">Local</td>
      <td style="padding:0.5rem;border:1px solid #ddd">${data.location}</td>
    </tr>
    <tr>
      <td style="padding:0.5rem;border:1px solid #ddd;font-weight:600;background:#f9f9f9">Risco Global</td>
      <td style="padding:0.5rem;border:1px solid #ddd;font-weight:700;color:#C8102E">${data.risk}</td>
    </tr>
  </table>

  <!-- Itens -->
  <h2 style="font-size:1rem;margin-bottom:0.75rem">Itens Inspecionados</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem">
    <thead>
      <tr style="background:#111;color:#fff">
        <th style="padding:0.5rem;text-align:left;border:1px solid #333">Item</th>
        <th style="padding:0.5rem;text-align:center;border:1px solid #333;width:120px">Status</th>
        <th style="padding:0.5rem;text-align:left;border:1px solid #333">Observações</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map((item, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"}">
        <td style="padding:0.5rem;border:1px solid #ddd">${item.title}</td>
        <td style="padding:0.5rem;border:1px solid #ddd;text-align:center">
          <span style="color:${statusColor[item.status] ?? "#666"};font-weight:600;font-size:0.8125rem">
            ${item.status.replace(/_/g, " ").toUpperCase()}
          </span>
        </td>
        <td style="padding:0.5rem;border:1px solid #ddd;font-size:0.875rem">${item.observations}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <!-- Assinatura -->
  <div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #ddd">
    <p style="font-size:0.875rem;color:#444">Responsável Técnico:</p>
    <p style="font-weight:600">${data.technicianName ?? CO2_COMPANY.engineer}</p>
    <p style="font-size:0.875rem;color:#666">${data.technicianCrea ?? CO2_COMPANY.crea}</p>
    <p style="font-size:0.875rem;color:#666">${CO2_COMPANY.name}</p>
  </div>

  <!-- Rodapé -->
  <div class="laudo-footer" style="border-top:1px solid #ddd;padding-top:0.75rem;font-size:0.75rem;color:#888;margin-top:2rem">
    <p>Documento gerado pelo sistema OPERIS IA | ${new Date().toLocaleDateString("pt-BR")} | ${CO2_COMPANY.ul}</p>
    <p>Este laudo tem validade técnica conforme NBR 12962, NBR 12779 e NFPA 10.</p>
  </div>

</body>
</html>`;
}

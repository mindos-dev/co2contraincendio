/**
 * OPERIS AI Service
 * Usa claude-3-haiku (Anthropic) diretamente via anthropic-client.ts
 *
 * Controles:
 *   - analyzeInspectionImages: max_tokens=400, temperature=0.2
 *   - generateTechnicalReport: max_tokens=2048, temperature=0.2
 *   - Fallback seguro: nunca derruba o servidor
 */

import { callHaiku } from "./anthropic-client";

export interface ImageAnalysisResult {
  item_id: string;
  status: "conforme" | "nao_conforme" | "necessita_revisao";
  findings: string;
  risk_level: "R1" | "R2" | "R3" | "R4" | "R5";
  recommendations: string[];
  confidence: number;
}

export interface InspectionItem {
  id: string;
  title: string;
  description: string;
  system: string;
  norm_reference: string;
}

/**
 * Analisa imagens de um item de inspeção usando claude-3-haiku.
 * Nota: claude-3-haiku não suporta visão — analisa com base nos metadados do item.
 * Para análise visual, use claude-3-sonnet ou claude-3-opus.
 */
export async function analyzeInspectionImages(
  item: InspectionItem,
  images: string[]
): Promise<ImageAnalysisResult> {
  if (!images || images.length === 0) {
    throw new Error("Nenhuma imagem fornecida para análise");
  }
  if (images.length > 5) {
    throw new Error("Máximo de 5 imagens por análise");
  }

  const systemPrompt = `Você é um engenheiro sênior especializado em sistemas de proteção contra incêndio (NBR, NFPA, UL).

Analise o item de inspeção e retorne APENAS um JSON válido, sem texto adicional, sem markdown, sem blocos de código:
{"status":"conforme|nao_conforme|necessita_revisao","findings":"descrição técnica","risk_level":"R1|R2|R3|R4|R5","recommendations":["rec1","rec2"],"confidence":0.0}

Regras:
- status: "conforme", "nao_conforme" ou "necessita_revisao"
- risk_level: R1=baixo, R2=moderado, R3=médio, R4=alto, R5=crítico
- confidence: número entre 0.0 e 1.0
- Cite normas específicas nos findings
- Máximo 2 recomendações`;

  const userPrompt = `Item de inspeção:
Título: ${item.title}
Descrição: ${item.description}
Sistema: ${item.system}
Norma: ${item.norm_reference}
Imagens enviadas: ${images.length} foto(s)

Avalie conformidade, estado de conservação e riscos. Retorne o JSON.`;

  try {
    const raw = await callHaiku(systemPrompt, userPrompt, 400);

    // Extrair JSON da resposta (remover possível markdown)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }

    const analysis = JSON.parse(jsonMatch[0]) as Omit<ImageAnalysisResult, "item_id">;

    // Validar campos obrigatórios
    if (!analysis.status || !analysis.risk_level || !analysis.findings) {
      throw new Error("JSON incompleto retornado pela IA");
    }

    return { item_id: item.id, ...analysis };
  } catch (error) {
    console.error("[OPERIS AI] Erro na análise:", error);
    // Fallback seguro — não derruba o servidor
    return {
      item_id: item.id,
      status: "necessita_revisao",
      findings: "Análise automática indisponível. Avaliação manual necessária.",
      risk_level: "R3",
      recommendations: ["Realizar inspeção visual manual", "Consultar responsável técnico"],
      confidence: 0,
    };
  }
}

/**
 * Gera laudo técnico completo em HTML usando claude-3-haiku.
 */
export async function generateTechnicalReport(inspectionData: {
  title: string;
  location: string;
  client: string;
  unit?: string;
  system: string;
  technicianName?: string;
  technicianCrea?: string;
  companyName?: string;
  signatureUrl?: string;
  items: Array<{
    item: InspectionItem;
    analysis: ImageAnalysisResult;
    images: string[];
  }>;
}): Promise<string> {
  const systemPrompt = `Você é um engenheiro responsável técnico gerando um laudo de inspeção profissional.

O laudo deve:
- Seguir padrões técnicos brasileiros (NBR, ABNT)
- Usar linguagem formal e precisa
- Citar normas específicas
- Incluir conclusões e recomendações
- Ser estruturado em seções claras

Retorne o laudo em HTML bem formatado (sem tags <html>, <head>, <body> — apenas o conteúdo interno).`;

  const itemsSummary = inspectionData.items
    .map(
      (it, idx) =>
        `Item ${idx + 1}: ${it.item.title} | Status: ${it.analysis.status} | Risco: ${it.analysis.risk_level} | Achados: ${it.analysis.findings} | Recomendações: ${it.analysis.recommendations.join("; ")}`
    )
    .join("\n");

  const techBlock = inspectionData.technicianName
    ? `Responsável Técnico: ${inspectionData.technicianName}${inspectionData.technicianCrea ? ` | CREA: ${inspectionData.technicianCrea}` : ""}${inspectionData.companyName ? ` | Empresa: ${inspectionData.companyName}` : ""}`
    : "";

  const signatureBlock = inspectionData.signatureUrl
    ? `<div style="margin-top:32px;padding-top:24px;border-top:2px solid #e5e7eb;text-align:center;"><p style="font-size:12px;color:#6b7280;margin-bottom:8px;">Assinatura Digital do Responsável Técnico</p><img src="${inspectionData.signatureUrl}" alt="Assinatura" style="max-width:280px;height:auto;border:1px solid #e5e7eb;border-radius:8px;padding:8px;background:#fff;" /></div>`
    : `<div style="margin-top:32px;padding-top:24px;border-top:2px solid #e5e7eb;"><p style="color:#6b7280;font-size:12px;">Assinatura do Responsável Técnico: ___________________________</p></div>`;

  const userPrompt = `Gere um laudo técnico completo para:

Título: ${inspectionData.title}
Local: ${inspectionData.location}
Cliente: ${inspectionData.client}
${inspectionData.unit ? `Unidade: ${inspectionData.unit}` : ""}
${techBlock}
Sistema: ${inspectionData.system}

Itens Inspecionados:
${itemsSummary}

Estruture com: 1.Cabeçalho 2.Objetivo 3.Metodologia 4.Resultados 5.Conclusões 6.Recomendações 7.Assinatura

Inclua ao final: ${signatureBlock}

Retorne HTML formatado.`;

  try {
    const html = await callHaiku(systemPrompt, userPrompt, 2048);
    return html;
  } catch (error) {
    console.error("[OPERIS AI] Erro na geração de laudo:", error);
    throw new Error(
      `Falha na geração de laudo: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

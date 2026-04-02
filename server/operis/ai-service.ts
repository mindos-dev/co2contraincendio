/**
 * OPERIS AI Service
 * Portado do OPERIS IA (FastAPI) para TypeScript
 * Usa invokeLLM (Anthropic Claude) para análise de imagens e geração de laudos
 */
import { invokeLLM } from "../_core/llm";
import type { MessageContent } from "../_core/llm";

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
 * Analisa imagens de um item de inspeção usando Claude Vision
 * @param item Item do checklist sendo inspecionado
 * @param images Array de URLs de imagens (CDN ou base64 data URLs)
 * @returns Análise técnica com status, achados, risco e recomendações
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

  const systemPrompt = `Você é um engenheiro sênior especializado em sistemas de proteção contra incêndio.

Sua tarefa é analisar imagens de inspeção técnica e fornecer uma avaliação profissional baseada em normas técnicas (NBR, NFPA, UL).

IMPORTANTE:
- Seja objetivo e técnico
- Cite normas específicas quando aplicável
- Classifique o risco de R1 (baixo) a R5 (crítico)
- Forneça recomendações acionáveis
- Use terminologia técnica precisa

Retorne APENAS um objeto JSON válido com esta estrutura:
{
  "status": "conforme" | "nao_conforme" | "necessita_revisao",
  "findings": "descrição técnica detalhada dos achados",
  "risk_level": "R1" | "R2" | "R3" | "R4" | "R5",
  "recommendations": ["recomendação 1", "recomendação 2", ...],
  "confidence": 0.0-1.0
}`;

  const userPrompt = `Analise as imagens do seguinte item de inspeção:

**Item**: ${item.title}
**Descrição**: ${item.description}
**Sistema**: ${item.system}
**Referência Normativa**: ${item.norm_reference}

Avalie:
1. Conformidade com normas técnicas
2. Estado de conservação
3. Riscos identificados
4. Necessidade de correções

Retorne o JSON de análise.`;

  // Preparar conteúdo multimodal (texto + imagens)
  const content: MessageContent[] = [
    { type: "text", text: userPrompt },
  ];

  for (const imageUrl of images) {
    content.push({
      type: "image_url",
      image_url: { url: imageUrl },
    });
  }

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content as MessageContent[] },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "inspection_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["conforme", "nao_conforme", "necessita_revisao"],
                description: "Status de conformidade do item inspecionado",
              },
              findings: {
                type: "string",
                description: "Descrição técnica detalhada dos achados da inspeção",
              },
              risk_level: {
                type: "string",
                enum: ["R1", "R2", "R3", "R4", "R5"],
                description: "Nível de risco identificado (R1=baixo, R5=crítico)",
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "Lista de recomendações técnicas acionáveis",
              },
              confidence: {
                type: "number",
                description: "Confiança da análise (0.0 a 1.0)",
              },
            },
            required: ["status", "findings", "risk_level", "recommendations", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const analysisContent = response.choices[0].message.content;
    if (!analysisContent) {
      throw new Error("Resposta vazia da API de IA");
    }

    const analysisText = typeof analysisContent === "string" ? analysisContent : JSON.stringify(analysisContent);
    const analysis = JSON.parse(analysisText) as Omit<ImageAnalysisResult, "item_id">;

    return {
      item_id: item.id,
      ...analysis,
    };
  } catch (error) {
    console.error("[OPERIS AI] Erro na análise de imagem:", error);
    throw new Error(`Falha na análise de imagem: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gera um laudo técnico completo baseado nos resultados da inspeção
 * @param inspectionData Dados da inspeção (título, local, cliente, itens analisados)
 * @returns Laudo técnico em HTML
 */
export async function generateTechnicalReport(inspectionData: {
  title: string;
  location: string;
  client: string;
  unit?: string;
  system: string;
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

Retorne o laudo em HTML bem formatado (sem tags <html>, <head>, <body> — apenas o conteúdo).`;

  const itemsSummary = inspectionData.items
    .map(
      (item, idx) => `
### Item ${idx + 1}: ${item.item.title}
- **Status**: ${item.analysis.status}
- **Risco**: ${item.analysis.risk_level}
- **Achados**: ${item.analysis.findings}
- **Recomendações**: ${item.analysis.recommendations.join("; ")}
`
    )
    .join("\n");

  const userPrompt = `Gere um laudo técnico completo para a seguinte inspeção:

**Título**: ${inspectionData.title}
**Local**: ${inspectionData.location}
**Cliente**: ${inspectionData.client}
${inspectionData.unit ? `**Unidade**: ${inspectionData.unit}` : ""}
**Sistema**: ${inspectionData.system}

**Itens Inspecionados**:
${itemsSummary}

Estruture o laudo com:
1. Cabeçalho (dados da inspeção)
2. Objetivo
3. Metodologia
4. Resultados (item por item)
5. Conclusões
6. Recomendações
7. Assinatura (espaço para assinatura digital)

Retorne HTML bem formatado.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const reportContent = response.choices[0].message.content;
    if (!reportContent) {
      throw new Error("Resposta vazia da API de IA");
    }

    const reportHTML = typeof reportContent === "string" ? reportContent : JSON.stringify(reportContent);
    return reportHTML;
  } catch (error) {
    console.error("[OPERIS AI] Erro na geração de laudo:", error);
    throw new Error(`Falha na geração de laudo: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * OPERIS AI Service — Camada Centralizada de Inteligência Artificial
 * Versão: 2.0 | Stack: Anthropic Claude (Haiku/Sonnet) via invokeLLM
 *
 * Responsabilidades:
 *  - Análise de imagens de inspeção (baixo custo — Claude Haiku)
 *  - Geração de laudos técnicos HTML
 *  - Busca semântica na base de conhecimento
 *  - Cache de respostas para redução de custo
 *  - Prompt-builder centralizado
 */
import { invokeLLM, type Message } from "../_core/llm";
import { classifyEquipment, assessRiskFromText, CO2_COMPANY, type RiskLevel } from "../core/engine";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ImageAnalysisResult {
  status: "conforme" | "nao_conforme" | "necessita_revisao";
  risk_level: RiskLevel;
  observations: string;
  recommendations: string[];
  confidence: number;
  analyzed_at: string;
}

export interface InspectionItem {
  id: string;
  title: string;
  description: string;
  system: string;
  norm_reference: string;
  analysis?: ImageAnalysisResult;
}

export interface LaudoGenerationInput {
  inspectionId: number;
  inspectionDate: string;
  systemType: string;
  location: string;
  items: InspectionItem[];
  technicianName?: string;
  technicianCrea?: string;
  companyName?: string;
  signatureUrl?: string;
  riskSummary?: string;
  globalRisk?: RiskLevel;
}

// ─── Cache em Memória (TTL 5 min) ────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const analysisCache = new Map<string, CacheEntry<ImageAnalysisResult>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

function getCached<T>(key: string, cache: Map<string, CacheEntry<T>>): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached<T>(key: string, value: T, cache: Map<string, CacheEntry<T>>): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildInspectionSystemPrompt(item: InspectionItem): string {
  return `Você é um engenheiro de segurança contra incêndio certificado (CREA/MG).
Analise a imagem do item de inspeção e retorne APENAS um JSON válido, sem texto adicional.

Item: ${item.title}
Sistema: ${item.system}
Norma: ${item.norm_reference}
Descrição: ${item.description}

Retorne exatamente este JSON:
{
  "status": "conforme" | "nao_conforme" | "necessita_revisao",
  "risk_level": "R1" | "R2" | "R3" | "R4" | "R5",
  "observations": "descrição técnica objetiva em português",
  "recommendations": ["ação 1", "ação 2"],
  "confidence": 0.0-1.0
}

Critérios de risco:
R1 = Conforme, sem ação necessária
R2 = Atenção, monitorar
R3 = Necessita revisão em 30 dias
R4 = Não conforme, ação imediata
R5 = Crítico, interdição recomendada`;
}

function buildLaudoPrompt(input: LaudoGenerationInput): string {
  const classification = classifyEquipment(input.systemType);
  const conformItems = input.items.filter(i => i.analysis?.status === "conforme").length;
  const nonConformItems = input.items.filter(i => i.analysis?.status === "nao_conforme").length;
  const reviewItems = input.items.filter(i => i.analysis?.status === "necessita_revisao").length;

  return `Gere um laudo técnico de inspeção de segurança contra incêndio em HTML semântico.

DADOS DA INSPEÇÃO:
- ID: #${input.inspectionId}
- Data: ${input.inspectionDate}
- Sistema: ${input.systemType} (${classification.description})
- Norma: ${classification.norm}
- Local: ${input.location}
- Risco Global: ${input.globalRisk ?? "R1"}
- Conformes: ${conformItems} | Não Conformes: ${nonConformItems} | Revisão: ${reviewItems}

ITENS ANALISADOS:
${input.items.map(item => `
- ${item.title} (${item.system}):
  Status: ${item.analysis?.status ?? "não analisado"}
  Risco: ${item.analysis?.risk_level ?? "N/A"}
  Observações: ${item.analysis?.observations ?? "—"}
  Recomendações: ${item.analysis?.recommendations?.join("; ") ?? "—"}
`).join("")}

RESPONSÁVEL TÉCNICO:
- Engenheiro: ${input.technicianName ?? CO2_COMPANY.engineer}
- CREA: ${input.technicianCrea ?? CO2_COMPANY.crea}
- Empresa: ${input.companyName ?? CO2_COMPANY.name}

Gere HTML profissional com:
1. Cabeçalho com logo textual CO₂ Contra Incêndio e dados da empresa
2. Resumo executivo com risco global destacado
3. Tabela de itens inspecionados com status colorido
4. Seção de não conformidades e recomendações
5. Assinatura digital do responsável técnico
6. Rodapé com normas aplicáveis e disclaimer legal

Use apenas HTML inline styles. Paleta: fundo branco, texto #111, vermelho #C8102E para alertas.`;
}

// ─── Análise de Imagens ──────────────────────────────────────────────────────

export async function analyzeInspectionImages(
  item: InspectionItem,
  imageUrls: string[]
): Promise<ImageAnalysisResult> {
  if (!imageUrls || imageUrls.length === 0) {
    return buildFallbackAnalysis(item);
  }

  // Limitar a 3 imagens para controle de custo
  const limitedUrls = imageUrls.slice(0, 3);
  const cacheKey = `${item.id}:${limitedUrls.join(",")}`;

  const cached = getCached(cacheKey, analysisCache);
  if (cached) return cached;

  try {
    const imageContent = limitedUrls.map(url => ({
      type: "image_url" as const,
      image_url: { url, detail: "low" as const },
    }));

    const response = await invokeLLM({
      messages: [
        { role: "system", content: buildInspectionSystemPrompt(item) },
        {
          role: "user",
          content: [
            ...imageContent,
            { type: "text" as const, text: `Analise ${limitedUrls.length} imagem(ns) do item: ${item.title}` },
          ],
        },
      ],
    });

    const rawMsg = response.choices[0]?.message?.content;
    const content = typeof rawMsg === "string" ? rawMsg : "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Resposta sem JSON válido");

    const parsed = JSON.parse(jsonMatch[0]) as Partial<ImageAnalysisResult>;

    // Validar campos obrigatórios
    if (!parsed.status || !parsed.risk_level || !parsed.observations) {
      throw new Error("JSON incompleto");
    }

    const result: ImageAnalysisResult = {
      status: parsed.status,
      risk_level: parsed.risk_level,
      observations: parsed.observations,
      recommendations: parsed.recommendations ?? [],
      confidence: parsed.confidence ?? 0.8,
      analyzed_at: new Date().toISOString(),
    };

    setCached(cacheKey, result, analysisCache);
    return result;
  } catch {
    return buildFallbackAnalysis(item);
  }
}

function buildFallbackAnalysis(item: InspectionItem): ImageAnalysisResult {
  const riskFromText = assessRiskFromText(item.description);
  return {
    status: "necessita_revisao",
    risk_level: riskFromText,
    observations: `Análise automática indisponível para "${item.title}". Revisão manual necessária.`,
    recommendations: [
      "Realizar inspeção visual presencial",
      "Verificar conformidade com " + item.norm_reference,
      "Documentar estado atual com fotografias",
    ],
    confidence: 0.3,
    analyzed_at: new Date().toISOString(),
  };
}

// ─── Geração de Laudo HTML ───────────────────────────────────────────────────

export async function generateTechnicalReport(input: LaudoGenerationInput): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um engenheiro de segurança contra incêndio. Gere laudos técnicos em HTML profissional.",
        },
        {
          role: "user",
          content: buildLaudoPrompt(input),
        },
      ],
    });

    const rawHtml = response.choices[0]?.message?.content;
    const html = typeof rawHtml === "string" ? rawHtml : "";
    if (!html.includes("<")) {
      throw new Error("Resposta sem HTML válido");
    }
    return html;
  } catch {
    return buildFallbackLaudo(input);
  }
}

function buildFallbackLaudo(input: LaudoGenerationInput): string {
  const classification = classifyEquipment(input.systemType);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Laudo #${input.inspectionId}</title></head>
<body style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:2rem;color:#111">
  <div style="border-top:4px solid #C8102E;padding-top:1rem;margin-bottom:2rem">
    <h1 style="font-size:1.5rem;font-weight:700;color:#111">CO₂ Contra Incêndio</h1>
    <p style="color:#666;font-size:0.875rem">${CO2_COMPANY.city} | ${CO2_COMPANY.crea} | ${CO2_COMPANY.ul}</p>
  </div>
  <h2 style="color:#C8102E;font-size:1.25rem">Laudo de Inspeção #${input.inspectionId}</h2>
  <table style="width:100%;border-collapse:collapse;margin:1rem 0">
    <tr><td style="padding:0.5rem;border:1px solid #ddd;font-weight:600">Data</td><td style="padding:0.5rem;border:1px solid #ddd">${input.inspectionDate}</td></tr>
    <tr><td style="padding:0.5rem;border:1px solid #ddd;font-weight:600">Sistema</td><td style="padding:0.5rem;border:1px solid #ddd">${input.systemType} — ${classification.description}</td></tr>
    <tr><td style="padding:0.5rem;border:1px solid #ddd;font-weight:600">Norma</td><td style="padding:0.5rem;border:1px solid #ddd">${classification.norm}</td></tr>
    <tr><td style="padding:0.5rem;border:1px solid #ddd;font-weight:600">Local</td><td style="padding:0.5rem;border:1px solid #ddd">${input.location}</td></tr>
    <tr><td style="padding:0.5rem;border:1px solid #ddd;font-weight:600">Risco Global</td><td style="padding:0.5rem;border:1px solid #ddd;color:#C8102E;font-weight:700">${input.globalRisk ?? "R1"}</td></tr>
  </table>
  <h3 style="margin-top:1.5rem">Itens Inspecionados</h3>
  ${input.items.map(item => `
  <div style="border:1px solid #ddd;padding:1rem;margin:0.5rem 0;border-radius:4px">
    <strong>${item.title}</strong> — ${item.system}<br>
    <span style="color:#666;font-size:0.875rem">${item.analysis?.observations ?? "Sem análise registrada"}</span>
  </div>`).join("")}
  <div style="margin-top:2rem;border-top:1px solid #ddd;padding-top:1rem;font-size:0.875rem;color:#666">
    <p>Responsável: ${input.technicianName ?? CO2_COMPANY.engineer} | ${input.technicianCrea ?? CO2_COMPANY.crea}</p>
    <p>Empresa: ${input.companyName ?? CO2_COMPANY.name}</p>
  </div>
</body>
</html>`;
}

// ─── Busca Semântica Simplificada ────────────────────────────────────────────

export interface SemanticSearchResult {
  title: string;
  content: string;
  relevance: number;
  module: string;
}

export async function semanticSearch(
  query: string,
  context: Array<{ title: string; content: string; module: string }>
): Promise<SemanticSearchResult[]> {
  if (!query.trim() || context.length === 0) return [];

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente de busca técnica para sistemas de segurança contra incêndio.
Dado uma consulta e uma lista de documentos, retorne os 5 mais relevantes em JSON.
Formato: [{"index": 0, "relevance": 0.95}, ...]`,
        },
        {
          role: "user",
          content: `Consulta: "${query}"\n\nDocumentos:\n${context.slice(0, 20).map((d, i) => `[${i}] ${d.title}: ${d.content.substring(0, 200)}`).join("\n")}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "search_results",
          strict: true,
          schema: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    index: { type: "integer" },
                    relevance: { type: "number" },
                  },
                  required: ["index", "relevance"],
                  additionalProperties: false,
                },
              },
            },
            required: ["results"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : "{}";
    const parsed = JSON.parse(content) as { results: Array<{ index: number; relevance: number }> };

    return parsed.results
      .filter(r => r.index >= 0 && r.index < context.length)
      .map(r => ({
        ...context[r.index],
        relevance: r.relevance,
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  } catch {
    // Fallback: busca por palavras-chave
    const queryWords = query.toLowerCase().split(/\s+/);
    return context
      .map(doc => {
        const text = `${doc.title} ${doc.content}`.toLowerCase();
        const matches = queryWords.filter(w => text.includes(w)).length;
        return { ...doc, relevance: matches / queryWords.length };
      })
      .filter(r => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }
}

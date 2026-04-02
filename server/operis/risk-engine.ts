/**
 * OPERIS Risk Engine
 * Motor de risco híbrido: regras determinísticas + análise de IA
 * Portado do OPERIS IA (FastAPI) para TypeScript
 */

import type { ImageAnalysisResult } from "./ai-service";

export type RiskLevel = "R1" | "R2" | "R3" | "R4" | "R5";

export interface RiskCalculationResult {
  global_risk: RiskLevel;
  risk_by_system: Record<string, RiskLevel>;
  critical_items: Array<{
    item_id: string;
    item_title: string;
    risk: RiskLevel;
    reason: string;
  }>;
  summary: string;
}

/**
 * Calcula o risco global da inspeção baseado nas análises dos itens
 * @param analyses Resultados das análises de cada item
 * @returns Cálculo de risco com nível global, por sistema e itens críticos
 */
export function calculateInspectionRisk(
  analyses: Array<{
    item_id: string;
    item_title: string;
    system: string;
    analysis: ImageAnalysisResult;
  }>
): RiskCalculationResult {
  // Agrupar análises por sistema
  const riskBySystem: Record<string, RiskLevel[]> = {};
  const criticalItems: RiskCalculationResult["critical_items"] = [];

  for (const { item_id, item_title, system, analysis } of analyses) {
    if (!riskBySystem[system]) {
      riskBySystem[system] = [];
    }
    riskBySystem[system].push(analysis.risk_level);

    // Identificar itens críticos (R4 ou R5)
    if (analysis.risk_level === "R4" || analysis.risk_level === "R5") {
      criticalItems.push({
        item_id,
        item_title,
        risk: analysis.risk_level,
        reason: analysis.findings,
      });
    }
  }

  // Calcular risco máximo por sistema
  const riskBySystemMax: Record<string, RiskLevel> = {};
  for (const [system, risks] of Object.entries(riskBySystem)) {
    riskBySystemMax[system] = getMaxRisk(risks);
  }

  // Risco global é o máximo entre todos os sistemas
  const globalRisk = getMaxRisk(Object.values(riskBySystemMax));

  // Gerar resumo
  const summary = generateRiskSummary(globalRisk, criticalItems.length, Object.keys(riskBySystemMax).length);

  return {
    global_risk: globalRisk,
    risk_by_system: riskBySystemMax,
    critical_items: criticalItems,
    summary,
  };
}

/**
 * Retorna o maior nível de risco de uma lista
 */
function getMaxRisk(risks: RiskLevel[]): RiskLevel {
  const riskOrder: Record<RiskLevel, number> = {
    R1: 1,
    R2: 2,
    R3: 3,
    R4: 4,
    R5: 5,
  };

  let maxRisk: RiskLevel = "R1";
  let maxValue = 1;

  for (const risk of risks) {
    if (riskOrder[risk] > maxValue) {
      maxValue = riskOrder[risk];
      maxRisk = risk;
    }
  }

  return maxRisk;
}

/**
 * Gera um resumo textual do risco calculado
 */
function generateRiskSummary(globalRisk: RiskLevel, criticalCount: number, systemCount: number): string {
  const riskDescriptions: Record<RiskLevel, string> = {
    R1: "Risco baixo — sistema em conformidade geral",
    R2: "Risco baixo-moderado — pequenas não-conformidades identificadas",
    R3: "Risco moderado — não-conformidades que requerem atenção",
    R4: "Risco alto — não-conformidades graves que requerem ação imediata",
    R5: "Risco crítico — não-conformidades que representam perigo iminente",
  };

  let summary = `Risco global: ${globalRisk} (${riskDescriptions[globalRisk]}). `;
  summary += `${systemCount} sistema(s) inspecionado(s). `;

  if (criticalCount > 0) {
    summary += `⚠️ ${criticalCount} item(ns) crítico(s) identificado(s) que requerem ação imediata.`;
  } else {
    summary += `Nenhum item crítico identificado.`;
  }

  return summary;
}

/**
 * Aplica regras determinísticas de risco baseadas em palavras-chave
 * (Fallback quando IA não está disponível ou para validação cruzada)
 */
export function applyRuleBasedRisk(text: string): RiskLevel {
  const lowerText = text.toLowerCase();

  // R5 — Crítico
  if (
    lowerText.includes("não funciona") ||
    lowerText.includes("ausente") ||
    lowerText.includes("inoperante") ||
    lowerText.includes("vazamento") ||
    lowerText.includes("perigo iminente")
  ) {
    return "R5";
  }

  // R4 — Alto
  if (
    lowerText.includes("furado") ||
    lowerText.includes("danificado") ||
    lowerText.includes("corrosão severa") ||
    lowerText.includes("obstruído") ||
    lowerText.includes("vencido")
  ) {
    return "R4";
  }

  // R3 — Moderado
  if (
    lowerText.includes("sujo") ||
    lowerText.includes("desgastado") ||
    lowerText.includes("oxidação") ||
    lowerText.includes("falta de manutenção") ||
    lowerText.includes("necessita revisão")
  ) {
    return "R3";
  }

  // R2 — Baixo-moderado
  if (
    lowerText.includes("pequeno desgaste") ||
    lowerText.includes("leve sujeira") ||
    lowerText.includes("atenção")
  ) {
    return "R2";
  }

  // R1 — Baixo (padrão)
  return "R1";
}

/**
 * OPERIS IA — Inspection Agent
 * Agente especializado em análise de vistorias e geração de laudos
 * Orquestra: provider → prompts → cost-control → output
 */
import { invokeAI, assessRisk } from "../provider";
import { PROMPTS } from "../prompts/normative-prompts";
import { checkBudget, recordUsage, type PlanTier } from "../governance/cost-control";

interface InspectionContext {
  companyId: number;
  plan: PlanTier;
  inspectionType: "fire_system" | "property" | "predial";
  sections?: string[];
  nonConformities?: string[];
  propertyData?: Record<string, string>;
  findings?: string[];
}

interface AgentResult {
  report: string;
  riskLevel: string;
  riskScore: number;
  recommendations: string[];
  tokensUsed: number;
  latencyMs: number;
}

export async function runInspectionAgent(ctx: InspectionContext): Promise<AgentResult> {
  // 1. Budget check
  const budget = checkBudget(ctx.companyId, ctx.plan);
  if (!budget.allowed) {
    throw new Error(`[InspectionAgent] Budget exceeded: ${budget.reason}`);
  }

  const start = Date.now();
  let totalTokens = 0;

  // 2. Generate report based on inspection type
  let reportPrompt: { system: string; user: string };
  if (ctx.inspectionType === "fire_system") {
    reportPrompt = PROMPTS.fireSystemAnalysis(
      ctx.sections ?? [],
      ctx.nonConformities ?? []
    );
  } else if (ctx.inspectionType === "property") {
    reportPrompt = PROMPTS.propertyInspectionReport(
      ctx.propertyData ?? {},
      ctx.findings ?? []
    );
  } else {
    reportPrompt = PROMPTS.propertyInspectionReport(
      ctx.propertyData ?? {},
      ctx.findings ?? []
    );
  }

  const reportRes = await invokeAI({
    task: "generate_report",
    messages: [
      { role: "system", content: reportPrompt.system },
      { role: "user", content: reportPrompt.user },
    ],
    tier: "premium",
  });
  totalTokens += reportRes.tokensUsed;

  // 3. Risk assessment
  const nonConformities = ctx.nonConformities ?? ctx.findings ?? [];
  const riskContext = `Tipo: ${ctx.inspectionType} | Empresa ID: ${ctx.companyId}`;
  const riskResult = nonConformities.length > 0
    ? await assessRisk(nonConformities, riskContext)
    : { level: "R1", justification: "Sem não conformidades identificadas.", recommendations: [] };
  totalTokens += 200; // estimate

  // 4. Record usage
  recordUsage(ctx.companyId, totalTokens);

  return {
    report: reportRes.content,
    riskLevel: riskResult.level,
    riskScore: parseInt(riskResult.level.replace("R", "")) * 20,
    recommendations: riskResult.recommendations,
    tokensUsed: totalTokens,
    latencyMs: Date.now() - start,
  };
}

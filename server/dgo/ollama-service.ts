/**
 * ─── Ollama Service — Gerenciamento de Múltiplas IAs Open Source ─────────────
 * JULY AOG | OPERIS IA — Soberania de Modelos
 *
 * Suporte: Gemma 2, Llama 3, Mistral, DeepSeek R1, Phi-3, Qwen 2, CodeLlama
 * Comunicação: HTTP REST com a API local do Ollama (porta 11434)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from "axios";

const OLLAMA_BASE = process.env.OLLAMA_HOST ?? "http://localhost:11434";
const TIMEOUT = 15_000;

// ─── Catálogo de modelos conhecidos ──────────────────────────────────────────
export const MODEL_CATALOG: Record<string, {
  displayName: string;
  description: string;
  category: "reasoning" | "coding" | "general" | "embedding" | "vision";
  paramsBillion: number;
  ramRequiredGB: number;
  strengths: string[];
  icon: string;
}> = {
  "gemma2":         { displayName: "Gemma 2 (9B)", description: "Google DeepMind — Excelente para raciocínio e análise técnica", category: "reasoning", paramsBillion: 9, ramRequiredGB: 8, strengths: ["Raciocínio", "Análise", "Português"], icon: "🔷" },
  "gemma2:9b":      { displayName: "Gemma 2 9B", description: "Google DeepMind — Versão 9B otimizada", category: "reasoning", paramsBillion: 9, ramRequiredGB: 8, strengths: ["Raciocínio", "Análise"], icon: "🔷" },
  "gemma2:27b":     { displayName: "Gemma 2 27B", description: "Google DeepMind — Versão 27B de alta precisão", category: "reasoning", paramsBillion: 27, ramRequiredGB: 20, strengths: ["Raciocínio Avançado", "Análise Complexa"], icon: "🔷" },
  "llama3":         { displayName: "Llama 3 (8B)", description: "Meta — Modelo versátil de alta performance", category: "general", paramsBillion: 8, ramRequiredGB: 6, strengths: ["Versatilidade", "Velocidade", "Instrução"], icon: "🦙" },
  "llama3:8b":      { displayName: "Llama 3 8B", description: "Meta — 8B parâmetros, rápido e eficiente", category: "general", paramsBillion: 8, ramRequiredGB: 6, strengths: ["Velocidade", "Eficiência"], icon: "🦙" },
  "llama3:70b":     { displayName: "Llama 3 70B", description: "Meta — 70B parâmetros, qualidade máxima", category: "general", paramsBillion: 70, ramRequiredGB: 48, strengths: ["Qualidade", "Precisão"], icon: "🦙" },
  "llama3.1":       { displayName: "Llama 3.1 (8B)", description: "Meta — Versão 3.1 com melhorias de contexto", category: "general", paramsBillion: 8, ramRequiredGB: 6, strengths: ["Contexto Longo", "Instrução"], icon: "🦙" },
  "llama3.2":       { displayName: "Llama 3.2 (3B)", description: "Meta — Versão compacta e ultra-rápida", category: "general", paramsBillion: 3, ramRequiredGB: 3, strengths: ["Ultra-rápido", "Baixo consumo"], icon: "🦙" },
  "mistral":        { displayName: "Mistral 7B", description: "Mistral AI — Excelente custo-benefício", category: "general", paramsBillion: 7, ramRequiredGB: 6, strengths: ["Eficiência", "Multilíngue", "Código"], icon: "💨" },
  "mistral:7b":     { displayName: "Mistral 7B", description: "Mistral AI — 7B parâmetros", category: "general", paramsBillion: 7, ramRequiredGB: 6, strengths: ["Eficiência", "Código"], icon: "💨" },
  "mistral-nemo":   { displayName: "Mistral Nemo 12B", description: "Mistral AI — 12B com contexto de 128k tokens", category: "general", paramsBillion: 12, ramRequiredGB: 10, strengths: ["Contexto Longo", "Multilíngue"], icon: "💨" },
  "deepseek-r1":    { displayName: "DeepSeek R1 (7B)", description: "DeepSeek — Raciocínio cadeia-de-pensamento", category: "reasoning", paramsBillion: 7, ramRequiredGB: 6, strengths: ["Raciocínio", "Matemática", "Código"], icon: "🔬" },
  "deepseek-r1:7b": { displayName: "DeepSeek R1 7B", description: "DeepSeek — Chain-of-thought avançado", category: "reasoning", paramsBillion: 7, ramRequiredGB: 6, strengths: ["Raciocínio Lógico", "Matemática"], icon: "🔬" },
  "deepseek-r1:14b":{ displayName: "DeepSeek R1 14B", description: "DeepSeek — 14B com raciocínio superior", category: "reasoning", paramsBillion: 14, ramRequiredGB: 12, strengths: ["Raciocínio Avançado", "Análise"], icon: "🔬" },
  "phi3":           { displayName: "Phi-3 Mini (3.8B)", description: "Microsoft — Compacto e surpreendentemente capaz", category: "general", paramsBillion: 3.8, ramRequiredGB: 4, strengths: ["Baixo consumo", "Raciocínio", "Código"], icon: "Φ" },
  "phi3:mini":      { displayName: "Phi-3 Mini", description: "Microsoft — Versão mini otimizada", category: "general", paramsBillion: 3.8, ramRequiredGB: 4, strengths: ["Eficiência", "Código"], icon: "Φ" },
  "phi3:medium":    { displayName: "Phi-3 Medium (14B)", description: "Microsoft — Versão média de alta qualidade", category: "general", paramsBillion: 14, ramRequiredGB: 12, strengths: ["Qualidade", "Raciocínio"], icon: "Φ" },
  "qwen2":          { displayName: "Qwen 2 (7B)", description: "Alibaba — Excelente para multilíngue e código", category: "coding", paramsBillion: 7, ramRequiredGB: 6, strengths: ["Multilíngue", "Código", "Matemática"], icon: "🌐" },
  "qwen2:7b":       { displayName: "Qwen 2 7B", description: "Alibaba — 7B multilíngue", category: "coding", paramsBillion: 7, ramRequiredGB: 6, strengths: ["Multilíngue", "Código"], icon: "🌐" },
  "qwen2.5":        { displayName: "Qwen 2.5 (7B)", description: "Alibaba — Versão 2.5 com melhorias", category: "coding", paramsBillion: 7, ramRequiredGB: 6, strengths: ["Código", "Análise", "Multilíngue"], icon: "🌐" },
  "codellama":      { displayName: "CodeLlama (7B)", description: "Meta — Especialista em código e programação", category: "coding", paramsBillion: 7, ramRequiredGB: 6, strengths: ["Código", "Debug", "Completação"], icon: "💻" },
  "codellama:7b":   { displayName: "CodeLlama 7B", description: "Meta — 7B especializado em código", category: "coding", paramsBillion: 7, ramRequiredGB: 6, strengths: ["Código", "Programação"], icon: "💻" },
  "codellama:13b":  { displayName: "CodeLlama 13B", description: "Meta — 13B para código complexo", category: "coding", paramsBillion: 13, ramRequiredGB: 10, strengths: ["Código Avançado", "Arquitetura"], icon: "💻" },
  "nomic-embed-text":  { displayName: "Nomic Embed Text", description: "Embedding de texto de alta qualidade", category: "embedding", paramsBillion: 0.137, ramRequiredGB: 1, strengths: ["Embeddings", "Busca Semântica"], icon: "🔗" },
  "mxbai-embed-large": { displayName: "MxBai Embed Large", description: "Embedding de alta dimensão para RAG", category: "embedding", paramsBillion: 0.335, ramRequiredGB: 1, strengths: ["RAG", "Embeddings", "Busca"], icon: "🔗" },
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface OllamaModel {
  name: string;
  displayName: string;
  description: string;
  category: string;
  paramsBillion: number;
  ramRequiredGB: number;
  strengths: string[];
  icon: string;
  sizeMB: number;
  modifiedAt: string;
  digest: string;
  isRunning: boolean;
}

export interface OllamaStatus {
  online: boolean;
  version: string;
  host: string;
  modelsLoaded: number;
  totalModels: number;
  checkedAt: string;
}

export interface RunningModel {
  model: string | null;
  displayName: string | null;
  expiresAt: string | null;
  sizeVRAM: number;
  available: boolean;
}

// ─── Status do serviço Ollama ─────────────────────────────────────────────────
export async function getOllamaStatus(): Promise<OllamaStatus> {
  try {
    const [versionRes, modelsRes, psRes] = await Promise.allSettled([
      axios.get(`${OLLAMA_BASE}/api/version`, { timeout: TIMEOUT }),
      axios.get(`${OLLAMA_BASE}/api/tags`, { timeout: TIMEOUT }),
      axios.get(`${OLLAMA_BASE}/api/ps`, { timeout: TIMEOUT }),
    ]);

    const version = versionRes.status === "fulfilled"
      ? versionRes.value.data?.version ?? "unknown"
      : "offline";

    const totalModels = modelsRes.status === "fulfilled"
      ? (modelsRes.value.data?.models ?? []).length
      : 0;

    const modelsLoaded = psRes.status === "fulfilled"
      ? (psRes.value.data?.models ?? []).length
      : 0;

    return {
      online: versionRes.status === "fulfilled",
      version,
      host: OLLAMA_BASE,
      modelsLoaded,
      totalModels,
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return {
      online: false,
      version: "offline",
      host: OLLAMA_BASE,
      modelsLoaded: 0,
      totalModels: 0,
      checkedAt: new Date().toISOString(),
    };
  }
}

// ─── Listar modelos instalados ────────────────────────────────────────────────
export async function listOllamaModels(): Promise<OllamaModel[]> {
  const [tagsRes, psRes] = await Promise.allSettled([
    axios.get(`${OLLAMA_BASE}/api/tags`, { timeout: TIMEOUT }),
    axios.get(`${OLLAMA_BASE}/api/ps`, { timeout: TIMEOUT }),
  ]);

  if (tagsRes.status === "rejected") throw tagsRes.reason;

  const runningNames = new Set<string>(
    psRes.status === "fulfilled"
      ? (psRes.value.data?.models ?? []).map((m: any) => m.name)
      : []
  );

  const models: any[] = tagsRes.value.data?.models ?? [];

  return models.map((m: any) => {
    const baseName = m.name?.split(":")[0] ?? m.name;
    const catalog = MODEL_CATALOG[m.name] ?? MODEL_CATALOG[baseName] ?? null;

    return {
      name: m.name,
      displayName: catalog?.displayName ?? m.name,
      description: catalog?.description ?? "Modelo Ollama",
      category: catalog?.category ?? "general",
      paramsBillion: catalog?.paramsBillion ?? 0,
      ramRequiredGB: catalog?.ramRequiredGB ?? 0,
      strengths: catalog?.strengths ?? [],
      icon: catalog?.icon ?? "🤖",
      sizeMB: Math.round((m.size ?? 0) / 1024 / 1024),
      modifiedAt: m.modified_at ?? new Date().toISOString(),
      digest: m.digest?.slice(0, 12) ?? "",
      isRunning: runningNames.has(m.name),
    };
  });
}

// ─── Modelo atualmente em execução ───────────────────────────────────────────
export async function getOllamaRunningModel(): Promise<RunningModel> {
  try {
    const res = await axios.get(`${OLLAMA_BASE}/api/ps`, { timeout: TIMEOUT });
    const models: any[] = res.data?.models ?? [];

    if (models.length === 0) {
      return { model: null, displayName: null, expiresAt: null, sizeVRAM: 0, available: true };
    }

    const first = models[0];
    const catalog = MODEL_CATALOG[first.name] ?? MODEL_CATALOG[first.name?.split(":")[0]] ?? null;

    return {
      model: first.name,
      displayName: catalog?.displayName ?? first.name,
      expiresAt: first.expires_at ?? null,
      sizeVRAM: Math.round((first.size_vram ?? 0) / 1024 / 1024),
      available: true,
    };
  } catch {
    return { model: null, displayName: null, expiresAt: null, sizeVRAM: 0, available: false };
  }
}

// ─── Trocar modelo ativo ──────────────────────────────────────────────────────
export async function switchOllamaModel(
  modelName: string
): Promise<{ previousModel: string | null; newModel: string; startedAt: string }> {
  // Obter modelo atual
  const current = await getOllamaRunningModel();

  // Enviar prompt vazio para "aquecer" o modelo (carrega na VRAM)
  await axios.post(
    `${OLLAMA_BASE}/api/generate`,
    {
      model: modelName,
      prompt: "",
      stream: false,
      keep_alive: "24h",
    },
    { timeout: 60_000 }
  );

  return {
    previousModel: current.model,
    newModel: modelName,
    startedAt: new Date().toISOString(),
  };
}

// ─── Pull de novo modelo ──────────────────────────────────────────────────────
export async function pullOllamaModel(
  modelName: string
): Promise<{ model: string; status: string; startedAt: string }> {
  // Inicia o pull (não aguarda conclusão — pode demorar horas)
  axios.post(
    `${OLLAMA_BASE}/api/pull`,
    { name: modelName, stream: false },
    { timeout: 300_000 }
  ).catch(() => {}); // fire-and-forget

  return {
    model: modelName,
    status: "pulling",
    startedAt: new Date().toISOString(),
  };
}

// ─── Deletar modelo ───────────────────────────────────────────────────────────
export async function deleteOllamaModel(modelName: string): Promise<void> {
  await axios.delete(`${OLLAMA_BASE}/api/delete`, {
    data: { name: modelName },
    timeout: TIMEOUT,
  });
}

// ─── Executar prompt em um modelo específico (para pipelines) ─────────────────
export async function runOllamaPrompt(
  modelName: string,
  prompt: string,
  systemPrompt?: string,
  timeoutMs: number = 120_000
): Promise<{
  model: string;
  response: string;
  durationMs: number;
  tokensPerSecond: number;
  promptTokens: number;
  responseTokens: number;
}> {
  const start = Date.now();

  const res = await axios.post(
    `${OLLAMA_BASE}/api/generate`,
    {
      model: modelName,
      prompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 2048,
      },
    },
    { timeout: timeoutMs }
  );

  const durationMs = Date.now() - start;
  const data = res.data;

  return {
    model: modelName,
    response: data.response ?? "",
    durationMs,
    tokensPerSecond: data.eval_count
      ? Math.round((data.eval_count / (data.eval_duration / 1e9)) * 10) / 10
      : 0,
    promptTokens: data.prompt_eval_count ?? 0,
    responseTokens: data.eval_count ?? 0,
  };
}

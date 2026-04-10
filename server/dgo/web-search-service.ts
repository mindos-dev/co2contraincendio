/**
 * ─── Web Search Service — Busca Web com Resumo por IA Local ─────────────────
 * JULY AOG | OPERIS Command Center
 *
 * Integra com Brave Search API (gratuita) ou Serper/Tavily.
 * Filtra resultados para documentações técnicas e normas de engenharia.
 * Processa resultados com Gemma 2 (Ollama local) para resumo cirúrgico.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from "axios";

const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY ?? "";
const SERPER_API_KEY = process.env.SERPER_API_KEY ?? "";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY ?? "";
const OLLAMA_BASE = process.env.OLLAMA_HOST ?? "http://localhost:11434";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  relevanceScore: number;
  category: "documentation" | "norm" | "article" | "forum" | "other";
  publishedDate?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  aiSummary: string | null;
  aiModel: string | null;
  totalResults: number;
  searchDurationMs: number;
  summaryDurationMs: number | null;
  provider: "brave" | "serper" | "tavily" | "fallback";
  filteredBy: string;
  timestamp: string;
}

// ─── Domínios prioritários (documentações técnicas e normas) ──────────────────
const PRIORITY_DOMAINS = [
  // Documentação de tecnologia
  "react.dev", "trpc.io", "drizzle.dev", "tailwindcss.com",
  "typescriptlang.org", "nodejs.org", "docker.com", "docs.docker.com",
  "ollama.com", "ollama.ai", "github.com", "npmjs.com",
  "tanstack.com", "wouter.me", "zod.dev", "vite.dev",
  // Normas de engenharia
  "abnt.org.br", "nfpa.org", "ul.com", "fm-global.com",
  "cbmerj.rj.gov.br", "bombeiros.mg.gov.br",
  // Referências técnicas
  "mdn.web.docs", "developer.mozilla.org", "stackoverflow.com",
  "medium.com", "dev.to", "blog.cloudflare.com",
];

// Palavras-chave que aumentam relevância
const TECH_KEYWORDS = [
  "react", "trpc", "typescript", "docker", "ollama", "tailwind",
  "drizzle", "postgresql", "mysql", "nodejs", "vite", "api",
  "nbr", "nfpa", "abnt", "incêndio", "supressão", "sprinkler",
  "co2", "saponificante", "hidrante", "alarme", "detecção",
];

// ─── Busca via Brave Search API ───────────────────────────────────────────────
async function searchBrave(query: string, count = 10): Promise<SearchResult[]> {
  const res = await axios.get("https://api.search.brave.com/res/v1/web/search", {
    headers: {
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": BRAVE_API_KEY,
    },
    params: { q: query, count, search_lang: "pt", country: "BR", safesearch: "moderate" },
    timeout: 15_000,
  });

  const webResults = res.data?.web?.results ?? [];
  return webResults.map((r: any) => classifyResult({
    title: r.title ?? "",
    url: r.url ?? "",
    snippet: r.description ?? "",
    domain: extractDomain(r.url ?? ""),
    publishedDate: r.age,
  }));
}

// ─── Busca via Serper API ─────────────────────────────────────────────────────
async function searchSerper(query: string, count = 10): Promise<SearchResult[]> {
  const res = await axios.post("https://google.serper.dev/search", {
    q: query,
    gl: "br",
    hl: "pt",
    num: count,
  }, {
    headers: {
      "X-API-KEY": SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    timeout: 15_000,
  });

  const organic = res.data?.organic ?? [];
  return organic.map((r: any) => classifyResult({
    title: r.title ?? "",
    url: r.link ?? "",
    snippet: r.snippet ?? "",
    domain: extractDomain(r.link ?? ""),
    publishedDate: r.date,
  }));
}

// ─── Busca via Tavily API ─────────────────────────────────────────────────────
async function searchTavily(query: string, count = 10): Promise<SearchResult[]> {
  const res = await axios.post("https://api.tavily.com/search", {
    api_key: TAVILY_API_KEY,
    query,
    search_depth: "advanced",
    max_results: count,
    include_domains: [],
    exclude_domains: ["pinterest.com", "instagram.com", "tiktok.com"],
  }, {
    timeout: 20_000,
  });

  const results = res.data?.results ?? [];
  return results.map((r: any) => classifyResult({
    title: r.title ?? "",
    url: r.url ?? "",
    snippet: r.content?.slice(0, 300) ?? "",
    domain: extractDomain(r.url ?? ""),
    publishedDate: r.published_date,
  }));
}

// ─── Fallback: busca simulada para demonstração ───────────────────────────────
function searchFallback(query: string): SearchResult[] {
  const lq = query.toLowerCase();
  const results: SearchResult[] = [];

  if (lq.includes("react") || lq.includes("trpc") || lq.includes("typescript")) {
    results.push(
      { title: "React 19 — Documentação Oficial", url: "https://react.dev", snippet: "A biblioteca React para interfaces de usuário. Versão 19 com novos hooks e melhorias de performance.", domain: "react.dev", relevanceScore: 0.95, category: "documentation" },
      { title: "tRPC — End-to-end typesafe APIs", url: "https://trpc.io/docs", snippet: "tRPC permite construir APIs typesafe sem schemas ou geração de código.", domain: "trpc.io", relevanceScore: 0.92, category: "documentation" },
    );
  }
  if (lq.includes("docker") || lq.includes("container")) {
    results.push(
      { title: "Docker Documentation", url: "https://docs.docker.com", snippet: "Documentação oficial do Docker para containers, compose e swarm.", domain: "docs.docker.com", relevanceScore: 0.90, category: "documentation" },
    );
  }
  if (lq.includes("nbr") || lq.includes("nfpa") || lq.includes("incêndio") || lq.includes("sprinkler")) {
    results.push(
      { title: "ABNT NBR 10897 — Sistemas de Chuveiros Automáticos", url: "https://abnt.org.br", snippet: "Norma brasileira para projeto, instalação e manutenção de sistemas de chuveiros automáticos.", domain: "abnt.org.br", relevanceScore: 0.95, category: "norm" },
      { title: "NFPA 13 — Standard for the Installation of Sprinkler Systems", url: "https://nfpa.org", snippet: "Padrão NFPA para instalação de sistemas de sprinklers. Edição 2022.", domain: "nfpa.org", relevanceScore: 0.93, category: "norm" },
    );
  }
  if (lq.includes("ollama") || lq.includes("llama") || lq.includes("gemma") || lq.includes("ia")) {
    results.push(
      { title: "Ollama — Run LLMs locally", url: "https://ollama.com", snippet: "Execute modelos de linguagem grandes localmente. Suporte para Llama 3, Gemma 2, Mistral e mais.", domain: "ollama.com", relevanceScore: 0.94, category: "documentation" },
    );
  }

  if (results.length === 0) {
    results.push(
      { title: `Resultados para: "${query}"`, url: "https://google.com/search?q=" + encodeURIComponent(query), snippet: "Configure uma API de busca (Brave Search, Serper ou Tavily) para resultados reais.", domain: "google.com", relevanceScore: 0.5, category: "other" },
    );
  }

  return results;
}

// ─── Classificar e pontuar resultado ─────────────────────────────────────────
function classifyResult(raw: {
  title: string; url: string; snippet: string;
  domain: string; publishedDate?: string;
}): SearchResult {
  const domain = raw.domain.toLowerCase();
  const text = (raw.title + " " + raw.snippet).toLowerCase();

  let score = 0.5;
  let category: SearchResult["category"] = "other";

  // Boost por domínio prioritário
  if (PRIORITY_DOMAINS.some(d => domain.includes(d))) score += 0.3;

  // Boost por palavras-chave técnicas
  const kwMatches = TECH_KEYWORDS.filter(kw => text.includes(kw)).length;
  score += Math.min(kwMatches * 0.05, 0.2);

  // Classificação por categoria
  if (domain.includes("abnt") || domain.includes("nfpa") || domain.includes("ul.com") || text.includes("nbr ")) {
    category = "norm";
    score += 0.1;
  } else if (
    domain.includes("docs.") || domain.includes(".dev") || domain.includes(".io") ||
    text.includes("documentation") || text.includes("documentação") || text.includes("api reference")
  ) {
    category = "documentation";
    score += 0.1;
  } else if (domain.includes("stackoverflow") || domain.includes("github.com/issues")) {
    category = "forum";
  } else if (domain.includes("medium") || domain.includes("dev.to") || domain.includes("blog")) {
    category = "article";
  }

  return {
    ...raw,
    relevanceScore: Math.min(Math.round(score * 100) / 100, 1.0),
    category,
  };
}

// ─── Resumo via IA Local (Ollama) ─────────────────────────────────────────────
async function generateAISummary(
  query: string,
  results: SearchResult[],
  model = "gemma2"
): Promise<{ summary: string; model: string; durationMs: number } | null> {
  try {
    const context = results
      .slice(0, 5)
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.url}`)
      .join("\n\n");

    const prompt = `Você é um assistente técnico especializado em desenvolvimento de software e engenharia de proteção contra incêndio.

Analise os seguintes resultados de busca para a query: "${query}"

${context}

Forneça um resumo técnico CIRÚRGICO e DIRETO em português brasileiro:
1. Resposta principal à query (2-3 frases)
2. Pontos técnicos mais relevantes (máximo 3 bullets)
3. Melhor recurso para consulta (URL mais relevante)

Seja conciso, técnico e preciso. Máximo 150 palavras.`;

    const start = Date.now();
    const res = await axios.post(
      `${OLLAMA_BASE}/api/generate`,
      {
        model,
        prompt,
        stream: false,
        options: { temperature: 0.3, top_p: 0.9, num_predict: 300 },
      },
      { timeout: 60_000 }
    );

    return {
      summary: res.data?.response ?? "",
      model,
      durationMs: Date.now() - start,
    };
  } catch {
    return null;
  }
}

// ─── Função principal de busca ────────────────────────────────────────────────
export async function webSearch(
  query: string,
  options: {
    count?: number;
    filterCategory?: "all" | "documentation" | "norm" | "tech";
    generateSummary?: boolean;
    summaryModel?: string;
    minRelevance?: number;
  } = {}
): Promise<SearchResponse> {
  const {
    count = 10,
    filterCategory = "all",
    generateSummary = true,
    summaryModel = "gemma2",
    minRelevance = 0.3,
  } = options;

  const start = Date.now();
  let results: SearchResult[] = [];
  let provider: SearchResponse["provider"] = "fallback";

  // Tentar provedores em ordem de preferência
  if (BRAVE_API_KEY) {
    try {
      results = await searchBrave(query, count);
      provider = "brave";
    } catch {}
  }

  if (results.length === 0 && SERPER_API_KEY) {
    try {
      results = await searchSerper(query, count);
      provider = "serper";
    } catch {}
  }

  if (results.length === 0 && TAVILY_API_KEY) {
    try {
      results = await searchTavily(query, count);
      provider = "tavily";
    } catch {}
  }

  if (results.length === 0) {
    results = searchFallback(query);
    provider = "fallback";
  }

  // Filtrar por relevância mínima
  results = results.filter(r => r.relevanceScore >= minRelevance);

  // Filtrar por categoria
  let filteredBy = "Todos os resultados";
  if (filterCategory === "documentation") {
    results = results.filter(r => r.category === "documentation");
    filteredBy = "Apenas documentações técnicas";
  } else if (filterCategory === "norm") {
    results = results.filter(r => r.category === "norm");
    filteredBy = "Apenas normas (NBR/NFPA/UL)";
  } else if (filterCategory === "tech") {
    results = results.filter(r => r.category === "documentation" || r.category === "forum");
    filteredBy = "Documentações e fóruns técnicos";
  }

  // Ordenar por relevância
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const searchDurationMs = Date.now() - start;

  // Gerar resumo com IA local
  let aiSummary: string | null = null;
  let aiModel: string | null = null;
  let summaryDurationMs: number | null = null;

  if (generateSummary && results.length > 0) {
    const summaryResult = await generateAISummary(query, results, summaryModel);
    if (summaryResult) {
      aiSummary = summaryResult.summary;
      aiModel = summaryResult.model;
      summaryDurationMs = summaryResult.durationMs;
    }
  }

  return {
    query,
    results: results.slice(0, count),
    aiSummary,
    aiModel,
    totalResults: results.length,
    searchDurationMs,
    summaryDurationMs,
    provider,
    filteredBy,
    timestamp: new Date().toISOString(),
  };
}

// ─── Utilitário ───────────────────────────────────────────────────────────────
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

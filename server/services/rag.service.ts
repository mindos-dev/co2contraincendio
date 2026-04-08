/**
 * OPERIS RAG Service — Retrieval-Augmented Generation
 * Versão: 2.0
 *
 * Arquitetura:
 *  - Ingestão: PDF/texto → chunks de 512 tokens com overlap de 64
 *  - Embeddings: TF-IDF simplificado (sem dependência externa) + cache em memória
 *  - Busca: cosine similarity com fallback para BM25 keyword matching
 *  - Geração: prompt-builder + invokeLLM com contexto recuperado
 *  - Cache: TTL 10 min para queries idênticas
 *
 * Nota: Embeddings vetoriais reais (OpenAI/Cohere) podem ser adicionados
 * substituindo buildTfIdfVector() por uma chamada de API externa.
 */

import { invokeLLM } from "../_core/llm";
import { CO2_COMPANY } from "../core/engine";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  chunkIndex: number;
  metadata: {
    source: string;
    norm?: string;
    category?: string;
    uploadedAt: string;
  };
  vector?: number[]; // TF-IDF vector
}

export interface RagDocument {
  id: string;
  title: string;
  source: string;
  content: string;
  norm?: string;
  category?: string;
  uploadedAt: string;
  chunkCount: number;
}

export interface RagSearchResult {
  chunk: DocumentChunk;
  score: number;
  highlight: string;
}

export interface RagAnswer {
  answer: string;
  sources: Array<{
    title: string;
    excerpt: string;
    relevance: number;
  }>;
  confidence: number;
  generatedAt: string;
}

// ─── Store em Memória ────────────────────────────────────────────────────────

// Em produção, substituir por banco de dados vetorial (pgvector, Qdrant, Weaviate)
const documentStore = new Map<string, RagDocument>();
const chunkStore = new Map<string, DocumentChunk>();
const queryCache = new Map<string, { result: RagAnswer; expiresAt: number }>();

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
const CHUNK_SIZE = 512;               // tokens aproximados por chunk
const CHUNK_OVERLAP = 64;             // tokens de overlap entre chunks
const MAX_CHUNKS_PER_QUERY = 5;       // máximo de chunks recuperados

// ─── Pré-carregamento da Base Normativa ─────────────────────────────────────

// Base de conhecimento normativo pré-carregada (sem necessidade de upload)
const NORMATIVE_KNOWLEDGE: Array<{ title: string; content: string; norm: string; category: string }> = [
  {
    title: "NBR 12962:2016 — Extintores de Incêndio",
    norm: "NBR 12962",
    category: "extintor",
    content: `A NBR 12962:2016 estabelece os requisitos para inspeção, manutenção e recarga de extintores de incêndio.
Periodicidade de manutenção: anual (365 dias) para todos os tipos de extintores.
Teste hidrostático: a cada 5 anos para cilindros de aço, a cada 3 anos para alumínio.
Inspeção visual mensal: verificar pressão, lacre, pino de segurança, estado do corpo e mangueira.
Agentes extintores: água, pó ABC, CO₂, halogenado, espuma mecânica.
Sinalização: placa de identificação com tipo, capacidade e data da última manutenção.
Responsabilidade técnica: engenheiro habilitado no CREA ou técnico com ART.
Não conformidades críticas: pressão fora da faixa verde, lacre violado, corrosão severa, mangueira trincada.`,
  },
  {
    title: "NFPA 10 — Extintores Portáteis (Classe K)",
    norm: "NFPA 10",
    category: "extintor_classe_k",
    content: `A NFPA 10 (Standard for Portable Fire Extinguishers) define requisitos para extintores portáteis.
Extintores Classe K (saponificante): validade de 6 anos para inspeção interna, 12 anos para teste hidrostático.
Aplicação: cozinhas comerciais, fritadeiras, equipamentos de cocção.
Agente: solução aquosa de acetato de potássio (saponificante).
Inspeção anual obrigatória por técnico certificado.
Distância máxima de percurso: 9 metros para Classe K em cozinhas comerciais.
UL 300: norma americana para sistemas de supressão em cozinhas.`,
  },
  {
    title: "NBR 12779:2009 — Mangueiras de Incêndio",
    norm: "NBR 12779",
    category: "hidrante",
    content: `A NBR 12779:2009 estabelece requisitos para mangueiras de incêndio.
Periodicidade de inspeção: anual (365 dias).
Teste hidrostático: pressão de 1,5x a pressão de trabalho, mínimo 10 kgf/cm².
Comprimento padrão: 15 metros ou 30 metros.
Diâmetros: 1½" (38mm) ou 2½" (63mm).
Acondicionamento: aduchada ou em zigue-zague em abrigo adequado.
Não conformidades: vazamentos, bolhas, ressecamento, achatamento permanente.
Registro de manutenção: data, responsável técnico, resultado do teste.`,
  },
  {
    title: "NR-23 — Proteção Contra Incêndios",
    norm: "NR-23",
    category: "geral",
    content: `A NR-23 (Norma Regulamentadora 23) trata da proteção contra incêndios em estabelecimentos de trabalho.
Obrigatoriedade: todos os locais de trabalho devem ter proteção contra incêndio.
Saídas de emergência: dimensionamento conforme número de ocupantes e risco.
Extintores: um extintor para cada 500m² ou fração, com distância máxima de 20 metros.
Brigada de incêndio: obrigatória conforme porte e risco do estabelecimento.
Plano de emergência: obrigatório para empresas com mais de 10 funcionários.
Treinamento: anual para toda a brigada de incêndio.`,
  },
  {
    title: "IT-16 CBMMG — Sistemas de Proteção por Extintores",
    norm: "IT-16/CBMMG",
    category: "extintor",
    content: `A Instrução Técnica 16 do Corpo de Bombeiros de Minas Gerais regulamenta sistemas de proteção por extintores.
Aplicação: edificações em Minas Gerais sujeitas ao PPCI (Plano de Prevenção e Proteção Contra Incêndio).
Classificação de risco: leve, moderado e elevado — define quantidade e tipo de extintores.
Risco leve: escritórios, residências — 1 extintor/500m², mínimo 2A.
Risco moderado: indústrias leves, comércio — 1 extintor/250m², mínimo 2A:10B.
Risco elevado: indústrias pesadas, depósitos — 1 extintor/150m², mínimo 4A:40B:C.
Sinalização: conforme NBR 13434 e NBR 7195.`,
  },
  {
    title: "Casa de Bombas — Inspeção Mensal",
    norm: "NR-23 / ABNT",
    category: "bomba",
    content: `Inspeção mensal obrigatória para sistemas de bombeamento de incêndio.
Itens de verificação: partida automática e manual, pressão de trabalho, nível de combustível (diesel), bateria de partida, painel de controle, válvulas de teste e drenagem.
Teste funcional: acionar bomba principal e jockey, verificar pressão e vazão.
Registro: logbook com data, técnico responsável, resultado de cada item.
Não conformidades críticas: falha na partida automática, pressão abaixo do projeto, vazamentos no recalque.
Periodicidade de manutenção preventiva: trimestral para bombas principais.`,
  },
];

// ─── Inicialização ───────────────────────────────────────────────────────────

let initialized = false;

export function initializeRagStore(): void {
  if (initialized) return;

  for (const doc of NORMATIVE_KNOWLEDGE) {
    const docId = `norm-${doc.norm.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
    const chunks = chunkText(doc.content, doc.title, docId, {
      source: "normative_base",
      norm: doc.norm,
      category: doc.category,
      uploadedAt: new Date().toISOString(),
    });

    documentStore.set(docId, {
      id: docId,
      title: doc.title,
      source: "normative_base",
      content: doc.content,
      norm: doc.norm,
      category: doc.category,
      uploadedAt: new Date().toISOString(),
      chunkCount: chunks.length,
    });

    for (const chunk of chunks) {
      chunk.vector = buildTfIdfVector(chunk.content);
      chunkStore.set(chunk.id, chunk);
    }
  }

  initialized = true;
}

// ─── Ingestão de Documentos ──────────────────────────────────────────────────

export async function ingestDocument(
  title: string,
  content: string,
  metadata: { source: string; norm?: string; category?: string }
): Promise<RagDocument> {
  if (!initialized) initializeRagStore();

  const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const uploadedAt = new Date().toISOString();

  const chunks = chunkText(content, title, docId, {
    ...metadata,
    uploadedAt,
  });

  const doc: RagDocument = {
    id: docId,
    title,
    source: metadata.source,
    content,
    norm: metadata.norm,
    category: metadata.category,
    uploadedAt,
    chunkCount: chunks.length,
  };

  documentStore.set(docId, doc);

  for (const chunk of chunks) {
    chunk.vector = buildTfIdfVector(chunk.content);
    chunkStore.set(chunk.id, chunk);
  }

  return doc;
}

// ─── Chunking ────────────────────────────────────────────────────────────────

function chunkText(
  text: string,
  documentTitle: string,
  documentId: string,
  metadata: DocumentChunk["metadata"]
): DocumentChunk[] {
  // Dividir por parágrafos primeiro, depois por tamanho
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 20);
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;
  let buffer = "";

  for (const para of paragraphs) {
    const words = para.split(/\s+/);

    if (buffer.split(/\s+/).length + words.length > CHUNK_SIZE) {
      if (buffer.trim()) {
        chunks.push(createChunk(buffer.trim(), documentId, documentTitle, chunkIndex++, metadata));
      }
      // Overlap: manter últimas CHUNK_OVERLAP palavras
      const bufferWords = buffer.split(/\s+/);
      buffer = bufferWords.slice(-CHUNK_OVERLAP).join(" ") + " " + para;
    } else {
      buffer = buffer ? buffer + "\n\n" + para : para;
    }
  }

  if (buffer.trim()) {
    chunks.push(createChunk(buffer.trim(), documentId, documentTitle, chunkIndex++, metadata));
  }

  return chunks.length > 0 ? chunks : [
    createChunk(text.substring(0, 1000), documentId, documentTitle, 0, metadata),
  ];
}

function createChunk(
  content: string,
  documentId: string,
  documentTitle: string,
  index: number,
  metadata: DocumentChunk["metadata"]
): DocumentChunk {
  return {
    id: `${documentId}-chunk-${index}`,
    documentId,
    documentTitle,
    content,
    chunkIndex: index,
    metadata,
  };
}

// ─── TF-IDF Vectorization ────────────────────────────────────────────────────

// Vocabulário técnico de segurança contra incêndio
const TECHNICAL_VOCAB = [
  "extintor", "incêndio", "manutenção", "inspeção", "pressão", "hidrante",
  "sprinkler", "mangueira", "bomba", "painel", "detector", "alarme",
  "nbr", "nfpa", "crea", "art", "laudo", "vistoria", "conformidade",
  "risco", "norma", "teste", "hidrostático", "recarga", "lacre",
  "co2", "pó", "espuma", "saponificante", "classe", "agente",
  "validade", "vencimento", "periodicidade", "anual", "mensal",
  "técnico", "engenheiro", "responsável", "empresa", "equipamento",
];

function buildTfIdfVector(text: string): number[] {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const wordCount = words.length || 1;

  return TECHNICAL_VOCAB.map(term => {
    const count = words.filter(w => w.includes(term) || term.includes(w)).length;
    return count / wordCount; // TF normalizado
  });
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ─── Busca Semântica ─────────────────────────────────────────────────────────

export function searchChunks(query: string, topK = MAX_CHUNKS_PER_QUERY): RagSearchResult[] {
  if (!initialized) initializeRagStore();

  const queryVector = buildTfIdfVector(query);
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);

  const results: RagSearchResult[] = [];

  for (const chunk of Array.from(chunkStore.values())) {
    // Score vetorial (TF-IDF cosine)
    const vectorScore = chunk.vector ? cosineSimilarity(queryVector, chunk.vector) : 0;

    // Score BM25 simplificado (keyword overlap)
    const chunkWords = chunk.content.toLowerCase().split(/\W+/);
    const keywordMatches = queryWords.filter(w => chunkWords.some((cw: string) => cw.includes(w) || w.includes(cw))).length;
    const bm25Score = keywordMatches / (queryWords.length || 1);

    // Score combinado (70% vetorial + 30% keyword)
    const score = vectorScore * 0.7 + bm25Score * 0.3;

    if (score > 0.05) {
      // Gerar highlight
      const highlight = generateHighlight(chunk.content, queryWords);
      results.push({ chunk, score, highlight });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function generateHighlight(text: string, queryWords: string[]): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  let bestSentence = sentences[0] ?? text.substring(0, 200);
  let bestScore = 0;

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const score = queryWords.filter(w => lower.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  }

  return bestSentence.trim().substring(0, 300) + (bestSentence.length > 300 ? "..." : "");
}

// ─── Geração de Resposta (RAG) ───────────────────────────────────────────────

export async function askRag(query: string): Promise<RagAnswer> {
  if (!initialized) initializeRagStore();

  // Verificar cache
  const cacheKey = query.trim().toLowerCase();
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.result;
  }

  // Recuperar chunks relevantes
  const searchResults = searchChunks(query, MAX_CHUNKS_PER_QUERY);

  if (searchResults.length === 0) {
    return {
      answer: `Não encontrei informações específicas sobre "${query}" na base de conhecimento normativo. Consulte diretamente as normas NBR 12962, NBR 12779 ou NFPA 10, ou entre em contato com ${CO2_COMPANY.name}.`,
      sources: [],
      confidence: 0.1,
      generatedAt: new Date().toISOString(),
    };
  }

  // Construir contexto para o LLM
  const context = searchResults
    .map((r, i) => `[${i + 1}] ${r.chunk.documentTitle}\n${r.chunk.content}`)
    .join("\n\n---\n\n");

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é o assistente técnico da ${CO2_COMPANY.name}, especializado em segurança contra incêndio.
Responda com base APENAS no contexto fornecido. Seja preciso, técnico e cite as normas relevantes.
Se a informação não estiver no contexto, diga claramente que não tem essa informação.
Responda em português brasileiro.`,
        },
        {
          role: "user",
          content: `Contexto técnico:\n${context}\n\nPergunta: ${query}`,
        },
      ],
    });

    const rawAnswer = response.choices[0]?.message?.content;
    const answer = typeof rawAnswer === "string" ? rawAnswer : "Não foi possível gerar uma resposta.";

    const result: RagAnswer = {
      answer,
      sources: searchResults.slice(0, 3).map(r => ({
        title: r.chunk.documentTitle,
        excerpt: r.highlight,
        relevance: Math.round(r.score * 100) / 100,
      })),
      confidence: searchResults[0]?.score ?? 0,
      generatedAt: new Date().toISOString(),
    };

    // Armazenar no cache
    queryCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });

    return result;
  } catch {
    // Fallback: retornar os chunks sem geração
    return {
      answer: `Com base na documentação técnica: ${searchResults[0]?.highlight ?? "Consulte as normas aplicáveis."}`,
      sources: searchResults.slice(0, 3).map(r => ({
        title: r.chunk.documentTitle,
        excerpt: r.highlight,
        relevance: r.score,
      })),
      confidence: 0.5,
      generatedAt: new Date().toISOString(),
    };
  }
}

// ─── Listagem de Documentos ──────────────────────────────────────────────────

export function listDocuments(): RagDocument[] {
  if (!initialized) initializeRagStore();
  return Array.from(documentStore.values()).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function getDocumentById(id: string): RagDocument | undefined {
  return documentStore.get(id);
}

export function deleteDocument(id: string): boolean {
  if (!documentStore.has(id)) return false;

  // Remover chunks associados
  for (const [chunkId, chunk] of Array.from(chunkStore.entries())) {
    if (chunk.documentId === id) {
      chunkStore.delete(chunkId);
    }
  }

  documentStore.delete(id);
  return true;
}

export function getRagStats(): {
  documentCount: number;
  chunkCount: number;
  cacheSize: number;
  initialized: boolean;
} {
  return {
    documentCount: documentStore.size,
    chunkCount: chunkStore.size,
    cacheSize: queryCache.size,
    initialized,
  };
}

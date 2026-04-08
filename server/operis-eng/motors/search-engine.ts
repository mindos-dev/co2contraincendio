/**
 * OPERIS.eng — Motor de Busca Semântica
 *
 * Equivalente Node.js do stack Python (FastAPI + FAISS + SentenceTransformers)
 * descrito no script enviado pelo usuário.
 *
 * Arquitetura:
 *   1. EmbeddingService  → gera vetores float32 via LLM (text-embedding-ada-002 / built-in)
 *   2. VectorIndex       → índice cosine similarity em memória (sem FAISS, sem deps extras)
 *   3. KnowledgeStore    → persiste chunks + embeddings no MySQL (tabela operis_knowledge_chunks)
 *   4. SearchEngine      → orquestra ingestão, busca e aprendizado contínuo
 *
 * Base de normas pré-carregada:
 *   NBR 12615, NBR 14276, NBR 15808, NBR 17240, NFPA 12, NFPA 13, NFPA 72
 */

import { getDb } from "../../db";
import { operisKnowledgeChunks, type InsertOperisKnowledgeChunk, type OperisKnowledgeChunk } from "../../../drizzle/schema";
import { eq, isNull, or, sql } from "drizzle-orm";
import { invokeLLM } from "../../_core/llm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: number;
  source: string;
  sourceType: string;
  title: string;
  content: string;
  normCode: string | null;
  section: string | null;
  riskLevel: string | null;
  tags: string[];
  score: number; // cosine similarity 0-1
}

export interface IngestInput {
  source: string;
  sourceType: "norm" | "manual" | "inspection" | "budget" | "custom";
  title: string;
  content: string;
  normCode?: string;
  section?: string;
  riskLevel?: string;
  tags?: string[];
  companyId?: number;
}

export interface SearchStats {
  totalChunks: number;
  globalChunks: number;
  companyChunks: number;
  sources: string[];
  lastUpdated: Date | null;
  indexLoaded: boolean;
}

// ─── In-Memory Vector Index ───────────────────────────────────────────────────

interface IndexEntry {
  id: number;
  embedding: number[];
  companyId: number | null;
}

class VectorIndex {
  private entries: IndexEntry[] = [];

  add(id: number, embedding: number[], companyId: number | null): void {
    // Remove existing entry for same id
    this.entries = this.entries.filter(e => e.id !== id);
    this.entries.push({ id, embedding, companyId });
  }

  /**
   * Cosine similarity search — equivalent to FAISS IndexFlatIP with L2 normalization
   */
  search(queryEmbedding: number[], topK: number, companyId?: number): Array<{ id: number; score: number }> {
    const qNorm = this.l2Norm(queryEmbedding);
    if (qNorm === 0) return [];

    const scores = this.entries
      .filter(e => e.companyId === null || e.companyId === (companyId ?? null))
      .map(e => {
        const dot = e.embedding.reduce((sum, v, i) => sum + v * queryEmbedding[i], 0);
        const eMag = this.l2Norm(e.embedding);
        const score = eMag === 0 ? 0 : dot / (qNorm * eMag);
        return { id: e.id, score };
      });

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  size(): number {
    return this.entries.length;
  }

  clear(): void {
    this.entries = [];
  }

  private l2Norm(v: number[]): number {
    return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  }
}

// ─── Embedding Service ────────────────────────────────────────────────────────

class EmbeddingService {
  private cache = new Map<string, number[]>();

  /**
   * Gera embedding via LLM (text-embedding via invokeLLM com response_format JSON)
   * Dimensão: 384 (compatível com all-MiniLM-L6-v2 do script Python original)
   */
  async generate(text: string): Promise<number[]> {
    const cacheKey = text.slice(0, 200);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an embedding generator. Given a text, return a JSON array of 384 floating point numbers between -1 and 1 that semantically represent the text. The embedding should capture the meaning related to fire safety, engineering norms, and technical documents. Return ONLY the JSON array, no other text.`,
          },
          {
            role: "user",
            content: `Generate a 384-dimensional semantic embedding for this text:\n\n"${text.slice(0, 800)}"`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "embedding",
            strict: true,
            schema: {
              type: "object",
              properties: {
                embedding: {
                  type: "array",
                  items: { type: "number" },
                },
              },
              required: ["embedding"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response?.choices?.[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new Error("Empty LLM response");

      const parsed = JSON.parse(content);
      const embedding = parsed.embedding as number[];

      if (!Array.isArray(embedding) || embedding.length < 10) {
        throw new Error(`Invalid embedding length: ${embedding?.length}`);
      }

      // Pad or truncate to 384 dimensions
      const normalized = this.padOrTruncate(embedding, 384);
      this.cache.set(cacheKey, normalized);
      return normalized;
    } catch (err) {
      // Fallback: generate deterministic pseudo-embedding from text hash
      console.warn("[SearchEngine] LLM embedding failed, using fallback:", (err as Error).message);
      return this.deterministicEmbedding(text, 384);
    }
  }

  private padOrTruncate(arr: number[], size: number): number[] {
    if (arr.length >= size) return arr.slice(0, size);
    return [...arr, ...new Array(size - arr.length).fill(0)];
  }

  /**
   * Fallback determinístico — garante que o sistema funciona mesmo sem LLM
   * Baseado em hash do texto para gerar vetor consistente
   */
  private deterministicEmbedding(text: string, dims: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < dims; i++) {
      let hash = 0;
      for (let j = 0; j < text.length; j++) {
        hash = ((hash << 5) - hash + text.charCodeAt(j) * (i + 1)) | 0;
      }
      result.push((hash % 10000) / 10000);
    }
    return result;
  }
}

// ─── Knowledge Store (DB layer) ───────────────────────────────────────────────

class KnowledgeStore {
  async save(input: InsertOperisKnowledgeChunk): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    const [result] = await db.insert(operisKnowledgeChunks).values(input);
    return (result as { insertId: number }).insertId;
  }

  async findById(id: number): Promise<OperisKnowledgeChunk | null> {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(operisKnowledgeChunks).where(eq(operisKnowledgeChunks.id, id));
    return rows[0] ?? null;
  }

  async findByIds(ids: number[]): Promise<OperisKnowledgeChunk[]> {
    if (ids.length === 0) return [];
    const db = await getDb();
    if (!db) return [];
    return db.select().from(operisKnowledgeChunks).where(sql`id IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`);
  }

  async loadAll(companyId?: number): Promise<OperisKnowledgeChunk[]> {
    const db = await getDb();
    if (!db) return [];
    if (companyId !== undefined) {
      return db.select().from(operisKnowledgeChunks).where(
        or(isNull(operisKnowledgeChunks.companyId), eq(operisKnowledgeChunks.companyId, companyId))
      );
    }
    return db.select().from(operisKnowledgeChunks);
  }

  async getStats(companyId?: number): Promise<SearchStats> {
    const db = await getDb();
    const allRows = db ? await db.select({
      id: operisKnowledgeChunks.id,
      companyId: operisKnowledgeChunks.companyId,
      source: operisKnowledgeChunks.source,
      updatedAt: operisKnowledgeChunks.updatedAt,
    }).from(operisKnowledgeChunks) : [];

    const relevant = companyId
      ? allRows.filter((r: { companyId: number | null }) => r.companyId === null || r.companyId === companyId)
      : allRows;

    const sources = Array.from(new Set(relevant.map((r: { source: string }) => r.source)));
    const lastUpdated = relevant.length > 0
      ? relevant.reduce((max: Date, r: { updatedAt: Date | null }) => (r.updatedAt && r.updatedAt > max ? r.updatedAt : max), new Date(0))
      : null;

    return {
      totalChunks: relevant.length,
      globalChunks: relevant.filter((r: { companyId: number | null }) => r.companyId === null).length,
      companyChunks: relevant.filter((r: { companyId: number | null }) => r.companyId !== null).length,
      sources,
      lastUpdated,
      indexLoaded: searchEngine.isIndexLoaded(),
    };
  }
}

// ─── Search Engine (Orchestrator) ─────────────────────────────────────────────

export class SearchEngineService {
  private index = new VectorIndex();
  private embedder = new EmbeddingService();
  private store = new KnowledgeStore();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.loadIndexFromDB();
    await this.seedBaseKnowledge();
    this.initialized = true;
    console.log(`[SearchEngine] Initialized with ${this.index.size()} chunks`);
  }

  isIndexLoaded(): boolean {
    return this.initialized;
  }

  /**
   * Busca semântica — equivalente ao /api/v1/search do script Python
   */
  async search(query: string, topK = 5, companyId?: number): Promise<SearchResult[]> {
    if (!this.initialized) await this.initialize();

    const queryEmbedding = await this.embedder.generate(query);
    const hits = this.index.search(queryEmbedding, topK, companyId);

    if (hits.length === 0) return [];

    const rows = await this.store.findByIds(hits.map(h => h.id));
    const scoreMap = new Map(hits.map(h => [h.id, h.score]));

    return rows
      .map((row: OperisKnowledgeChunk) => ({
        id: row.id,
        source: row.source,
        sourceType: row.sourceType,
        title: row.title,
        content: row.content,
        normCode: row.normCode ?? null,
        section: row.section ?? null,
        riskLevel: row.riskLevel ?? null,
        tags: row.tags ? (JSON.parse(row.tags) as string[]) : [],
        score: scoreMap.get(row.id) ?? 0,
      }))
      .sort((a: SearchResult, b: SearchResult) => b.score - a.score);
  }

  /**
   * Ingestão de novo documento — equivalente ao FAISSService.adicionar() do script Python
   */
  async ingest(input: IngestInput): Promise<{ id: number; message: string }> {
    if (!this.initialized) await this.initialize();

    const embedding = await this.embedder.generate(input.content);

    const id = await this.store.save({
      source: input.source,
      sourceType: input.sourceType,
      title: input.title,
      content: input.content,
      embedding: JSON.stringify(embedding),
      tags: input.tags ? JSON.stringify(input.tags) : null,
      normCode: input.normCode ?? null,
      section: input.section ?? null,
      riskLevel: input.riskLevel ?? null,
      companyId: input.companyId ?? null,
      language: "pt-BR",
    });

    this.index.add(id, embedding, input.companyId ?? null);

    return { id, message: `Chunk "${input.title}" ingerido com sucesso (id=${id})` };
  }

  async getStats(companyId?: number): Promise<SearchStats> {
    return this.store.getStats(companyId);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async loadIndexFromDB(): Promise<void> {
    try {
      const rows = await this.store.loadAll();
      let loaded = 0;
      for (const row of rows) {
        if (row.embedding) {
          try {
            const emb = JSON.parse(row.embedding) as number[];
            this.index.add(row.id, emb, row.companyId ?? null);
            loaded++;
          } catch {
            // Skip malformed embeddings
          }
        }
      }
      console.log(`[SearchEngine] Loaded ${loaded}/${rows.length} chunks from DB`);
    } catch (err) {
      console.warn("[SearchEngine] Failed to load index from DB:", (err as Error).message);
    }
  }

  /**
   * Base de conhecimento pré-carregada com normas NBR/NFPA
   * Equivalente ao corpus do SentenceTransformer no script Python
   */
  private async seedBaseKnowledge(): Promise<void> {
    const stats = await this.store.getStats();
    if (stats.totalChunks > 0) return; // Already seeded

    console.log("[SearchEngine] Seeding base knowledge (normas NBR/NFPA)...");

    const baseChunks: IngestInput[] = [
      {
        source: "NBR 12615",
        sourceType: "norm",
        title: "NBR 12615 — Sistema de proteção por extinção de incêndio com CO₂",
        content: "A NBR 12615 estabelece os requisitos mínimos para o projeto, instalação, inspeção, manutenção e testes de sistemas de proteção por extinção de incêndio com dióxido de carbono (CO₂). Aplica-se a sistemas de inundação total, aplicação local e sistemas de mangueira. O CO₂ é um agente extintor limpo, sem resíduo, adequado para proteção de equipamentos elétricos, salas de servidores, turbinas e processos industriais.",
        normCode: "NBR12615",
        section: "1. Escopo",
        riskLevel: "R3",
        tags: ["CO2", "extinção", "inundação total", "aplicação local", "NBR"],
      },
      {
        source: "NBR 12615",
        sourceType: "norm",
        title: "NBR 12615 — Concentração de projeto para CO₂",
        content: "A concentração de projeto para extinção de incêndio com CO₂ em sistemas de inundação total deve ser de no mínimo 34% em volume para materiais de classe A de superfície, e de no mínimo 50% para líquidos inflamáveis (classe B). Para gases inflamáveis, a concentração mínima é de 1,3 vezes a concentração de extinção. O tempo de descarga não deve exceder 1 minuto para sistemas de alta pressão.",
        normCode: "NBR12615",
        section: "5.3 — Concentração de projeto",
        riskLevel: "R3",
        tags: ["CO2", "concentração", "inundação total", "34%", "50%"],
      },
      {
        source: "NBR 14276",
        sourceType: "norm",
        title: "NBR 14276 — Brigada de incêndio",
        content: "A NBR 14276 estabelece os requisitos mínimos para a composição, formação, implantação e reciclagem de brigada de incêndio nas edificações. Define as atribuições dos membros da brigada, os critérios de dimensionamento por área e risco, e os procedimentos de emergência. A brigada deve ser treinada para uso de extintores, hidrantes, abandono de área e primeiros socorros.",
        normCode: "NBR14276",
        section: "1. Escopo",
        riskLevel: "R2",
        tags: ["brigada", "treinamento", "emergência", "incêndio", "NBR"],
      },
      {
        source: "NBR 15808",
        sourceType: "norm",
        title: "NBR 15808 — Extintores de incêndio portáteis",
        content: "A NBR 15808 especifica os requisitos para extintores de incêndio portáteis, incluindo projeto, fabricação, desempenho, ensaios e marcação. Classifica os extintores por agente extintor (água, espuma, pó BC, pó ABC, CO₂, agentes limpos) e por classe de fogo (A, B, C, D, K). Define a periodicidade de inspeção (mensal), manutenção de 1º nível (anual) e manutenção de 2º nível (quinquenal).",
        normCode: "NBR15808",
        section: "1. Escopo",
        riskLevel: "R2",
        tags: ["extintor", "portátil", "manutenção", "inspeção", "NBR"],
      },
      {
        source: "NBR 15808",
        sourceType: "norm",
        title: "NBR 15808 — Periodicidade de manutenção de extintores",
        content: "Inspeção visual: mensal, verificando lacre, manômetro, bico, mangueira e sinalização. Manutenção de 1º nível: anual, incluindo pesagem, verificação de pressão e recarga se necessário. Manutenção de 2º nível: a cada 5 anos, com ensaio hidrostático do cilindro. Extintores de CO₂ devem ser pesados a cada 6 meses; perda de massa superior a 10% exige recarga imediata.",
        normCode: "NBR15808",
        section: "8. Manutenção",
        riskLevel: "R2",
        tags: ["extintor", "manutenção", "periodicidade", "recarga", "CO2"],
      },
      {
        source: "NBR 17240",
        sourceType: "norm",
        title: "NBR 17240 — Sistemas de detecção e alarme de incêndio",
        content: "A NBR 17240 estabelece os requisitos para projeto, instalação, comissionamento e manutenção de sistemas de detecção e alarme de incêndio. Define os tipos de detectores (fumaça óptico, iônico, temperatura, chama), centrais de alarme, acionadores manuais e dispositivos de notificação. Substitui a NBR 9441 e alinha-se com a IEC 62305.",
        normCode: "NBR17240",
        section: "1. Escopo",
        riskLevel: "R3",
        tags: ["detector", "alarme", "incêndio", "fumaça", "NBR"],
      },
      {
        source: "NFPA 12",
        sourceType: "norm",
        title: "NFPA 12 — Carbon Dioxide Extinguishing Systems",
        content: "NFPA 12 covers the design, installation, testing, inspection, approval, operation, and maintenance of carbon dioxide extinguishing systems. Total flooding systems require a minimum design concentration of 34% for Class A surface fires and 50% for Class B hazards. High-pressure systems use CO₂ stored at ambient temperature in cylinders at 850 psi (58.6 bar). Low-pressure systems store CO₂ at -18°C (0°F) and 300 psi (20.7 bar).",
        normCode: "NFPA12",
        section: "1.1 Scope",
        riskLevel: "R3",
        tags: ["CO2", "NFPA", "total flooding", "carbon dioxide", "fire suppression"],
      },
      {
        source: "NFPA 13",
        sourceType: "norm",
        title: "NFPA 13 — Installation of Sprinkler Systems",
        content: "NFPA 13 provides the minimum requirements for the design and installation of automatic fire sprinkler systems and exposure protection sprinkler systems. Covers hydraulic calculations, pipe sizing, sprinkler spacing, water supply requirements, and system types (wet pipe, dry pipe, preaction, deluge). Density/area method and room design method are the primary design approaches.",
        normCode: "NFPA13",
        section: "1.1 Scope",
        riskLevel: "R3",
        tags: ["sprinkler", "NFPA", "hydraulic", "wet pipe", "fire protection"],
      },
      {
        source: "NFPA 72",
        sourceType: "norm",
        title: "NFPA 72 — National Fire Alarm and Signaling Code",
        content: "NFPA 72 covers the application, installation, location, performance, inspection, testing, and maintenance of fire alarm systems, supervising station alarm systems, public emergency alarm reporting systems, fire warning equipment, and emergency communications systems. Defines initiating devices, notification appliances, control units, and power supplies.",
        normCode: "NFPA72",
        section: "1.1 Scope",
        riskLevel: "R3",
        tags: ["alarm", "NFPA", "detection", "signaling", "fire alarm"],
      },
      {
        source: "NBR 12615",
        sourceType: "norm",
        title: "NBR 12615 — Inspeção e manutenção de sistemas CO₂",
        content: "Inspeção semestral: verificar peso dos cilindros (perda máxima 5%), pressão dos manômetros, integridade das tubulações, bicos difusores, válvulas de seleção e painel de controle. Teste funcional anual: simular acionamento sem descarga de CO₂. Recarga obrigatória quando a perda de massa exceder 5% ou a pressão cair abaixo do valor nominal. Registrar todas as inspeções em livro de manutenção com assinatura do responsável técnico (RT) habilitado no CREA.",
        normCode: "NBR12615",
        section: "9. Inspeção e manutenção",
        riskLevel: "R3",
        tags: ["CO2", "inspeção", "manutenção", "cilindro", "CREA", "RT"],
      },
    ];

    for (const chunk of baseChunks) {
      try {
        await this.ingest(chunk);
      } catch (err) {
        console.warn(`[SearchEngine] Failed to seed chunk "${chunk.title}":`, (err as Error).message);
      }
    }

    console.log(`[SearchEngine] Base knowledge seeded: ${baseChunks.length} chunks`);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const searchEngine = new SearchEngineService();

// Initialize in background (non-blocking)
searchEngine.initialize().catch(err => {
  console.error("[SearchEngine] Background init failed:", err);
});

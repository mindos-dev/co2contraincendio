import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Search, Brain, ArrowRight, Loader2, AlertCircle, ChevronRight } from "lucide-react";

type KnowledgeChunk = {
  id: string;
  module: string;
  type: string;
  title: string;
  content: string;
  keywords: string[];
  status?: string;
  priority?: string;
  suggestedActions?: string[];
};

type SearchResult = {
  chunk: KnowledgeChunk;
  score: number;
  matchedKeywords: string[];
};

type SearchResponse = {
  query: string;
  results: SearchResult[];
  relatedModules: string[];
  suggestedActions: string[];
  totalFound: number;
};

const MODULE_COLORS: Record<string, string> = {
  equipamentos: "#C8102E",
  manutencoes: "#1A3A5C",
  alertas: "#D97706",
  documentos: "#7C3AED",
  relatorios: "#16A34A",
  qrcodes: "#0891B2",
  clientes: "#DB2777",
  sistema: "#6B7280",
};

const MODULE_LABELS: Record<string, string> = {
  equipamentos: "Equipamentos",
  manutencoes: "Manutenções",
  alertas: "Alertas",
  documentos: "Documentos",
  relatorios: "Relatórios",
  qrcodes: "QR Codes",
  clientes: "Clientes",
  sistema: "Sistema",
};

const TYPE_LABELS: Record<string, string> = {
  bug: "Erro",
  feature: "Funcionalidade",
  architecture: "Arquitetura",
  procedure: "Procedimento",
  status: "Status",
};

const SUGGESTED_QUERIES = [
  "Como gerar QR Code para um extintor?",
  "Quais erros críticos existem no sistema?",
  "Como funciona o alerta automático de manutenção?",
  "Como importar clientes via CSV?",
  "Como exportar relatório em PDF?",
  "Quais módulos estão prontos?",
];

export default function BuscaInteligente() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isFetching, isError, refetch } = trpc.saas.knowledge.search.useQuery(
    { query: activeQuery },
    {
      enabled: activeQuery.length >= 2,
      staleTime: 30_000,
    }
  );

  const handleSearch = (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;
    if (!history.includes(searchQuery)) setHistory(prev => [searchQuery, ...prev].slice(0, 10));
    if (searchQuery === activeQuery) { void refetch(); return; }
    setActiveQuery(searchQuery);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const moduleColor = (mod: string) => MODULE_COLORS[mod] ?? "#6B7280";
  const moduleLabel = (mod: string) => MODULE_LABELS[mod] ?? mod;
  const typeLabel = (t: string) => TYPE_LABELS[t] ?? t;

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ width: 24, height: 3, background: "#C8102E", marginBottom: 10 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Brain size={22} color="#C8102E" />
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>
              BUSCA INTELIGENTE
            </h1>
          </div>
          <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>
            Consulte o conhecimento estruturado do OPERIS — módulos, erros, funcionalidades e procedimentos
          </p>
        </div>

        {/* Campo de busca */}
        <div style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: "3px solid #C8102E", padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A8A8A" }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Pergunte sobre qualquer módulo, erro ou funcionalidade do OPERIS..."
                style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid #D8D8D8", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isFetching || !query.trim()}
              style={{ padding: "10px 20px", background: "#C8102E", color: "#fff", border: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: isFetching || !query.trim() ? 0.6 : 1 }}
            >
              {isFetching ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={14} />}
              BUSCAR
            </button>
          </div>

          {/* Sugestões */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: "#8A8A8A", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 8 }}>PERGUNTAS FREQUENTES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); handleSearch(q); }}
                  style={{ padding: "4px 10px", background: "#F8F8F8", border: "1px solid #E8E8E8", fontSize: 11, color: "#4A4A4A", cursor: "pointer", fontFamily: "inherit", transition: "all 0.1s" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Erro */}
        {isError && (
          <div style={{ background: "#FFF5F5", border: "1px solid #FCA5A5", padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} color="#C8102E" />
            <span style={{ fontSize: 13, color: "#B91C1C" }}>Erro ao realizar a busca. Tente novamente.</span>
          </div>
        )}

        {/* Loading */}
        {isFetching && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#8A8A8A" }}>
            <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginBottom: 10 }} />
            <div style={{ fontSize: 13 }}>Consultando base de conhecimento OPERIS...</div>
          </div>
        )}

        {/* Resultados */}
        {results && !isFetching && (
          <div>
            {/* Resumo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#4A4A4A" }}>
                <strong>{(results as SearchResponse).totalFound}</strong> resultado{(results as SearchResponse).totalFound !== 1 ? "s" : ""} para{" "}
                <strong>"{results.query}"</strong>
              </div>
            </div>

            {/* Módulos relacionados */}
            {(results as SearchResponse).relatedModules.length > 0 && (
              <div style={{ background: "#F8F8F8", border: "1px solid #E8E8E8", padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, letterSpacing: "0.06em" }}>MÓDULOS:</span>
                {(results as SearchResponse).relatedModules.map((mod) => (
                  <span key={mod} style={{ padding: "3px 10px", background: moduleColor(mod), color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
                    {moduleLabel(mod)}
                  </span>
                ))}
              </div>
            )}

            {/* Ações sugeridas */}
            {(results as SearchResponse).suggestedActions.length > 0 && (
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "12px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#16A34A", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>AÇÕES SUGERIDAS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(results as SearchResponse).suggestedActions.map((action, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <ChevronRight size={14} color="#16A34A" style={{ marginTop: 1, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#166534" }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sem resultados */}
            {(results as SearchResponse).results.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#8A8A8A" }}>
                <Brain size={32} style={{ marginBottom: 10, opacity: 0.3 }} />
                <div style={{ fontSize: 14 }}>Nenhum resultado encontrado para esta consulta.</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Tente palavras-chave diferentes ou use as sugestões acima.</div>
              </div>
            )}

            {/* Lista de resultados */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(results as SearchResponse).results.map((result) => (
                <div
                  key={result.chunk.id}
                  style={{ background: "#fff", border: "1px solid #D8D8D8", borderLeft: `4px solid ${moduleColor(result.chunk.module)}`, padding: "16px" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ padding: "2px 8px", background: moduleColor(result.chunk.module), color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>
                          {moduleLabel(result.chunk.module)}
                        </span>
                        <span style={{ padding: "2px 8px", background: "#F3F4F6", color: "#6B7280", fontSize: 10, fontWeight: 600, letterSpacing: "0.04em" }}>
                          {typeLabel(result.chunk.type)}
                        </span>
                        <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                          relevância: {Math.round(result.score * 100)}%
                        </span>
                      </div>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, color: "#111111", letterSpacing: "0.02em" }}>
                        {result.chunk.title}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#4A4A4A", lineHeight: 1.6, marginBottom: 10 }}>
                    {result.chunk.content}
                  </div>
                  {result.chunk.keywords.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {result.chunk.keywords.slice(0, 6).map((kw) => (
                        <button
                          key={kw}
                          onClick={() => { setQuery(kw); handleSearch(kw); }}
                          style={{ padding: "2px 8px", background: "transparent", border: "1px solid #E5E7EB", color: "#6B7280", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Histórico */}
            {history.length > 1 && (
              <div style={{ marginTop: 24, background: "#F8F8F8", border: "1px solid #E8E8E8", padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10 }}>HISTÓRICO DE BUSCAS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {history.slice(1).map((q) => (
                    <button
                      key={q}
                      onClick={() => { setQuery(q); handleSearch(q); }}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "#fff", border: "1px solid #D8D8D8", fontSize: 11, color: "#4A4A4A", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      <ArrowRight size={10} /> {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado inicial */}
        {!results && !isFetching && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#C0C0C0" }}>
            <Brain size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", marginBottom: 8 }}>
              BASE DE CONHECIMENTO OPERIS
            </div>
            <div style={{ fontSize: 13 }}>
              Digite uma pergunta ou selecione uma sugestão para consultar o sistema
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </SaasDashboardLayout>
  );
}

/**
 * ─── Web Search Panel — Busca Inteligente com Resumo IA ─────────────────────
 * JULY AOG | OPERIS Command Center
 *
 * Web Search Widget com integração a APIs de busca (Brave/Serper/Tavily)
 * Filtro técnico: React 19, tRPC, Docker, NBR/NFPA
 * Preview IA: resumo cirúrgico gerado pelo Gemma 2 local
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import {
  Search, Brain, ExternalLink, Clock, Filter,
  Loader2, AlertTriangle, BookOpen, Code, Flame,
  ChevronDown, ChevronUp, RefreshCw, X, Zap
} from "lucide-react";

// ─── Filtros técnicos predefinidos ────────────────────────────────────────────
const QUICK_FILTERS = [
  { label: "React 19", query: "React 19 documentation", icon: <Code className="w-3 h-3" />, color: "blue" },
  { label: "tRPC", query: "tRPC v11 documentation", icon: <Code className="w-3 h-3" />, color: "purple" },
  { label: "Docker", query: "Docker compose best practices", icon: <Code className="w-3 h-3" />, color: "cyan" },
  { label: "NBR 17240", query: "NBR 17240 norma incêndio", icon: <Flame className="w-3 h-3" />, color: "red" },
  { label: "NFPA 72", query: "NFPA 72 fire alarm standard", icon: <Flame className="w-3 h-3" />, color: "orange" },
  { label: "Ollama API", query: "Ollama REST API documentation", icon: <Brain className="w-3 h-3" />, color: "emerald" },
  { label: "NFS-e", query: "NFS-e API integração nota fiscal", icon: <BookOpen className="w-3 h-3" />, color: "amber" },
  { label: "Drizzle ORM", query: "Drizzle ORM documentation MySQL", icon: <Code className="w-3 h-3" />, color: "zinc" },
];

// ─── Card de resultado ────────────────────────────────────────────────────────
function SearchResultCard({ result, index }: { result: any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-zinc-500">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors line-clamp-1 flex items-center gap-1 group"
          >
            {result.title}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </a>
          <p className="text-xs text-zinc-500 truncate mt-0.5">{result.url}</p>
          {result.snippet && (
            <p className={`text-xs text-zinc-400 mt-1.5 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
              {result.snippet}
            </p>
          )}
          {result.snippet && result.snippet.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-zinc-600 hover:text-zinc-400 mt-1 flex items-center gap-1 transition-colors"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" /> Menos</> : <><ChevronDown className="w-3 h-3" /> Mais</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Painel Principal ─────────────────────────────────────────────────────────
export default function WebSearchPanel() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryModel, setSummaryModel] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchMutation = trpc.dgo.webSearch.search.useMutation();

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setIsSearching(true);
    setError(null);
    setSummary(null);
    setResults([]);
    setActiveQuery(q);
    const t0 = Date.now();

    try {
      const res = await searchMutation.mutateAsync({
        query: q.trim(),
        summarize: true,
        maxResults: 8,
      }) as any;

      setResults(res.results ?? []);
      setSummary(res.summary ?? null);
      setSummaryModel(res.summaryModel ?? null);
      setSearchTime(Date.now() - t0);
    } catch (err: any) {
      setError(err.message ?? "Erro na busca. Verifique a chave de API.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  const handleFilter = (filterQuery: string) => {
    setQuery(filterQuery);
    doSearch(filterQuery);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSummary(null);
    setError(null);
    setActiveQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-400" />
          Busca Técnica Inteligente
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Documentações técnicas + Normas de incêndio · Resumo gerado por IA local
        </p>
      </div>

      {/* Barra de busca */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar documentação, normas, APIs..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-semibold transition-all"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Buscar
          </button>
        </div>
      </form>

      {/* Filtros rápidos */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-500">Filtros técnicos rápidos</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_FILTERS.map(f => (
            <button
              key={f.label}
              onClick={() => handleFilter(f.query)}
              disabled={isSearching}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50 ${
                activeQuery === f.query
                  ? `bg-${f.color}-500/20 border-${f.color}-500/40 text-${f.color}-400`
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-400">Erro na busca</p>
            <p className="text-xs text-red-300/70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isSearching && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Buscando "{activeQuery}"...</span>
          </div>
          {/* Skeleton */}
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-2 bg-zinc-800 rounded w-1/2 mb-2" />
              <div className="h-2 bg-zinc-800 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Resultados */}
      {!isSearching && results.length > 0 && (
        <div className="space-y-4">
          {/* Resumo IA */}
          {summary && (
            <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">
                  Resumo Inteligente
                </span>
                {summaryModel && (
                  <span className="text-xs text-zinc-600 ml-auto">
                    via {summaryModel}
                  </span>
                )}
                <Zap className="w-3 h-3 text-amber-400" />
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span>{results.length} resultados</span>
            {searchTime && <span>· {(searchTime / 1000).toFixed(1)}s</span>}
            <span>· "{activeQuery}"</span>
          </div>

          {/* Lista de resultados */}
          <div className="space-y-2">
            {results.map((result: any, i: number) => (
              <SearchResultCard key={i} result={result} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!isSearching && results.length === 0 && !error && !activeQuery && (
        <div className="text-center py-8 text-zinc-700">
          <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Busque documentações técnicas e normas de engenharia.</p>
          <p className="text-xs mt-1">Use os filtros rápidos acima para começar.</p>
        </div>
      )}
    </div>
  );
}

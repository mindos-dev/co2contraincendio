/**
 * OPERIS.eng — Busca Semântica
 * Design: Procore/Autodesk — dark navy #0a1628, accent #f97316, Barlow Condensed
 * Equivalente visual ao frontend/index.html do script Python enviado pelo usuário
 */

import React, { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search, Database, FileText, BookOpen, Zap,
  ChevronRight, AlertTriangle, CheckCircle, Loader2,
  Plus, X, Upload
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: number;
  source: string;
  sourceType: string;
  title: string;
  content: string;
  normCode: string | null;
  section: string | null;
  riskLevel: string | null;
  tags: string[];
  score: number;
}

// ─── Risk Level Badge ─────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: string | null }) {
  if (!level) return null;
  const colors: Record<string, string> = {
    R1: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
    R2: "bg-blue-900/50 text-blue-300 border-blue-700",
    R3: "bg-amber-900/50 text-amber-300 border-amber-700",
    R4: "bg-orange-900/50 text-orange-300 border-orange-700",
    R5: "bg-red-900/50 text-red-300 border-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${colors[level] ?? "bg-gray-800 text-gray-300 border-gray-600"}`}>
      {level}
    </span>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f97316" : "#64748b";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono text-white/50 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Source Type Icon ─────────────────────────────────────────────────────────

function SourceIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactElement> = {
    norm: <BookOpen size={14} className="text-blue-400" />,
    manual: <FileText size={14} className="text-purple-400" />,
    inspection: <CheckCircle size={14} className="text-green-400" />,
    budget: <Database size={14} className="text-amber-400" />,
    custom: <Zap size={14} className="text-orange-400" />,
  };
  return icons[type] ?? <FileText size={14} className="text-gray-400" />;
}

// ─── Ingest Form ──────────────────────────────────────────────────────────────

function IngestForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    source: "",
    sourceType: "custom" as "norm" | "manual" | "inspection" | "budget" | "custom",
    title: "",
    content: "",
    normCode: "",
    section: "",
    riskLevel: "" as "" | "R1" | "R2" | "R3" | "R4" | "R5",
    tags: "",
  });

  const ingest = trpc.enge.search_ingest.useMutation({
    onSuccess: (data) => {
      toast.success(`Documento ingerido com sucesso (id=${data.id})`);
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ingest.mutate({
      source: form.source,
      sourceType: form.sourceType,
      title: form.title,
      content: form.content,
      normCode: form.normCode || undefined,
      section: form.section || undefined,
      riskLevel: (form.riskLevel || undefined) as "R1" | "R2" | "R3" | "R4" | "R5" | undefined,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1f3a] border border-white/10 rounded-lg w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-['Barlow_Condensed'] font-bold text-white text-lg tracking-wide uppercase">
            Ingerir Documento
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Fonte *</label>
              <Input
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                placeholder="ex: NBR 12615"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Tipo</label>
              <select
                value={form.sourceType}
                onChange={e => setForm(f => ({ ...f, sourceType: e.target.value as typeof form.sourceType }))}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2"
              >
                <option value="norm">Norma</option>
                <option value="manual">Manual</option>
                <option value="inspection">Inspeção</option>
                <option value="budget">Orçamento</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Título *</label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="ex: NBR 12615 — Concentração de projeto"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Conteúdo *</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Texto do documento a ser indexado semanticamente..."
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2 placeholder:text-white/30 resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Código Norma</label>
              <Input
                value={form.normCode}
                onChange={e => setForm(f => ({ ...f, normCode: e.target.value }))}
                placeholder="NBR12615"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Seção</label>
              <Input
                value={form.section}
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                placeholder="5.3.2"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Risco</label>
              <select
                value={form.riskLevel}
                onChange={e => setForm(f => ({ ...f, riskLevel: e.target.value as typeof form.riskLevel }))}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2"
              >
                <option value="">—</option>
                <option value="R1">R1</option>
                <option value="R2">R2</option>
                <option value="R3">R3</option>
                <option value="R4">R4</option>
                <option value="R5">R5</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Tags (separadas por vírgula)</label>
            <Input
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="CO2, extinção, NBR"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/60 hover:text-white">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={ingest.isPending}
              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-['Barlow_Condensed'] font-bold uppercase tracking-wide"
            >
              {ingest.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Upload size={14} className="mr-1" />}
              Ingerir
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OperisEngSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [showIngest, setShowIngest] = useState(false);
  const [topK, setTopK] = useState(5);
  const inputRef = useRef<HTMLInputElement>(null);

  const statsQuery = trpc.enge.search_getStats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const searchMutation = trpc.enge.search_query.useQuery(
    { query, topK },
    {
      enabled: false,
    }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) {
      toast.warning("Digite pelo menos 2 caracteres para buscar.");
      return;
    }
    const result = await searchMutation.refetch();
    if (result.data) {
      setResults(result.data as SearchResult[]);
      setSearched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch(e as unknown as React.FormEvent);
  };

  const stats = statsQuery.data;

  return (
    <SaasDashboardLayout>
      <div className="min-h-screen bg-[#060f1e] text-white">
        {/* Header */}
        <div className="border-b border-white/10 bg-[#0a1628]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#f97316]/20 border border-[#f97316]/30 flex items-center justify-center">
                <Search size={16} className="text-[#f97316]" />
              </div>
              <div>
                <h1 className="font-['Barlow_Condensed'] font-bold text-white text-lg tracking-widest uppercase">
                  OPERIS.eng — Busca Semântica
                </h1>
                <p className="text-xs text-white/40">Motor RAG · NBR/NFPA · Cosine Similarity</p>
              </div>
            </div>
            <Button
              onClick={() => setShowIngest(true)}
              className="bg-[#f97316]/10 border border-[#f97316]/30 text-[#f97316] hover:bg-[#f97316]/20 font-['Barlow_Condensed'] font-bold uppercase tracking-wide text-xs"
              variant="outline"
            >
              <Plus size={14} className="mr-1" />
              Ingerir Documento
            </Button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total de Chunks", value: stats.totalChunks, icon: <Database size={14} /> },
                { label: "Base Global", value: stats.globalChunks, icon: <BookOpen size={14} /> },
                { label: "Fontes", value: stats.sources.length, icon: <FileText size={14} /> },
                { label: "Índice", value: stats.indexLoaded ? "Ativo" : "Carregando", icon: <Zap size={14} />, highlight: stats.indexLoaded },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0f1f3a]/60 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                  <div className="text-[#f97316]/70">{stat.icon}</div>
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
                    <div className={`font-['Barlow_Condensed'] font-bold text-base ${stat.highlight !== undefined ? (stat.highlight ? "text-emerald-400" : "text-amber-400") : "text-white"}`}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Box */}
          <div className="bg-[#0f1f3a]/60 border border-white/10 rounded-lg p-5">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar norma, seção, requisito técnico... (ex: concentração CO2 inundação total)"
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm h-11"
                />
              </div>
              <select
                value={topK}
                onChange={e => setTopK(Number(e.target.value))}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2 w-24"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
              </select>
              <Button
                type="submit"
                disabled={searchMutation.isFetching}
                className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-['Barlow_Condensed'] font-bold uppercase tracking-wide h-11 px-6"
              >
                {searchMutation.isFetching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Search size={14} className="mr-1" />
                    Buscar
                  </>
                )}
              </Button>
            </form>

            {/* Quick searches */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                "concentração CO2 inundação total",
                "manutenção extintor periodicidade",
                "detector fumaça NBR 17240",
                "brigada incêndio dimensionamento",
                "sprinkler NFPA 13 hydraulic",
              ].map(q => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); setTimeout(() => inputRef.current?.form?.requestSubmit(), 50); }}
                  className="text-xs text-white/40 hover:text-[#f97316] border border-white/10 hover:border-[#f97316]/30 rounded px-2 py-1 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {searchMutation.error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg p-4 text-sm">
              <AlertTriangle size={16} />
              {searchMutation.error.message}
            </div>
          )}

          {searched && results.length === 0 && !searchMutation.isFetching && (
            <div className="text-center py-12 text-white/30">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum resultado encontrado para "<span className="text-white/50">{query}</span>"</p>
              <p className="text-xs mt-1">Tente termos diferentes ou ingira novos documentos no índice.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  {results.length} resultado{results.length !== 1 ? "s" : ""} para "{query}"
                </p>
                <p className="text-xs text-white/30">Ordenado por similaridade semântica</p>
              </div>

              {results.map((result, idx) => (
                <div
                  key={result.id}
                  className="bg-[#0f1f3a]/60 border border-white/10 hover:border-[#f97316]/30 rounded-lg p-4 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="mt-0.5 flex-shrink-0">
                        <SourceIcon type={result.sourceType} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-sm leading-tight group-hover:text-[#f97316] transition-colors">
                          {result.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-white/40 font-mono">{result.source}</span>
                          {result.section && (
                            <>
                              <ChevronRight size={10} className="text-white/20" />
                              <span className="text-xs text-white/40 font-mono">{result.section}</span>
                            </>
                          )}
                          {result.normCode && (
                            <Badge variant="outline" className="text-xs border-blue-800/50 text-blue-400 bg-blue-900/20 px-1.5 py-0">
                              {result.normCode}
                            </Badge>
                          )}
                          <RiskBadge level={result.riskLevel} />
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs text-white/30 mb-1">#{idx + 1}</div>
                      <div className="w-24">
                        <ScoreBar score={result.score} />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-white/60 leading-relaxed line-clamp-3 mt-2">
                    {result.content}
                  </p>

                  {result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {result.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="text-xs text-white/30 hover:text-[#f97316] border border-white/10 hover:border-[#f97316]/30 rounded px-1.5 py-0.5 transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!searched && !searchMutation.isFetching && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-[#f97316]/60" />
              </div>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-xl uppercase tracking-wider mb-2">
                Motor RAG · OPERIS.eng
              </h2>
              <p className="text-white/40 text-sm max-w-md mx-auto">
                Busca semântica sobre a base de normas NBR/NFPA. Faça uma pergunta técnica ou busque por seção específica.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-8 max-w-lg mx-auto">
                {[
                  { norm: "NBR 12615", desc: "CO₂ — Sistemas fixos" },
                  { norm: "NBR 15808", desc: "Extintores portáteis" },
                  { norm: "NFPA 12", desc: "Carbon Dioxide Systems" },
                  { norm: "NBR 17240", desc: "Detecção e alarme" },
                  { norm: "NFPA 13", desc: "Sprinkler Systems" },
                  { norm: "NBR 14276", desc: "Brigada de incêndio" },
                ].map(n => (
                  <button
                    key={n.norm}
                    onClick={() => { setQuery(n.norm); setTimeout(() => inputRef.current?.form?.requestSubmit(), 50); }}
                    className="bg-[#0f1f3a]/60 border border-white/10 hover:border-[#f97316]/30 rounded-lg p-3 text-left transition-all group"
                  >
                    <div className="font-['Barlow_Condensed'] font-bold text-white text-sm group-hover:text-[#f97316] transition-colors">
                      {n.norm}
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">{n.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showIngest && (
        <IngestForm
          onClose={() => setShowIngest(false)}
          onSuccess={() => statsQuery.refetch()}
        />
      )}
    </SaasDashboardLayout>
  );
}

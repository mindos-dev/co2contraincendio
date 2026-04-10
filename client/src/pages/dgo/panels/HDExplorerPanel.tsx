/**
 * ─── HD Explorer Panel — Explorador do HD 1TB ────────────────────────────────
 * ENTREGA DIAMANTE | Módulo 2: Explorador HD 1TB
 *
 * Acesso rápido a orçamentos e auditorias do projeto Ecences
 * Montado em /media/aleixo/BACKUP_CO2/
 * HD: WDC WD10PURX (1TB)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import {
  HardDrive, Folder, File, FileText, ArrowLeft, RefreshCw,
  Download, Search, ChevronRight, AlertTriangle, Loader2,
  BarChart3, FolderOpen, FileSpreadsheet, Archive, Image
} from "lucide-react";

// ─── Paleta dark industrial ───────────────────────────────────────────────────
const D = {
  bg:      "bg-[#0a0a0a]",
  s1:      "bg-[#111111]",
  s2:      "bg-[#161616]",
  s3:      "bg-[#1a1a1a]",
  b1:      "border-[#222222]",
  b2:      "border-[#2a2a2a]",
  text:    "text-[#e5e5e5]",
  muted:   "text-[#888888]",
  dim:     "text-[#555555]",
};

// ─── Ícone por extensão ───────────────────────────────────────────────────────
function FileIcon({ name, isDir }: { name: string; isDir: boolean }) {
  if (isDir) return <Folder className="w-4 h-4 text-orange-400" />;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext))       return <FileText className="w-4 h-4 text-red-400" />;
  if (["xlsx","xls","csv"].includes(ext)) return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
  if (["zip","tar","gz"].includes(ext))   return <Archive className="w-4 h-4 text-yellow-400" />;
  if (["jpg","png","jpeg","webp"].includes(ext)) return <Image className="w-4 h-4 text-blue-400" />;
  return <File className="w-4 h-4 text-[#555]" />;
}

// ─── Formatar tamanho ─────────────────────────────────────────────────────────
function fmtSize(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

// ─── Formatar data ────────────────────────────────────────────────────────────
function fmtDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

// ─── Barra de uso do disco ────────────────────────────────────────────────────
function DiskBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const color = pct > 85 ? "bg-red-500" : pct > 65 ? "bg-yellow-500" : "bg-orange-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className={D.muted}>Uso do HD 1TB</span>
        <span className={pct > 85 ? "text-red-400" : "text-orange-400"}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] font-mono">
        <span className={D.dim}>{fmtSize(used)} usado</span>
        <span className={D.dim}>{fmtSize(total - used)} livre</span>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function HDExplorerPanel() {
  const [currentPath, setCurrentPath] = useState("/media/aleixo/BACKUP_CO2");
  const [searchTerm, setSearchTerm]   = useState("");
  const [selected, setSelected]       = useState<string | null>(null);

  const diskInfo = trpc.dgo.system.diskInfo.useQuery(
    { path: "/media/aleixo/BACKUP_CO2" },
    { refetchInterval: 30_000, retry: false }
  );

  const dirList = trpc.dgo.system.listDirectory.useQuery(
    { path: currentPath },
    { retry: false, refetchOnWindowFocus: false }
  );

  const disk = diskInfo.data as any;
  const entries = (dirList.data as any[]) ?? [];

  // Filtrar por busca
  const filtered = entries.filter((e: any) =>
    !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separar pastas e arquivos
  const dirs  = filtered.filter((e: any) => e.isDirectory).sort((a: any, b: any) => a.name.localeCompare(b.name));
  const files = filtered.filter((e: any) => !e.isDirectory).sort((a: any, b: any) => a.name.localeCompare(b.name));

  const navigate = useCallback((entry: any) => {
    if (entry.isDirectory) {
      setCurrentPath(entry.path);
      setSelected(null);
      setSearchTerm("");
    } else {
      setSelected(entry.path === selected ? null : entry.path);
    }
  }, [selected]);

  const goUp = () => {
    const parts = currentPath.split("/");
    if (parts.length > 2) {
      parts.pop();
      setCurrentPath(parts.join("/"));
      setSelected(null);
    }
  };

  // Breadcrumb
  const breadcrumbs = currentPath.split("/").filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-sm font-mono font-bold ${D.text} tracking-wider flex items-center gap-2`}>
            <HardDrive className="w-4 h-4 text-orange-400" />
            HD 1TB — BACKUP_CO2
          </h2>
          <p className={`text-xs ${D.muted} mt-0.5`}>WDC WD10PURX · /media/aleixo/BACKUP_CO2/</p>
        </div>
        <button
          onClick={() => dirList.refetch()}
          className={`p-2 rounded ${D.s2} border ${D.b1} ${D.muted} hover:text-orange-400 transition-colors`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${dirList.isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Barra de uso do disco */}
      {disk && (
        <div className={`${D.s1} border ${D.b1} rounded-lg p-4`}>
          <DiskBar used={disk.used ?? 0} total={disk.total ?? 1} />
        </div>
      )}

      {/* Atalhos rápidos */}
      <div className={`${D.s1} border ${D.b1} rounded-lg p-3`}>
        <p className={`text-[10px] font-mono font-bold ${D.dim} tracking-widest mb-2`}>ATALHOS RÁPIDOS</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Orçamentos",  path: "/media/aleixo/BACKUP_CO2/orcamentos" },
            { label: "Auditorias",  path: "/media/aleixo/BACKUP_CO2/auditorias" },
            { label: "Projetos",    path: "/media/aleixo/BACKUP_CO2/projetos" },
            { label: "Ecences",     path: "/media/aleixo/BACKUP_CO2/ecences" },
            { label: "Raiz",        path: "/media/aleixo/BACKUP_CO2" },
          ].map((s) => (
            <button
              key={s.path}
              onClick={() => { setCurrentPath(s.path); setSelected(null); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono ${
                currentPath === s.path
                  ? "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                  : `${D.s2} border ${D.b2} ${D.muted} hover:text-orange-400 hover:border-orange-500/20`
              } transition-all`}
            >
              <FolderOpen className="w-3 h-3" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explorador */}
      <div className={`${D.s1} border ${D.b1} rounded-lg overflow-hidden`}>
        {/* Toolbar */}
        <div className={`flex items-center gap-2 px-3 py-2.5 border-b ${D.b1} ${D.s2}`}>
          {/* Voltar */}
          <button
            onClick={goUp}
            disabled={currentPath === "/media/aleixo/BACKUP_CO2"}
            className={`p-1.5 rounded ${D.muted} hover:text-orange-400 disabled:opacity-30 transition-colors`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
            {breadcrumbs.map((part, i) => (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                {i > 0 && <ChevronRight className={`w-3 h-3 ${D.dim}`} />}
                <button
                  onClick={() => {
                    const newPath = "/" + breadcrumbs.slice(0, i + 1).join("/");
                    setCurrentPath(newPath);
                  }}
                  className={`text-xs font-mono ${
                    i === breadcrumbs.length - 1 ? "text-orange-400" : D.muted
                  } hover:text-orange-400 transition-colors`}
                >
                  {part}
                </button>
              </div>
            ))}
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className={`absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 ${D.dim}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar..."
              className={`pl-6 pr-2 py-1 text-xs font-mono ${D.s1} border ${D.b1} rounded ${D.text} placeholder:${D.dim} focus:outline-none focus:border-orange-500/40 w-32`}
            />
          </div>
        </div>

        {/* Lista de arquivos */}
        <div className="overflow-y-auto max-h-96">
          {dirList.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
            </div>
          ) : dirList.isError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <p className={`text-xs ${D.muted}`}>Diretório não encontrado ou sem permissão</p>
              <p className={`text-[10px] font-mono ${D.dim}`}>{currentPath}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <FolderOpen className={`w-8 h-8 ${D.dim}`} />
              <p className={`text-xs ${D.muted}`}>Pasta vazia ou nenhum resultado</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className={`border-b ${D.b1}`}>
                  <th className={`text-left px-3 py-2 text-[10px] font-mono font-bold ${D.dim} tracking-widest`}>NOME</th>
                  <th className={`text-right px-3 py-2 text-[10px] font-mono font-bold ${D.dim} tracking-widest hidden sm:table-cell`}>TAMANHO</th>
                  <th className={`text-right px-3 py-2 text-[10px] font-mono font-bold ${D.dim} tracking-widest hidden md:table-cell`}>MODIFICADO</th>
                </tr>
              </thead>
              <tbody>
                {[...dirs, ...files].map((entry: any, i: number) => (
                  <tr
                    key={i}
                    onClick={() => navigate(entry)}
                    className={`cursor-pointer border-b ${D.b1} transition-colors ${
                      selected === entry.path
                        ? "bg-orange-500/5 border-l-2 border-l-orange-500/40"
                        : "hover:bg-[#161616]"
                    }`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FileIcon name={entry.name} isDir={entry.isDirectory} />
                        <span className={`text-xs font-mono ${entry.isDirectory ? "text-orange-300" : D.text} truncate max-w-xs`}>
                          {entry.name}
                        </span>
                        {entry.isDirectory && (
                          <ChevronRight className={`w-3 h-3 ${D.dim} ml-auto flex-shrink-0`} />
                        )}
                      </div>
                    </td>
                    <td className={`px-3 py-2 text-right text-xs font-mono ${D.muted} hidden sm:table-cell`}>
                      {entry.isDirectory ? "—" : fmtSize(entry.size)}
                    </td>
                    <td className={`px-3 py-2 text-right text-xs font-mono ${D.dim} hidden md:table-cell`}>
                      {fmtDate(entry.modified)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer da lista */}
        <div className={`px-3 py-2 border-t ${D.b1} ${D.s2} flex items-center justify-between`}>
          <span className={`text-[10px] font-mono ${D.dim}`}>
            {dirs.length} pasta(s) · {files.length} arquivo(s)
          </span>
          {selected && (
            <span className={`text-[10px] font-mono text-orange-400`}>
              Selecionado: {selected.split("/").pop()}
            </span>
          )}
        </div>
      </div>

      {/* Info do arquivo selecionado */}
      {selected && (
        <div className={`${D.s1} border border-orange-500/20 rounded-lg p-4`}>
          <p className={`text-[10px] font-mono font-bold ${D.dim} tracking-widest mb-2`}>ARQUIVO SELECIONADO</p>
          <p className={`text-xs font-mono text-orange-300 break-all`}>{selected}</p>
        </div>
      )}
    </div>
  );
}

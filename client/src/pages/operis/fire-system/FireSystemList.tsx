/**
 * FireSystemList — Lista de Vistorias de Sistemas Fixos de Incêndio
 * Módulo add-on: requer plano Industrial
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { FireSystemPaywallGuard } from "@/components/FireSystemPaywallGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Flame, Plus, Search, Eye, ClipboardCheck,
  AlertTriangle, CheckCircle2, Clock, XCircle
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Rascunho", color: "bg-slate-700 text-slate-300", icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: "Em Andamento", color: "bg-blue-900/50 text-blue-300 border border-blue-700", icon: <Clock className="h-3 w-3" /> },
  completed: { label: "Concluída", color: "bg-green-900/50 text-green-300 border border-green-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  approved: { label: "Aprovada", color: "bg-emerald-900/50 text-emerald-300 border border-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: "Rejeitada", color: "bg-red-900/50 text-red-300 border border-red-700", icon: <XCircle className="h-3 w-3" /> },
};

const RISK_CONFIG: Record<string, { label: string; color: string }> = {
  R1: { label: "R1 — Baixíssimo", color: "bg-green-900/50 text-green-300 border border-green-700" },
  R2: { label: "R2 — Baixo", color: "bg-teal-900/50 text-teal-300 border border-teal-700" },
  R3: { label: "R3 — Moderado", color: "bg-yellow-900/50 text-yellow-300 border border-yellow-700" },
  R4: { label: "R4 — Alto", color: "bg-orange-900/50 text-orange-300 border border-orange-700" },
  R5: { label: "R5 — Crítico", color: "bg-red-900/50 text-red-300 border border-red-700" },
};

function FireSystemListContent() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? 0;
  const [search, setSearch] = useState("");

  const { data: inspections, isLoading } = trpc.fireSystem.list.useQuery(
    { companyId, limit: 100, offset: 0 },
    { enabled: companyId > 0 }
  );

  const { data: stats } = trpc.fireSystem.stats.useQuery(
    { companyId },
    { enabled: companyId > 0 }
  );

  const filtered = (inspections ?? []).filter((i) =>
    !search ||
    i.inspectionNumber.toLowerCase().includes(search.toLowerCase()) ||
    i.enterpriseName.toLowerCase().includes(search.toLowerCase()) ||
    (i.storeName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--operis-bg,#0A1628)] text-white p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/20 rounded-xl border border-orange-500/30">
            <Flame className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Sistemas Fixos de Incêndio</h1>
            <p className="text-slate-400 text-xs">NBR 14518:2019 · 16 seções · 53 itens</p>
          </div>
        </div>
        <Link href="/app/fire-system/nova">
          <Button className="bg-orange-600 hover:bg-orange-500 text-white gap-2">
            <Plus className="h-4 w-4" />
            Nova Vistoria
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Concluídas", value: stats.completed, color: "text-green-400" },
            { label: "Em Andamento", value: stats.inProgress, color: "text-blue-400" },
            { label: "Rascunhos", value: stats.draft, color: "text-slate-400" },
            { label: "Score Médio", value: `${stats.avgScore}%`, color: "text-orange-400" },
            { label: "Críticas", value: stats.critical, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por número, empresa ou loja..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma vistoria encontrada</p>
          <p className="text-sm mt-1">Crie a primeira vistoria de sistema fixo de incêndio</p>
        </div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60 border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Número</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Empresa / Loja</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Inspetor</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Score</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Risco</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((insp) => {
                const status = STATUS_CONFIG[insp.status] ?? STATUS_CONFIG.draft;
                const risk = RISK_CONFIG[insp.riskClassification ?? "R3"] ?? RISK_CONFIG.R3;
                const score = parseFloat(insp.scoreTotal ?? "0");
                return (
                  <tr key={insp.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-orange-300 text-xs">{insp.inspectionNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{insp.enterpriseName}</p>
                      {insp.storeName && <p className="text-slate-400 text-xs">{insp.storeName}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-300 hidden md:table-cell">{insp.inspectorName}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5 w-16">
                          <div
                            className="h-1.5 rounded-full bg-orange-500"
                            style={{ width: `${Math.min(score, 100)}%` }}
                          />
                        </div>
                        <span className="text-slate-300 text-xs w-10">{score}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${risk.color}`}>{risk.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs flex items-center gap-1 w-fit ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/app/fire-system/${insp.id}`}>
                        <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300 h-7 px-2">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Ver
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rodapé normativo */}
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
        <AlertTriangle className="h-3.5 w-3.5 text-orange-500/60" />
        <span>NBR 14518:2019 · NBR 13714 · IT-16/CBMMG · Eng. Judson Aleixo Sampaio CREA/MG 142203671-5</span>
      </div>
    </div>
  );
}

export default function FireSystemList() {
  return (
    <FireSystemPaywallGuard>
      <FireSystemListContent />
    </FireSystemPaywallGuard>
  );
}

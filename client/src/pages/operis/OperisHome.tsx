import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Zap,
  Shield,
  Activity,
} from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  R1: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  R2: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  R3: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  R4: "bg-red-500/10 text-red-400 border-red-500/30",
  R5: "bg-red-900/30 text-red-300 border-red-700/50",
};

const STATUS_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  em_progresso: { label: "Em Progresso", icon: <Clock className="w-3 h-3" />, color: "text-yellow-400" },
  concluida: { label: "Concluída", icon: <CheckCircle2 className="w-3 h-3" />, color: "text-emerald-400" },
  revisao: { label: "Em Revisão", icon: <AlertTriangle className="w-3 h-3" />, color: "text-orange-400" },
};

export default function OperisHome() {
  const { data: inspections, isLoading } = trpc.operis.listInspections.useQuery({ limit: 20 });
  const { data: systems } = trpc.operis.getSystems.useQuery();

  const stats = {
    total: inspections?.length ?? 0,
    concluidas: inspections?.filter((i) => i.status === "concluida").length ?? 0,
    em_progresso: inspections?.filter((i) => i.status === "em_progresso").length ?? 0,
    criticas: inspections?.filter((i) => i.globalRisk === "R4" || i.globalRisk === "R5").length ?? 0,
  };

  return (
    <SaasDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#e63946]" />
              OPERIS IA
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Motor de Inspeção Técnica com Inteligência Artificial
            </p>
          </div>
          <Link href="/operis/nova">
            <Button className="bg-[#e63946] hover:bg-[#c1121f] text-white gap-2">
              <Plus className="w-4 h-4" />
              Nova Inspeção
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: <ClipboardList className="w-5 h-5" />, color: "text-blue-400" },
            { label: "Concluídas", value: stats.concluidas, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-400" },
            { label: "Em Progresso", value: stats.em_progresso, icon: <Activity className="w-5 h-5" />, color: "text-yellow-400" },
            { label: "Críticas", value: stats.criticas, icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-[#0d1f35] border-slate-700/50">
              <CardContent className="p-4">
                <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sistemas Disponíveis */}
        <Card className="bg-[#0d1f35] border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#e63946]" />
              Sistemas com Checklist IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {systems?.map((sys) => (
                <Link key={sys.id} href={`/operis/nova?system=${sys.id}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer border-slate-600 text-slate-300 hover:border-[#e63946] hover:text-[#e63946] transition-colors"
                  >
                    {sys.name} ({sys.itemCount} itens)
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Inspeções */}
        <Card className="bg-[#0d1f35] border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#e63946]" />
              Inspeções Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !inspections || inspections.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Nenhuma inspeção encontrada</p>
                <p className="text-slate-500 text-xs mt-1">
                  Crie sua primeira inspeção técnica com análise de IA
                </p>
                <Link href="/operis/nova">
                  <Button className="mt-4 bg-[#e63946] hover:bg-[#c1121f] text-white" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Inspeção
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {inspections.map((inspection) => {
                  const statusInfo = STATUS_LABELS[inspection.status] ?? STATUS_LABELS.em_progresso;
                  const riskClass = RISK_COLORS[inspection.globalRisk ?? "R1"];
                  return (
                    <Link key={inspection.id} href={`/operis/inspecao/${inspection.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition-colors cursor-pointer border border-slate-700/30 hover:border-slate-600/50">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm truncate">
                            {inspection.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {inspection.client} · {inspection.location} · {inspection.system}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <Badge
                            variant="outline"
                            className={`text-xs ${riskClass}`}
                          >
                            {inspection.globalRisk ?? "R1"}
                          </Badge>
                          <span className={`text-xs flex items-center gap-1 ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span className="hidden sm:inline">{statusInfo.label}</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SaasDashboardLayout>
  );
}

import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  ClipboardCheck,
  Wifi,
  WifiOff,
  ChevronRight,
  Flame,
  Wind,
  Zap,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  incendio: { label: "Incêndio", icon: <Flame className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-50" },
  pmoc: { label: "PMOC", icon: <Wind className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-50" },
  eletrica: { label: "Elétrica", icon: <Zap className="w-4 h-4" />, color: "text-yellow-600", bg: "bg-yellow-50" },
  outros: { label: "Outros", icon: <ClipboardList className="w-4 h-4" />, color: "text-gray-600", bg: "bg-gray-50" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  em_andamento: { label: "Em andamento", color: "text-yellow-600", icon: <Clock className="w-3.5 h-3.5" /> },
  concluida: { label: "Concluída", color: "text-green-600", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  rascunho: { label: "Rascunho", color: "text-gray-500", icon: <ClipboardList className="w-3.5 h-3.5" /> },
  cancelada: { label: "Cancelada", color: "text-red-500", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

export default function MobileDashboard() {
  const [, navigate] = useLocation();
  const { isOnline, pendingCount, isSyncing, syncPending } = useOfflineSync();

  const { data: inspections } = trpc.field.listInspections.useQuery({ limit: 5 });
  const { data: reports } = trpc.field.listReports.useQuery({ limit: 3 });

  const handleSync = async () => {
    const count = await syncPending();
    if (count && count > 0) toast.success(`${count} vistoria(s) sincronizada(s)!`);
    else toast.info("Nenhuma vistoria pendente para sincronizar.");
  };

  const emAndamento = inspections?.filter(i => i.status === "em_andamento").length ?? 0;
  const concluidas = inspections?.filter(i => i.status === "concluida").length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0a1628] text-white px-4 pt-safe-top pb-6">
        <div className="flex items-center justify-between pt-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-white/60 font-medium">OPERIS</div>
                <div className="text-sm font-bold leading-tight">CO2 Contra Incêndio</div>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
            isOnline ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
          }`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? "Online" : "Offline"}
          </div>
          {pendingCount > 0 && (
            <button
              onClick={handleSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-300"
            >
              {isSyncing ? "Sincronizando..." : `${pendingCount} pendente(s)`}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/10 rounded-2xl p-3">
            <div className="text-2xl font-bold">{emAndamento}</div>
            <div className="text-xs text-white/60 mt-0.5">Em andamento</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3">
            <div className="text-2xl font-bold">{concluidas}</div>
            <div className="text-xs text-white/60 mt-0.5">Concluídas</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-4">
        <button
          onClick={() => navigate("/mobile/nova-vistoria")}
          className="w-full bg-[#C8102E] text-white rounded-2xl p-4 flex items-center gap-4 shadow-lg active:scale-95 transition-all"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus className="w-7 h-7" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base">Nova Vistoria</div>
            <div className="text-xs text-white/70 mt-0.5">Iniciar checklist de campo</div>
          </div>
          <ChevronRight className="w-5 h-5 ml-auto text-white/60" />
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/mobile/historico")}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800">Histórico</span>
          <span className="text-xs text-gray-400">Laudos anteriores</span>
        </button>
        <button
          onClick={() => navigate("/app/dashboard")}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-[#0a1628]/10 rounded-xl flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-[#0a1628]" />
          </div>
          <span className="text-sm font-semibold text-gray-800">Dashboard</span>
          <span className="text-xs text-gray-400">Painel completo</span>
        </button>
      </div>

      {/* Recent Inspections */}
      {inspections && inspections.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">Vistorias Recentes</h2>
            <button
              onClick={() => navigate("/mobile/historico")}
              className="text-xs text-[#C8102E] font-semibold"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-2">
            {inspections.slice(0, 5).map(inspection => {
              const typeConfig = TYPE_CONFIG[inspection.type] ?? TYPE_CONFIG.outros;
              const statusConfig = STATUS_CONFIG[inspection.status] ?? STATUS_CONFIG.rascunho;
              const date = new Date(inspection.createdAt).toLocaleDateString("pt-BR");

              return (
                <button
                  key={inspection.id}
                  onClick={() => {
                    if (inspection.status === "em_andamento") {
                      navigate(`/mobile/checklist/${inspection.id}`);
                    } else {
                      navigate(`/mobile/laudo/${inspection.id}`);
                    }
                  }}
                  className="w-full bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-3 text-left active:scale-95 transition-all"
                >
                  <div className={`w-9 h-9 rounded-xl ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className={typeConfig.color}>{typeConfig.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{inspection.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`flex items-center gap-1 text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-gray-400">· {date}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!inspections || inspections.length === 0) && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
          <ClipboardCheck className="w-16 h-16 text-gray-200 mb-4" />
          <p className="text-gray-600 font-semibold">Nenhuma vistoria ainda</p>
          <p className="text-gray-400 text-sm mt-1">
            Toque em "Nova Vistoria" para começar sua primeira inspeção de campo
          </p>
        </div>
      )}

      {/* Bottom padding for safe area */}
      <div className="h-24" />
    </div>
  );
}

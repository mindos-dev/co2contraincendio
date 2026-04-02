import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Flame,
  Wind,
  Zap,
  ClipboardList,
  Download,
  Eye,
  ChevronRight,
  Filter,
  Bell,
  BellOff,
  Loader2,
  Calendar,
  X,
} from "lucide-react";

type FilterType = "todos" | "incendio" | "pmoc" | "eletrica" | "outros";

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  incendio: { label: "Incêndio", icon: <Flame className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-50" },
  pmoc: { label: "PMOC", icon: <Wind className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-50" },
  eletrica: { label: "Elétrica", icon: <Zap className="w-4 h-4" />, color: "text-yellow-600", bg: "bg-yellow-50" },
  outros: { label: "Outros", icon: <ClipboardList className="w-4 h-4" />, color: "text-gray-600", bg: "bg-gray-50" },
};

export default function HistoricoLaudos() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<FilterType>("todos");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilters, setShowDateFilters] = useState(false);

  const { isSubscribed, isLoading: pushLoading, permission, subscribe, unsubscribe, isSupported } = usePushNotifications();

  const queryInput = useMemo(() => ({
    type: filter === "todos" ? undefined : (filter as "pmoc" | "incendio" | "eletrica" | "outros"),
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: 50,
    offset: 0,
  }), [filter, startDate, endDate]);

  const { data: reports, isLoading } = trpc.field.listReports.useQuery(queryInput);

  const activeDateFilters = [startDate, endDate].filter(Boolean).length;

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast.success("Notificações desativadas.");
    } else {
      await subscribe();
      if (permission === "granted") toast.success("Notificações ativadas! Você receberá alertas de manutenção.");
    }
  };

  const handleDownloadPDF = (content: string, title: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>@media print { body { margin: 0; } @page { margin: 1.5cm; size: A4; } }</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const selectedReportData = reports?.find(r => String(r.report.id) === selectedReport);

  if (selectedReport && selectedReportData?.report.content) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="bg-[#0a1628] text-white px-4 pt-safe-top pb-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={() => setSelectedReport(null)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-base font-bold">Laudo #{selectedReportData.report.id}</h1>
              <p className="text-xs text-white/60">
                {selectedReportData.inspection?.title ?? "Vistoria"}
              </p>
            </div>
            <button
              onClick={() => handleDownloadPDF(
                selectedReportData.report.content!,
                selectedReportData.inspection?.title ?? "Laudo"
              )}
              className="flex items-center gap-1.5 bg-[#C8102E] text-white text-sm font-bold px-4 py-2 rounded-xl"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
        <div
          className="flex-1 overflow-auto p-4"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedReportData.report.content, { ADD_TAGS: ["style"], ADD_ATTR: ["class", "style"] }) }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0a1628] text-white px-4 pt-safe-top pb-4">
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => navigate("/mobile")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">Histórico de Laudos</h1>
            <p className="text-xs text-white/60">{reports?.length ?? 0} laudo(s) encontrado(s)</p>
          </div>
          <div className="flex items-center gap-2">
            {isSupported && (
              <button
                onClick={handlePushToggle}
                disabled={pushLoading}
                className={`p-2 rounded-xl transition-colors ${isSubscribed ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/60"}`}
                title={isSubscribed ? "Notificações ativas" : "Ativar notificações"}
              >
                {pushLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
            )}
            <button onClick={() => setShowDateFilters(!showDateFilters)} className="relative p-2 rounded-xl bg-white/10 text-white/70">
              <Filter className="w-5 h-5" />
              {activeDateFilters > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C8102E] rounded-full text-white text-xs flex items-center justify-center">{activeDateFilters}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros de data */}
      {showDateFilters && (
        <div className="bg-white border-b border-gray-100 px-4 py-3 space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Início</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 rounded-xl border-gray-200 text-sm" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Fim</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 rounded-xl border-gray-200 text-sm" />
            </div>
          </div>
          {activeDateFilters > 0 && (
            <Button variant="outline" size="sm" onClick={() => { setStartDate(""); setEndDate(""); }} className="w-full gap-1.5 text-gray-500 border-dashed">
              <X className="w-3.5 h-3.5" /> Limpar datas
            </Button>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(["todos", "incendio", "pmoc", "eletrica", "outros"] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f
                  ? "bg-[#0a1628] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {f === "todos" ? "Todos" : TYPE_CONFIG[f]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Nenhum laudo encontrado</p>
            <p className="text-gray-400 text-sm mt-1">Crie uma nova vistoria para gerar laudos</p>
            <Button
              onClick={() => navigate("/mobile/nova-vistoria")}
              className="mt-4 bg-[#C8102E] hover:bg-[#a50d25] text-white rounded-xl"
            >
              Nova Vistoria
            </Button>
          </div>
        ) : (
          reports.map(({ report, inspection }) => {
            const typeConfig = TYPE_CONFIG[report.type] ?? TYPE_CONFIG.outros;
            const date = new Date(report.createdAt).toLocaleDateString("pt-BR");
            const time = new Date(report.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className={typeConfig.color}>{typeConfig.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${typeConfig.color}`}>{typeConfig.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          report.status === "pronto"
                            ? "bg-green-100 text-green-700"
                            : report.status === "gerando"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {report.status === "pronto" ? "Pronto" : report.status === "gerando" ? "Gerando..." : "Erro"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                        {inspection?.title ?? `Laudo #${report.id}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{date} às {time}</p>
                    </div>
                  </div>
                </div>

                {report.status === "pronto" && report.content && (
                  <div className="border-t border-gray-50 px-4 py-3 flex gap-2">
                    <button
                      onClick={() => setSelectedReport(String(report.id))}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-50 text-gray-700 text-sm font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(report.content!, inspection?.title ?? "Laudo")}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#C8102E] text-white text-sm font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                )}

                {report.status !== "pronto" && (
                  <div className="border-t border-gray-50 px-4 py-3">
                    <button
                      onClick={() => navigate(`/mobile/laudo/${inspection?.id ?? report.inspectionId}`)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-50 text-gray-700 text-sm font-semibold"
                    >
                      Continuar vistoria
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

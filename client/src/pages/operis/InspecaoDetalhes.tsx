import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  R1: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  R2: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  R3: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  R4: "bg-red-500/10 text-red-400 border-red-500/30",
  R5: "bg-red-900/30 text-red-300 border-red-700/50",
};

const RISK_LABELS: Record<string, string> = {
  R1: "Baixo",
  R2: "Moderado",
  R3: "Elevado",
  R4: "Alto",
  R5: "Crítico",
};

export default function InspecaoDetalhes() {
  const [, params] = useRoute("/operis/inspecao/:id");
  const inspectionId = Number(params?.id);

  const { data: inspection, isLoading, refetch } = trpc.operis.getInspection.useQuery(
    { id: inspectionId },
    { enabled: !!inspectionId }
  );

  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [observations, setObservations] = useState<Record<number, string>>({});
  const [analyzingItem, setAnalyzingItem] = useState<number | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<number | null>(null);
  const [itemImages, setItemImages] = useState<Record<number, string[]>>({});

  const saveItemMutation = trpc.operis.analyzeItem.useMutation({
    onSuccess: () => refetch(),
    onError: (err: { message: string }) => toast.error("Erro ao salvar item: " + err.message),
  });

  const analyzeItemMutation = trpc.operis.analyzeItem.useMutation({
    onSuccess: () => {
      toast.success("Análise IA concluída");
      setAnalyzingItem(null);
      refetch();
    },
    onError: (err: { message: string }) => {
      toast.error("Erro na análise IA: " + err.message);
      setAnalyzingItem(null);
    },
  });

  const generateReportMutation = trpc.operis.generateReport.useMutation({
    onSuccess: (data) => {
      toast.success("Laudo gerado com sucesso!");
      setGeneratingReport(false);
      window.open(`/operis/laudo/${data.reportId}`, "_blank");
    },
    onError: (err) => {
      toast.error("Erro ao gerar laudo: " + err.message);
      setGeneratingReport(false);
    },
  });

  const handleStatusChange = (itemId: number, status: "conforme" | "nao_conforme" | "necessita_revisao") => {
    saveItemMutation.mutate({
      inspectionId,
      itemId: String(itemId),
      imageUrls: [],
    });
  };

  const handleAnalyzeWithAI = (itemId: number, imageUrls: string[]) => {
    if (imageUrls.length === 0) {
      toast.error("Adicione ao menos uma imagem para análise IA");
      return;
    }
    setAnalyzingItem(itemId);
    analyzeItemMutation.mutate({ inspectionId, itemId: String(itemId), imageUrls });
  };

  const handleImageUpload = async (itemId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingItem(itemId);
    const uploadedUrls: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, 3)) {
        const formData = new FormData();
        formData.append("file", file, `operis-item-${itemId}-${Date.now()}.jpg`);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const d = await res.json() as { url: string };
          uploadedUrls.push(d.url);
        }
      }
      if (uploadedUrls.length > 0) {
        setItemImages((prev) => ({ ...prev, [itemId]: [...(prev[itemId] ?? []), ...uploadedUrls] }));
        toast.success(`${uploadedUrls.length} imagem(ns) enviada(s). Analisando com IA...`);
        handleAnalyzeWithAI(itemId, uploadedUrls);
      }
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingItem(null);
    }
  };

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    generateReportMutation.mutate({ inspectionId });
  };

  if (isLoading) {
    return (
      <SaasDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-[#e63946] animate-spin" />
        </div>
      </SaasDashboardLayout>
    );
  }

  if (!inspection) {
    return (
      <SaasDashboardLayout>
        <div className="p-6 text-center">
          <p className="text-slate-400">Inspeção não encontrada</p>
          <Link href="/operis">
            <Button className="mt-4 bg-[#e63946] hover:bg-[#c1121f] text-white" size="sm">
              Voltar
            </Button>
          </Link>
        </div>
      </SaasDashboardLayout>
    );
  }

  const items = inspection.items ?? [];
  const conformes = items.filter((i) => i.status === "conforme").length;
  const naoConformes = items.filter((i) => i.status === "nao_conforme").length;
  const progress = items.length > 0 ? Math.round(((conformes + naoConformes) / items.length) * 100) : 0;

  return (
    <SaasDashboardLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Link href="/operis">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white flex items-center gap-2 truncate">
              <Shield className="w-5 h-5 text-[#e63946] shrink-0" />
              {inspection.inspection.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">{inspection.inspection.client}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{inspection.inspection.system}</span>
              <Badge
                variant="outline"
                className={`text-xs ${RISK_COLORS[inspection.inspection.globalRisk ?? "R1"]}`}
              >
                Risco {inspection.inspection.globalRisk ?? "R1"} — {RISK_LABELS[inspection.inspection.globalRisk ?? "R1"]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="bg-[#0d1f35] border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Progresso do Checklist</span>
              <span className="text-xs font-medium text-white">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#e63946] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {conformes} conformes
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-400" />
                {naoConformes} não conformes
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-slate-400" />
                {items.length - conformes - naoConformes} pendentes
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Checklist Items */}
        <div className="space-y-2">
          {items.map((item) => {
            const isExpanded = expandedItem === item.id;
            const hasAiAnalysis = false;
            return (
              <Card
                key={item.id}
                className={`bg-[#0d1f35] border transition-all ${
                  item.status === "conforme"
                    ? "border-emerald-500/30"
                    : item.status === "nao_conforme"
                    ? "border-red-500/30"
                    : "border-slate-700/50"
                }`}
              >
                <CardContent className="p-3">
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {item.status === "conforme" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : item.status === "nao_conforme" ? (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium leading-snug">{item.itemTitle}</p>
                          {item.normReference && (
                            <p className="text-xs text-slate-500 mt-0.5">{item.normReference}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {hasAiAnalysis && (
                          <Zap className="w-3 h-3 text-yellow-400" />
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 border-t border-slate-700/50 pt-3">
                      {/* Status Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={item.status === "conforme" ? "default" : "outline"}
                          className={`flex-1 text-xs h-8 ${
                            item.status === "conforme"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "border-emerald-600/40 text-emerald-400 hover:bg-emerald-600/10"
                          }`}
                          onClick={() => handleStatusChange(item.id, "conforme")}
                          disabled={saveItemMutation.isPending}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Conforme
                        </Button>
                        <Button
                          size="sm"
                          variant={item.status === "nao_conforme" ? "default" : "outline"}
                          className={`flex-1 text-xs h-8 ${
                            item.status === "nao_conforme"
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "border-red-600/40 text-red-400 hover:bg-red-600/10"
                          }`}
                          onClick={() => handleStatusChange(item.id, "nao_conforme")}
                          disabled={saveItemMutation.isPending}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Não Conforme
                        </Button>
                        <Button
                          size="sm"
                          variant={item.status === "necessita_revisao" ? "default" : "outline"}
                          className={`text-xs h-8 px-2 ${
                            item.status === "necessita_revisao"
                              ? "bg-slate-600 hover:bg-slate-700 text-white"
                              : "border-slate-600/40 text-slate-400 hover:bg-slate-600/10"
                          }`}
                          onClick={() => handleStatusChange(item.id, "necessita_revisao")}
                          disabled={saveItemMutation.isPending}
                        >
                          N/A
                        </Button>
                      </div>

                      {/* Observation */}
                      <Textarea
                        className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 text-xs resize-none"
                        placeholder="Observações técnicas (opcional)..."
                        rows={2}
                        value={observations[item.id] ?? item.findings ?? ""}
                        onChange={(e) =>
                          setObservations((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                      />



                      {/* Image upload + AI analysis */}
                      <div className="space-y-2">
                        {/* Thumbnails */}
                        {(itemImages[item.id] ?? []).length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {(itemImages[item.id] ?? []).map((url, i) => (
                              <img key={i} src={url} alt={`img-${i}`} className="w-12 h-12 object-cover rounded border border-slate-600" />
                            ))}
                          </div>
                        )}
                        <label className="w-full">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            multiple
                            className="hidden"
                            disabled={uploadingItem === item.id || analyzingItem === item.id}
                            onChange={(e) => handleImageUpload(item.id, e.target.files)}
                          />
                          <div
                            className={`w-full flex items-center justify-center gap-1.5 text-xs h-8 rounded-md border cursor-pointer transition-colors ${
                              uploadingItem === item.id || analyzingItem === item.id
                                ? "border-slate-600 text-slate-500 cursor-not-allowed"
                                : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                            }`}
                          >
                            {uploadingItem === item.id ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Enviando...</>
                            ) : analyzingItem === item.id ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Analisando com IA...</>
                            ) : (
                              <><Camera className="w-3 h-3" /> Foto + Análise IA</>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Generate Report */}
        {progress >= 50 && (
          <Card className="bg-[#0d1f35] border-[#e63946]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Gerar Laudo Técnico</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    IA irá analisar todos os itens e gerar laudo completo com classificação de risco
                  </p>
                </div>
                <Button
                  className="bg-[#e63946] hover:bg-[#c1121f] text-white shrink-0 ml-3"
                  size="sm"
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                >
                  {generatingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Gerar Laudo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

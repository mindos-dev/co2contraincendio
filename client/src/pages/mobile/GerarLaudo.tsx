import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  User,
} from "lucide-react";

export default function GerarLaudo() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const inspectionId = parseInt(params.id ?? "0");

  const [companyName, setCompanyName] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);

  const { data: inspection } = trpc.field.getInspection.useQuery(
    { id: inspectionId },
    { enabled: inspectionId > 0 }
  );

  const { data: answers } = trpc.field.getChecklistAnswers.useQuery(
    { inspectionId },
    { enabled: inspectionId > 0 }
  );

  const { data: images } = trpc.field.getImages.useQuery(
    { inspectionId },
    { enabled: inspectionId > 0 }
  );

  const { data: existingReport } = trpc.field.getReport.useQuery(
    { inspectionId },
    { enabled: inspectionId > 0 }
  );

  const generateMutation = trpc.field.generateReport.useMutation({
    onSuccess: (data) => {
      setReportContent(data.content);
      setShowPreview(true);
      toast.success("Laudo gerado com sucesso!");
    },
    onError: (err) => {
      toast.error("Erro ao gerar laudo: " + err.message);
    },
  });

  const handleGenerate = () => {
    if (!companyName.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    generateMutation.mutate({
      inspectionId,
      companyName: companyName.trim(),
      technicianName: technicianName.trim() || undefined,
    });
  };

  const handleDownloadPDF = () => {
    const content = reportContent || existingReport?.content;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Permita pop-ups para baixar o PDF.");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Laudo OPERIS</title>
          <style>
            @media print {
              body { margin: 0; }
              @page { margin: 1.5cm; size: A4; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const conformes = answers?.filter(a => a.answer === "conforme").length ?? 0;
  const naoConformes = answers?.filter(a => a.answer === "nao_conforme").length ?? 0;
  const total = answers?.length ?? 0;
  const pct = total > 0 ? Math.round((conformes / total) * 100) : 0;

  const hasReport = reportContent || (existingReport?.status === "pronto" && existingReport.content);
  const displayContent = reportContent || existingReport?.content;

  if (showPreview && displayContent) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Preview Header */}
        <div className="bg-[#0a1628] text-white px-4 pt-safe-top pb-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-base font-bold">Preview do Laudo</h1>
              <p className="text-xs text-white/60">Toque em Baixar para salvar como PDF</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 bg-[#C8102E] text-white text-sm font-bold px-4 py-2 rounded-xl"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {/* HTML Preview */}
        <div
          className="flex-1 overflow-auto p-4"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayContent, { ADD_TAGS: ["style"], ADD_ATTR: ["class", "style"] }) }}
        />

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 pb-safe-bottom pb-6 pt-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/mobile/historico")}
              className="flex-1 h-12 rounded-xl"
            >
              Ver Histórico
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 h-12 rounded-xl bg-[#C8102E] hover:bg-[#a50d25] text-white font-bold"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0a1628] text-white px-4 pt-safe-top pb-4">
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => navigate(`/mobile/upload/${inspectionId}`)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold">Gerar Laudo</h1>
            <p className="text-xs text-white/60">{inspection?.title}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-5 pb-32">
        {/* Resumo da vistoria */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Resumo da Vistoria</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600">{conformes}</div>
              <div className="text-xs text-green-600 font-medium">Conformes</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-red-600">{naoConformes}</div>
              <div className="text-xs text-red-600 font-medium">Não conf.</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-blue-600">{images?.length ?? 0}</div>
              <div className="text-xs text-blue-600 font-medium">Fotos</div>
            </div>
          </div>

          {/* Índice de conformidade */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Índice de conformidade</span>
              <span className="font-bold text-gray-800">{pct}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {naoConformes > 0 && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                {naoConformes} item(ns) não conforme(s) identificado(s). O laudo incluirá recomendações técnicas.
              </p>
            </div>
          )}
        </div>

        {/* Dados para o laudo */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-700">Dados do Laudo</h3>

          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4" />
              Nome do Cliente *
            </Label>
            <Input
              id="company"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Ex: Shopping BH, Loja 42"
              className="h-12 text-base rounded-xl border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tech" className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              Nome do Técnico
            </Label>
            <Input
              id="tech"
              value={technicianName}
              onChange={e => setTechnicianName(e.target.value)}
              placeholder="Ex: João Silva — CREA-MG 12345"
              className="h-12 text-base rounded-xl border-gray-200"
            />
          </div>
        </div>

        {/* Laudo existente */}
        {hasReport && (
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-green-800">Laudo já gerado</p>
                <p className="text-xs text-green-600">Clique para visualizar ou gerar novamente</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="flex-1 h-10 rounded-xl border-green-300 text-green-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="flex-1 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pb-safe-bottom pb-6 pt-3">
        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !companyName.trim()}
          className="w-full h-14 text-base font-bold rounded-2xl bg-[#C8102E] hover:bg-[#a50d25] text-white"
        >
          {generateMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              Gerando laudo com IA...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {hasReport ? "Gerar Novo Laudo" : "Gerar Laudo com IA"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

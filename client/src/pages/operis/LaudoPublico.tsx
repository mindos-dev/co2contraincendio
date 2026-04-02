/**
 * LaudoPublico.tsx — /operis/laudo/:slug
 * Página pública de laudo técnico OPERIS IA
 * Sem autenticação | DOMPurify | Assinatura | Botão de impressão
 */

import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import DOMPurify from "dompurify";
import { Printer, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShareButton from "@/components/ShareButton";

const RISK_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  R1: { label: "Risco Mínimo", color: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle className="w-4 h-4" /> },
  R2: { label: "Risco Baixo", color: "bg-blue-100 text-blue-800 border-blue-300", icon: <CheckCircle className="w-4 h-4" /> },
  R3: { label: "Risco Moderado", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: <AlertTriangle className="w-4 h-4" /> },
  R4: { label: "Risco Alto", color: "bg-orange-100 text-orange-800 border-orange-300", icon: <AlertTriangle className="w-4 h-4" /> },
  R5: { label: "Risco Crítico", color: "bg-red-100 text-red-800 border-red-300", icon: <AlertTriangle className="w-4 h-4" /> },
};

export default function LaudoPublico() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = trpc.operis.getPublicReport.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0a1628] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Carregando laudo técnico...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Laudo não encontrado</h1>
          <p className="text-gray-500 mb-6">
            Este laudo pode não existir, ter sido removido ou ainda não estar disponível para acesso público.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#0a1628] text-white px-6 py-3 rounded-lg hover:bg-[#1a2a45] transition-colors"
          >
            Voltar ao site
          </a>
        </div>
      </div>
    );
  }

  const riskInfo = RISK_CONFIG[data.globalRisk ?? "R1"] ?? RISK_CONFIG["R1"];
  const safeHtml = DOMPurify.sanitize(data.htmlContent ?? "", {
    ADD_TAGS: ["style"],
    ADD_ATTR: ["target"],
  });

  // Injetar assinatura no HTML se existir
  const htmlWithSignature = data.signatureUrl
    ? safeHtml.replace(
        /<\/body>/i,
        `<div style="margin-top:32px;padding-top:24px;border-top:2px solid #e5e7eb;text-align:center;">
          <p style="font-size:12px;color:#6b7280;margin-bottom:8px;">Assinatura Digital do Responsável Técnico</p>
          <img src="${data.signatureUrl}" alt="Assinatura digital" style="max-width:280px;height:auto;border:1px solid #e5e7eb;border-radius:8px;padding:8px;background:#fff;" />
        </div></body>`
      )
    : safeHtml;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header público */}
      <header className="bg-[#0a1628] text-white print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-red-400" />
            <div>
              <span className="font-bold text-lg">OPERIS IA</span>
              <span className="text-gray-400 text-sm ml-2">Laudo Técnico</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`border ${riskInfo.color} flex items-center gap-1 text-xs font-semibold`}>
              {riskInfo.icon}
              {riskInfo.label}
            </Badge>
            {slug && (
              <ShareButton
                slug={slug}
                baseUrl={typeof window !== "undefined" ? window.location.origin : ""}
                trigger={
                  <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 gap-2">
                    Compartilhar
                  </Button>
                }
              />
            )}
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Barra de info */}
      <div className="bg-white border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              Gerado em:{" "}
              {data.generatedAt
                ? new Date(data.generatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </span>
          </div>
          {data.signatureUrl && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Assinado digitalmente
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo do laudo */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Laudo HTML */}
          <div
            className="p-8 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlWithSignature }}
          />

          {/* Assinatura separada se não foi injetada no HTML */}
          {data.signatureUrl && !data.htmlContent?.includes("</body>") && (
            <div className="border-t border-gray-200 p-8 text-center">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-medium">
                Assinatura Digital do Responsável Técnico
              </p>
              <img
                src={data.signatureUrl}
                alt="Assinatura digital"
                className="max-w-xs h-auto mx-auto border border-gray-200 rounded-lg p-2 bg-white"
              />
            </div>
          )}
        </div>

        {/* Rodapé público */}
        <div className="mt-8 text-center text-xs text-gray-400 print:hidden">
          <p>
            Laudo gerado pela plataforma{" "}
            <a href="/" className="text-[#0a1628] hover:underline font-medium">
              CO2 Contra Incêndio — OPERIS IA
            </a>
          </p>
          <p className="mt-1">
            Este documento tem validade técnica e pode ser verificado pelo link público permanente.
          </p>
        </div>
      </main>

      {/* Estilos de impressão */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .bg-white { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}

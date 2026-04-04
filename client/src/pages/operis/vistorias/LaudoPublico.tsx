import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function LaudoPublico() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.vistoria.getPublicReport.useQuery({ slug: slug || "" });

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="text-gray-400">Carregando laudo...</div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="text-red-400">Laudo não encontrado ou expirado.</div>
    </div>
  );

  const allSigned = data.landlordSignatureUrl && data.tenantSignatureUrl && data.inspectorSignatureUrl;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de ações */}
      <div className="bg-[#0a1628] text-white p-4 flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-bold text-lg">Laudo de Vistoria — OPERIS</h1>
          <p className="text-gray-400 text-sm">{data.propertyAddress}</p>
        </div>
        <div className="flex items-center gap-3">
          {allSigned ? (
            <span className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Laudo Assinado por Todas as Partes
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              Aguardando Assinaturas
            </span>
          )}
          <Button onClick={() => window.print()} size="sm" className="bg-white text-gray-900 hover:bg-gray-100 gap-2">
            <Printer className="w-4 h-4" />
            Imprimir / PDF
          </Button>
        </div>
      </div>

      {/* Assinaturas */}
      {(data.landlordSignatureUrl || data.tenantSignatureUrl || data.inspectorSignatureUrl) && (
        <div className="bg-white border-b border-gray-200 p-4 print:hidden">
          <div className="max-w-4xl mx-auto flex gap-6">
            {data.landlordSignatureUrl && (
              <div className="text-center">
                <img src={data.landlordSignatureUrl} alt="Assinatura Locador" className="h-12 object-contain" />
                <p className="text-xs text-gray-500 mt-1">Locador</p>
              </div>
            )}
            {data.tenantSignatureUrl && (
              <div className="text-center">
                <img src={data.tenantSignatureUrl} alt="Assinatura Inquilino" className="h-12 object-contain" />
                <p className="text-xs text-gray-500 mt-1">Inquilino</p>
              </div>
            )}
            {data.inspectorSignatureUrl && (
              <div className="text-center">
                <img src={data.inspectorSignatureUrl} alt="Assinatura Vistoriador" className="h-12 object-contain" />
                <p className="text-xs text-gray-500 mt-1">Vistoriador</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo do laudo */}
      <div
        className="max-w-4xl mx-auto p-4"
        dangerouslySetInnerHTML={{ __html: data.reportHtml || "<p>Laudo em processamento...</p>" }}
      />
    </div>
  );
}

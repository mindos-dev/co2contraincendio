import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import {
  Printer, CheckCircle, AlertCircle, Clock, Shield,
  AlertTriangle, FileText, Camera, Wrench,
} from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  entrada: "Vistoria de Entrada",
  saida: "Vistoria de Saída",
  periodica: "Vistoria Periódica",
  devolucao: "Vistoria de Devolução",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  sala_comercial: "Sala Comercial",
  galpao: "Galpão",
  outro: "Outro",
};

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  otimo:       { label: "Ótimo",       color: "#16a34a" },
  bom:         { label: "Bom",         color: "#2563eb" },
  regular:     { label: "Regular",     color: "#d97706" },
  ruim:        { label: "Ruim",        color: "#dc2626" },
  pessimo:     { label: "Péssimo",     color: "#7f1d1d" },
  inexistente: { label: "Inexistente", color: "#6b7280" },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: "Baixa",  color: "#d97706", bg: "#fef3c7" },
  medium: { label: "Média",  color: "#ea580c", bg: "#ffedd5" },
  high:   { label: "Alta",   color: "#dc2626", bg: "#fee2e2" },
};

const CATEGORY_LABELS: Record<string, string> = {
  fissura:      "Fissura / Trinca",
  infiltracao:  "Infiltração / Vazamento",
  corrosao:     "Corrosão / Oxidação",
  destacamento: "Descolamento / Destacamento",
  outro:        "Outro",
};

function riskColor(score: number): string {
  if (score === 0) return "#16a34a";
  if (score <= 3) return "#65a30d";
  if (score <= 5) return "#d97706";
  if (score <= 7) return "#ea580c";
  return "#dc2626";
}

function riskLabel(score: number): string {
  if (score === 0) return "Sem Risco";
  if (score <= 3) return "Risco Baixo";
  if (score <= 5) return "Risco Moderado";
  if (score <= 7) return "Risco Alto";
  return "Risco Crítico";
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function QRCodeImg({ value }: { value: string }) {
  const encoded = encodeURIComponent(value);
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encoded}`}
      alt="QR Code de autenticidade"
      width={120}
      height={120}
    />
  );
}

export default function LaudoVistoriaPublico() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = trpc.vistoria.getPublicReport.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  useEffect(() => {
    if (data) document.title = "Laudo OPERIS — " + data.propertyAddress;
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando laudo...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 text-lg font-semibold">Laudo não encontrado</p>
          <p className="text-gray-500 text-sm mt-1">O link pode ter expirado ou o laudo não existe.</p>
        </div>
      </div>
    );
  }

  const allSigned = data.landlordSignatureUrl && data.tenantSignatureUrl && data.inspectorSignatureUrl;
  const publicUrl = typeof window !== "undefined" ? window.location.href : "";
  const riskScore = data.totalRiskScore ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Barra de ações */}
      <div className="bg-[#0a1628] text-white px-6 py-4 flex items-center justify-between print:hidden sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">O</div>
          <div>
            <h1 className="font-bold text-base leading-tight">OPERIS — Laudo de Vistoria</h1>
            <p className="text-gray-400 text-xs truncate max-w-xs">{data.propertyAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {allSigned ? (
            <span className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />Assinado por todas as partes
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
              <Clock className="w-4 h-4" />Aguardando assinaturas
            </span>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 print:px-0 print:py-0">
        {/* Cabeçalho */}
        <div className="bg-[#0a1628] text-white rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
                  {TYPE_LABELS[data.type] ?? data.type}
                </span>
                {data.propertyType && (
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                    {PROPERTY_TYPE_LABELS[data.propertyType] ?? data.propertyType}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-1">{data.propertyAddress}</h2>
              {data.contractId && <p className="text-blue-300 text-sm font-mono">Contrato: {data.contractId}</p>}
              <p className="text-gray-400 text-sm mt-2">Vistoriado em: {formatDate(data.inspectedAt)}</p>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="bg-white p-2 rounded-xl inline-block">
                <QRCodeImg value={publicUrl} />
              </div>
              <p className="text-gray-500 text-xs mt-1">Autenticidade</p>
            </div>
          </div>
          {data.auditHash && (
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-2 text-xs">
              <Shield className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              <span className="text-green-400 font-medium">Hash SHA-256:</span>
              <span className="font-mono text-gray-400 break-all">{data.auditHash}</span>
            </div>
          )}
        </div>

        {/* Risk Score */}
        {(data.pathologies?.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-800 text-lg">Índice de Risco Estrutural</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-black" style={{ color: riskColor(riskScore) }}>{riskScore}</div>
                <div className="text-xs text-gray-500 mt-1">Risk Score Total</div>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: Math.min(100, (riskScore / (data.pathologies!.length * 10)) * 100) + "%",
                      backgroundColor: riskColor(riskScore),
                    }}
                  />
                </div>
                <p className="text-sm font-semibold mt-2" style={{ color: riskColor(riskScore) }}>
                  {riskLabel(riskScore)} — {data.pathologies?.length} patologia(s)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Partes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Locador", name: data.landlordName, doc: data.landlordCpfCnpj, signedAt: data.landlordSignedAt },
            { label: "Inquilino", name: data.tenantName, doc: data.tenantCpfCnpj, signedAt: data.tenantSignedAt },
            { label: "Vistoriador", name: data.inspectorName ?? "Eng. Judson Aleixo Sampaio", doc: data.inspectorCrea ?? "CREA/MG 142203671-5", signedAt: data.inspectorSignedAt },
          ].map((party) => (
            <div key={party.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{party.label}</p>
              <p className="font-semibold text-gray-800">{party.name}</p>
              {party.doc && <p className="text-sm text-gray-500">{party.doc}</p>}
              {party.signedAt && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />Assinado em {formatDate(party.signedAt)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Assinaturas */}
        {(data.landlordSignatureUrl || data.tenantSignatureUrl || data.inspectorSignatureUrl) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />Assinaturas Digitais
            </h3>
            <div className="flex flex-wrap gap-8">
              {data.landlordSignatureUrl && (
                <div className="text-center">
                  <img src={data.landlordSignatureUrl} alt="Assinatura Locador" className="h-14 object-contain border-b border-gray-300 pb-1" />
                  <p className="text-xs text-gray-500 mt-1">Locador</p>
                </div>
              )}
              {data.tenantSignatureUrl && (
                <div className="text-center">
                  <img src={data.tenantSignatureUrl} alt="Assinatura Inquilino" className="h-14 object-contain border-b border-gray-300 pb-1" />
                  <p className="text-xs text-gray-500 mt-1">Inquilino</p>
                </div>
              )}
              {data.inspectorSignatureUrl && (
                <div className="text-center">
                  <img src={data.inspectorSignatureUrl} alt="Assinatura Vistoriador" className="h-14 object-contain border-b border-gray-300 pb-1" />
                  <p className="text-xs text-gray-500 mt-1">Vistoriador</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Laudo HTML */}
        {data.reportHtml && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />Laudo Técnico
            </h3>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data.reportHtml }} />
          </div>
        )}

        {/* Cômodos */}
        {(data.rooms?.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />Checklist por Cômodo
            </h3>
            <div className="space-y-6">
              {data.rooms!.map((room) => (
                <div key={room.id}>
                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">{room.name}</h4>
                  {room.notes && <p className="text-sm text-gray-500 italic mb-2">{room.notes}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {room.items.map((item) => {
                      const cond = item.condition ? CONDITION_LABELS[item.condition] : null;
                      return (
                        <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          {item.photoUrl && <img src={item.photoUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                            {cond && (
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ color: cond.color, backgroundColor: cond.color + "15" }}>
                                {cond.label}
                              </span>
                            )}
                            {item.notes && <p className="text-xs text-gray-500 mt-1 truncate">{item.notes}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fotos */}
        {(data.photos?.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-500" />Registro Fotográfico ({data.photos!.length} fotos)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {data.photos!.map((photo, idx) => (
                <div key={idx} className="relative">
                  <img src={photo.photoUrl} alt={photo.itemName} className="w-full aspect-square object-cover rounded-xl" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl p-2">
                    <p className="text-white text-xs font-medium truncate">{photo.itemName}</p>
                    <p className="text-gray-300 text-xs">{formatDate(photo.createdAt)}</p>
                  </div>
                  {photo.condition && CONDITION_LABELS[photo.condition] && (
                    <div className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: CONDITION_LABELS[photo.condition].color, backgroundColor: "rgba(255,255,255,0.9)" }}>
                      {CONDITION_LABELS[photo.condition].label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patologias */}
        {(data.pathologies?.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />Patologias Identificadas ({data.pathologies!.length})
            </h3>
            <div className="space-y-4">
              {data.pathologies!.map((p, idx) => {
                const sev = SEVERITY_CONFIG[p.severity] ?? SEVERITY_CONFIG.medium;
                return (
                  <div key={p.id} className="border rounded-xl p-4" style={{ borderColor: sev.color + "40", backgroundColor: sev.bg }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="font-semibold text-gray-800 text-sm">{idx + 1}. {CATEGORY_LABELS[p.category] ?? p.category}</span>
                        <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: sev.color, backgroundColor: sev.color + "20" }}>
                          Severidade {sev.label}
                        </span>
                      </div>
                      {p.riskScore != null && (
                        <div className="text-xl font-black flex-shrink-0" style={{ color: riskColor(p.riskScore) }}>
                          {p.riskScore}<span className="text-xs font-normal text-gray-500">/10</span>
                        </div>
                      )}
                    </div>
                    {p.causeAnalysis && <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Causa:</span> {p.causeAnalysis}</p>}
                    {p.repairSuggestion && <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Reparo sugerido:</span> {p.repairSuggestion}</p>}
                    {p.estimatedRepairCost && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Custo estimado:</span> R$ {Number(p.estimatedRepairCost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    {(p.photoContextUrl || p.photoDetailUrl) && (
                      <div className="flex gap-2 mt-3">
                        {p.photoContextUrl && <img src={p.photoContextUrl} alt="Contexto" className="w-24 h-24 object-cover rounded-lg" />}
                        {p.photoDetailUrl && <img src={p.photoDetailUrl} alt="Detalhe" className="w-24 h-24 object-cover rounded-lg" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cláusulas 2026 */}
        {(data.redutorSocial || data.clausulaVigencia) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />Cláusulas Especiais — Reforma Tributária 2026
            </h3>
            <div className="space-y-3">
              {data.redutorSocial && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Redutor Social — LC 214/2025</p>
                    <p className="text-xs text-blue-600">Imóvel residencial enquadrado no Redutor Social de R$ 600,00 sobre a base de cálculo do IBS/CBS.</p>
                  </div>
                </div>
              )}
              {data.clausulaVigencia && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Cláusula de Vigência — Art. 8º Lei 8.245/91</p>
                    <p className="text-xs text-green-600">Contrato averbado na matrícula do imóvel. Em caso de alienação, o adquirente deverá respeitar o prazo contratual.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rodapé jurídico */}
        <footer className="mt-8 pt-6 border-t-2 border-gray-200 text-xs text-gray-500 space-y-2 print:mt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#0a1628] rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">O</div>
            <div>
              <p className="font-semibold text-gray-700 text-sm">OPERIS IA — Plataforma de Inspeção e Laudos Técnicos</p>
              <p>CO₂ Contra Incêndio LTDA · CNPJ 29.905.123/0001-53 · Belo Horizonte / MG</p>
              <p>Responsável Técnico: Eng. Judson Aleixo Sampaio · CREA/MG 142203671-5</p>
            </div>
          </div>
          <div className="pl-11 space-y-1">
            <p>Este laudo foi gerado eletronicamente pela plataforma OPERIS IA e possui validade jurídica conforme a Lei 13.709/2018 (LGPD) e a Lei 8.245/1991 (Lei do Inquilinato).</p>
            <p>A autenticidade deste documento pode ser verificada pelo QR Code ou pelo Hash SHA-256 registrado no cabeçalho. Qualquer alteração no conteúdo invalida o hash e, consequentemente, o documento.</p>
            {data.lockedAt && <p>Documento selado em: {formatDate(data.lockedAt)} · Contrato: {data.contractId ?? "—"}</p>}
            <p className="text-gray-400">As informações contidas neste laudo são de responsabilidade exclusiva do vistoriador indicado. A OPERIS IA atua como plataforma tecnológica e não assume responsabilidade civil pelo conteúdo técnico.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

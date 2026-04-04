import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Home, Eye, FileText, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  rascunho: { label: "Rascunho", color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: Clock },
  em_andamento: { label: "Em Andamento", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: AlertCircle },
  aguardando_assinatura: { label: "Aguard. Assinatura", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: FileText },
  concluida: { label: "Concluída", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle },
  cancelada: { label: "Cancelada", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: XCircle },
};

const TYPE_LABELS = {
  entrada: "Vistoria de Entrada",
  saida: "Vistoria de Saída",
  periodica: "Vistoria Periódica",
  devolucao: "Devolução de Imóvel",
};

export default function VistoriasList() {
  const [page, setPage] = useState(1);
  const { data: vistorias = [], isLoading } = trpc.vistoria.list.useQuery({ page, limit: 20 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Barlow_Condensed'] tracking-wide uppercase">
            Vistorias de Imóveis
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Laudos técnicos com proteção legal para locador e inquilino — Lei 8.245/91
          </p>
        </div>
        <Link href="/operis/vistorias/nova">
          <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            Nova Vistoria
          </Button>
        </Link>
      </div>

      {/* Legenda legal */}
      <div className="bg-blue-950/40 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-300">
        <strong className="text-blue-200">Proteção Legal:</strong> Todas as vistorias são documentadas conforme a{" "}
        <strong>Lei do Inquilinato 8.245/91</strong> e assinadas digitalmente pelas partes, garantindo validade jurídica
        para locador, inquilino e vistoriador.
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="text-gray-400 text-center py-12">Carregando vistorias...</div>
      ) : vistorias.length === 0 ? (
        <Card className="bg-[#111827] border-gray-700">
          <CardContent className="py-16 text-center">
            <Home className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhuma vistoria registrada</p>
            <p className="text-gray-500 text-sm mt-2">
              Crie a primeira vistoria para começar a documentar o estado dos imóveis
            </p>
            <Link href="/operis/vistorias/nova">
              <Button className="mt-6 bg-red-600 hover:bg-red-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeira Vistoria
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {vistorias.map((v) => {
            const statusCfg = STATUS_CONFIG[v.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.rascunho;
            const StatusIcon = statusCfg.icon;
            return (
              <Card key={v.id} className="bg-[#111827] border-gray-700 hover:border-gray-500 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {TYPE_LABELS[v.type as keyof typeof TYPE_LABELS] || v.type}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold truncate">{v.propertyAddress}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                        <span><strong className="text-gray-300">Locador:</strong> {v.landlordName}</span>
                        <span><strong className="text-gray-300">Inquilino:</strong> {v.tenantName}</span>
                        <span><strong className="text-gray-300">Data:</strong> {new Date(v.inspectedAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/operis/vistorias/${v.id}`}>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          Abrir
                        </Button>
                      </Link>
                      {v.reportSlug && (
                        <Link href={`/operis/vistorias/laudo/${v.reportSlug}`}>
                          <Button size="sm" variant="outline" className="border-green-600 text-green-400 hover:bg-green-900/20 gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Laudo
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {vistorias.length === 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Anterior
          </Button>
          <span className="text-gray-400 text-sm self-center">Página {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

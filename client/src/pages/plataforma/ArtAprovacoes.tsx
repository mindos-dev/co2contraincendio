/**
 * ART OPERIS — Painel do Engenheiro Aprovador
 * Rota: /app/art/aprovacoes (admin/superadmin only)
 * Lista todas as ARTs aguardando aprovação de todas as empresas.
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  ClipboardList,
  ArrowLeft,
  Eye,
  AlertTriangle,
} from "lucide-react";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  pmoc: "PMOC",
  incendio: "Incêndio",
  eletrica: "Elétrica",
  gas: "Gás",
  hidraulico: "Hidráulico",
  co2: "CO₂",
  outro: "Outro",
};

export default function ArtAprovacoes() {
  const utils = trpc.useUtils();
  const { data: arts, isLoading } = trpc.art.allPendingApprovals.useQuery();

  const [reviewDialog, setReviewDialog] = useState<{
    artId: number;
    action: "aprovado" | "reprovado";
    artNumber?: string;
  } | null>(null);
  const [notes, setNotes] = useState("");

  const reviewMutation = trpc.art.review.useMutation({
    onSuccess: (data) => {
      const label = data.action === "aprovado" ? "aprovada" : "reprovada";
      const numStr = data.artNumber ? ` (${data.artNumber})` : "";
      toast.success(`ART${numStr} ${label} com sucesso!`);
      setReviewDialog(null);
      setNotes("");
      void utils.art.allPendingApprovals.invalidate();
    },
    onError: (err) => {
      toast.error(`Erro ao processar: ${err.message}`);
    },
  });

  const handleReview = () => {
    if (!reviewDialog) return;
    if (reviewDialog.action === "reprovado" && !notes.trim()) {
      toast.error("Informe o motivo da reprovação.");
      return;
    }
    reviewMutation.mutate({
      artServiceId: reviewDialog.artId,
      action: reviewDialog.action,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <SaasDashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <Link href="/app/art">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-amber-500" />
              Painel de Aprovações — ART OPERIS
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Todas as ARTs aguardando revisão técnica
            </p>
          </div>
        </div>

        {/* Contador */}
        {!isLoading && (
          <div className="flex items-center gap-2">
            <Badge variant={arts && arts.length > 0 ? "destructive" : "secondary"} className="text-sm px-3 py-1">
              {arts?.length ?? 0} pendente{arts?.length !== 1 ? "s" : ""}
            </Badge>
            {arts && arts.length === 0 && (
              <span className="text-muted-foreground text-sm">Nenhuma ART aguardando aprovação.</span>
            )}
          </div>
        )}

        {/* Lista */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {arts?.map((art) => (
              <Card key={art.id} className="border-l-4 border-l-amber-400">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ART #{art.id} — {SERVICE_TYPE_LABELS[art.serviceType] ?? art.serviceType}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Cliente: <span className="font-medium text-foreground">{art.clientName}</span>
                        {art.serviceAddress && (
                          <span className="ml-2">· {art.serviceAddress}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/app/art/${art.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setNotes("");
                          setReviewDialog({ artId: art.id, action: "reprovado" });
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reprovar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          setNotes("");
                          setReviewDialog({ artId: art.id, action: "aprovado" });
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Técnico ID: {art.technicianId}</span>
                    <span>Empresa ID: {art.companyId}</span>
                    <span>Data serviço: {art.serviceDate ? new Date(art.serviceDate).toLocaleDateString("pt-BR") : "—"}</span>
                    <span>Submetido: {new Date(art.updatedAt).toLocaleString("pt-BR")}</span>
                    {art.submissionHash && (
                      <span className="font-mono">Hash: {art.submissionHash.slice(0, 12)}…</span>
                    )}
                  </div>
                  {art.description && (
                    <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">{art.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de confirmação */}
      <Dialog open={!!reviewDialog} onOpenChange={(open) => !open && setReviewDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewDialog?.action === "aprovado" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {reviewDialog?.action === "aprovado" ? "Aprovar ART" : "Reprovar ART"} #{reviewDialog?.artId}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {reviewDialog?.action === "aprovado" ? (
              <p className="text-sm text-muted-foreground">
                Ao aprovar, será gerado um número oficial <strong>ART-{new Date().getFullYear()}-XXXX</strong> e o PDF será criado automaticamente. Esta ação não pode ser desfeita.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Informe o motivo da reprovação. O técnico será notificado.
                </p>
                <Textarea
                  placeholder="Ex: Evidências insuficientes. Adicione fotos do equipamento instalado."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewMutation.isPending}
              className={reviewDialog?.action === "aprovado"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {reviewMutation.isPending ? "Processando..." : (
                reviewDialog?.action === "aprovado" ? "Confirmar Aprovação" : "Confirmar Reprovação"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SaasDashboardLayout>
  );
}

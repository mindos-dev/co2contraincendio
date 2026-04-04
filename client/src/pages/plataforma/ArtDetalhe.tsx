/**
 * ART OPERIS — Detalhe, Cadastro e Aprovação
 * Responsabilidade Técnica Digital
 */
import { useState, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { exportArtPdf } from "@/lib/exportArtPdf";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileBadge2, ArrowLeft, Upload, CheckCircle2, XCircle, Clock,
  FileEdit, Shield, CreditCard, Lock, AlertTriangle, ExternalLink,
  Image, FileText, Video,
} from "lucide-react";
import { OPERIS_COLORS } from "@/lib/operis-tokens";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { value: "pmoc", label: "PMOC — Plano de Manutenção, Operação e Controle" },
  { value: "incendio", label: "Incêndio — Sistema de Combate a Incêndio" },
  { value: "eletrica", label: "Elétrica — Instalações Elétricas" },
  { value: "gas", label: "Gás — Instalações de Gás" },
  { value: "hidraulico", label: "Hidráulico — Instalações Hidráulicas" },
  { value: "co2", label: "CO₂ — Sistema de Supressão CO₂" },
  { value: "outro", label: "Outro" },
];

const DECLARATION_TEXT =
  "Declaro que o serviço foi executado conforme normas técnicas aplicáveis, " +
  "em conformidade com as normas ABNT, NR-10, NR-12 e demais regulamentações vigentes, " +
  "e que as informações prestadas neste documento são verdadeiras e de minha inteira responsabilidade.";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getEvidenceIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <Image size={14} />;
  if (mimeType.startsWith("video/")) return <Video size={14} />;
  return <FileText size={14} />;
}

// ─── Componente Nova ART ─────────────────────────────────────────────────────

function NovaArt() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    serviceType: "" as string,
    description: "",
    clientName: "",
    clientDocument: "",
    serviceAddress: "",
    serviceDate: new Date().toISOString().split("T")[0],
  });

  const createMutation = trpc.art.create.useMutation({
    onSuccess: (data) => {
      toast.success("ART criada com sucesso!", { description: `ART #${data.id} em rascunho.` });
      setLocation(`/app/art/${data.id}`);
    },
    onError: (err) => {
      toast.error("Erro ao criar ART", { description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceType) {
      toast.error("Selecione o tipo de serviço");
      return;
    }
    createMutation.mutate({
      serviceType: form.serviceType as "pmoc" | "incendio" | "eletrica" | "gas" | "hidraulico" | "co2" | "outro",
      description: form.description,
      clientName: form.clientName,
      clientDocument: form.clientDocument || undefined,
      serviceAddress: form.serviceAddress || undefined,
      serviceDate: form.serviceDate,
    });
  };

  return (
    <SaasDashboardLayout>
      <div style={{ padding: "1.5rem", maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Button variant="ghost" onClick={() => setLocation("/app/art")}
            style={{ color: OPERIS_COLORS.textMuted, padding: "0.25rem 0.5rem" }}>
            <ArrowLeft size={14} style={{ marginRight: 4 }} /> Voltar
          </Button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileBadge2 size={18} color={OPERIS_COLORS.primary} />
            <h1 style={{ fontSize: "1.125rem", fontWeight: 700, color: OPERIS_COLORS.textPrimary, margin: 0 }}>
              Nova ART OPERIS
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, marginBottom: "1rem" }}>
            <CardHeader style={{ padding: "1rem 1rem 0.5rem" }}>
              <CardTitle style={{ fontSize: "0.875rem", color: OPERIS_COLORS.textPrimary }}>
                Dados do Serviço Técnico
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: "0.5rem 1rem 1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>

              <div>
                <Label style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, marginBottom: "0.25rem", display: "block" }}>
                  Tipo de Serviço *
                </Label>
                <Select value={form.serviceType} onValueChange={v => setForm(f => ({ ...f, serviceType: v }))}>
                  <SelectTrigger style={{ background: OPERIS_COLORS.bg, border: `1px solid ${OPERIS_COLORS.border}`, color: OPERIS_COLORS.textPrimary }}>
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, marginBottom: "0.25rem", display: "block" }}>
                  Descrição do Serviço * (mín. 10 caracteres)
                </Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descreva o serviço executado, normas aplicadas, equipamentos utilizados..."
                  rows={4}
                  required
                  minLength={10}
                  style={{ background: OPERIS_COLORS.bg, border: `1px solid ${OPERIS_COLORS.border}`, color: OPERIS_COLORS.textPrimary, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <Label style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, marginBottom: "0.25rem", display: "block" }}>
                    Nome do Cliente *
                  </Label>
                  <Input
                    value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                    placeholder="Razão social ou nome"
                    required
                    style={{ background: OPERIS_COLORS.bg, border: `1px solid ${OPERIS_COLORS.border}`, color: OPERIS_COLORS.textPrimary }}
                  />
                </div>
                <div>
                  <Label style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, marginBottom: "0.25rem", display: "block" }}>
                    CNPJ / CPF
                  </Label>
                  <Input
                    value={form.clientDocument}
                    onChange={e => setForm(f => ({ ...f, clientDocument: e.target.value }))}
                    placeholder="00.000.000/0001-00"
                    style={{ background: OPERIS_COLORS.bg, border: `1px solid ${OPERIS_COLORS.border}`, color: OPERIS_COLORS.textPrimary }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <Label style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, marginBottom: "0.25rem", display: "block" }}>
                    Endereço do Serviço
                  </Label>
                  <Input
                    value={form.serviceAddress}
                    onChange={e => setForm(f => ({ ...f, serviceAddress: e.target.value }))}
                    placeholder="Rua, número, bairro, cidade"
                    style={{ background: OPERIS_COLORS.bg, border: `1px solid ${OPERIS_COLORS.border}`, color: OPERIS_COLORS.textPrimary }}
                  />
                </div>
                <div>
                  <Label style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, marginBottom: "0.25rem", display: "block" }}>
                    Data do Serviço *
                  </Label>
                  <Input
                    type="date"
                    value={form.serviceDate}
                    onChange={e => setForm(f => ({ ...f, serviceDate: e.target.value }))}
                    required
                    style={{ background: OPERIS_COLORS.bg, border: `1px solid ${OPERIS_COLORS.border}`, color: OPERIS_COLORS.textPrimary }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={createMutation.isPending}
            style={{ width: "100%", background: OPERIS_COLORS.primary, color: "#fff", padding: "0.75rem" }}>
            {createMutation.isPending ? "Criando..." : "Criar ART e adicionar evidências →"}
          </Button>
        </form>
      </div>
    </SaasDashboardLayout>
  );
}

// ─── Componente Detalhe ART ──────────────────────────────────────────────────

function ArtDetalheView() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/app/art/:id");
  const artId = parseInt(params?.id ?? "0", 10);
  const { isAdmin, user } = useSaasAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const utils = trpc.useUtils();

  const { data: art, isLoading } = trpc.art.getById.useQuery({ id: artId });

  const uploadMutation = trpc.art.uploadEvidence.useMutation({
    onSuccess: () => {
      toast.success("Evidência enviada com sucesso!");
      utils.art.getById.invalidate({ id: artId });
    },
    onError: (err) => {
      toast.error("Erro no upload", { description: err.message });
    },
  });

  const submitMutation = trpc.art.submitForApproval.useMutation({
    onSuccess: (data) => {
      toast.success("ART enviada para aprovação!", { description: `Hash de autenticidade: ${data.submissionHash.substring(0, 16)}...` });
      utils.art.getById.invalidate({ id: artId });
    },
    onError: (err) => {
      toast.error("Erro ao enviar", { description: err.message });
    },
  });

  const reviewMutation = trpc.art.review.useMutation({
    onSuccess: (data) => {
      if (data.action === "aprovado") {
        toast.success("ART aprovada!");
      } else {
        toast.error("ART reprovada");
      }
      utils.art.getById.invalidate({ id: artId });
    },
    onError: (err) => {
      toast.error("Erro na revisão", { description: err.message });
    },
  });

  const paymentMutation = trpc.art.createPaymentCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecionando para pagamento...");
        window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
      }
    },
    onError: (err) => {
      toast.error("Erro no pagamento", { description: err.message });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const base64 = await readFileAsBase64(file);
        await uploadMutation.mutateAsync({
          artServiceId: artId,
          fileName: file.name,
          mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "video/mp4" | "video/quicktime" | "application/pdf",
          base64Data: base64,
        });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <SaasDashboardLayout>
        <div style={{ padding: "3rem", textAlign: "center", color: OPERIS_COLORS.textMuted }}>
          Carregando ART...
        </div>
      </SaasDashboardLayout>
    );
  }

  if (!art) {
    return (
      <SaasDashboardLayout>
        <div style={{ padding: "3rem", textAlign: "center", color: OPERIS_COLORS.textMuted }}>
          ART não encontrada.
        </div>
      </SaasDashboardLayout>
    );
  }

  const isOwner = art.technicianId === (user as { id?: number })?.id;
  const canUpload = art.status === "rascunho" && isOwner;
  const canSubmit = art.status === "rascunho" && isOwner && art.evidences.length > 0;
  const canReview = isAdmin && art.status === "aguardando_aprovacao";
  const needsPayment = art.paymentStatus === "pending_payment";

  const statusColors: Record<string, string> = {
    rascunho: "#6b7280",
    aguardando_aprovacao: "#f59e0b",
    aprovado: "#10b981",
    reprovado: "#ef4444",
  };
  const statusColor = statusColors[art.status] ?? "#6b7280";

  return (
    <SaasDashboardLayout>
      <div style={{ padding: "1.5rem", maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Button variant="ghost" onClick={() => setLocation("/app/art")}
              style={{ color: OPERIS_COLORS.textMuted, padding: "0.25rem 0.5rem" }}>
              <ArrowLeft size={14} style={{ marginRight: 4 }} /> Voltar
            </Button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h1 style={{ fontSize: "1.125rem", fontWeight: 700, color: OPERIS_COLORS.textPrimary, margin: 0 }}>
                  ART #{art.id}
                </h1>
                <span style={{ padding: "0.125rem 0.5rem", borderRadius: 4, background: statusColor + "22", color: statusColor, fontSize: "0.6875rem", fontWeight: 700 }}>
                  {art.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, margin: 0 }}>
                {art.serviceType.toUpperCase()} — {art.clientName}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {art.pdfUrl && (
              <Button onClick={() => window.open(art.pdfUrl!, "_blank", "noopener,noreferrer")}
                style={{ background: "#10b981", color: "#fff", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <ExternalLink size={13} /> Ver ART Digital
              </Button>
            )}
            {art.status === "aprovado" && (
              <Button
                onClick={() => exportArtPdf({
                  id: art.id,
                  serviceType: art.serviceType,
                  description: art.description,
                  clientName: art.clientName,
                  clientDocument: art.clientDocument,
                  serviceAddress: art.serviceAddress,
                  serviceDate: art.serviceDate,
                  status: art.status,
                  submissionHash: art.submissionHash,
                  technicianSignatureTs: art.technicianSignatureTs,
                  approvedAt: art.approvedAt,
                  technician: { name: user?.name ?? "Técnico", email: user?.email ?? "" },
                  approvals: art.approvals ?? [],
                  evidences: art.evidences ?? [],
                  companyName: "CO2 Contra Incêndio Ltda",
                })}
                style={{ background: OPERIS_COLORS.primary, color: "#fff", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <FileText size={13} /> Baixar PDF
              </Button>
            )}
          </div>
        </div>

        {/* Alerta de pagamento */}
        {needsPayment && (
          <Card style={{ background: "#1c1200", border: "1px solid #f59e0b", marginBottom: "1rem" }}>
            <CardContent style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f59e0b" }}>
                <CreditCard size={14} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                  Pagamento necessário — R$ 49,00 por ART
                </span>
              </div>
              <Button onClick={() => paymentMutation.mutate({ artServiceId: artId, origin: window.location.origin })}
                disabled={paymentMutation.isPending}
                style={{ background: "#f59e0b", color: "#000", fontSize: "0.8125rem" }}>
                {paymentMutation.isPending ? "Aguarde..." : "Pagar e emitir ART"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dados do serviço */}
        <Card style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, marginBottom: "1rem" }}>
          <CardHeader style={{ padding: "0.875rem 1rem 0.5rem" }}>
            <CardTitle style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary }}>Dados do Serviço</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: "0 1rem 0.875rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.625rem" }}>
              {[
                { label: "Tipo", value: art.serviceType.toUpperCase() },
                { label: "Cliente", value: art.clientName },
                { label: "CNPJ/CPF", value: art.clientDocument ?? "—" },
                { label: "Endereço", value: art.serviceAddress ?? "—" },
                { label: "Data do Serviço", value: art.serviceDate ? new Date(art.serviceDate).toLocaleDateString("pt-BR") : "—" },
                { label: "Assinado em", value: art.technicianSignatureTs ? new Date(art.technicianSignatureTs).toLocaleString("pt-BR") : "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: OPERIS_COLORS.textDisabled, marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary }}>{value}</div>
                </div>
              ))}
            </div>
            {art.description && (
              <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: `1px solid ${OPERIS_COLORS.border}` }}>
                <div style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: OPERIS_COLORS.textDisabled, marginBottom: 4 }}>
                  Descrição
                </div>
                <p style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary, margin: 0, lineHeight: 1.6 }}>
                  {art.description}
                </p>
              </div>
            )}
            {art.submissionHash && (
              <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: `1px solid ${OPERIS_COLORS.border}`, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Shield size={12} color="#10b981" />
                <span style={{ fontSize: "0.6875rem", color: "#10b981", fontFamily: "monospace" }}>
                  Hash: {art.submissionHash}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evidências */}
        <Card style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, marginBottom: "1rem" }}>
          <CardHeader style={{ padding: "0.875rem 1rem 0.5rem", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <CardTitle style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary }}>
              Evidências ({art.evidences.length})
            </CardTitle>
            {canUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,video/mp4,application/pdf"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <Button size="sm" onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{ background: OPERIS_COLORS.primary, color: "#fff", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <Upload size={12} />
                  {uploading ? "Enviando..." : "Adicionar"}
                </Button>
              </>
            )}
          </CardHeader>
          <CardContent style={{ padding: "0 1rem 0.875rem" }}>
            {art.evidences.length === 0 ? (
              <p style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textMuted, textAlign: "center", padding: "1.5rem 0" }}>
                Nenhuma evidência adicionada.
                {canUpload && " Clique em 'Adicionar' para enviar fotos, vídeos ou NF-e."}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {art.evidences.map((ev) => (
                  <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.625rem", background: OPERIS_COLORS.bg, borderRadius: 4, border: `1px solid ${OPERIS_COLORS.border}` }}>
                    <span style={{ color: OPERIS_COLORS.textMuted }}>{getEvidenceIcon(ev.mimeType)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ev.fileName}
                      </div>
                      <div style={{ fontSize: "0.625rem", color: OPERIS_COLORS.textDisabled, fontFamily: "monospace" }}>
                        SHA256: {ev.sha256Hash.substring(0, 20)}...
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      {ev.isLocked && (
                        <span title="Evidência bloqueada — imutável">
                          <Lock size={10} color="#f59e0b" />
                        </span>
                      )}
                      <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "0.6875rem", color: OPERIS_COLORS.primary }}>
                        Ver
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Declaração e envio para aprovação */}
        {canSubmit && (
          <Card style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, marginBottom: "1rem" }}>
            <CardHeader style={{ padding: "0.875rem 1rem 0.5rem" }}>
              <CardTitle style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Shield size={14} color={OPERIS_COLORS.primary} />
                Declaração do Técnico Responsável
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: "0 1rem 1rem" }}>
              <div style={{ background: OPERIS_COLORS.bg, border: `1px solid ${OPERIS_COLORS.border}`, borderRadius: 4, padding: "0.875rem", marginBottom: "0.875rem" }}>
                <p style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary, margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
                  "{DECLARATION_TEXT}"
                </p>
              </div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", cursor: "pointer", marginBottom: "1rem" }}>
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={e => setDeclarationAccepted(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: OPERIS_COLORS.primary }}
                />
                <span style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary }}>
                  Li e aceito a declaração acima, assumindo responsabilidade técnica pelo serviço executado.
                </span>
              </label>
              <Button
                onClick={() => submitMutation.mutate({ artServiceId: artId, declaration: true })}
                disabled={!declarationAccepted || submitMutation.isPending || needsPayment}
                style={{ width: "100%", background: declarationAccepted && !needsPayment ? OPERIS_COLORS.primary : "#374151", color: "#fff" }}>
                {submitMutation.isPending ? "Enviando..." : "Assinar e enviar para aprovação"}
              </Button>
              {needsPayment && (
                <p style={{ fontSize: "0.75rem", color: "#f59e0b", textAlign: "center", marginTop: "0.5rem" }}>
                  ⚠️ Realize o pagamento antes de enviar para aprovação.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Painel de aprovação (engenheiro/admin) */}
        {canReview && (
          <Card style={{ background: "#0f1a0f", border: "1px solid #10b981", marginBottom: "1rem" }}>
            <CardHeader style={{ padding: "0.875rem 1rem 0.5rem" }}>
              <CardTitle style={{ fontSize: "0.8125rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={14} />
                Revisão Técnica — Engenheiro Responsável
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: "0 1rem 1rem" }}>
              <div style={{ marginBottom: "0.75rem" }}>
                <Label style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, marginBottom: "0.25rem", display: "block" }}>
                  Observações (opcional para aprovação, obrigatório para reprovação)
                </Label>
                <Textarea
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Descreva observações técnicas, motivo de reprovação ou recomendações..."
                  rows={3}
                  style={{ background: OPERIS_COLORS.bg, border: `1px solid ${OPERIS_COLORS.border}`, color: OPERIS_COLORS.textPrimary, resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Button
                  onClick={() => reviewMutation.mutate({ artServiceId: artId, action: "aprovado", notes: reviewNotes || undefined })}
                  disabled={reviewMutation.isPending}
                  style={{ flex: 1, background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                  <CheckCircle2 size={14} />
                  Aprovar ART
                </Button>
                <Button
                  onClick={() => {
                    if (!reviewNotes.trim()) {
                      toast.error("Informe o motivo da reprovação");
                      return;
                    }
                    reviewMutation.mutate({ artServiceId: artId, action: "reprovado", notes: reviewNotes });
                  }}
                  disabled={reviewMutation.isPending}
                  variant="outline"
                  style={{ flex: 1, borderColor: "#ef4444", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                  <XCircle size={14} />
                  Reprovar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de aprovações */}
        {art.approvals.length > 0 && (
          <Card style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}` }}>
            <CardHeader style={{ padding: "0.875rem 1rem 0.5rem" }}>
              <CardTitle style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary }}>
                Histórico de Revisões
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: "0 1rem 0.875rem" }}>
              {art.approvals.map((ap: { id: number; action: string; notes: string | null; reviewedAt: Date | string }) => (
                <div key={ap.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", padding: "0.625rem 0", borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                  {ap.action === "aprovado"
                    ? <CheckCircle2 size={14} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                    : <XCircle size={14} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                  }
                  <div>
                    <div style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary, fontWeight: 600 }}>
                      {ap.action === "aprovado" ? "Aprovado" : "Reprovado"} em {new Date(ap.reviewedAt).toLocaleString("pt-BR")}
                    </div>
                    {ap.notes && (
                      <div style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, marginTop: 2 }}>
                        {ap.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

// ─── Export padrão — roteamento interno ──────────────────────────────────────

export { NovaArt };
export default ArtDetalheView;

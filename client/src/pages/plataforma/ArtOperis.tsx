/**
 * ART OPERIS — Listagem e painel principal
 * Responsabilidade Técnica Digital
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FileBadge2, Plus, Clock, CheckCircle2, XCircle, FileEdit,
  AlertCircle, ChevronDown, Eye, CreditCard, Shield,
} from "lucide-react";
import { OPERIS_COLORS } from "@/lib/operis-tokens";

// ─── Status helpers ───────────────────────────────────────────────────────────

type ArtStatus = "rascunho" | "aguardando_aprovacao" | "aprovado" | "reprovado";

const STATUS_CONFIG: Record<ArtStatus, { label: string; color: string; icon: React.ReactNode }> = {
  rascunho: { label: "Rascunho", color: "#6b7280", icon: <FileEdit size={12} /> },
  aguardando_aprovacao: { label: "Aguardando", color: "#f59e0b", icon: <Clock size={12} /> },
  aprovado: { label: "Aprovado", color: "#10b981", icon: <CheckCircle2 size={12} /> },
  reprovado: { label: "Reprovado", color: "#ef4444", icon: <XCircle size={12} /> },
};

const SERVICE_LABELS: Record<string, string> = {
  pmoc: "PMOC",
  incendio: "Incêndio",
  eletrica: "Elétrica",
  gas: "Gás",
  hidraulico: "Hidráulico",
  co2: "CO₂",
  outro: "Outro",
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ArtOperis() {
  const [, setLocation] = useLocation();
  const { isAdmin } = useSaasAuth();
  const [statusFilter, setStatusFilter] = useState<ArtStatus | "todos">("todos");
  const [allItems, setAllItems] = useState<ArtItem[]>([]);
  const [cursor, setCursor] = useState<number | undefined>(undefined);

  type ArtItem = {
    id: number;
    serviceType: string;
    clientName: string;
    serviceDate: string | Date | null;
    status: ArtStatus;
    paymentStatus: string;
    pdfUrl: string | null;
    createdAt: string | Date;
  };

  const { data, isLoading, isFetching } = trpc.art.list.useQuery(
    { cursor, limit: 50, status: statusFilter === "todos" ? undefined : statusFilter },
  );

  // Acumular itens paginados
  const [prevCursor, setPrevCursor] = useState<number | undefined>(undefined);
  if (data && prevCursor !== cursor) {
    setPrevCursor(cursor);
    if (cursor === undefined) {
      setAllItems(data.items as ArtItem[]);
    } else {
      setAllItems(prev => [...prev, ...(data.items as ArtItem[])]);
    }
  }

  const pendingQuery = trpc.art.pendingApproval.useQuery(undefined, {
    enabled: isAdmin,
  });

  const handleFilterChange = (val: string) => {
    setStatusFilter(val as ArtStatus | "todos");
    setCursor(undefined);
    setAllItems([]);
  };

  const handleLoadMore = () => {
    if (data?.nextCursor) setCursor(data.nextCursor);
  };

  const formatDate = (d: string | Date | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  return (
    <SaasDashboardLayout>
      <div style={{ padding: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, background: OPERIS_COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
              <FileBadge2 size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: OPERIS_COLORS.textPrimary, margin: 0 }}>
                ART OPERIS
              </h1>
              <p style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted, margin: 0 }}>
                Responsabilidade Técnica Digital
              </p>
            </div>
          </div>
          <Button
            onClick={() => setLocation("/app/art/nova")}
            style={{ background: OPERIS_COLORS.primary, color: "#fff", display: "flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Plus size={14} />
            Nova ART
          </Button>
        </div>

        {/* Cards de resumo */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {(["rascunho", "aguardando_aprovacao", "aprovado", "reprovado"] as ArtStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = allItems.filter(i => i.status === s).length;
            return (
              <Card key={s} style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, cursor: "pointer" }}
                onClick={() => handleFilterChange(s)}>
                <CardContent style={{ padding: "0.875rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{ color: cfg.color }}>{cfg.icon}</div>
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: cfg.color, lineHeight: 1 }}>{count}</div>
                    <div style={{ fontSize: "0.6875rem", color: OPERIS_COLORS.textMuted }}>{cfg.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pendentes de aprovação (admin) */}
        {isAdmin && pendingQuery.data && pendingQuery.data.length > 0 && (
          <Card style={{ background: "#1c1a0a", border: "1px solid #f59e0b", marginBottom: "1rem" }}>
            <CardHeader style={{ padding: "0.875rem 1rem 0.5rem" }}>
              <CardTitle style={{ fontSize: "0.875rem", color: "#f59e0b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertCircle size={14} />
                {pendingQuery.data.length} ART{pendingQuery.data.length > 1 ? "s" : ""} aguardando sua aprovação
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: "0 1rem 0.875rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {pendingQuery.data.slice(0, 5).map((art: ArtItem) => (
                  <Button key={art.id} variant="outline" size="sm"
                    onClick={() => setLocation(`/app/art/${art.id}`)}
                    style={{ fontSize: "0.75rem", borderColor: "#f59e0b", color: "#f59e0b" }}>
                    ART #{art.id} — {art.clientName}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger style={{ width: 180, background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}`, color: OPERIS_COLORS.textPrimary }}>
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="aguardando_aprovacao">Aguardando aprovação</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="reprovado">Reprovado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <Card style={{ background: OPERIS_COLORS.bgCard, border: `1px solid ${OPERIS_COLORS.border}` }}>
          <CardContent style={{ padding: 0 }}>
            {isLoading && cursor === undefined ? (
              <div style={{ padding: "3rem", textAlign: "center", color: OPERIS_COLORS.textMuted }}>
                Carregando ARTs...
              </div>
            ) : allItems.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <FileBadge2 size={40} color={OPERIS_COLORS.textDisabled} style={{ margin: "0 auto 0.75rem" }} />
                <p style={{ color: OPERIS_COLORS.textMuted, fontSize: "0.875rem" }}>
                  Nenhuma ART encontrada.
                </p>
                <Button onClick={() => setLocation("/app/art/nova")}
                  style={{ marginTop: "0.75rem", background: OPERIS_COLORS.primary, color: "#fff" }}>
                  Criar primeira ART
                </Button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}` }}>
                      {["#", "Tipo", "Cliente", "Data Serviço", "Status", "Pagamento", "Ações"].map(h => (
                        <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: OPERIS_COLORS.textDisabled }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allItems.map(art => {
                      const cfg = STATUS_CONFIG[art.status];
                      return (
                        <tr key={art.id}
                          style={{ borderBottom: `1px solid ${OPERIS_COLORS.border}`, transition: "background 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = OPERIS_COLORS.bgHover)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ padding: "0.625rem 0.875rem", fontSize: "0.8125rem", color: OPERIS_COLORS.textMuted }}>
                            #{art.id}
                          </td>
                          <td style={{ padding: "0.625rem 0.875rem", fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary, fontWeight: 600 }}>
                            {SERVICE_LABELS[art.serviceType] ?? art.serviceType}
                          </td>
                          <td style={{ padding: "0.625rem 0.875rem", fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary }}>
                            {art.clientName}
                          </td>
                          <td style={{ padding: "0.625rem 0.875rem", fontSize: "0.8125rem", color: OPERIS_COLORS.textMuted }}>
                            {formatDate(art.serviceDate)}
                          </td>
                          <td style={{ padding: "0.625rem 0.875rem" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.1875rem 0.5rem", borderRadius: 4, background: cfg.color + "22", color: cfg.color, fontSize: "0.6875rem", fontWeight: 600 }}>
                              {cfg.icon}
                              {cfg.label}
                            </span>
                          </td>
                          <td style={{ padding: "0.625rem 0.875rem" }}>
                            {art.paymentStatus === "paid" || art.paymentStatus === "free_plan" ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#10b981", fontSize: "0.6875rem" }}>
                                <Shield size={10} /> Liberado
                              </span>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#f59e0b", fontSize: "0.6875rem" }}>
                                <CreditCard size={10} /> Pendente
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "0.625rem 0.875rem" }}>
                            <div style={{ display: "flex", gap: "0.375rem" }}>
                              <Button size="sm" variant="ghost"
                                onClick={() => setLocation(`/app/art/${art.id}`)}
                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.6875rem", color: OPERIS_COLORS.textMuted }}>
                                <Eye size={12} style={{ marginRight: 4 }} />
                                Ver
                              </Button>
                              {art.pdfUrl && (
                                <Button size="sm" variant="ghost"
                                  onClick={() => window.open(art.pdfUrl!, "_blank", "noopener,noreferrer")}
                                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.6875rem", color: "#10b981" }}>
                                  PDF
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Carregar mais */}
                {data?.nextCursor && (
                  <div style={{ padding: "1rem", textAlign: "center" }}>
                    <Button variant="outline" onClick={handleLoadMore} disabled={isFetching}
                      style={{ borderColor: OPERIS_COLORS.border, color: OPERIS_COLORS.textMuted, display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                      {isFetching ? "Carregando..." : <><ChevronDown size={14} /> Carregar mais</>}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SaasDashboardLayout>
  );
}

/**
 * AdminOperis.tsx — Painel de Administração OPERIS IA
 * Visível apenas para usuários com role admin/superadmin
 * Exibe estatísticas globais, todas as inspeções e todos os laudos
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ClipboardList,
  FileText,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Share2,
} from "lucide-react";
import ShareButton from "@/components/ShareButton";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  R1: "bg-green-100 text-green-800",
  R2: "bg-yellow-100 text-yellow-800",
  R3: "bg-orange-100 text-orange-800",
  R4: "bg-red-100 text-red-800",
  R5: "bg-red-900 text-white",
};

const STATUS_LABELS: Record<string, string> = {
  em_progresso: "Em progresso",
  concluida: "Concluída",
  revisao: "Revisão",
  pronto: "Pronto",
};

const STATUS_COLORS: Record<string, string> = {
  em_progresso: "bg-blue-100 text-blue-800",
  concluida: "bg-green-100 text-green-800",
  revisao: "bg-yellow-100 text-yellow-800",
  pronto: "bg-green-100 text-green-800",
};

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── KPI Cards ───────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  color = "text-gray-700",
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`p-3 rounded-full bg-gray-100 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tabela de Inspeções ──────────────────────────────────────────────────────

function InspecoesTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const { data: rows, isLoading } = trpc.operis.adminListInspections.useQuery({
    page,
    limit: 15,
    status: statusFilter !== "todos" ? statusFilter : undefined,
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="em_progresso">Em progresso</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="revisao">Revisão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Sistema</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-16">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && (!rows || rows.length === 0) && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Nenhuma inspeção encontrada.
                </TableCell>
              </TableRow>
            )}
            {rows?.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                <TableCell className="font-medium max-w-[160px] truncate">{row.title}</TableCell>
                <TableCell className="max-w-[120px] truncate">{row.client}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.systemType}</Badge>
                </TableCell>
                <TableCell>{row.technicianName ?? "—"}</TableCell>
                <TableCell>{row.companyName ?? "—"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${RISK_COLORS[row.globalRisk ?? "R1"]}`}>
                    {row.globalRisk ?? "R1"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[row.status ?? "em_progresso"]}`}>
                    {STATUS_LABELS[row.status ?? "em_progresso"]}
                  </span>
                </TableCell>
                <TableCell className="text-xs">{formatDate(row.createdAt)}</TableCell>
                <TableCell>
                  <Link href={`/operis/inspecao/${row.id}`}>
                    <Button variant="ghost" size="icon" title="Ver inspeção">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Página {page}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!rows || rows.length < 15}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tabela de Laudos ─────────────────────────────────────────────────────────

function LaudosTab() {
  const [page, setPage] = useState(1);

  const { data: rows, isLoading } = trpc.operis.adminListReports.useQuery({ page, limit: 15 });

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Gerado em</TableHead>
              <TableHead>Slug público</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && (!rows || rows.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum laudo encontrado.
                </TableCell>
              </TableRow>
            )}
            {rows?.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                <TableCell>{row.technicianName ?? "—"}</TableCell>
                <TableCell>{row.companyName ?? "—"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${RISK_COLORS[row.globalRisk ?? "R1"]}`}>
                    {row.globalRisk ?? "R1"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[row.status ?? "pronto"]}`}>
                    {STATUS_LABELS[row.status ?? "pronto"]}
                  </span>
                </TableCell>
                <TableCell className="text-xs">{formatDate(row.generatedAt)}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground max-w-[160px] truncate">
                  {row.publicSlug ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {row.publicSlug && (
                      <>
                        <Link href={`/operis/laudo/${row.publicSlug}`}>
                          <Button variant="ghost" size="icon" title="Ver laudo público">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                        <ShareButton
                          slug={row.publicSlug}
                          baseUrl={baseUrl}
                          trigger={
                            <Button variant="ghost" size="icon" title="Compartilhar laudo">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Página {page}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!rows || rows.length < 15}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Aba Técnicos ─────────────────────────────────────────────────────────────

function TecnicosTab({ technicians }: { technicians: { id: number; name: string; email: string; inspectionCount: number }[] }) {
  if (!technicians || technicians.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nenhum técnico cadastrado com o perfil "tecnico".
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Inspeções realizadas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technicians.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell>{t.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{t.inspectionCount ?? 0}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminOperis() {
  const { isAdmin, isAuthenticated } = useSaasAuth();
  const [, setLocation] = useLocation();

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/app/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: stats, isLoading: statsLoading } = trpc.operis.adminStats.useQuery(
    undefined,
    { enabled: isAuthenticated && isAdmin }
  );

  if (!isAuthenticated) return null;

  if (!isAdmin) {
    return (
      <SaasDashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Acesso Restrito</h2>
          <p className="text-muted-foreground mt-2">Esta área é exclusiva para administradores.</p>
        </div>
      </SaasDashboardLayout>
    );
  }

  const riskMap: Record<string, number> = {};
  if (stats?.riskDistribution) {
    for (const r of stats.riskDistribution) {
      if (r.risk) riskMap[r.risk] = r.cnt;
    }
  }

  return (
    <SaasDashboardLayout>
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-red-600" />
          Painel Admin — OPERIS IA
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão consolidada de todas as inspeções, laudos e técnicos da plataforma.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={ClipboardList}
          label="Total de inspeções"
          value={statsLoading ? "…" : stats?.totalInspections ?? 0}
          color="text-blue-600"
        />
        <KpiCard
          icon={FileText}
          label="Laudos gerados"
          value={statsLoading ? "…" : stats?.totalReports ?? 0}
          color="text-green-600"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Não conformidades"
          value={statsLoading ? "…" : stats?.nonConformities ?? 0}
          color="text-red-600"
        />
        <KpiCard
          icon={Users}
          label="Técnicos ativos"
          value={statsLoading ? "…" : stats?.technicians?.length ?? 0}
          color="text-purple-600"
        />
      </div>

      {/* Distribuição de risco */}
      {!statsLoading && stats && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distribuição de Risco (R1–R5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {["R1", "R2", "R3", "R4", "R5"].map((r) => (
                <div key={r} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${RISK_COLORS[r]}`}>
                  <span className="font-bold text-sm">{r}</span>
                  <span className="font-semibold">{riskMap[r] ?? 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Abas: Inspeções | Laudos | Técnicos */}
      <Tabs defaultValue="inspecoes">
        <TabsList>
          <TabsTrigger value="inspecoes">Inspeções</TabsTrigger>
          <TabsTrigger value="laudos">Laudos</TabsTrigger>
          <TabsTrigger value="tecnicos">Técnicos</TabsTrigger>
        </TabsList>

        <TabsContent value="inspecoes" className="mt-4">
          <InspecoesTab />
        </TabsContent>

        <TabsContent value="laudos" className="mt-4">
          <LaudosTab />
        </TabsContent>

        <TabsContent value="tecnicos" className="mt-4">
          <TecnicosTab technicians={(stats?.technicians ?? []) as { id: number; name: string; email: string; inspectionCount: number }[]} />
        </TabsContent>
      </Tabs>
    </div>
    </SaasDashboardLayout>
  );
}

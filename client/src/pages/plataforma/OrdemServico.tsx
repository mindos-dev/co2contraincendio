import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import {
  ClipboardList, Plus, ChevronRight, Clock, Wrench,
  AlertTriangle, CheckCircle2, XCircle, Package, Filter,
  Calendar, User, Hash, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type OSStatus = "aberta" | "em_andamento" | "aguardando_peca" | "concluida" | "cancelada";
type OSPriority = "baixa" | "media" | "alta" | "critica";
type OSType = "preventiva" | "corretiva" | "inspecao" | "instalacao" | "desativacao";

const STATUS_CONFIG: Record<OSStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  aberta:           { label: "Aberta",           color: "#60A5FA", bg: "rgba(96,165,250,0.12)",  icon: <Clock size={14} /> },
  em_andamento:     { label: "Em Andamento",     color: "#FBBF24", bg: "rgba(251,191,36,0.12)",  icon: <Wrench size={14} /> },
  aguardando_peca:  { label: "Aguard. Peça",     color: "#F97316", bg: "rgba(249,115,22,0.12)",  icon: <Package size={14} /> },
  concluida:        { label: "Concluída",         color: "#34D399", bg: "rgba(52,211,153,0.12)",  icon: <CheckCircle2 size={14} /> },
  cancelada:        { label: "Cancelada",         color: "#6B7280", bg: "rgba(107,114,128,0.12)", icon: <XCircle size={14} /> },
};

const PRIORITY_CONFIG: Record<OSPriority, { label: string; color: string }> = {
  baixa:   { label: "Baixa",   color: "#6B7280" },
  media:   { label: "Média",   color: "#60A5FA" },
  alta:    { label: "Alta",    color: "#FBBF24" },
  critica: { label: "Crítica", color: "#EF4444" },
};

const TYPE_LABELS: Record<OSType, string> = {
  preventiva:  "Preventiva",
  corretiva:   "Corretiva",
  inspecao:    "Inspeção",
  instalacao:  "Instalação",
  desativacao: "Desativação",
};

const STATUS_FLOW: OSStatus[] = ["aberta", "em_andamento", "aguardando_peca", "concluida"];

function StatusTimeline({ current }: { current: OSStatus }) {
  const steps = STATUS_FLOW;
  const currentIdx = steps.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 8 }}>
      {steps.map((step, idx) => {
        const cfg = STATUS_CONFIG[step];
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: active ? cfg.color : done ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)",
              border: `2px solid ${active ? cfg.color : done ? "#34D399" : "rgba(255,255,255,0.15)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: active ? "#000" : done ? "#34D399" : "rgba(255,255,255,0.3)",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
              transition: "all 0.3s",
            }}>
              {done ? <CheckCircle2 size={14} /> : idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div style={{
                width: 32, height: 2,
                background: done ? "#34D399" : "rgba(255,255,255,0.1)",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
      {current === "cancelada" && (
        <span style={{ marginLeft: 8, fontSize: 11, color: "#6B7280" }}>Cancelada</span>
      )}
    </div>
  );
}

export default function OrdemServico() {
  const { user: saasUser } = useSaasAuth();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<number | null>(null);

  const { data: orders = [], refetch } = trpc.saas.workOrders.list.useQuery({
    companyId: saasUser?.companyId ?? undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
  });

  const { data: detailOS } = trpc.saas.workOrders.get.useQuery(
    { id: showDetail! },
    { enabled: showDetail !== null }
  );

  const createMutation = trpc.saas.workOrders.create.useMutation({
    onSuccess: () => { toast.success("OS criada com sucesso!"); setShowCreate(false); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.saas.workOrders.update.useMutation({
    onSuccess: () => { toast.success("OS atualizada!"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    title: "", description: "", type: "preventiva" as OSType,
    priority: "media" as OSPriority, number: "", scheduledDate: "",
    estimatedHours: "", notes: "",
  });

  const filtered = orders.filter(o =>
    !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.number.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: orders.length,
    abertas: orders.filter(o => o.status === "aberta").length,
    emAndamento: orders.filter(o => o.status === "em_andamento").length,
    concluidas: orders.filter(o => o.status === "concluida").length,
  };

  const handleCreate = () => {
    if (!form.title || !form.number) return toast.error("Preencha título e número da OS");
    createMutation.mutate({
      companyId: saasUser?.companyId ?? 1,
      number: form.number,
      title: form.title,
      description: form.description || undefined,
      type: form.type,
      priority: form.priority,
      scheduledDate: form.scheduledDate || undefined,
      estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours) : undefined,
      notes: form.notes || undefined,
    });
  };

  const nextStatus = (current: OSStatus): OSStatus | null => {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  return (
    <div style={{ padding: "24px", background: "#0A0A0F", minHeight: "100vh", color: "#E8E8E8" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ClipboardList size={20} color="#C8102E" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Ordens de Serviço</h1>
            <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Gestão e acompanhamento de OS</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} style={{ background: "#C8102E", color: "#fff", border: "none", gap: 6 }}>
          <Plus size={16} /> Nova OS
        </Button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", value: stats.total, color: "#60A5FA" },
          { label: "Abertas", value: stats.abertas, color: "#FBBF24" },
          { label: "Em Andamento", value: stats.emAndamento, color: "#F97316" },
          { label: "Concluídas", value: stats.concluidas, color: "#34D399" },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <Input
          placeholder="Buscar por título ou número..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", maxWidth: 300 }}
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", width: 180 }}>
            <Filter size={14} style={{ marginRight: 6 }} />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* OS List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
            <ClipboardList size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>Nenhuma OS encontrada</p>
            <Button onClick={() => setShowCreate(true)} style={{ marginTop: 12, background: "#C8102E", color: "#fff", border: "none" }}>
              <Plus size={14} style={{ marginRight: 6 }} /> Criar primeira OS
            </Button>
          </div>
        ) : filtered.map(os => {
          const statusCfg = STATUS_CONFIG[os.status as OSStatus] ?? STATUS_CONFIG.aberta;
          const priorityCfg = PRIORITY_CONFIG[os.priority as OSPriority] ?? PRIORITY_CONFIG.media;
          const next = nextStatus(os.status as OSStatus);
          return (
            <div
              key={os.id}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "16px 20px", cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(200,16,46,0.4)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
              onClick={() => setShowDetail(os.id)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "monospace" }}>#{os.number}</span>
                    <span style={{ fontSize: 11, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.color}30`, borderRadius: 6, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                    <span style={{ fontSize: 11, color: priorityCfg.color, fontWeight: 600 }}>
                      ● {priorityCfg.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#6B7280", background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "2px 6px" }}>
                      {TYPE_LABELS[os.type as OSType] ?? os.type}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", margin: "0 0 4px" }}>{os.title}</h3>
                  {os.description && <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>{os.description}</p>}
                  <StatusTimeline current={os.status as OSStatus} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  {os.scheduledDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6B7280" }}>
                      <Calendar size={12} />
                      {new Date(os.scheduledDate).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                  {next && (
                    <Button
                      size="sm"
                      onClick={e => { e.stopPropagation(); updateMutation.mutate({ id: os.id, status: next }); }}
                      style={{ fontSize: 11, padding: "4px 10px", background: "rgba(200,16,46,0.15)", color: "#C8102E", border: "1px solid rgba(200,16,46,0.3)", borderRadius: 6, display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <ArrowRight size={12} /> {STATUS_CONFIG[next].label}
                    </Button>
                  )}
                  <ChevronRight size={16} color="#6B7280" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create OS Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", maxWidth: 560 }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#FFFFFF" }}>Nova Ordem de Serviço</DialogTitle>
          </DialogHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <Label style={{ color: "#9CA3AF", fontSize: 12 }}>Título da OS *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Recarga de extintores - Bloco A"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", marginTop: 4 }} />
            </div>
            <div>
              <Label style={{ color: "#9CA3AF", fontSize: 12 }}>Número da OS *</Label>
              <Input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                placeholder="OS-2024-001"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", marginTop: 4 }} />
            </div>
            <div>
              <Label style={{ color: "#9CA3AF", fontSize: 12 }}>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as OSType }))}>
                <SelectTrigger style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", marginTop: 4 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ color: "#9CA3AF", fontSize: 12 }}>Prioridade</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as OSPriority }))}>
                <SelectTrigger style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", marginTop: 4 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ color: "#9CA3AF", fontSize: 12 }}>Data Agendada</Label>
              <Input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", marginTop: 4 }} />
            </div>
            <div>
              <Label style={{ color: "#9CA3AF", fontSize: 12 }}>Horas Estimadas</Label>
              <Input type="number" value={form.estimatedHours} onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))}
                placeholder="4"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", marginTop: 4 }} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <Label style={{ color: "#9CA3AF", fontSize: 12 }}>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descreva o serviço a ser realizado..."
                rows={3}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", marginTop: 4, resize: "none" }} />
            </div>
          </div>
          <DialogFooter style={{ marginTop: 8 }}>
            <Button variant="outline" onClick={() => setShowCreate(false)} style={{ borderColor: "rgba(255,255,255,0.15)", color: "#9CA3AF" }}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} style={{ background: "#C8102E", color: "#fff", border: "none" }}>
              {createMutation.isPending ? "Criando..." : "Criar OS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetail !== null} onOpenChange={() => setShowDetail(null)}>
        <DialogContent style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8E8", maxWidth: 560 }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#FFFFFF" }}>
              {detailOS ? `OS #${detailOS.number}` : "Carregando..."}
            </DialogTitle>
          </DialogHeader>
          {detailOS && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", margin: "0 0 8px" }}>{detailOS.title}</h3>
                {detailOS.description && <p style={{ fontSize: 13, color: "#9CA3AF" }}>{detailOS.description}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Status</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: STATUS_CONFIG[detailOS.status as OSStatus]?.color ?? "#fff" }}>
                    {STATUS_CONFIG[detailOS.status as OSStatus]?.icon}
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{STATUS_CONFIG[detailOS.status as OSStatus]?.label ?? detailOS.status}</span>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Prioridade</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: PRIORITY_CONFIG[detailOS.priority as OSPriority]?.color ?? "#fff" }}>
                    {PRIORITY_CONFIG[detailOS.priority as OSPriority]?.label ?? detailOS.priority}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Tipo</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E8E8" }}>{TYPE_LABELS[detailOS.type as OSType] ?? detailOS.type}</div>
                </div>
                {detailOS.scheduledDate && (
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Agendada</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E8E8" }}>{new Date(detailOS.scheduledDate).toLocaleDateString("pt-BR")}</div>
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>Progresso da OS</div>
                <StatusTimeline current={detailOS.status as OSStatus} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["aberta", "em_andamento", "aguardando_peca", "concluida", "cancelada"] as OSStatus[]).map(s => (
                  <Button
                    key={s}
                    size="sm"
                    disabled={s === detailOS.status || updateMutation.isPending}
                    onClick={() => { updateMutation.mutate({ id: detailOS.id, status: s }); setShowDetail(null); }}
                    style={{
                      fontSize: 11, padding: "4px 10px",
                      background: s === detailOS.status ? STATUS_CONFIG[s].bg : "rgba(255,255,255,0.06)",
                      color: s === detailOS.status ? STATUS_CONFIG[s].color : "#9CA3AF",
                      border: `1px solid ${s === detailOS.status ? STATUS_CONFIG[s].color + "40" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 6,
                    }}
                  >
                    {STATUS_CONFIG[s].label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

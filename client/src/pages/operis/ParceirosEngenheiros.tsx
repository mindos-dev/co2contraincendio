import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Users, DollarSign, CheckCircle2, Clock, AlertTriangle,
  Plus, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";

const OPERIS_COLORS = {
  dark: "#0A1628",
  red: "#C8102E",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: "Pendente",  color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock size={12} /> },
  approved: { label: "Aprovado",  color: "bg-blue-500/20 text-blue-400 border-blue-500/30",     icon: <CheckCircle2 size={12} /> },
  paid:     { label: "Pago",      color: "bg-green-500/20 text-green-400 border-green-500/30",   icon: <CheckCircle2 size={12} /> },
  rejected: { label: "Rejeitado", color: "bg-red-500/20 text-red-400 border-red-500/30",         icon: <AlertTriangle size={12} /> },
};

export default function ParceirosEngenheiros() {
  const [activeTab, setActiveTab] = useState<"partners" | "payouts">("partners");
  const [showNewPartner, setShowNewPartner] = useState(false);
  const [expandedPartner, setExpandedPartner] = useState<number | null>(null);

  // Form novo parceiro
  const [newName, setNewName] = useState("");
  const [newCrea, setNewCrea] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCommission, setNewCommission] = useState("");
  const [newFixedFee, setNewFixedFee] = useState("");

  const partnersQuery = trpc.engineer.list.useQuery();
  const payoutsQuery  = trpc.engineer.listPayouts.useQuery({ status: "all" });
  const createMutation   = trpc.engineer.create.useMutation();
  const approveMutation  = trpc.engineer.approvePayout.useMutation();
  const markPaidMutation = trpc.engineer.markAsPaid.useMutation();
  const triggerMutation  = trpc.engineer.triggerPayout.useMutation();
  const deactivateMutation = trpc.engineer.deactivate.useMutation();

  const utils = trpc.useUtils();

  const handleCreatePartner = async () => {
    if (!newName || !newCrea) { toast.error("Nome e CREA são obrigatórios"); return; }
    try {
      await createMutation.mutateAsync({
        name: newName,
        crea: newCrea,
        phone: newPhone || undefined,
        email: newEmail || undefined,
        commissionRate: newCommission ? parseFloat(newCommission) : 0,
        fixedFee: newFixedFee ? parseFloat(newFixedFee) : undefined,
      });
      toast.success(`Engenheiro ${newName} cadastrado com sucesso`);
      setShowNewPartner(false);
      setNewName(""); setNewCrea(""); setNewPhone(""); setNewEmail(""); setNewCommission(""); setNewFixedFee("");
      utils.engineer.list.invalidate();
    } catch { toast.error("Erro ao cadastrar engenheiro"); }
  };

  const handleApprove = async (payoutId: number) => {
    try {
      await approveMutation.mutateAsync({ payoutId, paymentMethod: "pix" });
      toast.success("Pagamento aprovado");
      utils.engineer.listPayouts.invalidate();
    } catch { toast.error("Erro ao aprovar pagamento"); }
  };

  const handleMarkPaid = async (payoutId: number) => {
    try {
      await markPaidMutation.mutateAsync({ payoutId });
      toast.success("Pagamento marcado como realizado");
      utils.engineer.listPayouts.invalidate();
    } catch { toast.error("Erro ao marcar pagamento"); }
  };

  const handleTriggerPayout = async (inspectionId: number) => {
    if (!inspectionId) { toast.error("Informe o ID da vistoria"); return; }
    try {
      const result = await triggerMutation.mutateAsync({ inspectionId });
      if (result.ok) {
        toast.success("Pagamento gerado automaticamente");
        utils.engineer.listPayouts.invalidate();
      } else {
        toast.error(result.reason ?? "Erro ao gerar pagamento");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar pagamento";
      toast.error(msg);
    }
  };

  const handleDeactivate = async (partnerId: number, name: string) => {
    if (!confirm(`Desativar o parceiro ${name}?`)) return;
    try {
      await deactivateMutation.mutateAsync({ id: partnerId });
      toast.success(`${name} desativado`);
      utils.engineer.list.invalidate();
    } catch { toast.error("Erro ao desativar parceiro"); }
  };

  // KPIs
  const payouts = payoutsQuery.data ?? [];
  const totalPending  = payouts.filter(p => p.payout.status === "pending_approval").reduce((s, p) => s + Number(p.payout.amount), 0);
  const totalApproved = payouts.filter(p => p.payout.status === "approved").reduce((s, p) => s + Number(p.payout.amount), 0);
  const totalPaid     = payouts.filter(p => p.payout.status === "paid").reduce((s, p) => s + Number(p.payout.amount), 0);

  return (
    <SaasDashboardLayout>
      <div className="p-6 space-y-6" style={{ background: OPERIS_COLORS.dark, minHeight: "100vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users size={24} className="text-red-400" />
              Engenheiros Parceiros
            </h1>
            <p className="text-gray-400 text-sm mt-1">Gerencie freelancers, comissões e pagamentos automáticos</p>
          </div>
          <Button onClick={() => setShowNewPartner(!showNewPartner)}
            className="bg-red-600 hover:bg-red-700 text-white gap-2">
            <Plus size={16} /> Novo Parceiro
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "A Pagar",   value: totalPending,  color: "text-yellow-400", icon: <Clock size={18} className="text-yellow-400" /> },
            { label: "Aprovados", value: totalApproved, color: "text-blue-400",   icon: <CheckCircle2 size={18} className="text-blue-400" /> },
            { label: "Pagos",     value: totalPaid,     color: "text-green-400",  icon: <DollarSign size={18} className="text-green-400" /> },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-xl border p-4 flex items-center gap-4"
              style={{ background: OPERIS_COLORS.card, borderColor: OPERIS_COLORS.border }}>
              <div className="p-2 rounded-lg bg-gray-800">{kpi.icon}</div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">{kpi.label}</p>
                <p className={`text-xl font-bold ${kpi.color}`}>
                  R$ {kpi.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Formulário novo parceiro */}
        {showNewPartner && (
          <div className="rounded-xl border p-5 space-y-4"
            style={{ background: "rgba(200,16,46,0.05)", borderColor: "rgba(200,16,46,0.3)" }}>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
              <Plus size={14} className="text-red-400" /> Cadastrar Novo Engenheiro Parceiro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-gray-400 text-xs mb-1 block">Nome Completo *</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Eng. Nome Sobrenome" className="bg-gray-800 border-gray-700 text-white h-9" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs mb-1 block">CREA / CRECI *</Label>
                <Input value={newCrea} onChange={e => setNewCrea(e.target.value)}
                  placeholder="CREA/MG 000000000-0" className="bg-gray-800 border-gray-700 text-white h-9" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs mb-1 block">Telefone</Label>
                <Input value={newPhone} onChange={e => setNewPhone(e.target.value)}
                  placeholder="(31) 9 9999-9999" className="bg-gray-800 border-gray-700 text-white h-9" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs mb-1 block">E-mail</Label>
                <Input value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  type="email" className="bg-gray-800 border-gray-700 text-white h-9" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs mb-1 block">Comissão (% sobre aluguel)</Label>
                <Input value={newCommission} onChange={e => setNewCommission(e.target.value)}
                  type="number" min="0" max="100" placeholder="10"
                  className="bg-gray-800 border-gray-700 text-white h-9" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs mb-1 block">Taxa Fixa por Vistoria (R$)</Label>
                <Input value={newFixedFee} onChange={e => setNewFixedFee(e.target.value)}
                  type="number" min="0" placeholder="150,00"
                  className="bg-gray-800 border-gray-700 text-white h-9" />
              </div>
            </div>
            <p className="text-gray-600 text-xs">Se a Taxa Fixa for preenchida, ela tem prioridade sobre a comissão percentual.</p>
            <div className="flex gap-3">
              <Button onClick={handleCreatePartner} disabled={createMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white">
                {createMutation.isPending ? "Salvando..." : "Salvar Parceiro"}
              </Button>
              <Button variant="outline" onClick={() => setShowNewPartner(false)}
                className="border-gray-700 text-gray-400 hover:bg-gray-800">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b" style={{ borderColor: OPERIS_COLORS.border }}>
          {(["partners", "payouts"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-red-500 text-red-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}>
              {tab === "partners" ? `Parceiros Cadastrados (${partnersQuery.data?.length ?? 0})` : `Pagamentos (${payouts.length})`}
            </button>
          ))}
        </div>

        {/* Tab: Parceiros */}
        {activeTab === "partners" && (
          <div className="space-y-3">
            {partnersQuery.isLoading && <p className="text-gray-500 text-sm">Carregando parceiros...</p>}
            {partnersQuery.data?.length === 0 && (
              <div className="text-center py-12">
                <Users size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum engenheiro parceiro cadastrado ainda.</p>
                <p className="text-gray-600 text-sm mt-1">Clique em "Novo Parceiro" para começar.</p>
              </div>
            )}
            {partnersQuery.data?.map(partner => (
              <div key={partner.id} className="rounded-xl border overflow-hidden"
                style={{ background: OPERIS_COLORS.card, borderColor: OPERIS_COLORS.border }}>
                <div className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedPartner(expandedPartner === partner.id ? null : partner.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-red-400 font-bold text-sm">{partner.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{partner.name}</p>
                      <p className="text-gray-500 text-xs">{partner.crea}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={partner.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}>
                      {partner.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <span className="text-gray-500 text-xs">
                      {partner.fixedFee ? `R$ ${Number(partner.fixedFee).toFixed(2)}/vistoria` : `${partner.commissionRate ?? 0}% comissão`}
                    </span>
                    {expandedPartner === partner.id ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </div>
                </div>
                {expandedPartner === partner.id && (
                  <div className="px-4 pb-4 border-t pt-3 space-y-3" style={{ borderColor: OPERIS_COLORS.border }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {partner.phone && <div><p className="text-gray-500 text-xs">Telefone</p><p className="text-white">{partner.phone}</p></div>}
                      {partner.email && <div><p className="text-gray-500 text-xs">E-mail</p><p className="text-white">{partner.email}</p></div>}
                      <div><p className="text-gray-500 text-xs">Comissão</p><p className="text-white">{partner.commissionRate ?? 0}%</p></div>
                      {partner.fixedFee && <div><p className="text-gray-500 text-xs">Taxa Fixa</p><p className="text-white">R$ {Number(partner.fixedFee).toFixed(2)}</p></div>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"
                        onClick={() => {
                          const id = prompt("ID da Vistoria para gerar pagamento:");
                          if (id) handleTriggerPayout(parseInt(id));
                        }}
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 text-xs">
                        <RefreshCw size={12} className="mr-1" /> Gerar Pagamento Manual
                      </Button>
                      {partner.isActive && (
                        <Button size="sm" variant="outline"
                          onClick={() => handleDeactivate(partner.id, partner.name)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs">
                          Desativar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Pagamentos */}
        {activeTab === "payouts" && (
          <div className="space-y-3">
            {payoutsQuery.isLoading && <p className="text-gray-500 text-sm">Carregando pagamentos...</p>}
            {payouts.length === 0 && (
              <div className="text-center py-12">
                <DollarSign size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum pagamento registrado ainda.</p>
                <p className="text-gray-600 text-sm mt-1">Pagamentos são gerados automaticamente ao concluir uma vistoria com engenheiro parceiro.</p>
              </div>
            )}
            {payouts.map(row => {
              const p = row.payout;
              const eng = row.engineer;
              const insp = row.inspection;
              // Map backend status to display status
              const displayStatus = p.status === "pending_approval" ? "pending" : p.status;
              const cfg = STATUS_CONFIG[displayStatus] ?? STATUS_CONFIG.pending;
              return (
                <div key={p.id} className="rounded-xl border p-4 flex items-center justify-between"
                  style={{ background: OPERIS_COLORS.card, borderColor: OPERIS_COLORS.border }}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-gray-800">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        Vistoria #{p.inspectionId}{insp?.propertyAddress ? ` — ${insp.propertyAddress.substring(0, 35)}` : ""}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {eng?.name ?? "Engenheiro"} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString("pt-BR") : "—"}
                        {p.notes && ` · ${p.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-white font-bold">
                      R$ {Number(p.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <Badge className={`flex items-center gap-1 ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </Badge>
                    {p.status === "pending_approval" && (
                      <Button size="sm" onClick={() => handleApprove(p.id)}
                        disabled={approveMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7">
                        Aprovar
                      </Button>
                    )}
                    {p.status === "approved" && (
                      <Button size="sm" onClick={() => handleMarkPaid(p.id)}
                        disabled={markPaidMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs h-7">
                        Marcar Pago
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

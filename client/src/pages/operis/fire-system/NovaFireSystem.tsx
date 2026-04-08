/**
 * NovaFireSystem — Formulário de Nova Vistoria de Sistemas Fixos de Incêndio
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { FireSystemPaywallGuard } from "@/components/FireSystemPaywallGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Flame, ArrowLeft, Save, Loader2 } from "lucide-react";
import { Link } from "wouter";

function NovaFireSystemContent() {
  const { user } = useSaasAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    enterpriseName: "",
    shoppingName: "",
    storeName: "",
    address: "",
    city: "",
    state: "",
    responsibleLocal: "",
    inspectorName: user?.name ?? "",
    engineerName: "Judson Aleixo Sampaio",
    engineerCrea: "CREA/MG 142203671-5",
    artNumber: "",
    operationType: "",
    fuelType: "",
    cookingClassification: "",
    systemClassification: "",
    generalNotes: "",
    lastMaintenanceProvider: "",
  });

  const createMutation = trpc.fireSystem.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Vistoria criada: ${data.inspectionNumber}`, { description: `Hash: ${data.auditHash}` });
      navigate(`/app/fire-system/${data.inspectionId}`);
    },
    onError: (err) => {
      toast.error("Erro ao criar vistoria", { description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) {
      toast.error("Empresa não identificada");
      return;
    }
    createMutation.mutate({ ...form, companyId: user.companyId });
  };

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-[var(--operis-bg,#0A1628)] text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/fire-system">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
            <Flame className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Nova Vistoria — Sistemas Fixos</h1>
            <p className="text-slate-400 text-xs">NBR 14518:2019 · 16 seções · 53 itens de checklist</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Identificação do Local */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
          <h2 className="font-semibold text-orange-300 mb-4 text-sm uppercase tracking-wide">Identificação do Local</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label className="text-slate-300 text-sm">Razão Social / Nome da Empresa *</Label>
              <Input
                required
                value={form.enterpriseName}
                onChange={(e) => set("enterpriseName", e.target.value)}
                placeholder="Ex: Restaurante Sabor & Arte Ltda"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Shopping / Galeria</Label>
              <Input
                value={form.shoppingName}
                onChange={(e) => set("shoppingName", e.target.value)}
                placeholder="Ex: Shopping BH"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Nome da Loja / Unidade</Label>
              <Input
                value={form.storeName}
                onChange={(e) => set("storeName", e.target.value)}
                placeholder="Ex: Loja 142 — Praça de Alimentação"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-slate-300 text-sm">Endereço</Label>
              <Input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Rua, número, bairro"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Cidade</Label>
              <Input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Belo Horizonte"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">UF</Label>
              <Input
                value={form.state}
                onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))}
                placeholder="MG"
                maxLength={2}
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-slate-300 text-sm">Responsável Local (nome e cargo)</Label>
              <Input
                value={form.responsibleLocal}
                onChange={(e) => set("responsibleLocal", e.target.value)}
                placeholder="Ex: João Silva — Gerente de Operações"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Responsável Técnico */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
          <h2 className="font-semibold text-orange-300 mb-4 text-sm uppercase tracking-wide">Responsável Técnico</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Inspetor Responsável *</Label>
              <Input
                required
                value={form.inspectorName}
                onChange={(e) => set("inspectorName", e.target.value)}
                className="mt-1 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Engenheiro RT</Label>
              <Input
                value={form.engineerName}
                onChange={(e) => set("engineerName", e.target.value)}
                className="mt-1 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">CREA</Label>
              <Input
                value={form.engineerCrea}
                onChange={(e) => set("engineerCrea", e.target.value)}
                className="mt-1 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Número da ART</Label>
              <Input
                value={form.artNumber}
                onChange={(e) => set("artNumber", e.target.value)}
                placeholder="Ex: 2024-00123456"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
          <h2 className="font-semibold text-orange-300 mb-4 text-sm uppercase tracking-wide">Informações do Sistema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Tipo de Operação</Label>
              <Input
                value={form.operationType}
                onChange={(e) => set("operationType", e.target.value)}
                placeholder="Ex: Restaurante / Fast Food / Industrial"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Tipo de Combustível</Label>
              <Input
                value={form.fuelType}
                onChange={(e) => set("fuelType", e.target.value)}
                placeholder="Ex: GLP / Gás Natural / Lenha / Elétrico"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Classificação da Cozinha</Label>
              <Input
                value={form.cookingClassification}
                onChange={(e) => set("cookingClassification", e.target.value)}
                placeholder="Ex: Tipo I (alta temperatura) / Tipo II"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Classificação do Sistema Fixo</Label>
              <Input
                value={form.systemClassification}
                onChange={(e) => set("systemClassification", e.target.value)}
                placeholder="Ex: Saponificante / CO₂ / Pó Químico"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Última Empresa de Manutenção</Label>
              <Input
                value={form.lastMaintenanceProvider}
                onChange={(e) => set("lastMaintenanceProvider", e.target.value)}
                placeholder="Nome da empresa que realizou a última manutenção"
                className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label className="text-slate-300 text-sm">Observações Gerais</Label>
            <Textarea
              value={form.generalNotes}
              onChange={(e) => set("generalNotes", e.target.value)}
              placeholder="Condições gerais do local, observações iniciais..."
              rows={3}
              className="mt-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 resize-none"
            />
          </div>
        </div>

        {/* Aviso do checklist */}
        <div className="bg-orange-950/30 border border-orange-500/30 rounded-xl p-4 text-sm text-orange-200">
          <p className="font-medium mb-1">Checklist automático — 16 seções / 53 itens</p>
          <p className="text-orange-300/70">
            Ao criar a vistoria, o checklist completo da NBR 14518:2019 será gerado automaticamente.
            Você poderá preencher cada item, registrar fotos, comentários e medições na tela de detalhes.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link href="/app/fire-system">
            <Button type="button" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-orange-600 hover:bg-orange-500 text-white gap-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Criar Vistoria e Gerar Checklist
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NovaFireSystem() {
  return (
    <FireSystemPaywallGuard>
      <NovaFireSystemContent />
    </FireSystemPaywallGuard>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, ArrowLeft, ChevronRight, Flame, Droplets, Wifi, Snowflake, Wind } from "lucide-react";
import { Link } from "wouter";

const SYSTEM_ICONS: Record<string, React.ReactNode> = {
  CO2: <Flame className="w-6 h-6 text-red-400" />,
  Hidrante: <Droplets className="w-6 h-6 text-blue-400" />,
  SDAI: <Wifi className="w-6 h-6 text-yellow-400" />,
  SPK: <Droplets className="w-6 h-6 text-cyan-400" />,
  PMOC: <Snowflake className="w-6 h-6 text-sky-400" />,
};

const SYSTEM_DESCRIPTIONS: Record<string, string> = {
  CO2: "Sistema de supressão por CO₂ — NBR 12615 / NFPA 12",
  Hidrante: "Sistema de hidrantes e mangotinhos — NBR 13714",
  SDAI: "Sistema de detecção e alarme de incêndio — NBR 17240",
  SPK: "Sistema de chuveiros automáticos (sprinklers) — NBR 10897 / NFPA 13",
  PMOC: "Plano de Manutenção, Operação e Controle — Portaria MS 3523/98",
};

export default function NovaInspecao() {
  const [, navigate] = useLocation();
  const { data: systems } = trpc.operis.getSystems.useQuery();

  const [step, setStep] = useState<"sistema" | "dados">("sistema");
  const [selectedSystem, setSelectedSystem] = useState("");
  const [form, setForm] = useState({
    title: "",
    location: "",
    client: "",
    unit: "",
  });

  const createMutation = trpc.operis.createInspection.useMutation({
    onSuccess: (data) => {
      toast.success("Inspeção criada com sucesso!");
      navigate(`/operis/inspecao/${data.inspectionId}`);
    },
    onError: (err) => {
      toast.error("Erro ao criar inspeção: " + err.message);
    },
  });

  const handleCreate = () => {
    if (!form.title || !form.location || !form.client) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createMutation.mutate({
      title: form.title,
      location: form.location,
      client: form.client,
      unit: form.unit || undefined,
      system: selectedSystem,
    });
  };

  return (
    <SaasDashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/operis">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#e63946]" />
              Nova Inspeção Técnica
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {step === "sistema" ? "Passo 1: Selecione o sistema a inspecionar" : "Passo 2: Dados da inspeção"}
            </p>
          </div>
        </div>

        {/* Step 1: Seleção de Sistema */}
        {step === "sistema" && (
          <div className="space-y-3">
            {systems?.map((sys) => (
              <button
                key={sys.id}
                onClick={() => { setSelectedSystem(sys.id); setStep("dados"); }}
                className="w-full text-left p-4 rounded-xl bg-[#0d1f35] border border-slate-700/50 hover:border-[#e63946]/50 hover:bg-[#0d1f35]/80 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {SYSTEM_ICONS[sys.id] ?? <Wind className="w-6 h-6 text-slate-400" />}
                    <div>
                      <div className="font-semibold text-white group-hover:text-[#e63946] transition-colors">
                        {sys.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {SYSTEM_DESCRIPTIONS[sys.id] ?? `${sys.itemCount} itens de checklist`}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#e63946] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Dados da Inspeção */}
        {step === "dados" && (
          <Card className="bg-[#0d1f35] border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">
                Sistema: <span className="text-[#e63946]">{selectedSystem}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300 text-sm">Título da Inspeção *</Label>
                <Input
                  className="mt-1.5 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  placeholder="Ex: Inspeção Anual CO₂ — Sala de Servidores"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Cliente *</Label>
                <Input
                  className="mt-1.5 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  placeholder="Nome do cliente ou empresa"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Local / Endereço *</Label>
                <Input
                  className="mt-1.5 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  placeholder="Endereço completo da instalação"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Unidade / Setor (opcional)</Label>
                <Input
                  className="mt-1.5 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  placeholder="Ex: Bloco A, Piso 3, Sala de Servidores"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => setStep("sistema")}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1 bg-[#e63946] hover:bg-[#c1121f] text-white"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Criando..." : "Criar Inspeção"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SaasDashboardLayout>
  );
}

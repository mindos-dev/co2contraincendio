import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Flame,
  Wind,
  Zap,
  ClipboardList,
  ArrowLeft,
  MapPin,
  FileText,
  ChevronRight,
} from "lucide-react";

type InspectionType = "incendio" | "pmoc" | "eletrica" | "outros";

interface TypeOption {
  id: InspectionType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

const TYPES: TypeOption[] = [
  {
    id: "incendio",
    label: "Incêndio",
    description: "Extintores, hidrantes, alarmes, saídas de emergência",
    icon: <Flame className="w-8 h-8" />,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  {
    id: "pmoc",
    label: "PMOC",
    description: "Manutenção, operação e controle de ar-condicionado",
    icon: <Wind className="w-8 h-8" />,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    id: "eletrica",
    label: "Elétrica",
    description: "QDF, disjuntores, aterramento, cabos e tomadas",
    icon: <Zap className="w-8 h-8" />,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  {
    id: "outros",
    label: "Outros",
    description: "Vistoria técnica geral personalizada",
    icon: <ClipboardList className="w-8 h-8" />,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
];

export default function NovaVistoria() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"tipo" | "detalhes">("tipo");
  const [selectedType, setSelectedType] = useState<InspectionType | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = trpc.field.createInspection.useMutation({
    onSuccess: (data) => {
      toast.success("Vistoria criada! Iniciando checklist...");
      navigate(`/mobile/checklist/${data.id}`);
    },
    onError: (err) => {
      toast.error("Erro ao criar vistoria: " + err.message);
    },
  });

  const handleSelectType = (type: InspectionType) => {
    setSelectedType(type);
    const label = TYPES.find(t => t.id === type)?.label ?? type;
    setTitle(`Vistoria de ${label} — ${new Date().toLocaleDateString("pt-BR")}`);
    setStep("detalhes");
  };

  const handleSubmit = () => {
    if (!selectedType || !title.trim()) {
      toast.error("Preencha o título da vistoria.");
      return;
    }
    createMutation.mutate({
      type: selectedType,
      title: title.trim(),
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      offlineId: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
  };

  const selectedTypeData = TYPES.find(t => t.id === selectedType);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0a1628] text-white px-4 pt-safe-top pb-4">
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => step === "detalhes" ? setStep("tipo") : navigate("/mobile")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Nova Vistoria</h1>
            <p className="text-xs text-white/60">
              {step === "tipo" ? "Selecione o tipo" : "Detalhes da vistoria"}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mt-4">
          <div className="h-1 flex-1 rounded-full bg-[#C8102E]" />
          <div className={`h-1 flex-1 rounded-full ${step === "detalhes" ? "bg-[#C8102E]" : "bg-white/20"}`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {step === "tipo" ? (
          <div>
            <p className="text-sm text-gray-500 mb-5">
              Escolha o tipo de vistoria para carregar o checklist correto:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${type.bg} ${type.border} text-left transition-all active:scale-95`}
                >
                  <div className={`${type.color} flex-shrink-0`}>{type.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-base">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tipo selecionado */}
            {selectedTypeData && (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${selectedTypeData.bg} ${selectedTypeData.border} border`}>
                <div className={selectedTypeData.color}>{selectedTypeData.icon}</div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedTypeData.label}</div>
                  <div className="text-xs text-gray-500">{selectedTypeData.description}</div>
                </div>
              </div>
            )}

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" />
                Título da Vistoria *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Vistoria de Incêndio — Loja 42"
                className="h-12 text-base rounded-xl border-gray-200"
              />
            </div>

            {/* Local */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <MapPin className="w-4 h-4" />
                Local / Endereço
              </Label>
              <Input
                id="location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ex: Shopping BH, Loja 42, Piso L2"
                className="h-12 text-base rounded-xl border-gray-200"
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                Observações Iniciais
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Condições do local, equipamentos identificados, etc."
                className="rounded-xl border-gray-200 text-base resize-none"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {step === "detalhes" && (
        <div className="px-4 pb-safe-bottom pb-6 pt-4 bg-white border-t border-gray-100">
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !title.trim()}
            className="w-full h-14 text-base font-bold rounded-2xl bg-[#C8102E] hover:bg-[#a50d25] text-white"
          >
            {createMutation.isPending ? "Criando..." : "Iniciar Checklist →"}
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Building2, Users, CheckSquare, Eye,
  Shield, AlertTriangle, CheckCircle, CheckCircle2, Flame, Info,
  Factory, Wifi, Accessibility, ShieldCheck
} from "lucide-react";
import {
  CHECKLISTS_BY_TYPE,
  type PropertyType,
  type SeverityLevel,
  SEVERITY_LABELS,
} from "@shared/inspection-checklists";
import { PathologyReport } from "@/components/PathologyReport";

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type ChecklistState = Record<string, { checked: boolean; severity: SeverityLevel | null }>;

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Imóvel", icon: Building2 },
  { id: 2, label: "Partes", icon: Users },
  { id: 3, label: "Itens / Fotos", icon: CheckSquare },
  { id: 4, label: "Revisão e Fechamento", icon: Eye },
];

// Mapeamento entre PropertyType (checklist) e tipos aceitos pelo backend
const PROPERTY_TYPE_BACKEND_MAP: Record<PropertyType, string> = {
  residencial: "casa",
  comercial: "sala_comercial",
  galpao: "galpao",
  predial: "outro",
};

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "residencial", label: "Residencial", icon: <Building2 size={18} />, desc: "Casas, apartamentos" },
  { value: "comercial", label: "Comercial", icon: <Wifi size={18} />, desc: "Lojas, escritórios" },
  { value: "galpao", label: "Galpão / Industrial", icon: <Factory size={18} />, desc: "Galpões, armazéns" },
  { value: "predial", label: "Predial", icon: <Accessibility size={18} />, desc: "Edifícios, condomínios" },
];

const INSPECTION_TYPES = [
  { value: "entrada", label: "Vistoria de Entrada" },
  { value: "saida", label: "Vistoria de Saída" },
  { value: "periodica", label: "Vistoria Periódica" },
  { value: "devolucao", label: "Vistoria de Devolução" },
];

const GARANTIA_TYPES = [
  { value: "seguro_fianca", label: "Seguro-Fiança (Recomendado)" },
  { value: "caucao", label: "Caução (máx. 3 meses)" },
  { value: "fiador", label: "Fiador / Avalista" },
  { value: "titulo_capitalizacao", label: "Título de Capitalização" },
  { value: "sem_garantia", label: "Sem Garantia ⚠️" },
];

// ─── VALIDAÇÃO CPF/CNPJ ───────────────────────────────────────────────────────
function formatCpfCnpj(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11)
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function validateCpf(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let s = 0; for (let i = 0; i < 9; i++) s += parseInt(d[i]) * (10 - i);
  let r = (s * 10) % 11; if (r >= 10) r = 0; if (r !== parseInt(d[9])) return false;
  s = 0; for (let i = 0; i < 10; i++) s += parseInt(d[i]) * (11 - i);
  r = (s * 10) % 11; if (r >= 10) r = 0; return r === parseInt(d[10]);
}

function validateCnpj(cnpj: string): boolean {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (s: string, w: number[]) => { let sum = 0; for (let i = 0; i < w.length; i++) sum += parseInt(s[i]) * w[i]; const r = sum % 11; return r < 2 ? 0 : 11 - r; };
  return calc(d, [5,4,3,2,9,8,7,6,5,4,3,2]) === parseInt(d[12]) && calc(d, [6,5,4,3,2,9,8,7,6,5,4,3,2]) === parseInt(d[13]);
}

function cpfCnpjStatus(v: string): "valid" | "invalid" | "empty" {
  const d = v.replace(/\D/g, "");
  if (!d) return "empty";
  if (d.length === 11) return validateCpf(d) ? "valid" : "invalid";
  if (d.length === 14) return validateCnpj(d) ? "valid" : "invalid";
  return "invalid";
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function NovaVistoria() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractResult, setContractResult] = useState<{ id: number; contractId: string } | null>(null);

  // Passo 1 — Imóvel
  const [propertyType, setPropertyType] = useState<PropertyType>("residencial");
  const [inspectionType, setInspectionType] = useState<"entrada" | "saida" | "periodica" | "devolucao">("entrada");
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [propertyArea, setPropertyArea] = useState("");
  const [propertyRegistration, setPropertyRegistration] = useState("");

  // Passo 2 — Partes
  const [landlordName, setLandlordName] = useState("");
  const [landlordCpf, setLandlordCpf] = useState("");
  const [landlordPhone, setLandlordPhone] = useState("");
  const [landlordEmail, setLandlordEmail] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantCpf, setTenantCpf] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [inspectorName, setInspectorName] = useState("Eng. Judson Aleixo Sampaio");
  const [inspectorCrea, setInspectorCrea] = useState("CREA/MG 142203671-5");
  const [rentValue, setRentValue] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [garantiaType, setGarantiaType] = useState("seguro_fianca");
  const [redutorSocial, setRedutorSocial] = useState(false);
  const [clausulaVigencia, setClausulaVigencia] = useState(false);
  const [generalNotes, setGeneralNotes] = useState("");

  // Passo 3 — Checklist
  const [checklistState, setChecklistState] = useState<ChecklistState>({});
  // ID da vistoria criada em modo draft ao entrar no Passo 3 (permite registrar patologias antes do submit final)
  const [draftInspectionId, setDraftInspectionId] = useState<number | null>(null);

  // ── CEP auto-fill ─────────────────────────────────────────────────────────
  const handleCepChange = useCallback(async (value: string) => {
    const formatted = value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
    setCep(formatted);
    if (formatted.replace(/\D/g, "").length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${formatted.replace(/\D/g, "")}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || "");
          setNeighborhood(data.bairro || "");
          setCity(data.localidade || "");
          setUf(data.uf || "");
          toast.success("Endereço preenchido automaticamente");
        } else {
          toast.error("CEP não encontrado");
        }
      } catch { toast.error("Erro ao consultar CEP"); }
      finally { setCepLoading(false); }
    }
  }, []);

  // ── Checklist ─────────────────────────────────────────────────────────────
  const toggleCheck = (itemId: string, check: string) => {
    const key = `${itemId}::${check}`;
    setChecklistState(prev => ({
      ...prev,
      [key]: { checked: !prev[key]?.checked, severity: prev[key]?.severity ?? null },
    }));
  };

  const setSeverity = (itemId: string, check: string, sev: SeverityLevel) => {
    const key = `${itemId}::${check}`;
    setChecklistState(prev => ({ ...prev, [key]: { ...prev[key], severity: sev } }));
  };

  const sections = CHECKLISTS_BY_TYPE[propertyType] ?? [];
  const checkedItems = Object.entries(checklistState).filter(([, v]) => v.checked);
  const highSeverityCount = checkedItems.filter(([, v]) => v.severity === "high").length;

  // ── Endereço completo ─────────────────────────────────────────────────────
  const fullAddress = [street, number, complement, neighborhood, city, uf].filter(Boolean).join(", ");

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = trpc.vistoria.create.useMutation();
  const finalizeMutation = trpc.vistoria.finalizeAndGenerateContract.useMutation();
  const draftMutation = trpc.vistoria.create.useMutation();

  // Cria vistoria draft ao entrar no Passo 3 para permitir patologias
  const handleAdvanceToStep3 = async () => {
    if (draftInspectionId) { setStep(3); return; }
    if (!landlordName.trim() || !fullAddress.trim()) { setStep(3); return; }
    try {
      const draft = await draftMutation.mutateAsync({
        type: inspectionType,
        propertyAddress: fullAddress,
        propertyType: PROPERTY_TYPE_BACKEND_MAP[propertyType] as "apartamento" | "casa" | "sala_comercial" | "galpao" | "outro",
        landlordName,
        tenantName: tenantName || "Não informado",
      });
      setDraftInspectionId(draft.id);
    } catch { /* silencioso — pathologies ficam desabilitadas */ }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!landlordName.trim()) { toast.error("Informe o nome do locador"); return; }
    if (!fullAddress.trim()) { toast.error("Informe o endereço do imóvel"); return; }
    setIsSubmitting(true);
    try {
      const created = await createMutation.mutateAsync({
        type: inspectionType,
        propertyAddress: fullAddress,
        propertyType: PROPERTY_TYPE_BACKEND_MAP[propertyType] as "apartamento" | "casa" | "sala_comercial" | "galpao" | "outro",
        propertyArea: propertyArea || undefined,
        propertyRegistration: propertyRegistration || undefined,
        landlordName,
        landlordCpfCnpj: landlordCpf.replace(/\D/g, "") || undefined,
        landlordPhone: landlordPhone || undefined,
        landlordEmail: landlordEmail || undefined,
        tenantName: tenantName || "Não informado",
        tenantCpfCnpj: tenantCpf.replace(/\D/g, "") || undefined,
        tenantPhone: tenantPhone || undefined,
        tenantEmail: tenantEmail || undefined,
        inspectorName: inspectorName || undefined,
        inspectorCrea: inspectorCrea || undefined,
        contractStartDate: contractStart || undefined,
        contractEndDate: contractEnd || undefined,
        rentValue: rentValue || undefined,
        generalNotes: generalNotes || undefined,
      });
      const finalized = await finalizeMutation.mutateAsync({ inspectionId: created.id });
      setContractResult({ id: created.id, contractId: finalized.contractId });
    } catch (err: any) {
      toast.error("Erro ao criar vistoria: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── TELA DE SUCESSO ──────────────────────────────────────────────────────
  if (contractResult) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-lg w-full text-center p-10 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-green-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Vistoria Criada!</h2>
            <p className="text-gray-400 text-sm">Registro selado. Número do contrato gerado com hash de auditoria.</p>
          </div>
          <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Número do Contrato</p>
            <p className="text-3xl font-mono font-bold text-blue-400">{contractResult.contractId}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield size={13} className="text-green-400" />
              <span className="text-xs text-green-400">Edição bloqueada — registro imutável</span>
            </div>
          </div>
          {highSeverityCount > 0 && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-4 text-left">
              <p className="text-sm font-semibold text-red-400 mb-1">⚠️ {highSeverityCount} item(ns) de alta severidade</p>
              <p className="text-xs text-gray-400 mb-3">Recomendamos inspeção presencial por engenheiro especializado.</p>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full border-red-600/30 text-red-400 text-xs"
                  onClick={() => navigate("/operis/engenharia/inspecao-predial")}>
                  Solicitar Inspeção Predial — Eng. Judson Sampaio
                </Button>
                <Button size="sm" variant="outline" className="w-full border-orange-600/30 text-orange-400 text-xs"
                  onClick={() => navigate("/operis/engenharia/vistoria-cautelar")}>
                  Solicitar Vistoria Cautelar de Vizinhança
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate(`/operis/vistorias/${contractResult.id}`)}>
              Ver Detalhes da Vistoria
            </Button>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300"
              onClick={() => navigate("/operis/vistorias")}>
              Voltar para Listagem
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/80 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/operis/vistorias")} className="text-gray-400 hover:text-white">
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </Button>
          <div>
            <h1 className="text-lg font-bold text-white">Nova Vistoria</h1>
            <p className="text-xs text-gray-500">OPERIS IA — Módulo de Vistorias</p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="border-b border-gray-700 bg-gray-800/40 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > s.id ? "bg-green-500 text-white" :
                      step === s.id ? "bg-blue-600 text-white ring-2 ring-blue-500/30" :
                      "bg-gray-700 text-gray-500"
                    }`}>
                      {step > s.id ? <CheckCircle size={14} /> : <Icon size={14} />}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${step === s.id ? "text-white" : "text-gray-500"}`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-3 transition-colors ${step > s.id ? "bg-green-500/50" : "bg-gray-700"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── PASSO 1: IMÓVEL ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Dados do Imóvel</h2>
              <p className="text-sm text-gray-400">O checklist de itens será adaptado automaticamente ao tipo selecionado.</p>
            </div>

            {/* Smart Filter — Tipo de Imóvel */}
            <div>
              <Label className="text-gray-300 text-sm mb-3 block">Tipo de Imóvel</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PROPERTY_TYPE_OPTIONS.map(pt => (
                  <button key={pt.value} type="button" onClick={() => setPropertyType(pt.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      propertyType === pt.value
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-gray-700 bg-gray-800/40 text-gray-400 hover:border-blue-500/40"
                    }`}>
                    <div className="mb-2">{pt.icon}</div>
                    <div className="text-sm font-semibold">{pt.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{pt.desc}</div>
                  </button>
                ))}
              </div>
              {(propertyType === "galpao") && (
                <div className="mt-3 flex items-center gap-2 bg-red-900/20 border border-red-600/20 rounded-lg px-4 py-2">
                  <Flame size={13} className="text-red-400" />
                  <span className="text-xs text-red-400">Inclui seção obrigatória de <strong>Auditoria de Segurança Contra Incêndio (CO2 Standard)</strong></span>
                </div>
              )}
            </div>

            {/* Tipo de Vistoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">Tipo de Vistoria</Label>
                <Select value={inspectionType} onValueChange={(v) => setInspectionType(v as "entrada" | "saida" | "periodica" | "devolucao")}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {INSPECTION_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-gray-300">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">Área (m²)</Label>
                <Input value={propertyArea} onChange={e => setPropertyArea(e.target.value)} type="number"
                  placeholder="Ex: 120" className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-600" />
              </div>
            </div>

            {/* CEP + Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">CEP</Label>
                <Input value={cep} onChange={e => handleCepChange(e.target.value)}
                  placeholder="00000-000" className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-600" />
                {cepLoading && <p className="text-xs text-blue-400 mt-1">Buscando...</p>}
              </div>
              <div className="md:col-span-2">
                <Label className="text-gray-300 text-sm mb-2 block">Logradouro</Label>
                <Input value={street} onChange={e => setStreet(e.target.value)}
                  placeholder="Rua, Avenida..." className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-600" />
              </div>
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">Número</Label>
                <Input value={number} onChange={e => setNumber(e.target.value)}
                  placeholder="123" className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">Complemento</Label>
                <Input value={complement} onChange={e => setComplement(e.target.value)}
                  placeholder="Apto, Sala..." className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-600" />
              </div>
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">Bairro</Label>
                <Input value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">Cidade</Label>
                <Input value={city} onChange={e => setCity(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">UF</Label>
                <Input value={uf} onChange={e => setUf(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="MG" className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-600" />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 text-sm mb-2 block">Matrícula do Imóvel (opcional)</Label>
              <Input value={propertyRegistration} onChange={e => setPropertyRegistration(e.target.value)}
                placeholder="Número de matrícula no cartório" className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-600 max-w-sm" />
            </div>
          </div>
        )}

        {/* ── PASSO 2: PARTES ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Partes Envolvidas</h2>
              <p className="text-sm text-gray-400">Dados do locador, locatário, vistoriador e condições contratuais.</p>
            </div>

            {/* Locador */}
            <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700 space-y-4">
              <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <Users size={14} className="text-blue-400" /> Locador (Proprietário)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">Nome Completo *</Label>
                  <Input value={landlordName} onChange={e => setLandlordName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">CPF / CNPJ</Label>
                  <div className="relative">
                    <Input value={landlordCpf} onChange={e => setLandlordCpf(formatCpfCnpj(e.target.value))}
                      placeholder="000.000.000-00" maxLength={18}
                      className={`bg-gray-700 text-white h-9 pr-8 ${cpfCnpjStatus(landlordCpf) === "valid" ? "border-green-500" : cpfCnpjStatus(landlordCpf) === "invalid" && landlordCpf.length > 3 ? "border-red-500" : "border-gray-600"}`} />
                    {cpfCnpjStatus(landlordCpf) === "valid" && <CheckCircle size={14} className="absolute right-2 top-2.5 text-green-400" />}
                    {cpfCnpjStatus(landlordCpf) === "invalid" && landlordCpf.length > 3 && <AlertTriangle size={14} className="absolute right-2 top-2.5 text-red-400" />}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">Telefone</Label>
                  <Input value={landlordPhone} onChange={e => setLandlordPhone(e.target.value)}
                    placeholder="(31) 9 9999-9999" className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">E-mail</Label>
                  <Input value={landlordEmail} onChange={e => setLandlordEmail(e.target.value)}
                    type="email" className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
              </div>
            </div>

            {/* Locatário */}
            <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700 space-y-4">
              <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <Users size={14} className="text-purple-400" /> Locatário (Inquilino)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">Nome Completo</Label>
                  <Input value={tenantName} onChange={e => setTenantName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">CPF / CNPJ</Label>
                  <div className="relative">
                    <Input value={tenantCpf} onChange={e => setTenantCpf(formatCpfCnpj(e.target.value))}
                      placeholder="000.000.000-00" maxLength={18}
                      className={`bg-gray-700 text-white h-9 pr-8 ${cpfCnpjStatus(tenantCpf) === "valid" ? "border-green-500" : cpfCnpjStatus(tenantCpf) === "invalid" && tenantCpf.length > 3 ? "border-red-500" : "border-gray-600"}`} />
                    {cpfCnpjStatus(tenantCpf) === "valid" && <CheckCircle size={14} className="absolute right-2 top-2.5 text-green-400" />}
                    {cpfCnpjStatus(tenantCpf) === "invalid" && tenantCpf.length > 3 && <AlertTriangle size={14} className="absolute right-2 top-2.5 text-red-400" />}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">Telefone</Label>
                  <Input value={tenantPhone} onChange={e => setTenantPhone(e.target.value)}
                    placeholder="(31) 9 9999-9999" className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">E-mail</Label>
                  <Input value={tenantEmail} onChange={e => setTenantEmail(e.target.value)}
                    type="email" className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
              </div>
            </div>

            {/* Vistoriador */}
            <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700 space-y-4">
              <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck size={14} className="text-red-400" /> Vistoriador / Responsável Técnico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">Nome do Vistoriador</Label>
                  <Input value={inspectorName} onChange={e => setInspectorName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">CREA / CRECI</Label>
                  <Input value={inspectorCrea} onChange={e => setInspectorCrea(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
              </div>
            </div>

            {/* Condições Contratuais */}
            <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700 space-y-4">
              <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <Shield size={14} className="text-yellow-400" /> Condições Contratuais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">Valor do Aluguel (R$)</Label>
                  <Input value={rentValue} onChange={e => setRentValue(e.target.value)}
                    placeholder="1.500,00" className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">Início do Contrato</Label>
                  <Input type="date" value={contractStart} onChange={e => setContractStart(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">Fim do Contrato</Label>
                  <Input type="date" value={contractEnd} onChange={e => setContractEnd(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-9" />
                </div>
              </div>
              <div>
                <Label className="text-gray-400 text-xs mb-2 block">Modalidade de Garantia — Lei 8.245/91</Label>
                <Select value={garantiaType} onValueChange={setGarantiaType}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {GARANTIA_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-gray-300">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-gray-500 text-xs mt-1">A lei proíbe a cumulatividade de garantias. Apenas uma modalidade por contrato.</p>
              </div>
              {/* Checklist Reforma Tributária 2026 */}
              <div className="bg-blue-900/10 rounded-xl p-4 border border-blue-600/20 space-y-3">
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
                  <Info size={12} /> Reforma Tributária 2026 — LC 214/2025
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={redutorSocial} onChange={e => setRedutorSocial(e.target.checked)} className="mt-1 w-4 h-4 accent-blue-500" />
                  <div>
                    <span className="text-gray-200 text-sm font-medium">Redutor Social de R$ 600,00 aplicável</span>
                    <p className="text-gray-500 text-xs mt-0.5">Reduz a base de cálculo do IBS/CBS sobre o aluguel residencial — LC 214/2025, Art. 9º</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={clausulaVigencia} onChange={e => setClausulaVigencia(e.target.checked)} className="mt-1 w-4 h-4 accent-blue-500" />
                  <div>
                    <span className="text-gray-200 text-sm font-medium">Incluir Cláusula de Vigência no contrato</span>
                    <p className="text-gray-500 text-xs mt-0.5">Protege o inquilino em caso de venda do imóvel — Lei 8.245/91, Art. 8º</p>
                  </div>
                </label>
              </div>
              <div>
                <Label className="text-gray-400 text-xs mb-1 block">Observações Gerais</Label>
                <Textarea value={generalNotes} onChange={e => setGeneralNotes(e.target.value)}
                  placeholder="Condições especiais, ressalvas técnicas..." rows={3}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* ── PASSO 3: ITENS / FOTOS ───────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Checklist de Itens</h2>
                <p className="text-sm text-gray-400">Marque os itens com problemas e defina a severidade.</p>
              </div>
              <div className="flex gap-2">
                {checkedItems.length > 0 && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{checkedItems.length} marcado(s)</Badge>
                )}
                {highSeverityCount > 0 && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{highSeverityCount} alta severidade</Badge>
                )}
              </div>
            </div>

            {sections.map(section => (
              <div key={section.id} className={`rounded-xl border p-5 space-y-4 ${section.items.some(i => i.fireSafety) ? "border-red-600/30 bg-red-900/5" : "border-gray-700 bg-gray-800/40"}`}>
                <h3 className="text-gray-200 font-semibold text-sm flex items-center gap-2">
                  <span>{section.icon}</span> {section.title}
                  {section.items.some(i => i.fireSafety) && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Obrigatório — CO2 Standard</Badge>
                  )}
                </h3>
                {section.items.map(item => (
                  <div key={item.id} className="space-y-2 pb-3 border-b border-gray-700/50 last:border-0">
                    <p className="text-sm font-medium text-gray-300">{item.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.checks.map(check => {
                        const key = `${item.id}::${check}`;
                        const state = checklistState[key];
                        const isChecked = state?.checked ?? false;
                        return (
                          <div key={check} className="flex flex-col gap-1">
                            <button type="button" onClick={() => toggleCheck(item.id, check)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                isChecked ? "bg-red-500/20 border-red-500/50 text-red-300" : "bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                              }`}>
                              {isChecked ? "✓ " : ""}{check}
                            </button>
                            {isChecked && (
                              <div className="flex gap-1">
                                {(["low", "medium", "high"] as SeverityLevel[]).map(sev => (
                                  <button key={sev} type="button" onClick={() => setSeverity(item.id, check, sev)}
                                    className={`px-2 py-0.5 rounded text-xs transition-all ${
                                      state?.severity === sev
                                        ? `${SEVERITY_LABELS[sev].bg} ${SEVERITY_LABELS[sev].color} font-semibold`
                                        : "bg-gray-900 text-gray-600 border border-gray-700"
                                    }`}>
                                    {SEVERITY_LABELS[sev].label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Botão de patologia por item do checklist */}
                    {draftInspectionId && (
                      <PathologyReport
                        inspectionId={draftInspectionId}
                        itemLabel={item.label}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── PASSO 4: REVISÃO E FECHAMENTO ───────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Revisão e Fechamento</h2>
              <p className="text-sm text-gray-400">Confirme todos os dados. Após finalizar, o registro será selado e o número do contrato gerado.</p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-5 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Imóvel</p>
                {[
                  ["Tipo", PROPERTY_TYPE_OPTIONS.find(p => p.value === propertyType)?.label],
                  ["Vistoria", INSPECTION_TYPES.find(t => t.value === inspectionType)?.label],
                  ["Endereço", fullAddress || "—"],
                  ["Área", propertyArea ? `${propertyArea} m²` : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white font-medium text-right max-w-[220px] truncate">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-5 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Partes</p>
                {[
                  ["Locador", landlordName || "—"],
                  ["Locatário", tenantName || "—"],
                  ["Garantia", GARANTIA_TYPES.find(g => g.value === garantiaType)?.label.split(" (")[0]],
                  ["Aluguel", rentValue ? `R$ ${rentValue}` : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist Summary */}
            <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-5">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Itens do Checklist</p>
              {checkedItems.length === 0 ? (
                <p className="text-sm text-green-400 flex items-center gap-2"><CheckCircle2 size={14} /> Nenhum item com problema registrado</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-yellow-400">{checkedItems.length} item(ns) marcado(s){highSeverityCount > 0 ? ` — ${highSeverityCount} de alta severidade` : ""}</p>
                  <div className="flex flex-wrap gap-2">
                    {checkedItems.slice(0, 10).map(([key, v]) => {
                      const [, check] = key.split("::");
                      return (
                        <Badge key={key} className={`text-xs ${v.severity === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" : v.severity === "medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                          {check}
                        </Badge>
                      );
                    })}
                    {checkedItems.length > 10 && <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">+{checkedItems.length - 10} mais</Badge>}
                  </div>
                </div>
              )}
            </div>

            {/* Conformidade Legal */}
            <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-5 space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Shield size={12} className="text-green-400" /> Conformidade Legal 2026
              </p>
              {[
                { label: "Redutor Social LC 214/2025", active: redutorSocial },
                { label: "Cláusula de Vigência incluída", active: clausulaVigencia },
                { label: "Bloqueio de dupla garantia ativo", active: true },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.active ? <CheckCircle2 size={14} className="text-green-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-600" />}
                  <span className={item.active ? "text-green-400" : "text-gray-500"}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Rodapé de resguardo jurídico */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-400">Resguardo Jurídico:</strong> Este laudo foi elaborado com base nas condições verificadas in loco na data de emissão, por profissional habilitado (CREA/MG 142203671-5), em conformidade com a Lei 8.245/91, NBR 15575 e demais normas técnicas aplicáveis. A OPERIS IA não se responsabiliza por alterações nas condições do imóvel após a data de emissão, nem por informações prestadas incorretamente pelas partes. O número de contrato gerado possui hash de auditoria imutável para fins de validade legal.
              </p>
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting || !landlordName || !fullAddress}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold gap-2">
              <CheckCircle size={18} />
              {isSubmitting ? "Gerando contrato..." : "Finalizar e Gerar Contrato"}
            </Button>
          </div>
        )}

        {/* ── NAVEGAÇÃO ────────────────────────────────────────────────────── */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
          <Button variant="outline" onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/operis/vistorias")}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 gap-2">
            <ArrowLeft size={16} /> {step === 1 ? "Cancelar" : "Anterior"}
          </Button>
          {step < 4 && (
            <Button
              onClick={() => step === 2 ? handleAdvanceToStep3() : setStep(s => s + 1)}
              disabled={(step === 1 && !street && !fullAddress) || draftMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              {draftMutation.isPending ? "Preparando..." : "Próximo"} <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

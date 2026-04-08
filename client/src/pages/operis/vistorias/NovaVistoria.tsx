import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Home, Users, FileText, LayoutGrid,
  Plus, Trash2, CheckCircle, Search, AlertTriangle, Shield,
  ShieldCheck, Info
} from "lucide-react";

// ─── Constantes ───────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Imóvel", icon: Home, desc: "Endereço e tipo de imóvel" },
  { id: 2, title: "Partes", icon: Users, desc: "Locador, inquilino e vistoriador" },
  { id: 3, title: "Contrato", icon: FileText, desc: "Dados do contrato e garantias" },
  { id: 4, title: "Cômodos", icon: LayoutGrid, desc: "Defina os cômodos a vistoriar" },
];

const ROOM_TYPES = [
  { value: "sala", label: "Sala" },
  { value: "quarto", label: "Quarto" },
  { value: "cozinha", label: "Cozinha" },
  { value: "banheiro", label: "Banheiro" },
  { value: "area_servico", label: "Área de Serviço" },
  { value: "garagem", label: "Garagem" },
  { value: "varanda", label: "Varanda" },
  { value: "corredor", label: "Corredor" },
  { value: "outro", label: "Outro" },
];

const PROPERTY_TYPES = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "sala_comercial", label: "Sala Comercial" },
  { value: "galpao", label: "Galpão" },
  { value: "outro", label: "Outro" },
];

const INSPECTION_TYPES = [
  { value: "entrada", label: "Vistoria de Entrada" },
  { value: "saida", label: "Vistoria de Saída" },
  { value: "periodica", label: "Vistoria Periódica" },
  { value: "devolucao", label: "Devolução de Imóvel" },
];

const GARANTIA_TYPES = [
  { value: "seguro_fianca", label: "Seguro-Fiança (Recomendado — Lei 2026)" },
  { value: "caucao", label: "Caução (Depósito)" },
  { value: "fiador", label: "Fiador / Avalista" },
  { value: "sem_garantia", label: "Sem Garantia ⚠️" },
];

// ─── Helpers de validação ──────────────────────────────────────────────────────
function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function validateCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(digits[10]);
}

function validateCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;
  const calcDigit = (d: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(d[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  return calcDigit(digits, w1) === parseInt(digits[12]) &&
    calcDigit(digits, w2) === parseInt(digits[13]);
}

function validateCpfCnpj(value: string): "valid" | "invalid" | "empty" {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "empty";
  if (digits.length === 11) return validateCpf(digits) ? "valid" : "invalid";
  if (digits.length === 14) return validateCnpj(digits) ? "valid" : "invalid";
  return "invalid";
}

// ─── Componente de input CPF/CNPJ ─────────────────────────────────────────────
function CpfCnpjInput({ value, onChange, label, placeholder }: {
  value: string; onChange: (v: string) => void; label: string; placeholder?: string;
}) {
  const status = validateCpfCnpj(value);
  const borderClass = status === "valid"
    ? "border-green-500 focus:border-green-400"
    : status === "invalid" && value.length > 3
      ? "border-red-500 focus:border-red-400"
      : "border-gray-600";

  return (
    <div>
      <Label className="text-gray-400 text-xs">{label}</Label>
      <div className="relative mt-1">
        <Input
          value={value}
          onChange={e => onChange(formatCpfCnpj(e.target.value))}
          placeholder={placeholder || "000.000.000-00 ou 00.000.000/0001-00"}
          maxLength={18}
          className={`bg-gray-700 text-white h-9 pr-8 ${borderClass}`}
        />
        {status === "valid" && (
          <CheckCircle className="absolute right-2 top-2 w-4 h-4 text-green-400" />
        )}
        {status === "invalid" && value.length > 3 && (
          <AlertTriangle className="absolute right-2 top-2 w-4 h-4 text-red-400" />
        )}
      </div>
      {status === "invalid" && value.length > 3 && (
        <p className="text-red-400 text-xs mt-1">CPF/CNPJ inválido</p>
      )}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
type Room = { name: string; type: string };

export default function NovaVistoria() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [cepLoading, setCepLoading] = useState(false);

  // Step 1 — Imóvel
  const [type, setType] = useState("entrada");
  const [propertyCep, setPropertyCep] = useState("");
  const [propertyStreet, setPropertyStreet] = useState("");
  const [propertyNumber, setPropertyNumber] = useState("");
  const [propertyComplement, setPropertyComplement] = useState("");
  const [propertyNeighborhood, setPropertyNeighborhood] = useState("");
  const [propertyCity, setPropertyCity] = useState("");
  const [propertyState, setPropertyState] = useState("");
  const [propertyType, setPropertyType] = useState("apartamento");
  const [propertyArea, setPropertyArea] = useState("");
  const [propertyRegistration, setPropertyRegistration] = useState("");

  // Step 2 — Partes
  const [landlordName, setLandlordName] = useState("");
  const [landlordCpf, setLandlordCpf] = useState("");
  const [landlordPhone, setLandlordPhone] = useState("");
  const [landlordEmail, setLandlordEmail] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantCpf, setTenantCpf] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [inspectorCrea, setInspectorCrea] = useState("");

  // Step 3 — Contrato + Reforma Tributária
  const [contractNumber, setContractNumber] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [rentValue, setRentValue] = useState("");
  const [garantiaType, setGarantiaType] = useState("seguro_fianca");
  const [redutorSocial, setRedutorSocial] = useState(false);
  const [clausulaVigencia, setClausulaVigencia] = useState(false);
  const [generalNotes, setGeneralNotes] = useState("");

  // Step 4 — Cômodos
  const [rooms, setRooms] = useState<Room[]>([
    { name: "Sala de Estar", type: "sala" },
    { name: "Quarto 1", type: "quarto" },
    { name: "Cozinha", type: "cozinha" },
    { name: "Banheiro", type: "banheiro" },
  ]);

  const createMutation = trpc.vistoria.create.useMutation({
    onSuccess: (data) => {
      toast.success("Vistoria criada com sucesso!");
      navigate(`/operis/vistorias/${data.id}`);
    },
    onError: (err) => {
      toast.error("Erro ao criar vistoria: " + err.message);
    },
  });

  // ─── CEP auto-fill ────────────────────────────────────────────────────────
  const fetchCep = useCallback(async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
      } else {
        setPropertyStreet(data.logradouro || "");
        setPropertyNeighborhood(data.bairro || "");
        setPropertyCity(data.localidade || "");
        setPropertyState(data.uf || "");
        toast.success("Endereço preenchido automaticamente");
      }
    } catch {
      toast.error("Erro ao consultar CEP");
    } finally {
      setCepLoading(false);
    }
  }, []);

  const handleCepChange = (value: string) => {
    const formatted = value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 9);
    setPropertyCep(formatted);
    if (formatted.replace(/\D/g, "").length === 8) fetchCep(formatted);
  };

  // ─── Helpers de cômodos ────────────────────────────────────────────────────
  const addRoom = () => setRooms(r => [...r, { name: "", type: "outro" }]);
  const removeRoom = (i: number) => setRooms(r => r.filter((_, idx) => idx !== i));
  const updateRoom = (i: number, field: keyof Room, value: string) =>
    setRooms(r => r.map((room, idx) => idx === i ? { ...room, [field]: value } : room));

  // ─── Endereço completo montado ─────────────────────────────────────────────
  const fullAddress = [
    propertyStreet,
    propertyNumber,
    propertyComplement,
    propertyNeighborhood,
    propertyCity,
    propertyState,
  ].filter(Boolean).join(", ");

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!fullAddress.trim() && !propertyStreet.trim()) {
      toast.error("Informe o endereço do imóvel");
      return;
    }
    if (!landlordName.trim()) { toast.error("Informe o nome do locador"); return; }
    if (!tenantName.trim()) { toast.error("Informe o nome do inquilino"); return; }
    if (garantiaType === "sem_garantia") {
      if (!confirm("⚠️ Contratos sem garantia permitem despejo liminar em 15 dias (Lei 2026). Deseja prosseguir sem garantia?")) return;
    }

    createMutation.mutate({
      type: type as any,
      propertyAddress: fullAddress || propertyStreet,
      propertyType: propertyType as any,
      propertyArea: propertyArea || undefined,
      propertyRegistration: propertyRegistration || undefined,
      landlordName,
      landlordCpfCnpj: landlordCpf.replace(/\D/g, "") || undefined,
      landlordPhone: landlordPhone || undefined,
      landlordEmail: landlordEmail || undefined,
      tenantName,
      tenantCpfCnpj: tenantCpf.replace(/\D/g, "") || undefined,
      tenantPhone: tenantPhone || undefined,
      tenantEmail: tenantEmail || undefined,
      contractNumber: contractNumber || undefined,
      contractStartDate: contractStart || undefined,
      contractEndDate: contractEnd || undefined,
      rentValue: rentValue || undefined,
      inspectorName: inspectorName || undefined,
      inspectorCrea: inspectorCrea || undefined,
      generalNotes: generalNotes || undefined,
      rooms: rooms.filter(r => r.name.trim()) as any,
    });
  };

  // ─── Alerta de garantia sem garantia ──────────────────────────────────────
  const showGarantiaWarning = garantiaType === "sem_garantia";

  return (
    <div className="w-full min-h-screen bg-[#0B0F19]">
      {/* Header full-width */}
      <div className="border-b border-gray-800 bg-[#0d1220] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/operis/vistorias")}
            className="text-gray-400 hover:text-white shrink-0">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white font-['Barlow_Condensed'] tracking-wide uppercase">
              Nova Vistoria
            </h1>
            <p className="text-gray-400 text-xs">Laudo técnico conforme Lei 8.245/91 — Atualizada 2026</p>
          </div>
          <div className="text-right text-xs text-gray-500 hidden md:block">
            <span className="text-red-400 font-semibold">Passo {step}</span> de {STEPS.length}
          </div>
        </div>
      </div>

      {/* Stepper full-width */}
      <div className="border-b border-gray-800 bg-[#0d1220]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isDone = s.id < step;
              return (
                <button
                  key={s.id}
                  onClick={() => isDone && setStep(s.id)}
                  className={`flex-1 flex items-center gap-3 py-4 px-3 border-b-2 transition-all text-left ${
                    isActive
                      ? "border-red-500 text-white"
                      : isDone
                        ? "border-green-500/50 text-green-400 cursor-pointer hover:border-green-400"
                        : "border-transparent text-gray-600"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                    isActive ? "bg-red-600 text-white" :
                    isDone ? "bg-green-600/20 text-green-400" :
                    "bg-gray-800 text-gray-600"
                  }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-semibold">{s.title}</div>
                    <div className="text-xs opacity-60">{s.desc}</div>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-gray-700 ml-auto hidden lg:block" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo do step */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Step 1: Imóvel ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label className="text-gray-300 text-sm">Tipo de Vistoria *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSPECTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Label className="text-gray-300 text-sm">Tipo de Imóvel</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Área (m²)</Label>
                <Input value={propertyArea} onChange={e => setPropertyArea(e.target.value)}
                  placeholder="Ex: 85"
                  className="bg-gray-800 border-gray-600 text-white mt-1" />
              </div>
            </div>

            {/* Endereço com CEP */}
            <div className="bg-gray-800/40 rounded-xl p-5 space-y-4 border border-gray-700">
              <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <Home className="w-4 h-4 text-red-400" />
                Endereço do Imóvel
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-1">
                  <Label className="text-gray-400 text-xs">CEP *</Label>
                  <div className="relative mt-1">
                    <Input
                      value={propertyCep}
                      onChange={e => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      className="bg-gray-700 border-gray-600 text-white h-9 pr-8"
                    />
                    {cepLoading && (
                      <Search className="absolute right-2 top-2 w-4 h-4 text-blue-400 animate-pulse" />
                    )}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-2">
                  <Label className="text-gray-400 text-xs">Rua / Logradouro *</Label>
                  <Input value={propertyStreet} onChange={e => setPropertyStreet(e.target.value)}
                    placeholder="Preenchido automaticamente pelo CEP"
                    className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Número</Label>
                  <Input value={propertyNumber} onChange={e => setPropertyNumber(e.target.value)}
                    placeholder="Ex: 843"
                    className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Complemento</Label>
                  <Input value={propertyComplement} onChange={e => setPropertyComplement(e.target.value)}
                    placeholder="Apto, Bloco..."
                    className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Bairro</Label>
                  <Input value={propertyNeighborhood} onChange={e => setPropertyNeighborhood(e.target.value)}
                    placeholder="Preenchido pelo CEP"
                    className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Cidade</Label>
                  <Input value={propertyCity} onChange={e => setPropertyCity(e.target.value)}
                    placeholder="Preenchido pelo CEP"
                    className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">UF</Label>
                  <Input value={propertyState} onChange={e => setPropertyState(e.target.value.toUpperCase())}
                    placeholder="MG" maxLength={2}
                    className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Matrícula / Registro no Cartório</Label>
              <Input value={propertyRegistration} onChange={e => setPropertyRegistration(e.target.value)}
                placeholder="Número de matrícula"
                className="bg-gray-800 border-gray-600 text-white mt-1" />
            </div>
          </div>
        )}

        {/* ── Step 2: Partes ── */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Locador */}
            <div className="bg-gray-800/40 rounded-xl p-5 space-y-3 border border-gray-700">
              <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Locador (Proprietário)
              </h3>
              <div>
                <Label className="text-gray-400 text-xs">Nome Completo *</Label>
                <Input value={landlordName} onChange={e => setLandlordName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
              </div>
              <CpfCnpjInput value={landlordCpf} onChange={setLandlordCpf} label="CPF / CNPJ" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-400 text-xs">Telefone</Label>
                  <Input value={landlordPhone} onChange={e => setLandlordPhone(e.target.value)}
                    placeholder="(31) 9 0000-0000"
                    className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">E-mail</Label>
                  <Input value={landlordEmail} onChange={e => setLandlordEmail(e.target.value)}
                    type="email" className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
              </div>
            </div>

            {/* Inquilino */}
            <div className="bg-gray-800/40 rounded-xl p-5 space-y-3 border border-gray-700">
              <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                Inquilino (Locatário)
              </h3>
              <div>
                <Label className="text-gray-400 text-xs">Nome Completo *</Label>
                <Input value={tenantName} onChange={e => setTenantName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
              </div>
              <CpfCnpjInput value={tenantCpf} onChange={setTenantCpf} label="CPF / CNPJ" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-400 text-xs">Telefone</Label>
                  <Input value={tenantPhone} onChange={e => setTenantPhone(e.target.value)}
                    placeholder="(31) 9 0000-0000"
                    className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">E-mail</Label>
                  <Input value={tenantEmail} onChange={e => setTenantEmail(e.target.value)}
                    type="email" className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
              </div>
            </div>

            {/* Vistoriador */}
            <div className="bg-gray-800/40 rounded-xl p-5 space-y-3 border border-gray-700 lg:col-span-2">
              <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                Vistoriador / Responsável Técnico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-gray-400 text-xs">Nome do Vistoriador</Label>
                  <Input value={inspectorName} onChange={e => setInspectorName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">CREA / CRECI</Label>
                  <Input value={inspectorCrea} onChange={e => setInspectorCrea(e.target.value)}
                    placeholder="Ex: CREA/MG 142203671-5"
                    className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Contrato + Reforma Tributária ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">Número do Contrato</Label>
                <Input value={contractNumber} onChange={e => setContractNumber(e.target.value)}
                  placeholder="Ex: CONT-2026-001"
                  className="bg-gray-800 border-gray-600 text-white mt-1" />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Valor do Aluguel (R$)</Label>
                <Input value={rentValue} onChange={e => setRentValue(e.target.value)}
                  placeholder="Ex: 1500,00"
                  className="bg-gray-800 border-gray-600 text-white mt-1" />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Início do Contrato</Label>
                <Input type="date" value={contractStart} onChange={e => setContractStart(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white mt-1" />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Fim do Contrato</Label>
                <Input type="date" value={contractEnd} onChange={e => setContractEnd(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white mt-1" />
              </div>
            </div>

            {/* Modalidade de garantia */}
            <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700 space-y-3">
              <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Modalidade de Garantia — Lei 8.245/91
              </h3>
              <Select value={garantiaType} onValueChange={setGarantiaType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GARANTIA_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {showGarantiaWarning && (
                <div className="flex items-start gap-2 bg-red-900/20 border border-red-600/30 rounded-lg p-3 text-sm text-red-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Atenção (Lei 2026):</strong> Contratos sem garantia permitem despejo liminar em até 15 dias em caso de inadimplência. Recomendamos o Seguro-Fiança.</span>
                </div>
              )}
              <p className="text-gray-500 text-xs">
                A lei proíbe a cumulatividade de garantias. Apenas uma modalidade pode ser exigida por contrato.
              </p>
            </div>

            {/* Checklist Reforma Tributária 2026 */}
            <div className="bg-blue-900/10 rounded-xl p-5 border border-blue-600/20 space-y-4">
              <h3 className="text-blue-300 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <Info className="w-4 h-4" />
                Checklist — Reforma Tributária 2026 (LC 214/2025)
              </h3>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={redutorSocial}
                  onChange={e => setRedutorSocial(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-blue-500"
                />
                <div>
                  <span className="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">
                    Redutor Social de R$ 600,00 aplicável
                  </span>
                  <p className="text-gray-500 text-xs mt-0.5">
                    O imóvel se enquadra no benefício fiscal da LC 214/2025 — reduz a base de cálculo do IBS/CBS sobre o aluguel residencial.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={clausulaVigencia}
                  onChange={e => setClausulaVigencia(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-blue-500"
                />
                <div>
                  <span className="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">
                    Incluir Cláusula de Vigência no contrato
                  </span>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Protege o inquilino em caso de venda do imóvel — o novo proprietário deve respeitar o contrato vigente (requer averbação na matrícula do imóvel).
                  </p>
                </div>
              </label>
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Observações Gerais</Label>
              <Textarea value={generalNotes} onChange={e => setGeneralNotes(e.target.value)}
                placeholder="Condições especiais, ressalvas, informações adicionais..."
                className="bg-gray-800 border-gray-600 text-white mt-1 min-h-[100px]" />
            </div>
          </div>
        )}

        {/* ── Step 4: Cômodos ── */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Defina os cômodos do imóvel. Cada cômodo terá itens de vistoria padrão adicionados automaticamente (piso, parede, teto, porta, janela, instalações elétricas e hidráulicas).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rooms.map((room, i) => (
                <div key={i} className="flex gap-2 items-center bg-gray-800/40 rounded-lg p-3 border border-gray-700">
                  <Input
                    value={room.name}
                    onChange={e => updateRoom(i, "name", e.target.value)}
                    placeholder="Nome do cômodo"
                    className="bg-gray-700 border-gray-600 text-white flex-1 h-9"
                  />
                  <Select value={room.type} onValueChange={v => updateRoom(i, "type", v)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-36 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" onClick={() => removeRoom(i)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={addRoom}
              className="border-dashed border-gray-600 text-gray-400 hover:text-white gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Cômodo
            </Button>

            {/* Resumo final */}
            <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700 space-y-2 mt-4">
              <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide">Resumo da Vistoria</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <span>Tipo:</span><span className="text-white">{INSPECTION_TYPES.find(t => t.value === type)?.label}</span>
                <span>Endereço:</span><span className="text-white truncate">{fullAddress || "—"}</span>
                <span>Locador:</span><span className="text-white">{landlordName || "—"}</span>
                <span>Inquilino:</span><span className="text-white">{tenantName || "—"}</span>
                <span>Garantia:</span><span className="text-white">{GARANTIA_TYPES.find(t => t.value === garantiaType)?.label.split(" (")[0]}</span>
                <span>Cômodos:</span><span className="text-white">{rooms.filter(r => r.name.trim()).length}</span>
                {redutorSocial && <><span>Redutor Social:</span><span className="text-blue-400">Sim — R$ 600,00</span></>}
                {clausulaVigencia && <><span>Cláusula de Vigência:</span><span className="text-blue-400">Incluída</span></>}
              </div>
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
          <Button variant="outline"
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/operis/vistorias")}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 gap-2">
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? "Cancelar" : "Anterior"}
          </Button>

          {step < 4 ? (
            <Button onClick={() => setStep(s => s + 1)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <CheckCircle className="w-4 h-4" />
              {createMutation.isPending ? "Criando..." : "Criar Vistoria"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

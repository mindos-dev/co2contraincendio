import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Home, Users, FileText, LayoutGrid, Plus, Trash2, CheckCircle } from "lucide-react";

const STEPS = [
  { id: 1, title: "Dados do Imóvel", icon: Home, desc: "Endereço e tipo de imóvel" },
  { id: 2, title: "Partes Envolvidas", icon: Users, desc: "Locador, inquilino e vistoriador" },
  { id: 3, title: "Contrato", icon: FileText, desc: "Dados do contrato de locação" },
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

type Room = { name: string; type: string };

export default function NovaVistoria() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);

  // Step 1 — Imóvel
  const [type, setType] = useState("entrada");
  const [propertyAddress, setPropertyAddress] = useState("");
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

  // Step 3 — Contrato
  const [contractNumber, setContractNumber] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [rentValue, setRentValue] = useState("");
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

  const addRoom = () => setRooms(r => [...r, { name: "", type: "outro" }]);
  const removeRoom = (i: number) => setRooms(r => r.filter((_, idx) => idx !== i));
  const updateRoom = (i: number, field: keyof Room, value: string) => {
    setRooms(r => r.map((room, idx) => idx === i ? { ...room, [field]: value } : room));
  };

  const handleSubmit = () => {
    if (!propertyAddress.trim()) { toast.error("Informe o endereço do imóvel"); return; }
    if (!landlordName.trim()) { toast.error("Informe o nome do locador"); return; }
    if (!tenantName.trim()) { toast.error("Informe o nome do inquilino"); return; }

    createMutation.mutate({
      type: type as any,
      propertyAddress,
      propertyType: propertyType as any,
      propertyArea: propertyArea || undefined,
      propertyRegistration: propertyRegistration || undefined,
      landlordName,
      landlordCpfCnpj: landlordCpf || undefined,
      landlordPhone: landlordPhone || undefined,
      landlordEmail: landlordEmail || undefined,
      tenantName,
      tenantCpfCnpj: tenantCpf || undefined,
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/operis/vistorias")} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-xl font-bold text-white font-['Barlow_Condensed'] tracking-wide uppercase">Nova Vistoria</h1>
          <p className="text-gray-400 text-xs">Laudo técnico conforme Lei 8.245/91</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex gap-2">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isDone = s.id < step;
          return (
            <button
              key={s.id}
              onClick={() => s.id < step && setStep(s.id)}
              className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                isActive ? "bg-red-600/20 border-red-500 text-white" :
                isDone ? "bg-green-600/10 border-green-600/30 text-green-400 cursor-pointer hover:bg-green-600/20" :
                "bg-gray-800/50 border-gray-700 text-gray-500"
              }`}
            >
              <div className="flex items-center gap-2">
                {isDone ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Icon className="w-4 h-4" />}
                <span className="text-xs font-semibold hidden sm:block">{s.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <Card className="bg-[#111827] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            {STEPS[step - 1].title}
            <span className="text-gray-400 text-sm font-normal ml-2">— {STEPS[step - 1].desc}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Step 1 — Imóvel */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-gray-300">Tipo de Vistoria *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INSPECTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-300">Endereço Completo do Imóvel *</Label>
                  <Input value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)}
                    placeholder="Rua, número, complemento, bairro, cidade - UF"
                    className="bg-gray-800 border-gray-600 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-gray-300">Tipo de Imóvel</Label>
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
                  <Label className="text-gray-300">Área (m²)</Label>
                  <Input value={propertyArea} onChange={e => setPropertyArea(e.target.value)}
                    placeholder="Ex: 85 m²"
                    className="bg-gray-800 border-gray-600 text-white mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-300">Matrícula / Registro do Imóvel</Label>
                  <Input value={propertyRegistration} onChange={e => setPropertyRegistration(e.target.value)}
                    placeholder="Número de matrícula no cartório"
                    className="bg-gray-800 border-gray-600 text-white mt-1" />
                </div>
              </div>
            </>
          )}

          {/* Step 2 — Partes */}
          {step === 2 && (
            <>
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide">Locador (Proprietário)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label className="text-gray-400 text-xs">Nome Completo *</Label>
                      <Input value={landlordName} onChange={e => setLandlordName(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs">CPF / CNPJ</Label>
                      <Input value={landlordCpf} onChange={e => setLandlordCpf(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs">Telefone</Label>
                      <Input value={landlordPhone} onChange={e => setLandlordPhone(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-400 text-xs">E-mail</Label>
                      <Input value={landlordEmail} onChange={e => setLandlordEmail(e.target.value)}
                        type="email" className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide">Inquilino (Locatário)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label className="text-gray-400 text-xs">Nome Completo *</Label>
                      <Input value={tenantName} onChange={e => setTenantName(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs">CPF / CNPJ</Label>
                      <Input value={tenantCpf} onChange={e => setTenantCpf(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs">Telefone</Label>
                      <Input value={tenantPhone} onChange={e => setTenantPhone(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-400 text-xs">E-mail</Label>
                      <Input value={tenantEmail} onChange={e => setTenantEmail(e.target.value)}
                        type="email" className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <h3 className="text-gray-200 font-semibold text-sm uppercase tracking-wide">Vistoriador</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label className="text-gray-400 text-xs">Nome do Vistoriador</Label>
                      <Input value={inspectorName} onChange={e => setInspectorName(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs">CREA / CRECI</Label>
                      <Input value={inspectorCrea} onChange={e => setInspectorCrea(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white mt-1 h-9" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3 — Contrato */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-gray-300">Número do Contrato</Label>
                  <Input value={contractNumber} onChange={e => setContractNumber(e.target.value)}
                    placeholder="Ex: CONT-2024-001"
                    className="bg-gray-800 border-gray-600 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-gray-300">Início do Contrato</Label>
                  <Input type="date" value={contractStart} onChange={e => setContractStart(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-gray-300">Fim do Contrato</Label>
                  <Input type="date" value={contractEnd} onChange={e => setContractEnd(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-300">Valor do Aluguel</Label>
                  <Input value={rentValue} onChange={e => setRentValue(e.target.value)}
                    placeholder="Ex: R$ 1.500,00"
                    className="bg-gray-800 border-gray-600 text-white mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-300">Observações Gerais</Label>
                  <Textarea value={generalNotes} onChange={e => setGeneralNotes(e.target.value)}
                    placeholder="Condições especiais, ressalvas, informações adicionais..."
                    className="bg-gray-800 border-gray-600 text-white mt-1 min-h-[100px]" />
                </div>
              </div>
            </>
          )}

          {/* Step 4 — Cômodos */}
          {step === 4 && (
            <>
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">
                  Defina os cômodos do imóvel. Cada cômodo terá itens de vistoria padrão adicionados automaticamente.
                </p>
                {rooms.map((room, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={room.name}
                      onChange={e => updateRoom(i, "name", e.target.value)}
                      placeholder="Nome do cômodo"
                      className="bg-gray-800 border-gray-600 text-white flex-1"
                    />
                    <Select value={room.type} onValueChange={v => updateRoom(i, "type", v)}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => removeRoom(i)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addRoom} className="border-dashed border-gray-600 text-gray-400 hover:text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Cômodo
                </Button>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 text-sm text-yellow-300">
                <strong>Itens padrão incluídos automaticamente:</strong> Piso, Parede, Teto, Porta, Janela, instalações elétricas e hidráulicas conforme o tipo de cômodo.
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/operis/vistorias")}
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
          <Button onClick={handleSubmit} disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <CheckCircle className="w-4 h-4" />
            {createMutation.isPending ? "Criando..." : "Criar Vistoria"}
          </Button>
        )}
      </div>
    </div>
  );
}

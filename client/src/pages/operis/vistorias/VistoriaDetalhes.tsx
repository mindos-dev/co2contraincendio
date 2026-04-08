import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft, FileText, CheckCircle, Clock, AlertCircle, Pen,
  Camera, Wand2, Home, User, Building2, ChevronDown, ChevronUp,
  MapPin, Upload, X, Image as ImageIcon, ScrollText
} from "lucide-react";

const CONDITION_CONFIG = {
  otimo: { label: "Ótimo", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  bom: { label: "Bom", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  regular: { label: "Regular", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  ruim: { label: "Ruim", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  pessimo: { label: "Péssimo", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  inexistente: { label: "Inexistente", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

const CONDITIONS = ["otimo", "bom", "regular", "ruim", "pessimo", "inexistente"] as const;

const STATUS_CONFIG = {
  rascunho: { label: "Rascunho", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  aguardando_assinatura: { label: "Aguardando Assinatura", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  concluida: { label: "Concluída", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  cancelada: { label: "Cancelada", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

export default function VistoriaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set());
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [itemNotes, setItemNotes] = useState<Record<number, string>>({});
  const [showSignModal, setShowSignModal] = useState<"landlord" | "tenant" | "inspector" | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<number | null>(null);
  const [photoPreview, setPhotoPreview] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoItemId, setActivePhotoItemId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.vistoria.get.useQuery({ id: Number(id) });

  const updateItemMutation = trpc.vistoria.updateItem.useMutation({
    onSuccess: () => {
      utils.vistoria.get.invalidate({ id: Number(id) });
      setEditingItem(null);
    },
  });

  const [contractHtml, setContractHtml] = useState<string | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);

  const generateContractMutation = trpc.vistoria.generateContract.useMutation({
    onSuccess: (data) => {
      setContractHtml(data.contractHtml);
      setShowContractModal(true);
      toast.success("Contrato gerado com sucesso!");
    },
    onError: (err) => toast.error("Erro ao gerar contrato: " + err.message),
  });

  const generateReportMutation = trpc.vistoria.generateReport.useMutation({
    onSuccess: (data) => {
      toast.success("Laudo gerado com sucesso!");
      navigate(`/operis/vistorias/laudo/${data.slug}`);
    },
    onError: (err) => toast.error("Erro ao gerar laudo: " + err.message),
  });

  const uploadPhotoMutation = trpc.vistoria.uploadItemPhoto.useMutation({
    onSuccess: (data, vars) => {
      toast.success("Foto salva com sucesso!");
      setPhotoPreview(prev => ({ ...prev, [vars.itemId]: data.url }));
      setUploadingItem(null);
      utils.vistoria.get.invalidate({ id: Number(id) });
    },
    onError: (err) => {
      toast.error("Erro ao enviar foto: " + err.message);
      setUploadingItem(null);
    },
  });

  const handlePhotoCapture = (itemId: number) => {
    setActivePhotoItemId(itemId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoItemId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Foto muito grande. Máximo 5 MB.");
      return;
    }
    setUploadingItem(activePhotoItemId);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      // Tentar obter geolocalização
      let geoTag = "";
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 })
        );
        geoTag = ` | GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      } catch { /* geolocalização negada — continua sem */ }
      const timestamp = new Date().toLocaleString("pt-BR");
      const notes = `📷 Foto registrada em ${timestamp}${geoTag}`;
      uploadPhotoMutation.mutate({
        itemId: activePhotoItemId,
        photoBase64: base64,
        mimeType: file.type,
      });
      // Salvar nota de timestamp no item
      updateItemMutation.mutate({
        itemId: activePhotoItemId,
        condition: (items.find(i => i.id === activePhotoItemId)?.condition as any) || "bom",
        notes,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const signMutation = trpc.vistoria.sign.useMutation({
    onSuccess: () => {
      toast.success("Assinatura salva com sucesso!");
      setShowSignModal(null);
      utils.vistoria.get.invalidate({ id: Number(id) });
    },
    onError: (err) => toast.error("Erro ao salvar assinatura: " + err.message),
  });

  const toggleRoom = (roomId: number) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      next.has(roomId) ? next.delete(roomId) : next.add(roomId);
      return next;
    });
  };

  // Canvas drawing
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const rect = canvasRef.current!.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const rect = canvasRef.current!.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
  const stopDraw = () => setIsDrawing(false);
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
  };
  const saveSignature = () => {
    if (!canvasRef.current || !showSignModal) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    signMutation.mutate({
      inspectionId: Number(id),
      role: showSignModal,
      signatureBase64: dataUrl,
    });
  };

  if (isLoading) return <div className="text-gray-400 text-center py-12">Carregando vistoria...</div>;
  if (!data) return <div className="text-red-400 text-center py-12">Vistoria não encontrada</div>;

  const { inspection, rooms, items } = data;

  // Input de arquivo oculto para captura de foto
  const hiddenFileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={handleFileChange}
    />
  );
  const statusCfg = STATUS_CONFIG[inspection.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.rascunho;

  return (
    <div className="space-y-6">
      {hiddenFileInput}
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/operis/vistorias")} className="text-gray-400 hover:text-white mt-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white font-['Barlow_Condensed'] tracking-wide uppercase">
              {inspection.propertyAddress}
            </h1>
            <p className="text-gray-400 text-sm">
              {inspection.type === "entrada" ? "Vistoria de Entrada" :
               inspection.type === "saida" ? "Vistoria de Saída" :
               inspection.type === "periodica" ? "Vistoria Periódica" : "Devolução"} —{" "}
              {new Date(inspection.inspectedAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            onClick={() => generateContractMutation.mutate({ inspectionId: Number(id) })}
            disabled={generateContractMutation.isPending}
            variant="outline"
            className="border-blue-600 text-blue-400 hover:bg-blue-900/20 gap-2"
          >
            <ScrollText className="w-4 h-4" />
            {generateContractMutation.isPending ? "Gerando..." : "Contrato IA"}
          </Button>
          <Button
            onClick={() => generateReportMutation.mutate({ inspectionId: Number(id) })}
            disabled={generateReportMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            <Wand2 className="w-4 h-4" />
            {generateReportMutation.isPending ? "Gerando..." : "Gerar Laudo IA"}
          </Button>
        </div>
      </div>

      {/* Partes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#111827] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Locador</span>
            </div>
            <p className="text-white font-medium">{inspection.landlordName}</p>
            {inspection.landlordCpfCnpj && <p className="text-gray-400 text-sm">{inspection.landlordCpfCnpj}</p>}
            {inspection.landlordPhone && <p className="text-gray-400 text-sm">{inspection.landlordPhone}</p>}
            {inspection.landlordSignatureUrl ? (
              <div className="mt-2 flex items-center gap-1 text-green-400 text-xs">
                <CheckCircle className="w-3 h-3" />
                Assinado
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowSignModal("landlord")}
                className="mt-2 border-blue-600 text-blue-400 hover:bg-blue-900/20 gap-1 text-xs h-7">
                <Pen className="w-3 h-3" />
                Assinar
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Inquilino</span>
            </div>
            <p className="text-white font-medium">{inspection.tenantName}</p>
            {inspection.tenantCpfCnpj && <p className="text-gray-400 text-sm">{inspection.tenantCpfCnpj}</p>}
            {inspection.tenantPhone && <p className="text-gray-400 text-sm">{inspection.tenantPhone}</p>}
            {inspection.tenantSignatureUrl ? (
              <div className="mt-2 flex items-center gap-1 text-green-400 text-xs">
                <CheckCircle className="w-3 h-3" />
                Assinado
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowSignModal("tenant")}
                className="mt-2 border-green-600 text-green-400 hover:bg-green-900/20 gap-1 text-xs h-7">
                <Pen className="w-3 h-3" />
                Assinar
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Vistoriador</span>
            </div>
            <p className="text-white font-medium">{inspection.inspectorName || "Não informado"}</p>
            {inspection.inspectorCrea && <p className="text-gray-400 text-sm">CREA: {inspection.inspectorCrea}</p>}
            {inspection.inspectorSignatureUrl ? (
              <div className="mt-2 flex items-center gap-1 text-green-400 text-xs">
                <CheckCircle className="w-3 h-3" />
                Assinado
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowSignModal("inspector")}
                className="mt-2 border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 gap-1 text-xs h-7">
                <Pen className="w-3 h-3" />
                Assinar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cômodos e Checklist */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-3 font-['Barlow_Condensed'] uppercase tracking-wide">
          Checklist por Cômodo
        </h2>
        <div className="space-y-3">
          {rooms.map((room) => {
            const roomItems = items.filter(i => i.roomId === room.id);
            const isExpanded = expandedRooms.has(room.id);
            const totalItems = roomItems.length;
            const goodItems = roomItems.filter(i => i.condition === "otimo" || i.condition === "bom").length;
            const badItems = roomItems.filter(i => i.condition === "ruim" || i.condition === "pessimo").length;

            return (
              <Card key={room.id} className="bg-[#111827] border-gray-700">
                <button
                  onClick={() => toggleRoom(room.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{room.name}</span>
                    <span className="text-gray-500 text-sm">{totalItems} itens</span>
                    {badItems > 0 && (
                      <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                        {badItems} problema{badItems > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {roomItems.slice(0, 8).map((item, i) => {
                        const cond = item.condition as keyof typeof CONDITION_CONFIG;
                        const color = cond === "otimo" || cond === "bom" ? "bg-green-500" :
                                      cond === "regular" ? "bg-yellow-500" :
                                      cond === "ruim" || cond === "pessimo" ? "bg-red-500" : "bg-gray-600";
                        return <div key={i} className={`w-2 h-2 rounded-full ${color}`} />;
                      })}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <div className="border-t border-gray-700 pt-4 space-y-2">
                      {roomItems.map((item) => {
                        const cond = (item.condition || "bom") as keyof typeof CONDITION_CONFIG;
                        const condCfg = CONDITION_CONFIG[cond] || CONDITION_CONFIG.bom;
                        const isEditing = editingItem === item.id;

                        return (
                          <div key={item.id} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-200 text-sm font-medium flex-1">{item.name}</span>
                              <Select
                                value={item.condition || "bom"}
                                onValueChange={(val) => {
                                  updateItemMutation.mutate({
                                    itemId: item.id,
                                    condition: val as any,
                                    notes: itemNotes[item.id] ?? item.notes ?? undefined,
                                  });
                                }}
                              >
                                <SelectTrigger className={`w-32 h-7 text-xs border ${condCfg.color} bg-transparent`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CONDITIONS.map(c => (
                                    <SelectItem key={c} value={c}>{CONDITION_CONFIG[c].label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {isEditing ? (
                              <div className="mt-2 flex gap-2">
                                <Textarea
                                  value={itemNotes[item.id] ?? item.notes ?? ""}
                                  onChange={e => setItemNotes(n => ({ ...n, [item.id]: e.target.value }))}
                                  placeholder="Observação sobre este item..."
                                  className="bg-gray-700 border-gray-600 text-white text-sm min-h-[60px] flex-1"
                                />
                                <div className="flex flex-col gap-1">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                                    onClick={() => updateItemMutation.mutate({
                                      itemId: item.id,
                                      condition: item.condition as any,
                                      notes: itemNotes[item.id],
                                    })}>
                                    Salvar
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-gray-400 h-7 text-xs"
                                    onClick={() => setEditingItem(null)}>
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                {item.notes && <p className="text-gray-400 text-xs flex-1">{item.notes}</p>}
                              <button onClick={() => setEditingItem(item.id)} className="text-gray-500 hover:text-gray-300 text-xs">
                                + obs
                              </button>
                              <button
                                onClick={() => handlePhotoCapture(item.id)}
                                disabled={uploadingItem === item.id}
                                className="text-gray-500 hover:text-blue-400 transition-colors disabled:opacity-50"
                                title="Adicionar foto"
                              >
                                {uploadingItem === item.id
                                  ? <Upload className="w-3.5 h-3.5 animate-pulse text-blue-400" />
                                  : (item.photoUrl || photoPreview[item.id])
                                    ? <ImageIcon className="w-3.5 h-3.5 text-green-400" />
                                    : <Camera className="w-3.5 h-3.5" />
                                }
                              </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal de Contrato Inteligente */}
      {showContractModal && contractHtml && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-blue-600" />
                Contrato de Locação — Lei 8.245/91 + LC 214/2025
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const win = window.open("", "_blank");
                    if (win) { win.document.write(contractHtml); win.document.close(); win.print(); }
                  }}
                  className="border-gray-300 text-gray-700 gap-1 text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Imprimir / PDF
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowContractModal(false)} className="text-gray-500">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto p-6"
              dangerouslySetInnerHTML={{ __html: contractHtml }}
            />
          </div>
        </div>
      )}

      {/* Modal de Assinatura */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold text-lg mb-2">
              Assinatura do {showSignModal === "landlord" ? "Locador" : showSignModal === "tenant" ? "Inquilino" : "Vistoriador"}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Assine no campo abaixo usando o mouse ou dedo (touchscreen)
            </p>
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="w-full bg-white rounded-lg cursor-crosshair border-2 border-gray-600"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={clearCanvas} className="border-gray-600 text-gray-300">
                Limpar
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" onClick={() => setShowSignModal(null)} className="text-gray-400">
                Cancelar
              </Button>
              <Button onClick={saveSignature} disabled={signMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <CheckCircle className="w-4 h-4" />
                {signMutation.isPending ? "Salvando..." : "Confirmar Assinatura"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Trash2, ChevronDown, ChevronUp, Camera } from "lucide-react";

type CategoryType = "fissura" | "infiltracao" | "corrosao" | "destacamento" | "outro";
type SeverityType = "low" | "medium" | "high";

const CATEGORIES: { value: CategoryType; label: string }[] = [
  { value: "fissura",      label: "Fissura / Trinca" },
  { value: "infiltracao",  label: "Infiltração / Vazamento" },
  { value: "corrosao",     label: "Corrosão / Oxidação" },
  { value: "destacamento", label: "Descolamento / Destacamento" },
  { value: "outro",        label: "Outro" },
];

const SEVERITY_CONFIG: Record<SeverityType, { label: string; bg: string; color: string; border: string }> = {
  low:    { label: "Baixa",  bg: "bg-yellow-500/20", color: "text-yellow-400", border: "border-yellow-500/30" },
  medium: { label: "Média",  bg: "bg-orange-500/20", color: "text-orange-400", border: "border-orange-500/30" },
  high:   { label: "Alta",   bg: "bg-red-500/20",    color: "text-red-400",    border: "border-red-500/30" },
};

interface PathologyItem {
  id: number;
  roomItemId: number | null;
  category: string;
  severity: string;
  causeAnalysis: string | null;
  repairSuggestion: string | null;
  riskScore: number | null;
}

interface Props {
  inspectionId: number;
  itemId?: number;
  itemLabel: string;
}

export function PathologyReport({ inspectionId, itemId, itemLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<CategoryType>("fissura");
  const [severity, setSeverity] = useState<SeverityType>("medium");
  const [causeAnalysis, setCauseAnalysis] = useState("");
  const [repairSuggestion, setRepairSuggestion] = useState("");
  const [photoContext, setPhotoContext] = useState<string | null>(null);
  const [photoDetail, setPhotoDetail] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: listData } = trpc.pathology.list.useQuery(
    { inspectionId },
    { enabled: open }
  );

  const allPathologies: PathologyItem[] = listData?.pathologies ?? [];
  const itemPathologies = allPathologies.filter(p =>
    itemId !== undefined ? p.roomItemId === itemId : p.roomItemId === null
  );

  const createMutation = trpc.pathology.create.useMutation({
    onSuccess: () => {
      utils.pathology.list.invalidate({ inspectionId });
      setShowForm(false);
      setCauseAnalysis("");
      setRepairSuggestion("");
      setPhotoContext(null);
      setPhotoDetail(null);
    },
  });

  const deleteMutation = trpc.pathology.delete.useMutation({
    onSuccess: () => utils.pathology.list.invalidate({ inspectionId }),
  });

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handlePhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) setter(await toBase64(file));
  };

  const handleSubmit = () => {
    if (!causeAnalysis.trim()) return;
    createMutation.mutate({
      inspectionId,
      roomItemId: itemId,
      category,
      severity,
      causeAnalysis,
      repairSuggestion,
      photoContextBase64: photoContext ?? undefined,
      photoDetailBase64: photoDetail ?? undefined,
    });
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
      >
        <AlertTriangle size={12} />
        {itemPathologies.length > 0
          ? `${itemPathologies.length} patologia${itemPathologies.length > 1 ? "s" : ""} registrada${itemPathologies.length > 1 ? "s" : ""}`
          : "Reportar Patologia"}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="mt-2 space-y-3 pl-2 border-l-2 border-orange-500/30">
          {/* Lista de patologias existentes */}
          {itemPathologies.map(p => {
            const sev = p.severity as SeverityType;
            const cfg = SEVERITY_CONFIG[sev] ?? SEVERITY_CONFIG.medium;
            return (
              <div key={p.id} className={`rounded-lg border p-3 text-xs space-y-1 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${cfg.color}`}>
                    {CATEGORIES.find(c => c.value === p.category)?.label ?? p.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {cfg.label}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate({ id: p.id })}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {p.causeAnalysis && <p className="text-gray-400">{p.causeAnalysis}</p>}
                {p.repairSuggestion && <p className="text-gray-500 italic">{p.repairSuggestion}</p>}
                {p.riskScore !== null && p.riskScore !== undefined && (
                  <p className="text-gray-500">Risk Score: <span className="font-bold text-orange-400">{p.riskScore}/10</span></p>
                )}
              </div>
            );
          })}

          {/* Formulário de nova patologia */}
          {showForm ? (
            <div className="bg-gray-900/60 rounded-lg border border-orange-500/20 p-4 space-y-3">
              <p className="text-xs font-semibold text-orange-300">Nova Patologia — {itemLabel}</p>

              {/* Categoria */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Categoria</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                      className={`px-2.5 py-1 rounded text-xs border transition-all ${
                        category === c.value
                          ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                          : "bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-500"
                      }`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severidade */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Severidade</label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as SeverityType[]).map(s => (
                    <button key={s} type="button" onClick={() => setSeverity(s)}
                      className={`px-3 py-1 rounded text-xs border transition-all ${
                        severity === s
                          ? `${SEVERITY_CONFIG[s].bg} ${SEVERITY_CONFIG[s].color} ${SEVERITY_CONFIG[s].border} font-semibold`
                          : "bg-gray-800 border-gray-700 text-gray-500"
                      }`}>
                      {SEVERITY_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Análise de causa */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Análise de Causa *</label>
                <textarea
                  value={causeAnalysis}
                  onChange={e => setCauseAnalysis(e.target.value)}
                  placeholder="Descreva a causa técnica observada..."
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
                />
              </div>

              {/* Sugestão de reparo */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Sugestão de Reparo</label>
                <textarea
                  value={repairSuggestion}
                  onChange={e => setRepairSuggestion(e.target.value)}
                  placeholder="Solução técnica recomendada..."
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
                />
              </div>

              {/* Fotos */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    <span className="flex items-center gap-1"><Camera size={10} /> Foto Contexto</span>
                  </label>
                  {photoContext ? (
                    <div className="relative">
                      <img src={photoContext} alt="contexto" className="w-full h-20 object-cover rounded-lg border border-gray-700" />
                      <button type="button" onClick={() => setPhotoContext(null)} className="absolute top-1 right-1 bg-red-500/80 rounded p-0.5">
                        <Trash2 size={10} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center h-20 border border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors">
                      <span className="text-xs text-gray-600">+ Adicionar</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoChange(e, setPhotoContext)} />
                    </label>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    <span className="flex items-center gap-1"><Camera size={10} /> Foto Detalhe</span>
                  </label>
                  {photoDetail ? (
                    <div className="relative">
                      <img src={photoDetail} alt="detalhe" className="w-full h-20 object-cover rounded-lg border border-gray-700" />
                      <button type="button" onClick={() => setPhotoDetail(null)} className="absolute top-1 right-1 bg-red-500/80 rounded p-0.5">
                        <Trash2 size={10} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center h-20 border border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors">
                      <span className="text-xs text-gray-600">+ Adicionar</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoChange(e, setPhotoDetail)} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="button" size="sm" onClick={handleSubmit}
                  disabled={!causeAnalysis.trim() || createMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-7">
                  {createMutation.isPending ? "Salvando..." : "Salvar Patologia"}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}
                  className="text-gray-500 text-xs h-7">
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-400 transition-colors"
            >
              <Plus size={12} /> Adicionar patologia
            </button>
          )}
        </div>
      )}
    </div>
  );
}

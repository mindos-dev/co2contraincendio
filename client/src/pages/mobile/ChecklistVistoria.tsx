import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Camera,
} from "lucide-react";

type AnswerType = "conforme" | "nao_conforme" | "nao_aplicavel" | "pendente";

interface LocalAnswer {
  questionKey: string;
  questionText: string;
  answer: AnswerType;
  observation: string;
  expanded: boolean;
}

const ANSWER_CONFIG: Record<AnswerType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  conforme: {
    label: "Conforme",
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
  nao_conforme: {
    label: "Não Conforme",
    icon: <XCircle className="w-5 h-5" />,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
  nao_aplicavel: {
    label: "N/A",
    icon: <MinusCircle className="w-5 h-5" />,
    color: "text-gray-400",
    bg: "bg-gray-50 border-gray-200",
  },
  pendente: {
    label: "Pendente",
    icon: <Clock className="w-5 h-5" />,
    color: "text-yellow-500",
    bg: "bg-yellow-50 border-yellow-200",
  },
};

export default function ChecklistVistoria() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const inspectionId = parseInt(params.id ?? "0");

  const [answers, setAnswers] = useState<LocalAnswer[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: inspection } = trpc.field.getInspection.useQuery(
    { id: inspectionId },
    { enabled: inspectionId > 0 }
  );

  const { data: checklist, isLoading } = trpc.field.getChecklist.useQuery(
    { type: (inspection?.type ?? "outros") as "pmoc" | "incendio" | "eletrica" | "outros" },
    { enabled: !!inspection }
  );

  const { data: savedAnswers } = trpc.field.getChecklistAnswers.useQuery(
    { inspectionId },
    { enabled: inspectionId > 0 }
  );

  const saveMutation = trpc.field.saveChecklistAnswers.useMutation();

  // Inicializar answers quando checklist carrega
  useEffect(() => {
    if (!checklist) return;
    const saved = savedAnswers ?? [];
    setAnswers(
      checklist.map(q => {
        const existing = saved.find(s => s.questionKey === q.key);
        return {
          questionKey: q.key,
          questionText: q.text,
          answer: (existing?.answer ?? "pendente") as AnswerType,
          observation: existing?.observation ?? "",
          expanded: false,
        };
      })
    );
  }, [checklist, savedAnswers]);

  const setAnswer = (idx: number, answer: AnswerType) => {
    setAnswers(prev => prev.map((a, i) => {
      if (i !== idx) return a;
      return {
        ...a,
        answer,
        expanded: answer === "nao_conforme" ? true : a.expanded,
      };
    }));
  };

  const setObservation = (idx: number, observation: string) => {
    setAnswers(prev => prev.map((a, i) => i === idx ? { ...a, observation } : a));
  };

  const toggleExpand = (idx: number) => {
    setAnswers(prev => prev.map((a, i) => i === idx ? { ...a, expanded: !a.expanded } : a));
  };

  const handleSave = async (goNext = false) => {
    setSaving(true);
    try {
      await saveMutation.mutateAsync({
        inspectionId,
        answers: answers.map(a => ({
          questionKey: a.questionKey,
          questionText: a.questionText,
          answer: a.answer,
          observation: a.observation || undefined,
        })),
      });
      if (goNext) {
        navigate(`/mobile/upload/${inspectionId}`);
      } else {
        toast.success("Checklist salvo!");
      }
    } catch {
      toast.error("Erro ao salvar checklist.");
    } finally {
      setSaving(false);
    }
  };

  const conformes = answers.filter(a => a.answer === "conforme").length;
  const naoConformes = answers.filter(a => a.answer === "nao_conforme").length;
  const pendentes = answers.filter(a => a.answer === "pendente").length;
  const progress = answers.length > 0
    ? Math.round(((answers.length - pendentes) / answers.length) * 100)
    : 0;

  if (isLoading || !inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0a1628] text-white px-4 pt-safe-top pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => navigate("/mobile")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">{inspection.title}</h1>
            <p className="text-xs text-white/60">{answers.length} itens no checklist</p>
          </div>
          <button
            onClick={() => navigate(`/mobile/upload/${inspectionId}`)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>{progress}% concluído</span>
            <span className="flex gap-3">
              <span className="text-green-400">{conformes} ✓</span>
              <span className="text-red-400">{naoConformes} ✗</span>
              <span className="text-yellow-400">{pendentes} ⏳</span>
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C8102E] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="flex-1 px-4 py-4 space-y-3 pb-32">
        {answers.map((item, idx) => {
          const config = ANSWER_CONFIG[item.answer];
          return (
            <div
              key={item.questionKey}
              className={`rounded-2xl border-2 overflow-hidden transition-all ${config.bg}`}
            >
              {/* Question */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-gray-400 mt-0.5 flex-shrink-0 w-6">
                    {idx + 1}.
                  </span>
                  <p className="flex-1 text-sm font-medium text-gray-800 leading-snug">
                    {item.questionText}
                  </p>
                </div>

                {/* Answer Buttons */}
                <div className="flex gap-2 mt-3 ml-9">
                  {(["conforme", "nao_conforme", "nao_aplicavel"] as AnswerType[]).map(ans => {
                    const c = ANSWER_CONFIG[ans];
                    const isSelected = item.answer === ans;
                    return (
                      <button
                        key={ans}
                        onClick={() => setAnswer(idx, ans)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all flex-1 justify-center ${
                          isSelected
                            ? `${c.color} border-current bg-white shadow-sm`
                            : "text-gray-400 border-gray-200 bg-white/50"
                        }`}
                      >
                        {c.icon}
                        <span className="hidden sm:inline">{c.label}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="p-2 rounded-xl border-2 border-gray-200 bg-white/50 text-gray-400"
                  >
                    {item.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Observation (expanded) */}
              {item.expanded && (
                <div className="px-4 pb-4 ml-9">
                  <Textarea
                    value={item.observation}
                    onChange={e => setObservation(idx, e.target.value)}
                    placeholder="Observação ou descrição da não conformidade..."
                    className="text-sm rounded-xl border-gray-200 bg-white resize-none"
                    rows={2}
                    autoFocus
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pb-safe-bottom pb-6 pt-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex-1 h-12 rounded-xl border-gray-200 text-gray-700"
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex-1 h-12 rounded-xl bg-[#C8102E] hover:bg-[#a50d25] text-white font-bold"
          >
            Fotos →
          </Button>
        </div>
      </div>
    </div>
  );
}

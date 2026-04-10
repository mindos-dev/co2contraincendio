/**
 * ─── AI Control Panel — Terminal de Controle e Governança de IAs ────────────
 * JULY AOG | OPERIS Command Center
 *
 * Controle de múltiplas IAs open-source: Gemma 2, Llama 3, Mistral, DeepSeek, Phi-3
 * Alertas visuais de saúde das IAs
 * AI Flow Builder — criação de fluxos rápidos entre IAs para testes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Brain, Zap, Play, Square, RotateCcw, Plus, Trash2,
  ArrowRight, AlertTriangle, CheckCircle2, Clock, Loader2,
  ChevronDown, ChevronUp, Send, X, Info, Download,
  Activity, Cpu, MemoryStick, RefreshCw, Shield
} from "lucide-react";

// ─── Catálogo de modelos ──────────────────────────────────────────────────────
const MODEL_ICONS: Record<string, string> = {
  gemma2: "🟢", llama3: "🦙", mistral: "🌊", deepseek: "🔵",
  phi3: "🔷", "phi-3": "🔷", qwen: "🟡", codellama: "💻",
  vicuna: "🦙", neural: "🧠", openchat: "💬", default: "🤖",
};

const MODEL_COLORS: Record<string, string> = {
  gemma2: "emerald", llama3: "orange", mistral: "blue",
  deepseek: "cyan", phi3: "indigo", default: "zinc",
};

function getModelIcon(name: string): string {
  const key = Object.keys(MODEL_ICONS).find(k => name.toLowerCase().includes(k));
  return key ? MODEL_ICONS[key] : MODEL_ICONS.default;
}

function getModelColor(name: string): string {
  const key = Object.keys(MODEL_COLORS).find(k => name.toLowerCase().includes(k));
  return key ? MODEL_COLORS[key] : MODEL_COLORS.default;
}

// ─── Card de Modelo ───────────────────────────────────────────────────────────
function ModelCard({
  model,
  isRunning,
  onSwitch,
  onDelete,
}: {
  model: any;
  isRunning: boolean;
  onSwitch: (name: string) => void;
  onDelete: (name: string) => void;
}) {
  const color = getModelColor(model.name);
  const icon = getModelIcon(model.name);
  const sizeMB = Math.round((model.size ?? 0) / 1024 / 1024);
  const sizeGB = (sizeMB / 1024).toFixed(1);

  return (
    <div className={`relative bg-zinc-900/60 border rounded-xl p-4 transition-all duration-200 ${
      isRunning
        ? `border-${color}-500/50 bg-${color}-500/5`
        : "border-zinc-800 hover:border-zinc-700"
    }`}>
      {isRunning && (
        <div className={`absolute top-2 right-2 flex items-center gap-1 text-xs text-${color}-400 bg-${color}-500/10 px-2 py-0.5 rounded-full border border-${color}-500/20`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-${color}-400 animate-pulse`} />
          Ativo
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-zinc-200 truncate">{model.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-zinc-500">{sizeGB} GB</span>
            {model.details?.parameterSize && (
              <span className="text-xs text-zinc-600">· {model.details.parameterSize}</span>
            )}
            {model.details?.quantizationLevel && (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                {model.details.quantizationLevel}
              </span>
            )}
          </div>
          {model.modifiedAt && (
            <p className="text-xs text-zinc-600 mt-1">
              Atualizado: {new Date(model.modifiedAt).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onSwitch(model.name)}
          disabled={isRunning}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg transition-all ${
            isRunning
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              : `bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 hover:bg-${color}-500/20`
          }`}
        >
          {isRunning ? <CheckCircle2 className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isRunning ? "Em execução" : "Ativar"}
        </button>
        <button
          onClick={() => onDelete(model.name)}
          className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Remover modelo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── AI Alert Badge ───────────────────────────────────────────────────────────
function AlertBadge({ alert }: { alert: any }) {
  const config = {
    critical: { bg: "bg-red-500/10 border-red-500/30", text: "text-red-400", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    warning: { bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-400", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    info: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", icon: <Info className="w-3.5 h-3.5" /> },
  };
  const cfg = config[alert.severity as keyof typeof config] ?? config.info;

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${cfg.bg}`}>
      <span className={cfg.text}>{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${cfg.text}`}>{alert.type?.replace(/_/g, " ").toUpperCase()}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{alert.message}</p>
        {alert.model && <p className="text-xs text-zinc-600 mt-0.5">Modelo: {alert.model}</p>}
      </div>
      <span className="text-xs text-zinc-600 shrink-0">
        {new Date(alert.timestamp).toLocaleTimeString("pt-BR")}
      </span>
    </div>
  );
}

// ─── AI Flow Builder ──────────────────────────────────────────────────────────
function AIFlowBuilder({ availableModels }: { availableModels: string[] }) {
  const [steps, setSteps] = useState([
    { id: "step-1", model: availableModels[0] ?? "gemma2", prompt: "", role: "Analisar o input inicial" },
  ]);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const executeMutation = trpc.dgo.pipeline.execute.useMutation();

  const addStep = () => {
    setSteps(prev => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        model: availableModels[prev.length % availableModels.length] ?? "gemma2",
        prompt: "",
        role: `Processar saída do passo ${prev.length}`,
      },
    ]);
  };

  const removeStep = (id: string) => {
    if (steps.length <= 1) return;
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const updateStep = (id: string, field: string, value: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const runPipeline = async () => {
    if (!initialPrompt.trim()) return;
    setIsRunning(true);
    setResult(null);
    try {
      const pipeline = {
        id: `flow-${Date.now()}`,
        name: "Fluxo Personalizado",
        description: "Fluxo criado no AI Flow Builder",
        initialPrompt,
        steps: steps.map((s, i) => ({
          id: s.id,
          model: s.model,
          role: s.role || `Passo ${i + 1}`,
          systemPrompt: `Você é um assistente técnico especializado. ${s.prompt}`,
          maxTokens: 500,
          temperature: 0.3,
        })),
      };
      const res = await executeMutation.mutateAsync(pipeline);
      setResult(res);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-zinc-200">AI Flow Builder</h3>
        <span className="text-xs text-zinc-500 ml-auto">Crie pipelines entre múltiplas IAs</span>
      </div>

      {/* Prompt inicial */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Prompt Inicial</label>
        <textarea
          value={initialPrompt}
          onChange={e => setInitialPrompt(e.target.value)}
          placeholder="Digite o prompt que será processado pelo fluxo de IAs..."
          rows={2}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
        />
      </div>

      {/* Steps do pipeline */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-start gap-2">
            {/* Conector */}
            {i > 0 && (
              <div className="flex flex-col items-center pt-3 mr-1">
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 rotate-90" />
              </div>
            )}

            <div className="flex-1 bg-zinc-950/60 border border-zinc-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-zinc-500 w-6">#{i + 1}</span>
                <select
                  value={step.model}
                  onChange={e => updateStep(step.id, "model", e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                >
                  {availableModels.map(m => (
                    <option key={m} value={m}>{getModelIcon(m)} {m}</option>
                  ))}
                  {availableModels.length === 0 && (
                    <>
                      <option value="gemma2">🟢 gemma2</option>
                      <option value="llama3">🦙 llama3</option>
                      <option value="mistral">🌊 mistral</option>
                      <option value="deepseek-r1">🔵 deepseek-r1</option>
                      <option value="phi3">🔷 phi3</option>
                    </>
                  )}
                </select>
                <button
                  onClick={() => removeStep(step.id)}
                  disabled={steps.length <= 1}
                  className="p-1 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-30"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={step.role}
                onChange={e => updateStep(step.id, "role", e.target.value)}
                placeholder={`Papel do passo ${i + 1}...`}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-400 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Botões */}
      <div className="flex items-center gap-2">
        <button
          onClick={addStep}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar IA
        </button>
        <button
          onClick={runPipeline}
          disabled={isRunning || !initialPrompt.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isRunning ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Executando Fluxo...</>
          ) : (
            <><Play className="w-3.5 h-3.5" /> Executar Fluxo</>
          )}
        </button>
      </div>

      {/* Resultado */}
      {result && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
          {result.error ? (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-xs">{result.error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">
                  Fluxo concluído em {((result.totalDurationMs ?? 0) / 1000).toFixed(1)}s
                </span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  result.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {result.status}
                </span>
              </div>

              {result.steps?.map((step: any, i: number) => (
                <div key={i} className="border-l-2 border-zinc-700 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-zinc-400">
                      {getModelIcon(step.model)} {step.model}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {((step.durationMs ?? 0) / 1000).toFixed(1)}s
                    </span>
                    {step.status === "error" && (
                      <span className="text-xs text-red-400">ERRO</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {step.output?.slice(0, 300)}{step.output?.length > 300 ? "..." : ""}
                  </p>
                </div>
              ))}

              {result.finalOutput && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">Saída Final</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{result.finalOutput}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Painel Principal ─────────────────────────────────────────────────────────
export default function AIControlPanel() {
  const [activeTab, setActiveTab] = useState<"models" | "alerts" | "flow">("models");
  const [pullModel, setPullModel] = useState("");
  const [showPull, setShowPull] = useState(false);

  const modelsQuery = trpc.dgo.ollama.models.useQuery(undefined, { refetchInterval: 10_000 });
  const runningQuery = trpc.dgo.ollama.running.useQuery(undefined, { refetchInterval: 5_000 });
  const alertsQuery = trpc.dgo.alerts.active.useQuery(undefined, { refetchInterval: 10_000 });
  const switchMutation = trpc.dgo.ollama.switchModel.useMutation();
  const deleteMutation = trpc.dgo.ollama.delete.useMutation();
  const pullMutation = trpc.dgo.ollama.pull.useMutation();
  const healthMutation = trpc.dgo.alerts.checkHealth.useMutation();

  const models = (modelsQuery.data as any[]) ?? [];
  const running = runningQuery.data as any;
  const alerts = (alertsQuery.data as any[]) ?? [];
  const availableModelNames = models.map((m: any) => m.name);

  const handleSwitch = async (name: string) => {
    await switchMutation.mutateAsync({ modelName: name });
    runningQuery.refetch();
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Remover o modelo "${name}"?`)) return;
    await deleteMutation.mutateAsync({ modelName: name });
    modelsQuery.refetch();
  };

  const handlePull = async () => {
    if (!pullModel.trim()) return;
    await pullMutation.mutateAsync({ modelName: pullModel.trim() });
    setPullModel("");
    setShowPull(false);
    modelsQuery.refetch();
  };

  const tabs = [
    { id: "models", label: "Modelos", count: models.length, icon: <Brain className="w-3.5 h-3.5" /> },
    { id: "alerts", label: "Alertas", count: alerts.length, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: "flow", label: "AI Flow", count: null, icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Controle de IAs
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {models.length} modelo(s) instalado(s) ·{" "}
            {running?.model ? (
              <span className="text-emerald-400">{running.model} ativo</span>
            ) : (
              <span className="text-zinc-600">Nenhum ativo</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => healthMutation.mutate()}
            disabled={healthMutation.isPending}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <Activity className={`w-3.5 h-3.5 ${healthMutation.isPending ? "animate-pulse text-emerald-400" : ""}`} />
            Health Check
          </button>
          <button
            onClick={() => setShowPull(!showPull)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Pull Modelo
          </button>
        </div>
      </div>

      {/* Pull Model Input */}
      {showPull && (
        <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
          <input
            value={pullModel}
            onChange={e => setPullModel(e.target.value)}
            placeholder="Ex: llama3, mistral, deepseek-r1:7b..."
            onKeyDown={e => e.key === "Enter" && handlePull()}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 font-mono"
          />
          <button
            onClick={handlePull}
            disabled={pullMutation.isPending || !pullModel.trim()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 transition-all"
          >
            {pullMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Pull
          </button>
          <button onClick={() => setShowPull(false)} className="text-zinc-600 hover:text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-zinc-800 text-zinc-200 font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab.id === "alerts" && tab.count > 0
                  ? "bg-red-500/20 text-red-400"
                  : "bg-zinc-700 text-zinc-400"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Modelos */}
      {activeTab === "models" && (
        <div>
          {modelsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              <span className="ml-2 text-sm text-zinc-500">Conectando ao Ollama...</span>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-8 text-zinc-600">
              <Brain className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum modelo instalado.</p>
              <p className="text-xs mt-1">Use "Pull Modelo" para instalar Gemma 2, Llama 3, Mistral...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {models.map((model: any) => (
                <ModelCard
                  key={model.name}
                  model={model}
                  isRunning={running?.model === model.name}
                  onSwitch={handleSwitch}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Alertas */}
      {activeTab === "alerts" && (
        <div className="space-y-2">
          {alerts.length === 0 ? (
            <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-400">Todas as IAs saudáveis</p>
                <p className="text-xs text-zinc-500 mt-0.5">Nenhum alerta ativo no momento.</p>
              </div>
            </div>
          ) : (
            alerts.map((alert: any) => (
              <AlertBadge key={alert.id} alert={alert} />
            ))
          )}
        </div>
      )}

      {/* Tab: AI Flow Builder */}
      {activeTab === "flow" && (
        <AIFlowBuilder availableModels={availableModelNames} />
      )}
    </div>
  );
}

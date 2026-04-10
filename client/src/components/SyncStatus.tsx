/**
 * OPERIS Command Center — SyncStatus Component
 * Modelo Modular Diamond | JULY AOG — Project Diamond
 *
 * Exibe o status de boot do sistema durante a inicialização:
 *   - Aguardando MySQL
 *   - Git Import (sincronizando repositório)
 *   - Sincronizando Banco (drizzle-kit push)
 *   - Sistema pronto
 *
 * Faz polling em /api/health a cada 2 segundos.
 * Quando boot.ready === true, renderiza os filhos normalmente.
 * Em vez de erro 500, o usuário vê um painel profissional de progresso.
 */

import { useEffect, useState, useCallback } from "react";

interface BootStatus {
  phase: string;
  message: string;
  progress: number;
  ready: boolean;
  timestamp: string;
}

interface HealthResponse {
  status: "ok" | "booting";
  version: string;
  timestamp: string;
  boot: BootStatus;
}

interface SyncStatusProps {
  children: React.ReactNode;
}

const PHASE_LABELS: Record<string, string> = {
  db_wait: "Aguardando banco de dados MySQL...",
  db_ready: "Banco de dados conectado",
  git_import: "Sincronizando núcleo OPERIS do GitHub...",
  git_done: "Repositório sincronizado",
  db_migrate: "Sincronizando schema do banco (54 tabelas)...",
  ready: "OPERIS Command Center operacional",
  error: "Erro durante a inicialização",
};

const PHASE_ICONS: Record<string, string> = {
  db_wait: "🔌",
  db_ready: "✅",
  git_import: "📥",
  git_done: "✅",
  db_migrate: "🔄",
  ready: "🚀",
  error: "❌",
};

export function SyncStatus({ children }: SyncStatusProps) {
  const [bootStatus, setBootStatus] = useState<BootStatus | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) {
        // Servidor ainda não está respondendo — continua tentando
        setAttempts((a) => a + 1);
        return;
      }

      const data: HealthResponse = await res.json();
      setBootStatus(data.boot);
      setError(null);

      if (data.boot.ready || data.status === "ok") {
        setIsReady(true);
      }
    } catch (_e) {
      // Servidor ainda iniciando — continua tentando silenciosamente
      setAttempts((a) => a + 1);
    }
  }, []);

  useEffect(() => {
    // Verificação imediata
    checkHealth();

    // Polling a cada 2 segundos durante o boot
    const interval = setInterval(() => {
      if (!isReady) {
        checkHealth();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [checkHealth, isReady]);

  // Sistema pronto — renderiza a aplicação normalmente
  if (isReady) {
    return <>{children}</>;
  }

  const progress = bootStatus?.progress ?? 0;
  const phase = bootStatus?.phase ?? "db_wait";
  const message = bootStatus?.message ?? "Inicializando OPERIS Command Center...";
  const icon = PHASE_ICONS[phase] ?? "⏳";
  const label = PHASE_LABELS[phase] ?? message;
  const isError = phase === "error";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6">
            <svg
              className="w-10 h-10 text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            OPERIS Command Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            CO₂ Contra Incêndio SaaS · Modelo Modular Diamond
          </p>
        </div>

        {/* Card de Status */}
        <div
          className={`rounded-2xl border p-6 mb-6 ${
            isError
              ? "bg-red-950/30 border-red-800/40"
              : "bg-gray-900/80 border-gray-800/60"
          }`}
        >
          {/* Fase atual */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">{icon}</span>
            <div>
              <p
                className={`text-sm font-medium ${
                  isError ? "text-red-400" : "text-orange-400"
                }`}
              >
                {label}
              </p>
              {message !== label && (
                <p className="text-xs text-gray-500 mt-0.5">{message}</p>
              )}
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Progresso de inicialização</span>
              <span
                className={`text-xs font-mono font-bold ${
                  isError ? "text-red-400" : "text-orange-400"
                }`}
              >
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isError
                    ? "bg-red-500"
                    : progress === 100
                    ? "bg-green-500"
                    : "bg-orange-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Etapas do Boot Orchestrator */}
          <div className="space-y-2 mt-5">
            {[
              { key: "db_wait", label: "Banco de dados MySQL", phases: ["db_wait", "db_ready", "git_import", "git_done", "db_migrate", "ready"] },
              { key: "git_import", label: "Git Import (GitHub → /app)", phases: ["git_import", "git_done", "db_migrate", "ready"] },
              { key: "db_migrate", label: "Schema Drizzle (54 tabelas)", phases: ["db_migrate", "ready"] },
              { key: "ready", label: "Servidor Node.js", phases: ["ready"] },
            ].map((step) => {
              const isDone = step.phases.includes(phase) && phase !== step.key;
              const isCurrent = phase === step.key;
              const isPending = !step.phases.includes(phase) && !isDone;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                      isDone
                        ? "bg-green-500/20 text-green-400 border border-green-500/40"
                        : isCurrent
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                        : "bg-gray-800 text-gray-600 border border-gray-700"
                    }`}
                  >
                    {isDone ? "✓" : isCurrent ? "●" : "○"}
                  </div>
                  <span
                    className={`text-xs ${
                      isDone
                        ? "text-green-400"
                        : isCurrent
                        ? "text-orange-300 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="ml-auto">
                      <span className="inline-flex gap-0.5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1 h-1 rounded-full bg-orange-400 animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center">
          {isError ? (
            <div className="text-red-400 text-sm">
              <p>Erro durante a inicialização.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <p className="text-gray-600 text-xs">
              {attempts > 0 && !bootStatus
                ? `Aguardando servidor... (tentativa ${attempts})`
                : "O sistema estará pronto em instantes. Não feche esta janela."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SyncStatus;

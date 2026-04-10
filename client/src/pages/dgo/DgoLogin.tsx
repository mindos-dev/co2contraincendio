/**
 * ─── DGO Login Screen — Tela de Acesso ao Command Center ────────────────────
 * JULY AOG | OPERIS Command Center
 * Estética: Dark Industrial / Terminal Soberano
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";
import { useDgoAuth } from "@/contexts/DgoAuthContext";
import { Shield, Terminal, Eye, EyeOff, Lock, User, Cpu, AlertTriangle } from "lucide-react";

export default function DgoLogin() {
  const { login, isLoading, error, clearError } = useDgoAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  // ── Animação de boot terminal ──────────────────────────────────────────────
  const BOOT_SEQUENCE = [
    "JULY AOG v2.0 — Inicializando...",
    "Carregando módulos de governança...",
    "Verificando Docker Socket: /var/run/docker.sock",
    "Conectando ao Ollama: localhost:11434",
    "Módulo de Segurança: ATIVO",
    "Shell Bridge: WHITELIST CARREGADA",
    "OPERIS Command Center: PRONTO",
    "─────────────────────────────────────",
    "Autenticação necessária para continuar.",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_SEQUENCE.length) {
        setBootLines(prev => [...prev, BOOT_SEQUENCE[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBootDone(true), 400);
      }
    }, 180);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (bootDone) usernameRef.current?.focus();
  }, [bootDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(username.trim(), password);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 font-mono">
      {/* Grid de fundo */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow central */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">
            OPERIS <span className="text-emerald-400">COMMAND CENTER</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1 tracking-widest uppercase">
            Dashboard de Governança e Operação — D.G.O.
          </p>
        </div>

        {/* Terminal de Boot */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6 min-h-[180px]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            <span className="text-xs text-zinc-500 ml-2">july-aog@operis:~$</span>
          </div>
          <div className="space-y-1">
            {bootLines.map((line, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 text-xs shrink-0">
                  {i === bootLines.length - 1 && !bootDone ? "▶" : "✓"}
                </span>
                <span
                  className={`text-xs ${
                    line.includes("ATIVO") || line.includes("PRONTO") || line.includes("CARREGADA")
                      ? "text-emerald-400"
                      : line.includes("─")
                      ? "text-zinc-600"
                      : line.includes("Autenticação")
                      ? "text-amber-400"
                      : "text-zinc-400"
                  }`}
                >
                  {line}
                </span>
              </div>
            ))}
            {!bootDone && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-emerald-400 text-xs animate-pulse">█</span>
              </div>
            )}
          </div>
        </div>

        {/* Formulário de Login */}
        <div
          className={`bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm transition-all duration-500 ${
            bootDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-zinc-300 tracking-wider uppercase">
              Autenticação Soberana
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 tracking-wider uppercase">
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={!bootDone || isLoading}
                  placeholder="operis-admin"
                  autoComplete="username"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 tracking-wider uppercase">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={!bootDone || isLoading}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!bootDone || isLoading || !username || !password}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm tracking-wider"
            >
              {isLoading ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  <span>ACESSAR COMMAND CENTER</span>
                </>
              )}
            </button>
          </form>

          {/* Credenciais padrão */}
          <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400/70 text-center">
              Credenciais padrão: <span className="font-bold text-amber-400">operis-admin</span> / <span className="font-bold text-amber-400">OPERIS@2025!</span>
            </p>
            <p className="text-xs text-zinc-600 text-center mt-1">
              Altere a senha após o primeiro acesso.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-zinc-700">
            JULY AOG — Soberania Digital · Zero Cloud Dependency
          </p>
          <p className="text-xs text-zinc-800 mt-1">
            Acesso restrito · Todas as ações são auditadas
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";

export default function SaasCadastro() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, login } = useSaasAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) setLocation("/app/dashboard");
  }, [isAuthenticated, setLocation]);

  const registerMutation = trpc.saas.auth.register.useMutation({
    onSuccess: (data) => {
      login(data.token, data.user);
      setLocation("/app/dashboard");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    registerMutation.mutate({ name, email, password });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 11px",
    border: "1px solid #D8D8D8",
    background: "#fff",
    fontSize: 14,
    color: "#111111",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#4A4A4A",
    marginBottom: 5,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter',sans-serif" }}>
      {/* Painel esquerdo — branding */}
      <div style={{ width: 400, background: "#111111", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 40px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 14 }}>OP</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em" }}>OPERIS</div>
            <div style={{ color: "#8A8A8A", fontSize: 9, letterSpacing: "0.1em" }}>INSPEÇÃO E LAUDOS INTELIGENTES</div>
          </div>
        </div>
        <div style={{ borderLeft: "3px solid #C8102E", paddingLeft: 16, marginBottom: 32 }}>
          <div style={{ color: "#D8D8D8", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em" }}>CRIE SUA CONTA</div>
          <div style={{ color: "#D8D8D8", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em" }}>GRATUITAMENTE</div>
        </div>
        {[
          "Inspeções digitais com checklist IA",
          "Geração automática de laudos técnicos",
          "Compartilhamento via WhatsApp e e-mail",
          "Conformidade NBR 12615 · NFPA 12 · UL 300",
        ].map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 5, height: 5, background: "#C8102E", flexShrink: 0 }} />
            <span style={{ color: "#8A8A8A", fontSize: 12 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Painel direito — formulário */}
      <div style={{ flex: 1, background: "#F8F8F8", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ width: 28, height: 3, background: "#C8102E", marginBottom: 12 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>
              CRIAR CONTA
            </h1>
            <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>Preencha os dados para acessar o OPERIS</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>NOME COMPLETO</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>E-MAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>SENHA</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>CONFIRMAR SENHA</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repita a senha"
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ background: "#FFF0F0", border: "1px solid #C8102E", padding: "9px 11px", color: "#C8102E", fontSize: 12 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              style={{
                padding: "11px",
                background: "#C8102E",
                color: "#fff",
                border: "none",
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.08em",
                cursor: registerMutation.isPending ? "not-allowed" : "pointer",
                opacity: registerMutation.isPending ? 0.7 : 1,
              }}
            >
              {registerMutation.isPending ? "CRIANDO CONTA..." : "CRIAR CONTA"}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #D8D8D8", textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ color: "#8A8A8A", fontSize: 12 }}>
              Já tem conta?{" "}
              <a href="/app/login" style={{ color: "#C8102E", fontWeight: 600, textDecoration: "none" }}>
                Entrar
              </a>
            </span>
            <a href="/" style={{ color: "#8A8A8A", fontSize: 11, letterSpacing: "0.05em", textDecoration: "none" }}>
              ← Voltar ao site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

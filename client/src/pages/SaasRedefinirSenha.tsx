import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function SaasRedefinirSenha() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extrair token da query string
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const resetMutation = trpc.saas.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setLocation("/app/login"), 3000);
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
    if (!token) {
      setError("Token inválido. Use o link enviado por e-mail.");
      return;
    }
    resetMutation.mutate({ token, password });
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
          <div style={{ color: "#D8D8D8", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em" }}>NOVA SENHA</div>
          <div style={{ color: "#D8D8D8", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em" }}>SEGURA</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: "🔒", text: "Mínimo de 8 caracteres" },
            { icon: "🔑", text: "Use letras, números e símbolos" },
            { icon: "✅", text: "Não reutilize senhas antigas" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{ color: "#8A8A8A", fontSize: 12 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div style={{ flex: 1, background: "#F8F8F8", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ width: 28, height: 3, background: "#C8102E", marginBottom: 12 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>
              REDEFINIR SENHA
            </h1>
            <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>
              Crie uma nova senha para sua conta OPERIS
            </p>
          </div>

          {!token && !success && (
            <div style={{ background: "#FFF0F0", border: "1px solid #C8102E", padding: "16px", color: "#C8102E", fontSize: 13 }}>
              <strong>Link inválido.</strong> Use o link enviado por e-mail para redefinir sua senha.
              <div style={{ marginTop: 12 }}>
                <a href="/app/esqueci-senha" style={{ color: "#C8102E", fontWeight: 600 }}>
                  Solicitar novo link →
                </a>
              </div>
            </div>
          )}

          {success ? (
            <div style={{ background: "#F0FFF4", border: "1px solid #22C55E", padding: "20px 16px", borderRadius: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, background: "#22C55E", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>
                </div>
                <strong style={{ color: "#166534", fontSize: 14 }}>Senha redefinida com sucesso!</strong>
              </div>
              <p style={{ color: "#166534", fontSize: 13, margin: 0 }}>
                Você será redirecionado para o login em instantes...
              </p>
            </div>
          ) : token ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>NOVA SENHA</label>
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
                <label style={labelStyle}>CONFIRMAR NOVA SENHA</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repita a nova senha"
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
                disabled={resetMutation.isPending}
                style={{
                  padding: "11px",
                  background: "#C8102E",
                  color: "#fff",
                  border: "none",
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "0.08em",
                  cursor: resetMutation.isPending ? "not-allowed" : "pointer",
                  opacity: resetMutation.isPending ? 0.7 : 1,
                }}
              >
                {resetMutation.isPending ? "SALVANDO..." : "SALVAR NOVA SENHA"}
              </button>
            </form>
          ) : null}

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #D8D8D8", textAlign: "center" }}>
            <a href="/app/login" style={{ color: "#8A8A8A", fontSize: 11, letterSpacing: "0.05em", textDecoration: "none" }}>
              ← Voltar ao login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

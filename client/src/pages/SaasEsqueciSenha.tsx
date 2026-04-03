import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function SaasEsqueciSenha() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const forgotMutation = trpc.saas.auth.forgotPassword.useMutation({
    onSuccess: () => setSent(true),
    onError: (err) => setError(err.message),
  });

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
          <div style={{ color: "#D8D8D8", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em" }}>RECUPERAÇÃO</div>
          <div style={{ color: "#D8D8D8", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em" }}>DE ACESSO</div>
        </div>
        <p style={{ color: "#8A8A8A", fontSize: 13, lineHeight: 1.6 }}>
          Informe o e-mail cadastrado e enviaremos um link para você criar uma nova senha com segurança.
        </p>
        <p style={{ color: "#555", fontSize: 12, marginTop: 16 }}>
          O link expira em <strong style={{ color: "#C8102E" }}>1 hora</strong> por segurança.
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div style={{ flex: 1, background: "#F8F8F8", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ width: 28, height: 3, background: "#C8102E", marginBottom: 12 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>
              ESQUECI MINHA SENHA
            </h1>
            <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>
              Enviaremos um link de redefinição para seu e-mail
            </p>
          </div>

          {sent ? (
            <div style={{ background: "#F0FFF4", border: "1px solid #22C55E", padding: "20px 16px", borderRadius: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, background: "#22C55E", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>
                </div>
                <strong style={{ color: "#166534", fontSize: 14 }}>E-mail enviado!</strong>
              </div>
              <p style={{ color: "#166534", fontSize: 13, margin: 0 }}>
                Verifique sua caixa de entrada em <strong>{email}</strong>. O link expira em 1 hora.
              </p>
              <p style={{ color: "#166534", fontSize: 12, marginTop: 8 }}>
                Não recebeu? Verifique a pasta de spam ou tente novamente.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError("");
                forgotMutation.mutate({ email });
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#4A4A4A", marginBottom: 5 }}>
                  E-MAIL CADASTRADO
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
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
                disabled={forgotMutation.isPending}
                style={{
                  padding: "11px",
                  background: "#C8102E",
                  color: "#fff",
                  border: "none",
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "0.08em",
                  cursor: forgotMutation.isPending ? "not-allowed" : "pointer",
                  opacity: forgotMutation.isPending ? 0.7 : 1,
                }}
              >
                {forgotMutation.isPending ? "ENVIANDO..." : "ENVIAR LINK DE REDEFINIÇÃO"}
              </button>
            </form>
          )}

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #D8D8D8", textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="/app/login" style={{ color: "#C8102E", fontWeight: 600, fontSize: 12, textDecoration: "none" }}>
              ← Voltar ao login
            </a>
            <a href="/app/cadastro" style={{ color: "#8A8A8A", fontSize: 11, textDecoration: "none" }}>
              Não tem conta? Cadastre-se
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

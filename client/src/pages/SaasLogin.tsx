import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";

// ─── Painel esquerdo — identidade institucional OPERIS ──────────────────────
function BrandPanel() {
  return (
    <div style={{
      width: 480,
      background: "#0D0D0D",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "52px 48px",
      flexShrink: 0,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Linha de acento vertical */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#C8102E" }} />

      {/* Topo — logo */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 52 }}>
          <div style={{
            width: 44, height: 44,
            background: "#C8102E",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: "0.04em" }}>OP</span>
          </div>
          <div>
            <div style={{ color: "#FFFFFF", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "0.12em" }}>OPERIS</div>
            <div style={{ color: "#555555", fontSize: 9, letterSpacing: "0.14em", marginTop: 1 }}>PLATAFORMA DE INSPEÇÃO TÉCNICA</div>
          </div>
        </div>

        {/* Título institucional */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: "#C8102E", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", marginBottom: 10 }}>SISTEMA PROFISSIONAL</div>
          <div style={{ color: "#FFFFFF", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 28, lineHeight: 1.15, letterSpacing: "0.03em" }}>
            GESTÃO DE SISTEMAS<br />DE COMBATE A INCÊNDIO
          </div>
        </div>

        {/* Texto institucional */}
        <div style={{ borderLeft: "2px solid #2A2A2A", paddingLeft: 16, marginBottom: 36 }}>
          <p style={{ color: "#9A9A9A", fontSize: 13, lineHeight: 1.65, margin: 0 }}>
            Plataforma profissional para inspeções técnicas e gestão de sistemas de combate a incêndio.
            Desenvolvida para operações reais de campo, o OPERIS oferece controle completo de equipamentos,
            execução de checklists e emissão de laudos técnicos com rastreabilidade e padronização.
          </p>
        </div>

        {/* Diferenciais técnicos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
          {[
            { label: "Checklists digitais de campo", desc: "Execução guiada com critérios C / NC / NA" },
            { label: "Laudos técnicos rastreáveis", desc: "Geração com assinatura e histórico completo" },
            { label: "Gestão de equipamentos", desc: "QR Code, timeline e alertas de manutenção" },
            { label: "Conformidade normativa", desc: "NBR 12615 · NFPA 12 · UL 300 · ABNT" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 4, height: 4, background: "#C8102E", marginTop: 6, flexShrink: 0 }} />
              <div>
                <div style={{ color: "#D8D8D8", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>{item.label}</div>
                <div style={{ color: "#555555", fontSize: 11, marginTop: 1 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé — selos normativos */}
      <div>
        <div style={{ height: 1, background: "#1E1E1E", marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["NBR 12615", "NFPA 12", "UL 300", "ABNT", "CREA"].map(norm => (
            <div key={norm} style={{
              padding: "3px 8px",
              border: "1px solid #2A2A2A",
              color: "#555555",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}>
              {norm}
            </div>
          ))}
        </div>
        <div style={{ color: "#333333", fontSize: 10, marginTop: 14, letterSpacing: "0.04em" }}>
          CO₂ Contra Incêndio · Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function SaasLogin() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useSaasAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) setLocation("/app/dashboard");
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) return null;

  const loginMutation = trpc.saas.auth.login.useMutation({
    onSuccess: (data) => { login(data.token, data.user); setLocation("/app/dashboard"); },
    onError: (err) => setError(err.message),
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #E0E0E0",
    background: "#FFFFFF",
    fontSize: 14,
    color: "#111111",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter',sans-serif" }}>
      {/* Painel esquerdo — visível apenas em desktop */}
      <div style={{ display: "none" }} className="brand-panel-wrapper">
        <BrandPanel />
      </div>
      <style>{`
        @media (min-width: 900px) {
          .brand-panel-wrapper { display: block !important; }
        }
      `}</style>
      <BrandPanel />

      {/* Painel direito — formulário */}
      <div style={{
        flex: 1,
        background: "#F5F5F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        minHeight: "100vh",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Cabeçalho do formulário */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 24, height: 3, background: "#C8102E" }} />
              <div style={{ width: 8, height: 3, background: "#C8102E", opacity: 0.4 }} />
            </div>
            <h1 style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: "0.05em",
              color: "#111111",
              margin: 0,
            }}>
              ACESSO AO OPERIS
            </h1>
            <p style={{ color: "#888888", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
              Entre com suas credenciais para acessar a plataforma.
            </p>
          </div>

          {/* Formulário */}
          <form
            onSubmit={e => { e.preventDefault(); setError(""); loginMutation.mutate({ email, password }); }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#444444", marginBottom: 6 }}>
                E-MAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#444444", marginBottom: 6 }}>
                SENHA
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{
                background: "#FFF0F0",
                border: "1px solid #C8102E",
                borderLeft: "4px solid #C8102E",
                padding: "10px 12px",
                color: "#C8102E",
                fontSize: 12,
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                padding: "12px",
                background: "#C8102E",
                color: "#fff",
                border: "none",
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.1em",
                cursor: loginMutation.isPending ? "not-allowed" : "pointer",
                opacity: loginMutation.isPending ? 0.7 : 1,
                marginTop: 4,
              }}
            >
              {loginMutation.isPending ? "VERIFICANDO..." : "ENTRAR NO OPERIS"}
            </button>
          </form>

          {/* Links auxiliares */}
          <div style={{ marginTop: 14, textAlign: "right" }}>
            <a href="/app/esqueci-senha" style={{ color: "#C8102E", fontSize: 12, textDecoration: "none", fontWeight: 600 }}>
              Esqueci minha senha
            </a>
          </div>

          <div style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid #E0E0E0",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            <span style={{ color: "#888888", fontSize: 13 }}>
              Não tem conta?{" "}
              <a href="/app/cadastro" style={{ color: "#C8102E", fontWeight: 700, textDecoration: "none" }}>
                Criar conta
              </a>
            </span>
            <a href="/" style={{ color: "#AAAAAA", fontSize: 11, letterSpacing: "0.06em", textDecoration: "none" }}>
              ← Voltar ao site CO₂ Contra Incêndio
            </a>
          </div>

          {/* Nota de segurança */}
          <div style={{
            marginTop: 28,
            padding: "10px 12px",
            background: "#EFEFEF",
            borderLeft: "3px solid #CCCCCC",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}>
            <div style={{ color: "#888888", fontSize: 11, lineHeight: 1.5 }}>
              <strong style={{ color: "#555555", letterSpacing: "0.04em" }}>ACESSO RESTRITO</strong>
              {" "}— Esta plataforma é de uso exclusivo de profissionais habilitados.
              Todas as ações são registradas e auditáveis.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

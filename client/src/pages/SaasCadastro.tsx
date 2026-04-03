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

        {/* Título institucional — específico para cadastro */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: "#C8102E", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", marginBottom: 10 }}>NOVO ACESSO</div>
          <div style={{ color: "#FFFFFF", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 28, lineHeight: 1.15, letterSpacing: "0.03em" }}>
            COMECE A OPERAR<br />COM EFICIÊNCIA
          </div>
        </div>

        {/* Texto institucional */}
        <div style={{ borderLeft: "2px solid #2A2A2A", paddingLeft: 16, marginBottom: 36 }}>
          <p style={{ color: "#9A9A9A", fontSize: 13, lineHeight: 1.65, margin: 0 }}>
            Todas as inspeções seguem critérios técnicos aplicados por profissionais qualificados,
            garantindo confiabilidade, conformidade normativa e segurança operacional em cada
            registro gerado pela plataforma.
          </p>
        </div>

        {/* O que você terá acesso */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: "#444444", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 14 }}>RECURSOS DISPONÍVEIS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Ordens de Serviço", desc: "Criação, acompanhamento e encerramento" },
              { label: "Checklists de campo", desc: "Execução guiada com critérios C / NC / NA" },
              { label: "Laudos técnicos", desc: "Emissão com rastreabilidade e assinatura" },
              { label: "Gestão de equipamentos", desc: "QR Code, histórico e alertas automáticos" },
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
    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres");
      return;
    }
    registerMutation.mutate({ name, email, password });
  };

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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#444444",
    marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter',sans-serif" }}>
      {/* Painel esquerdo */}
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
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Cabeçalho do formulário */}
          <div style={{ marginBottom: 28 }}>
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
              CRIAR CONTA
            </h1>
            <p style={{ color: "#888888", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
              Preencha os dados abaixo para acessar o OPERIS.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>NOME COMPLETO</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Seu nome completo"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>E-MAIL</label>
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
              <label style={labelStyle}>SENHA</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Repita a senha"
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
              disabled={registerMutation.isPending}
              style={{
                padding: "12px",
                background: "#C8102E",
                color: "#fff",
                border: "none",
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.1em",
                cursor: registerMutation.isPending ? "not-allowed" : "pointer",
                opacity: registerMutation.isPending ? 0.7 : 1,
                marginTop: 4,
              }}
            >
              {registerMutation.isPending ? "CRIANDO CONTA..." : "CRIAR CONTA NO OPERIS"}
            </button>
          </form>

          {/* Links auxiliares */}
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
              Já tem conta?{" "}
              <a href="/app/login" style={{ color: "#C8102E", fontWeight: 700, textDecoration: "none" }}>
                Entrar no OPERIS
              </a>
            </span>
            <a href="/" style={{ color: "#AAAAAA", fontSize: 11, letterSpacing: "0.06em", textDecoration: "none" }}>
              ← Voltar ao site CO₂ Contra Incêndio
            </a>
          </div>

          {/* Nota de conformidade */}
          <div style={{
            marginTop: 24,
            padding: "10px 12px",
            background: "#EFEFEF",
            borderLeft: "3px solid #CCCCCC",
          }}>
            <div style={{ color: "#888888", fontSize: 11, lineHeight: 1.5 }}>
              <strong style={{ color: "#555555", letterSpacing: "0.04em" }}>USO PROFISSIONAL</strong>
              {" "}— Ao criar sua conta, você concorda com os{" "}
              <a href="/legal/terms" style={{ color: "#C8102E", textDecoration: "none" }}>Termos de Uso</a>
              {" "}e a{" "}
              <a href="/legal/privacy" style={{ color: "#C8102E", textDecoration: "none" }}>Política de Privacidade</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

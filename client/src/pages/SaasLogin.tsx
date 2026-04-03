import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";

export default function SaasLogin() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useSaasAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Se já autenticado, redirecionar direto para o dashboard
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/app/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) return null;

  const loginMutation = trpc.saas.auth.login.useMutation({
    onSuccess: (data) => { login(data.token, data.user); setLocation("/app/dashboard"); },
    onError: (err) => setError(err.message),
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter',sans-serif" }}>
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
          <div style={{ color: "#D8D8D8", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em" }}>INSPEÇÃO TÉCNICA</div>
          <div style={{ color: "#D8D8D8", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em" }}>COM INTELIGÊNCIA ARTIFICIAL</div>
        </div>
        {["Inspeções digitais com checklist IA", "Geração automática de laudos técnicos", "Compartilhamento via WhatsApp e e-mail", "Conformidade NBR 12615 · NFPA 12 · UL 300"].map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 5, height: 5, background: "#C8102E", flexShrink: 0 }} />
            <span style={{ color: "#8A8A8A", fontSize: 12 }}>{f}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: "#F8F8F8", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ width: 28, height: 3, background: "#C8102E", marginBottom: 12 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>ACESSO AO OPERIS</h1>
            <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>Entre com suas credenciais</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); setError(""); loginMutation.mutate({ email, password }); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#4A4A4A", marginBottom: 5 }}>E-MAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com"
                style={{ width: "100%", padding: "9px 11px", border: "1px solid #D8D8D8", background: "#fff", fontSize: 14, color: "#111111", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#4A4A4A", marginBottom: 5 }}>SENHA</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                style={{ width: "100%", padding: "9px 11px", border: "1px solid #D8D8D8", background: "#fff", fontSize: 14, color: "#111111", outline: "none", boxSizing: "border-box" }} />
            </div>
            {error && <div style={{ background: "#FFF0F0", border: "1px solid #C8102E", padding: "9px 11px", color: "#C8102E", fontSize: 12 }}>{error}</div>}
            <button type="submit" disabled={loginMutation.isPending}
              style={{ padding: "11px", background: "#C8102E", color: "#fff", border: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", cursor: loginMutation.isPending ? "not-allowed" : "pointer", opacity: loginMutation.isPending ? 0.7 : 1 }}>
              {loginMutation.isPending ? "ENTRANDO..." : "ENTRAR"}
            </button>
          </form>
          <div style={{ marginTop: 12, textAlign: "right" }}>
            <a href="/app/esqueci-senha" style={{ color: "#C8102E", fontSize: 12, textDecoration: "none", fontWeight: 600 }}>Esqueci minha senha</a>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #D8D8D8", textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ color: "#8A8A8A", fontSize: 12 }}>Não tem conta?{" "}<a href="/app/cadastro" style={{ color: "#C8102E", fontWeight: 600, textDecoration: "none" }}>Criar conta grátis</a></span>
            <a href="/" style={{ color: "#8A8A8A", fontSize: 11, letterSpacing: "0.05em", textDecoration: "none" }}>← Voltar ao site</a>
          </div>
        </div>
      </div>
    </div>
  );
}

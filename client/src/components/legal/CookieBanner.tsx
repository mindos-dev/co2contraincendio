import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, Cookie, Settings, CheckCircle } from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  performance: boolean;
  analytics: boolean;
}

const CONSENT_KEY = "operis_cookie_consent";
const PREFS_KEY = "operis_cookie_prefs";

function loadConsent(): string | null {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function saveConsent(type: "all" | "custom", prefs: CookiePreferences) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ type, timestamp: Date.now(), prefs }));
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export function getCookiePreferences(): CookiePreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { essential: true, performance: false, analytics: false };
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    performance: false,
    analytics: false,
  });

  useEffect(() => {
    const consent = loadConsent();
    if (!consent) {
      // Delay to avoid flash on first render
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPrefs: CookiePreferences = { essential: true, performance: true, analytics: true };
    saveConsent("all", allPrefs);
    setPrefs(allPrefs);
    setAccepted(true);
    setTimeout(() => setVisible(false), 1500);
  };

  const handleSaveCustom = () => {
    saveConsent("custom", prefs);
    setAccepted(true);
    setTimeout(() => setVisible(false), 1500);
  };

  const handleReject = () => {
    const minPrefs: CookiePreferences = { essential: true, performance: false, analytics: false };
    saveConsent("custom", minPrefs);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "0 16px 16px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          background: "#111827",
          border: "1px solid #1F2937",
          borderRadius: 12,
          boxShadow: "0 -4px 40px rgba(0,0,0,0.5)",
          overflow: "hidden",
          pointerEvents: "all",
          animation: "slideUp 0.4s ease-out",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

        {accepted ? (
          <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 12, animation: "fadeIn 0.3s ease" }}>
            <CheckCircle size={20} color="#10B981" />
            <span style={{ color: "#D1FAE5", fontSize: 14, fontWeight: 500 }}>Preferências salvas. Obrigado!</span>
          </div>
        ) : !configuring ? (
          /* Main banner */
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <Cookie size={22} color="#C8102E" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: "#F9FAFB", fontSize: 15 }}>Cookies e Privacidade</span>
                  <button
                    onClick={handleReject}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 4 }}
                    aria-label="Fechar e recusar cookies opcionais"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 16px", lineHeight: 1.6 }}>
                  Utilizamos cookies essenciais para o funcionamento da plataforma e, com seu consentimento, cookies de analytics para melhorar sua experiência. Seus dados são protegidos conforme a{" "}
                  <Link href="/legal/privacy" style={{ color: "#C8102E", textDecoration: "none" }}>LGPD</Link>.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={handleAcceptAll}
                    style={{
                      background: "#C8102E", color: "#fff", border: "none", borderRadius: 8,
                      padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    Aceitar tudo
                  </button>
                  <button
                    onClick={() => setConfiguring(true)}
                    style={{
                      background: "transparent", color: "#9CA3AF", border: "1px solid #374151",
                      borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 500,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <Settings size={14} />
                    Configurar
                  </button>
                  <Link
                    href="/legal/cookies"
                    style={{ color: "#6B7280", fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", padding: "10px 8px" }}
                  >
                    Saiba mais →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Configuration panel */
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: "#F9FAFB", fontSize: 15 }}>Configurar cookies</span>
              <button
                onClick={() => setConfiguring(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {[
                {
                  key: "essential" as const,
                  label: "Essenciais",
                  desc: "Necessários para login, sessão e segurança. Não podem ser desativados.",
                  locked: true,
                },
                {
                  key: "performance" as const,
                  label: "Desempenho",
                  desc: "Ajudam a identificar e corrigir problemas de performance na plataforma.",
                  locked: false,
                },
                {
                  key: "analytics" as const,
                  label: "Analytics",
                  desc: "Métricas de uso anonimizadas para melhorar o OPERIS. Sem identificação pessoal.",
                  locked: false,
                },
              ].map(item => (
                <div
                  key={item.key}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#1F2937", borderRadius: 8, padding: "12px 14px",
                  }}
                >
                  <div style={{ flex: 1, paddingRight: 12 }}>
                    <div style={{ fontWeight: 600, color: "#F9FAFB", fontSize: 13, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {item.locked ? (
                      <span style={{ fontSize: 11, color: "#6B7280", background: "#374151", padding: "3px 8px", borderRadius: 4 }}>Sempre ativo</span>
                    ) : (
                      <button
                        onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                        style={{
                          width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                          background: prefs[item.key] ? "#C8102E" : "#374151",
                          position: "relative", transition: "background 0.2s",
                        }}
                        aria-label={`${prefs[item.key] ? "Desativar" : "Ativar"} cookies de ${item.label}`}
                        role="switch"
                        aria-checked={prefs[item.key]}
                      >
                        <span style={{
                          position: "absolute", top: 3, left: prefs[item.key] ? 23 : 3,
                          width: 18, height: 18, borderRadius: "50%", background: "#fff",
                          transition: "left 0.2s",
                        }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleSaveCustom}
                style={{
                  flex: 1, background: "#C8102E", color: "#fff", border: "none",
                  borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Salvar preferências
              </button>
              <button
                onClick={handleAcceptAll}
                style={{
                  flex: 1, background: "transparent", color: "#9CA3AF", border: "1px solid #374151",
                  borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer",
                }}
              >
                Aceitar tudo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

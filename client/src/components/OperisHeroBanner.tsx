/**
 * OperisHeroBanner
 * Banner de destaque para o módulo OPERIS IA — exibido na Home
 * Visual: fundo industrial com overlay escuro, badge pulsante, KPIs e CTA
 */

import { Link } from "wouter";

const BG_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/operis-banner-bg-X9xf844jLRZBjSckVPN2xZ.webp";

const features = [
  { icon: "🤖", label: "IA Generativa", desc: "Laudos redigidos automaticamente com análise de risco" },
  { icon: "📋", label: "Inspeções Digitais", desc: "Formulários inteligentes com checklist NBR/NFPA" },
  { icon: "📊", label: "Painel Admin", desc: "Visão 360° de técnicos, laudos e não-conformidades" },
  { icon: "🔗", label: "Compartilhamento", desc: "Envio de laudos por WhatsApp e e-mail em 1 clique" },
];

export default function OperisHeroBanner() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#0a0a0a",
        minHeight: "520px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          opacity: 0.38,
        }}
      />

      {/* Gradient overlay — left dark, right transparent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Red accent line top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #C8102E 0%, #ff4d6d 50%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: "4rem",
          paddingBottom: "4rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "center",
        }}
      >
        {/* Left — headline */}
        <div>
          {/* Badge pulsante */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(200,16,46,0.15)",
              border: "1px solid rgba(200,16,46,0.5)",
              borderRadius: "2px",
              padding: "0.3rem 0.85rem",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#C8102E",
                display: "inline-block",
                animation: "pulse-red 1.6s ease-in-out infinite",
              }}
            />
            <span
              style={{
                color: "#ff6b6b",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              Plataforma Exclusiva · Inteligência Artificial
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 4.5vw, 3.75rem)",
              lineHeight: 1.0,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              marginBottom: "0.5rem",
            }}
          >
            OPERIS
            <span style={{ color: "#C8102E" }}> IA</span>
          </h2>

          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "clamp(1rem, 2vw, 1.35rem)",
              color: "#b0b0b0",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "1.25rem",
            }}
          >
            Sistema Inteligente de Inspeção e Laudos
          </p>

          <p
            style={{
              color: "#9a9a9a",
              fontSize: "0.9375rem",
              lineHeight: 1.65,
              maxWidth: "480px",
              marginBottom: "2rem",
            }}
          >
            Automatize inspeções de sistemas de combate a incêndio com inteligência artificial.
            Gere laudos técnicos completos, gerencie técnicos e compartilhe relatórios com clientes
            em segundos — tudo em conformidade com NBR 12615 e NFPA 12.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/app/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#C8102E",
                color: "#fff",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.9375rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "0.75rem 1.75rem",
                border: "none",
                cursor: "pointer",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#a50d26")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#C8102E")}
            >
              🛡️ Acessar Plataforma
            </Link>
            <a
              href="#operis-features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "transparent",
                color: "#fff",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.9375rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "0.75rem 1.75rem",
                border: "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer",
                textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#C8102E";
                (e.currentTarget as HTMLElement).style.color = "#ff6b6b";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)";
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
            >
              Ver Funcionalidades ↓
            </a>
          </div>
        </div>

        {/* Right — feature cards */}
        <div
          id="operis-features"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          {features.map((f) => (
            <div
              key={f.label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(200,16,46,0.2)",
                borderRadius: "2px",
                padding: "1.25rem",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,16,46,0.6)";
                (e.currentTarget as HTMLElement).style.background = "rgba(200,16,46,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,16,46,0.2)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{f.icon}</div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "0.35rem",
                }}
              >
                {f.label}
              </div>
              <div style={{ color: "#7a7a7a", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80px",
          background: "linear-gradient(to bottom, transparent, #f5f5f5)",
          pointerEvents: "none",
        }}
      />

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-red {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
        @media (max-width: 900px) {
          .operis-banner-grid { grid-template-columns: 1fr !important; }
          .operis-banner-cards { display: none !important; }
        }
      `}</style>
    </section>
  );
}

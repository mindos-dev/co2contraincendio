/**
 * OperisHeroBanner
 * Banner de destaque para o módulo OPERIS IA — exibido na Home
 * Integra a OperisLogo institucional alinhada ao padrão do site
 */

import { Link } from "wouter";
import OperisLogo from "./OperisLogo";

const BG_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/operis-banner-bg-X9xf844jLRZBjSckVPN2xZ.webp";

const features = [
  {
    label: "IA Generativa",
    desc: "Laudos redigidos automaticamente com análise de risco R1–R5",
  },
  {
    label: "Inspeções Digitais",
    desc: "Formulários inteligentes com checklist NBR 12615 e NFPA 12",
  },
  {
    label: "Painel Admin 360°",
    desc: "Gestão de técnicos, laudos e não-conformidades em tempo real",
  },
  {
    label: "Compartilhamento",
    desc: "Envio de laudos por WhatsApp e e-mail em 1 clique",
  },
];

export default function OperisHeroBanner() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#060606",
        minHeight: "560px",
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
          opacity: 0.3,
        }}
      />

      {/* Gradient overlay — esquerda escura, direita semi-transparente */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(108deg, rgba(6,6,6,0.98) 0%, rgba(6,6,6,0.88) 50%, rgba(6,6,6,0.55) 100%)",
        }}
      />

      {/* Linha vermelha topo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #C8102E 0%, #ff4d6d 40%, transparent 100%)",
        }}
      />

      {/* Grade decorativa sutil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(200,16,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Conteúdo */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: "4.5rem",
          paddingBottom: "4.5rem",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "3.5rem",
          alignItems: "center",
        }}
      >
        {/* ── Coluna esquerda: logo + copy + CTAs ── */}
        <div>
          {/* LOGO OPERIS IA */}
          <OperisLogo size="lg" dark animate style={{ marginBottom: "2rem" }} />

          {/* Descrição */}
          <p
            style={{
              color: "rgba(255,255,255,0.62)",
              fontSize: "0.9375rem",
              lineHeight: 1.7,
              maxWidth: "500px",
              marginBottom: "2.25rem",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Automatize inspeções de sistemas de combate a incêndio com inteligência artificial.
            Gere laudos técnicos completos, gerencie técnicos e compartilhe relatórios com clientes
            — tudo em conformidade com NBR 12615 e NFPA 12.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
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
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                padding: "0.8rem 2rem",
                textDecoration: "none",
                transition: "background 0.2s, box-shadow 0.2s",
                boxShadow: "0 0 0 rgba(200,16,46,0)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "#a50d26";
                el.style.boxShadow = "0 4px 24px rgba(200,16,46,0.4)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "#C8102E";
                el.style.boxShadow = "0 0 0 rgba(200,16,46,0)";
              }}
            >
              ▶ Acessar OPERIS
            </Link>

            <a
              href="#operis-features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "transparent",
                color: "rgba(255,255,255,0.75)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.9375rem",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                padding: "0.8rem 1.75rem",
                border: "1px solid rgba(255,255,255,0.18)",
                textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#C8102E";
                el.style.color = "#ff6b6b";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(255,255,255,0.18)";
                el.style.color = "rgba(255,255,255,0.75)";
              }}
            >
              Ver Funcionalidades ↓
            </a>
          </div>
        </div>

        {/* ── Coluna direita: cards de funcionalidades ── */}
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
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(200,16,46,0.18)",
                padding: "1.35rem 1.1rem",
                transition: "border-color 0.2s, background 0.2s, transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(200,16,46,0.55)";
                el.style.background = "rgba(200,16,46,0.06)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(200,16,46,0.18)";
                el.style.background = "rgba(255,255,255,0.03)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Marcador institucional — linha vermelha */}
              <div
                style={{
                  width: "28px",
                  height: "3px",
                  background: "#C8102E",
                  marginBottom: "0.75rem",
                }}
              />
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.4rem",
                }}
              >
                {f.label}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "0.8rem",
                  lineHeight: 1.55,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fade inferior para a próxima seção */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "90px",
          background: "linear-gradient(to bottom, transparent, #f4f4f4)",
          pointerEvents: "none",
        }}
      />

      {/* Responsivo mobile */}
      <style>{`
        @media (max-width: 860px) {
          .operis-banner-container {
            grid-template-columns: 1fr !important;
          }
          .operis-banner-cards {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}

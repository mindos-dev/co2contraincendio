/**
 * OperisLogo — Identidade visual OPERIS IA
 * Logo tipográfica ultra-futurista, CSS puro, sem imagens.
 * Padrão: Barlow Condensed · Vermelho #C8102E · Preto · Geométrico
 *
 * Props:
 *   size    — "sm" | "md" | "lg" | "xl"  (default: "md")
 *   dark    — true = fundo escuro (padrão banner), false = fundo claro
 *   animate — true = ativa animações (padrão true)
 */

import { CSSProperties } from "react";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface OperisLogoProps {
  size?: LogoSize;
  dark?: boolean;
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
}

const SCALE: Record<LogoSize, number> = { sm: 0.6, md: 1, lg: 1.5, xl: 2.2 };

export default function OperisLogo({
  size = "md",
  dark = true,
  animate = true,
  className,
  style,
}: OperisLogoProps) {
  const s = SCALE[size];
  const fg = dark ? "#fff" : "#0a0a0a";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const red = "#C8102E";
  const redGlow = dark ? "rgba(200,16,46,0.35)" : "rgba(200,16,46,0.15)";

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0,
        userSelect: "none",
        ...style,
      }}
    >
      {/* ── Linha superior: indicador de sistema ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: `${6 * s}px`,
          marginBottom: `${4 * s}px`,
        }}
      >
        {/* Dot pulsante */}
        <span
          style={{
            width: `${7 * s}px`,
            height: `${7 * s}px`,
            borderRadius: "50%",
            background: red,
            display: "inline-block",
            boxShadow: animate ? `0 0 ${8 * s}px ${red}` : "none",
            animation: animate ? "operis-pulse 1.8s ease-in-out infinite" : "none",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
            fontWeight: 700,
            fontSize: `${9 * s}px`,
            letterSpacing: `${0.18 * s}em`,
            textTransform: "uppercase",
            color: fgMuted,
          }}
        >
          Sistema Inteligente · NBR 12615 · NFPA 12
        </span>
      </div>

      {/* ── Wordmark principal ── */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: `${3 * s}px` }}>
        {/* Bloco vermelho — símbolo O */}
        <div
          style={{
            width: `${44 * s}px`,
            height: `${44 * s}px`,
            background: red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            boxShadow: animate ? `0 0 ${20 * s}px ${redGlow}` : "none",
          }}
        >
          {/* Corte diagonal interno */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, transparent 60%, rgba(0,0,0,0.25) 100%)",
            }}
          />
          {/* Letra O */}
          <span
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
              fontWeight: 900,
              fontSize: `${28 * s}px`,
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              position: "relative",
              zIndex: 1,
            }}
          >
            O
          </span>
          {/* Linha de corte decorativa */}
          <div
            style={{
              position: "absolute",
              bottom: `${5 * s}px`,
              left: `${5 * s}px`,
              right: `${5 * s}px`,
              height: `${1.5 * s}px`,
              background: "rgba(255,255,255,0.3)",
            }}
          />
        </div>

        {/* Texto PERIS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <span
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
              fontWeight: 900,
              fontSize: `${42 * s}px`,
              lineHeight: 0.92,
              letterSpacing: `${0.01 * s}em`,
              textTransform: "uppercase",
              color: fg,
              display: "block",
            }}
          >
            PERIS
          </span>
          {/* Linha decorativa abaixo do texto */}
          <div
            style={{
              height: `${2 * s}px`,
              background: `linear-gradient(90deg, ${red} 0%, ${red} 40%, transparent 100%)`,
              marginTop: `${3 * s}px`,
            }}
          />
        </div>

        {/* Badge IA */}
        <div
          style={{
            marginBottom: `${6 * s}px`,
            marginLeft: `${4 * s}px`,
            background: "transparent",
            border: `${1.5 * s}px solid ${red}`,
            padding: `${2 * s}px ${5 * s}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
              fontWeight: 900,
              fontSize: `${13 * s}px`,
              letterSpacing: `${0.1 * s}em`,
              color: red,
              lineHeight: 1,
            }}
          >
            IA
          </span>
        </div>
      </div>

      {/* ── Subtexto persuasivo ── */}
      <div
        style={{
          marginTop: `${8 * s}px`,
          display: "flex",
          alignItems: "center",
          gap: `${8 * s}px`,
        }}
      >
        {/* Linha separadora */}
        <div
          style={{
            width: `${44 * s}px`,
            height: `${1 * s}px`,
            background: `linear-gradient(90deg, ${red}, transparent)`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: `${10.5 * s}px`,
            letterSpacing: `${0.12 * s}em`,
            textTransform: "uppercase",
            color: fgMuted,
            whiteSpace: "nowrap",
          }}
        >
          Inspeção. Laudo. Conformidade. Em segundos.
        </span>
      </div>

      {/* Animações */}
      <style>{`
        @keyframes operis-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 ${8 * s}px ${red}; }
          50%       { opacity: 0.5; box-shadow: 0 0 ${18 * s}px ${red}, 0 0 ${30 * s}px rgba(200,16,46,0.2); }
        }
      `}</style>
    </div>
  );
}

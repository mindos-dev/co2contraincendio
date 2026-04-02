/**
 * OperisLogo — Identidade visual OPERIS IA
 * Padrão institucional alinhado ao site CO2 Contra Incêndio.
 * Mesmo estilo da logo principal: círculo com sigla + nome + subtexto.
 * CSS puro, sem imagens, sem efeitos futuristas.
 *
 * Props:
 *   size    — "sm" | "md" | "lg"  (default: "md")
 *   dark    — true = texto branco (fundo escuro), false = texto escuro (fundo claro)
 */

import { CSSProperties } from "react";

type LogoSize = "sm" | "md" | "lg";

interface OperisLogoProps {
  size?: LogoSize;
  dark?: boolean;
  /** @deprecated ignorado — sem animações no padrão institucional */
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
}

const SIZES: Record<LogoSize, { circle: number; sigla: number; name: number; sub: number; gap: number }> = {
  sm: { circle: 28, sigla: 10, name: 12, sub: 8,  gap: 8  },
  md: { circle: 40, sigla: 14, name: 16, sub: 9,  gap: 10 },
  lg: { circle: 56, sigla: 20, name: 22, sub: 11, gap: 14 },
};

export default function OperisLogo({
  size = "md",
  dark = true,
  className,
  style,
}: OperisLogoProps) {
  const t = SIZES[size];
  const textColor   = dark ? "#ffffff" : "#111111";
  const subColor    = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const red         = "#C8102E";

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${t.gap}px`,
        userSelect: "none",
        ...style,
      }}
    >
      {/* Ícone: círculo com borda vermelha e sigla "OP" — mesmo padrão do C2 */}
      <div
        style={{
          width:  `${t.circle}px`,
          height: `${t.circle}px`,
          borderRadius: "50%",
          border: `2px solid ${red}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "transparent",
        }}
      >
        <span
          style={{
            color: red,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: `${t.sigla}px`,
            lineHeight: 1,
            letterSpacing: "-0.01em",
          }}
        >
          OP
        </span>
      </div>

      {/* Texto: nome + subtexto */}
      <div>
        <div
          style={{
            color: textColor,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: `${t.name}px`,
            lineHeight: 1.1,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          OPERIS{" "}
          <span style={{ color: red }}>IA</span>
        </div>
        <div
          style={{
            color: subColor,
            fontSize: `${t.sub}px`,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 500,
            marginTop: "1px",
          }}
        >
          Conformidade que protege. Tecnologia que comprova.
        </div>
      </div>
    </div>
  );
}

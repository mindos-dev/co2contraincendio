/**
 * OperisLogo — Identidade visual OPERIS IA
 *
 * Design institucional, criativo e profissional.
 * Padrão UL — alinhado ao site CO2 Contra Incêndio.
 * CSS puro, sem imagens, sem efeitos futuristas.
 *
 * Conceito: escudo geométrico (proteção) + tipografia sólida Barlow Condensed.
 * O escudo remete diretamente à proteção contra incêndio e à certificação UL.
 *
 * Props:
 *   size    — "xs" | "sm" | "md" | "lg"  (default: "md")
 *   dark    — true = fundo escuro (texto branco), false = fundo claro (texto escuro)
 *   inline  — true = versão compacta horizontal para navbar/rodapé
 */

import { CSSProperties } from "react";

type LogoSize = "xs" | "sm" | "md" | "lg";

interface OperisLogoProps {
  size?: LogoSize;
  dark?: boolean;
  inline?: boolean;
  /** @deprecated sem animações no padrão institucional */
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
}

const SIZES: Record<LogoSize, {
  shield: number;
  shieldInner: number;
  siglaSize: number;
  nameSize: number;
  subSize: number;
  gap: number;
  badgeSize: number;
}> = {
  xs: { shield: 22, shieldInner: 14, siglaSize: 8,  nameSize: 11, subSize: 7,  gap: 6,  badgeSize: 7  },
  sm: { shield: 30, shieldInner: 19, siglaSize: 11, nameSize: 13, subSize: 8,  gap: 8,  badgeSize: 8  },
  md: { shield: 42, shieldInner: 26, siglaSize: 15, nameSize: 18, subSize: 9,  gap: 10, badgeSize: 10 },
  lg: { shield: 58, shieldInner: 36, siglaSize: 21, nameSize: 26, subSize: 11, gap: 14, badgeSize: 13 },
};

export default function OperisLogo({
  size = "md",
  dark = true,
  inline = false,
  className,
  style,
}: OperisLogoProps) {
  const t = SIZES[size];
  const red      = "#C8102E";
  const textMain = dark ? "#ffffff" : "#111111";
  const textSub  = dark ? "rgba(255,255,255,0.48)" : "rgba(0,0,0,0.42)";
  const borderC  = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";

  /**
   * Escudo geométrico SVG — forma de escudo clássico (hexágono com ponta inferior).
   * Representa proteção, certificação e segurança — linguagem UL/FM.
   */
  const ShieldIcon = () => (
    <svg
      width={t.shield}
      height={t.shield * 1.1}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Escudo preenchido vermelho */}
      <path
        d="M50 4 L92 22 L92 58 C92 80 72 98 50 106 C28 98 8 80 8 58 L8 22 Z"
        fill={red}
      />
      {/* Borda interna sutil */}
      <path
        d="M50 12 L85 27 L85 57 C85 76 68 92 50 99 C32 92 15 76 15 57 L15 27 Z"
        fill="none"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="1.5"
      />
      {/* Sigla OP em branco */}
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontFamily="'Barlow Condensed', 'Barlow', sans-serif"
        fontWeight="900"
        fontSize={t.shieldInner}
        fill="#ffffff"
        letterSpacing="-0.5"
      >
        OP
      </text>
    </svg>
  );

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: inline ? "row" : "row",
        alignItems: "center",
        gap: `${t.gap}px`,
        userSelect: "none",
        ...style,
      }}
    >
      {/* Ícone escudo */}
      <ShieldIcon />

      {/* Texto */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Nome + badge IA */}
        <div style={{ display: "flex", alignItems: "baseline", gap: `${t.gap * 0.5}px` }}>
          <span
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
              fontWeight: 800,
              fontSize: `${t.nameSize}px`,
              color: textMain,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            OPERIS
          </span>
          {/* Badge IA — pequeno, discreto, institucional */}
          <span
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
              fontWeight: 700,
              fontSize: `${t.badgeSize}px`,
              color: red,
              letterSpacing: "0.06em",
              border: `1px solid ${red}`,
              padding: `1px ${t.badgeSize * 0.4}px`,
              lineHeight: 1.4,
              textTransform: "uppercase",
            }}
          >
            IA
          </span>
        </div>

        {/* Linha separadora vermelha */}
        <div
          style={{
            height: "2px",
            background: red,
            marginTop: "3px",
            marginBottom: "3px",
            width: "100%",
          }}
        />

        {/* Subtexto / slogan */}
        <span
          style={{
            fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: `${t.subSize}px`,
            color: textSub,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          Conformidade que protege. Tecnologia que comprova.
        </span>
      </div>
    </div>
  );
}

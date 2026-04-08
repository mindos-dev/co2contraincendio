/**
 * CO₂ Contra Incêndio — Design Tokens
 * Inspiração: UL Solutions (ul.com)
 * Identidade: institucional, técnica, credibilidade, conversão
 */

export const CO2_TOKENS = {
  // ─── Paleta Principal ──────────────────────────────────────────────────────
  colors: {
    // Vermelho UL — ação, urgência, marca
    red: {
      50:  "#FFF1F1",
      100: "#FFE0E0",
      200: "#FFC5C5",
      300: "#FF9A9A",
      400: "#FF6060",
      500: "#E8192C", // UL Red principal
      600: "#C8102E", // UL Red escuro (marca)
      700: "#A30D24",
      800: "#870F1F",
      900: "#6B0F1A",
    },
    // Cinza técnico — textos, bordas, fundos
    gray: {
      50:  "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
    // Branco e preto
    white: "#FFFFFF",
    black: "#000000",
    // Azul institucional (links, destaques secundários)
    blue: {
      600: "#1D4ED8",
      700: "#1E40AF",
    },
    // Verde (sucesso, certificação)
    green: {
      500: "#16A34A",
      600: "#15803D",
    },
  },

  // ─── Tipografia ────────────────────────────────────────────────────────────
  typography: {
    fontFamily: {
      heading: "'Barlow Condensed', 'Arial Narrow', sans-serif",
      body:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
      mono:    "'JetBrains Mono', 'Courier New', monospace",
    },
    fontSize: {
      xs:   "0.75rem",   // 12px
      sm:   "0.875rem",  // 14px
      base: "1rem",      // 16px
      lg:   "1.125rem",  // 18px
      xl:   "1.25rem",   // 20px
      "2xl":"1.5rem",    // 24px
      "3xl":"1.875rem",  // 30px
      "4xl":"2.25rem",   // 36px
      "5xl":"3rem",      // 48px
    },
    fontWeight: {
      normal:    "400",
      medium:    "500",
      semibold:  "600",
      bold:      "700",
      extrabold: "800",
    },
    lineHeight: {
      tight:  "1.25",
      snug:   "1.375",
      normal: "1.5",
      relaxed:"1.625",
    },
  },

  // ─── Espaçamento ───────────────────────────────────────────────────────────
  spacing: {
    xs:  "0.25rem",  // 4px
    sm:  "0.5rem",   // 8px
    md:  "1rem",     // 16px
    lg:  "1.5rem",   // 24px
    xl:  "2rem",     // 32px
    "2xl":"3rem",    // 48px
    "3xl":"4rem",    // 64px
  },

  // ─── Bordas ────────────────────────────────────────────────────────────────
  borderRadius: {
    none: "0",
    sm:   "0.125rem",
    md:   "0.25rem",
    lg:   "0.5rem",
    xl:   "0.75rem",
    full: "9999px",
  },

  // ─── Sombras ───────────────────────────────────────────────────────────────
  shadows: {
    sm:  "0 1px 2px 0 rgba(0,0,0,0.05)",
    md:  "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    lg:  "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    xl:  "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    red: "0 4px 14px 0 rgba(200,16,46,0.3)",
  },

  // ─── Transições ────────────────────────────────────────────────────────────
  transitions: {
    fast:   "150ms ease",
    normal: "250ms ease",
    slow:   "400ms ease",
  },
} as const;

export type CO2Colors = typeof CO2_TOKENS.colors;

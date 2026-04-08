/**
 * OPERIS — Design System
 * Inspiração: Procore (procore.com) + Autodesk Construction Cloud
 * Identidade: SaaS profissional, engenharia, dados técnicos, precisão
 */

export const OPERIS_DS = {
  // ─── Paleta Principal ──────────────────────────────────────────────────────
  colors: {
    // Azul escuro — base do app, sidebar, headers
    navy: {
      50:  "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E3A5F", // Procore blue
      900: "#1B2A4A", // OPERIS navy principal
      950: "#0D1117", // Fundo escuro máximo
    },
    // Cinza técnico — textos, bordas, superfícies
    slate: {
      50:  "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
    },
    // Azul accent — CTAs, links, destaques
    accent: {
      400: "#38BDF8",
      500: "#0EA5E9",
      600: "#0284C7",
    },
    // Verde — sucesso, aprovado, conforme
    success: {
      400: "#4ADE80",
      500: "#22C55E",
      600: "#16A34A",
    },
    // Amarelo — alerta, atenção, pendente
    warning: {
      400: "#FACC15",
      500: "#EAB308",
      600: "#CA8A04",
    },
    // Vermelho — erro, crítico, vencido
    danger: {
      400: "#F87171",
      500: "#EF4444",
      600: "#DC2626",
    },
    // Branco e preto
    white: "#FFFFFF",
    black: "#000000",
  },

  // ─── Superfícies (backgrounds) ─────────────────────────────────────────────
  surfaces: {
    app:      "#0D1117", // fundo geral do app
    sidebar:  "#111827", // sidebar
    card:     "#1A2332", // cards
    elevated: "#1E293B", // modais, dropdowns
    border:   "#2D3748", // bordas
    hover:    "#243044", // hover em linhas/itens
    muted:    "#374151", // campos desabilitados
  },

  // ─── Tipografia ────────────────────────────────────────────────────────────
  typography: {
    fontFamily: {
      heading: "'Inter', 'Segoe UI', sans-serif",
      body:    "'Inter', 'Segoe UI', sans-serif",
      mono:    "'JetBrains Mono', 'Fira Code', monospace",
      label:   "'Barlow Condensed', 'Arial Narrow', sans-serif",
    },
    fontSize: {
      xs:   "0.6875rem", // 11px — labels técnicos
      sm:   "0.8125rem", // 13px — dados secundários
      base: "0.875rem",  // 14px — corpo principal
      md:   "1rem",      // 16px — títulos de seção
      lg:   "1.125rem",  // 18px
      xl:   "1.25rem",   // 20px
      "2xl":"1.5rem",    // 24px
      "3xl":"1.875rem",  // 30px
    },
    fontWeight: {
      normal:   "400",
      medium:   "500",
      semibold: "600",
      bold:     "700",
    },
    letterSpacing: {
      tight:  "-0.01em",
      normal: "0",
      wide:   "0.025em",
      wider:  "0.05em",
      widest: "0.1em",
    },
  },

  // ─── Componentes — Botões ──────────────────────────────────────────────────
  button: {
    primary: {
      bg:         "#2563EB",
      bgHover:    "#1D4ED8",
      text:       "#FFFFFF",
      border:     "transparent",
      shadow:     "0 1px 3px rgba(37,99,235,0.3)",
    },
    secondary: {
      bg:         "#1E293B",
      bgHover:    "#243044",
      text:       "#E2E8F0",
      border:     "#334155",
    },
    outline: {
      bg:         "transparent",
      bgHover:    "#1E293B",
      text:       "#94A3B8",
      border:     "#334155",
    },
    danger: {
      bg:         "#DC2626",
      bgHover:    "#B91C1C",
      text:       "#FFFFFF",
      border:     "transparent",
    },
    ghost: {
      bg:         "transparent",
      bgHover:    "#1E293B",
      text:       "#64748B",
      border:     "transparent",
    },
  },

  // ─── Componentes — Tabelas ─────────────────────────────────────────────────
  table: {
    header: {
      bg:     "#111827",
      text:   "#94A3B8",
      border: "#1E293B",
    },
    row: {
      bg:       "transparent",
      bgHover:  "#1A2332",
      bgAlt:    "#0F172A",
      text:     "#E2E8F0",
      border:   "#1E293B",
    },
  },

  // ─── Componentes — Cards ───────────────────────────────────────────────────
  card: {
    bg:          "#1A2332",
    bgHover:     "#1E293B",
    border:      "#2D3748",
    borderAccent:"#2563EB",
    shadow:      "0 4px 6px -1px rgba(0,0,0,0.3)",
    radius:      "0.5rem",
  },

  // ─── Componentes — Sidebar ─────────────────────────────────────────────────
  sidebar: {
    bg:           "#111827",
    border:       "#1E293B",
    item: {
      text:       "#94A3B8",
      textHover:  "#E2E8F0",
      bgHover:    "#1A2332",
      bgActive:   "#1E3A5F",
      textActive: "#FFFFFF",
      accent:     "#2563EB",
    },
    section: {
      text:       "#475569",
      fontSize:   "0.6875rem",
    },
  },

  // ─── Componentes — Inputs ──────────────────────────────────────────────────
  input: {
    bg:          "#0F172A",
    bgFocus:     "#111827",
    border:      "#334155",
    borderFocus: "#2563EB",
    text:        "#E2E8F0",
    placeholder: "#475569",
    radius:      "0.375rem",
  },

  // ─── Badges / Status ───────────────────────────────────────────────────────
  badge: {
    active:   { bg: "#14532D", text: "#4ADE80", border: "#166534" },
    warning:  { bg: "#713F12", text: "#FACC15", border: "#854D0E" },
    danger:   { bg: "#7F1D1D", text: "#F87171", border: "#991B1B" },
    info:     { bg: "#1E3A5F", text: "#60A5FA", border: "#1D4ED8" },
    neutral:  { bg: "#1E293B", text: "#94A3B8", border: "#334155" },
  },

  // ─── Gráficos ──────────────────────────────────────────────────────────────
  chart: {
    colors: [
      "#2563EB", // azul principal
      "#0EA5E9", // azul claro
      "#22C55E", // verde
      "#EAB308", // amarelo
      "#EF4444", // vermelho
      "#8B5CF6", // roxo
      "#F97316", // laranja
      "#06B6D4", // ciano
    ],
    grid:   "#1E293B",
    axis:   "#475569",
    tooltip:{
      bg:     "#1E293B",
      border: "#334155",
      text:   "#E2E8F0",
    },
  },

  // ─── Transições ────────────────────────────────────────────────────────────
  transitions: {
    fast:   "120ms ease",
    normal: "200ms ease",
    slow:   "350ms ease",
  },

  // ─── Breakpoints ───────────────────────────────────────────────────────────
  breakpoints: {
    sm:  "640px",
    md:  "768px",
    lg:  "1024px",
    xl:  "1280px",
    "2xl":"1536px",
  },
} as const;

export type OperisColors = typeof OPERIS_DS.colors;
export type OperisButton = typeof OPERIS_DS.button;

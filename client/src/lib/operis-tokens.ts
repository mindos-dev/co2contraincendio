/**
 * OPERIS Engineering Intelligence Platform
 * Design Tokens — Industrial Dark Theme
 * Inspired by UL Solutions + Procore visual language
 */

export const OPERIS_COLORS = {
  // Backgrounds
  bg:        "#0B0F19",
  bgCard:    "#111827",
  bgSurface: "#1A2235",
  bgHover:   "#1E2A3A",
  bgBorder:  "#1F2D40",

  // Primary — Electric Blue (engineering authority)
  primary:        "#2563EB",
  primaryHover:   "#1D4ED8",
  primaryMuted:   "rgba(37,99,235,0.15)",
  primaryBorder:  "rgba(37,99,235,0.35)",

  // Status
  success:  "#22C55E",
  warning:  "#F59E0B",
  danger:   "#EF4444",
  info:     "#38BDF8",

  // Text
  textPrimary:   "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted:     "#64748B",
  textDisabled:  "#475569",

  // Borders
  border:       "#1F2D40",
  borderLight:  "#263347",
  borderFocus:  "#2563EB",
} as const;

export const OPERIS_FONTS = {
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  sans: "'Inter', system-ui, sans-serif",
  condensed: "'Barlow Condensed', 'Inter', sans-serif",
} as const;

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  open:        { bg: "rgba(37,99,235,0.12)",  text: "#60A5FA", border: "rgba(37,99,235,0.3)",  label: "Aberto" },
  in_progress: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)", label: "Em Andamento" },
  waiting:     { bg: "rgba(148,163,184,0.12)",text: "#94A3B8", border: "rgba(148,163,184,0.3)",label: "Aguardando" },
  completed:   { bg: "rgba(34,197,94,0.12)",  text: "#4ADE80", border: "rgba(34,197,94,0.3)",  label: "Concluído" },
  billed:      { bg: "rgba(168,85,247,0.12)", text: "#C084FC", border: "rgba(168,85,247,0.3)", label: "Faturado" },
  cancelled:   { bg: "rgba(239,68,68,0.12)",  text: "#F87171", border: "rgba(239,68,68,0.3)",  label: "Cancelado" },
  ok:          { bg: "rgba(34,197,94,0.12)",  text: "#4ADE80", border: "rgba(34,197,94,0.3)",  label: "Em Dia" },
  expiring:    { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)", label: "Vencendo" },
  expired:     { bg: "rgba(239,68,68,0.12)",  text: "#F87171", border: "rgba(239,68,68,0.3)",  label: "Vencido" },
  draft:       { bg: "rgba(148,163,184,0.12)",text: "#94A3B8", border: "rgba(148,163,184,0.3)",label: "Rascunho" },
  sent:        { bg: "rgba(37,99,235,0.12)",  text: "#60A5FA", border: "rgba(37,99,235,0.3)",  label: "Enviado" },
  accepted:    { bg: "rgba(34,197,94,0.12)",  text: "#4ADE80", border: "rgba(34,197,94,0.3)",  label: "Aceito" },
  low:         { bg: "rgba(34,197,94,0.12)",  text: "#4ADE80", border: "rgba(34,197,94,0.3)",  label: "Baixo" },
  medium:      { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)", label: "Médio" },
  high:        { bg: "rgba(239,68,68,0.12)",  text: "#F87171", border: "rgba(239,68,68,0.3)",  label: "Alto" },
  critical:    { bg: "rgba(239,68,68,0.18)",  text: "#FCA5A5", border: "rgba(239,68,68,0.5)",  label: "Crítico" },
};

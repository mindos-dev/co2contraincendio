/**
 * OPERIS IA — Skin Creator
 * Sistema de temas visuais: CO₂ UL Style vs OPERIS Procore/Autodesk
 * Persiste via localStorage, aplica CSS variables dinamicamente
 */

export type SkinName = "co2-ul" | "operis-procore" | "operis-autodesk" | "operis-dark";

export interface SkinDefinition {
  name: SkinName;
  label: string;
  description: string;
  system: "co2" | "operis";
  variables: Record<string, string>;
}

// ─── CO₂ UL Solutions Style ──────────────────────────────────────────────────
const CO2_UL_SKIN: SkinDefinition = {
  name: "co2-ul",
  label: "CO₂ — UL Solutions",
  description: "Vermelho institucional, branco e cinza técnico. Credibilidade e conversão.",
  system: "co2",
  variables: {
    "--skin-primary": "#C8102E",
    "--skin-primary-hover": "#A50D25",
    "--skin-primary-light": "#FFF0F2",
    "--skin-secondary": "#1A1A2E",
    "--skin-accent": "#E8E8E8",
    "--skin-bg": "#FFFFFF",
    "--skin-bg-subtle": "#F5F5F5",
    "--skin-surface": "#FFFFFF",
    "--skin-border": "#E0E0E0",
    "--skin-text": "#1A1A1A",
    "--skin-text-muted": "#6B6B6B",
    "--skin-text-inverse": "#FFFFFF",
    "--skin-success": "#1A7A4A",
    "--skin-warning": "#B45309",
    "--skin-danger": "#C8102E",
    "--skin-info": "#0369A1",
    "--skin-font-heading": "'Inter', 'Helvetica Neue', sans-serif",
    "--skin-font-body": "'Inter', system-ui, sans-serif",
    "--skin-radius": "4px",
    "--skin-radius-lg": "8px",
    "--skin-shadow": "0 1px 3px rgba(0,0,0,0.12)",
    "--skin-shadow-lg": "0 4px 12px rgba(0,0,0,0.15)",
  },
};

// ─── OPERIS Procore Style ─────────────────────────────────────────────────────
const OPERIS_PROCORE_SKIN: SkinDefinition = {
  name: "operis-procore",
  label: "OPERIS — Procore",
  description: "Laranja de ação, cinza técnico, layout de campo. Padrão construtivo.",
  system: "operis",
  variables: {
    "--skin-primary": "#F97316",
    "--skin-primary-hover": "#EA6C0A",
    "--skin-primary-light": "#FFF7ED",
    "--skin-secondary": "#1E293B",
    "--skin-accent": "#F1F5F9",
    "--skin-bg": "#F8FAFC",
    "--skin-bg-subtle": "#F1F5F9",
    "--skin-surface": "#FFFFFF",
    "--skin-border": "#E2E8F0",
    "--skin-text": "#0F172A",
    "--skin-text-muted": "#64748B",
    "--skin-text-inverse": "#FFFFFF",
    "--skin-success": "#16A34A",
    "--skin-warning": "#D97706",
    "--skin-danger": "#DC2626",
    "--skin-info": "#2563EB",
    "--skin-font-heading": "'Inter', 'Helvetica Neue', sans-serif",
    "--skin-font-body": "'Inter', system-ui, sans-serif",
    "--skin-radius": "6px",
    "--skin-radius-lg": "10px",
    "--skin-shadow": "0 1px 2px rgba(0,0,0,0.08)",
    "--skin-shadow-lg": "0 4px 16px rgba(0,0,0,0.10)",
  },
};

// ─── OPERIS Autodesk Style ────────────────────────────────────────────────────
const OPERIS_AUTODESK_SKIN: SkinDefinition = {
  name: "operis-autodesk",
  label: "OPERIS — Autodesk",
  description: "Azul de engenharia, cinza neutro, precisão técnica. Padrão CAD/BIM.",
  system: "operis",
  variables: {
    "--skin-primary": "#0696D7",
    "--skin-primary-hover": "#0580BB",
    "--skin-primary-light": "#E6F4FB",
    "--skin-secondary": "#1A1A2E",
    "--skin-accent": "#F0F4F8",
    "--skin-bg": "#F4F6F8",
    "--skin-bg-subtle": "#EAECEF",
    "--skin-surface": "#FFFFFF",
    "--skin-border": "#D8DCE0",
    "--skin-text": "#1A1A1A",
    "--skin-text-muted": "#5A6270",
    "--skin-text-inverse": "#FFFFFF",
    "--skin-success": "#1A7A4A",
    "--skin-warning": "#B45309",
    "--skin-danger": "#C8102E",
    "--skin-info": "#0696D7",
    "--skin-font-heading": "'Artifakt Element', 'Inter', sans-serif",
    "--skin-font-body": "'Artifakt Element', 'Inter', system-ui, sans-serif",
    "--skin-radius": "3px",
    "--skin-radius-lg": "6px",
    "--skin-shadow": "0 1px 2px rgba(0,0,0,0.10)",
    "--skin-shadow-lg": "0 4px 12px rgba(0,0,0,0.12)",
  },
};

// ─── OPERIS Dark (Premium) ────────────────────────────────────────────────────
const OPERIS_DARK_SKIN: SkinDefinition = {
  name: "operis-dark",
  label: "OPERIS — Dark Premium",
  description: "Azul escuro, preto técnico, cinza frio. Padrão premium noturno.",
  system: "operis",
  variables: {
    "--skin-primary": "#3B82F6",
    "--skin-primary-hover": "#2563EB",
    "--skin-primary-light": "#1E3A5F",
    "--skin-secondary": "#1E293B",
    "--skin-accent": "#1E293B",
    "--skin-bg": "#0A1628",
    "--skin-bg-subtle": "#0F1E35",
    "--skin-surface": "#132035",
    "--skin-border": "#1E3A5F",
    "--skin-text": "#E2E8F0",
    "--skin-text-muted": "#94A3B8",
    "--skin-text-inverse": "#0A1628",
    "--skin-success": "#22C55E",
    "--skin-warning": "#F59E0B",
    "--skin-danger": "#EF4444",
    "--skin-info": "#38BDF8",
    "--skin-font-heading": "'Inter', 'Helvetica Neue', sans-serif",
    "--skin-font-body": "'Inter', system-ui, sans-serif",
    "--skin-radius": "6px",
    "--skin-radius-lg": "10px",
    "--skin-shadow": "0 1px 3px rgba(0,0,0,0.40)",
    "--skin-shadow-lg": "0 4px 16px rgba(0,0,0,0.50)",
  },
};

export const SKINS: Record<SkinName, SkinDefinition> = {
  "co2-ul": CO2_UL_SKIN,
  "operis-procore": OPERIS_PROCORE_SKIN,
  "operis-autodesk": OPERIS_AUTODESK_SKIN,
  "operis-dark": OPERIS_DARK_SKIN,
};

const STORAGE_KEY = "operis-skin";
const DEFAULT_SKIN: SkinName = "operis-dark";

// ─── Apply skin to document ───────────────────────────────────────────────────
export function applySkin(name: SkinName): void {
  const skin = SKINS[name];
  if (!skin) return;

  const root = document.documentElement;
  Object.entries(skin.variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Toggle system class
  root.classList.remove("skin-co2", "skin-operis");
  root.classList.add(`skin-${skin.system}`);

  // Persist
  localStorage.setItem(STORAGE_KEY, name);
}

// ─── Load persisted skin ──────────────────────────────────────────────────────
export function loadSkin(): SkinName {
  const saved = localStorage.getItem(STORAGE_KEY) as SkinName | null;
  return saved && SKINS[saved] ? saved : DEFAULT_SKIN;
}

// ─── Initialize on app start ──────────────────────────────────────────────────
export function initSkin(): void {
  applySkin(loadSkin());
}

// ─── Get current skin ─────────────────────────────────────────────────────────
export function getCurrentSkin(): SkinDefinition {
  return SKINS[loadSkin()];
}

// ─── Get skins by system ──────────────────────────────────────────────────────
export function getSkinsBySystem(system: "co2" | "operis"): SkinDefinition[] {
  return Object.values(SKINS).filter((s) => s.system === system);
}

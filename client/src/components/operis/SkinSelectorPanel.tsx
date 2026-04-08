/**
 * OPERIS IA — Skin Selector Panel
 * Painel de seleção de tema visual com preview de cores
 */
import { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import {
  SKINS,
  applySkin,
  loadSkin,
  type SkinName,
  type SkinDefinition,
} from "@/lib/skin-creator";

interface SkinCardProps {
  skin: SkinDefinition;
  isActive: boolean;
  onSelect: () => void;
}

function SkinCard({ skin, isActive, onSelect }: SkinCardProps) {
  const primary = skin.variables["--skin-primary"];
  const bg = skin.variables["--skin-bg"];
  const surface = skin.variables["--skin-surface"];
  const text = skin.variables["--skin-text"];
  const border = skin.variables["--skin-border"];

  return (
    <button
      onClick={onSelect}
      className="relative w-full text-left rounded-lg border-2 transition-all duration-200 overflow-hidden hover:scale-[1.02]"
      style={{
        borderColor: isActive ? primary : border,
        boxShadow: isActive ? `0 0 0 2px ${primary}40` : "none",
      }}
    >
      {/* Preview */}
      <div
        className="h-16 flex items-center gap-2 px-3"
        style={{ backgroundColor: bg }}
      >
        {/* Sidebar preview */}
        <div
          className="w-6 h-10 rounded"
          style={{ backgroundColor: skin.variables["--skin-secondary"] }}
        />
        {/* Content preview */}
        <div className="flex-1 space-y-1">
          <div
            className="h-2 rounded w-3/4"
            style={{ backgroundColor: surface, border: `1px solid ${border}` }}
          />
          <div
            className="h-2 rounded w-1/2"
            style={{ backgroundColor: surface, border: `1px solid ${border}` }}
          />
        </div>
        {/* Button preview */}
        <div
          className="w-8 h-4 rounded text-[6px] flex items-center justify-center font-bold"
          style={{ backgroundColor: primary, color: "#fff" }}
        >
          BTN
        </div>
      </div>

      {/* Info */}
      <div
        className="px-3 py-2"
        style={{ backgroundColor: surface, borderTop: `1px solid ${border}` }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold"
            style={{ color: text }}
          >
            {skin.label}
          </span>
          {isActive && (
            <Check
              className="w-3 h-3"
              style={{ color: primary }}
            />
          )}
        </div>
        <p
          className="text-[10px] mt-0.5 leading-tight"
          style={{ color: skin.variables["--skin-text-muted"] }}
        >
          {skin.description}
        </p>
      </div>
    </button>
  );
}

interface SkinSelectorPanelProps {
  onClose?: () => void;
}

export function SkinSelectorPanel({ onClose }: SkinSelectorPanelProps) {
  const [activeSkin, setActiveSkin] = useState<SkinName>(loadSkin());

  useEffect(() => {
    setActiveSkin(loadSkin());
  }, []);

  function handleSelect(name: SkinName) {
    applySkin(name);
    setActiveSkin(name);
  }

  const co2Skins = Object.values(SKINS).filter((s) => s.system === "co2");
  const opérisSkins = Object.values(SKINS).filter((s) => s.system === "operis");

  return (
    <div className="p-4 space-y-4 min-w-[280px]">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-[var(--skin-primary)]" />
        <h3 className="text-sm font-semibold text-[var(--skin-text)]">
          Aparência do Sistema
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-[var(--skin-text-muted)] hover:text-[var(--skin-text)] text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* CO₂ Themes */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--skin-text-muted)] mb-2">
          CO₂ Site
        </p>
        <div className="space-y-2">
          {co2Skins.map((skin) => (
            <SkinCard
              key={skin.name}
              skin={skin}
              isActive={activeSkin === skin.name}
              onSelect={() => handleSelect(skin.name)}
            />
          ))}
        </div>
      </div>

      {/* OPERIS Themes */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--skin-text-muted)] mb-2">
          OPERIS App
        </p>
        <div className="space-y-2">
          {opérisSkins.map((skin) => (
            <SkinCard
              key={skin.name}
              skin={skin}
              isActive={activeSkin === skin.name}
              onSelect={() => handleSelect(skin.name)}
            />
          ))}
        </div>
      </div>

      <p className="text-[10px] text-[var(--skin-text-muted)] text-center">
        Tema salvo automaticamente
      </p>
    </div>
  );
}

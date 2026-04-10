/**
 * LanguageContext — Sistema de multi-idioma PT/EN
 * CO2 Contra Incêndio + OPERIS.eng
 *
 * Uso:
 *   const { t, lang, setLang } = useLanguage();
 *   <span>{t.nav.home}</span>
 *   <LanguageSelector /> — componente com bandeiras 🇧🇷 / 🇺🇸
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { pt } from "../i18n/pt";
import { en } from "../i18n/en";
import type { Translations } from "../i18n/pt";

type Lang = "pt" | "en";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const translations: Record<Lang, Translations> = { pt, en };

const LanguageContext = createContext<LanguageContextValue>({
  lang: "pt",
  setLang: () => {},
  t: pt,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    // Persistir preferência no localStorage
    const saved = localStorage.getItem("operis_lang") as Lang | null;
    return saved === "en" ? "en" : "pt";
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("operis_lang", newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

/**
 * LanguageSelector — Botões de bandeira para troca de idioma
 * Pode ser inserido em qualquer navbar ou header
 */
export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: compact ? "0" : "0.25rem 0.5rem",
        borderRadius: "4px",
      }}
      title={t.nav.chooseLanguage}
      aria-label={t.nav.chooseLanguage}
    >
      <button
        onClick={() => setLang("pt")}
        title="Português (Brasil)"
        aria-label="Português (Brasil)"
        style={{
          background: "none",
          border: lang === "pt" ? "2px solid #22c55e" : "2px solid transparent",
          borderRadius: "50%",
          padding: "2px",
          cursor: "pointer",
          fontSize: "1.25rem",
          lineHeight: 1,
          opacity: lang === "pt" ? 1 : 0.5,
          transition: "opacity 0.2s, border-color 0.2s",
        }}
      >
        🇧🇷
      </button>
      <button
        onClick={() => setLang("en")}
        title="English (USA)"
        aria-label="English (USA)"
        style={{
          background: "none",
          border: lang === "en" ? "2px solid #3b82f6" : "2px solid transparent",
          borderRadius: "50%",
          padding: "2px",
          cursor: "pointer",
          fontSize: "1.25rem",
          lineHeight: 1,
          opacity: lang === "en" ? 1 : 0.5,
          transition: "opacity 0.2s, border-color 0.2s",
        }}
      >
        🇺🇸
      </button>
    </div>
  );
}

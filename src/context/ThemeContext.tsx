/* eslint-disable react-refresh/only-export-components */
// ============================================================
// BIDIWS — Contexte Thème (light / dark / system)
// Fichier : src/context/ThemeContext.tsx
// ============================================================

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export type Theme = "light" | "dark" | "system";
export type ThemeResolu = "light" | "dark";

export interface ThemeContextType {
  theme       : Theme;
  themeResolu : ThemeResolu;
  setTheme    : (theme: Theme) => void;
}

// ─────────────────────────────────────────
// CRÉATION DU CONTEXTE
// ─────────────────────────────────────────

export const ThemeContext = createContext<ThemeContextType | null>(null);

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const STORAGE_KEY = "bidiws_theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
};

const resolveTheme = (theme: Theme): ThemeResolu => {
  if (theme === "system") {
    return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
  }
  return theme;
};

// Appliqué de façon synchrone dès l'import du module, donc avant le
// premier rendu React — un useEffect s'exécuterait après le premier
// paint et ferait clignoter le mauvais thème au chargement.
document.documentElement.setAttribute("data-theme", resolveTheme(getStoredTheme()));

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState]        = useState<Theme>(getStoredTheme);
  const [themeResolu, setThemeResolu] = useState<ThemeResolu>(() => resolveTheme(getStoredTheme()));

  const setTheme = useCallback((next: Theme): void => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  // ── Appliquer au DOM, et suivre l'OS en direct si mode "system" ──
  useEffect(() => {
    const appliquer = (): void => {
      const resolu = resolveTheme(theme);
      setThemeResolu(resolu);
      document.documentElement.setAttribute("data-theme", resolu);
    };

    appliquer();

    if (theme !== "system") return;

    const mql = window.matchMedia(MEDIA_QUERY);
    mql.addEventListener("change", appliquer);
    return () => mql.removeEventListener("change", appliquer);
  }, [theme]);

  const value: ThemeContextType = { theme, themeResolu, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

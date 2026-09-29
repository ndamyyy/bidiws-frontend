// ============================================================
// BIDIWS — Contexte Thème (définition)
// Fichier : src/context/ThemeContextValue.ts
// Séparé de ThemeContext.tsx pour que ce dernier n'exporte plus que le
// composant ThemeProvider (react-refresh/only-export-components).
// ============================================================

import { createContext } from "react";

export type Theme = "light" | "dark" | "system";
export type ThemeResolu = "light" | "dark";

export interface ThemeContextType {
  theme       : Theme;
  themeResolu : ThemeResolu;
  setTheme    : (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

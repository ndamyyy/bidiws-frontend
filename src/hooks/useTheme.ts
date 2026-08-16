// ============================================================
// BIDIWS — Hook useTheme
// Fichier : src/hooks/useTheme.ts
// ============================================================

import { useContext } from "react";
import { ThemeContext, type ThemeContextType } from "../context/ThemeContext";

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  }

  return context;
}

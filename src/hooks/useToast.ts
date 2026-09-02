// ============================================================
// BIDIWS — Hook useToast
// Fichier : src/hooks/useToast.ts
// ============================================================

import { useContext } from "react";
import { ToastContext, type ToastContextType } from "../context/ToastContextValue";

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast doit être utilisé dans un ToastProvider");
  }

  return context;
}

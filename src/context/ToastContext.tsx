// ============================================================
// BIDIWS — Contexte Toast
// Fichier : src/context/ToastContext.tsx
// Garde la liste des toasts actifs et expose success/error/info — même
// structure (contexte + provider + hook dédié) que NotificationContext.
// ============================================================

import { useState, useCallback, type ReactNode } from "react";
import type { ToastVariant } from "../components/ui/Toast/Toast";
import { ToastContext, type ToastContextType, type ToastItem } from "./ToastContextValue";

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant: ToastVariant, message: string): void => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, variant, message }]);
  }, []);

  const value: ToastContextType = {
    toasts,
    success: (message) => push("success", message),
    error  : (message) => push("error", message),
    info   : (message) => push("info", message),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

// ============================================================
// BIDIWS — Contexte Toast (définition)
// Fichier : src/context/ToastContextValue.ts
// Séparé de ToastContext.tsx pour que ce dernier n'exporte plus que le
// composant ToastProvider (react-refresh/only-export-components) —
// même découpage que NotificationContextValue.ts.
// ============================================================

import { createContext } from "react";
import type { ToastVariant } from "../components/ui/Toast/Toast";

export interface ToastItem {
  id     : string;
  variant: ToastVariant;
  message: string;
}

export interface ToastContextType {
  toasts : ToastItem[];
  success: (message: string) => void;
  error  : (message: string) => void;
  info   : (message: string) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

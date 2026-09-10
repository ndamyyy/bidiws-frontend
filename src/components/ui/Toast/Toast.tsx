// ============================================================
// BIDIWS — Toast
// Fichier : src/components/ui/Toast/Toast.tsx
// ============================================================
//
// Aucun équivalent existant dans le projet (vérifié) — conçu à partir
// des mêmes tokens que le reste (--success/--danger/--info, --bg-
// elevated, --radius-lg) plutôt qu'inventé hors style. Auto-dismiss
// interne (setTimeout), le parent ne gère que la liste des toasts
// actifs et les retire via onDismiss — même répartition de
// responsabilité que Modal (le parent monte/démonte, le composant
// gère son propre cycle de vie visuel).
//
// ToastContainer se contente d'empiler ses enfants (position fixe,
// colonne, gap) — le parent lui passe la liste de <Toast/> à afficher.

import { useEffect } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./Toast.css";

export type ToastVariant = "success" | "error" | "info";

const ICONS: Record<ToastVariant, ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="11" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

export interface ToastProps {
  id: string | number;
  variant?: ToastVariant;
  message: string;
  /** Durée avant fermeture automatique, en ms. 0 = pas d'auto-dismiss. */
  duration?: number;
  onDismiss: (id: string | number) => void;
}

export function Toast({ id, variant = "info", message, duration = 4000, onDismiss }: ToastProps) {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      className={`ui-toast ui-toast--${variant}`}
      layout
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      role="status"
    >
      <span className="ui-toast__icon">{ICONS[variant]}</span>
      <span className="ui-toast__message">{message}</span>
      <button
        className="ui-toast__close"
        onClick={() => onDismiss(id)}
        title="Fermer"
        aria-label="Fermer"
      >
        ×
      </button>
    </motion.div>
  );
}

export interface ToastContainerProps {
  children: ReactNode;
}

/** Empile les <Toast/> actifs — le parent fournit la liste (état des
 * toasts) et le key={id} de chacun ; AnimatePresence anime l'entrée/
 * sortie individuelle de chaque toast dans la pile. */
export function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div className="ui-toast-container">
      <AnimatePresence>{children}</AnimatePresence>
    </div>
  );
}

// ============================================================
// BIDIWS — Spinner
// Fichier : src/components/ui/Spinner/Spinner.tsx
// ============================================================
//
// Primitive extraite de l'anneau de LoadingSpinner (.loading-spinner__
// ring-inner) — LoadingSpinner reste le spinner PLEINE PAGE avec son
// texte "Chargement..." (fallback de route/Suspense), inchangé pour
// les appelants existants ; il compose désormais Spinner en interne
// au lieu de dupliquer l'anneau. Spinner est la version nue,
// dimensionnable, pour un usage inline (dans un Button en chargement,
// à côté d'un texte, etc.).

import type { HTMLAttributes } from "react";
import "./Spinner.css";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  /** Couleur du trait actif — "currentColor" par défaut pour hériter
   * du texte environnant (utile dans un bouton coloré). */
  color?: string;
}

export function Spinner({ size = "md", color, className = "", style, ...rest }: SpinnerProps) {
  const classes = ["ui-spinner", `ui-spinner--${size}`, className].filter(Boolean).join(" ");
  return (
    <span
      className={classes}
      style={color ? { ...style, borderTopColor: color } : style}
      role="status"
      aria-label="Chargement"
      {...rest}
    />
  );
}

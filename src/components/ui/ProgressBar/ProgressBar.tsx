// ============================================================
// BIDIWS — ProgressBar
// Fichier : src/components/ui/ProgressBar/ProgressBar.tsx
// ============================================================
//
// Généralisation du motif répété pour la progression de tournée
// (ChauffeurTourneePage/DashboardPage/AdminDashboardPage : une piste
// --overlay-6, un remplissage en dégradé, un pourcentage). Ne reprend
// pas le marqueur "camion" qui se déplace sur la piste (TruckRoute) —
// spécifique à ces pages, pas un besoin générique de barre de
// progression.

import type { HTMLAttributes } from "react";
import "./ProgressBar.css";

export type ProgressBarVariant = "signal" | "success" | "accent-role";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 0-100 — valeurs hors bornes ramenées dans l'intervalle. */
  value: number;
  variant?: ProgressBarVariant;
  /** Libellé affiché au-dessus (ex. "3/5 arrêts validés"). */
  label?: string;
  /** Affiche le pourcentage à droite du libellé. */
  showPercent?: boolean;
}

export function ProgressBar({
  value,
  variant = "signal",
  label,
  showPercent = false,
  className = "",
  ...rest
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={["ui-progress", className].filter(Boolean).join(" ")} {...rest}>
      {(label || showPercent) && (
        <div className="ui-progress__header">
          {label && <span className="ui-progress__label">{label}</span>}
          {showPercent && <span className="ui-progress__percent">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div
        className="ui-progress__track"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`ui-progress__fill ui-progress__fill--${variant}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

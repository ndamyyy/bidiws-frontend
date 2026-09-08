// ============================================================
// BIDIWS — Input
// Fichier : src/components/ui/Input/Input.tsx
// ============================================================
//
// Dénominateur commun extrait de l'existant (.login__field-input,
// .profil__input, .admin-tournees__input, .residence-modal__input,
// .signalement-modal__select…) — au moins 52 classes du même style
// répétées à travers le projet, jamais mutualisées : même fond
// (--bg-input), même bordure (--border-subtle, --radius-md), même
// focus (--signal + --signal-dim-05), même label (11px, majuscules,
// --text-secondary). Label optionnel : la plupart des usages en ont
// un au-dessus du champ, mais pas tous (ex. filtres de date en ligne).

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import "./Input.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Message d'erreur — bascule aussi la bordure en --critical. */
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="ui-field">
        {label && (
          <label className="ui-field__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`ui-input ${error ? "ui-input--error" : ""} ${className}`}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
        {error && <div className="ui-field__error">{error}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";

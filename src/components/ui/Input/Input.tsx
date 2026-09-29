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
import type { InputHTMLAttributes, ReactNode } from "react";
import "./Input.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Message d'erreur — bascule aussi la bordure en --critical. */
  error?: string;
  /** Icône ou bouton en overlay à droite du champ (ex. afficher/masquer
   *  le mot de passe). Sans cette prop, le DOM rendu est inchangé. */
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, trailingIcon, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const field = (
      <input
        ref={ref}
        id={inputId}
        className={`ui-input ${error ? "ui-input--error" : ""} ${trailingIcon ? "ui-input--with-trailing" : ""} ${className}`}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    );

    return (
      <div className="ui-field">
        {label && (
          <label className="ui-field__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        {trailingIcon ? (
          <div className="ui-field__control">
            {field}
            <span className="ui-field__trailing">{trailingIcon}</span>
          </div>
        ) : (
          field
        )}
        {error && <div className="ui-field__error">{error}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";

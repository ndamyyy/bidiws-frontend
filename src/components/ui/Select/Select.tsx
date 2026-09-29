// ============================================================
// BIDIWS — Select
// Fichier : src/components/ui/Select/Select.tsx
// ============================================================
//
// Même niveau visuel qu'Input : partout dans le projet, .xxx__select
// et .xxx__input partagent littéralement la même règle CSS (ex.
// .admin-tournees__input, .admin-tournees__select { ... }) — les deux
// composants restent séparés (comme Input/Select le sont ailleurs)
// mais s'appuient sur les mêmes classes .ui-field/.ui-field__label/
// .ui-field__error (dupliquées dans Select.css, voir plus bas) pour
// ne pas dépendre d'Input.css au chargement.

import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";
import "./Select.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  /** Message d'erreur — bascule aussi la bordure en --critical. */
  error?: string;
  options: SelectOption[];
  /** Option grisée en tête, ex. "Sélectionner..." — reprend le
   * placeholder répété partout (value="" désactivé par la validation
   * du formulaire, pas par l'attribut disabled sur l'<option>, pour
   * rester cohérent avec l'existant qui ne le fait pas non plus). */
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="ui-field">
        {label && (
          <label className="ui-field__label" htmlFor={selectId}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`ui-select ${error ? "ui-select--error" : ""} ${className}`}
          aria-invalid={error ? true : undefined}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <div className="ui-field__error">{error}</div>}
      </div>
    );
  }
);

Select.displayName = "Select";

// ============================================================
// BIDIWS — FilterGroup
// Fichier : src/components/ui/FilterGroup/FilterGroup.tsx
// ============================================================
//
// Reprend le pattern déjà répété à l'identique (admin-signalements__
// filters/__filter-pill, admin-users__filters/__filter-pill,
// gardien-alerts__filters/__filter-pill) : une rangée de pastilles,
// une seule active à la fois, valeur + libellé distincts (le
// libellé affiché n'est pas toujours la valeur brute, ex. STATUT_LABEL).
// Générique sur T pour rester utilisable avec n'importe quelle union
// de chaînes (StatutSignalement, Role | "TOUS", Filtre...) sans "as".

import "./FilterGroup.css";

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

export interface FilterGroupProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterGroup<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: FilterGroupProps<T>) {
  return (
    <div className={`ui-filter-group ${className}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`ui-filter-pill ${value === o.value ? "ui-filter-pill--active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

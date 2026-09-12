// ============================================================
// BIDIWS — Button
// Fichier : src/components/ui/Button/Button.tsx
// ============================================================
//
// Dénominateur commun extrait de l'existant (.login__submit,
// .btn-valider-chauffeur, .btn-demarrer-chauffeur, .admin-*__submit,
// .admin-*__cancel, .sidebar__logout, .admin-camion-row__action--
// desactiver…) plutôt qu'une API inventée : dégradé --signal-gradient
// pour l'action principale, fond overlay neutre pour le secondaire,
// contour teinté --danger pour le destructeur, spinner intégré pour
// l'état de chargement — tous des motifs déjà répétés tels quels
// partout dans l'app.
//
// Les classes .btn / .btn--primary du design system (styles/index.css)
// existent déjà mais ne sont utilisées nulle part (vérifié) — pas
// reprises ici pour éviter d'hériter d'un style jamais éprouvé en
// conditions réelles ; Button a sa propre feuille, alignée sur ce qui
// est effectivement à l'écran aujourd'hui.
//
// ── Convention d'usage (audité et unifié sur tout le projet) ──
// Une seule variante par type d'action, partout, pas au cas par cas :
//   - primary   : l'action qui valide/confirme/soumet (Valider, Envoyer
//                 le signalement, Créer, Démarrer/Terminer la tournée).
//   - secondary : action auxiliaire ou d'annulation (Annuler, Réessayer,
//                 Importer une photo).
//   - danger    : action réellement destructive (Retirer une photo
//                 déjà sélectionnée) OU un point d'entrée vers un
//                 signalement/incident (Signaler un problème/incident) —
//                 pas la confirmation à l'intérieur de ce formulaire,
//                 qui reste primary comme toute soumission.
// Dans un groupe annuler/confirmer, Annuler est toujours en premier
// (donc à gauche, sauf conteneur en row-reverse) et l'action de
// confirmation en second (à droite) — jamais l'inverse.

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "../Spinner/Spinner";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Affiche un spinner à la place du contenu et désactive le bouton. */
  loading?: boolean;
  /** Icône avant le texte (ex. <IconCheck/>) — masquée pendant loading. */
  icon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [
      "ui-btn",
      `ui-btn--${variant}`,
      `ui-btn--${size}`,
      fullWidth ? "ui-btn--full" : "",
      className,
    ].filter(Boolean).join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? (
          <Spinner size="sm" className="ui-btn__spinner" />
        ) : (
          icon && <span className="ui-btn__icon">{icon}</span>
        )}
        {children && <span className="ui-btn__label">{children}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

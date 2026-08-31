// ============================================================
// BIDIWS — Badge
// Fichier : src/components/ui/Badge/Badge.tsx
// ============================================================
//
// Le pattern le plus répété de tout le projet : fond translucide +
// bordure + texte dans la même teinte, pour un statut. Trouvé quasi
// à l'identique dans AdminDashboardPage.tsx et DashboardPage.tsx
// (composants Badge locaux avec une map statut→couleur), dans
// ChauffeurTourneePage.tsx (statut "Collecté"/"Incident" inline),
// AdminCamionsPage.css / AdminAppareilsIotPage.css (statut actif/
// inactif) — tous fusionnés ici sur les 5 teintes déjà centralisées
// (--success/--danger/--info/--alert/--neutral, voir styles/index.css).
//
// Ne remplace PAS ces maps "statut métier → variante" (PLANIFIEE,
// EN_COURS, OUVERT…) — chaque page garde la sienne, propre à son
// vocabulaire ; Badge ne fournit que le rendu visuel commun en bout
// de chaîne.

import type { HTMLAttributes, ReactNode } from "react";
import "./Badge.css";

export type BadgeVariant = "success" | "danger" | "info" | "warning" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Petit point plein avant le texte (ex. statut "en cours" pulsant). */
  dot?: boolean;
  /** Anime le point en pulsation — n'a d'effet qu'avec dot. */
  pulse?: boolean;
  children: ReactNode;
}

export function Badge({
  variant = "neutral",
  dot = false,
  pulse = false,
  className = "",
  children,
  ...rest
}: BadgeProps) {
  const classes = ["ui-badge", `ui-badge--${variant}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {dot && <span className={`ui-badge__dot ${pulse ? "ui-badge__dot--pulse" : ""}`} />}
      {children}
    </span>
  );
}

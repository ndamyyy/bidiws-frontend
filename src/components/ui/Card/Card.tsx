// ============================================================
// BIDIWS — Card
// Fichier : src/components/ui/Card/Card.tsx
// ============================================================
//
// Conteneur de base repris de .card / .stat-card / .tournee-card /
// .admin-tournee-card (styles/index.css + pages admin/syndic) : même
// fond (--bg-card), même bordure (--border-subtle), même radius
// (--radius-lg) partout — seul le contenu interne varie par page.
// N'essaie pas de recréer StatCard (icône + valeur + libellé) ni les
// variantes AnimatedCard (déjà un composant à part, avec Framer
// Motion) — juste le conteneur commun, en dessous des deux.

import type { HTMLAttributes, ReactNode } from "react";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Survol avec léger soulèvement + ombre, comme .card--interactive. */
  interactive?: boolean;
  /** Padding resserré (listes denses) au lieu du padding standard. */
  compact?: boolean;
  children: ReactNode;
}

export function Card({
  interactive = false,
  compact = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  const classes = [
    "ui-card",
    interactive ? "ui-card--interactive" : "",
    compact ? "ui-card--compact" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

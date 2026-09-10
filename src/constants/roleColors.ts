// ============================================================
// BIDIWS — Couleurs d'accent par rôle
// Fichier : src/constants/roleColors.ts
// ============================================================
//
// Valeurs identiques à celles déjà établies par le sélecteur de rôle
// de LoginPage.tsx (ROLE_OPTIONS) et par les avatars de SideBar.css
// (.sidebar__user-avatar--*) — reprises telles quelles pour que
// --accent-role (posé par Layout) prolonge une identité déjà connue
// de l'utilisateur depuis l'écran de connexion, plutôt que d'en
// inventer une nouvelle.
//
// BAILLEUR partage la couleur de SYNDIC : les deux se connectent via
// la même option "Syndic / Bailleur" du sélecteur de LoginPage.
// ADMIN n'a pas d'option dans ce sélecteur (connexion séparée via
// AdminLoginPage) — reprend la couleur déjà utilisée par son avatar
// dans SideBar.css.

import type { Role } from "../types";

export const ROLE_ACCENT: Record<Role, string> = {
  SYNDIC:    "#1b3a6b",
  BAILLEUR:  "#1b3a6b",
  MAIRIE:    "#9c27b0",
  GARDIEN:   "#4caf50",
  CHAUFFEUR: "#f59e0b",
  HABITANT:  "#6b84a3",
  ADMIN:     "#ef4444",
};

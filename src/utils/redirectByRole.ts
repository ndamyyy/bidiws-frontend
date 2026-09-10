// ============================================================
// BIDIWS — Redirection par rôle
// Fichier : src/utils/redirectByRole.ts
// Extrait de AuthContext.tsx pour être réutilisé par ProtectedRoute
// (rôle connecté mais non autorisé sur la route demandée) sans
// dupliquer la logique, et sans réintroduire l'export mixte que
// AuthContext.tsx évite volontairement (react-refresh/only-export-components).
// ============================================================

import type { Role } from "../types";

export const redirectByRole: Record<Role, string> = {
  SYNDIC   : "/syndic/dashboard",
  BAILLEUR : "/syndic/dashboard",
  MAIRIE   : "/syndic/dashboard",
  GARDIEN  : "/gardien/home",
  CHAUFFEUR: "/chauffeur/tournee",
  HABITANT : "/habitant/home",
  ADMIN    : "/admin/dashboard",
};

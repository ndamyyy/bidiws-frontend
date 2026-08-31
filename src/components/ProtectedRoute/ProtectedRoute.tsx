// ============================================================
// BIDIWS — Composant ProtectedRoute
// Fichier : src/components/ProtectedRoute/ProtectedRoute.tsx
// ============================================================

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { redirectByRole } from "../../utils/redirectByRole";
import { Role } from "../../types";

// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

interface ProtectedRouteProps {
  children : ReactNode;
  roles    : Role[];
}

// ─────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, utilisateur, isLoading } = useAuth();

  // En cours de chargement — on attend
  if (isLoading) {
    return (
      <div className="protected-route__loading">
        <span className="protected-route__spinner" />
      </div>
    );
  }

  // Pas connecté → login
  if (!isAuthenticated || !utilisateur) {
    return <Navigate to="/login" replace />;
  }

  // Connecté mais mauvais rôle pour cette route → propre espace,
  // pas l'écran de connexion (déjà authentifié, /login serait un
  // aller-retour inutile et déroutant)
  if (!roles.includes(utilisateur.role)) {
    return <Navigate to={redirectByRole[utilisateur.role]} replace />;
  }

  return <>{children}</>;
}

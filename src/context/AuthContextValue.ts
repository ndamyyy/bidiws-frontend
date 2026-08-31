// ============================================================
// BIDIWS — Contexte Authentification (définition)
// Fichier : src/context/AuthContextValue.ts
// Séparé d'AuthContext.tsx pour que ce dernier n'exporte plus que le
// composant AuthProvider (react-refresh/only-export-components).
// ============================================================

import { createContext } from "react";
import type { AuthUser, LoginRequest, Utilisateur } from "../types";

export interface AuthContextType {
  authUser       : AuthUser | null;
  utilisateur    : Utilisateur | null;
  isAuthenticated: boolean;
  isLoading      : boolean;
  isInitializing : boolean;
  // Retourne l'utilisateur connecté : permet à l'appelant de vérifier
  // son rôle juste après un login réussi sans dépendre d'un re-rendu
  // (le state du contexte n'est pas encore à jour dans la closure de
  // l'appelant à ce moment précis — voir AdminLoginPage).
  login          : (data: LoginRequest) => Promise<Utilisateur>;
  // redirectTo (optionnel, défaut "/login") : laisse un appelant
  // reprendre la main sur la destination post-déconnexion — voir
  // AdminLoginPage, qui redirige vers /admin/login le temps d'afficher
  // un message avant de renvoyer vers /login lui-même.
  logout         : (redirectTo?: string) => Promise<void>;
  refreshUtilisateur: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

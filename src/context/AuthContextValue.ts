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
  login          : (data: LoginRequest) => Promise<void>;
  logout         : () => void;
  refreshUtilisateur: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

/* eslint-disable react-refresh/only-export-components */
// ============================================================
// BIDIWS — Contexte Authentification
// Fichier : src/context/AuthContext.tsx
// ============================================================

import {
  createContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, logout as apiLogout, getMe } from "../api/auth.api";
import { getToken, removeToken } from "../api/axios";
import type { AuthUser, LoginRequest, Utilisateur } from "../types";

// ─────────────────────────────────────────
// TYPE DU CONTEXTE
// ─────────────────────────────────────────

export interface AuthContextType {
  authUser       : AuthUser | null;
  utilisateur    : Utilisateur | null;
  isAuthenticated: boolean;
  isLoading      : boolean;
  login          : (data: LoginRequest) => Promise<void>;
  logout         : () => void;
}

// ─────────────────────────────────────────
// CRÉATION DU CONTEXTE
// ─────────────────────────────────────────

export const AuthContext = createContext<AuthContextType | null>(null);

// ─────────────────────────────────────────
// REDIRECT PAR RÔLE
// ─────────────────────────────────────────

const redirectByRole: Record<Utilisateur["role"], string> = {
  SYNDIC   : "/syndic/dashboard",
  BAILLEUR : "/syndic/dashboard",
  MAIRIE   : "/syndic/dashboard",
  GARDIEN  : "/gardien/home",
  CHAUFFEUR: "/chauffeur/tournee",
  HABITANT : "/habitant/home",
  ADMIN    : "/admin/dashboard",
};

// ─────────────────────────────────────────
// SESSION INITIALE
// ─────────────────────────────────────────

const getInitialAuthUser = (): AuthUser | null => {
  const token = getToken();
  const stored = localStorage.getItem("bidiws_user");

  if (!token || !stored) {
    return null;
  }

  try {
    const utilisateur: Utilisateur = JSON.parse(stored);
    return { token, utilisateur };
  } catch {
    removeToken();
    localStorage.removeItem("bidiws_user");
    return null;
  }
};

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(getInitialAuthUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // ── Login ──
  const login = useCallback(async (data: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiLogin(data);
      const utilisateur = await getMe();
      localStorage.setItem("bidiws_user", JSON.stringify(utilisateur));
      setAuthUser({ token: response.token, utilisateur });
      navigate(redirectByRole[utilisateur.role]);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // ── Logout ──
  const logout = useCallback((): void => {
    apiLogout();
    setAuthUser(null);
    navigate("/login");
  }, [navigate]);

  const value: AuthContextType = {
    authUser,
    utilisateur    : authUser?.utilisateur ?? null,
    isAuthenticated: authUser !== null,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


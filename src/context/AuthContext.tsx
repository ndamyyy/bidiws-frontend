/* eslint-disable react-refresh/only-export-components */
// ============================================================
// BIDIWS — Contexte Authentification
// Fichier : src/context/AuthContext.tsx
// ============================================================

import {
  createContext,
  useState,
  useEffect,
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
  isInitializing : boolean;
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
// DURÉE MINIMALE DU SPLASH
// Évite un flash trop brutal si la validation du token répond
// quasi instantanément ; ne rallonge jamais une réponse lente.
// ─────────────────────────────────────────

const MIN_SPLASH_MS = 450;

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const navigate = useNavigate();

  // ── Revalider la session au montage ──
  // Le localStorage seul ne suffit pas à savoir si le token est encore
  // valide (peut avoir expiré côté serveur) — on le vérifie réellement
  // via GET /utilisateurs/moi pendant l'affichage du SplashScreen.
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const revaliderSession = async (): Promise<void> => {
      const token = getToken();
      if (!token) return;

      try {
        const utilisateur = await getMe();
        if (cancelled) return;
        localStorage.setItem("bidiws_user", JSON.stringify(utilisateur));
        setAuthUser({ token, utilisateur });
      } catch {
        removeToken();
        localStorage.removeItem("bidiws_user");
      }
    };

    const minDelay = new Promise<void>((resolve) => {
      timeoutId = setTimeout(resolve, MIN_SPLASH_MS);
    });

    Promise.all([revaliderSession(), minDelay]).finally(() => {
      if (!cancelled) setIsInitializing(false);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

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
    isInitializing,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


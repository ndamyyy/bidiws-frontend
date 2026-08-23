// ============================================================
// BIDIWS — Contexte Authentification
// Fichier : src/context/AuthContext.tsx
// ============================================================

import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, logout as apiLogout, getMe } from "../api/auth.api";
import { getToken, removeToken } from "../api/axios";
import { redirectByRole } from "../utils/redirectByRole";
import type { AuthUser, LoginRequest } from "../types";
import { AuthContext, type AuthContextType } from "./AuthContextValue";

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

  // ── Rafraîchir l'utilisateur courant (après modification du profil) ──
  const refreshUtilisateur = useCallback(async (): Promise<void> => {
    const token = getToken();
    if (!token) return;
    const utilisateur = await getMe();
    localStorage.setItem("bidiws_user", JSON.stringify(utilisateur));
    setAuthUser({ token, utilisateur });
  }, []);

  const value: AuthContextType = {
    authUser,
    utilisateur    : authUser?.utilisateur ?? null,
    isAuthenticated: authUser !== null,
    isLoading,
    isInitializing,
    login,
    logout,
    refreshUtilisateur,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


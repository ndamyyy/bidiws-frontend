// ============================================================
// BIDIWS — API Authentification
// Fichier : src/api/auth.api.ts
// ============================================================

import apiClient, { removeToken, setToken } from "./axios";
import type { AuthResponse, LoginRequest, RegisterRequest, Utilisateur } from "../types";

// ─────────────────────────────────────────
// LOGIN
// POST /auth/login
// ─────────────────────────────────────────

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);
  await setToken(response.data.token);
  return response.data;
};

// ─────────────────────────────────────────
// REGISTER
// POST /auth/register
// Ne connecte pas automatiquement — pas de token renvoyé
// ─────────────────────────────────────────

export const register = async (data: RegisterRequest): Promise<Utilisateur> => {
  const response = await apiClient.post<Utilisateur>("/auth/register", data);
  return response.data;
};

// ─────────────────────────────────────────
// LOGIN SANS PERSISTANCE
// POST /auth/login — jeton renvoyé mais jamais stocké (setToken n'est
// pas appelé). Sert uniquement à RegisterPage pour un appel authentifié
// ponctuel juste après l'inscription (rattachement résidence), sans
// connecter silencieusement l'utilisateur dans l'app — le comportement
// "pas de connexion automatique après inscription" reste inchangé.
// ─────────────────────────────────────────

export const loginSansPersistance = async (data: LoginRequest): Promise<string> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);
  return response.data.token;
};

// ─────────────────────────────────────────
// LOGOUT
// Côté frontend uniquement — on nettoie le stockage local
// ─────────────────────────────────────────

export const logout = async (): Promise<void> => {
  await removeToken();
  localStorage.removeItem("bidiws_user");
};

// ─────────────────────────────────────────
// ME — Récupérer l'utilisateur connecté
// GET /utilisateurs/moi
// ─────────────────────────────────────────

export const getMe = async (): Promise<Utilisateur> => {
  const response = await apiClient.get<Utilisateur>("/utilisateurs/moi");
  return response.data;
};

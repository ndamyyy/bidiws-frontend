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
  setToken(response.data.token);
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
// LOGOUT
// Côté frontend uniquement — on nettoie le localStorage
// ─────────────────────────────────────────

export const logout = (): void => {
  removeToken();
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

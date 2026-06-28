// ============================================================
// BIDIWS — API Authentification
// Fichier : src/api/auth.api.ts
// ============================================================

import apiClient, { removeToken, setToken } from "./axios";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types";

// ─────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);
  setToken(response.data.token);
  return response.data;
};

// ─────────────────────────────────────────
// REGISTER
// POST /api/auth/register
// ─────────────────────────────────────────

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/register", data);
  setToken(response.data.token);
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
// GET /api/auth/me
// ─────────────────────────────────────────

export const getMe = async (): Promise<AuthResponse["utilisateur"]> => {
  const response = await apiClient.get<AuthResponse["utilisateur"]>("/auth/me");
  return response.data;
};

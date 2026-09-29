// ============================================================
// BIDIWS — API Authentification
// Fichier : src/api/auth.api.ts
// ============================================================

import apiClient, { removeToken, setToken } from "./axios";
import type { AuthResponse, InscriptionResponse, LoginRequest, RegisterRequest, Utilisateur } from "../types";

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
// Ne connecte pas automatiquement — pas de token renvoyé. Le
// rattachement à une résidence (si une adresse est fournie) est
// désormais fait par le backend lui-même, atomiquement avec la
// création du compte — voir InscriptionResponse.
// ─────────────────────────────────────────

export const register = async (data: RegisterRequest): Promise<InscriptionResponse> => {
  const response = await apiClient.post<InscriptionResponse>("/auth/register", data);
  return response.data;
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

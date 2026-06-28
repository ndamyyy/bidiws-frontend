// ============================================================
// BIDIWS — Instance Axios + intercepteurs JWT
// Fichier : src/api/axios.ts
// ============================================================

import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────

const BASE_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "http://localhost:8080/api";
const TOKEN_KEY = "bidiws_token";

// ─────────────────────────────────────────
// HELPERS TOKEN
// ─────────────────────────────────────────

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// ─────────────────────────────────────────
// INSTANCE AXIOS
// ─────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─────────────────────────────────────────
// INTERCEPTEUR REQUÊTE
// Ajoute automatiquement le token JWT
// à chaque requête sortante
// ─────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────
// INTERCEPTEUR RÉPONSE
// Gère les erreurs globales :
// 401 → déconnexion + redirect login
// 403 → accès refusé
// 500 → erreur serveur
// ─────────────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expiré ou invalide → on nettoie et redirige
      removeToken();
      localStorage.removeItem("bidiws_user");
      window.location.href = "/login";
    }

    if (status === 403) {
      console.error("BIDIWS — Accès refusé :", error.response?.data?.message);
    }

    if (status === 500) {
      console.error("BIDIWS — Erreur serveur :", error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// ============================================================
// BIDIWS — API Tournées
// Fichier : src/api/tournees.api.ts
// ============================================================

import apiClient from "./axios";
import type { Tournee, TourneeRequest } from "../types";

// ─────────────────────────────────────────
// TOURNÉES DU JOUR
// GET /tournees?date=YYYY-MM-DD
// ─────────────────────────────────────────

export const getTourneesAujourdhui = async (): Promise<Tournee[]> => {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const response = await apiClient.get<Tournee[]>("/tournees", {
    params: { date },
  });
  return response.data;
};

// ─────────────────────────────────────────
// MA TOURNÉE (chauffeur connecté)
// GET /tournees?chauffeurId=X
// chauffeurId à récupérer via /utilisateurs/moi (auth.api.ts::getMe)
// ─────────────────────────────────────────

export const getMaTournee = async (chauffeurId: number): Promise<Tournee[]> => {
  const response = await apiClient.get<Tournee[]>("/tournees", {
    params: { chauffeurId },
  });
  return response.data;
};

// ─────────────────────────────────────────
// UNE TOURNÉE PAR ID
// GET /tournees/:id
// ─────────────────────────────────────────

export const getTourneeById = async (id: number): Promise<Tournee> => {
  const response = await apiClient.get<Tournee>(`/tournees/${id}`);
  return response.data;
};

// ─────────────────────────────────────────
// TOUTES LES TOURNÉES
// GET /tournees (SANS pagination, params date/chauffeurId optionnels)
// ─────────────────────────────────────────

export const getAllTournees = async (
  params?: { date?: string; chauffeurId?: number }
): Promise<Tournee[]> => {
  const response = await apiClient.get<Tournee[]>("/tournees", { params });
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER UNE TOURNÉE
// POST /tournees
// ─────────────────────────────────────────

export const createTournee = async (data: TourneeRequest): Promise<Tournee> => {
  const response = await apiClient.post<Tournee>("/tournees", data);
  return response.data;
};

// ─────────────────────────────────────────
// DÉMARRER UNE TOURNÉE
// PATCH /tournees/:id/demarrer
// ─────────────────────────────────────────

export const demarrerTournee = async (id: number): Promise<Tournee> => {
  const response = await apiClient.patch<Tournee>(`/tournees/${id}/demarrer`);
  return response.data;
};

// ─────────────────────────────────────────
// TERMINER UNE TOURNÉE
// PATCH /tournees/:id/terminer
// ─────────────────────────────────────────

export const terminerTournee = async (id: number): Promise<Tournee> => {
  const response = await apiClient.patch<Tournee>(`/tournees/${id}/terminer`);
  return response.data;
};

// ─────────────────────────────────────────
// ANNULER UNE TOURNÉE
// PATCH /tournees/:id/annuler
// ─────────────────────────────────────────

export const annulerTournee = async (id: number): Promise<Tournee> => {
  const response = await apiClient.patch<Tournee>(`/tournees/${id}/annuler`);
  return response.data;
};

// ============================================================
// BIDIWS — API Tournées
// Fichier : src/api/tournees.api.ts
// ============================================================

import apiClient from "./axios";
import type { Tournee, TourneeRequest, PageResponse } from "../types";

// ─────────────────────────────────────────
// TOURNÉES DU JOUR
// GET /api/tournees/today
// ─────────────────────────────────────────

export const getTourneesAujourdhui = async (): Promise<Tournee[]> => {
  const response = await apiClient.get<Tournee[]>("/tournees/today");
  return response.data;
};

// ─────────────────────────────────────────
// MA TOURNÉE (chauffeur connecté)
// GET /api/tournees/ma-tournee
// ─────────────────────────────────────────

export const getMaTournee = async (): Promise<Tournee> => {
  const response = await apiClient.get<Tournee>("/tournees/ma-tournee");
  return response.data;
};

// ─────────────────────────────────────────
// UNE TOURNÉE PAR ID
// GET /api/tournees/:id
// ─────────────────────────────────────────

export const getTourneeById = async (id: number): Promise<Tournee> => {
  const response = await apiClient.get<Tournee>(`/tournees/${id}`);
  return response.data;
};

// ─────────────────────────────────────────
// TOUTES LES TOURNÉES (paginées)
// GET /api/tournees
// ─────────────────────────────────────────

export const getAllTournees = async (
  page: number = 0,
  size: number = 10
): Promise<PageResponse<Tournee>> => {
  const response = await apiClient.get<PageResponse<Tournee>>("/tournees", {
    params: { page, size },
  });
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER UNE TOURNÉE
// POST /api/tournees
// ─────────────────────────────────────────

export const createTournee = async (data: TourneeRequest): Promise<Tournee> => {
  const response = await apiClient.post<Tournee>("/tournees", data);
  return response.data;
};

// ─────────────────────────────────────────
// DÉMARRER UNE TOURNÉE
// PUT /api/tournees/:id/demarrer
// ─────────────────────────────────────────

export const demarrerTournee = async (id: number): Promise<Tournee> => {
  const response = await apiClient.put<Tournee>(`/tournees/${id}/demarrer`);
  return response.data;
};

// ─────────────────────────────────────────
// TERMINER UNE TOURNÉE
// PUT /api/tournees/:id/terminer
// ─────────────────────────────────────────

export const terminerTournee = async (id: number): Promise<Tournee> => {
  const response = await apiClient.put<Tournee>(`/tournees/${id}/terminer`);
  return response.data;
};
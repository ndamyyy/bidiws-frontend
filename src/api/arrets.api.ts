// ============================================================
// BIDIWS — API Arrêts
// Fichier : src/api/arrets.api.ts
// ============================================================

import apiClient from "./axios";
import type { Arret, ArretValiderRequest, SignalGpsRequest } from "../types";

// ─────────────────────────────────────────
// ARRÊTS D'UNE TOURNÉE
// GET /api/tournees/:tourneeId/arrets
// ─────────────────────────────────────────

export const getArretsByTournee = async (tourneeId: number): Promise<Arret[]> => {
  const response = await apiClient.get<Arret[]>(
    `/tournees/${tourneeId}/arrets`
  );
  return response.data;
};

// ─────────────────────────────────────────
// UN ARRÊT PAR ID
// GET /api/arrets/:id
// ─────────────────────────────────────────

export const getArretById = async (id: number): Promise<Arret> => {
  const response = await apiClient.get<Arret>(`/arrets/${id}`);
  return response.data;
};

// ─────────────────────────────────────────
// ARRÊTS D'UNE RÉSIDENCE (historique)
// GET /api/residences/:residenceId/arrets
// ─────────────────────────────────────────

export const getArretsByResidence = async (
  residenceId: number
): Promise<Arret[]> => {
  const response = await apiClient.get<Arret[]>(
    `/residences/${residenceId}/arrets`
  );
  return response.data;
};

// ─────────────────────────────────────────
// VALIDER UN ARRÊT (chauffeur)
// PUT /api/arrets/:id/valider
// ─────────────────────────────────────────

export const validerArret = async (
  id: number,
  data: ArretValiderRequest
): Promise<Arret> => {
  const response = await apiClient.put<Arret>(`/arrets/${id}/valider`, data);
  return response.data;
};

// ─────────────────────────────────────────
// SIGNALER UN INCIDENT SUR UN ARRÊT
// PUT /api/arrets/:id/incident
// ─────────────────────────────────────────

export interface IncidentRequest {
  description : string;
  photoUrl   ?: string;
}

export const signalerIncident = async (
  id: number,
  data: IncidentRequest
): Promise<Arret> => {
  const response = await apiClient.put<Arret>(`/arrets/${id}/incident`, data);
  return response.data;
};

// ─────────────────────────────────────────
// ENVOYER UN SIGNAL GPS
// POST /api/arrets/gps
// ─────────────────────────────────────────

export const envoyerSignalGps = async (
  tourneeId: number,
  data: SignalGpsRequest
): Promise<void> => {
  await apiClient.post(`/tournees/${tourneeId}/gps`, data);
};
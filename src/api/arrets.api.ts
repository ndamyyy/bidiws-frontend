// ============================================================
// BIDIWS — API Arrêts
// Fichier : src/api/arrets.api.ts
// ============================================================

import apiClient from "./axios";
import type { Arret, ArretConteneur, ArretRequest, StatutArret, SignalGpsRequest } from "../types";

// ─────────────────────────────────────────
// ARRÊTS D'UNE TOURNÉE
// GET /arrets/tournee/:tourneeId
// ─────────────────────────────────────────

export const getArretsByTournee = async (tourneeId: number): Promise<Arret[]> => {
  const response = await apiClient.get<Arret[]>(
    `/arrets/tournee/${tourneeId}`
  );
  return response.data;
};

// ─────────────────────────────────────────
// UN ARRÊT PAR ID
// GET /arrets/:id
// ─────────────────────────────────────────

export const getArretById = async (id: number): Promise<Arret> => {
  const response = await apiClient.get<Arret>(`/arrets/${id}`);
  return response.data;
};

// ─────────────────────────────────────────
// ARRÊTS D'UNE RÉSIDENCE (historique)
// GET /arrets/residence/:residenceId
// ─────────────────────────────────────────

export const getArretsByResidence = async (
  residenceId: number
): Promise<Arret[]> => {
  const response = await apiClient.get<Arret[]>(
    `/arrets/residence/${residenceId}`
  );
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER UN ARRÊT
// POST /arrets
// ─────────────────────────────────────────

export const createArret = async (data: ArretRequest): Promise<Arret> => {
  const response = await apiClient.post<Arret>("/arrets", data);
  return response.data;
};

// ─────────────────────────────────────────
// CONTENEURS D'UN ARRÊT (détail par bac)
// GET /arrets/:id/conteneurs
// ─────────────────────────────────────────

export const getConteneursByArret = async (id: number): Promise<ArretConteneur[]> => {
  const response = await apiClient.get<ArretConteneur[]>(`/arrets/${id}/conteneurs`);
  return response.data;
};

// ─────────────────────────────────────────
// CHANGER LE STATUT D'UN ARRÊT (chauffeur)
// PATCH /arrets/:id/statut?statut=X
// ─────────────────────────────────────────

export const validerArret = async (
  id: number,
  statut: StatutArret
): Promise<Arret> => {
  const response = await apiClient.patch<Arret>(
    `/arrets/${id}/statut`,
    null,
    { params: { statut } }
  );
  return response.data;
};

// ─────────────────────────────────────────
// SIGNALER UN INCIDENT SUR UN ARRÊT
// PATCH /arrets/:id/incident
// ─────────────────────────────────────────

export interface IncidentRequest {
  descriptionIncident : string;
  photoIncidentUrl   ?: string;
}

export const signalerIncident = async (
  id: number,
  data: IncidentRequest
): Promise<Arret> => {
  const response = await apiClient.patch<Arret>(`/arrets/${id}/incident`, data);
  return response.data;
};

// ─────────────────────────────────────────
// ENVOYER UN SIGNAL GPS
// POST /signaux-gps (tourneeId dans le body)
// ─────────────────────────────────────────

export const envoyerSignalGps = async (data: SignalGpsRequest): Promise<void> => {
  await apiClient.post("/signaux-gps", data);
};

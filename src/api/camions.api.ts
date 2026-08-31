// ============================================================
// BIDIWS — API Camions
// Fichier : src/api/camions.api.ts
// Formes confirmées contre CamionController/CamionRequestDto/
// CamionResponseDto (backend). Accès réservé ADMIN + MAIRIE (MAIRIE
// scopé à sa propre ville côté backend, jamais exposé à un autre rôle).
// ============================================================

import apiClient from "./axios";
import type { Camion } from "../types";

// ─────────────────────────────────────────
// LISTE DE TOUS LES CAMIONS
// GET /camions
// ─────────────────────────────────────────

export const getAllCamions = async (): Promise<Camion[]> => {
  const response = await apiClient.get<Camion[]>("/camions");
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER / MODIFIER UN CAMION
// POST /camions · PUT /camions/:id
// villeId est obligatoire côté backend (@NotNull sur CamionRequestDto),
// jamais optionnel malgré l'hypothèse de départ.
// ─────────────────────────────────────────

export interface CamionRequest {
  immatriculation : string;
  modele         ?: string;
  typeBenne      ?: string;
  capaciteTonnes ?: number;
  gpsActif        : boolean;
  capteurBenne    : boolean;
  villeId         : number;
}

export const createCamion = async (data: CamionRequest): Promise<Camion> => {
  const response = await apiClient.post<Camion>("/camions", data);
  return response.data;
};

export const updateCamion = async (id: number, data: CamionRequest): Promise<Camion> => {
  const response = await apiClient.put<Camion>(`/camions/${id}`, data);
  return response.data;
};

// ─────────────────────────────────────────
// DÉSACTIVER UN CAMION
// PATCH /camions/:id/desactiver
// Rejeté par le backend (409) si un chauffeur est actuellement affecté
// au camion, ou si le camion est sur une tournée EN_COURS.
// ─────────────────────────────────────────

export const desactiverCamion = async (id: number): Promise<void> => {
  await apiClient.patch(`/camions/${id}/desactiver`);
};

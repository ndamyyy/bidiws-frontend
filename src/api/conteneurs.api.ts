// ============================================================
// BIDIWS — API Conteneurs
// Fichier : src/api/conteneurs.api.ts
// Pas de GET liste à plat côté backend (ConteneurController) —
// uniquement scopé par résidence, ou par id. Formes confirmées contre
// ConteneurRequestDto/ConteneurResponseDto (backend) — pas de champ
// "niveau de remplissage", absent du DTO.
// ============================================================

import apiClient from "./axios";
import type { Conteneur } from "../types";

// ─────────────────────────────────────────
// CONTENEURS D'UNE RÉSIDENCE
// GET /conteneurs/residence/:residenceId
// ─────────────────────────────────────────

export const getConteneursByResidence = async (
  residenceId: number
): Promise<Conteneur[]> => {
  const response = await apiClient.get<Conteneur[]>(`/conteneurs/residence/${residenceId}`);
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER / MODIFIER UN CONTENEUR
// POST /conteneurs · PUT /conteneurs/:id
// ─────────────────────────────────────────

export interface ConteneurRequest {
  code        : string;
  residenceId : number;
  rfidTag    ?: string;
}

export const createConteneur = async (data: ConteneurRequest): Promise<Conteneur> => {
  const response = await apiClient.post<Conteneur>("/conteneurs", data);
  return response.data;
};

export const updateConteneur = async (id: number, data: ConteneurRequest): Promise<Conteneur> => {
  const response = await apiClient.put<Conteneur>(`/conteneurs/${id}`, data);
  return response.data;
};

// ─────────────────────────────────────────
// DÉSACTIVER UN CONTENEUR
// PATCH /conteneurs/:id/desactiver
// ─────────────────────────────────────────

export const desactiverConteneur = async (id: number): Promise<void> => {
  await apiClient.patch(`/conteneurs/${id}/desactiver`);
};

// ============================================================
// BIDIWS — API Résidences
// Fichier : src/api/residences.api.ts
// ============================================================

import apiClient from "./axios";
import type { Residence } from "../types";

// ─────────────────────────────────────────
// LISTE TOUTES LES RÉSIDENCES
// GET /residences
// ─────────────────────────────────────────

export const getAllResidences = async (): Promise<Residence[]> => {
  const response = await apiClient.get<Residence[]>("/residences");
  return response.data;
};

// ─────────────────────────────────────────
// UNE RÉSIDENCE PAR ID
// GET /residences/:id
// ─────────────────────────────────────────

export const getResidenceById = async (id: number): Promise<Residence> => {
  const response = await apiClient.get<Residence>(`/residences/${id}`);
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER UNE RÉSIDENCE (admin / syndic)
// POST /residences
// ─────────────────────────────────────────

export interface ResidenceRequest {
  nom             : string;
  adresse         : string;
  complement     ?: string;
  codePostal      : string;
  villeId         : number;
  zoneId         ?: number;
  latitude       ?: number;
  longitude      ?: number;
  rayonDetection ?: number;
  nbConteneurs   ?: number;
}

export const createResidence = async (
  data: ResidenceRequest
): Promise<Residence> => {
  const response = await apiClient.post<Residence>("/residences", data);
  return response.data;
};

// ─────────────────────────────────────────
// MODIFIER UNE RÉSIDENCE
// PUT /residences/:id
// ─────────────────────────────────────────

export const updateResidence = async (
  id: number,
  data: Partial<ResidenceRequest>
): Promise<Residence> => {
  const response = await apiClient.put<Residence>(`/residences/${id}`, data);
  return response.data;
};

// ─────────────────────────────────────────
// ASSIGNER UN GARDIEN À UNE RÉSIDENCE
// POST /residence-gardiens
// ─────────────────────────────────────────

export const assignerGardien = async (
  residenceId: number,
  gardienId: number,
  principal: boolean = true
): Promise<void> => {
  await apiClient.post("/residence-gardiens", {
    residenceId,
    gardienId,
    principal,
  });
};

// ─────────────────────────────────────────
// RÉSIDENCES D'UN GARDIEN
// GET /residence-gardiens/gardien/:gardienId
// Forme du DTO NON vérifiée contre le backend réel (pas de compte de
// test disponible pour cette session) — supposée dénormalisée avec le
// nom de résidence par analogie avec les autres réponses de liens du
// projet (ex: ArretConteneur). À confirmer/ajuster au premier test réel.
// ─────────────────────────────────────────

export interface ResidenceGardien {
  residenceId : number;
  residenceNom: string;
  gardienId   : number;
  principal   : boolean;
}

export const getResidencesByGardien = async (
  gardienId: number
): Promise<ResidenceGardien[]> => {
  const response = await apiClient.get<ResidenceGardien[]>(
    `/residence-gardiens/gardien/${gardienId}`
  );
  return response.data;
};

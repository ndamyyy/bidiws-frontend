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
// Forme confirmée en conditions réelles (compte gardien de test), y
// compris gardienNom/gardienPrenom.
// ─────────────────────────────────────────

export interface ResidenceGardien {
  residenceId   : number;
  residenceNom  : string;
  gardienId     : number;
  gardienNom   ?: string;
  gardienPrenom?: string;
  principal     : boolean;
}

export const getResidencesByGardien = async (
  gardienId: number
): Promise<ResidenceGardien[]> => {
  const response = await apiClient.get<ResidenceGardien[]>(
    `/residence-gardiens/gardien/${gardienId}`
  );
  return response.data;
};

// ─────────────────────────────────────────
// GARDIENS D'UNE RÉSIDENCE
// GET /residence-gardiens/residence/:residenceId
// Sens inverse de getResidencesByGardien, jamais testé dans ce sens —
// même DTO ResidenceGardien supposé par analogie (même contrôleur).
// ─────────────────────────────────────────

export const getGardiensByResidence = async (
  residenceId: number
): Promise<ResidenceGardien[]> => {
  const response = await apiClient.get<ResidenceGardien[]>(
    `/residence-gardiens/residence/${residenceId}`
  );
  return response.data;
};

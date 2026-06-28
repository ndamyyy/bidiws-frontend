// ============================================================
// BIDIWS — API Résidences
// Fichier : src/api/residences.api.ts
// ============================================================

import apiClient from "./axios";
import type { Residence, PageResponse } from "../types";

// ─────────────────────────────────────────
// LISTE TOUTES LES RÉSIDENCES
// GET /api/residences
// ─────────────────────────────────────────

export const getAllResidences = async (
  page: number = 0,
  size: number = 20
): Promise<PageResponse<Residence>> => {
  const response = await apiClient.get<PageResponse<Residence>>("/residences", {
    params: { page, size },
  });
  return response.data;
};

// ─────────────────────────────────────────
// UNE RÉSIDENCE PAR ID
// GET /api/residences/:id
// ─────────────────────────────────────────

export const getResidenceById = async (id: number): Promise<Residence> => {
  const response = await apiClient.get<Residence>(`/residences/${id}`);
  return response.data;
};

// ─────────────────────────────────────────
// MES RÉSIDENCES (pour le gardien connecté)
// GET /api/residences/mes-residences
// ─────────────────────────────────────────

export const getMesResidences = async (): Promise<Residence[]> => {
  const response = await apiClient.get<Residence[]>("/residences/mes-residences");
  return response.data;
};

// ─────────────────────────────────────────
// RÉSIDENCES PAR ZONE
// GET /api/residences/zone/:zoneId
// ─────────────────────────────────────────

export const getResidencesByZone = async (zoneId: number): Promise<Residence[]> => {
  const response = await apiClient.get<Residence[]>(`/residences/zone/${zoneId}`);
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER UNE RÉSIDENCE (admin / syndic)
// POST /api/residences
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
// PUT /api/residences/:id
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
// POST /api/residences/:id/gardiens/:gardienId
// ─────────────────────────────────────────

export const assignerGardien = async (
  residenceId: number,
  gardienId: number,
  principal: boolean = true
): Promise<void> => {
  await apiClient.post(`/residences/${residenceId}/gardiens/${gardienId}`, {
    principal,
  });
};
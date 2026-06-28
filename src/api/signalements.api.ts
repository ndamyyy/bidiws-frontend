// ============================================================
// BIDIWS — API Signalements
// Fichier : src/api/signalements.api.ts
// ============================================================

import apiClient from "./axios";
import type { Signalement, SignalementRequest, PageResponse } from "../types";

// ─────────────────────────────────────────
// CRÉER UN SIGNALEMENT
// POST /api/signalements
// ─────────────────────────────────────────

export const createSignalement = async (
  data: SignalementRequest
): Promise<Signalement> => {
  const response = await apiClient.post<Signalement>("/signalements", data);
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER UN SIGNALEMENT AVEC PHOTO
// POST /api/signalements (multipart/form-data)
// ─────────────────────────────────────────

export const createSignalementAvecPhoto = async (
  data: SignalementRequest,
  photo: File
): Promise<Signalement> => {
  const formData = new FormData();
  formData.append("photo", photo);
  formData.append(
    "signalement",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );

  const response = await apiClient.post<Signalement>(
    "/signalements/avec-photo",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

// ─────────────────────────────────────────
// MES SIGNALEMENTS
// GET /api/signalements/me
// ─────────────────────────────────────────

export const getMesSignalements = async (
  page: number = 0,
  size: number = 10
): Promise<PageResponse<Signalement>> => {
  const response = await apiClient.get<PageResponse<Signalement>>(
    "/signalements/me",
    { params: { page, size } }
  );
  return response.data;
};

// ─────────────────────────────────────────
// TOUS LES SIGNALEMENTS (syndic / admin)
// GET /api/signalements
// ─────────────────────────────────────────

export const getAllSignalements = async (
  page: number = 0,
  size: number = 10
): Promise<PageResponse<Signalement>> => {
  const response = await apiClient.get<PageResponse<Signalement>>(
    "/signalements",
    { params: { page, size } }
  );
  return response.data;
};

// ─────────────────────────────────────────
// CHANGER STATUT D'UN SIGNALEMENT (admin)
// PUT /api/signalements/:id/statut
// ─────────────────────────────────────────

export const updateStatutSignalement = async (
  id: number,
  statut: string
): Promise<Signalement> => {
  const response = await apiClient.put<Signalement>(
    `/signalements/${id}/statut`,
    { statut }
  );
  return response.data;
};
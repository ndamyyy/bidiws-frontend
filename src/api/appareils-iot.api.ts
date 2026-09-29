// ============================================================
// BIDIWS — API Appareils IoT
// Fichier : src/api/appareils-iot.api.ts
// Formes confirmées contre AppareilIotController/Service (backend) —
// contrôleur entièrement réservé au rôle ADMIN.
// ============================================================

import apiClient from "./axios";
import type {
  AppareilIot,
  AppareilIotCreeResponse,
  AppareilIotImportResultat,
  AppareilIotRequest,
} from "../types";

// ─────────────────────────────────────────
// LISTE DE TOUS LES APPAREILS
// GET /appareils-iot
// ─────────────────────────────────────────

export const getAllAppareilsIot = async (): Promise<AppareilIot[]> => {
  const response = await apiClient.get<AppareilIot[]>("/appareils-iot");
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER UN APPAREIL
// POST /appareils-iot
// Renvoie la cléApi en clair, une seule fois.
// ─────────────────────────────────────────

export const createAppareilIot = async (
  data: AppareilIotRequest
): Promise<AppareilIotCreeResponse> => {
  const response = await apiClient.post<AppareilIotCreeResponse>("/appareils-iot", data);
  return response.data;
};

// ─────────────────────────────────────────
// IMPORTER UN LOT D'APPAREILS DEPUIS UN CSV
// POST /appareils-iot/import (multipart, champ "file")
// Une ligne par appareil, mêmes champs que la création unitaire —
// résumé détaillé (créés + échecs avec raison), aucune ligne ne bloque
// les autres côté backend.
// ─────────────────────────────────────────

export const importerAppareilsIotCsv = async (
  file: File
): Promise<AppareilIotImportResultat> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<AppareilIotImportResultat>(
    "/appareils-iot/import",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

// ─────────────────────────────────────────
// DÉSACTIVER UN APPAREIL
// PATCH /appareils-iot/:id/desactiver
// ─────────────────────────────────────────

export const desactiverAppareilIot = async (id: number): Promise<void> => {
  await apiClient.patch(`/appareils-iot/${id}/desactiver`);
};

// ─────────────────────────────────────────
// RÉGÉNÉRER LA CLÉ D'UN APPAREIL
// POST /appareils-iot/:id/regenerer-cle
// Même forme de réponse que la création — nouvelle clé en clair, une
// seule fois, l'ancienne cesse immédiatement de fonctionner.
// ─────────────────────────────────────────

export const regenererCleAppareilIot = async (
  id: number
): Promise<AppareilIotCreeResponse> => {
  const response = await apiClient.post<AppareilIotCreeResponse>(
    `/appareils-iot/${id}/regenerer-cle`
  );
  return response.data;
};

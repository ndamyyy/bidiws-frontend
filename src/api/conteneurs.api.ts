// ============================================================
// BIDIWS — API Conteneurs
// Fichier : src/api/conteneurs.api.ts
// Pas de GET liste à plat côté backend (ConteneurController) —
// uniquement scopé par résidence, ou par id.
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

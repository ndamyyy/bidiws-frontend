// ============================================================
// BIDIWS — API Camions
// Fichier : src/api/camions.api.ts
// ============================================================

import apiClient from "./axios";
import type { Camion } from "../types";

// ─────────────────────────────────────────
// LISTE DE TOUS LES CAMIONS
// GET /camions
// Non vérifié en conditions réelles : renvoie 403 avec les comptes
// gardien/chauffeur disponibles cette session (accès réservé à un
// rôle plus privilégié, cohérent). À confirmer avec un compte admin.
// ─────────────────────────────────────────

export const getAllCamions = async (): Promise<Camion[]> => {
  const response = await apiClient.get<Camion[]>("/camions");
  return response.data;
};

// ============================================================
// BIDIWS — API Villes
// Fichier : src/api/villes.api.ts
// ============================================================

import apiClient from "./axios";
import type { Ville } from "../types";

// ─────────────────────────────────────────
// LISTE DE TOUTES LES VILLES
// GET /villes
// Le champ "actif" du type Ville n'apparaît pas dans la réponse
// observée en conditions réelles (id/nom/codePostal/departement
// seulement) — sans impact ici (non utilisé sur cette page).
// ─────────────────────────────────────────

export const getAllVilles = async (): Promise<Ville[]> => {
  const response = await apiClient.get<Ville[]>("/villes");
  return response.data;
};

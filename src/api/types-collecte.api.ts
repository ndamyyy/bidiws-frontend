// ============================================================
// BIDIWS — API Types de collecte
// Fichier : src/api/types-collecte.api.ts
// ============================================================

import apiClient from "./axios";
import type { TypeCollecte } from "../types";

// ─────────────────────────────────────────
// LISTE DE TOUS LES TYPES DE COLLECTE
// GET /types-collecte
// Forme confirmée en conditions réelles (200, correspond exactement au
// type TypeCollecte déjà existant : id/code/libelle/couleur/icone).
// ─────────────────────────────────────────

export const getAllTypesCollecte = async (): Promise<TypeCollecte[]> => {
  const response = await apiClient.get<TypeCollecte[]>("/types-collecte");
  return response.data;
};

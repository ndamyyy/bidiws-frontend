// ============================================================
// BIDIWS — API Utilisateurs (admin)
// Fichier : src/api/admin-utilisateurs.api.ts
// ============================================================

import apiClient from "./axios";
import type { Utilisateur } from "../types";

// ─────────────────────────────────────────
// LISTE DE TOUS LES UTILISATEURS
// GET /admin/utilisateurs (ROLE_ADMIN)
// ─────────────────────────────────────────

export const getAllUtilisateurs = async (): Promise<Utilisateur[]> => {
  const response = await apiClient.get<Utilisateur[]>("/admin/utilisateurs");
  return response.data;
};

// ─────────────────────────────────────────
// DÉSACTIVER UN UTILISATEUR
// PATCH /admin/utilisateurs/:id/desactiver (ROLE_ADMIN)
// Confirmé en conditions réelles : 204 No Content, pas de corps —
// l'appelant doit refetch (invalidateQueries) pour voir le nouvel état.
// ─────────────────────────────────────────

export const desactiverUtilisateur = async (id: number): Promise<void> => {
  await apiClient.patch(`/admin/utilisateurs/${id}/desactiver`);
};

// ─────────────────────────────────────────
// ACTIVER UN UTILISATEUR
// PATCH /admin/utilisateurs/:id/activer (ROLE_ADMIN)
// Confirmé en conditions réelles : 204 No Content, pas de corps.
// ─────────────────────────────────────────

export const activerUtilisateur = async (id: number): Promise<void> => {
  await apiClient.patch(`/admin/utilisateurs/${id}/activer`);
};

// ============================================================
// BIDIWS — API Signalements
// Fichier : src/api/signalements.api.ts
// ============================================================

import apiClient from "./axios";
import type { Signalement, SignalementRequest, StatutSignalement } from "../types";

// ─────────────────────────────────────────
// CRÉER UN SIGNALEMENT
// POST /signalements
// photoUrl (si besoin) est une simple chaîne dans le body —
// l'upload de la photo elle-même est un sujet séparé
// ─────────────────────────────────────────

export const createSignalement = async (
  data: SignalementRequest
): Promise<Signalement> => {
  const response = await apiClient.post<Signalement>("/signalements", data);
  return response.data;
};

// ─────────────────────────────────────────
// SIGNALEMENTS D'UN AUTEUR
// GET /signalements/auteur/:auteurId
// auteurId à récupérer via /utilisateurs/moi (auth.api.ts::getMe)
// ─────────────────────────────────────────

export const getSignalementsByAuteur = async (
  auteurId: number
): Promise<Signalement[]> => {
  const response = await apiClient.get<Signalement[]>(
    `/signalements/auteur/${auteurId}`
  );
  return response.data;
};

// ─────────────────────────────────────────
// TOUS LES SIGNALEMENTS (syndic / admin)
// GET /signalements (SANS pagination)
// ─────────────────────────────────────────

export const getAllSignalements = async (): Promise<Signalement[]> => {
  const response = await apiClient.get<Signalement[]>("/signalements");
  return response.data;
};

// ─────────────────────────────────────────
// CHANGER STATUT D'UN SIGNALEMENT (admin)
// PATCH /signalements/:id/statut?statut=X
// ─────────────────────────────────────────

export const updateStatutSignalement = async (
  id: number,
  statut: StatutSignalement
): Promise<Signalement> => {
  const response = await apiClient.patch<Signalement>(
    `/signalements/${id}/statut`,
    null,
    { params: { statut } }
  );
  return response.data;
};

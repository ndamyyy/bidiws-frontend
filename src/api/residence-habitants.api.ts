// ============================================================
// BIDIWS — API Résidences ↔ Habitants
// Fichier : src/api/residence-habitants.api.ts
// ============================================================

import apiClient from "./axios";

// ─────────────────────────────────────────
// RÉSIDENCES D'UN HABITANT
// GET /residence-habitants/habitant/:habitantId
// Forme du DTO NON vérifiée contre le backend réel (aucun compte
// habitant de test disponible cette session) — supposée dénormalisée
// par analogie avec /residence-gardiens/gardien/:id (même famille de
// contrôleur, confirmé pour celui-là). À confirmer/ajuster au premier
// test réel — ne pas faire confiance à cette analogie sans vérifier.
// ─────────────────────────────────────────

export interface ResidenceHabitant {
  residenceId    : number;
  residenceNom   : string;
  habitantId     : number;
  habitantNom    : string;
  habitantPrenom : string;
}

export const getResidencesByHabitant = async (
  habitantId: number
): Promise<ResidenceHabitant[]> => {
  const response = await apiClient.get<ResidenceHabitant[]>(
    `/residence-habitants/habitant/${habitantId}`
  );
  return response.data;
};

// ─────────────────────────────────────────
// CHANGER LA RÉSIDENCE D'UN HABITANT (déménagement)
// PUT /residence-habitants
// Retire tout lien existant côté backend avant de poser le nouveau —
// un habitant ne se retrouve jamais avec deux résidences actives à la
// fois (voir ResidenceHabitantService.changerResidence).
// ─────────────────────────────────────────

export const changerResidenceHabitant = async (
  residenceId: number,
  habitantId: number
): Promise<ResidenceHabitant> => {
  const response = await apiClient.put<ResidenceHabitant>(
    "/residence-habitants",
    { residenceId, habitantId }
  );
  return response.data;
};

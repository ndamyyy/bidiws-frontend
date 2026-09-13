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
// CHANGER LA RÉSIDENCE D'UN HABITANT (déménagement, ou rattachement
// initial à l'inscription)
// PUT /residence-habitants
// Retire tout lien existant côté backend avant de poser le nouveau —
// un habitant ne se retrouve jamais avec deux résidences actives à la
// fois (voir ResidenceHabitantService.changerResidence). Ouvert à
// l'habitant lui-même côté backend (isSelf), pas seulement aux
// gestionnaires de la résidence.
//
// `token` optionnel : RegisterPage appelle ceci juste après la création
// du compte, avant que l'utilisateur soit connecté dans l'app (pas de
// token en storage) — un jeton obtenu ponctuellement via
// loginSansPersistance() est alors passé explicitement, sans jamais
// être stocké. Omis, le comportement est inchangé (jeton de la session
// en cours, comme AdminUsersPage).
// ─────────────────────────────────────────

export const changerResidenceHabitant = async (
  residenceId: number,
  habitantId: number,
  token?: string
): Promise<ResidenceHabitant> => {
  const response = await apiClient.put<ResidenceHabitant>(
    "/residence-habitants",
    { residenceId, habitantId },
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  return response.data;
};

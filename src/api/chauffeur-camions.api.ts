// ============================================================
// BIDIWS — API Affectations Chauffeur-Camion
// Fichier : src/api/chauffeur-camions.api.ts
// Rattachement chauffeur↔camion de longue durée — distinct de
// l'affectation ponctuelle d'une tournée (tournee.api.ts). Formes
// confirmées contre ChauffeurCamionController/RequestDto/ResponseDto
// (backend). Pas de GET liste à plat : uniquement scopé par chauffeur
// ou par camion.
// ============================================================

import apiClient from "./axios";
import type { ChauffeurCamion } from "../types";

// ─────────────────────────────────────────
// AFFECTER UN CHAUFFEUR À UN CAMION
// POST /chauffeur-camions
// Rejeté (409) si le camion a déjà un chauffeur actif, ou si le
// chauffeur conduit déjà un autre camion (au plus une affectation
// active par camion ET par chauffeur, contrainte backend).
// ─────────────────────────────────────────

export interface ChauffeurCamionRequest {
  chauffeurId : number;
  camionId    : number;
  dateDebut   : string; // "YYYY-MM-DD"
  dateFin    ?: string; // "YYYY-MM-DD"
}

export const affecterChauffeurCamion = async (
  data: ChauffeurCamionRequest
): Promise<ChauffeurCamion> => {
  const response = await apiClient.post<ChauffeurCamion>("/chauffeur-camions", data);
  return response.data;
};

// ─────────────────────────────────────────
// TERMINER UNE AFFECTATION
// PATCH /chauffeur-camions/terminer?chauffeurId=X&camionId=Y
// Termine l'affectation active (dateFin = aujourd'hui) — les deux ids
// sont requis, pas un id d'affectation dédié (pas de PK exposée).
// ─────────────────────────────────────────

export const terminerAffectation = async (
  chauffeurId: number,
  camionId: number
): Promise<ChauffeurCamion> => {
  const response = await apiClient.patch<ChauffeurCamion>(
    "/chauffeur-camions/terminer",
    null,
    { params: { chauffeurId, camionId } }
  );
  return response.data;
};

// ─────────────────────────────────────────
// AFFECTATIONS D'UN CHAUFFEUR (historique complet, actives et
// terminées)
// GET /chauffeur-camions/chauffeur/:chauffeurId
// ─────────────────────────────────────────

export const getAffectationsByChauffeur = async (
  chauffeurId: number
): Promise<ChauffeurCamion[]> => {
  const response = await apiClient.get<ChauffeurCamion[]>(
    `/chauffeur-camions/chauffeur/${chauffeurId}`
  );
  return response.data;
};

// ─────────────────────────────────────────
// AFFECTATIONS D'UN CAMION (historique complet, actives et terminées)
// GET /chauffeur-camions/camion/:camionId
// ─────────────────────────────────────────

export const getAffectationsByCamion = async (
  camionId: number
): Promise<ChauffeurCamion[]> => {
  const response = await apiClient.get<ChauffeurCamion[]>(
    `/chauffeur-camions/camion/${camionId}`
  );
  return response.data;
};

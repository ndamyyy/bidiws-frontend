// ============================================================
// BIDIWS — API Calendrier de collecte
// Fichier : src/api/calendrier-collecte.api.ts
// ============================================================

import apiClient from "./axios";
import type { CalendrierCollecte } from "../types";

// ─────────────────────────────────────────
// DTO REQUÊTE
// jourSemaine : 1=lundi...7=dimanche (ISO-8601) — convention reprise
// par cohérence avec CalendrierCollecte (types/index.ts), jamais
// confirmée en conditions réelles à ce jour faute de résidence de test
// avec calendrier peuplé. À vérifier dès qu'une entrée créée ici
// s'affiche (ou pas) au bon jour sur HabitantHomePage.
// ─────────────────────────────────────────

export interface CalendrierRequest {
  residenceId    : number;
  typeCollecteId : number;
  jourSemaine    : number;
  heureEstimee  ?: string;
}

// ─────────────────────────────────────────
// CALENDRIER D'UNE RÉSIDENCE
// GET /calendriers-collecte/residence/:residenceId
// Endpoint confirmé (200) mais jamais testé avec une résidence ayant
// un calendrier réellement renseigné — voir le commentaire sur le type
// CalendrierCollecte dans types/index.ts pour le détail de ce qui
// reste non vérifié (forme plate + convention jourSemaine).
// ─────────────────────────────────────────

export const getCalendrierByResidence = async (
  residenceId: number
): Promise<CalendrierCollecte[]> => {
  const response = await apiClient.get<CalendrierCollecte[]>(
    `/calendriers-collecte/residence/${residenceId}`
  );
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER UNE ENTRÉE DE CALENDRIER
// POST /calendriers-collecte
// ─────────────────────────────────────────

export const createCalendrier = async (
  data: CalendrierRequest
): Promise<CalendrierCollecte> => {
  const response = await apiClient.post<CalendrierCollecte>(
    "/calendriers-collecte",
    data
  );
  return response.data;
};

// ─────────────────────────────────────────
// DÉSACTIVER UNE ENTRÉE DE CALENDRIER
// PATCH /calendriers-collecte/:id/desactiver
// Confirmé en conditions réelles : 204 No Content (pas de corps de
// réponse), contrairement à demarrerTournee/annulerTournee qui
// renvoient l'entité mise à jour — typé Promise<void> en conséquence.
// ─────────────────────────────────────────

export const desactiverCalendrier = async (id: number): Promise<void> => {
  await apiClient.patch(`/calendriers-collecte/${id}/desactiver`);
};

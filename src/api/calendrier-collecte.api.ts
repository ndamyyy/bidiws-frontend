// ============================================================
// BIDIWS — API Calendrier de collecte
// Fichier : src/api/calendrier-collecte.api.ts
// ============================================================

import apiClient from "./axios";
import type { CalendrierCollecte } from "../types";

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

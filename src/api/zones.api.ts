// ============================================================
// BIDIWS — API Zones
// Fichier : src/api/zones.api.ts
// ============================================================

import apiClient from "./axios";
import type { Zone } from "../types";

// ─────────────────────────────────────────
// LISTE DE TOUTES LES ZONES
// GET /zones
// ─────────────────────────────────────────

export const getAllZones = async (): Promise<Zone[]> => {
  const response = await apiClient.get<Zone[]>("/zones");
  return response.data;
};

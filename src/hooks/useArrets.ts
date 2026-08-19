// ============================================================
// BIDIWS — Hooks React Query : Arrêts
// Fichier : src/hooks/useArrets.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getArretsByTournee, getArretsByResidence } from "../api/arrets.api";
import type { Arret } from "../types";

// ─────────────────────────────────────────
// ARRÊTS D'UNE TOURNÉE
// ─────────────────────────────────────────

export function useArretsByTournee(tourneeId: number | undefined): UseQueryResult<Arret[]> {
  return useQuery({
    queryKey: ["arrets", "tournee", tourneeId],
    queryFn: () => getArretsByTournee(tourneeId as number),
    enabled: tourneeId !== undefined,
  });
}

// ─────────────────────────────────────────
// ARRÊTS D'UNE RÉSIDENCE (historique)
// ─────────────────────────────────────────

export function useArretsByResidence(residenceId: number | undefined): UseQueryResult<Arret[]> {
  return useQuery({
    queryKey: ["arrets", "residence", residenceId],
    queryFn: () => getArretsByResidence(residenceId as number),
    enabled: residenceId !== undefined,
  });
}

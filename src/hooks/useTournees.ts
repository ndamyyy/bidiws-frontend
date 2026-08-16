// ============================================================
// BIDIWS — Hooks React Query : Tournées
// Fichier : src/hooks/useTournees.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllTournees, getTourneeById } from "../api/tournee.api";
import type { Tournee } from "../types";

// ─────────────────────────────────────────
// LISTE DES TOURNÉES (filtrable par date / chauffeur)
// ─────────────────────────────────────────

export interface TourneesParams {
  date        ?: string;
  chauffeurId ?: number;
}

export function useTournees(params?: TourneesParams): UseQueryResult<Tournee[]> {
  return useQuery({
    queryKey: ["tournees", params ?? null],
    queryFn: () => getAllTournees(params),
  });
}

// ─────────────────────────────────────────
// UNE TOURNÉE PAR ID
// ─────────────────────────────────────────

export function useTournee(id: number | undefined): UseQueryResult<Tournee> {
  return useQuery({
    queryKey: ["tournees", id],
    queryFn: () => getTourneeById(id as number),
    enabled: id !== undefined,
  });
}

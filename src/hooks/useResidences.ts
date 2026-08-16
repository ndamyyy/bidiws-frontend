// ============================================================
// BIDIWS — Hooks React Query : Résidences
// Fichier : src/hooks/useResidences.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllResidences, getResidenceById } from "../api/residences.api";
import type { Residence } from "../types";

// ─────────────────────────────────────────
// LISTE DE TOUTES LES RÉSIDENCES
// ─────────────────────────────────────────

export function useResidences(): UseQueryResult<Residence[]> {
  return useQuery({
    queryKey: ["residences"],
    queryFn: getAllResidences,
  });
}

// ─────────────────────────────────────────
// UNE RÉSIDENCE PAR ID
// ─────────────────────────────────────────

export function useResidence(id: number | undefined): UseQueryResult<Residence> {
  return useQuery({
    queryKey: ["residences", id],
    queryFn: () => getResidenceById(id as number),
    enabled: id !== undefined,
  });
}

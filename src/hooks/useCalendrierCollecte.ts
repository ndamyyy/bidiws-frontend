// ============================================================
// BIDIWS — Hooks React Query : Calendrier de collecte
// Fichier : src/hooks/useCalendrierCollecte.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getCalendrierByResidence } from "../api/calendrier-collecte.api";
import { getAllTypesCollecte } from "../api/types-collecte.api";
import type { CalendrierCollecte, TypeCollecte } from "../types";

// ─────────────────────────────────────────
// CALENDRIER D'UNE RÉSIDENCE
// ─────────────────────────────────────────

export function useCalendrierCollecte(
  residenceId: number | undefined
): UseQueryResult<CalendrierCollecte[]> {
  return useQuery({
    queryKey: ["calendriers-collecte", "residence", residenceId],
    queryFn: () => getCalendrierByResidence(residenceId as number),
    enabled: residenceId !== undefined,
  });
}

// ─────────────────────────────────────────
// TOUS LES TYPES DE COLLECTE
// ─────────────────────────────────────────

export function useTypesCollecte(): UseQueryResult<TypeCollecte[]> {
  return useQuery({
    queryKey: ["types-collecte"],
    queryFn: getAllTypesCollecte,
  });
}

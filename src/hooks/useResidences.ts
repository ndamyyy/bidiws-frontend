// ============================================================
// BIDIWS — Hooks React Query : Résidences
// Fichier : src/hooks/useResidences.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getAllResidences,
  getResidenceById,
  getResidencesByGardien,
  type ResidenceGardien,
} from "../api/residences.api";
import {
  getResidencesByHabitant,
  type ResidenceHabitant,
} from "../api/residence-habitants.api";
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

// ─────────────────────────────────────────
// RÉSIDENCES D'UN GARDIEN
// ─────────────────────────────────────────

export function useResidencesGardien(
  gardienId: number | undefined
): UseQueryResult<ResidenceGardien[]> {
  return useQuery({
    queryKey: ["residence-gardiens", "gardien", gardienId],
    queryFn: () => getResidencesByGardien(gardienId as number),
    enabled: gardienId !== undefined,
  });
}

// ─────────────────────────────────────────
// RÉSIDENCES D'UN HABITANT
// ─────────────────────────────────────────

export function useResidencesHabitant(
  habitantId: number | undefined
): UseQueryResult<ResidenceHabitant[]> {
  return useQuery({
    queryKey: ["residence-habitants", "habitant", habitantId],
    queryFn: () => getResidencesByHabitant(habitantId as number),
    enabled: habitantId !== undefined,
  });
}

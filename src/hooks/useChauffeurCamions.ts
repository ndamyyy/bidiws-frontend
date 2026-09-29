// ============================================================
// BIDIWS — Hooks React Query : Affectations Chauffeur-Camion
// Fichier : src/hooks/useChauffeurCamions.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAffectationsByChauffeur, getAffectationsByCamion } from "../api/chauffeur-camions.api";
import type { ChauffeurCamion } from "../types";

export function useAffectationsByChauffeur(
  chauffeurId: number | undefined
): UseQueryResult<ChauffeurCamion[]> {
  return useQuery({
    queryKey: ["chauffeur-camions", "chauffeur", chauffeurId],
    queryFn: () => getAffectationsByChauffeur(chauffeurId as number),
    enabled: chauffeurId !== undefined,
  });
}

export function useAffectationsByCamion(
  camionId: number | undefined
): UseQueryResult<ChauffeurCamion[]> {
  return useQuery({
    queryKey: ["chauffeur-camions", "camion", camionId],
    queryFn: () => getAffectationsByCamion(camionId as number),
    enabled: camionId !== undefined,
  });
}

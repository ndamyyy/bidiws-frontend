// ============================================================
// BIDIWS — Hook React Query : Conteneurs
// Fichier : src/hooks/useConteneurs.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getConteneursByResidence } from "../api/conteneurs.api";
import type { Conteneur } from "../types";

export function useConteneursByResidence(
  residenceId: number | undefined
): UseQueryResult<Conteneur[]> {
  return useQuery({
    queryKey: ["conteneurs", "residence", residenceId],
    queryFn: () => getConteneursByResidence(residenceId as number),
    enabled: residenceId !== undefined,
  });
}

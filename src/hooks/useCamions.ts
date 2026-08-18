// ============================================================
// BIDIWS — Hook React Query : Camions
// Fichier : src/hooks/useCamions.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllCamions } from "../api/camions.api";
import type { Camion } from "../types";

export function useCamions(): UseQueryResult<Camion[]> {
  return useQuery({
    queryKey: ["camions"],
    queryFn: getAllCamions,
  });
}

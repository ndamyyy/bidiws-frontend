// ============================================================
// BIDIWS — Hook React Query : Villes
// Fichier : src/hooks/useVilles.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllVilles } from "../api/villes.api";
import type { Ville } from "../types";

export function useVilles(): UseQueryResult<Ville[]> {
  return useQuery({
    queryKey: ["villes"],
    queryFn: getAllVilles,
  });
}

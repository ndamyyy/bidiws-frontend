// ============================================================
// BIDIWS — Hook React Query : Zones
// Fichier : src/hooks/useZones.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllZones } from "../api/zones.api";
import type { Zone } from "../types";

export function useZones(): UseQueryResult<Zone[]> {
  return useQuery({
    queryKey: ["zones"],
    queryFn: getAllZones,
  });
}

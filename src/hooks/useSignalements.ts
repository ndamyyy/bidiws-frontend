// ============================================================
// BIDIWS — Hook React Query : Signalements
// Fichier : src/hooks/useSignalements.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllSignalements } from "../api/signalements.api";
import type { Signalement } from "../types";

export function useSignalements(): UseQueryResult<Signalement[]> {
  return useQuery({
    queryKey: ["signalements"],
    queryFn: getAllSignalements,
  });
}

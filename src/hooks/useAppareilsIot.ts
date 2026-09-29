// ============================================================
// BIDIWS — Hook React Query : Appareils IoT
// Fichier : src/hooks/useAppareilsIot.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllAppareilsIot } from "../api/appareils-iot.api";
import type { AppareilIot } from "../types";

export function useAppareilsIot(): UseQueryResult<AppareilIot[]> {
  return useQuery({
    queryKey: ["appareils-iot"],
    queryFn: getAllAppareilsIot,
  });
}

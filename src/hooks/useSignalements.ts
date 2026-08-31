// ============================================================
// BIDIWS — Hook React Query : Signalements
// Fichier : src/hooks/useSignalements.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getSignalementsByStatut } from "../api/signalements.api";
import type { Signalement, StatutSignalement } from "../types";

// "statut" est un paramètre obligatoire côté backend (voir le
// commentaire dans signalements.api.ts) — pas de variante "tous
// statuts confondus".
export function useSignalementsByStatut(
  statut: StatutSignalement
): UseQueryResult<Signalement[]> {
  return useQuery({
    queryKey: ["signalements", statut],
    queryFn: () => getSignalementsByStatut(statut),
  });
}

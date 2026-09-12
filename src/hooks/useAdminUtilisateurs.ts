// ============================================================
// BIDIWS — Hook React Query : Utilisateurs (admin)
// Fichier : src/hooks/useAdminUtilisateurs.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllUtilisateurs } from "../api/admin-utilisateurs.api";
import type { Utilisateur } from "../types";

export function useAdminUtilisateurs(): UseQueryResult<Utilisateur[]> {
  return useQuery({
    queryKey: ["admin-utilisateurs"],
    queryFn: getAllUtilisateurs,
  });
}

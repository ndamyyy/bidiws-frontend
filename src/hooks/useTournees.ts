// ============================================================
// BIDIWS — Hooks React Query : Tournées
// Fichier : src/hooks/useTournees.ts
// ============================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllTournees, getTourneeById } from "../api/tournee.api";
import type { Tournee } from "../types";

// ─────────────────────────────────────────
// LISTE DES TOURNÉES (filtrable par date / chauffeur)
// ─────────────────────────────────────────

export interface TourneesParams {
  date        ?: string;
  chauffeurId ?: number;
}

export function useTournees(params?: TourneesParams): UseQueryResult<Tournee[]> {
  return useQuery({
    queryKey: ["tournees", params ?? null],
    queryFn: () => getAllTournees(params),
  });
}

// ─────────────────────────────────────────
// UNE TOURNÉE PAR ID
// ─────────────────────────────────────────

export function useTournee(id: number | undefined): UseQueryResult<Tournee> {
  return useQuery({
    queryKey: ["tournees", id],
    queryFn: () => getTourneeById(id as number),
    enabled: id !== undefined,
  });
}

// ─────────────────────────────────────────
// TOURNÉE DU JOUR D'UN CHAUFFEUR
// getMaTournee(chauffeurId) n'a pas de filtre de date côté backend et
// renverrait tout l'historique — on utilise getAllTournees avec date +
// chauffeurId pour ne récupérer que la tournée d'aujourd'hui.
// NON vérifié en conditions réelles : /tournees (liste, avec ou sans
// filtres) renvoie 500 avec le seul compte de test disponible cette
// session (rôle GARDIEN) — impossible de confirmer que ces deux
// paramètres combinés fonctionnent réellement côté backend. À tester
// avec un vrai compte chauffeur.
// ─────────────────────────────────────────

export function useMaTourneeAujourdhui(
  chauffeurId: number | undefined
): UseQueryResult<Tournee[]> {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return useQuery({
    queryKey: ["tournees", { date, chauffeurId }],
    queryFn: () => getAllTournees({ date, chauffeurId }),
    enabled: chauffeurId !== undefined,
  });
}

// ============================================================
// BIDIWS — API Utilisateurs (self-service)
// Fichier : src/api/utilisateurs.api.ts
// Distinct de admin-utilisateurs.api.ts (gestion admin d'autrui) — ici
// un utilisateur modifie son propre profil. Formes confirmées contre
// UtilisateurController/UtilisateurUpdateRequestDto/
// ChangePasswordRequestDto (backend, verifierProprietaireOuAdmin).
// ============================================================

import apiClient from "./axios";
import type { Utilisateur } from "../types";

// ─────────────────────────────────────────
// MODIFIER SON PROFIL
// PUT /utilisateurs/:id
// email est obligatoire côté backend (@NotBlank @Email), même si non
// modifié — le renvoyer tel quel plutôt que de l'omettre.
// ─────────────────────────────────────────

export interface UtilisateurUpdateRequest {
  nom        : string;
  prenom     : string;
  email      : string;
  telephone ?: string;
}

export const updateMonProfil = async (
  id: number,
  data: UtilisateurUpdateRequest
): Promise<Utilisateur> => {
  const response = await apiClient.put<Utilisateur>(`/utilisateurs/${id}`, data);
  return response.data;
};

// ─────────────────────────────────────────
// CHANGER SON MOT DE PASSE
// PATCH /utilisateurs/:id/mot-de-passe
// 204 No Content — confirmé contre le vrai contrôleur.
// ─────────────────────────────────────────

export interface ChangePasswordRequest {
  ancienMotDePasse  : string;
  nouveauMotDePasse : string;
}

export const changerMonMotDePasse = async (
  id: number,
  data: ChangePasswordRequest
): Promise<void> => {
  await apiClient.patch(`/utilisateurs/${id}/mot-de-passe`, data);
};

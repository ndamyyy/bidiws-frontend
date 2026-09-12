// ============================================================
// BIDIWS — API Utilisateurs (admin)
// Fichier : src/api/admin-utilisateurs.api.ts
// ============================================================

import apiClient from "./axios";
import type { Role, Utilisateur } from "../types";

// ─────────────────────────────────────────
// LISTE DE TOUS LES UTILISATEURS
// GET /admin/utilisateurs (ROLE_ADMIN)
// ─────────────────────────────────────────

export const getAllUtilisateurs = async (): Promise<Utilisateur[]> => {
  const response = await apiClient.get<Utilisateur[]>("/admin/utilisateurs");
  return response.data;
};

// ─────────────────────────────────────────
// CRÉER UN UTILISATEUR
// POST /admin/utilisateurs (ROLE_ADMIN)
// Forme confirmée contre UtilisateurAdminCreateRequestDto (backend) :
// contrairement à /auth/register, role est ici requis et accepté.
// Pas de champ villeId dans ce DTO — un compte MAIRIE doit être créé
// puis affecté à une ville via changerVilleUtilisateur (appel séparé).
// ─────────────────────────────────────────

export interface UtilisateurAdminCreateRequest {
  email      : string;
  motDePasse : string;
  nom        : string;
  prenom     : string;
  telephone ?: string;
  role       : Role;
}

export const createUtilisateurAdmin = async (
  data: UtilisateurAdminCreateRequest
): Promise<Utilisateur> => {
  const response = await apiClient.post<Utilisateur>("/admin/utilisateurs", data);
  return response.data;
};

// ─────────────────────────────────────────
// CHANGER LA VILLE D'UN UTILISATEUR
// PATCH /admin/utilisateurs/:id/ville?villeId=X (ROLE_ADMIN)
// ─────────────────────────────────────────

export const changerVilleUtilisateur = async (
  id: number,
  villeId: number
): Promise<Utilisateur> => {
  const response = await apiClient.patch<Utilisateur>(
    `/admin/utilisateurs/${id}/ville`,
    null,
    { params: { villeId } }
  );
  return response.data;
};

// ─────────────────────────────────────────
// CHANGER LE RÔLE D'UN UTILISATEUR
// PATCH /admin/utilisateurs/:id/role?role=X (ROLE_ADMIN)
// Rejeté (409) si on retire le rôle CHAUFFEUR à quelqu'un qui a une
// affectation camion active ou une tournée en cours — même prudence
// que CamionService.desactiver côté backend.
// ─────────────────────────────────────────

export const changerRoleUtilisateur = async (
  id: number,
  role: Role
): Promise<Utilisateur> => {
  const response = await apiClient.patch<Utilisateur>(
    `/admin/utilisateurs/${id}/role`,
    null,
    { params: { role } }
  );
  return response.data;
};

// ─────────────────────────────────────────
// RÉINITIALISER LE MOT DE PASSE D'UN UTILISATEUR
// PATCH /admin/utilisateurs/:id/mot-de-passe (ROLE_ADMIN)
// L'admin choisit lui-même le nouveau mot de passe (ResetPasswordRequestDto
// n'a qu'un champ nouveauMotDePasse) — le serveur n'en génère aucun,
// contrairement à l'hypothèse de départ.
// ─────────────────────────────────────────

export const resetMotDePasseUtilisateur = async (
  id: number,
  nouveauMotDePasse: string
): Promise<void> => {
  await apiClient.patch(`/admin/utilisateurs/${id}/mot-de-passe`, { nouveauMotDePasse });
};

// ─────────────────────────────────────────
// DÉSACTIVER UN UTILISATEUR
// PATCH /admin/utilisateurs/:id/desactiver (ROLE_ADMIN)
// Confirmé en conditions réelles : 204 No Content, pas de corps —
// l'appelant doit refetch (invalidateQueries) pour voir le nouvel état.
// ─────────────────────────────────────────

export const desactiverUtilisateur = async (id: number): Promise<void> => {
  await apiClient.patch(`/admin/utilisateurs/${id}/desactiver`);
};

// ─────────────────────────────────────────
// ACTIVER UN UTILISATEUR
// PATCH /admin/utilisateurs/:id/activer (ROLE_ADMIN)
// Confirmé en conditions réelles : 204 No Content, pas de corps.
// ─────────────────────────────────────────

export const activerUtilisateur = async (id: number): Promise<void> => {
  await apiClient.patch(`/admin/utilisateurs/${id}/activer`);
};

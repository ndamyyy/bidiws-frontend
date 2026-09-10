// ============================================================
// BIDIWS — API Notifications
// Fichier : src/api/notifications.api.ts
// ============================================================

import apiClient from "./axios";
import type { Notification } from "../types";

// ─────────────────────────────────────────
// NOTIFICATIONS D'UN DESTINATAIRE
// GET /notifications/destinataire/:destinataireId
// destinataireId à récupérer via /utilisateurs/moi (auth.api.ts::getMe)
// Pas d'endpoint séparé pour les non-lues — filtrer côté client sur `lu`
// ─────────────────────────────────────────

export const getNotificationsByDestinataire = async (
  destinataireId: number
): Promise<Notification[]> => {
  const response = await apiClient.get<Notification[]>(
    `/notifications/destinataire/${destinataireId}`
  );
  return response.data;
};

// ─────────────────────────────────────────
// COMPTER LES NON LUES
// GET /notifications/destinataire/:destinataireId/compteur
// ─────────────────────────────────────────

export const countNotificationsNonLues = async (
  destinataireId: number
): Promise<number> => {
  const response = await apiClient.get<number>(
    `/notifications/destinataire/${destinataireId}/compteur`
  );
  return response.data;
};

// ─────────────────────────────────────────
// MARQUER UNE NOTIFICATION COMME LUE
// PATCH /notifications/:id/lue?destinataireId=X
// ─────────────────────────────────────────

export const marquerCommeLue = async (
  id: number,
  destinataireId: number
): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/lue`, null, {
    params: { destinataireId },
  });
};

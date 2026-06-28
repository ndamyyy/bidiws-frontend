// ============================================================
// BIDIWS — API Notifications
// Fichier : src/api/notifications.api.ts
// ============================================================

import apiClient from "./axios";
import type { Notification, PageResponse } from "../types";

// ─────────────────────────────────────────
// MES NOTIFICATIONS
// GET /api/notifications/me
// ─────────────────────────────────────────

export const getMesNotifications = async (
  page: number = 0,
  size: number = 20
): Promise<PageResponse<Notification>> => {
  const response = await apiClient.get<PageResponse<Notification>>(
    "/notifications/me",
    { params: { page, size } }
  );
  return response.data;
};

// ─────────────────────────────────────────
// NOTIFICATIONS NON LUES
// GET /api/notifications/me/non-lues
// ─────────────────────────────────────────

export const getNotificationsNonLues = async (): Promise<Notification[]> => {
  const response = await apiClient.get<Notification[]>(
    "/notifications/me/non-lues"
  );
  return response.data;
};

// ─────────────────────────────────────────
// COMPTER LES NON LUES
// GET /api/notifications/me/count
// ─────────────────────────────────────────

export const countNotificationsNonLues = async (): Promise<number> => {
  const response = await apiClient.get<number>("/notifications/me/count");
  return response.data;
};

// ─────────────────────────────────────────
// MARQUER UNE NOTIFICATION COMME LUE
// PUT /api/notifications/:id/lire
// ─────────────────────────────────────────

export const marquerCommeLue = async (id: number): Promise<void> => {
  await apiClient.put(`/notifications/${id}/lire`);
};

// ─────────────────────────────────────────
// MARQUER TOUTES COMME LUES
// PUT /api/notifications/me/tout-lire
// ─────────────────────────────────────────

export const marquerToutesCommeLues = async (): Promise<void> => {
  await apiClient.put("/notifications/me/tout-lire");
};
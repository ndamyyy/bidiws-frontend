// ============================================================
// BIDIWS — extractErrorMessage
// Fichier : src/utils/extractErrorMessage.ts
// Récupère le message renvoyé par le backend (ApiError.message, plus
// précis qu'un générique — ex. "Cette tournée est déjà terminée")
// pour l'afficher via toast.error. Le message générique passé en
// argument ne sert que de filet de secours (erreur réseau sans
// réponse du serveur, timeout), pas de valeur par défaut systématique.
// ============================================================

import axios from "axios";
import type { ApiError } from "../types";

export function extractErrorMessage(e: unknown, fallback: string): string {
  return axios.isAxiosError<ApiError>(e) && e.response?.data?.message
    ? e.response.data.message
    : fallback;
}

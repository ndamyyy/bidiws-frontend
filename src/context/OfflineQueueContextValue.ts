// ============================================================
// BIDIWS — Contexte File hors-ligne (définition)
// Fichier : src/context/OfflineQueueContextValue.ts
// Séparé de OfflineQueueContext.tsx pour que ce dernier n'exporte plus
// que le composant OfflineQueueProvider (react-refresh/only-export-
// components) — même découpage que NotificationContextValue.ts.
// ============================================================

import { createContext } from "react";

export interface OfflineQueueContextType {
  isOnline: boolean;
  /** Nombre d'actions en attente de connexion. */
  pendingCount: number;
  /** true pendant le rejeu automatique de la file. */
  isReplaying: boolean;
}

export const OfflineQueueContext = createContext<OfflineQueueContextType | null>(null);

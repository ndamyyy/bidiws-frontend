// ============================================================
// BIDIWS — Contexte File hors-ligne
// Fichier : src/context/OfflineQueueContext.tsx
// Reflète en état React la file persistée dans offlineQueue.ts (les
// wrappers *Offline y écrivent directement, hors de tout composant) et
// déclenche le rejeu automatique au retour en ligne. Même structure
// (contexte + provider + hook dédié) que NotificationContext.
// ============================================================

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useToast } from "../hooks/useToast";
import { getToken } from "../api/tokenStorage";
import { readQueue, replayQueue, subscribeQueueChange } from "../utils/offlineQueue";
import { OfflineQueueContext, type OfflineQueueContextType } from "./OfflineQueueContextValue";

interface OfflineQueueProviderProps {
  children: ReactNode;
}

export function OfflineQueueProvider({ children }: OfflineQueueProviderProps) {
  const isOnline = useOnlineStatus();
  const toast = useToast();
  const [pendingCount, setPendingCount] = useState<number>(() => readQueue().length);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  // ── Reflète la file (écrite par les wrappers *Offline, en dehors de
  // ce composant) dès qu'elle change — mise en file ou rejeu. ──
  useEffect(() => {
    return subscribeQueueChange(() => setPendingCount(readQueue().length));
  }, []);

  // ── Rejoue la file dans l'ordre. Pas de rejeu si déconnecté
  // entre-temps (token absent — voir removeToken() dans axios.ts sur
  // un 401 : c'est le signal fiable de session invalidée). ──
  const runReplay = useCallback(async (): Promise<void> => {
    if (isReplaying || readQueue().length === 0) return;

    const token = await getToken();
    if (!token) return;

    setIsReplaying(true);
    try {
      const result = await replayQueue();
      if (result.succeeded > 0) {
        toast.success(
          result.succeeded > 1
            ? `${result.succeeded} actions en attente ont été renvoyées.`
            : "1 action en attente a été renvoyée."
        );
      }
      if (result.failed > 0) {
        toast.error(
          result.failed > 1
            ? `${result.failed} actions en attente ont échoué et ont été abandonnées.`
            : "1 action en attente a échoué et a été abandonnée."
        );
      }
    } finally {
      setIsReplaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplaying]);

  useEffect(() => {
    if (isOnline) void runReplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const value: OfflineQueueContextType = { isOnline, pendingCount, isReplaying };

  return (
    <OfflineQueueContext.Provider value={value}>
      {children}
    </OfflineQueueContext.Provider>
  );
}

// ============================================================
// BIDIWS — Hook useOfflineQueue
// Fichier : src/hooks/useOfflineQueue.ts
// ============================================================

import { useContext } from "react";
import { OfflineQueueContext, type OfflineQueueContextType } from "../context/OfflineQueueContextValue";

export function useOfflineQueue(): OfflineQueueContextType {
  const context = useContext(OfflineQueueContext);

  if (!context) {
    throw new Error("useOfflineQueue doit être utilisé dans un OfflineQueueProvider");
  }

  return context;
}

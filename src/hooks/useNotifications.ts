// ============================================================
// BIDIWS — Hook useNotifications
// Fichier : src/hooks/useNotifications.ts
// ============================================================

import { useContext } from "react";
import {
  NotificationContext,
  type NotificationContextType,
} from "../context/NotificationContext";

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications doit être utilisé dans un NotificationProvider"
    );
  }

  return context;
}
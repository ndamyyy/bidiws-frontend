// ============================================================
// BIDIWS — Contexte Notifications (définition)
// Fichier : src/context/NotificationContextValue.ts
// Séparé de NotificationContext.tsx pour que ce dernier n'exporte plus
// que le composant NotificationProvider (react-refresh/only-export-components).
// ============================================================

import { createContext } from "react";
import type { Notification } from "../types";

export interface NotificationContextType {
  notifications      : Notification[];
  nonLuesCount       : number;
  wsConnected        : boolean;
  marquerLue         : (id: number) => Promise<void>;
  marquerToutesLues  : () => Promise<void>;
  ajouterNotification: (notif: Notification) => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

/* eslint-disable react-refresh/only-export-components */
// ============================================================
// BIDIWS — Contexte Notifications
// Fichier : src/context/NotificationContext.tsx
// ============================================================

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  getNotificationsByDestinataire,
  marquerCommeLue,
} from "../api/notifications.api";
import type { Notification } from "../types";

// ─────────────────────────────────────────
// TYPE DU CONTEXTE
// ─────────────────────────────────────────

export interface NotificationContextType {
  notifications      : Notification[];
  nonLuesCount       : number;
  wsConnected        : boolean;
  marquerLue         : (id: number) => Promise<void>;
  marquerToutesLues  : () => Promise<void>;
  ajouterNotification: (notif: Notification) => void;
}

// ─────────────────────────────────────────
// CRÉATION DU CONTEXTE
// ─────────────────────────────────────────

export const NotificationContext = createContext<NotificationContextType | null>(null);

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { isAuthenticated, utilisateur } = useAuth();
  const { connected: wsConnected, subscribe } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ── Compter les non lues ──
  const nonLuesCount = notifications.filter((n) => !n.lu).length;

  // ── Ajouter une notification (reçue via WebSocket) ──
  const ajouterNotification = useCallback((notif: Notification): void => {
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  // ── Marquer une notification comme lue (persisté côté serveur) ──
  const marquerLue = useCallback(
    async (id: number): Promise<void> => {
      if (!utilisateur) return;
      await marquerCommeLue(id, utilisateur.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
      );
    },
    [utilisateur]
  );

  // ── Marquer toutes comme lues (pas d'endpoint batch → une requête par notif) ──
  const marquerToutesLues = useCallback(async (): Promise<void> => {
    if (!utilisateur) return;
    const nonLues = notifications.filter((n) => !n.lu);
    if (nonLues.length === 0) return;

    await Promise.all(
      nonLues.map((n) => marquerCommeLue(n.id, utilisateur.id))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
  }, [utilisateur, notifications]);

  // ── Charger l'historique au montage (ou repartir de zéro à la déconnexion) ──
  useEffect(() => {
    let cancelled = false;

    const charger = async (): Promise<void> => {
      if (!isAuthenticated || !utilisateur) {
        setNotifications([]);
        return;
      }
      try {
        const historique = await getNotificationsByDestinataire(utilisateur.id);
        if (!cancelled) setNotifications(historique);
      } catch (e) {
        console.error("BIDIWS — Erreur chargement historique notifications", e);
      }
    };

    void charger();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, utilisateur]);

  // ── Abonnement aux notifications personnelles ──
  // Chemin relatif "/user/queue/notifications" : rien n'y est inséré
  // (ni id ni email), c'est le mécanisme user-destination de Spring qui
  // route automatiquement vers la session authentifiée courante.
  useEffect(() => {
    if (!isAuthenticated || !utilisateur) return;

    const unsubscribe = subscribe("/user/queue/notifications", (payload) => {
      ajouterNotification(payload as Notification);
    });

    return unsubscribe;
  }, [isAuthenticated, utilisateur, subscribe, ajouterNotification]);

  const value: NotificationContextType = {
    notifications,
    nonLuesCount,
    wsConnected,
    marquerLue,
    marquerToutesLues,
    ajouterNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

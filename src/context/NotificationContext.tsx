/* eslint-disable react-refresh/only-export-components */
// ============================================================
// BIDIWS — Contexte Notifications (WebSocket STOMP)
// Fichier : src/context/NotificationContext.tsx
// ============================================================

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "../hooks/useAuth";
import { getToken } from "../api/axios";
import type { Notification, WsNotification } from "../types";

// ─────────────────────────────────────────
// TYPE DU CONTEXTE
// ─────────────────────────────────────────

export interface NotificationContextType {
  notifications    : Notification[];
  nonLuesCount     : number;
  wsConnected      : boolean;
  marquerLue       : (id: number) => void;
  marquerToutesLues: () => void;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [wsConnected, setWsConnected]     = useState<boolean>(false);
  const stompClientRef = useRef<Client | null>(null);

  // ── Compter les non lues ──
  const nonLuesCount = notifications.filter((n) => !n.lu).length;

  // ── Ajouter une notification ──
  const ajouterNotification = useCallback((notif: Notification): void => {
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  // ── Marquer une notification comme lue ──
  const marquerLue = useCallback((id: number): void => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    );
  }, []);

  // ── Marquer toutes comme lues ──
  const marquerToutesLues = useCallback((): void => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
  }, []);

  // ── Connexion WebSocket STOMP ──
  useEffect(() => {
    if (!isAuthenticated || !utilisateur) return;

    const token = getToken();
    const wsUrl = (import.meta as { env?: { VITE_WS_URL?: string } }).env?.VITE_WS_URL ?? "http://localhost:8080/ws";

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,

      onConnect: () => {
        setWsConnected(true);

        // S'abonner aux notifications personnelles
        client.subscribe(
          `/user/${utilisateur.id}/queue/notifications`,
          (message) => {
            try {
              const wsNotif: WsNotification = JSON.parse(message.body);
              const newNotif: Notification = {
                id             : Date.now(),
                destinataireId : utilisateur.id,
                arretId        : wsNotif.arretId,
                residenceId    : wsNotif.residenceId,
                type           : wsNotif.type,
                titre          : wsNotif.type,
                message        : wsNotif.message,
                canal          : "PUSH" as const,
                lu             : false,
                envoye         : true,
                heureEnvoi     : wsNotif.heure,
                createdAt      : new Date().toISOString(),
              };
              ajouterNotification(newNotif);
            } catch (e) {
              console.error("BIDIWS WS — Erreur parsing notification", e);
            }
          }
        );

        // S'abonner aux notifications globales (broadcast)
        client.subscribe("/topic/collecte", (message) => {
          try {
            const wsNotif: WsNotification = JSON.parse(message.body);
            console.info("BIDIWS WS — Broadcast collecte :", wsNotif);
          } catch (e) {
            console.error("BIDIWS WS — Erreur parsing broadcast", e);
          }
        });
      },

      onDisconnect: () => {
        setWsConnected(false);
      },

      onStompError: (frame) => {
        console.error("BIDIWS WS — Erreur STOMP :", frame);
        setWsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    // Nettoyage à la déconnexion
    return () => {
      client.deactivate();
      stompClientRef.current = null;
      setWsConnected(false);
    };
  }, [isAuthenticated, utilisateur, ajouterNotification]);

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


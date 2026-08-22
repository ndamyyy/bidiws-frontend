// ============================================================
// BIDIWS — Contexte WebSocket (client STOMP partagé)
// Fichier : src/context/WebSocketContext.tsx
// ============================================================

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "../hooks/useAuth";
import { getToken } from "../api/axios";
import { WebSocketContext, type WebSocketContextType } from "./WebSocketContextValue";

// ─────────────────────────────────────────
// ABONNEMENT EN ATTENTE
// Le client STOMP ne peut accepter de subscribe() qu'une fois
// connecté ; tant que ce n'est pas le cas on garde les demandes
// en mémoire pour les rejouer dans onConnect (et à chaque reconnexion).
// ─────────────────────────────────────────

interface PendingSubscription {
  destination: string;
  callback: (payload: unknown) => void;
  active: StompSubscription | null;
}

const WS_URL =
  (import.meta as { env?: { VITE_WS_URL?: string } }).env?.VITE_WS_URL ??
  "http://localhost:8081/bidiws/ws";

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { isAuthenticated } = useAuth();
  const [connected, setConnected] = useState<boolean>(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<number, PendingSubscription>>(new Map());
  const nextIdRef = useRef<number>(0);

  // ── Rejoue les abonnements en attente sur le client connecté ──
  const flushPendingSubscriptions = useCallback((client: Client): void => {
    subscriptionsRef.current.forEach((entry) => {
      if (entry.active) return;
      entry.active = client.subscribe(entry.destination, (message: IMessage) => {
        try {
          entry.callback(JSON.parse(message.body));
        } catch (e) {
          console.error(
            `BIDIWS WS — Erreur parsing message sur ${entry.destination}`,
            e
          );
        }
      });
    });
  }, []);

  // ── Connexion / déconnexion du client STOMP ──
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = getToken();
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,

      onConnect: () => {
        setConnected(true);
        flushPendingSubscriptions(client);
      },

      onDisconnect: () => {
        setConnected(false);
        // Les abonnements STOMP ne survivent pas à la reconnexion :
        // on les marque inactifs pour qu'ils soient rejoués au prochain onConnect
        subscriptionsRef.current.forEach((entry) => {
          entry.active = null;
        });
      },

      onStompError: (frame) => {
        console.error("BIDIWS WS — Erreur STOMP :", frame);
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;
    const subscriptions = subscriptionsRef.current;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
      subscriptions.forEach((entry) => {
        entry.active = null;
      });
    };
  }, [isAuthenticated, flushPendingSubscriptions]);

  // ── API publique : subscribe(destination, callback) → unsubscribe ──
  const subscribe = useCallback(
    (
      destination: string,
      callback: (payload: unknown) => void
    ): (() => void) => {
      const id = nextIdRef.current++;
      const entry: PendingSubscription = { destination, callback, active: null };
      subscriptionsRef.current.set(id, entry);

      const client = clientRef.current;
      if (client && client.connected) {
        entry.active = client.subscribe(destination, (message: IMessage) => {
          try {
            callback(JSON.parse(message.body));
          } catch (e) {
            console.error(`BIDIWS WS — Erreur parsing message sur ${destination}`, e);
          }
        });
      }

      return () => {
        entry.active?.unsubscribe();
        subscriptionsRef.current.delete(id);
      };
    },
    []
  );

  const value: WebSocketContextType = { connected, subscribe };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

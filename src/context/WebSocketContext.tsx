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
import { useAuth } from "../hooks/useAuth";
import { getToken } from "../api/tokenStorage";
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

const WS_URL_HTTP =
  (import.meta as { env?: { VITE_WS_URL?: string } }).env?.VITE_WS_URL ??
  "http://localhost:8081/bidiws/ws";

// WebSocket natif plutôt que SockJS : inutile en WebView Capacitor (pas
// de proxy/vieux navigateur à contourner), et stompjs sait s'y connecter
// directement via brokerURL (schéma ws(s)://) sans webSocketFactory.
// Le endpoint /ws reste enregistré .withSockJS() côté backend — son
// sous-chemin /websocket accepte une upgrade WebSocket native sans
// négociation SockJS, donc aucun changement backend n'est nécessaire.
const WS_URL = WS_URL_HTTP.replace(/^http/, "ws") + "/websocket";

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { isAuthenticated, utilisateur } = useAuth();
  const [connected, setConnected] = useState<boolean>(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<number, PendingSubscription>>(new Map());
  const nextIdRef = useRef<number>(0);

  // ── (Ré)abonne TOUTES les destinations sur le client fraîchement connecté ──
  // Appelé à chaque onConnect, y compris après une reconnexion automatique
  // de stompjs. Un STOMP CONNECT ouvre une session serveur vierge : les
  // abonnements de la connexion précédente n'existent plus côté serveur,
  // donc un éventuel `entry.active` hérité pointe vers une souscription
  // morte — on le remplace systématiquement, sans le tester.
  //
  // Sans ce ré-abonnement inconditionnel : après une coupure réseau (ou un
  // redéploiement backend, un réveil de veille…), stompjs se reconnecte et
  // ré-authentifie bien, mais aucune frame SUBSCRIBE n'est renvoyée — le
  // serveur a alors une session vivante sans aucun abonnement, et tous les
  // convertAndSendToUser suivants sont silencieusement perdus jusqu'au
  // prochain rechargement de page. Bug confirmé bout en bout.
  const flushPendingSubscriptions = useCallback((client: Client): void => {
    subscriptionsRef.current.forEach((entry) => {
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

  // ── Marque tous les abonnements comme inactifs (souscription serveur perdue) ──
  const markSubscriptionsInactive = useCallback((): void => {
    subscriptionsRef.current.forEach((entry) => {
      entry.active = null;
    });
  }, []);

  // ── Connexion / déconnexion du client STOMP ──
  // getToken() est asynchrone (voir tokenStorage.ts) — le client STOMP
  // ne peut donc plus être construit de façon synchrone dans l'effet ;
  // `cancelled` évite d'activer un client après un démontage survenu
  // pendant l'attente du token.
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    let client: Client | null = null;
    const subscriptions = subscriptionsRef.current;

    const connect = async (): Promise<void> => {
      const token = await getToken();
      if (cancelled) return;

      client = new Client({
        brokerURL: WS_URL,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,

        onConnect: () => {
          setConnected(true);
          flushPendingSubscriptions(client as Client);
        },

        onDisconnect: () => {
          setConnected(false);
          markSubscriptionsInactive();
        },

        // onDisconnect ne se déclenche QUE sur un deactivate() explicite.
        // Une coupure de transport (réseau, backend redéployé, veille…)
        // passe par onWebSocketClose : sans ce handler, `connected` resterait
        // affiché à true et les `entry.active` garderaient des références
        // mortes, que le prochain onConnect ne remplacerait pas.
        onWebSocketClose: () => {
          setConnected(false);
          markSubscriptionsInactive();
        },

        onStompError: (frame) => {
          console.error("BIDIWS WS — Erreur STOMP :", frame);
          setConnected(false);
        },
      });

      client.activate();
      clientRef.current = client;
    };

    connect();

    return () => {
      cancelled = true;
      client?.deactivate();
      clientRef.current = null;
      setConnected(false);
      subscriptions.forEach((entry) => {
        entry.active = null;
      });
    };
    // utilisateur?.id (pas seulement isAuthenticated) : sans ça, un
    // changement d'identité sans transition isAuthenticated false→true
    // (ex. token d'un autre compte déjà présent au montage, puis login
    // explicite dans le même onglet) laisse tourner l'ancienne connexion
    // authentifiée pour le MAUVAIS utilisateur — bug confirmé en test :
    // convertAndSendToUser réussit côté serveur mais rien n'arrive côté
    // client, puisque la session WS ouverte n'est pas celle du
    // destinataire réel.
  }, [isAuthenticated, utilisateur?.id, flushPendingSubscriptions, markSubscriptionsInactive]);

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

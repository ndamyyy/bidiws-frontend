// ============================================================
// BIDIWS — Contexte WebSocket (définition)
// Fichier : src/context/WebSocketContextValue.ts
// Séparé de WebSocketContext.tsx pour que ce dernier n'exporte plus
// que le composant WebSocketProvider (react-refresh/only-export-components).
// ============================================================

import { createContext } from "react";

export interface WebSocketContextType {
  connected: boolean;
  subscribe: (
    destination: string,
    callback: (payload: unknown) => void
  ) => () => void;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

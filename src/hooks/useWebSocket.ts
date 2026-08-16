// ============================================================
// BIDIWS — Hook useWebSocket
// Fichier : src/hooks/useWebSocket.ts
// ============================================================

import { useContext } from "react";
import {
  WebSocketContext,
  type WebSocketContextType,
} from "../context/WebSocketContext";

export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error("useWebSocket doit être utilisé dans un WebSocketProvider");
  }

  return context;
}

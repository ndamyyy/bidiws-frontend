// ============================================================
// BIDIWS — Hook useAuth
// Fichier : src/hooks/useAuth.ts
// ============================================================

import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../context/AuthContext";

// ─────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
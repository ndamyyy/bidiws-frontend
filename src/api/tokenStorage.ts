// ============================================================
// BIDIWS — Abstraction du stockage du token JWT
// Fichier : src/api/tokenStorage.ts
// ============================================================
//
// localStorage n'est pas chiffré au repos sur mobile (contrairement à
// Keychain iOS / Keystore Android) — un vrai problème une fois ce
// frontend embarqué dans Capacitor. @capacitor/preferences résout ça :
// backé par Keychain/Keystore sur natif, et par localStorage sur web
// (fallback intégré au plugin lui-même) — donc le comportement web
// classique (hors Capacitor) reste inchangé sans code conditionnel ici.
// Interface déjà async avant ce changement (get/set/remove) : aucun
// appelant (axios.ts, auth.api.ts, AuthContext.tsx, WebSocketContext.tsx)
// n'a besoin de bouger.

import { Preferences } from "@capacitor/preferences";

const TOKEN_KEY = "bidiws_token";

export const getToken = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: TOKEN_KEY });
  return value;
};

export const setToken = async (token: string): Promise<void> => {
  await Preferences.set({ key: TOKEN_KEY, value: token });
};

export const removeToken = async (): Promise<void> => {
  await Preferences.remove({ key: TOKEN_KEY });
};

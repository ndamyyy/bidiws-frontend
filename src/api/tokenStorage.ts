// ============================================================
// BIDIWS — Abstraction du stockage du token JWT
// Fichier : src/api/tokenStorage.ts
// ============================================================
//
// localStorage n'est pas chiffré au repos sur mobile (contrairement à
// Keychain iOS / Keystore Android) — un vrai problème une fois ce
// frontend embarqué dans Capacitor. Cette couche isole le stockage du
// token derrière une interface async : pour l'instant elle utilise
// encore localStorage (web, Capacitor pas encore intégré au projet),
// mais l'API est déjà celle qu'impose @capacitor/preferences (get/set/
// remove tous asynchrones) — le jour où Capacitor est ajouté, seul CE
// fichier change (les trois fonctions ci-dessous, par leurs
// équivalents Preferences.get/set/remove), aucun appelant (axios.ts,
// auth.api.ts, AuthContext.tsx, WebSocketContext.tsx) n'a à bouger.

const TOKEN_KEY = "bidiws_token";

export const getToken = async (): Promise<string | null> => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = async (token: string): Promise<void> => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = async (): Promise<void> => {
  localStorage.removeItem(TOKEN_KEY);
};

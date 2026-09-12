import type { CapacitorConfig } from "@capacitor/cli";

// webDir = sortie du build Vite (dist/ par défaut, voir vite.config.ts).
// Capacitor copie ce dossier statique dans le projet natif via `cap sync` ;
// il n'utilise jamais le serveur de dev Vite.
const config: CapacitorConfig = {
  appId: "com.bidiws.app",
  appName: "BIDIWS",
  webDir: "dist",
};

export default config;

// ============================================================
// BIDIWS — TopBar
// Fichier : src/components/layout/TopBar/TopBar.tsx
// ============================================================

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../hooks/useNotifications";
import { Role } from "../../../types";

import  "./TopBar.css";

// ─────────────────────────────────────────
// TITRE PAR ROUTE
// ─────────────────────────────────────────

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/syndic/dashboard":     { title: "Tableau de bord",  subtitle: "Vue globale des collectes" },
  "/syndic/tournees":      { title: "Tournées",          subtitle: "Suivi des tournées du jour" },
  "/syndic/residences":    { title: "Résidences",        subtitle: "Gestion des résidences" },
  "/syndic/notifications": { title: "Notifications",     subtitle: "Alertes et messages" },
  "/gardien/home":         { title: "Ma résidence",      subtitle: "Statut de la collecte" },
  "/gardien/alertes":      { title: "Mes alertes",       subtitle: "Notifications de collecte" },
  "/gardien/historique":   { title: "Historique",        subtitle: "Passages précédents" },
  "/chauffeur/tournee":    { title: "Ma tournée",        subtitle: "Arrêts à valider" },
  "/chauffeur/gps":        { title: "GPS",               subtitle: "Position en temps réel" },
  "/habitant/home":        { title: "Accueil",           subtitle: "Prochaine collecte" },
  "/admin/dashboard":      { title: "Administration",    subtitle: "Gestion globale" },
  "/admin/users":          { title: "Utilisateurs",      subtitle: "Gestion des comptes" },
};

// ─────────────────────────────────────────
// ROUTE NOTIFICATIONS PAR RÔLE
// ─────────────────────────────────────────

const notifRouteByRole: Partial<Record<Role, string>> = {
  ['SYNDIC']:   "/syndic/notifications",
  ['BAILLEUR']: "/syndic/notifications",
  ['MAIRIE']:   "/syndic/notifications",
  ['GARDIEN']:  "/gardien/alertes",
};

// ─────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────

export default function TopBar() {
  const location                      = useLocation();
  const navigate                      = useNavigate();
  const { nonLuesCount, wsConnected } = useNotifications();
  const { utilisateur }               = useAuth();

  const page     = pageTitles[location.pathname];
  const title    = page?.title    ?? "BIDIWS";
  const subtitle = page?.subtitle ?? "";

  const notifRoute = utilisateur
    ? notifRouteByRole[utilisateur.role]
    : undefined;

  // Format date
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day    : "numeric",
    month  : "long",
    year   : "numeric",
  });

  return (
    <header className="topbar">

      {/* ── Titre ── */}
      <div>
        <div className="topbar__title">{title}</div>
        {subtitle && <div className="topbar__subtitle">{subtitle}</div>}
      </div>

      {/* ── Droite ── */}
      <div className="topbar__right">

        {/* Live indicator */}
        {wsConnected && (
          <div className="topbar__live">
            <span className="topbar__live-dot" />
            LIVE
          </div>
        )}

        {/* Date */}
        <div className="topbar__date">{today}</div>

        {/* Bouton notifications */}
        {notifRoute && (
          <button
            className="topbar__notif-btn"
            onClick={() => navigate(notifRoute)}
            title="Voir les notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b84a3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {nonLuesCount > 0 && (
              <span className="topbar__notif-badge">
                {nonLuesCount > 9 ? "9+" : nonLuesCount}
              </span>
            )}
          </button>
        )}

      </div>
    </header>
  );
}

// ============================================================
// BIDIWS — Sidebar
// Fichier : src/components/layout/Sidebar/Sidebar.tsx
// ============================================================

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../hooks/useNotifications";
import { Role } from "../../../types";
import "./SideBar.css";
import { JSX } from "react/jsx-runtime";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

interface NavItem {
  label  : string;
  path   : string;
  icon   : string;
  badge ?: number;
}

// ─────────────────────────────────────────
// NAVIGATION PAR RÔLE
// ─────────────────────────────────────────

const getNavItems = (role: Role, nonLuesCount: number): NavItem[] => {
  switch (role) {
    case 'SYNDIC':
    case 'BAILLEUR':
    case 'MAIRIE':
      return [
        { label: "Dashboard",     path: "/syndic/dashboard",     icon: "grid"  },
        { label: "Tournées",      path: "/syndic/tournees",      icon: "truck" },
        { label: "Résidences",    path: "/syndic/residences",    icon: "home"  },
        { label: "Notifications", path: "/syndic/notifications", icon: "bell", badge: nonLuesCount },
      ];
    case 'GARDIEN':
      return [
        { label: "Ma résidence",  path: "/gardien/home",        icon: "home"  },
        { label: "Mes alertes",   path: "/gardien/alertes",     icon: "bell", badge: nonLuesCount },
        { label: "Historique",    path: "/gardien/historique",  icon: "clock" },
      ];
    case 'CHAUFFEUR':
      return [
        { label: "Ma tournée",    path: "/chauffeur/tournee",   icon: "map"   },
        { label: "GPS",           path: "/chauffeur/gps",       icon: "gps"   },
      ];
    case 'HABITANT':
      return [
        { label: "Accueil",       path: "/habitant/home",       icon: "home"  },
      ];
    case 'ADMIN':
      return [
        { label: "Dashboard",     path: "/admin/dashboard",     icon: "grid"  },
        { label: "Utilisateurs",  path: "/admin/users",         icon: "users" },
        { label: "Tournées",      path: "/admin/tournees",      icon: "plus"  },
        { label: "Suivi tournées", path: "/syndic/tournees",    icon: "truck" },
        { label: "Résidences",    path: "/syndic/residences",   icon: "home"  },
        { label: "Signalements",  path: "/admin/signalements",  icon: "alert" },
        { label: "Appareils IoT", path: "/admin/appareils-iot", icon: "cpu"   },
      ];
    default:
      return [];
  }
};

// ─────────────────────────────────────────
// LABELS DES RÔLES
// ─────────────────────────────────────────

const roleLabel: Record<Role, string> = {
  ['SYNDIC']:    "Syndic",
  ['BAILLEUR']:  "Bailleur social",
  ['MAIRIE']:    "Mairie",
  ['GARDIEN']:   "Gardien",
  ['CHAUFFEUR']: "Chauffeur",
  ['HABITANT']:  "Habitant",
  ['ADMIN']:     "Administrateur",
};

// ─────────────────────────────────────────
// ICÔNES SVG inline
// ─────────────────────────────────────────

const NavIcon = ({ name, active }: { name: string; active: boolean }) => {
  const color = active ? "#4caf50" : "#6b84a3";
  const icons: Record<string, JSX.Element> = {
    grid:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    truck: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    home:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    bell:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    map:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    gps:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    logout:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    plus:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    cpu:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
  };
  return icons[name] ?? null;
};

// ─────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen : boolean;
  onClose: () => void;
}) {
  const navigate                        = useNavigate();
  const location                        = useLocation();
  const { utilisateur, logout }         = useAuth();
  const { nonLuesCount, wsConnected }   = useNotifications();

  if (!utilisateur) return null;

  const navItems = getNavItems(utilisateur.role, nonLuesCount);

  // Initiales pour l'avatar
  const initiales = `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase();
  const avatarClass = `sidebar__user-avatar sidebar__user-avatar--${utilisateur.role.toLowerCase()}`;

  return (
    <>
    {isOpen && <div className="sidebar__backdrop" onClick={onClose} />}
    <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>

      {/* ── Logo ── */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
        <span className="sidebar__logo-text">
          BIDI<span>WS</span>
        </span>
      </div>

      {/* ── Profil ── */}
      <div className="sidebar__user">
        <div className={avatarClass}>{initiales}</div>
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">
            {utilisateur.prenom} {utilisateur.nom}
          </div>
          <div className="sidebar__user-role">
            {roleLabel[utilisateur.role]}
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Navigation</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}`}
              onClick={() => {
                navigate(item.path);
                // Referme le tiroir mobile après sélection, mais pas la
                // sidebar desktop (repli explicite de l'utilisateur,
                // pas un overlay à escamoter après navigation).
                if (window.innerWidth <= 768) onClose();
              }}
            >
              <NavIcon name={item.icon} active={isActive} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="sidebar__nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Statut WebSocket ── */}
      <div className="sidebar__ws-status">
        <span className={`sidebar__ws-dot ${wsConnected ? "sidebar__ws-dot--connected" : ""}`} />
        <span>{wsConnected ? "Connecté en temps réel" : "Hors ligne"}</span>
      </div>

      {/* ── Déconnexion ── */}
      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={logout}>
          <NavIcon name="logout" active={false} />
          <span>Déconnexion</span>
        </button>
      </div>

    </aside>
    </>
  );
}

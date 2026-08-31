// ============================================================
// BIDIWS — NotificationsPage (Syndic)
// Fichier : src/pages/syndic/NotificationsPage/NotificationsPage.tsx
// ============================================================

import { JSX }                  from "react";
import { useNotifications }     from "../../../hooks/useNotifications";
import { StaggerContainer, StaggerItem } from "../../../components/ui/StaggerContainer/StaggerContainer";
import type { Notification }    from "../../../types";
import "./NotificationsPage.css";

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconCheck = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconAlert = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconInfo = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ─────────────────────────────────────────
// CONFIG PAR TYPE
// ─────────────────────────────────────────

const typeConfig: Record<string, { bg: string; border: string; color: string; icon: JSX.Element }> = {
  COLLECTE_CONFIRMEE: {
    bg: "rgba(76,175,80,0.12)", border: "rgba(76,175,80,0.25)", color: "#4caf50",
    icon: <IconCheck color="#4caf50" />,
  },
  COLLECTE_PROBABLE: {
    bg: "rgba(33,150,243,0.12)", border: "rgba(33,150,243,0.25)", color: "#2196f3",
    icon: <IconInfo color="#2196f3" />,
  },
  APPROCHE: {
    bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", color: "#f59e0b",
    icon: <IconAlert color="#f59e0b" />,
  },
  NON_PASSAGE: {
    bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", color: "#ef4444",
    icon: <IconAlert color="#ef4444" />,
  },
  RAPPEL_BAC: {
    bg: "rgba(156,39,176,0.12)", border: "rgba(156,39,176,0.25)", color: "#9c27b0",
    icon: <IconAlert color="#9c27b0" />,
  },
  INCIDENT: {
    bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", color: "#ef4444",
    icon: <IconAlert color="#ef4444" />,
  },
};

// ─────────────────────────────────────────
// ITEM NOTIFICATION
// ─────────────────────────────────────────

const NotifItem = ({
  notif,
  onRead,
}: {
  notif  : Notification;
  onRead : (id: number) => void;
}) => {
  const cfg = typeConfig[notif.type] ?? typeConfig.APPROCHE;

  return (
    <div
      className={`notif-item ${!notif.lu ? "notif-item--unread" : ""}`}
      onClick={() => onRead(notif.id)}
    >
      {/* Icône */}
      <div
        className="notif-item__icon"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        {cfg.icon}
      </div>

      {/* Corps */}
      <div className="notif-item__body">
        <div className={`notif-item__titre ${!notif.lu ? "notif-item__titre--unread" : ""}`}>
          {notif.titre}
        </div>
        <div className="notif-item__message">{notif.message}</div>
        <div className="notif-item__footer">
          <span className="notif-item__time">{notif.heureEnvoi}</span>
          <span className="notif-item__canal">{notif.canal}</span>
        </div>
      </div>

      {/* Dot non lu */}
      {!notif.lu && <div className="notif-item__dot" />}
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function NotificationsPage() {
  const { notifications, nonLuesCount, marquerLue, marquerToutesLues } = useNotifications();

  const handleRead = (id: number): void => {
    marquerLue(id).catch(e => console.error("BIDIWS — Erreur marquerLue", e));
  };

  const handleToutLire = (): void => {
    marquerToutesLues().catch(e => console.error("BIDIWS — Erreur marquerToutesLues", e));
  };

  return (
    <div>
      <div className="notifs__header">
        <div>
          <h1 className="notifs__title">Notifications</h1>
          <p className="notifs__subtitle">
            {nonLuesCount > 0 ? `${nonLuesCount} non lue${nonLuesCount > 1 ? "s" : ""}` : "Tout est lu"}
          </p>
        </div>
        {nonLuesCount > 0 && (
          <button className="notifs__tout-lire" onClick={handleToutLire}>
            Tout marquer comme lu
          </button>
        )}
      </div>

      <StaggerContainer className="notifs__list">
        {notifications.map(n => (
          <StaggerItem key={n.id}>
            <NotifItem notif={n} onRead={handleRead} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
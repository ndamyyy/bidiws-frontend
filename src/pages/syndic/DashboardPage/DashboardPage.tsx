// ============================================================
// BIDIWS — DashboardPage (Syndic)
// Fichier : src/pages/syndic/DashboardPage/DashboardPage.tsx
// ============================================================

import { useState, useEffect, JSX }                from "react";
import {
  MOCK_TOURNEES,
  MOCK_NOTIFICATIONS,
  MOCK_DASHBOARD_STATS,
  MOCK_TYPES_COLLECTE,
  getTourneeProgress,
} from "../../../mocks/data";
import { TypeCollecteIcon } from "../../../components/ui/TypeCollecteIcon/TypeCollecteIcon";
import type { Tournee, Notification }          from "../../../types";
import "./DashboardPage.css";

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconCheck = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconTruck = ({ color, size = 18 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconClock = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconBell = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconAlert = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ─────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────

const Badge = ({ statut }: { statut: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    COLLECTE_CONFIRMEE: { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Confirmé"   },
    EN_COURS:           { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "En cours"   },
    PLANIFIEE:          { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "Planifiée"  },
    TERMINEE:           { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Terminée"   },
    EN_ATTENTE:         { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "En attente" },
  };
  const s = map[statut] ?? map.EN_ATTENTE;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}44`,
      borderRadius: 20, padding: "3px 10px",
      fontSize: 11, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color,
        display: "inline-block",
        ...(statut === "EN_COURS" ? { animation: "livePulse 1.4s infinite" } : {})
      }} />
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────
// COMPOSANT BARRE PROGRESSION CAMION
// ─────────────────────────────────────────

const TruckRoute = ({ progress, arrets }: { progress: number; arrets: number }) => {
  const stops = Array.from({ length: arrets }, (_, i) =>
    Math.round((i / (arrets - 1)) * 100)
  );

  return (
    <div className="truck-route">
      {/* Track */}
      <div className="truck-route__track">
        <div className="truck-route__fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Stops */}
      {stops.map((pos, i) => (
        <div
          key={i}
          className={`truck-route__stop ${progress >= pos ? "truck-route__stop--done" : "truck-route__stop--pending"}`}
          style={{ left: `calc(2% + ${pos * 0.96}%)` }}
        />
      ))}

      {/* Camion */}
      <div className="truck-route__truck" style={{ left: `calc(2% + ${progress * 0.96}%)` }}>
        <IconTruck color="#4caf50" size={22} />
      </div>

      {/* Labels */}
      <div className="truck-route__labels">
        <span className="truck-route__label-left">Départ</span>
        <span className="truck-route__label-right">{progress}% complété</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// COMPOSANT STAT CARD avec compteur animé
// ─────────────────────────────────────────

const StatCard = ({
  label, value, color, bg, icon, delay,
}: {
  label : string;
  value : number;
  color : string;
  bg    : string;
  icon  : JSX.Element;
  delay : number;
}) => {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let current = 0;
    const step = Math.max(Math.floor(800 / value), 16);
    const timer = setInterval(() => {
      current++;
      setDisplayed(current);
      if (current >= value) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="stat-card" style={{ animationDelay: `${delay}s` }}>
      <div className="stat-card__top">
        <div className="stat-card__icon" style={{ background: bg, border: `1px solid ${color}33` }}>
          {icon}
        </div>
        <span className="stat-card__period">Aujourd'hui</span>
      </div>
      <div className="stat-card__value" style={{ color }}>{displayed}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function DashboardPage() {
  const tournees     : Tournee[]      = MOCK_TOURNEES;
  const notifications: Notification[] = MOCK_NOTIFICATIONS;
  const stats                         = MOCK_DASHBOARD_STATS;

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div>

      {/* ── En-tête ── */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Tableau de bord</h1>
          <div className="dashboard__subtitle">
            <span style={{ textTransform: "capitalize" }}>{today}</span>
            <div className="dashboard__live">
              <span className="dashboard__live-dot" />
              LIVE
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="dashboard__stats">
        <StatCard
          label="Collectes confirmées" value={stats.collectesConfirmees}
          color="#4caf50" bg="rgba(76,175,80,0.12)"
          icon={<IconCheck color="#4caf50" />} delay={0.05}
        />
        <StatCard
          label="Tournées en cours" value={stats.tourneesEnCours}
          color="#f59e0b" bg="rgba(245,158,11,0.12)"
          icon={<IconTruck color="#f59e0b" />} delay={0.10}
        />
        <StatCard
          label="En attente" value={stats.enAttente}
          color="#6b84a3" bg="rgba(107,132,163,0.12)"
          icon={<IconClock color="#6b84a3" />} delay={0.15}
        />
        <StatCard
          label="Alertes non lues" value={stats.notificationsNonLues}
          color="#ef4444" bg="rgba(239,68,68,0.12)"
          icon={<IconBell color="#ef4444" />} delay={0.20}
        />
      </div>

      {/* ── Progression tournées ── */}
      <div className="dashboard__tournees">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Progression des tournées</h2>
          <div className="dashboard__live">
            <span className="dashboard__live-dot" />
            LIVE
          </div>
        </div>

        {tournees.map((t) => {
          const progress = getTourneeProgress(t);
          const done     = t.arrets.filter(a => a.statut === 'COLLECTE_CONFIRMEE').length;
          const typeCode = MOCK_TYPES_COLLECTE.find(tc => tc.id === t.typeCollecteId)?.code;
          return (
            <div key={t.id} className="tournee-item">
              <div className="tournee-item__header">
                <div>
                  <div className="tournee-item__name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <TypeCollecteIcon code={typeCode} size={16} />
                    {t.typeCollecteLibelle}
                  </div>
                  <div className="tournee-item__meta">
                    {t.chauffeurPrenom} {t.chauffeurNom} · {t.camionImmatriculation}
                    {t.zoneNom && ` · ${t.zoneNom}`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="tournee-item__count" style={{ color: "#4caf50" }}>
                    {done}/{t.arrets.length}
                  </span>
                  <Badge statut={t.statut} />
                </div>
              </div>
              <TruckRoute progress={progress} arrets={t.arrets.length} />
            </div>
          );
        })}
      </div>

      {/* ── Activité récente ── */}
      <div className="dashboard__activity">
        <div className="dashboard__activity-header">
          <h2 className="dashboard__section-title">Activité récente</h2>
        </div>
        {notifications.slice(0, 5).map((n) => (
          <div key={n.id} className="activity-item">
            <div
              className="activity-item__icon"
              style={{
                background: n.type === 'COLLECTE_CONFIRMEE'
                  ? "rgba(76,175,80,0.15)"
                  : "rgba(245,158,11,0.15)",
                border: `1px solid ${n.type === 'COLLECTE_CONFIRMEE' ? "#4caf5044" : "#f59e0b44"}`,
              }}
            >
              {n.type === 'COLLECTE_CONFIRMEE'
                ? <IconCheck color="#4caf50" />
                : <IconAlert color="#f59e0b" />
              }
            </div>
            <div className="activity-item__content">
              <div className={`activity-item__msg ${n.lu ? "activity-item__msg--read" : ""}`}>
                {n.message}
              </div>
              <div className="activity-item__time">{n.heureEnvoi}</div>
            </div>
            {!n.lu && <div className="activity-item__dot" />}
          </div>
        ))}
      </div>

    </div>
  );
}

// ============================================================
// BIDIWS — AdminDashboardPage
// Fichier : src/pages/admin/AdminDashboardPage/AdminDashboardPage.tsx
// ============================================================

import { useState, useEffect, JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useVilles } from "../../../hooks/useVilles";
import { useCamions } from "../../../hooks/useCamions";
import { useResidences } from "../../../hooks/useResidences";
import { useTournees } from "../../../hooks/useTournees";
import { useSignalements } from "../../../hooks/useSignalements";
import { getArretsByTournee } from "../../../api/arrets.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import "./AdminDashboardPage.css";

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconCity = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1"/>
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

const IconHome = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
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
// BADGE STATUT (tournées + signalements — clés distinctes, un seul map)
// ─────────────────────────────────────────

const Badge = ({ statut }: { statut: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    COLLECTE_CONFIRMEE: { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Confirmé"     },
    EN_COURS:           { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "En cours"     },
    PLANIFIEE:          { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "Planifiée"    },
    TERMINEE:           { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Terminée"     },
    ANNULEE:            { bg: "rgba(239,68,68,0.15)",  color: "#ef4444", label: "Annulée"      },
    EN_ATTENTE:         { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "En attente"   },
    OUVERT:             { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Ouvert"       },
    EN_TRAITEMENT:      { bg: "rgba(33,150,243,0.15)", color: "#2196f3", label: "En traitement"},
    RESOLU:             { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Résolu"       },
    CLOS:               { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "Clos"         },
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
        ...(statut === "EN_COURS" ? { animation: "adminLivePulse 1.4s infinite" } : {})
      }} />
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────
// LIBELLÉS TYPE DE SIGNALEMENT
// ─────────────────────────────────────────

const TYPE_SIGNALEMENT_LABEL: Record<string, string> = {
  BAC_PLEIN:      "Bac plein",
  DEPOT_SAUVAGE:  "Dépôt sauvage",
  BAC_ENDOMMAGE:  "Bac endommagé",
  BAC_NON_RENTRE: "Bac non rentré",
  AUTRE:          "Autre",
};

// ─────────────────────────────────────────
// COMPOSANT BARRE PROGRESSION CAMION
// ─────────────────────────────────────────

const TruckRoute = ({ progress, arrets }: { progress: number; arrets: number }) => {
  const stops = arrets > 1
    ? Array.from({ length: arrets }, (_, i) => Math.round((i / (arrets - 1)) * 100))
    : [];

  return (
    <div className="admin-truck-route">
      <div className="admin-truck-route__track">
        <div className="admin-truck-route__fill" style={{ width: `${progress}%` }} />
      </div>

      {stops.map((pos, i) => (
        <div
          key={i}
          className={`admin-truck-route__stop ${progress >= pos ? "admin-truck-route__stop--done" : "admin-truck-route__stop--pending"}`}
          style={{ left: `calc(2% + ${pos * 0.96}%)` }}
        />
      ))}

      <div className="admin-truck-route__truck" style={{ left: `calc(2% + ${progress * 0.96}%)` }}>
        <IconTruck color="#4caf50" size={22} />
      </div>

      <div className="admin-truck-route__labels">
        <span className="admin-truck-route__label-left">Départ</span>
        <span className="admin-truck-route__label-right">{progress}% complété</span>
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
    <div className="admin-stat-card" style={{ animationDelay: `${delay}s` }}>
      <div className="admin-stat-card__top">
        <div className="admin-stat-card__icon" style={{ background: bg, border: `1px solid ${color}33` }}>
          {icon}
        </div>
        <span className="admin-stat-card__period">Aujourd'hui</span>
      </div>
      <div className="admin-stat-card__value" style={{ color }}>{displayed}</div>
      <div className="admin-stat-card__label">{label}</div>
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const now  = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const { data: villes,     isLoading: isLoadingVilles }     = useVilles();
  const { data: camions,    isLoading: isLoadingCamions }    = useCamions();
  const { data: residences, isLoading: isLoadingResidences } = useResidences();
  const { data: tournees,   isLoading: isLoadingTournees }   = useTournees({ date });
  const { data: signalements, isLoading: isLoadingSignalements, isError: isErrorSignalements } = useSignalements();

  const tourneesListe = tournees ?? [];

  // ── Arrêts de chaque tournée du jour (une query par tournée) ──
  const arretsQueries = useQueries({
    queries: tourneesListe.map(t => ({
      queryKey: ["arrets", "tournee", t.id],
      queryFn: () => getArretsByTournee(t.id),
      enabled: !!tournees,
    })),
  });

  const isChargementEssentiel =
    isLoadingVilles || isLoadingCamions || isLoadingResidences || isLoadingTournees;

  if (isChargementEssentiel) {
    return <LoadingSpinner />;
  }

  const tourneesEnCours = tourneesListe.filter(t => t.statut === 'EN_COURS').length;

  const today = now.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const signalementsRecents = [...(signalements ?? [])]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div>

      {/* ── En-tête ── */}
      <div className="admin-dashboard__header">
        <div>
          <h1 className="admin-dashboard__title">Administration</h1>
          <div className="admin-dashboard__subtitle">
            <span style={{ textTransform: "capitalize" }}>{today}</span>
            <div className="admin-dashboard__live">
              <span className="admin-dashboard__live-dot" />
              LIVE
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="admin-dashboard__stats">
        <StatCard
          label="Villes" value={villes?.length ?? 0}
          color="#5B6CFF" bg="rgba(91,108,255,0.12)"
          icon={<IconCity color="#5B6CFF" />} delay={0.05}
        />
        <StatCard
          label="Camions" value={camions?.length ?? 0}
          color="#f59e0b" bg="rgba(245,158,11,0.12)"
          icon={<IconTruck color="#f59e0b" />} delay={0.10}
        />
        <StatCard
          label="Tournées en cours" value={tourneesEnCours}
          color="#4caf50" bg="rgba(76,175,80,0.12)"
          icon={<IconClock color="#4caf50" />} delay={0.15}
        />
        <StatCard
          label="Résidences" value={residences?.length ?? 0}
          color="#1b3a6b" bg="rgba(27,58,107,0.15)"
          icon={<IconHome color="#1b3a6b" />} delay={0.20}
        />
      </div>

      {/* ── Tournées du jour ── */}
      <div className="admin-dashboard__tournees">
        <div className="admin-dashboard__section-header">
          <h2 className="admin-dashboard__section-title">Tournées du jour</h2>
          <div className="admin-dashboard__live">
            <span className="admin-dashboard__live-dot" />
            LIVE
          </div>
        </div>

        {tourneesListe.length === 0 && (
          <div className="admin-dashboard__empty">Aucune tournée programmée aujourd'hui.</div>
        )}

        {tourneesListe.map((t, i) => {
          const arretsListe = arretsQueries[i]?.data ?? [];
          const isLoadingArret = arretsQueries[i]?.isLoading ?? false;
          const done     = arretsListe.filter(a => a.statut === 'COLLECTE_CONFIRMEE').length;
          const total    = arretsListe.length;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <div key={t.id} className="admin-tournee-item">
              <div className="admin-tournee-item__header">
                <div>
                  <div className="admin-tournee-item__name">{t.typeCollecteLibelle}</div>
                  <div className="admin-tournee-item__meta">
                    {t.chauffeurPrenom} {t.chauffeurNom} · {t.camionImmatriculation}
                    {t.zoneNom && ` · ${t.zoneNom}`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="admin-tournee-item__count">
                    {isLoadingArret ? "…" : `${done}/${total}`}
                  </span>
                  <Badge statut={t.statut} />
                </div>
              </div>
              <TruckRoute progress={progress} arrets={total} />
            </div>
          );
        })}
      </div>

      {/* ── Signalements récents ── */}
      <div className="admin-dashboard__signalements">
        <div className="admin-dashboard__signalements-header">
          <h2 className="admin-dashboard__section-title">Signalements récents</h2>
          <button
            className="admin-dashboard__see-all"
            onClick={() => navigate("/admin/signalements")}
          >
            Voir tout →
          </button>
        </div>

        {isLoadingSignalements && (
          <div className="admin-dashboard__empty" style={{ padding: "14px 22px" }}>
            Chargement des signalements…
          </div>
        )}

        {isErrorSignalements && (
          <div className="admin-dashboard__empty" style={{ padding: "14px 22px" }}>
            Erreur lors du chargement des signalements.
          </div>
        )}

        {!isLoadingSignalements && !isErrorSignalements && signalementsRecents.length === 0 && (
          <div className="admin-dashboard__empty" style={{ padding: "14px 22px" }}>
            Aucun signalement pour le moment.
          </div>
        )}

        {signalementsRecents.map((s) => (
          <div
            key={s.id}
            className="admin-signalement-item"
            onClick={() => navigate("/admin/signalements")}
            style={{ cursor: "pointer" }}
          >
            <div
              className="admin-signalement-item__icon"
              style={{
                background: s.statut === 'RESOLU' ? "rgba(76,175,80,0.15)" : "rgba(245,158,11,0.15)",
                border: `1px solid ${s.statut === 'RESOLU' ? "#4caf5044" : "#f59e0b44"}`,
              }}
            >
              <IconAlert color={s.statut === 'RESOLU' ? "#4caf50" : "#f59e0b"} />
            </div>
            <div className="admin-signalement-item__content">
              <div className="admin-signalement-item__msg">
                {TYPE_SIGNALEMENT_LABEL[s.type] ?? s.type}
                {s.residenceNom && ` — ${s.residenceNom}`}
              </div>
              <div className="admin-signalement-item__meta">
                {s.auteurPrenom} {s.auteurNom}
              </div>
            </div>
            <Badge statut={s.statut} />
          </div>
        ))}
      </div>

    </div>
  );
}

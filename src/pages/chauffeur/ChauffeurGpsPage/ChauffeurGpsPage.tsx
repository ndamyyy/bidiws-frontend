// ============================================================
// BIDIWS — ChauffeurGpsPage
// Fichier : src/pages/chauffeur/ChauffeurGpsPage/ChauffeurGpsPage.tsx
// Pas de librairie de carte dans le projet (Leaflet/Mapbox/Google Maps
// absents) — vraie carte interactive hors scope, timeline verticale à
// la place. Toggle GPS en state local pur, aucune géolocalisation
// réelle (reporté à Capacitor, même décision que ChauffeurTourneePage).
// ============================================================

import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useMaTourneeAujourdhui } from "../../../hooks/useTournees";
import { useArretsByTournee } from "../../../hooks/useArrets";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import type { Arret } from "../../../types";
import "./ChauffeurGpsPage.css";

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconCheck = ({ color, size = 14 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconGps = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
);

// ─────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────

const Badge = ({ statut }: { statut: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    COLLECTE_CONFIRMEE: { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Confirmé"     },
    EN_APPROCHE:        { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "En approche"  },
    COLLECTE_PROBABLE:  { bg: "rgba(33,150,243,0.15)", color: "#2196f3", label: "Probable"      },
    EN_ATTENTE:         { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "En attente"   },
    INCIDENT:            { bg: "rgba(239,68,68,0.15)",  color: "#ef4444", label: "Incident"     },
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
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────
// LIGNE TIMELINE
// ─────────────────────────────────────────

const TimelineItem = ({
  arret,
  index,
  isCurrent,
  isLast,
}: {
  arret     : Arret;
  index     : number;
  isCurrent : boolean;
  isLast    : boolean;
}) => {
  const isDone = arret.statut === 'COLLECTE_CONFIRMEE';
  const markerClass = isDone
    ? "chauffeur-gps__marker--done"
    : isCurrent
    ? "chauffeur-gps__marker--current"
    : "chauffeur-gps__marker--pending";

  return (
    <div className="chauffeur-gps__item">
      <div className="chauffeur-gps__marker-col">
        <div className={`chauffeur-gps__marker ${markerClass}`}>
          {isDone ? <IconCheck color="#4caf50" /> : index + 1}
        </div>
        {!isLast && (
          <div className={`chauffeur-gps__line ${isDone ? "chauffeur-gps__line--done" : ""}`} />
        )}
      </div>

      <div className="chauffeur-gps__item-content">
        <div className="chauffeur-gps__item-name">{arret.residenceNom}</div>
        {arret.residenceAdresse && (
          <div className="chauffeur-gps__item-addr">{arret.residenceAdresse}</div>
        )}
        {arret.heureCollecte ? (
          <div className="chauffeur-gps__item-heure">
            ✓ Collecté à {new Date(arret.heureCollecte).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        ) : arret.heureEstimee ? (
          <div className="chauffeur-gps__item-heure">
            Estimé à {new Date(arret.heureEstimee).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        ) : null}
        <div className="chauffeur-gps__item-badge">
          <Badge statut={arret.statut} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function ChauffeurGpsPage() {
  const { utilisateur } = useAuth();
  const [gpsOn, setGpsOn] = useState<boolean>(true);

  const chauffeurId = utilisateur?.id;
  const { data: tournees, isLoading: isLoadingTournees } = useMaTourneeAujourdhui(chauffeurId);
  const tournee = tournees?.[0];

  const { data: arrets, isLoading: isLoadingArrets } = useArretsByTournee(tournee?.id);

  const isChargement = isLoadingTournees || isLoadingArrets;

  if (isChargement) {
    return <LoadingSpinner />;
  }

  if (!tournee) {
    return (
      <div>
        <div className="chauffeur-gps__header">
          <h1 className="chauffeur-gps__title">Suivi GPS</h1>
          <p className="chauffeur-gps__subtitle">Aucune tournée programmée aujourd'hui.</p>
        </div>
      </div>
    );
  }

  // ── Ordre de la tournée + arrêt "en cours" = premier non collecté ──
  const arretsListe = [...(arrets ?? [])].sort((a, b) => a.ordre - b.ordre);
  const currentIndex = arretsListe.findIndex(a => a.statut !== 'COLLECTE_CONFIRMEE');

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="chauffeur-gps__header">
        <h1 className="chauffeur-gps__title">Suivi GPS</h1>
        <p className="chauffeur-gps__subtitle">
          {tournee.typeCollecteLibelle} · {tournee.camionImmatriculation}
          {tournee.zoneNom && ` · ${tournee.zoneNom}`}
        </p>
      </div>

      {/* ── Toggle GPS ── */}
      <div className="chauffeur-gps__toggle">
        <div className="chauffeur-gps__toggle-left">
          <div
            className="chauffeur-gps__toggle-icon"
            style={{
              background: gpsOn ? "rgba(76,175,80,0.2)" : "var(--overlay-5)",
              border    : `1.5px solid ${gpsOn ? "rgba(76,175,80,0.4)" : "var(--overlay-8)"}`,
              boxShadow : gpsOn ? "0 0 20px rgba(76,175,80,0.2)" : "none",
            }}
          >
            <IconGps color={gpsOn ? "#4caf50" : "#6b84a3"} />
          </div>
          <div>
            <div className="chauffeur-gps__toggle-title">GPS actif</div>
            <div
              className="chauffeur-gps__toggle-desc"
              style={{ color: gpsOn ? "#4caf50" : "#6b84a3" }}
            >
              {gpsOn ? "Position partagée en temps réel" : "Désactivé"}
            </div>
          </div>
        </div>

        <button
          className="toggle-switch"
          style={{ background: gpsOn ? "#4caf50" : "var(--overlay-10)" }}
          onClick={() => setGpsOn(prev => !prev)}
        >
          <div className="toggle-switch__thumb" style={{ left: gpsOn ? 28 : 4 }} />
        </button>
      </div>

      {/* ── Timeline ── */}
      <h2 className="chauffeur-gps__section-title">Trajet de la tournée</h2>
      {arretsListe.length === 0 ? (
        <div className="chauffeur-gps__empty">Aucun arrêt sur cette tournée.</div>
      ) : (
        <div className="chauffeur-gps__timeline">
          {arretsListe.map((arret, idx) => (
            <TimelineItem
              key={arret.id}
              arret={arret}
              index={idx}
              isCurrent={idx === currentIndex}
              isLast={idx === arretsListe.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

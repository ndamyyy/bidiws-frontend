// ============================================================
// BIDIWS — TourneesPage (Syndic)
// Fichier : src/pages/syndic/TourneesPage/TourneesPage.tsx
// ============================================================

import { useState }                          from "react";
import { MOCK_TOURNEES }                     from "../../../mocks/data";
import type { Tournee, Arret }               from "../../../types";
import "./TourneesPage.css";

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconCheck = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconClock = ({ color }: { color: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconTruck = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

// ─────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────

const Badge = ({ statut }: { statut: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    COLLECTE_CONFIRMEE: { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Confirmé"   },
    EN_APPROCHE:        { bg: "rgba(33,150,243,0.15)", color: "#2196f3", label: "En approche"},
    EN_COURS:           { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "En cours"   },
    PLANIFIEE:          { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "Planifiée"  },
    TERMINEE:           { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Terminée"   },
    EN_ATTENTE:         { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "En attente" },
    INCIDENT:           { bg: "rgba(239,68,68,0.15)",  color: "#ef4444", label: "Incident"   },
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
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: s.color, display: "inline-block",
        ...(statut === "EN_COURS" || statut === "EN_APPROCHE"
          ? { animation: "livePulse 1.4s infinite" } : {}),
      }} />
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────
// SCORE CONFIANCE
// ─────────────────────────────────────────

const ScoreBadge = ({ score }: { score: number }) => {
  const cls = score >= 80 ? "high" : score >= 50 ? "medium" : "low";
  return (
    <span className={`score-badge score-badge--${cls}`}>
      ⚡ {score}%
    </span>
  );
};

// ─────────────────────────────────────────
// ARRET ITEM
// ─────────────────────────────────────────

const ArretItem = ({
  arret,
  index,
  onValider,
}: {
  arret    : Arret;
  index    : number;
  onValider: (id: number) => void;
}) => {
  const isDone    = arret.statut === 'COLLECTE_CONFIRMEE';
  const isEnCours = arret.statut === 'EN_APPROCHE' || arret.statut === 'COLLECTE_PROBABLE';

  const stepClass = isDone
    ? "arret-item__step--done"
    : isEnCours
    ? "arret-item__step--en-cours"
    : "arret-item__step--pending";

  return (
    <div className={`arret-item ${isEnCours ? "arret-item--en-cours" : ""}`}>
      {/* Étape */}
      <div className={`arret-item__step ${stepClass}`}>
        {isDone
          ? <IconCheck color="#4caf50" />
          : <span style={{ color: isEnCours ? "#f59e0b" : "#6b84a3" }}>{index + 1}</span>
        }
      </div>

      {/* Info résidence */}
      <div className="arret-item__info">
        <div className="arret-item__name">{arret.residence.nom}</div>
        <div className="arret-item__addr">{arret.residence.adresse}</div>
        {arret.typesConteneurs && (
          <div className="arret-item__tags">
            {arret.typesConteneurs.split(",").map((c, i) => (
              <span key={i} className="arret-item__tag">{c.trim()}</span>
            ))}
          </div>
        )}
        {arret.heureCollecte && (
          <div className="arret-item__time">
            <IconClock color="#6b84a3" />
            Collecté à {new Date(arret.heureCollecte).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            {arret.modeDetection && ` · via ${arret.modeDetection.replace("_", " ")}`}
          </div>
        )}
        {arret.heureEstimee && !arret.heureCollecte && (
          <div className="arret-item__time">
            <IconClock color="#6b84a3" />
            Estimé à {new Date(arret.heureEstimee).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>

      {/* Droite */}
      <div className="arret-item__right">
        <Badge statut={arret.statut} />
        {arret.scoreConfiance > 0 && <ScoreBadge score={arret.scoreConfiance} />}
        {arret.statut === 'EN_ATTENTE' && (
          <button className="btn-valider" onClick={() => onValider(arret.id)}>
            <IconCheck color="#fff" /> Valider
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function TourneesPage() {
  const [tournees, setTournees] = useState<Tournee[]>(MOCK_TOURNEES);

  const handleValider = (arretId: number): void => {
    const now = new Date().toISOString();
    setTournees(prev =>
      prev.map(t => ({
        ...t,
        arrets: t.arrets.map(a =>
          a.id === arretId
            ? { ...a, statut: 'COLLECTE_CONFIRMEE' as const, heureCollecte: now, scoreConfiance: 100, modeDetection: 'VALIDATION_CHAUFFEUR' as const }
            : a
        ),
      }))
    );
  };

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="tournees__header">
        <div>
          <h1 className="tournees__title">Tournées du jour</h1>
          <p className="tournees__subtitle">
            {tournees.length} tournée{tournees.length > 1 ? "s" : ""} planifiée{tournees.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Tournées ── */}
      {tournees.map(t => {
        const done  = t.arrets.filter(a => a.statut === 'COLLECTE_CONFIRMEE').length;
        const total = t.arrets.length;
        return (
          <div key={t.id} className="tournee-card">
            {/* Header */}
            <div className="tournee-card__head">
              <div className="tournee-card__head-left">
                <div className="tournee-card__type">{t.typeCollecte.libelle}</div>
                <div className="tournee-card__meta">
                  <IconTruck color="#6b84a3" />
                  {t.chauffeur.prenom} {t.chauffeur.nom}
                  &nbsp;·&nbsp; {t.camion.immatriculation}
                  {t.zone && <>&nbsp;·&nbsp; Secteur {t.zone.code}</>}
                </div>
              </div>
              <div className="tournee-card__head-right">
                <span style={{ fontSize: 13, color: "#4caf50", fontWeight: 700 }}>
                  {done}/{total} arrêts
                </span>
                <Badge statut={t.statut} />
              </div>
            </div>

            {/* Arrêts */}
            {t.arrets.map((arret, idx) => (
              <ArretItem
                key={arret.id}
                arret={arret}
                index={idx}
                onValider={handleValider}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
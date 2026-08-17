// ============================================================
// BIDIWS — ResidencesPage (Syndic)
// Fichier : src/pages/syndic/ResidencesPage/ResidencesPage.tsx
// ============================================================

import { MOCK_RESIDENCES, MOCK_ARRETS } from "../../../mocks/data";
import type { Residence }               from "../../../types";
import "./ResidencesPage.css";

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconHome = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconCheck = ({ color }: { color: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────

const Badge = ({ statut }: { statut: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    COLLECTE_CONFIRMEE: { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Collecté"   },
    EN_APPROCHE:        { bg: "rgba(33,150,243,0.15)", color: "#2196f3", label: "En approche"},
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
    }}>
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────
// CARTE RÉSIDENCE
// ─────────────────────────────────────────

const ResidenceCard = ({ residence }: { residence: Residence }) => {
  const arret    = MOCK_ARRETS.find(a => a.residenceId === residence.id);
  const gardien  = residence.gardiens[0];
  const initiales = gardien
    ? `${gardien.prenom[0]}${gardien.nom[0]}`.toUpperCase()
    : "?";

  return (
    <div className="residence-card">
      <div className="residence-card__top">
        <div className="residence-card__icon">
          <IconHome color="#1b3a6b" />
        </div>
        <div className="residence-card__badges">
          <span className="residence-card__secteur">
            Sect. {residence.zone?.code ?? "—"}
          </span>
          {arret && <Badge statut={arret.statut} />}
        </div>
      </div>

      <div className="residence-card__name">{residence.nom}</div>
      <div className="residence-card__addr">
        {residence.adresse}, {residence.codePostal} {residence.ville.nom}
      </div>

      <hr className="residence-card__divider" />

      {gardien && (
        <div className="residence-card__gardien">
          <div className="residence-card__avatar">{initiales}</div>
          <div>
            <div className="residence-card__gardien-name">
              {gardien.prenom} {gardien.nom}
            </div>
            <div className="residence-card__gardien-tel">{gardien.telephone}</div>
          </div>
        </div>
      )}

      {arret?.heureCollecte && (
        <div className="residence-card__collecte">
          <IconCheck color="#4caf50" />
          Collecté à {new Date(arret.heureCollecte).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function ResidencesPage() {
  return (
    <div>
      <div className="residences__header">
        <div>
          <h1 className="residences__title">Résidences</h1>
          <p className="residences__subtitle">
            {MOCK_RESIDENCES.length} résidences enregistrées
          </p>
        </div>
      </div>

      <div className="residences__grid">
        {MOCK_RESIDENCES.map(r => (
          <ResidenceCard key={r.id} residence={r} />
        ))}
      </div>
    </div>
  );
}
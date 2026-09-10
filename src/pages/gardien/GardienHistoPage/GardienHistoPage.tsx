// ============================================================
// BIDIWS — GardienHistoPage
// Fichier : src/pages/gardien/GardienHistoPage/GardienHistoPage.tsx
// Historique complet des arrêts de la résidence du gardien (contrairement
// à GardienHomePage, qui n'affiche que le plus récent).
// ============================================================

import { useAuth } from "../../../hooks/useAuth";
import { useResidencesGardien } from "../../../hooks/useResidences";
import { useArretsByResidence } from "../../../hooks/useArrets";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { StaggerContainer, StaggerItem } from "../../../components/ui/StaggerContainer/StaggerContainer";
import type { Arret } from "../../../types";
import "./GardienHistoPage.css";

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconCheck = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconClock = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

// ─────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────

const Badge = ({ statut }: { statut: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    COLLECTE_CONFIRMEE: { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Confirmé"    },
    COLLECTE_PROBABLE:  { bg: "rgba(33,150,243,0.15)", color: "#2196f3", label: "Probable"     },
    EN_APPROCHE:        { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "En approche" },
    EN_ATTENTE:         { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "En attente"  },
    INCIDENT:            { bg: "rgba(239,68,68,0.15)",  color: "#ef4444", label: "Incident"    },
  };
  const s = map[statut] ?? map.EN_ATTENTE;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}44`,
      borderRadius: 20, padding: "3px 10px",
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────
// LIBELLÉS MODE DE DÉTECTION
// ─────────────────────────────────────────

const MODE_DETECTION_LABEL: Record<string, string> = {
  GPS_AUTO:              "GPS automatique",
  VALIDATION_CHAUFFEUR:  "Validation chauffeur",
  CAPTEUR_BENNE:         "Capteur benne",
  RFID:                  "RFID",
  COMMUNAUTAIRE:         "Signalement communautaire",
};

// ─────────────────────────────────────────
// LIGNE HISTORIQUE
// ─────────────────────────────────────────

const HistoItem = ({ arret }: { arret: Arret }) => {
  const isDone = arret.statut === 'COLLECTE_CONFIRMEE';
  const dateAffichee = arret.heureCollecte ?? arret.heureEstimee;

  return (
    <div className="gardien-histo-item">
      <div
        className="gardien-histo-item__icon"
        style={{
          background: isDone ? "rgba(76,175,80,0.15)" : "rgba(107,132,163,0.12)",
          border: `1px solid ${isDone ? "#4caf5044" : "#6b84a344"}`,
        }}
      >
        {isDone ? <IconCheck color="#4caf50" /> : <IconClock color="#6b84a3" />}
      </div>

      <div className="gardien-histo-item__body">
        <div className="gardien-histo-item__date">
          {dateAffichee
            ? new Date(dateAffichee).toLocaleString("fr-FR", {
                weekday: "short", day: "numeric", month: "short",
                hour: "2-digit", minute: "2-digit",
              })
            : "Date inconnue"
          }
        </div>
        {arret.modeDetection && (
          <div className="gardien-histo-item__mode">
            {MODE_DETECTION_LABEL[arret.modeDetection] ?? arret.modeDetection}
          </div>
        )}
      </div>

      <Badge statut={arret.statut} />
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function GardienHistoPage() {
  const { utilisateur } = useAuth();

  const gardienId = utilisateur?.id;
  const { data: residencesGardien, isLoading: isLoadingResidences } = useResidencesGardien(gardienId);

  const residenceLien = residencesGardien?.find(r => r.principal) ?? residencesGardien?.[0];
  const residenceId   = residenceLien?.residenceId;

  const { data: arrets, isLoading: isLoadingArrets } = useArretsByResidence(residenceId);

  const isChargement = isLoadingResidences || isLoadingArrets;

  if (isChargement) {
    return <LoadingSpinner />;
  }

  // Le plus récent en premier — pas de champ date exploitable sur
  // Arret, id décroissant comme proxy (même logique pragmatique que
  // GardienHomePage/ResidencesPage).
  const arretsListe = [...(arrets ?? [])].sort((a, b) => b.id - a.id);

  return (
    <div>
      <div className="gardien-histo__header">
        <h1 className="gardien-histo__title">Historique</h1>
        <p className="gardien-histo__subtitle">
          {residenceLien?.residenceNom ?? "Résidence non assignée"}
        </p>
      </div>

      {arretsListe.length === 0 ? (
        <div className="gardien-histo__empty">Aucun passage enregistré pour le moment.</div>
      ) : (
        <StaggerContainer className="gardien-histo__list">
          {arretsListe.map(arret => (
            <StaggerItem key={arret.id}>
              <HistoItem arret={arret} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}

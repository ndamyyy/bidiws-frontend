// ============================================================
// BIDIWS — HabitantHistoriquePage
// Fichier : src/pages/habitant/HabitantHistoriquePage/HabitantHistoriquePage.tsx
// Historique complet des arrêts de la résidence de l'habitant — même
// principe que GardienHistoPage (useArretsByResidence réutilisé tel
// quel), avec useResidencesHabitant à la place de
// useResidencesGardien (un habitant n'a qu'une résidence, pas de
// notion de résidence "principale" à départager comme le gardien).
// ============================================================

import { useAuth } from "../../../hooks/useAuth";
import { useResidencesHabitant } from "../../../hooks/useResidences";
import { useArretsByResidence } from "../../../hooks/useArrets";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { StaggerContainer, StaggerItem } from "../../../components/ui/StaggerContainer/StaggerContainer";
import type { Arret } from "../../../types";
import "./HabitantHistoriquePage.css";

// ─────────────────────────────────────────
// ICÔNES (reprises telles quelles de GardienHistoPage)
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
    <div className="habitant-histo-item">
      <div
        className="habitant-histo-item__icon"
        style={{
          background: isDone ? "rgba(76,175,80,0.15)" : "rgba(107,132,163,0.12)",
          border: `1px solid ${isDone ? "#4caf5044" : "#6b84a344"}`,
        }}
      >
        {isDone ? <IconCheck color="#4caf50" /> : <IconClock color="#6b84a3" />}
      </div>

      <div className="habitant-histo-item__body">
        <div className="habitant-histo-item__date">
          {dateAffichee
            ? new Date(dateAffichee).toLocaleString("fr-FR", {
                weekday: "short", day: "numeric", month: "short",
                hour: "2-digit", minute: "2-digit",
              })
            : "Date inconnue"
          }
        </div>
        {arret.modeDetection && (
          <div className="habitant-histo-item__mode">
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

export default function HabitantHistoriquePage() {
  const { utilisateur } = useAuth();

  const habitantId = utilisateur?.id;
  const { data: residencesHabitant, isLoading: isLoadingResidences } = useResidencesHabitant(habitantId);

  const residenceLien = residencesHabitant?.[0];
  const residenceId   = residenceLien?.residenceId;

  const { data: arrets, isLoading: isLoadingArrets } = useArretsByResidence(residenceId);

  const isChargement = isLoadingResidences || isLoadingArrets;

  if (isChargement) {
    return <LoadingSpinner />;
  }

  // Cas déjà identifié ailleurs sur l'espace habitant (HabitantHomePage/
  // HabitantCalendrierPage) : un compte sans lien résidence.
  if (!residenceLien) {
    return (
      <div>
        <div className="habitant-histo__header">
          <h1 className="habitant-histo__title">Historique</h1>
        </div>
        <div style={{ padding: "24px 0", color: "var(--text-secondary)", fontSize: 13 }}>
          Votre compte n'est pas encore rattaché à une résidence — contactez
          votre syndic ou l'administrateur.
        </div>
      </div>
    );
  }

  // Le plus récent en premier — pas de champ date exploitable sur
  // Arret, id décroissant comme proxy (même logique pragmatique que
  // GardienHistoPage/GardienHomePage/HabitantHomePage).
  const arretsListe = [...(arrets ?? [])].sort((a, b) => b.id - a.id);

  return (
    <div>
      <div className="habitant-histo__header">
        <h1 className="habitant-histo__title">Historique</h1>
        <p className="habitant-histo__subtitle">
          {residenceLien.residenceNom}
        </p>
      </div>

      {arretsListe.length === 0 ? (
        <div className="habitant-histo__empty">Aucun passage enregistré pour le moment.</div>
      ) : (
        <StaggerContainer className="habitant-histo__list">
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

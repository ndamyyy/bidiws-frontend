// ============================================================
// BIDIWS — HabitantCalendrierPage
// Fichier : src/pages/habitant/HabitantCalendrierPage/HabitantCalendrierPage.tsx
// Calendrier complet de la semaine, déplacé depuis HabitantHomePage
// (qui ne garde qu'un résumé + le statut "Aujourd'hui") — mêmes hooks
// de récupération (useResidencesHabitant + useCalendrierCollecte +
// useTypesCollecte), pas de logique dupliquée.
// ============================================================

import { useAuth } from "../../../hooks/useAuth";
import { useResidencesHabitant } from "../../../hooks/useResidences";
import { useCalendrierCollecte, useTypesCollecte } from "../../../hooks/useCalendrierCollecte";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { TypeCollecteIcon } from "../../../components/ui/TypeCollecteIcon/TypeCollecteIcon";
import "./HabitantCalendrierPage.css";

// ─────────────────────────────────────────
// HELPERS
// Repris tels quels depuis HabitantHomePage (constantes d'affichage
// pures, pas la logique de récupération visée par la contrainte de
// non-duplication) — même convention que GardienHistoPage/
// GardienHomePage, chaque page reste autonome pour ses petits helpers.
// ─────────────────────────────────────────

const JOURS: Record<number, string> = {
  1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi",
  5: "Vendredi", 6: "Samedi", 7: "Dimanche",
};

const formatHeure = (heure: string | undefined): string =>
  heure ? heure.replace(":", "h") : "—";

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function HabitantCalendrierPage() {
  const { utilisateur } = useAuth();

  const habitantId = utilisateur?.id;
  const { data: residencesHabitant, isLoading: isLoadingResidences, isError: isErrorResidences } =
    useResidencesHabitant(habitantId);

  const residenceLien = residencesHabitant?.[0];
  const residenceId   = residenceLien?.residenceId;

  const { data: calendrier, isLoading: isLoadingCalendrier, isError: isErrorCalendrier } =
    useCalendrierCollecte(residenceId);
  const { data: typesCollecte, isLoading: isLoadingTypes } = useTypesCollecte();

  const isChargement = isLoadingResidences || isLoadingCalendrier || isLoadingTypes;
  const isErreur = isErrorResidences || isErrorCalendrier;

  if (isChargement) {
    return <LoadingSpinner />;
  }

  // Même garde que HabitantHomePage : sans lui, une requête en erreur
  // (data: undefined) retomberait silencieusement sur "Aucun calendrier
  // renseigné" — indiscernable d'un vrai calendrier vide.
  if (isErreur) {
    return (
      <div>
        <div className="habitant-calendrier__header">
          <h1 className="habitant-calendrier__title">Calendrier de collecte</h1>
        </div>
        <div style={{ padding: "24px 0", color: "var(--critical)", fontSize: 13 }}>
          Erreur lors du chargement de votre calendrier de collecte.
        </div>
      </div>
    );
  }

  // Même cas déjà identifié que HabitantHomePage : un compte habitant
  // sans lien résidence.
  if (!residenceLien) {
    return (
      <div>
        <div className="habitant-calendrier__header">
          <h1 className="habitant-calendrier__title">Calendrier de collecte</h1>
        </div>
        <div style={{ padding: "24px 0", color: "var(--text-secondary)", fontSize: 13 }}>
          Votre compte n'est pas encore rattaché à une résidence — contactez
          votre syndic ou l'administrateur.
        </div>
      </div>
    );
  }

  const calendrierActif = (calendrier ?? []).filter(c => c.actif);
  const calendrierTrie = [...calendrierActif].sort((a, b) => a.jourSemaine - b.jourSemaine);

  return (
    <div>
      <div className="habitant-calendrier__header">
        <h1 className="habitant-calendrier__title">Calendrier de collecte</h1>
        <p className="habitant-calendrier__subtitle">{residenceLien.residenceNom}</p>
      </div>

      <div className="habitant__schedule">
        <div className="habitant__schedule-header">
          Calendrier de collecte — cette semaine
        </div>
        {calendrierTrie.length === 0 && (
          <div style={{ padding: "16px 22px", color: "var(--text-secondary)", fontSize: 13 }}>
            Aucun calendrier de collecte renseigné pour votre résidence.
          </div>
        )}
        {calendrierTrie.map((c) => {
          const tc = typesCollecte?.find(t => t.id === c.typeCollecteId);
          return (
            <div key={c.id} className="schedule-item">
              <TypeCollecteIcon code={tc?.code} size={20} />
              <div className="schedule-item__type">{c.typeCollecteLibelle}</div>
              <div className="schedule-item__jour">{JOURS[c.jourSemaine]}</div>
              <div className="schedule-item__heure">{formatHeure(c.heureEstimee)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

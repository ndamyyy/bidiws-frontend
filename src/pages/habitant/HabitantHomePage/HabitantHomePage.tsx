// ============================================================
// BIDIWS — HabitantHomePage
// Fichier : src/pages/habitant/HabitantHomePage/HabitantHomePage.tsx
// ============================================================

import { useAuth } from "../../../hooks/useAuth";
import { useResidencesHabitant } from "../../../hooks/useResidences";
import { useCalendrierCollecte, useTypesCollecte } from "../../../hooks/useCalendrierCollecte";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import "./HabitantHomePage.css";

// ─────────────────────────────────────────
// ICÔNE TRASH
// ─────────────────────────────────────────

const IconTrash = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

// jourSemaine : 1=lundi...7=dimanche (ISO-8601) — NON vérifié contre une
// vraie donnée peuplée, voir le commentaire sur CalendrierCollecte dans
// types/index.ts. Si "prochaine collecte" tombe systématiquement sur le
// mauvais jour une fois testé, c'est ici et dans le type qu'il faut
// corriger la convention.
const JOURS: Record<number, string> = {
  1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi",
  5: "Vendredi", 6: "Samedi", 7: "Dimanche",
};

const jsDayToJourSemaine = (jsDay: number): number => (jsDay === 0 ? 7 : jsDay);

const formatHeure = (heure: string | undefined): string =>
  heure ? heure.replace(":", "h") : "—";

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function HabitantHomePage() {
  const { utilisateur } = useAuth();

  const habitantId = utilisateur?.id;
  const { data: residencesHabitant, isLoading: isLoadingResidences } =
    useResidencesHabitant(habitantId);

  const residenceLien = residencesHabitant?.[0];
  const residenceId   = residenceLien?.residenceId;

  const { data: calendrier, isLoading: isLoadingCalendrier } =
    useCalendrierCollecte(residenceId);
  const { data: typesCollecte, isLoading: isLoadingTypes } = useTypesCollecte();

  const isChargement = isLoadingResidences || isLoadingCalendrier || isLoadingTypes;

  if (isChargement) {
    return <LoadingSpinner />;
  }

  // ── Prochaine collecte : le jour actif le plus proche à partir
  //    d'aujourd'hui (sans comparer l'heure — même simplification que
  //    l'ancien mock, qui affichait toujours le premier jour du
  //    calendrier comme "aujourd'hui") ──
  const todayJourSemaine = jsDayToJourSemaine(new Date().getDay());
  const calendrierActif = (calendrier ?? []).filter(c => c.actif);
  const calendrierTrie = [...calendrierActif].sort(
    (a, b) => (a.jourSemaine - todayJourSemaine + 7) % 7 - (b.jourSemaine - todayJourSemaine + 7) % 7
  );
  const prochaine = calendrierTrie[0];
  const prochainType = typesCollecte?.find(t => t.id === prochaine?.typeCollecteId);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="habitant__header">
        <h1 className="habitant__title">Prochaine collecte</h1>
        <p className="habitant__subtitle" style={{ textTransform: "capitalize" }}>{today}</p>
      </div>

      {/* ── Hero prochaine collecte ── */}
      <div className="habitant__next">
        <div className="habitant__next-label">
          {prochaine?.jourSemaine === todayJourSemaine ? "Aujourd'hui" : "Prochainement"}
        </div>
        {prochaine ? (
          <div className="habitant__next-content">
            <div className="habitant__next-icon">
              <IconTrash color={prochainType?.couleur ?? "#4caf50"} />
            </div>
            <div>
              <div className="habitant__next-type">{prochaine.typeCollecteLibelle}</div>
              <div className="habitant__next-heure">{formatHeure(prochaine.heureEstimee)}</div>
              <div className="habitant__next-jour">
                {prochaine.jourSemaine === todayJourSemaine
                  ? `Sortez vos bacs avant ${formatHeure(prochaine.heureEstimee)}`
                  : `${JOURS[prochaine.jourSemaine]} — sortez vos bacs avant ${formatHeure(prochaine.heureEstimee)}`
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="habitant__next-jour">Aucune collecte programmée pour votre résidence.</div>
        )}
      </div>

      {/* ── Calendrier de collecte ── */}
      <div className="habitant__schedule">
        <div className="habitant__schedule-header">
          Calendrier de collecte — cette semaine
        </div>
        {calendrierActif.length === 0 && (
          <div style={{ padding: "16px 22px", color: "var(--text-secondary)", fontSize: 13 }}>
            Aucun calendrier de collecte renseigné pour votre résidence.
          </div>
        )}
        {[...calendrierActif]
          .sort((a, b) => a.jourSemaine - b.jourSemaine)
          .map((c) => {
            const tc = typesCollecte?.find(t => t.id === c.typeCollecteId);
            return (
              <div key={c.id} className="schedule-item">
                <div
                  className="schedule-item__color"
                  style={{ background: tc?.couleur ?? "#4caf50" }}
                />
                <div className="schedule-item__type">{c.typeCollecteLibelle}</div>
                <div className="schedule-item__jour">{JOURS[c.jourSemaine]}</div>
                <div className="schedule-item__heure">{formatHeure(c.heureEstimee)}</div>
              </div>
            );
          })}
      </div>

      {/* ── Conseils ── */}
      <div className="habitant__tips">
        <div className="habitant__tips-title">Conseils pratiques</div>
        {[
          { emoji: "🕐", text: <><strong>Sortez vos bacs</strong> la veille au soir ou le matin avant 7h.</> },
          { emoji: "📲", text: <><strong>Activez les notifications</strong> pour être prévenu du passage du camion.</> },
          { emoji: "♻️", text: <><strong>Respectez le tri</strong> — verre, plastique, papier dans les bons bacs.</> },
          { emoji: "🚫", text: <><strong>Ne laissez pas les bacs</strong> trop longtemps sur la voie publique après la collecte.</> },
        ].map((tip, i) => (
          <div key={i} className="tip-item">
            <span className="tip-item__emoji">{tip.emoji}</span>
            <span className="tip-item__text">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

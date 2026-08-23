// ============================================================
// BIDIWS — HabitantHomePage
// Fichier : src/pages/habitant/HabitantHomePage/HabitantHomePage.tsx
// ============================================================

import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useResidencesHabitant } from "../../../hooks/useResidences";
import { useCalendrierCollecte, useTypesCollecte } from "../../../hooks/useCalendrierCollecte";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { TypeCollecteIcon } from "../../../components/ui/TypeCollecteIcon/TypeCollecteIcon";
import SignalementForm from "../../../components/SignalementForm/SignalementForm";
import "./HabitantHomePage.css";

// ─────────────────────────────────────────
// ICÔNES CONSEILS
// ─────────────────────────────────────────

const IconClock = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconBell = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconRecycle = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
    <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/>
    <path d="m14 16-3 3 3 3"/>
    <path d="M8.293 13.596 4.5 9.5l1.5-1.5"/>
    <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/>
    <path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>
  </svg>
);

const IconBan = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
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
  const [signalementOpen, setSignalementOpen] = useState<boolean>(false);

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

  // Sans ce garde, une requête en erreur (data: undefined) retombait
  // silencieusement sur "Aucune collecte programmée" — indiscernable
  // d'un vrai calendrier vide, sans message explicite.
  if (isErreur) {
    return (
      <div>
        <div className="habitant__header">
          <h1 className="habitant__title">Prochaine collecte</h1>
        </div>
        <div style={{ padding: "24px 0", color: "var(--critical)", fontSize: 13 }}>
          Erreur lors du chargement de votre calendrier de collecte.
        </div>
      </div>
    );
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
        <div>
          <h1 className="habitant__title">Prochaine collecte</h1>
          <p className="habitant__subtitle" style={{ textTransform: "capitalize" }}>{today}</p>
        </div>
        <button className="habitant__signaler-btn" onClick={() => setSignalementOpen(true)}>
          Signaler un problème
        </button>
      </div>

      {/* ── Hero prochaine collecte ── */}
      <div className="habitant__next">
        <div className="habitant__next-label">
          {prochaine?.jourSemaine === todayJourSemaine ? "Aujourd'hui" : "Prochainement"}
        </div>
        {prochaine ? (
          <div className="habitant__next-content">
            <div className="habitant__next-icon">
              <TypeCollecteIcon code={prochainType?.code} size={28} />
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
                <TypeCollecteIcon code={tc?.code} size={20} />
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
          { icon: <IconClock color="#6b84a3" />, text: <><strong>Sortez vos bacs</strong> la veille au soir ou le matin avant 7h.</> },
          { icon: <IconBell color="#6b84a3" />, text: <><strong>Activez les notifications</strong> pour être prévenu du passage du camion.</> },
          { icon: <IconRecycle color="#4caf50" />, text: <><strong>Respectez le tri</strong> — verre, plastique, papier dans les bons bacs.</> },
          { icon: <IconBan color="#ef4444" />, text: <><strong>Ne laissez pas les bacs</strong> trop longtemps sur la voie publique après la collecte.</> },
        ].map((tip, i) => (
          <div key={i} className="tip-item">
            <span className="tip-item__icon">{tip.icon}</span>
            <span className="tip-item__text">{tip.text}</span>
          </div>
        ))}
      </div>

      {signalementOpen && (
        <SignalementForm residenceId={residenceId} onClose={() => setSignalementOpen(false)} />
      )}
    </div>
  );
}

// ============================================================
// BIDIWS — HabitantHomePage
// Fichier : src/pages/habitant/HabitantHomePage/HabitantHomePage.tsx
// ============================================================

import { MOCK_TYPES_COLLECTE } from "../../../mocks/data";
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
// CALENDRIER MOCK
// ─────────────────────────────────────────

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const CALENDRIER = [
  { typeCode: "OM",  jour: 0, heure: "14h30" }, // Lundi
  { typeCode: "TRI", jour: 1, heure: "14h30" }, // Mardi
  { typeCode: "OM",  jour: 3, heure: "14h30" }, // Jeudi
];

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function HabitantHomePage() {
  // Prochaine collecte = aujourd'hui OM à 14h30
  const prochaine = CALENDRIER[0];
  const type      = MOCK_TYPES_COLLECTE.find(t => t.code === prochaine.typeCode);

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
        <div className="habitant__next-label">Aujourd'hui</div>
        <div className="habitant__next-content">
          <div className="habitant__next-icon">
            <IconTrash color={type?.couleur ?? "#4caf50"} />
          </div>
          <div>
            <div className="habitant__next-type">{type?.libelle}</div>
            <div className="habitant__next-heure">{prochaine.heure}</div>
            <div className="habitant__next-jour">
              Sortez vos bacs avant {prochaine.heure}
            </div>
          </div>
        </div>
      </div>

      {/* ── Calendrier de collecte ── */}
      <div className="habitant__schedule">
        <div className="habitant__schedule-header">
          Calendrier de collecte — cette semaine
        </div>
        {CALENDRIER.map((c, i) => {
          const tc = MOCK_TYPES_COLLECTE.find(t => t.code === c.typeCode);
          return (
            <div key={i} className="schedule-item">
              <div
                className="schedule-item__color"
                style={{ background: tc?.couleur ?? "#4caf50" }}
              />
              <div className="schedule-item__type">{tc?.libelle}</div>
              <div className="schedule-item__jour">{JOURS[c.jour]}</div>
              <div className="schedule-item__heure">{c.heure}</div>
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
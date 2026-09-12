// ============================================================
// BIDIWS — SplashScreen
// Fichier : src/components/SplashScreen/SplashScreen.tsx
// ============================================================

import "./SplashScreen.css";

// ─────────────────────────────────────────
// ICÔNE
// ─────────────────────────────────────────

const IconTruck = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

// ─────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────

export default function SplashScreen() {
  return (
    <div className="splash">
      <div className="splash__logo animate-fade-scale">
        <div className="splash__icon">
          <IconTruck color="#4caf50" />
        </div>
        <span className="splash__name">
          BIDI<span>WS</span>
        </span>
      </div>
    </div>
  );
}

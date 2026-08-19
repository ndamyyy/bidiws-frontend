// ============================================================
// BIDIWS — Layout
// Fichier : src/components/layout/Layout/Layout.tsx
// ============================================================

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "../SideBar/SideBar";
import TopBar from "../TopBar/TopBar";
import PageTransition from "../../ui/PageTransition/PageTransition";
import { ErrorBoundary } from "../../ErrorBoundary/ErrorBoundary";
import "./Layout.css";

// ─────────────────────────────────────────
// COMPOSANT
// Sidebar toujours visible en desktop ; en dessous de 768px, elle
// devient un tiroir masqué par défaut, ouvert via le bouton menu de
// la TopBar et refermé au clic sur le fond ou au changement de page.
// ─────────────────────────────────────────

export default function Layout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Referme le tiroir mobile au changement de page — ajustement d'état
  // pendant le rendu plutôt qu'un effet, pour éviter un rendu en
  // cascade (pattern recommandé React quand l'état dépend d'une prop).
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMobileNavOpen(false);
  }

  return (
    <div className="layout">

      {/* ── Sidebar fixe à gauche (tiroir en mobile) ── */}
      <Sidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* ── Contenu principal ── */}
      <div className="layout__main">

        {/* ── TopBar fixe en haut ── */}
        <TopBar onMenuClick={() => setMobileNavOpen(o => !o)} />

        {/* ── Pages (Outlet = la page active) ── */}
        <main className="layout__content">
          <ErrorBoundary>
            <AnimatePresence mode="wait" initial={false}>
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </ErrorBoundary>
        </main>

      </div>

    </div>
  );
}

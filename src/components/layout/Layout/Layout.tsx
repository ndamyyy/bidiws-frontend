// ============================================================
// BIDIWS — Layout
// Fichier : src/components/layout/Layout/Layout.tsx
// ============================================================

import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "../SideBar/SideBar";
import TopBar from "../TopBar/TopBar";
import PageTransition from "../../ui/PageTransition/PageTransition";
import { ErrorBoundary } from "../../ErrorBoundary/ErrorBoundary";
import { LoadingSpinner } from "../../ui/LoadingSpinner/LoadingSpinner";
import "./Layout.css";

const MOBILE_BREAKPOINT = 768;

// ─────────────────────────────────────────
// COMPOSANT
// Sidebar ouverte par défaut en desktop (repliable via le bouton menu
// de la TopBar, redimensionne le contenu) ; fermée par défaut en
// dessous de 768px, où elle devient un tiroir en overlay ouvert via le
// même bouton et refermé au clic sur le fond ou au choix d'une page.
// ─────────────────────────────────────────

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > MOBILE_BREAKPOINT);

  // Referme le tiroir au changement de page, mobile uniquement — sur
  // desktop la sidebar est un choix persistant de l'utilisateur, pas
  // un overlay à escamoter. Ajustement d'état pendant le rendu plutôt
  // qu'un effet, pour éviter un rendu en cascade (pattern recommandé
  // React quand l'état dépend d'une prop).
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      setSidebarOpen(false);
    }
  }

  return (
    <div className={`layout ${!sidebarOpen ? "layout--sidebar-closed" : ""}`}>

      {/* ── Sidebar fixe à gauche (tiroir en mobile, repliable en desktop) ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Contenu principal ── */}
      <div className="layout__main">

        {/* ── TopBar fixe en haut ── */}
        <TopBar onMenuClick={() => setSidebarOpen(o => !o)} isSidebarOpen={sidebarOpen} />

        {/* ── Pages (Outlet = la page active) ── */}
        <main className="layout__content">
          <ErrorBoundary>
            <AnimatePresence mode="wait" initial={false}>
              <PageTransition key={location.pathname}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Outlet />
                </Suspense>
              </PageTransition>
            </AnimatePresence>
          </ErrorBoundary>
        </main>

      </div>

    </div>
  );
}

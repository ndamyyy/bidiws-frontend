// ============================================================
// BIDIWS — Layout
// Fichier : src/components/layout/Layout/Layout.tsx
// ============================================================

import { Suspense, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
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
  // Élément résolu (pas <Outlet/> en direct) : AnimatePresence garde
  // l'arbre de la page sortante monté le temps de son animation de
  // sortie, mais <Outlet/> reste abonné au routeur et re-rendrait la
  // NOUVELLE page à l'intérieur de ce fantôme encore en train de
  // s'estomper — la sortie ne se termine alors jamais et la page
  // suivante ne monte jamais (elle reste bloquée à opacity:0, y:-8,
  // le style de sortie figé). useOutlet() capture l'élément une seule
  // fois par rendu de Layout, donc l'arbre figé par AnimatePresence
  // referme l'ancienne page — pas la nouvelle.
  const outlet = useOutlet();
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
                  {outlet}
                </Suspense>
              </PageTransition>
            </AnimatePresence>
          </ErrorBoundary>
        </main>

      </div>

    </div>
  );
}

// ============================================================
// BIDIWS — Layout
// Fichier : src/components/layout/Layout/Layout.tsx
// ============================================================

import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "../SideBar/SideBar";
import TopBar from "../TopBar/TopBar";
import PageTransition from "../../ui/PageTransition/PageTransition";
import "./Layout.css";

// ─────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────

export default function Layout() {
  const location = useLocation();

  return (
    <div className="layout">

      {/* ── Sidebar fixe à gauche ── */}
      <Sidebar />

      {/* ── Contenu principal ── */}
      <div className="layout__main">

        {/* ── TopBar fixe en haut ── */}
        <TopBar />

        {/* ── Pages (Outlet = la page active) ── */}
        <main className="layout__content">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>

      </div>

    </div>
  );
}

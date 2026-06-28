// ============================================================
// BIDIWS — Layout
// Fichier : src/components/layout/Layout/Layout.tsx
// ============================================================

import { Outlet } from "react-router-dom";
import Sidebar from "../SideBar/SideBar";
import TopBar from "../TopBar/TopBar";
import "./Layout.css";

// ─────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────

export default function Layout() {
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
          <Outlet />
        </main>

      </div>

    </div>
  );
}

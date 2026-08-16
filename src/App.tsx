// ============================================================
// BIDIWS — App.tsx + Routes
// Fichier : src/App.tsx
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { NotificationProvider } from "./context/NotificationContext";
// Role values are used as runtime strings here; import the type elsewhere if needed

// ─── Pages publiques ───────────────────────────────────────
import LoginPage from "./pages/LoginPage/LoginPage";

// ─── Layout ────────────────────────────────────────────────
import Layout from "./components/layout/Layout/Layout";

// ─── Pages Syndic ──────────────────────────────────────────
// import DashboardPage from "./pages/syndic/DashboardPage/DashboardPage";
// import TourneesPage from "./pages/syndic/TourneesPage/TourneesPage";
// import ResidencesPage from "./pages/syndic/ResidencesPage/ResidencesPage";
// import NotificationsPage from "./pages/syndic/NotificationsPage/NotificationsPage";

// ─── Pages Gardien ─────────────────────────────────────────
// import GardienHomePage from "./pages/gardien/GardienHomePage/GardienHomePage";
// import GardienAlertsPage from "./pages/gardien/GardienAlertsPage/GardienAlertsPage";
// import GardienHistoPage from "./pages/gardien/GardienHistoPage/GardienHistoPage";

// ─── Pages Chauffeur ───────────────────────────────────────
// import ChauffeurTourneePage from "./pages/chauffeur/ChauffeurTourneePage/ChauffeurTourneePage";
// import ChauffeurGpsPage from "./pages/chauffeur/ChauffeurGpsPage/ChauffeurGpsPage";

// ─── Pages Habitant ────────────────────────────────────────
// import HabitantHomePage from "./pages/habitant/HabitantHomePage/HabitantHomePage";

// ─── Pages Admin ───────────────────────────────────────────
// import AdminDashboardPage from "./pages/admin/AdminDashboardPage/AdminDashboardPage";
// import AdminUsersPage from "./pages/admin/AdminUsersPage/AdminUsersPage";

// ─────────────────────────────────────────
// QUERY CLIENT
// ─────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000, // 30 secondes
      refetchOnWindowFocus: false,
    },
  },
});

// ─────────────────────────────────────────
// REDIRECT PAR RÔLE
// Redirige vers la bonne page d'accueil
// selon le rôle de l'utilisateur connecté
// ─────────────────────────────────────────

// const redirectByRole: Record<string, string> = {
//   SYNDIC:    "/syndic/dashboard",
//   BAILLEUR:  "/syndic/dashboard",
//   MAIRIE:    "/syndic/dashboard",
//   GARDIEN:   "/gardien/home",
//   CHAUFFEUR: "/chauffeur/tournee",
//   HABITANT:  "/habitant/home",
//   ADMIN:     "/admin/dashboard",
// };

//  export { redirectByRole };

// ─────────────────────────────────────────
// APP
// ─────────────────────────────────────────

export default function App() {
  return (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
        <NotificationProvider>
          <Routes>

              {/* ── Route publique ── */}
              <Route path="/login" element={<LoginPage />} />

              {/* ── Redirect racine ── */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* ══════════════════════════════════════
                  ROUTES PROTÉGÉES — Layout commun
              ══════════════════════════════════════ */}
              <Route element={<Layout />}>

                {/* ── Syndic / Bailleur / Mairie ── */}
                <Route
                  path="/syndic/dashboard"
                  // element={
                  //   <ProtectedRoute roles={["SYNDIC", "BAILLEUR", "MAIRIE", "ADMIN"]}>
                  //     <DashboardPage />
                  //   </ProtectedRoute>
                  // }
                />
                <Route
                  path="/syndic/tournees"
                  // element={
                  //   <ProtectedRoute roles={["SYNDIC", "BAILLEUR", "MAIRIE", "ADMIN"]}>
                  //     <TourneesPage />
                  //   </ProtectedRoute>
                  // }
                />
                <Route
                  path="/syndic/residences"
                  // element={
                  //   <ProtectedRoute roles={["SYNDIC", "BAILLEUR", "MAIRIE", "ADMIN"]}>
                  //     <ResidencesPage />
                  //   </ProtectedRoute>
                  // }
                />
                <Route
                  path="/syndic/notifications"
                  // element={
                  //   <ProtectedRoute roles={["SYNDIC", "BAILLEUR", "MAIRIE", "ADMIN"]}>
                  //     <NotificationsPage />
                  //   </ProtectedRoute>
                  // }
                />

                {/* ── Gardien ── */}
                <Route
                  path="/gardien/home"
                  // element={
                  //   <ProtectedRoute roles={["GARDIEN", "ADMIN"]}>
                  //     <GardienHomePage />
                  //   </ProtectedRoute>
                  // }
                />
                <Route
                  path="/gardien/alertes"
                    // element={
                    //   <ProtectedRoute roles={["GARDIEN", "ADMIN"]}>
                    //     <GardienAlertsPage />
                    //   </ProtectedRoute>
                    // }
                />
                <Route
                  path="/gardien/historique"
                  // element={
                  //   <ProtectedRoute roles={["GARDIEN", "ADMIN"]}>
                  //     <GardienHistoPage />
                  //   </ProtectedRoute>
                  // }
                />

                {/* ── Chauffeur ── */}
                <Route
                  path="/chauffeur/tournee"
                  // element={
                  //   <ProtectedRoute roles={["CHAUFFEUR", "ADMIN"]}>
                  //     <ChauffeurTourneePage />
                  //   </ProtectedRoute>
                  // }
                />
                <Route
                  path="/chauffeur/gps"
                  // element={
                  //   <ProtectedRoute roles={["CHAUFFEUR", "ADMIN"]}>
                  //     <ChauffeurGpsPage />
                  //   </ProtectedRoute>
                  // }
                />

                {/* ── Habitant ── */}
                <Route
                  path="/habitant/home"
                  // element={
                  //   <ProtectedRoute roles={["HABITANT", "ADMIN"]}>
                  //     <HabitantHomePage />
                  //   </ProtectedRoute>
                  // }
                />

                {/* ── Admin ── */}
                <Route
                  path="/admin/dashboard"
                  // element={
                  //   <ProtectedRoute roles={["ADMIN"]}>
                  //     <AdminDashboardPage />
                  //   </ProtectedRoute>
                  // }
                />
                <Route
                  path="/admin/users"
                  // element={
                  //   <ProtectedRoute roles={["ADMIN"]}>
                  //     <AdminUsersPage />
                  //   </ProtectedRoute>
                  // }
                />

              </Route>

              {/* ── 404 — redirect login ── */}
              <Route path="*" element={<Navigate to="/login" replace />} />

                      </Routes>
        </NotificationProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
}

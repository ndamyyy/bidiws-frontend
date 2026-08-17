/* eslint-disable react-refresh/only-export-components */
// ============================================================
// BIDIWS — App.tsx + Routes
// Fichier : src/App.tsx
// ============================================================

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import { useAuth } from "./hooks/useAuth";
// Role values are used as runtime strings here;

// ─── Pages publiques ───────────────────────────────────────
import LoginPage from "./pages/LoginPage/LoginPage";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import PageTransition from "./components/ui/PageTransition/PageTransition";

// ─── Layout ────────────────────────────────────────────────
import Layout from "./components/layout/Layout/Layout";

// ─── Pages Syndic ──────────────────────────────────────────
import DashboardPage from "./pages/syndic/DashboardPage/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import TourneesPage from "./pages/syndic/TourneesPage/TourneesPage";
import ResidencesPage from "./pages/syndic/ResidencesPage/ResidencesPage";
import NotificationsPage from "./pages/syndic/NotificationsPages/NotificationsPage";

// ─── Pages Gardien ─────────────────────────────────────────
import GardienHomePage from "./pages/gardien/GardienHomePage/GardienHomePage";
// import GardienAlertsPage from "./pages/gardien/GardienAlertsPage/GardienAlertsPage";
// import GardienHistoPage from "./pages/gardien/GardienHistoPage/GardienHistoPage";

// ─── Pages Chauffeur ───────────────────────────────────────
import ChauffeurTourneePage from "./pages/chauffeur/ChauffeurTourneePage/ChauffeurTourneePage";
// import ChauffeurGpsPage from "./pages/chauffeur/ChauffeurGpsPage/ChauffeurGpsPage";

// ─── Pages Habitant ────────────────────────────────────────
import HabitantHomePage from "./pages/habitant/HabitantHomePage/HabitantHomePage";

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

const redirectByRole: Record<string, string> = {
  SYNDIC:    "/syndic/dashboard",
  BAILLEUR:  "/syndic/dashboard",
  MAIRIE:    "/syndic/dashboard",
  GARDIEN:   "/gardien/home",
  CHAUFFEUR: "/chauffeur/tournee",
  HABITANT:  "/habitant/home",
  ADMIN:     "/admin/dashboard",
};

export { redirectByRole };

// ─────────────────────────────────────────
// APP
// ─────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────
// APP SHELL
// Attend la revalidation de la session (isInitializing) avant de
// monter le routing — affiche le SplashScreen à la place entre-temps.
// ─────────────────────────────────────────

function AppShell() {
  const { isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <SplashScreen />;
  }

  return (
    <WebSocketProvider>
      <NotificationProvider>
        <Routes>

              {/* ── Route publique ── */}
              <Route
                path="/login"
                element={
                  <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={location.pathname}>
                      <LoginPage />
                    </PageTransition>
                  </AnimatePresence>
                }
              />

              {/* ── Redirect racine ── */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* ══════════════════════════════════════
                  ROUTES PROTÉGÉES — Layout commun
              ══════════════════════════════════════ */}
              <Route element={<Layout />}>

                {/* ── Syndic / Bailleur / Mairie ── */}
                <Route
                  path="/syndic/dashboard"
                  element={
                    <ProtectedRoute roles={["SYNDIC", "BAILLEUR", "MAIRIE", "ADMIN"]}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/syndic/tournees"
                  element={
                    <ProtectedRoute roles={["SYNDIC", "BAILLEUR", "MAIRIE", "ADMIN"]}>
                      <TourneesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/syndic/residences"
                  element={
                    <ProtectedRoute roles={["SYNDIC", "BAILLEUR", "MAIRIE", "ADMIN"]}>
                      <ResidencesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/syndic/notifications"
                  element={
                    <ProtectedRoute roles={["SYNDIC", "BAILLEUR", "MAIRIE", "ADMIN"]}>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* ── Gardien ── */}
                <Route
                  path="/gardien/home"
                  element={
                    <ProtectedRoute roles={["GARDIEN", "ADMIN"]}>
                      <GardienHomePage />
                    </ProtectedRoute>
                  }
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
                  element={
                    <ProtectedRoute roles={["CHAUFFEUR", "ADMIN"]}>
                      <ChauffeurTourneePage />
                    </ProtectedRoute>
                  }
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
                  element={
                    <ProtectedRoute roles={["HABITANT", "ADMIN"]}>
                      <HabitantHomePage />
                    </ProtectedRoute>
                  }
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
  );
}
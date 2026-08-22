// ============================================================
// BIDIWS — App.tsx + Routes
// Fichier : src/App.tsx
// ============================================================

import { Suspense, lazy } from "react";
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
// LoginPage reste en import direct : première page vue par tout le
// monde, aucun gain à la rendre paresseuse.
import LoginPage from "./pages/LoginPage/LoginPage";
import { LoadingSpinner } from "./components/ui/LoadingSpinner/LoadingSpinner";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import PageTransition from "./components/ui/PageTransition/PageTransition";

// ─── Layout ────────────────────────────────────────────────
import Layout from "./components/layout/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// ─── Pages chargées à la demande (une par route) ────────────
const AdminLoginPage       = lazy(() => import("./pages/admin/AdminLoginPage/AdminLoginPage"));

const DashboardPage        = lazy(() => import("./pages/syndic/DashboardPage/DashboardPage"));
const TourneesPage         = lazy(() => import("./pages/syndic/TourneesPage/TourneesPage"));
const ResidencesPage       = lazy(() => import("./pages/syndic/ResidencesPage/ResidencesPage"));
const NotificationsPage    = lazy(() => import("./pages/syndic/NotificationsPages/NotificationsPage"));

const GardienHomePage      = lazy(() => import("./pages/gardien/GardienHomePage/GardienHomePage"));
const GardienAlertsPage    = lazy(() => import("./pages/gardien/GardienAlertsPage/GardienAlertsPage"));
const GardienHistoPage     = lazy(() => import("./pages/gardien/GardienHistoPage/GardienHistoPage"));

const ChauffeurTourneePage = lazy(() => import("./pages/chauffeur/ChauffeurTourneePage/ChauffeurTourneePage"));
const ChauffeurGpsPage     = lazy(() => import("./pages/chauffeur/ChauffeurGpsPage/ChauffeurGpsPage"));

const HabitantHomePage     = lazy(() => import("./pages/habitant/HabitantHomePage/HabitantHomePage"));

const AdminDashboardPage    = lazy(() => import("./pages/admin/AdminDashboardPage/AdminDashboardPage"));
const AdminUsersPage        = lazy(() => import("./pages/admin/AdminUsersPage/AdminUsersPage"));
const AdminTourneesPage     = lazy(() => import("./pages/admin/AdminTourneesPage/AdminTourneesPage"));
const AdminSignalementsPage = lazy(() => import("./pages/admin/AdminSignalementsPage/AdminSignalementsPage"));



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

              {/* ── Connexion administrateur (page dédiée) ── */}
              <Route
                path="/admin/login"
                element={
                  <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={location.pathname}>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminLoginPage />
                      </Suspense>
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
                  element={
                    <ProtectedRoute roles={["GARDIEN", "ADMIN"]}>
                      <GardienAlertsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gardien/historique"
                  element={
                    <ProtectedRoute roles={["GARDIEN", "ADMIN"]}>
                      <GardienHistoPage />
                    </ProtectedRoute>
                  }
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
                  element={
                    <ProtectedRoute roles={["CHAUFFEUR", "ADMIN"]}>
                      <ChauffeurGpsPage />
                    </ProtectedRoute>
                  }
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
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tournees"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <AdminTourneesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/signalements"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <AdminSignalementsPage />
                    </ProtectedRoute>
                  }
                />

              </Route>

              {/* ── 404 — redirect login ── */}
              <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </NotificationProvider>
    </WebSocketProvider>
  );
}
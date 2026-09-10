// ============================================================
// BIDIWS — AdminLoginPage
// Fichier : src/pages/admin/AdminLoginPage/AdminLoginPage.tsx
// Page dédiée, volontairement séparée de LoginPage (formulaire dupliqué
// à l'identique plutôt que factorisé — décision explicite, cf. le même
// choix fait pour AdminDashboardPage vs DashboardPage). Pas de panneau
// marketing ni de sélection de rôle : juste email/mot de passe, dans un
// cadre plus sobre.
// ============================================================

import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import type { ApiError } from "../../../types";
import "./AdminLoginPage.css";

// Délai avant la redirection vers /login lorsqu'un compte valide mais
// non-admin se connecte ici — assez long pour lire le message, assez
// court pour ne pas sembler figé.
const REDIRECTION_NON_ADMIN_MS = 2500;

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconShield = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const IconEye = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ─────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────

export default function AdminLoginPage() {
  const { login, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email,          setEmail]          = useState<string>("");
  const [motDePasse,     setMotDePasse]     = useState<string>("");
  const [error,          setError]          = useState<string>("");
  const [showMotDePasse, setShowMotDePasse] = useState<boolean>(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (): Promise<void> => {
    setError("");

    if (!email.trim()) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }
    if (!motDePasse.trim()) {
      setError("Veuillez saisir votre mot de passe.");
      return;
    }

    try {
      // login() connecte n'importe quel compte valide et redirige déjà
      // vers l'espace de son rôle — cette page n'est censée servir que
      // les ADMIN. On vérifie le rôle obtenu via la valeur retournée
      // (pas via le utilisateur du contexte, pas encore à jour dans
      // cette closure au moment où login() se termine) et on annule
      // la session + la redirection si ce n'est pas un admin.
      const utilisateur = await login({ email: email.trim(), motDePasse });

      if (utilisateur.role !== "ADMIN") {
        // redirectTo="/admin/login" plutôt que le "/login" par défaut :
        // annule la redirection déjà lancée par login() vers l'espace
        // du rôle obtenu, et laisse le message ci-dessous s'afficher
        // ici avant le renvoi différé vers /login.
        logout("/admin/login");
        setError("Cet espace est réservé aux administrateurs. Utilisez la page de connexion principale.");
        setTimeout(() => navigate("/login"), REDIRECTION_NON_ADMIN_MS);
      }
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? "Email ou mot de passe incorrect. Vérifiez vos identifiants.");
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">

        <div className="admin-login__icon">
          <IconShield color="#39FF8C" />
        </div>

        <h1 className="admin-login__title">Administration</h1>
        <p className="admin-login__subtitle">Accès réservé aux administrateurs BIDIWS</p>

        {/* ── Champs ── */}
        <div className="admin-login__fields">
          <div className="admin-login__field">
            <label className="admin-login__field-label">Email</label>
            <input
              ref={emailInputRef}
              className="admin-login__field-input"
              type="email"
              placeholder="admin@bidiws.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>
          <div className="admin-login__field">
            <label className="admin-login__field-label">Mot de passe</label>
            <div className="admin-login__field-wrap">
              <input
                className="admin-login__field-input"
                type={showMotDePasse ? "text" : "password"}
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                type="button"
                className="admin-login__field-toggle"
                onClick={() => setShowMotDePasse((v) => !v)}
                tabIndex={-1}
                title={showMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-label={showMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showMotDePasse ? <IconEyeOff color="#6b84a3" /> : <IconEye color="#6b84a3" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Erreur ── */}
        {error && <div className="admin-login__error">{error}</div>}

        {/* ── Submit ── */}
        <button
          className="admin-login__submit"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading
            ? <span className="admin-login__spinner" />
            : <>Accéder à l'administration</>
          }
        </button>

        {/* ── Retour ── */}
        <Link to="/login" className="admin-login__back">
          ← Retour à la connexion
        </Link>

      </div>
    </div>
  );
}

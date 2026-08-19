// ============================================================
// BIDIWS — LoginPage
// Fichier : src/pages/LoginPage/LoginPage.tsx
// ============================================================

import { JSX, useRef, useState } from "react";
import axios                from "axios";
import { useAuth }         from "../../hooks/useAuth";
import type { Role, ApiError } from "../../types";
import "./LoginPage.css";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

interface RoleOption {
  role  : Role;
  label : string;
  desc  : string;
  color : string;
  icon  : JSX.Element;
}

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconTruck = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconHome = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconGrid = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const IconUser = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconBuilding = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18M9 21V9"/>
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconBolt = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconMapPin = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconBarChart = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
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
// RÔLES DISPONIBLES
// ─────────────────────────────────────────

const ROLE_OPTIONS: RoleOption[] = [
  {
    role : 'SYNDIC',
    label: "Syndic / Bailleur",
    desc : "Tableau de bord & pilotage global",
    color: "#1b3a6b",
    icon : <IconGrid color="#1b3a6b" />,
  },
  {
    role : 'GARDIEN',
    label: "Gardien",
    desc : "Alertes collecte en temps réel",
    color: "#4caf50",
    icon : <IconHome color="#4caf50" />,
  },
  {
    role : 'CHAUFFEUR',
    label: "Chauffeur",
    desc : "Validation des arrêts de tournée",
    color: "#f59e0b",
    icon : <IconTruck color="#f59e0b" />,
  },
  {
    role : 'HABITANT',
    label: "Habitant",
    desc : "Consulter les horaires de collecte",
    color: "#6b84a3",
    icon : <IconUser color="#6b84a3" />,
  },
  {
    role : 'MAIRIE',
    label: "Mairie / Collectivité",
    desc : "Supervision et reporting",
    color: "#9c27b0",
    icon : <IconBuilding color="#9c27b0" />,
  },
];

// ─────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const [selectedRole,    setSelectedRole]    = useState<Role>('SYNDIC');
  const [email,           setEmail]           = useState<string>("");
  const [motDePasse,      setMotDePasse]      = useState<string>("");
  const [error,           setError]           = useState<string>("");
  const [showMotDePasse,  setShowMotDePasse]  = useState<boolean>(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleRoleSelect = (role: Role): void => {
    setSelectedRole(role);
    setError("");
  };

  // ── Lien admin : pas de rôle dédié, juste le même formulaire ──
  const handleAdminClick = (): void => {
    setEmail("");
    setMotDePasse("");
    setError("");
    emailInputRef.current?.focus();
  };

  // ── Soumission ──
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
      await login({ email: email.trim(), motDePasse });
    } catch (err) {
      // Le backend distingue plusieurs cas (401 mauvais identifiants,
      // 423 compte verrouillé, etc.) avec un message précis à chaque
      // fois — on l'affiche tel quel plutôt qu'un message générique
      // qui ferait croire à un mauvais mot de passe dans tous les cas.
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? "Email ou mot de passe incorrect. Vérifiez vos identifiants.");
    }
  };

  return (
    <div className="login">

      {/* ── Orbes décoratifs ── */}
      <div className="login__orb login__orb--1" />
      <div className="login__orb login__orb--2" />

      {/* ══════════════════════════════
          PANNEAU GAUCHE — Branding
      ══════════════════════════════ */}
      <div className="login__left">

        {/* Logo */}
        <div className="login__brand">
          <div className="login__brand-logo">
            <div className="login__brand-icon">
              <IconTruck color="#4caf50" />
            </div>
            <span className="login__brand-name">
              BIDI<span>WS</span>
            </span>
          </div>
          <div className="login__brand-tagline">
            L'Étoile du Suivi Urbain
          </div>
        </div>

        {/* Headline */}
        <h1 className="login__headline">
          La collecte des déchets,<br />
          <span>enfin visible</span><br />
          en temps réel.
        </h1>

        <p className="login__description">
          BIDIWS connecte gardiens, chauffeurs, syndics et mairies
          pour éliminer l'incertitude sur le passage du camion
          et réduire le temps des bacs sur la voie publique.
        </p>

        {/* Features */}
        <div className="login__features">
          {[
            { icon: <IconBolt color="#39FF8C" />, text: <><strong>Notification instantanée</strong> dès que le camion est passé</> },
            { icon: <IconMapPin color="#39FF8C" />, text: <><strong>Suivi GPS temps réel</strong> du camion sur votre secteur</> },
            { icon: <IconBarChart color="#39FF8C" />, text: <><strong>Dashboard complet</strong> pour les gestionnaires et mairies</> },
          ].map((f, i) => (
            <div key={i} className="login__feature">
              <div className="login__feature-icon">
                {f.icon}
              </div>
              <span className="login__feature-text">{f.text}</span>
            </div>
          ))}
        </div>

      </div>

      {/* ══════════════════════════════
          PANNEAU DROIT — Formulaire
      ══════════════════════════════ */}
      <div className="login__right">
        <div className="login__card">

          <h2 className="login__card-title">Connexion</h2>
          <p className="login__card-subtitle">
            Choisissez votre espace et connectez-vous
          </p>

          {/* ── Sélection rôle ── */}
          <div className="login__roles">
            {ROLE_OPTIONS.map((option) => {
              const isActive = selectedRole === option.role;
              return (
                <button
                  key={option.role}
                  className={`login__role-btn ${isActive ? "login__role-btn--active" : ""}`}
                  onClick={() => handleRoleSelect(option.role)}
                >
                  {/* Icône */}
                  <div
                    className="login__role-icon"
                    style={{
                      background: isActive
                        ? `${option.color}22`
                        : "var(--overlay-4)",
                      border: `1px solid ${isActive ? option.color + "55" : "var(--overlay-8)"}`,
                    }}
                  >
                    {option.icon}
                  </div>

                  {/* Info */}
                  <div className="login__role-info">
                    <div className="login__role-label">{option.label}</div>
                    <div className="login__role-desc">{option.desc}</div>
                  </div>

                  {/* Check */}
                  {isActive && (
                    <div
                      className="login__role-check"
                      style={{ background: option.color }}
                    >
                      <IconCheck />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Champs ── */}
          <div className="login__fields">
            <div className="login__field">
              <label className="login__field-label">Email</label>
              <input
                ref={emailInputRef}
                className="login__field-input"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div className="login__field">
              <label className="login__field-label">Mot de passe</label>
              <div className="login__field-wrap">
                <input
                  className="login__field-input"
                  type={showMotDePasse ? "text" : "password"}
                  placeholder="••••••••"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                  type="button"
                  className="login__field-toggle"
                  onClick={() => setShowMotDePasse((v) => !v)}
                  tabIndex={-1}
                  title={showMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showMotDePasse ? <IconEyeOff color="#6b84a3" /> : <IconEye color="#6b84a3" />}
                </button>
              </div>
            </div>
          </div>

          {/* ── Erreur ── */}
          {error && <div className="login__error">{error}</div>}

          {/* ── Submit ── */}
          <button
            className="login__submit"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading
              ? <span className="login__spinner" />
              : <>Accéder à mon espace</>
            }
          </button>

          {/* ── Lien admin ── */}
          <button
            type="button"
            className="login__admin-link"
            onClick={handleAdminClick}
          >
            Connexion administrateur
          </button>

          {/* ── Footer ── */}
          <div className="login__footer">
            BIDIWS v1.0 — Plateforme intelligente de suivi des collectes
          </div>

        </div>
      </div>

    </div>
  );
}

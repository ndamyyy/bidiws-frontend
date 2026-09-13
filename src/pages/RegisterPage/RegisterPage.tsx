// ============================================================
// BIDIWS — RegisterPage
// Fichier : src/pages/RegisterPage/RegisterPage.tsx
// Auto-inscription HABITANT uniquement — pas de sélecteur de rôle, le
// backend assigne toujours HABITANT (UtilisateurService.register).
// Formulaire dupliqué à l'identique du style de LoginPage plutôt que
// factorisé — même décision explicite que AdminLoginPage vs LoginPage.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loginSansPersistance, register } from "../../api/auth.api";
import { changerResidenceHabitant } from "../../api/residence-habitants.api";
import { useResidencesPubliques } from "../../hooks/useResidences";
import { Input } from "../../components/ui/Input/Input";
import type { ApiError, RegisterRequest, ResidencePublique } from "../../types";
import "./RegisterPage.css";

// Comparaison insensible aux accents/casse — une adresse tapée sans
// accent ("residence victor hugo") doit quand meme matcher "Résidence
// Victor Hugo" (voir CONTEXTE : "les accents, tirets, majuscules font
// échouer une comparaison de texte").
const normaliser = (s: string): string =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

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

const IconCheck = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─────────────────────────────────────────
// CHAMP RÉSIDENCE — recherche/autocomplete
// Local à cette page (un seul appelant) plutôt qu'un composant
// components/ui/ générique — pas de second usage aujourd'hui.
// Deux états mutuellement exclusifs : recherche (input + suggestions)
// tant qu'aucune résidence n'est choisie, puis une carte de
// confirmation une fois choisie (jamais les deux en même temps, pour
// qu'un texte affiché ne puisse jamais désynchroniser de l'id retenu).
// ─────────────────────────────────────────

const ResidenceField = ({
  residences,
  isLoading,
  selected,
  onSelect,
  onClear,
}: {
  residences  : ResidencePublique[];
  isLoading   : boolean;
  selected    : ResidencePublique | null;
  onSelect    : (r: ResidencePublique) => void;
  onClear     : () => void;
}) => {
  const [query, setQuery] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);

  const resultats = useMemo(() => {
    const q = normaliser(query.trim());
    if (!q) return [];
    return residences
      .filter(r => normaliser(`${r.nom} ${r.adresse}`).includes(q))
      .slice(0, 8);
  }, [residences, query]);

  const rechercheActive = query.trim().length > 0;
  const dropdownOuvert = focused && !selected && rechercheActive;

  if (selected) {
    return (
      <div className="register__residence-field">
        <label className="ui-field__label">Votre résidence (optionnel)</label>
        <div className="register__residence-selected">
          <div className="register__residence-selected-info">
            <div className="register__residence-selected-nom">{selected.nom}</div>
            <div className="register__residence-selected-adresse">
              {selected.adresse} · {selected.villeNom}
            </div>
          </div>
          <button type="button" className="register__residence-changer" onClick={onClear}>
            Changer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register__residence-field">
      <Input
        label="Votre résidence (optionnel)"
        type="text"
        placeholder={isLoading ? "Chargement…" : "Rechercher par nom ou adresse…"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        disabled={isLoading}
        autoComplete="off"
      />
      {dropdownOuvert && (
        <div className="register__residence-dropdown">
          {resultats.length > 0 ? (
            resultats.map(r => (
              <button
                type="button"
                key={r.id}
                className="register__residence-option"
                onClick={() => {
                  onSelect(r);
                  setQuery("");
                }}
              >
                <span className="register__residence-option-nom">{r.nom}</span>
                <span className="register__residence-option-adresse">{r.adresse} · {r.villeNom}</span>
              </button>
            ))
          ) : (
            <div className="register__residence-introuvable">
              Votre résidence n'est pas dans la liste ? Elle n'est peut-être pas
              encore enregistrée dans le système — contactez votre syndic ou
              votre mairie. Vous pouvez tout de même créer votre compte, le
              rattachement pourra se faire plus tard.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────

const REDIRECT_DELAY_MS = 5000;

export default function RegisterPage() {
  const navigate = useNavigate();

  const [nom, setNom] = useState<string>("");
  const [prenom, setPrenom] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [motDePasse, setMotDePasse] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");
  const [showMotDePasse, setShowMotDePasse] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [succes, setSucces] = useState<boolean>(false);

  const [residence, setResidence] = useState<ResidencePublique | null>(null);
  const [rattachementEchoue, setRattachementEchoue] = useState<boolean>(false);
  const { data: residencesPubliques, isLoading: isLoadingResidences } = useResidencesPubliques();

  const nomInputRef = useRef<HTMLInputElement>(null);

  // ── Redirection automatique après succès (laisse aussi le lien manuel) ──
  useEffect(() => {
    if (!succes) return;
    const timer = setTimeout(() => navigate("/login"), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [succes, navigate]);

  const handleSubmit = async (): Promise<void> => {
    setError("");

    if (!nom.trim() || !prenom.trim()) {
      setError("Veuillez saisir votre nom et prénom.");
      return;
    }
    if (!email.trim()) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }
    if (motDePasse.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    const data: RegisterRequest = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim(),
      motDePasse,
      telephone: telephone.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      const nouvelUtilisateur = await register(data);

      // Rattachement résidence : jamais deviné, uniquement si l'habitant a
      // explicitement choisi dans la liste. Un échec ici ne doit jamais
      // remettre en cause la création du compte, déjà réussie — signalé
      // séparément via rattachementEchoue plutôt que de basculer sur
      // l'écran d'erreur.
      if (residence) {
        try {
          const token = await loginSansPersistance({ email: data.email, motDePasse: data.motDePasse });
          await changerResidenceHabitant(residence.id, nouvelUtilisateur.id, token);
        } catch {
          setRattachementEchoue(true);
        }
      }

      setSucces(true);
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? "Erreur lors de la création du compte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register">

      {/* ── Orbes décoratifs ── */}
      <div className="register__orb register__orb--1" />
      <div className="register__orb register__orb--2" />

      {/* ══════════════════════════════
          PANNEAU GAUCHE — Branding
      ══════════════════════════════ */}
      <div className="register__left">
        <div className="register__brand">
          <div className="register__brand-logo">
            <div className="register__brand-icon">
              <IconTruck color="#4caf50" />
            </div>
            <span className="register__brand-name">
              BIDI<span>WS</span>
            </span>
          </div>
          <div className="register__brand-tagline">
            L'Étoile du Suivi Urbain
          </div>
        </div>

        <h1 className="register__headline">
          Suivez la collecte<br />
          <span>de votre résidence</span><br />
          en temps réel.
        </h1>

        <p className="register__description">
          Créez votre compte habitant pour consulter les horaires de
          collecte, recevoir des notifications de passage et signaler
          un problème en quelques secondes.
        </p>
      </div>

      {/* ══════════════════════════════
          PANNEAU DROIT — Formulaire
      ══════════════════════════════ */}
      <div className="register__right">
        <div className="register__card">

          {succes ? (
            <div className="register__succes">
              <div className="register__succes-icon">
                <IconCheck color="#4caf50" />
              </div>
              <h2 className="register__card-title">Compte créé !</h2>
              <p className="register__card-subtitle">
                Votre compte a bien été créé. Vous pouvez maintenant vous connecter.
              </p>
              {residence && !rattachementEchoue && (
                <p className="register__residence-confirmation">
                  Vous êtes rattaché à {residence.nom}.
                </p>
              )}
              {residence && rattachementEchoue && (
                <p className="register__residence-avertissement">
                  Le rattachement automatique à {residence.nom} a échoué —
                  contactez votre syndic ou votre mairie pour le finaliser.
                </p>
              )}
              <button className="register__submit" onClick={() => navigate("/login")}>
                Se connecter maintenant
              </button>
            </div>
          ) : (
            <>
              <h2 className="register__card-title">Créer un compte</h2>
              <p className="register__card-subtitle">
                Inscription habitant — consultez vos horaires de collecte
              </p>

              <div className="register__fields">
                <div className="register__fields-row">
                  <Input
                    ref={nomInputRef}
                    label="Prénom"
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    autoFocus
                  />
                  <Input
                    label="Nom"
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />

                <Input
                  label="Mot de passe"
                  type={showMotDePasse ? "text" : "password"}
                  placeholder="8 caractères minimum"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  trailingIcon={
                    <button
                      type="button"
                      className="ui-field__trailing-btn"
                      onClick={() => setShowMotDePasse((v) => !v)}
                      tabIndex={-1}
                      title={showMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      aria-label={showMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showMotDePasse ? <IconEyeOff color="#6b84a3" /> : <IconEye color="#6b84a3" />}
                    </button>
                  }
                />

                <Input
                  label="Téléphone (optionnel)"
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />

                <ResidenceField
                  residences={residencesPubliques ?? []}
                  isLoading={isLoadingResidences}
                  selected={residence}
                  onSelect={setResidence}
                  onClear={() => setResidence(null)}
                />
              </div>

              {error && <div className="register__error">{error}</div>}

              <button
                className="register__submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Création..." : "Créer mon compte"}
              </button>

              <button
                type="button"
                className="register__login-link"
                onClick={() => navigate("/login")}
              >
                Déjà un compte ? Se connecter
              </button>
            </>
          )}

          <div className="register__footer">
            BIDIWS v1.0 — Plateforme intelligente de suivi des collectes
          </div>

        </div>
      </div>

    </div>
  );
}

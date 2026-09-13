// ============================================================
// BIDIWS — RegisterPage
// Fichier : src/pages/RegisterPage/RegisterPage.tsx
// Auto-inscription HABITANT uniquement — pas de sélecteur de rôle, le
// backend assigne toujours HABITANT (UtilisateurService.register).
// Formulaire dupliqué à l'identique du style de LoginPage plutôt que
// factorisé — même décision explicite que AdminLoginPage vs LoginPage.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { register } from "../../api/auth.api";
import { rechercherAdresses } from "../../api/adresse.api";
import { Input } from "../../components/ui/Input/Input";
import type { AdresseSuggestion, ApiError, RegisterRequest } from "../../types";
import "./RegisterPage.css";

// Debounce API Adresse (data.gouv.fr) — 300-400ms : assez court pour
// rester réactif, assez long pour ne pas spammer un appel par frappe.
const DEBOUNCE_ADRESSE_MS = 350;

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
// CHAMP ADRESSE — autocomplete API Adresse (data.gouv.fr)
// Local à cette page (un seul appelant) plutôt qu'un composant
// components/ui/ générique — pas de second usage aujourd'hui.
// Deux états mutuellement exclusifs : recherche (input + suggestions)
// tant qu'aucune adresse n'est choisie, puis une carte de confirmation
// une fois choisie (jamais les deux en même temps, pour qu'un texte
// affiché ne puisse jamais désynchroniser des coordonnées retenues).
// Le rattachement à une résidence se fait entièrement côté backend
// (RattachementResidenceService) à partir des coordonnées GPS de la
// suggestion choisie — ce champ ne fait que les récupérer.
// ─────────────────────────────────────────

const AdresseField = ({
  selected,
  onSelect,
  onClear,
}: {
  selected: AdresseSuggestion | null;
  onSelect: (a: AdresseSuggestion) => void;
  onClear : () => void;
}) => {
  const [query, setQuery] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<AdresseSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Debounce + annulation de la requête devenue obsolète (nouvelle
  // frappe avant que la précédente n'ait répondu) — évite qu'une
  // réponse tardive n'écrase des suggestions plus récentes.
  useEffect(() => {
    const q = query.trim();
    // Pas de setState ici : rien n'est affiché tant que rechercheActive
    // (query.trim().length >= 3) est faux de toute façon, un state
    // "suggestions" pas encore vidé n'a donc aucun effet visible.
    if (q.length < 3) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsLoading(true);
      rechercherAdresses(q, controller.signal)
        .then((resultats) => setSuggestions(resultats))
        .catch((err) => {
          // AbortError attendu : une frappe plus récente a annulé cette
          // requête (fetch natif, pas d'annulation axios ici).
          if ((err as { name?: string }).name === "AbortError") return;
          setSuggestions([]);
        })
        .finally(() => setIsLoading(false));
    }, DEBOUNCE_ADRESSE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const rechercheActive = query.trim().length >= 3;
  const dropdownOuvert = focused && !selected && rechercheActive;

  if (selected) {
    return (
      <div className="register__adresse-field">
        <label className="ui-field__label">Votre adresse (optionnel)</label>
        <div className="register__adresse-selected">
          <div className="register__adresse-selected-info">
            <div className="register__adresse-selected-label">{selected.label}</div>
          </div>
          <button type="button" className="register__adresse-changer" onClick={onClear}>
            Changer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register__adresse-field">
      <Input
        label="Votre adresse (optionnel)"
        type="text"
        placeholder="Commencez à taper votre adresse…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        autoComplete="off"
      />
      {dropdownOuvert && (
        <div className="register__adresse-dropdown">
          {isLoading ? (
            <div className="register__adresse-introuvable">Recherche…</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((a) => (
              <button
                type="button"
                key={a.label}
                className="register__adresse-option"
                onClick={() => {
                  onSelect(a);
                  setQuery("");
                }}
              >
                {a.label}
              </button>
            ))
          ) : (
            <div className="register__adresse-introuvable">
              Aucune adresse trouvée. Continuez à taper, ou vérifiez
              l'orthographe.
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

  const [adresse, setAdresse] = useState<AdresseSuggestion | null>(null);
  // Résultat du rattachement automatique, renvoyé par le backend avec la
  // réponse d'inscription elle-même (InscriptionResponse) — jamais un
  // second appel séparé, contrairement à l'ancien flux qui rattachait
  // après coup via changerResidenceHabitant.
  const [residenceRattachee, setResidenceRattachee] = useState<string | null>(null);
  const [zoneNonCouverte, setZoneNonCouverte] = useState<boolean>(false);

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
      adresse: adresse?.adresse,
      codePostal: adresse?.codePostal,
      ville: adresse?.ville,
      latitude: adresse?.latitude,
      longitude: adresse?.longitude,
    };

    setIsSubmitting(true);
    try {
      const resultat = await register(data);

      // Rattachement fait atomiquement par le backend avec la création
      // du compte (RattachementResidenceService) — la réponse dit
      // directement ce qui s'est passé, pas de second appel à risque
      // d'échec séparé comme dans l'ancien flux.
      setResidenceRattachee(resultat.residenceNom ?? null);
      setZoneNonCouverte(resultat.zoneNonCouverte);
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
              {residenceRattachee && (
                <p className="register__adresse-confirmation">
                  Vous avez été rattaché à {residenceRattachee}.
                </p>
              )}
              {zoneNonCouverte && (
                <p className="register__adresse-avertissement">
                  Zone non couverte — votre ville n'est pas encore desservie par
                  BIDIWS. Votre compte est créé, le rattachement à une
                  résidence pourra se faire dès que votre zone sera prise en
                  charge.
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

                <AdresseField
                  selected={adresse}
                  onSelect={setAdresse}
                  onClear={() => setAdresse(null)}
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

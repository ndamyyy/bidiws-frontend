// ============================================================
// BIDIWS — ProfilPage
// Fichier : src/pages/ProfilPage/ProfilPage.tsx
// Accessible à tout rôle connecté — modification des informations
// personnelles + changement de mot de passe (deux sections, deux
// endpoints distincts côté backend).
// ============================================================

import { useState, type FormEvent } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { updateMonProfil, changerMonMotDePasse } from "../../api/utilisateurs.api";
import { Input } from "../../components/ui/Input/Input";
import type { ApiError, Role } from "../../types";
import "./ProfilPage.css";

// ─────────────────────────────────────────
// LIBELLÉS RÔLE
// ─────────────────────────────────────────

const ROLE_LABEL: Record<Role, string> = {
  SYNDIC:    "Syndic",
  BAILLEUR:  "Bailleur social",
  MAIRIE:    "Mairie",
  GARDIEN:   "Gardien",
  CHAUFFEUR: "Chauffeur",
  HABITANT:  "Habitant",
  ADMIN:     "Administrateur",
};

// ─────────────────────────────────────────
// ICÔNES ŒIL (afficher / masquer le mot de passe)
// Mêmes tracés que LoginPage/RegisterPage — pas de composant d'icône
// partagé dans le projet, chaque page garde les siennes.
// ─────────────────────────────────────────

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

// Bouton œil réutilisé pour les 3 champs mot de passe de la section.
const ToggleMotDePasse = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
  <button
    type="button"
    className="ui-field__trailing-btn"
    onClick={onToggle}
    tabIndex={-1}
    title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
    aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
  >
    {visible ? <IconEyeOff color="#6b84a3" /> : <IconEye color="#6b84a3" />}
  </button>
);

// ─────────────────────────────────────────
// SECTION — INFORMATIONS PERSONNELLES
// ─────────────────────────────────────────

const InfosSection = () => {
  const { utilisateur, refreshUtilisateur } = useAuth();

  const [nom, setNom] = useState<string>(utilisateur?.nom ?? "");
  const [prenom, setPrenom] = useState<string>(utilisateur?.prenom ?? "");
  const [email, setEmail] = useState<string>(utilisateur?.email ?? "");
  const [telephone, setTelephone] = useState<string>(utilisateur?.telephone ?? "");
  const [error, setError] = useState<string>("");
  const [succes, setSucces] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!utilisateur) return null;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setSucces(false);

    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      setError("Le nom, le prénom et l'email sont obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMonProfil(utilisateur.id, {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        telephone: telephone.trim() || undefined,
      });
      await refreshUtilisateur();
      setSucces(true);
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? "Erreur lors de la mise à jour du profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profil__card">
      <h2 className="profil__card-title">Informations personnelles</h2>

      <form onSubmit={handleSubmit}>
        {error && <div className="profil__error">{error}</div>}
        {succes && <div className="profil__succes">Profil mis à jour.</div>}

        <div className="profil__grid">
          <Input
            label="Prénom"
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />

          <Input
            label="Nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Téléphone (optionnel)"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
        </div>

        <button className="profil__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────
// SECTION — CHANGER LE MOT DE PASSE
// ─────────────────────────────────────────

const MotDePasseSection = () => {
  const { utilisateur } = useAuth();

  const [ancien, setAncien] = useState<string>("");
  const [nouveau, setNouveau] = useState<string>("");
  const [confirmation, setConfirmation] = useState<string>("");
  const [showAncien, setShowAncien] = useState<boolean>(false);
  const [showNouveau, setShowNouveau] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [succes, setSucces] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!utilisateur) return null;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setSucces(false);

    if (!ancien) {
      setError("Veuillez saisir votre mot de passe actuel.");
      return;
    }
    if (nouveau.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (nouveau !== confirmation) {
      setError("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changerMonMotDePasse(utilisateur.id, {
        ancienMotDePasse: ancien,
        nouveauMotDePasse: nouveau,
      });
      setAncien("");
      setNouveau("");
      setConfirmation("");
      setSucces(true);
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? "Erreur lors du changement de mot de passe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profil__card">
      <h2 className="profil__card-title">Changer le mot de passe</h2>

      <form onSubmit={handleSubmit}>
        {error && <div className="profil__error">{error}</div>}
        {succes && <div className="profil__succes">Mot de passe modifié.</div>}

        <div className="profil__grid">
          <div className="profil__field--full">
            <Input
              label="Mot de passe actuel"
              type={showAncien ? "text" : "password"}
              value={ancien}
              onChange={(e) => setAncien(e.target.value)}
              trailingIcon={
                <ToggleMotDePasse visible={showAncien} onToggle={() => setShowAncien((v) => !v)} />
              }
            />
          </div>

          <Input
            label="Nouveau mot de passe"
            type={showNouveau ? "text" : "password"}
            placeholder="8 caractères minimum"
            value={nouveau}
            onChange={(e) => setNouveau(e.target.value)}
            trailingIcon={
              <ToggleMotDePasse visible={showNouveau} onToggle={() => setShowNouveau((v) => !v)} />
            }
          />

          <Input
            label="Confirmation"
            type={showConfirmation ? "text" : "password"}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            trailingIcon={
              <ToggleMotDePasse visible={showConfirmation} onToggle={() => setShowConfirmation((v) => !v)} />
            }
          />
        </div>

        <button className="profil__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Modification..." : "Changer le mot de passe"}
        </button>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function ProfilPage() {
  const { utilisateur } = useAuth();

  if (!utilisateur) return null;

  const initiales = `${utilisateur.prenom[0] ?? ""}${utilisateur.nom[0] ?? ""}`.toUpperCase();

  return (
    <div>
      <div className="profil__header">
        <div className="profil__avatar">{initiales}</div>
        <div>
          <h1 className="profil__title">{utilisateur.prenom} {utilisateur.nom}</h1>
          <p className="profil__subtitle">{ROLE_LABEL[utilisateur.role]}</p>
        </div>
      </div>

      <InfosSection />
      <MotDePasseSection />
    </div>
  );
}

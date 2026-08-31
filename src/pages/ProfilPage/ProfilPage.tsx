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
          <div className="profil__field">
            <label className="profil__label">Prénom</label>
            <input
              className="profil__input"
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </div>

          <div className="profil__field">
            <label className="profil__label">Nom</label>
            <input
              className="profil__input"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>

          <div className="profil__field">
            <label className="profil__label">Email</label>
            <input
              className="profil__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="profil__field">
            <label className="profil__label">Téléphone (optionnel)</label>
            <input
              className="profil__input"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </div>
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
          <div className="profil__field profil__field--full">
            <label className="profil__label">Mot de passe actuel</label>
            <input
              className="profil__input"
              type="password"
              value={ancien}
              onChange={(e) => setAncien(e.target.value)}
            />
          </div>

          <div className="profil__field">
            <label className="profil__label">Nouveau mot de passe</label>
            <input
              className="profil__input"
              type="password"
              placeholder="8 caractères minimum"
              value={nouveau}
              onChange={(e) => setNouveau(e.target.value)}
            />
          </div>

          <div className="profil__field">
            <label className="profil__label">Confirmation</label>
            <input
              className="profil__input"
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </div>
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

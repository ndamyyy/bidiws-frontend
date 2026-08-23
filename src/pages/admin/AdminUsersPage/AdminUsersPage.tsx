// ============================================================
// BIDIWS — AdminUsersPage
// Fichier : src/pages/admin/AdminUsersPage/AdminUsersPage.tsx
// ============================================================

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAdminUtilisateurs } from "../../../hooks/useAdminUtilisateurs";
import { useVilles } from "../../../hooks/useVilles";
import {
  activerUtilisateur,
  desactiverUtilisateur,
  createUtilisateurAdmin,
  changerVilleUtilisateur,
  changerRoleUtilisateur,
  resetMotDePasseUtilisateur,
} from "../../../api/admin-utilisateurs.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import type { ApiError, Role, Utilisateur } from "../../../types";
import "./AdminUsersPage.css";

// ─────────────────────────────────────────
// LIBELLÉS RÔLE
// ─────────────────────────────────────────

const ROLE_LABEL: Record<Role, string> = {
  SYNDIC:    "Syndic",
  BAILLEUR:  "Bailleur",
  MAIRIE:    "Mairie",
  GARDIEN:   "Gardien",
  CHAUFFEUR: "Chauffeur",
  HABITANT:  "Habitant",
  ADMIN:     "Admin",
};

const ALL_ROLES: Role[] = ["ADMIN", "SYNDIC", "BAILLEUR", "MAIRIE", "GARDIEN", "CHAUFFEUR", "HABITANT"];

// ─────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────

const StatutBadge = ({ actif }: { actif: boolean }) => (
  <span style={{
    background: actif ? "rgba(76,175,80,0.15)" : "rgba(107,132,163,0.12)",
    color: actif ? "#4caf50" : "#6b84a3",
    border: `1px solid ${actif ? "#4caf5044" : "#6b84a344"}`,
    borderRadius: 20, padding: "3px 10px",
    fontSize: 11, fontWeight: 600,
    display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
  }}>
    <span style={{
      width: 5, height: 5, borderRadius: "50%",
      background: actif ? "#4caf50" : "#6b84a3", display: "inline-block",
    }} />
    {actif ? "Actif" : "Inactif"}
  </span>
);

// ─────────────────────────────────────────
// PANNEAU D'ÉDITION — RÔLE / VILLE / MOT DE PASSE
// ─────────────────────────────────────────

const EditUserPanel = ({
  utilisateur,
  villes,
  isLoadingVilles,
  onDone,
}: {
  utilisateur    : Utilisateur;
  villes         : { id: number; nom: string }[] | undefined;
  isLoadingVilles: boolean;
  onDone         : () => Promise<void>;
}) => {
  const [editRole, setEditRole] = useState<Role>(utilisateur.role);
  const [editVilleId, setEditVilleId] = useState<string>(
    utilisateur.villeId !== undefined ? String(utilisateur.villeId) : ""
  );
  const [roleError, setRoleError] = useState<string>("");
  const [isSubmittingRole, setIsSubmittingRole] = useState<boolean>(false);

  const [nouveauMotDePasse, setNouveauMotDePasse] = useState<string>("");
  const [confirmation, setConfirmation] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState<boolean>(false);
  const [motDePasseReinitialise, setMotDePasseReinitialise] = useState<string>("");

  const handleRoleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setRoleError("");

    if (editRole === "MAIRIE" && !editVilleId) {
      setRoleError("Une ville est obligatoire pour un compte Mairie.");
      return;
    }

    setIsSubmittingRole(true);
    try {
      if (editRole !== utilisateur.role) {
        await changerRoleUtilisateur(utilisateur.id, editRole);
      }
      if (editRole === "MAIRIE") {
        await changerVilleUtilisateur(utilisateur.id, Number(editVilleId));
      }
      await onDone();
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setRoleError(backendMessage ?? "Erreur lors de la modification.");
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setPasswordError("");
    setMotDePasseReinitialise("");

    if (nouveauMotDePasse.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (nouveauMotDePasse !== confirmation) {
      setPasswordError("La confirmation ne correspond pas.");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await resetMotDePasseUtilisateur(utilisateur.id, nouveauMotDePasse);
      setMotDePasseReinitialise(nouveauMotDePasse);
      setNouveauMotDePasse("");
      setConfirmation("");
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setPasswordError(backendMessage ?? "Erreur lors de la réinitialisation.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="admin-user-edit">
      {/* ── Rôle / Ville ── */}
      <form className="admin-user-edit__form" onSubmit={handleRoleSubmit}>
        {roleError && <div className="admin-users__error">{roleError}</div>}
        <div className="admin-user-edit__row">
          <div className="admin-users__field">
            <label className="admin-users__label">Rôle</label>
            <select
              className="admin-users__select"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as Role)}
            >
              {ALL_ROLES.map(r => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>

          {editRole === "MAIRIE" && (
            <div className="admin-users__field">
              <label className="admin-users__label">Ville</label>
              <select
                className="admin-users__select"
                value={editVilleId}
                onChange={(e) => setEditVilleId(e.target.value)}
                disabled={isLoadingVilles}
              >
                <option value="">Sélectionner...</option>
                {villes?.map(v => (
                  <option key={v.id} value={v.id}>{v.nom}</option>
                ))}
              </select>
            </div>
          )}

          <button className="admin-users__submit" type="submit" disabled={isSubmittingRole}>
            {isSubmittingRole ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>

      {/* ── Réinitialiser le mot de passe ── */}
      <form className="admin-user-edit__form admin-user-edit__form--password" onSubmit={handlePasswordSubmit}>
        <div className="admin-user-edit__password-title">Réinitialiser le mot de passe</div>
        {passwordError && <div className="admin-users__error">{passwordError}</div>}

        {motDePasseReinitialise ? (
          <div className="admin-user-edit__reveal">
            <div className="admin-user-edit__reveal-warning">
              Mot de passe réinitialisé — communiquez-le à l'utilisateur maintenant,
              il ne sera plus affiché après avoir fermé ce panneau.
            </div>
            <div className="admin-user-edit__reveal-value">{motDePasseReinitialise}</div>
          </div>
        ) : (
          <div className="admin-user-edit__row">
            <div className="admin-users__field">
              <label className="admin-users__label">Nouveau mot de passe</label>
              <input
                className="admin-users__input"
                type="password"
                placeholder="8 caractères minimum"
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
              />
            </div>
            <div className="admin-users__field">
              <label className="admin-users__label">Confirmation</label>
              <input
                className="admin-users__input"
                type="password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
            </div>
            <button className="admin-users__submit" type="submit" disabled={isSubmittingPassword}>
              {isSubmittingPassword ? "Réinitialisation..." : "Réinitialiser"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

// ─────────────────────────────────────────
// LIGNE UTILISATEUR
// ─────────────────────────────────────────

const UserRow = ({
  utilisateur,
  isPending,
  isEditing,
  villes,
  isLoadingVilles,
  onToggle,
  onToggleEdit,
  onEditDone,
}: {
  utilisateur    : Utilisateur;
  isPending      : boolean;
  isEditing      : boolean;
  villes         : { id: number; nom: string }[] | undefined;
  isLoadingVilles: boolean;
  onToggle       : (u: Utilisateur) => void;
  onToggleEdit   : () => void;
  onEditDone     : () => Promise<void>;
}) => {
  const initiales = `${utilisateur.prenom[0] ?? ""}${utilisateur.nom[0] ?? ""}`.toUpperCase();

  return (
    <div className="admin-user-row-wrap">
      <div className="admin-user-row">
        <div className="admin-user-row__avatar">{initiales}</div>

        <div className="admin-user-row__info">
          <div className="admin-user-row__name">
            {utilisateur.prenom} {utilisateur.nom}
          </div>
          <div className="admin-user-row__email">{utilisateur.email}</div>
        </div>

        <div className="admin-user-row__right">
          <StatutBadge actif={utilisateur.actif} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {ROLE_LABEL[utilisateur.role] ?? utilisateur.role}
          </span>
          <button className="admin-user-row__action" onClick={onToggleEdit}>
            {isEditing ? "Fermer" : "Modifier"}
          </button>
          <button
            className={`admin-user-row__action ${utilisateur.actif ? "admin-user-row__action--desactiver" : "admin-user-row__action--activer"}`}
            onClick={() => onToggle(utilisateur)}
            disabled={isPending}
          >
            {isPending ? "…" : utilisateur.actif ? "Désactiver" : "Activer"}
          </button>
        </div>
      </div>

      {isEditing && (
        <EditUserPanel
          utilisateur={utilisateur}
          villes={villes}
          isLoadingVilles={isLoadingVilles}
          onDone={onEditDone}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data: utilisateurs, isLoading } = useAdminUtilisateurs();
  const { data: villes, isLoading: isLoadingVilles } = useVilles();

  const [filtreRole, setFiltreRole] = useState<Role | "TOUS">("TOUS");
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [nom, setNom] = useState<string>("");
  const [prenom, setPrenom] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [motDePasse, setMotDePasse] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");
  const [role, setRole] = useState<Role>("HABITANT");
  const [villeId, setVilleId] = useState<string>("");
  const [createError, setCreateError] = useState<string>("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const utilisateursListe = utilisateurs ?? [];
  const rolesPresents = Array.from(new Set(utilisateursListe.map(u => u.role)));

  const utilisateursFiltres = filtreRole === "TOUS"
    ? utilisateursListe
    : utilisateursListe.filter(u => u.role === filtreRole);

  const handleToggle = async (u: Utilisateur): Promise<void> => {
    setPendingIds(prev => new Set(prev).add(u.id));
    try {
      if (u.actif) {
        await desactiverUtilisateur(u.id);
      } else {
        await activerUtilisateur(u.id);
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-utilisateurs"] });
    } catch (e) {
      console.error("BIDIWS — Erreur changement statut utilisateur", e);
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(u.id);
        return next;
      });
    }
  };

  const handleEditDone = async (): Promise<void> => {
    setEditingId(null);
    await queryClient.invalidateQueries({ queryKey: ["admin-utilisateurs"] });
  };

  const resetCreateForm = (): void => {
    setNom("");
    setPrenom("");
    setEmail("");
    setMotDePasse("");
    setTelephone("");
    setRole("HABITANT");
    setVilleId("");
  };

  const handleCreateSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setCreateError("");

    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      setCreateError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (motDePasse.length < 8) {
      setCreateError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (role === "MAIRIE" && !villeId) {
      setCreateError("Une ville est obligatoire pour un compte Mairie.");
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const nouvelUtilisateur = await createUtilisateurAdmin({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        motDePasse,
        telephone: telephone.trim() || undefined,
        role,
      });
      if (role === "MAIRIE") {
        await changerVilleUtilisateur(nouvelUtilisateur.id, Number(villeId));
      }
      resetCreateForm();
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-utilisateurs"] });
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setCreateError(backendMessage ?? "Erreur lors de la création de l'utilisateur.");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="admin-users__header">
        <div>
          <h1 className="admin-users__title">Utilisateurs</h1>
          <p className="admin-users__subtitle">
            {utilisateursListe.length} utilisateur{utilisateursListe.length > 1 ? "s" : ""} enregistré{utilisateursListe.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Création (accordéon) ── */}
      <div className="admin-users__create">
        <button className="admin-users__create-toggle" onClick={() => setCreateOpen(o => !o)}>
          {createOpen ? "Fermer" : "Ajouter un utilisateur"}
        </button>

        {createOpen && (
          <div className="admin-users__create-body">
            <form onSubmit={handleCreateSubmit}>
              {createError && <div className="admin-users__error">{createError}</div>}

              <div className="admin-users__grid">
                <div className="admin-users__field">
                  <label className="admin-users__label">Prénom</label>
                  <input
                    className="admin-users__input"
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                  />
                </div>

                <div className="admin-users__field">
                  <label className="admin-users__label">Nom</label>
                  <input
                    className="admin-users__input"
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>

                <div className="admin-users__field">
                  <label className="admin-users__label">Email</label>
                  <input
                    className="admin-users__input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="admin-users__field">
                  <label className="admin-users__label">Mot de passe</label>
                  <input
                    className="admin-users__input"
                    type="password"
                    placeholder="8 caractères minimum"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                  />
                </div>

                <div className="admin-users__field">
                  <label className="admin-users__label">Téléphone (optionnel)</label>
                  <input
                    className="admin-users__input"
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                  />
                </div>

                <div className="admin-users__field">
                  <label className="admin-users__label">Rôle</label>
                  <select
                    className="admin-users__select"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value as Role);
                      setVilleId("");
                    }}
                  >
                    {ALL_ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                    ))}
                  </select>
                </div>

                {role === "MAIRIE" && (
                  <div className="admin-users__field">
                    <label className="admin-users__label">Ville</label>
                    <select
                      className="admin-users__select"
                      value={villeId}
                      onChange={(e) => setVilleId(e.target.value)}
                      disabled={isLoadingVilles}
                    >
                      <option value="">Sélectionner...</option>
                      {villes?.map(v => (
                        <option key={v.id} value={v.id}>{v.nom}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button className="admin-users__submit" type="submit" disabled={isSubmittingCreate}>
                {isSubmittingCreate ? "Création..." : "Créer l'utilisateur"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Filtre par rôle ── */}
      {rolesPresents.length > 1 && (
        <div className="admin-users__filters">
          <button
            className={`admin-users__filter-pill ${filtreRole === "TOUS" ? "admin-users__filter-pill--active" : ""}`}
            onClick={() => setFiltreRole("TOUS")}
          >
            Tous
          </button>
          {rolesPresents.map(role => (
            <button
              key={role}
              className={`admin-users__filter-pill ${filtreRole === role ? "admin-users__filter-pill--active" : ""}`}
              onClick={() => setFiltreRole(role)}
            >
              {ROLE_LABEL[role] ?? role}
            </button>
          ))}
        </div>
      )}

      {/* ── Liste ── */}
      <div className="admin-users__list">
        {utilisateursFiltres.length === 0 && (
          <div className="admin-users__empty">Aucun utilisateur.</div>
        )}
        {utilisateursFiltres.map(u => (
          <UserRow
            key={u.id}
            utilisateur={u}
            isPending={pendingIds.has(u.id)}
            isEditing={editingId === u.id}
            villes={villes}
            isLoadingVilles={isLoadingVilles}
            onToggle={handleToggle}
            onToggleEdit={() => setEditingId(id => (id === u.id ? null : u.id))}
            onEditDone={handleEditDone}
          />
        ))}
      </div>
    </div>
  );
}

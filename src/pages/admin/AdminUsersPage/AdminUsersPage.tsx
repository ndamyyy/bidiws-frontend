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
// LIGNE UTILISATEUR
// ─────────────────────────────────────────

const UserRow = ({
  utilisateur,
  isPending,
  onToggle,
}: {
  utilisateur: Utilisateur;
  isPending  : boolean;
  onToggle   : (u: Utilisateur) => void;
}) => {
  const initiales = `${utilisateur.prenom[0] ?? ""}${utilisateur.nom[0] ?? ""}`.toUpperCase();

  return (
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
        <button
          className={`admin-user-row__action ${utilisateur.actif ? "admin-user-row__action--desactiver" : "admin-user-row__action--activer"}`}
          onClick={() => onToggle(utilisateur)}
          disabled={isPending}
        >
          {isPending ? "…" : utilisateur.actif ? "Désactiver" : "Activer"}
        </button>
      </div>
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
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// BIDIWS — AdminUsersPage
// Fichier : src/pages/admin/AdminUsersPage/AdminUsersPage.tsx
// ============================================================

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminUtilisateurs } from "../../../hooks/useAdminUtilisateurs";
import { activerUtilisateur, desactiverUtilisateur } from "../../../api/admin-utilisateurs.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import type { Role, Utilisateur } from "../../../types";
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

  const [filtreRole, setFiltreRole] = useState<Role | "TOUS">("TOUS");
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

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

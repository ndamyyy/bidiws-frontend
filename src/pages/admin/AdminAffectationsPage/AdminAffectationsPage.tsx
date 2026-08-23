// ============================================================
// BIDIWS — AdminAffectationsPage
// Fichier : src/pages/admin/AdminAffectationsPage/AdminAffectationsPage.tsx
// Rattachement chauffeur↔camion de longue durée (ChauffeurCamion) —
// distinct de l'affectation ponctuelle d'une tournée (AdminTourneesPage).
// Pas de GET liste à plat côté backend : les affectations actives sont
// reconstituées en interrogeant chaque camion (useQueries), même
// pattern que ResidencesPage pour les gardiens/arrêts par résidence.
// ============================================================

import { useState, type FormEvent } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCamions } from "../../../hooks/useCamions";
import { useAdminUtilisateurs } from "../../../hooks/useAdminUtilisateurs";
import { getAffectationsByCamion, affecterChauffeurCamion, terminerAffectation } from "../../../api/chauffeur-camions.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import type { ApiError, ChauffeurCamion } from "../../../types";
import "./AdminAffectationsPage.css";

// ─────────────────────────────────────────
// DATE DU JOUR (YYYY-MM-DD)
// ─────────────────────────────────────────

const today = new Date();
const TODAY_ISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function AdminAffectationsPage() {
  const queryClient = useQueryClient();

  const { data: camions, isLoading: isLoadingCamions } = useCamions();
  const { data: utilisateurs, isLoading: isLoadingUsers } = useAdminUtilisateurs();
  const chauffeurs = (utilisateurs ?? []).filter(u => u.role === "CHAUFFEUR" && u.actif);

  const camionsListe = camions ?? [];

  // ── Affectations actives : une query par camion, agrégées ──
  const affectationsQueries = useQueries({
    queries: camionsListe.map(c => ({
      queryKey: ["chauffeur-camions", "camion", c.id],
      queryFn: () => getAffectationsByCamion(c.id),
      enabled: camionsListe.length > 0,
    })),
  });

  const isLoadingAffectations = affectationsQueries.some(q => q.isLoading);

  const affectationsActives: ChauffeurCamion[] = affectationsQueries
    .flatMap(q => q.data ?? [])
    .filter(a => !a.dateFin);

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [chauffeurId, setChauffeurId] = useState<string>("");
  const [camionId, setCamionId] = useState<string>("");
  const [dateDebut, setDateDebut] = useState<string>(TODAY_ISO);
  const [createError, setCreateError] = useState<string>("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

  const isChargement = isLoadingCamions || isLoadingUsers;

  if (isChargement) {
    return <LoadingSpinner />;
  }

  const invalidateAll = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["chauffeur-camions"] });
  };

  const handleCreateSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setCreateError("");

    if (!chauffeurId || !camionId || !dateDebut) {
      setCreateError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmittingCreate(true);
    try {
      await affecterChauffeurCamion({
        chauffeurId: Number(chauffeurId),
        camionId: Number(camionId),
        dateDebut,
      });
      setChauffeurId("");
      setCamionId("");
      setDateDebut(TODAY_ISO);
      setCreateOpen(false);
      await invalidateAll();
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setCreateError(backendMessage ?? "Erreur lors de l'affectation.");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleTerminer = async (a: ChauffeurCamion): Promise<void> => {
    const key = `${a.chauffeurId}-${a.camionId}`;
    setPendingKeys(prev => new Set(prev).add(key));
    try {
      await terminerAffectation(a.chauffeurId, a.camionId);
      await invalidateAll();
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      console.error("BIDIWS — Erreur fin d'affectation", backendMessage ?? err);
    } finally {
      setPendingKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="admin-affectations__header">
        <div>
          <h1 className="admin-affectations__title">Affectations chauffeur-camion</h1>
          <p className="admin-affectations__subtitle">
            {affectationsActives.length} affectation{affectationsActives.length > 1 ? "s" : ""} active{affectationsActives.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Création (accordéon) ── */}
      <div className="admin-affectations__create">
        <button className="admin-affectations__create-toggle" onClick={() => setCreateOpen(o => !o)}>
          {createOpen ? "Fermer" : "Affecter un chauffeur"}
        </button>

        {createOpen && (
          <div className="admin-affectations__create-body">
            {chauffeurs.length === 0 || camionsListe.length === 0 ? (
              <div className="admin-affectations__error">
                Il manque au moins un chauffeur actif ou un camion pour créer une affectation.
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit}>
                {createError && <div className="admin-affectations__error">{createError}</div>}

                <div className="admin-affectations__grid">
                  <div className="admin-affectations__field">
                    <label className="admin-affectations__label">Chauffeur</label>
                    <select
                      className="admin-affectations__select"
                      value={chauffeurId}
                      onChange={(e) => setChauffeurId(e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      {chauffeurs.map(u => (
                        <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-affectations__field">
                    <label className="admin-affectations__label">Camion</label>
                    <select
                      className="admin-affectations__select"
                      value={camionId}
                      onChange={(e) => setCamionId(e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      {camionsListe.map(c => (
                        <option key={c.id} value={c.id}>{c.immatriculation}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-affectations__field">
                    <label className="admin-affectations__label">Date de début</label>
                    <input
                      className="admin-affectations__input"
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                    />
                  </div>
                </div>

                <button className="admin-affectations__submit" type="submit" disabled={isSubmittingCreate}>
                  {isSubmittingCreate ? "Affectation..." : "Affecter"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ── Liste ── */}
      {isLoadingAffectations ? (
        <LoadingSpinner />
      ) : affectationsActives.length === 0 ? (
        <div className="admin-affectations__list-empty">Aucune affectation active.</div>
      ) : (
        <div className="admin-affectations__list">
          {affectationsActives.map(a => {
            const key = `${a.chauffeurId}-${a.camionId}`;
            return (
              <div key={key} className="admin-affectation-row">
                <div className="admin-affectation-row__info">
                  <div className="admin-affectation-row__names">
                    {a.chauffeurPrenom} {a.chauffeurNom} <span className="admin-affectation-row__arrow">→</span> {a.camionImmatriculation}
                  </div>
                  <div className="admin-affectation-row__meta">Depuis le {a.dateDebut}</div>
                </div>
                <button
                  className="admin-affectation-row__action"
                  onClick={() => handleTerminer(a)}
                  disabled={pendingKeys.has(key)}
                >
                  {pendingKeys.has(key) ? "…" : "Terminer"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

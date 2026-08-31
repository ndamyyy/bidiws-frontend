// ============================================================
// BIDIWS — AdminCamionsPage
// Fichier : src/pages/admin/AdminCamionsPage/AdminCamionsPage.tsx
// Liste + création + édition + désactivation des camions. villeId est
// obligatoire (CamionRequestDto, @NotNull) — pas de select "optionnel"
// comme envisagé au départ.
// ============================================================

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCamions } from "../../../hooks/useCamions";
import { useVilles } from "../../../hooks/useVilles";
import { createCamion, updateCamion, desactiverCamion, type CamionRequest } from "../../../api/camions.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import type { ApiError, Camion } from "../../../types";
import "./AdminCamionsPage.css";

// ─────────────────────────────────────────
// FORMULAIRE (partagé création + édition)
// ─────────────────────────────────────────

interface CamionFormValues {
  immatriculation : string;
  modele          : string;
  typeBenne       : string;
  capaciteTonnes  : string;
  villeId         : string;
  gpsActif        : boolean;
  capteurBenne    : boolean;
}

const emptyValues: CamionFormValues = {
  immatriculation: "",
  modele: "",
  typeBenne: "",
  capaciteTonnes: "",
  villeId: "",
  gpsActif: false,
  capteurBenne: false,
};

const valuesFromCamion = (c: Camion): CamionFormValues => ({
  immatriculation: c.immatriculation,
  modele: c.modele ?? "",
  typeBenne: c.typeBenne ?? "",
  capaciteTonnes: c.capaciteTonnes != null ? String(c.capaciteTonnes) : "",
  villeId: c.villeId !== undefined ? String(c.villeId) : "",
  gpsActif: c.gpsActif,
  capteurBenne: c.capteurBenne,
});

const CamionForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initialValues : CamionFormValues;
  onSubmit      : (data: CamionRequest) => Promise<void>;
  onCancel      : () => void;
  submitLabel   : string;
}) => {
  const { data: villes, isLoading: isLoadingVilles } = useVilles();

  const [values, setValues] = useState<CamionFormValues>(initialValues);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!values.immatriculation.trim()) {
      setError("L'immatriculation est obligatoire.");
      return;
    }
    if (!values.villeId) {
      setError("La ville est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        immatriculation: values.immatriculation.trim(),
        modele: values.modele.trim() || undefined,
        typeBenne: values.typeBenne.trim() || undefined,
        capaciteTonnes: values.capaciteTonnes ? Number(values.capaciteTonnes) : undefined,
        gpsActif: values.gpsActif,
        capteurBenne: values.capteurBenne,
        villeId: Number(values.villeId),
      });
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? "Erreur lors de l'enregistrement du camion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="admin-camions__form" onSubmit={handleSubmit}>
      {error && <div className="admin-camions__error">{error}</div>}

      <div className="admin-camions__grid">
        <div className="admin-camions__field">
          <label className="admin-camions__label">Immatriculation</label>
          <input
            className="admin-camions__input"
            type="text"
            value={values.immatriculation}
            onChange={(e) => setValues(v => ({ ...v, immatriculation: e.target.value }))}
            placeholder="AB-123-CD"
          />
        </div>

        <div className="admin-camions__field">
          <label className="admin-camions__label">Modèle (optionnel)</label>
          <input
            className="admin-camions__input"
            type="text"
            value={values.modele}
            onChange={(e) => setValues(v => ({ ...v, modele: e.target.value }))}
          />
        </div>

        <div className="admin-camions__field">
          <label className="admin-camions__label">Type de benne (optionnel)</label>
          <input
            className="admin-camions__input"
            type="text"
            value={values.typeBenne}
            onChange={(e) => setValues(v => ({ ...v, typeBenne: e.target.value }))}
          />
        </div>

        <div className="admin-camions__field">
          <label className="admin-camions__label">Capacité (tonnes, optionnel)</label>
          <input
            className="admin-camions__input"
            type="number"
            min="0"
            step="0.1"
            value={values.capaciteTonnes}
            onChange={(e) => setValues(v => ({ ...v, capaciteTonnes: e.target.value }))}
          />
        </div>

        <div className="admin-camions__field">
          <label className="admin-camions__label">Ville</label>
          <select
            className="admin-camions__select"
            value={values.villeId}
            onChange={(e) => setValues(v => ({ ...v, villeId: e.target.value }))}
            disabled={isLoadingVilles}
          >
            <option value="">Sélectionner...</option>
            {villes?.map(v => (
              <option key={v.id} value={v.id}>{v.nom}</option>
            ))}
          </select>
        </div>

        <div className="admin-camions__field admin-camions__field--checkboxes">
          <label className="admin-camions__checkbox-label">
            <input
              type="checkbox"
              checked={values.gpsActif}
              onChange={(e) => setValues(v => ({ ...v, gpsActif: e.target.checked }))}
            />
            GPS actif
          </label>
          <label className="admin-camions__checkbox-label">
            <input
              type="checkbox"
              checked={values.capteurBenne}
              onChange={(e) => setValues(v => ({ ...v, capteurBenne: e.target.checked }))}
            />
            Capteur de benne
          </label>
        </div>
      </div>

      <div className="admin-camions__form-actions">
        <button type="button" className="admin-camions__cancel" onClick={onCancel}>
          Annuler
        </button>
        <button className="admin-camions__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────
// LIGNE CAMION
// ─────────────────────────────────────────

const CamionRow = ({
  camion,
  isEditing,
  isPending,
  onToggleEdit,
  onSubmitEdit,
  onDesactiver,
}: {
  camion       : Camion;
  isEditing    : boolean;
  isPending    : boolean;
  onToggleEdit : () => void;
  onSubmitEdit : (data: CamionRequest) => Promise<void>;
  onDesactiver : (id: number) => void;
}) => {
  return (
    <div className="admin-camion-row">
      <div className="admin-camion-row__header">
        <div className="admin-camion-row__info">
          <div className="admin-camion-row__immat">{camion.immatriculation}</div>
          <div className="admin-camion-row__meta">
            {camion.modele ?? "—"}{camion.typeBenne ? ` · ${camion.typeBenne}` : ""}
            {camion.capaciteTonnes != null ? ` · ${camion.capaciteTonnes} t` : ""}
            {camion.villeNom ? ` · ${camion.villeNom}` : ""}
          </div>
          <div className="admin-camion-row__badges">
            {camion.gpsActif && <span className="admin-camion-row__badge">GPS</span>}
            {camion.capteurBenne && <span className="admin-camion-row__badge">Capteur</span>}
          </div>
        </div>

        <div className="admin-camion-row__right">
          <span
            className={`admin-camion-row__statut ${
              camion.actif ? "admin-camion-row__statut--actif" : "admin-camion-row__statut--inactif"
            }`}
          >
            {camion.actif ? "Actif" : "Inactif"}
          </span>
          <button className="admin-camion-row__action" onClick={onToggleEdit}>
            {isEditing ? "Fermer" : "Modifier"}
          </button>
          {camion.actif && (
            <button
              className="admin-camion-row__action admin-camion-row__action--desactiver"
              onClick={() => onDesactiver(camion.id)}
              disabled={isPending}
            >
              {isPending ? "…" : "Désactiver"}
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <CamionForm
          initialValues={valuesFromCamion(camion)}
          onSubmit={onSubmitEdit}
          onCancel={onToggleEdit}
          submitLabel="Enregistrer les modifications"
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function AdminCamionsPage() {
  const queryClient = useQueryClient();
  const { data: camions, isLoading } = useCamions();

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const camionsListe = [...(camions ?? [])].sort((a, b) => b.id - a.id);

  const handleCreate = async (data: CamionRequest): Promise<void> => {
    await createCamion(data);
    setCreateOpen(false);
    await queryClient.invalidateQueries({ queryKey: ["camions"] });
  };

  const handleUpdate = async (id: number, data: CamionRequest): Promise<void> => {
    await updateCamion(id, data);
    setEditingId(null);
    await queryClient.invalidateQueries({ queryKey: ["camions"] });
  };

  const handleDesactiver = async (id: number): Promise<void> => {
    setPendingIds(prev => new Set(prev).add(id));
    try {
      await desactiverCamion(id);
      await queryClient.invalidateQueries({ queryKey: ["camions"] });
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      console.error("BIDIWS — Erreur désactivation camion", backendMessage ?? err);
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="admin-camions__header">
        <div>
          <h1 className="admin-camions__title">Camions</h1>
          <p className="admin-camions__subtitle">
            {camionsListe.length} camion{camionsListe.length > 1 ? "s" : ""} enregistré{camionsListe.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Création (accordéon) ── */}
      <div className="admin-camions__create">
        <button className="admin-camions__create-toggle" onClick={() => setCreateOpen(o => !o)}>
          {createOpen ? "Fermer" : "Ajouter un camion"}
        </button>
        {createOpen && (
          <div className="admin-camions__create-body">
            <CamionForm
              initialValues={emptyValues}
              onSubmit={handleCreate}
              onCancel={() => setCreateOpen(false)}
              submitLabel="Créer le camion"
            />
          </div>
        )}
      </div>

      {/* ── Liste ── */}
      {camionsListe.length === 0 ? (
        <div className="admin-camions__list-empty">Aucun camion enregistré.</div>
      ) : (
        <div className="admin-camions__list">
          {camionsListe.map(c => (
            <CamionRow
              key={c.id}
              camion={c}
              isEditing={editingId === c.id}
              isPending={pendingIds.has(c.id)}
              onToggleEdit={() => setEditingId(id => (id === c.id ? null : c.id))}
              onSubmitEdit={(data) => handleUpdate(c.id, data)}
              onDesactiver={handleDesactiver}
            />
          ))}
        </div>
      )}
    </div>
  );
}

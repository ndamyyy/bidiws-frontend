// ============================================================
// BIDIWS — AdminCreerTourneePage
// Fichier : src/pages/admin/AdminCreerTourneePage/AdminCreerTourneePage.tsx
// Seule interface pour créer une tournée — jusqu'ici possible
// uniquement via Postman. Route ADMIN plutôt qu'une section MAIRIE
// dédiée : ADMIN a déjà accès à tout.
// N'ajoute PAS les arrêts d'une tournée (chantier séparé, volontairement
// découpé) — juste la tournée elle-même.
// ============================================================

import { useState, type FormEvent } from "react";
import axios from "axios";
import { useTypesCollecte } from "../../../hooks/useCalendrierCollecte";
import { useCamions } from "../../../hooks/useCamions";
import { useAdminUtilisateurs } from "../../../hooks/useAdminUtilisateurs";
import { useZones } from "../../../hooks/useZones";
import { createTournee } from "../../../api/tournee.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import type { ApiError, Tournee } from "../../../types";
import "./AdminCreerTourneePage.css";

// ─────────────────────────────────────────
// DATE DU JOUR (YYYY-MM-DD)
// ─────────────────────────────────────────

const today = new Date();
const TODAY_ISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function AdminCreerTourneePage() {
  const { data: typesCollecte, isLoading: isLoadingTypes }  = useTypesCollecte();
  const { data: camions,       isLoading: isLoadingCamions } = useCamions();
  const { data: utilisateurs,  isLoading: isLoadingUsers }   = useAdminUtilisateurs();
  const { data: zones,         isLoading: isLoadingZones }   = useZones();

  const chauffeurs = (utilisateurs ?? []).filter(u => u.role === 'CHAUFFEUR');

  const [dateTournee,    setDateTournee]    = useState<string>(TODAY_ISO);
  const [typeCollecteId, setTypeCollecteId] = useState<string>("");
  const [camionId,       setCamionId]       = useState<string>("");
  const [chauffeurId,    setChauffeurId]    = useState<string>("");
  const [zoneId,         setZoneId]         = useState<string>("");

  const [error,       setError]       = useState<string>("");
  const [success,     setSuccess]     = useState<Tournee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isChargement = isLoadingTypes || isLoadingCamions || isLoadingUsers || isLoadingZones;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!dateTournee || !typeCollecteId || !camionId || !chauffeurId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tournee = await createTournee({
        dateTournee,
        typeCollecteId: Number(typeCollecteId),
        camionId: Number(camionId),
        chauffeurId: Number(chauffeurId),
        zoneId: zoneId ? Number(zoneId) : undefined,
      });
      setSuccess(tournee);
      setTypeCollecteId("");
      setCamionId("");
      setChauffeurId("");
      setZoneId("");
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? "Erreur lors de la création de la tournée.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChargement) {
    return <LoadingSpinner />;
  }

  if (chauffeurs.length === 0 || (camions ?? []).length === 0 || (typesCollecte ?? []).length === 0) {
    return (
      <div>
        <div className="admin-creer-tournee__header">
          <h1 className="admin-creer-tournee__title">Créer une tournée</h1>
        </div>
        <div className="admin-creer-tournee__empty">
          Il manque au moins une donnée nécessaire (chauffeur, camion ou
          type de collecte) pour créer une tournée — vérifiez que ces
          ressources existent avant de réessayer.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="admin-creer-tournee__header">
        <h1 className="admin-creer-tournee__title">Créer une tournée</h1>
        <p className="admin-creer-tournee__subtitle">
          Les arrêts de la tournée s'ajoutent séparément (à venir).
        </p>
      </div>

      <form className="admin-creer-tournee__card" onSubmit={handleSubmit}>

        {error && <div className="admin-creer-tournee__error">{error}</div>}
        {success && (
          <div className="admin-creer-tournee__success">
            Tournée #{success.id} créée avec succès ({success.dateTournee}).
          </div>
        )}

        {/* ── Date ── */}
        <div className="admin-creer-tournee__field">
          <label className="admin-creer-tournee__label">Date</label>
          <input
            className="admin-creer-tournee__input"
            type="date"
            value={dateTournee}
            onChange={(e) => setDateTournee(e.target.value)}
          />
        </div>

        {/* ── Type de collecte ── */}
        <div className="admin-creer-tournee__field">
          <label className="admin-creer-tournee__label">Type de collecte</label>
          <select
            className="admin-creer-tournee__select"
            value={typeCollecteId}
            onChange={(e) => setTypeCollecteId(e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {typesCollecte?.map(t => (
              <option key={t.id} value={t.id}>{t.libelle}</option>
            ))}
          </select>
        </div>

        {/* ── Camion ── */}
        <div className="admin-creer-tournee__field">
          <label className="admin-creer-tournee__label">Camion</label>
          <select
            className="admin-creer-tournee__select"
            value={camionId}
            onChange={(e) => setCamionId(e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {camions?.map(c => (
              <option key={c.id} value={c.id}>
                {c.immatriculation}{c.modele ? ` — ${c.modele}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* ── Chauffeur ── */}
        <div className="admin-creer-tournee__field">
          <label className="admin-creer-tournee__label">Chauffeur</label>
          <select
            className="admin-creer-tournee__select"
            value={chauffeurId}
            onChange={(e) => setChauffeurId(e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {chauffeurs.map(u => (
              <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
            ))}
          </select>
        </div>

        {/* ── Zone (optionnel) ── */}
        <div className="admin-creer-tournee__field">
          <label className="admin-creer-tournee__label">Zone (optionnel)</label>
          <select
            className="admin-creer-tournee__select"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
          >
            <option value="">Aucune</option>
            {zones?.map(z => (
              <option key={z.id} value={z.id}>
                {z.nom}{z.villeNom ? ` (${z.villeNom})` : ""}
              </option>
            ))}
          </select>
        </div>

        <button className="admin-creer-tournee__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Création..." : "Créer la tournée"}
        </button>

      </form>
    </div>
  );
}

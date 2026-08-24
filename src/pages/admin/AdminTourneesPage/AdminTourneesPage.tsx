// ============================================================
// BIDIWS — AdminTourneesPage
// Fichier : src/pages/admin/AdminTourneesPage/AdminTourneesPage.tsx
// Page de gestion des tournées côté admin, consolidée : liste (filtrée
// par date) + création (accordéon, pas une page séparée) + ajout
// d'arrêts + annulation. Remplace AdminCreerTourneePage, qui ne
// gérait que la création seule.
// ============================================================

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTournees } from "../../../hooks/useTournees";
import { useCamions } from "../../../hooks/useCamions";
import { useAdminUtilisateurs } from "../../../hooks/useAdminUtilisateurs";
import { useTypesCollecte } from "../../../hooks/useCalendrierCollecte";
import { useZones } from "../../../hooks/useZones";
import { useResidences } from "../../../hooks/useResidences";
import { useArretsByTournee } from "../../../hooks/useArrets";
import { createArret } from "../../../api/arrets.api";
import { createTournee, annulerTournee } from "../../../api/tournee.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { TypeCollecteIcon } from "../../../components/ui/TypeCollecteIcon/TypeCollecteIcon";
import { AnimatedCard } from "../../../components/ui/AnimatedCard/AnimatedCard";
import type { ApiError, Tournee } from "../../../types";
import "./AdminTourneesPage.css";

// ─────────────────────────────────────────
// DATE DU JOUR (YYYY-MM-DD)
// ─────────────────────────────────────────

const today = new Date();
const TODAY_ISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconChevron = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ─────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────

const Badge = ({ statut }: { statut: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PLANIFIEE: { bg: "rgba(107,132,163,0.12)", color: "#6b84a3", label: "Planifiée" },
    EN_COURS:  { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b", label: "En cours"  },
    TERMINEE:  { bg: "rgba(76,175,80,0.15)",   color: "#4caf50", label: "Terminée"  },
    ANNULEE:   { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", label: "Annulée"   },
  };
  const s = map[statut] ?? map.PLANIFIEE;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}44`,
      borderRadius: 20, padding: "3px 10px",
      fontSize: 11, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────
// FORMULAIRE AJOUT D'ARRÊT (par tournée)
// ─────────────────────────────────────────

const AjouterArretForm = ({
  tourneeId,
  onDone,
}: {
  tourneeId: number;
  onDone: () => void;
}) => {
  const queryClient = useQueryClient();
  const { data: residences, isLoading: isLoadingResidences } = useResidences();

  const [residenceId, setResidenceId] = useState<string>("");
  const [ordre, setOrdre] = useState<string>("1");
  const [nbConteneurs, setNbConteneurs] = useState<string>("1");
  const [typesConteneurs, setTypesConteneurs] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!residenceId || !ordre || !nbConteneurs) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createArret({
        tourneeId,
        residenceId: Number(residenceId),
        ordre: Number(ordre),
        nbConteneurs: Number(nbConteneurs),
        typesConteneurs: typesConteneurs || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["arrets", "tournee", tourneeId] });
      onDone();
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? "Erreur lors de l'ajout de l'arrêt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="admin-tournee-card__add-arret-form" onSubmit={handleSubmit}>
      {error && <div className="admin-tournees__error" style={{ gridColumn: "1 / -1" }}>{error}</div>}

      <div className="admin-tournees__field">
        <label className="admin-tournees__label">Résidence</label>
        <select
          className="admin-tournees__select"
          value={residenceId}
          onChange={(e) => setResidenceId(e.target.value)}
          disabled={isLoadingResidences}
        >
          <option value="">Sélectionner...</option>
          {residences?.map(r => (
            <option key={r.id} value={r.id}>{r.nom}</option>
          ))}
        </select>
      </div>

      <div className="admin-tournees__field">
        <label className="admin-tournees__label">Ordre</label>
        <input
          className="admin-tournees__input"
          type="number"
          min={1}
          value={ordre}
          onChange={(e) => setOrdre(e.target.value)}
        />
      </div>

      <div className="admin-tournees__field">
        <label className="admin-tournees__label">Nb conteneurs</label>
        <input
          className="admin-tournees__input"
          type="number"
          min={1}
          value={nbConteneurs}
          onChange={(e) => setNbConteneurs(e.target.value)}
        />
      </div>

      <div className="admin-tournees__field">
        <label className="admin-tournees__label">Types conteneurs</label>
        <input
          className="admin-tournees__input"
          type="text"
          placeholder="Optionnel"
          value={typesConteneurs}
          onChange={(e) => setTypesConteneurs(e.target.value)}
        />
      </div>

      <button className="admin-tournee-card__add-arret-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Ajout..." : "Ajouter l'arrêt"}
      </button>
    </form>
  );
};

// ─────────────────────────────────────────
// CARTE TOURNÉE
// ─────────────────────────────────────────

const TourneeCard = ({
  tournee,
  typeCode,
  index,
  isAnnulPending,
  onAnnuler,
  isAddArretOpen,
  onToggleAddArret,
}: {
  tournee         : Tournee;
  typeCode       ?: string;
  index           : number;
  isAnnulPending  : boolean;
  onAnnuler       : (id: number) => void;
  isAddArretOpen  : boolean;
  onToggleAddArret: () => void;
}) => {
  const { data: arrets, isLoading: isLoadingArrets } = useArretsByTournee(tournee.id);

  const arretsListe = [...(arrets ?? [])].sort((a, b) => a.ordre - b.ordre);

  return (
    <AnimatedCard className="admin-tournee-card" delay={index * 0.06} glow={false}>
      <div className="admin-tournee-card__header">
        <div>
          <div className="admin-tournee-card__name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TypeCollecteIcon code={typeCode} size={16} />
            {tournee.typeCollecteLibelle}
          </div>
          <div className="admin-tournee-card__meta">
            {tournee.chauffeurPrenom} {tournee.chauffeurNom} · {tournee.camionImmatriculation}
            {tournee.zoneNom && ` · ${tournee.zoneNom}`}
          </div>
        </div>
        <div className="admin-tournee-card__right">
          <Badge statut={tournee.statut} />
          {tournee.statut === "PLANIFIEE" && (
            <button
              className="admin-tournee-card__annuler"
              onClick={() => onAnnuler(tournee.id)}
              disabled={isAnnulPending}
            >
              {isAnnulPending ? "…" : "Annuler"}
            </button>
          )}
        </div>
      </div>

      <div className="admin-tournee-card__arrets">
        {isLoadingArrets && <div className="admin-tournee-card__arrets-empty">Chargement des arrêts…</div>}
        {!isLoadingArrets && arretsListe.length === 0 && (
          <div className="admin-tournee-card__arrets-empty">Aucun arrêt sur cette tournée.</div>
        )}
        {arretsListe.map(a => (
          <div key={a.id} className="admin-arret-row">
            <span className="admin-arret-row__ordre">{a.ordre}</span>
            <span className="admin-arret-row__nom">{a.residenceNom}</span>
            <span className="admin-arret-row__conteneurs">{a.nbConteneurs} bac{a.nbConteneurs > 1 ? "s" : ""}</span>
            <Badge statut={a.statut} />
          </div>
        ))}
      </div>

      {tournee.statut !== "ANNULEE" && (
        <>
          <button className="admin-tournee-card__add-arret-toggle" onClick={onToggleAddArret}>
            {isAddArretOpen ? "Fermer" : "Ajouter un arrêt"}
          </button>
          {isAddArretOpen && (
            <AjouterArretForm tourneeId={tournee.id} onDone={onToggleAddArret} />
          )}
        </>
      )}
    </AnimatedCard>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function AdminTourneesPage() {
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<string>(TODAY_ISO);
  const { data: tournees, isLoading: isLoadingTournees, isError: isErrorTournees } = useTournees({ date: selectedDate });

  const { data: typesCollecte, isLoading: isLoadingTypes }  = useTypesCollecte();
  const { data: camions,       isLoading: isLoadingCamions } = useCamions();
  const { data: utilisateurs,  isLoading: isLoadingUsers }   = useAdminUtilisateurs();
  const { data: zones,         isLoading: isLoadingZones }   = useZones();
  const chauffeurs = (utilisateurs ?? []).filter(u => u.role === "CHAUFFEUR");

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [dateTournee,    setDateTournee]    = useState<string>(TODAY_ISO);
  const [typeCollecteId, setTypeCollecteId] = useState<string>("");
  const [camionId,       setCamionId]       = useState<string>("");
  const [chauffeurId,    setChauffeurId]    = useState<string>("");
  const [zoneId,         setZoneId]         = useState<string>("");
  const [createError,   setCreateError]   = useState<string>("");
  const [createSuccess, setCreateSuccess] = useState<Tournee | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  const [annulPendingIds, setAnnulPendingIds] = useState<Set<number>>(new Set());
  const [addArretOpenId, setAddArretOpenId] = useState<number | null>(null);

  const isChargementCreateData = isLoadingTypes || isLoadingCamions || isLoadingUsers || isLoadingZones;

  const handleCreateSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess(null);

    if (!dateTournee || !typeCollecteId || !camionId || !chauffeurId) {
      setCreateError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const tournee = await createTournee({
        dateTournee,
        typeCollecteId: Number(typeCollecteId),
        camionId: Number(camionId),
        chauffeurId: Number(chauffeurId),
        zoneId: zoneId ? Number(zoneId) : undefined,
      });
      setCreateSuccess(tournee);
      setTypeCollecteId("");
      setCamionId("");
      setChauffeurId("");
      setZoneId("");
      await queryClient.invalidateQueries({ queryKey: ["tournees"] });
      if (tournee.dateTournee !== selectedDate) {
        setSelectedDate(tournee.dateTournee);
      }
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setCreateError(backendMessage ?? "Erreur lors de la création de la tournée.");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleAnnuler = async (id: number): Promise<void> => {
    setAnnulPendingIds(prev => new Set(prev).add(id));
    try {
      await annulerTournee(id);
      await queryClient.invalidateQueries({ queryKey: ["tournees"] });
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      console.error("BIDIWS — Erreur annulation tournée", backendMessage ?? err);
    } finally {
      setAnnulPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (isLoadingTournees) {
    return <LoadingSpinner />;
  }

  // Sans ce garde, une requête en erreur (data: undefined) retombait
  // silencieusement sur "0 tournée le ..." — indiscernable d'une vraie
  // journée sans tournée, sans message explicite.
  if (isErrorTournees) {
    return (
      <div>
        <div className="admin-tournees__header">
          <h1 className="admin-tournees__title">Tournées</h1>
        </div>
        <div style={{ padding: "24px 0", color: "var(--critical)", fontSize: 13 }}>
          Erreur lors du chargement des tournées.
        </div>
      </div>
    );
  }

  const tourneesListe = tournees ?? [];

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="admin-tournees__header">
        <div>
          <h1 className="admin-tournees__title">Tournées</h1>
          <p className="admin-tournees__subtitle">
            {tourneesListe.length} tournée{tourneesListe.length > 1 ? "s" : ""} le {selectedDate}
          </p>
        </div>
        <div className="admin-tournees__date-field">
          <label className="admin-tournees__date-label" htmlFor="admin-tournees-date">Date</label>
          <input
            id="admin-tournees-date"
            className="admin-tournees__date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* ── Création (accordéon) ── */}
      <div className="admin-tournees__create">
        <button
          className="admin-tournees__create-toggle"
          onClick={() => setCreateOpen(o => !o)}
        >
          Créer une tournée
          <span className={`admin-tournees__create-chevron ${createOpen ? "admin-tournees__create-chevron--open" : ""}`}>
            <IconChevron color="var(--text-secondary)" />
          </span>
        </button>

        {createOpen && (
          <div className="admin-tournees__create-body">
            {isChargementCreateData ? (
              <LoadingSpinner />
            ) : chauffeurs.length === 0 || (camions ?? []).length === 0 || (typesCollecte ?? []).length === 0 ? (
              <div className="admin-tournees__error">
                Il manque au moins une donnée nécessaire (chauffeur, camion ou
                type de collecte) pour créer une tournée.
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit}>
                {createError && <div className="admin-tournees__error">{createError}</div>}
                {createSuccess && (
                  <div className="admin-tournees__success">
                    Tournée #{createSuccess.id} créée avec succès ({createSuccess.dateTournee}).
                  </div>
                )}

                <div className="admin-tournees__grid">
                  <div className="admin-tournees__field">
                    <label className="admin-tournees__label">Date</label>
                    <input
                      className="admin-tournees__input"
                      type="date"
                      value={dateTournee}
                      onChange={(e) => setDateTournee(e.target.value)}
                    />
                  </div>

                  <div className="admin-tournees__field">
                    <label className="admin-tournees__label">Type de collecte</label>
                    <select
                      className="admin-tournees__select"
                      value={typeCollecteId}
                      onChange={(e) => setTypeCollecteId(e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      {typesCollecte?.map(t => (
                        <option key={t.id} value={t.id}>{t.libelle}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-tournees__field">
                    <label className="admin-tournees__label">Camion</label>
                    <select
                      className="admin-tournees__select"
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

                  <div className="admin-tournees__field">
                    <label className="admin-tournees__label">Chauffeur</label>
                    <select
                      className="admin-tournees__select"
                      value={chauffeurId}
                      onChange={(e) => setChauffeurId(e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      {chauffeurs.map(u => (
                        <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-tournees__field">
                    <label className="admin-tournees__label">Zone (optionnel)</label>
                    <select
                      className="admin-tournees__select"
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
                </div>

                <button className="admin-tournees__submit" type="submit" disabled={isSubmittingCreate}>
                  {isSubmittingCreate ? "Création..." : "Créer la tournée"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ── Liste ── */}
      {tourneesListe.length === 0 ? (
        <div className="admin-tournees__list-empty">Aucune tournée pour cette date.</div>
      ) : (
        <div className="admin-tournees__list">
          {tourneesListe.map((t, i) => (
            <TourneeCard
              key={t.id}
              tournee={t}
              typeCode={typesCollecte?.find(tc => tc.id === t.typeCollecteId)?.code}
              index={i}
              isAnnulPending={annulPendingIds.has(t.id)}
              onAnnuler={handleAnnuler}
              isAddArretOpen={addArretOpenId === t.id}
              onToggleAddArret={() => setAddArretOpenId(id => (id === t.id ? null : t.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

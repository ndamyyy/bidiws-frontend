// ============================================================
// BIDIWS — AdminTourneesPage
// Fichier : src/pages/admin/AdminTourneesPage/AdminTourneesPage.tsx
// Page de gestion des tournées côté admin, consolidée : liste (filtrée
// par date) + création (accordéon, pas une page séparée) + ajout
// d'arrêts + annulation. Remplace AdminCreerTourneePage, qui ne
// gérait que la création seule.
// ============================================================

import { useEffect, useState, type FormEvent } from "react";
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
import { getResidencesADesservir } from "../../../api/calendrier-collecte.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { TypeCollecteIcon } from "../../../components/ui/TypeCollecteIcon/TypeCollecteIcon";
import { AnimatedCard } from "../../../components/ui/AnimatedCard/AnimatedCard";
import { Input } from "../../../components/ui/Input/Input";
import { Select } from "../../../components/ui/Select/Select";
import { Modal } from "../../../components/ui/Modal/Modal";
import { Button } from "../../../components/ui/Button/Button";
import { useToast } from "../../../hooks/useToast";
import { extractErrorMessage } from "../../../utils/extractErrorMessage";
import type { ApiError, ResidenceADesservir, Tournee } from "../../../types";
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

      <Select
        label="Résidence"
        placeholder="Sélectionner..."
        options={(residences ?? []).map(r => ({ value: String(r.id), label: r.nom }))}
        value={residenceId}
        onChange={(e) => setResidenceId(e.target.value)}
        disabled={isLoadingResidences}
      />

      <Input
        label="Ordre"
        type="number"
        min={1}
        value={ordre}
        onChange={(e) => setOrdre(e.target.value)}
      />

      <Input
        label="Nb conteneurs"
        type="number"
        min={1}
        value={nbConteneurs}
        onChange={(e) => setNbConteneurs(e.target.value)}
      />

      <Input
        label="Types conteneurs"
        type="text"
        placeholder="Optionnel"
        value={typesConteneurs}
        onChange={(e) => setTypesConteneurs(e.target.value)}
      />

      <button className="admin-tournee-card__add-arret-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Ajout..." : "Ajouter l'arrêt"}
      </button>
    </form>
  );
};

// ─────────────────────────────────────────
// SUGGESTION D'ARRÊTS DEPUIS LE CALENDRIER
// GET /calendriers-collecte/residences-a-desservir (lecture seule),
// puis une liste à cocher/décocher — jamais de création automatique
// sans validation explicite de l'admin.
// ─────────────────────────────────────────

const SuggererArretsModal = ({
  tournee,
  ordreDepart,
  residenceIdsExistantes,
  onClose,
  onDone,
}: {
  tournee: Tournee;
  ordreDepart: number;
  residenceIdsExistantes: Set<number>;
  onClose: () => void;
  onDone: () => void;
}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [suggestions, setSuggestions] = useState<ResidenceADesservir[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await getResidencesADesservir(
          tournee.zoneId as number,
          tournee.dateTournee,
          tournee.typeCollecteId
        );
        if (cancelled) return;
        // Une résidence déjà desservie sur cette tournée n'est pas
        // resuggérée — évite un doublon d'arrêt pour la même résidence.
        const nouvelles = result.filter(r => !residenceIdsExistantes.has(r.id));
        setSuggestions(nouvelles);
        setSelectedIds(new Set(nouvelles.map(r => r.id)));
      } catch (err) {
        if (!cancelled) {
          setError(extractErrorMessage(err, "Erreur lors de la recherche des résidences à desservir."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [tournee.zoneId, tournee.dateTournee, tournee.typeCollecteId, residenceIdsExistantes]);

  const toggle = (id: number): void => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleConfirm = async (): Promise<void> => {
    if (!suggestions || selectedIds.size === 0) return;

    setIsCreating(true);
    setError("");
    const aCreer = suggestions.filter(r => selectedIds.has(r.id));

    try {
      await Promise.all(aCreer.map((r, i) =>
        createArret({
          tourneeId: tournee.id,
          residenceId: r.id,
          ordre: ordreDepart + i,
          nbConteneurs: r.nbConteneurs ?? 1,
        })
      ));
      await queryClient.invalidateQueries({ queryKey: ["arrets", "tournee", tournee.id] });
      toast.success(`${aCreer.length} arrêt${aCreer.length > 1 ? "s" : ""} créé${aCreer.length > 1 ? "s" : ""} depuis le calendrier.`);
      onDone();
    } catch (err) {
      // Une requête POST /arrets par résidence, pas une création groupée
      // atomique côté backend : une partie a pu réussir malgré l'échec —
      // on rafraîchit quand même la liste pour refléter ce qui a été créé.
      await queryClient.invalidateQueries({ queryKey: ["arrets", "tournee", tournee.id] });
      setError(extractErrorMessage(err, "Erreur lors de la création des arrêts."));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Suggestions depuis le calendrier"
      maxWidth={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isCreating}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={isCreating}
            disabled={isLoading || !suggestions || selectedIds.size === 0}
          >
            Créer {selectedIds.size} arrêt{selectedIds.size > 1 ? "s" : ""}
          </Button>
        </>
      }
    >
      {error && <div className="admin-tournees__error">{error}</div>}

      {isLoading && <LoadingSpinner />}

      {!isLoading && suggestions && suggestions.length === 0 && (
        <div style={{ padding: "8px 0", color: "var(--text-secondary)", fontSize: 13 }}>
          Aucune résidence à desservir trouvée pour cette date et cette zone
          d'après le calendrier.
        </div>
      )}

      {!isLoading && suggestions && suggestions.length > 0 && (
        <div className="admin-suggestion-list">
          {suggestions.map(r => (
            <label key={r.id} className="admin-suggestion-row">
              <input
                type="checkbox"
                checked={selectedIds.has(r.id)}
                onChange={() => toggle(r.id)}
              />
              <div className="admin-suggestion-row__info">
                <div className="admin-suggestion-row__nom">{r.nom}</div>
                <div className="admin-suggestion-row__adresse">{r.adresse}, {r.codePostal}</div>
              </div>
              <div className="admin-suggestion-row__conteneurs">
                {r.nbConteneurs ?? 1} bac{(r.nbConteneurs ?? 1) > 1 ? "s" : ""}
              </div>
            </label>
          ))}
        </div>
      )}
    </Modal>
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

  const [suggestionsOpen, setSuggestionsOpen] = useState<boolean>(false);

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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="admin-tournee-card__add-arret-toggle" onClick={onToggleAddArret}>
              {isAddArretOpen ? "Fermer" : "Ajouter un arrêt"}
            </button>
            {/* La zone est nécessaire pour interroger le calendrier (params
                zoneId/date/typeCollecteId) — désactivé si la tournée n'en a
                pas, plutôt qu'un appel voué à échouer côté backend. */}
            <button
              className="admin-tournee-card__add-arret-toggle"
              onClick={() => setSuggestionsOpen(true)}
              disabled={!tournee.zoneId}
              title={tournee.zoneId ? undefined : "Cette tournée n'a pas de zone assignée."}
            >
              Suggérer les arrêts depuis le calendrier
            </button>
          </div>
          {isAddArretOpen && (
            <AjouterArretForm tourneeId={tournee.id} onDone={onToggleAddArret} />
          )}
        </>
      )}

      {suggestionsOpen && (
        <SuggererArretsModal
          tournee={tournee}
          ordreDepart={arretsListe.length + 1}
          residenceIdsExistantes={new Set(arretsListe.map(a => a.residenceId))}
          onClose={() => setSuggestionsOpen(false)}
          onDone={() => setSuggestionsOpen(false)}
        />
      )}
    </AnimatedCard>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function AdminTourneesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

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
      toast.error(extractErrorMessage(err, "L'annulation de la tournée a échoué, réessayez."));
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
        <Input
          label="Date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
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
                  <Input
                    label="Date"
                    type="date"
                    value={dateTournee}
                    onChange={(e) => setDateTournee(e.target.value)}
                  />

                  <Select
                    label="Type de collecte"
                    placeholder="Sélectionner..."
                    options={(typesCollecte ?? []).map(t => ({ value: String(t.id), label: t.libelle }))}
                    value={typeCollecteId}
                    onChange={(e) => setTypeCollecteId(e.target.value)}
                  />

                  <Select
                    label="Camion"
                    placeholder="Sélectionner..."
                    options={(camions ?? []).map(c => ({
                      value: String(c.id),
                      label: `${c.immatriculation}${c.modele ? ` — ${c.modele}` : ""}`,
                    }))}
                    value={camionId}
                    onChange={(e) => setCamionId(e.target.value)}
                  />

                  <Select
                    label="Chauffeur"
                    placeholder="Sélectionner..."
                    options={chauffeurs.map(u => ({ value: String(u.id), label: `${u.prenom} ${u.nom}` }))}
                    value={chauffeurId}
                    onChange={(e) => setChauffeurId(e.target.value)}
                  />

                  <Select
                    label="Zone (optionnel)"
                    placeholder="Aucune"
                    options={(zones ?? []).map(z => ({
                      value: String(z.id),
                      label: `${z.nom}${z.villeNom ? ` (${z.villeNom})` : ""}`,
                    }))}
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                  />
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

// ============================================================
// BIDIWS — ChauffeurTourneePage
// Fichier : src/pages/chauffeur/ChauffeurTourneePage/ChauffeurTourneePage.tsx
// ============================================================

import { useState }                    from "react";
import { useQueryClient }              from "@tanstack/react-query";
import axios                           from "axios";
import { useAuth }                     from "../../../hooks/useAuth";
import { useMaTourneeAujourdhui }      from "../../../hooks/useTournees";
import { useArretsByTournee }          from "../../../hooks/useArrets";
import { useTypesCollecte }            from "../../../hooks/useCalendrierCollecte";
import { validerArret, signalerIncident } from "../../../api/arrets.api";
import { demarrerTournee, terminerTournee } from "../../../api/tournee.api";
import { LoadingSpinner }              from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { TypeCollecteIcon }            from "../../../components/ui/TypeCollecteIcon/TypeCollecteIcon";
import type { Arret, ApiError }        from "../../../types";
import "./ChauffeurTourneePage.css";

// Arrêts dans un état terminal (collecte confirmée ou incident) — le
// seul dont dispose cette page pour décider "tournée terminable", le
// backend (TourneeService.terminer) ne vérifiant lui-même que le
// statut de la tournée, pas celui des arrêts.
const STATUTS_ARRET_TERMINAUX = ['COLLECTE_CONFIRMEE', 'INCIDENT'];

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconCheck = ({ color, size = 18 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconGps = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
);

const IconTruck = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconAlert = ({ color, size = 14 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ─────────────────────────────────────────
// BARRE DE PROGRESSION
// ─────────────────────────────────────────

const ProgressBar = ({ progress }: { progress: number }) => (
  <div style={{ position: "relative", height: 52 }}>
    {/* Track */}
    <div style={{
      position: "absolute", top: 20, left: "2%", right: "2%",
      height: 4, background: "var(--overlay-6)", borderRadius: 4,
    }}>
      <div style={{
        height: "100%", width: `${progress}%`, borderRadius: 4,
        // Départ teinté de l'accent de rôle (--accent-role, orange
        // chauffeur) plutôt que le navy générique — arrivée toujours
        // sur le vert signal de la marque, inchangé.
        background: "linear-gradient(90deg, var(--accent-role), #4caf50)",
        transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: "0 0 12px rgba(76,175,80,0.3)",
      }} />
    </div>
    {/* Camion */}
    <div style={{
      position: "absolute", top: 2,
      left: `calc(2% + ${progress * 0.96}%)`,
      transform: "translateX(-50%)",
      transition: "left 0.8s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <IconTruck color="#4caf50" />
    </div>
    {/* Labels */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      display: "flex", justifyContent: "space-between",
    }}>
      <span style={{ fontSize: 11, color: "#6b84a3" }}>Départ</span>
      <span style={{ fontSize: 11, color: "#4caf50", fontWeight: 600 }}>
        {progress}% complété
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────
// ARRET ITEM
// ─────────────────────────────────────────

const ArretItem = ({
  arret,
  index,
  onValider,
  onSignalerIncident,
  readOnly,
}: {
  arret             : Arret;
  index             : number;
  onValider         : (id: number) => void;
  onSignalerIncident: (id: number, description: string) => Promise<void>;
  readOnly          : boolean;
}) => {
  const isDone     = arret.statut === 'COLLECTE_CONFIRMEE';
  const isIncident = arret.statut === 'INCIDENT';
  const isCurrent  = arret.statut === 'EN_APPROCHE';
  const isTerminal = isDone || isIncident;

  const stepClass = isTerminal
    ? "c-arret-item__step--done"
    : isCurrent
    ? "c-arret-item__step--current"
    : "c-arret-item__step--pending";

  // ── Formulaire incident : local à l'arrêt, pas un signalement
  // général (pas de photo, pas de résidence à choisir) — un incident
  // ponctuel sur CET arrêt, description brève uniquement.
  const [incidentOpen,       setIncidentOpen]       = useState<boolean>(false);
  const [description,        setDescription]        = useState<string>("");
  const [isSubmitting,       setIsSubmitting]       = useState<boolean>(false);
  const [incidentError,      setIncidentError]      = useState<string>("");

  const handleSubmitIncident = async (): Promise<void> => {
    if (!description.trim()) return;
    setIsSubmitting(true);
    setIncidentError("");
    try {
      await onSignalerIncident(arret.id, description.trim());
      setIncidentOpen(false);
      setDescription("");
    } catch {
      setIncidentError("Erreur lors du signalement de l'incident.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`c-arret-item ${isCurrent ? "c-arret-item--current" : ""}`}>
      <div className="c-arret-item__row">
        {/* Étape */}
        <div className={`c-arret-item__step ${stepClass}`}>
          {isTerminal
            ? <IconCheck color={isIncident ? "#ef4444" : "#4caf50"} size={16} />
            : <span style={{ color: isCurrent ? "#f59e0b" : "#6b84a3" }}>{index + 1}</span>
          }
        </div>

        {/* Infos */}
        <div className="c-arret-item__info">
          <div className="c-arret-item__name">{arret.residenceNom}</div>
          <div className="c-arret-item__addr">{arret.residenceAdresse}</div>
          {arret.heureCollecte && (
            <div className="c-arret-item__heure">
              ✓ Validé à {new Date(arret.heureCollecte).toLocaleTimeString("fr-FR", {
                hour: "2-digit", minute: "2-digit",
              })}
            </div>
          )}
          {arret.heureEstimee && !arret.heureCollecte && (
            <div style={{ fontSize: 11, color: "#6b84a3", marginTop: 4 }}>
              Estimé à {new Date(arret.heureEstimee).toLocaleTimeString("fr-FR", {
                hour: "2-digit", minute: "2-digit",
              })}
            </div>
          )}
          {isIncident && arret.descriptionIncident && (
            <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
              {arret.descriptionIncident}
            </div>
          )}
        </div>

        {/* Action */}
        {isTerminal ? (
          <span style={{
            background: isIncident ? "rgba(239,68,68,0.12)" : "rgba(76,175,80,0.12)",
            border: `1px solid ${isIncident ? "rgba(239,68,68,0.25)" : "rgba(76,175,80,0.25)"}`,
            color: isIncident ? "#ef4444" : "#4caf50", borderRadius: 20,
            padding: "3px 10px", fontSize: 11, fontWeight: 600,
          }}>
            {isIncident ? "Incident" : "Collecté"}
          </span>
        ) : readOnly ? null : (
          <div className="c-arret-item__actions">
            <button
              className="btn-valider-chauffeur"
              onClick={() => onValider(arret.id)}
            >
              <IconCheck color="#fff" size={14} /> Valider
            </button>
            <button
              className="btn-incident-chauffeur"
              onClick={() => setIncidentOpen(v => !v)}
              title="Signaler un incident sur cet arrêt"
            >
              <IconAlert color="#ef4444" />
            </button>
          </div>
        )}
      </div>

      {/* Formulaire incident, sous la ligne principale */}
      {incidentOpen && !isTerminal && !readOnly && (
        <div className="c-arret-item__incident-form">
          <input
            className="c-arret-item__incident-input"
            type="text"
            placeholder="Décrivez brièvement l'incident…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitIncident()}
            autoFocus
          />
          <button
            className="btn-incident-submit"
            onClick={handleSubmitIncident}
            disabled={!description.trim() || isSubmitting}
          >
            {isSubmitting ? "…" : "Envoyer"}
          </button>
          <button
            className="btn-incident-cancel"
            onClick={() => { setIncidentOpen(false); setDescription(""); setIncidentError(""); }}
          >
            Annuler
          </button>
          {incidentError && (
            <div className="c-arret-item__incident-error">{incidentError}</div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function ChauffeurTourneePage() {
  const { utilisateur } = useAuth();
  const queryClient = useQueryClient();

  const [gpsOn, setGpsOn] = useState<boolean>(true);
  const [isTerminating, setIsTerminating] = useState<boolean>(false);
  const [terminerError, setTerminerError] = useState<string>("");
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [demarrerError, setDemarrerError] = useState<string>("");

  // ── Tournée du jour du chauffeur connecté ──
  const chauffeurId = utilisateur?.id;
  const { data: tournees, isLoading: isLoadingTournees, isError: isErrorTournees } = useMaTourneeAujourdhui(chauffeurId);
  const tournee = tournees?.[0];
  const { data: typesCollecte } = useTypesCollecte();
  const typeCode = typesCollecte?.find(tc => tc.id === tournee?.typeCollecteId)?.code;

  // ── Arrêts de cette tournée ──
  const { data: arrets, isLoading: isLoadingArrets, isError: isErrorArrets } = useArretsByTournee(tournee?.id);
  const arretsListe = arrets ?? [];

  const isChargement = isLoadingTournees || isLoadingArrets;
  const isErreur = isErrorTournees || isErrorArrets;

  const done     = arretsListe.filter(a => a.statut === 'COLLECTE_CONFIRMEE').length;
  const total    = arretsListe.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const tourneePlanifiee = tournee?.statut === 'PLANIFIEE';
  const tourneeTerminee = tournee?.statut === 'TERMINEE';
  const tourneeCloturee = tourneeTerminee || tournee?.statut === 'ANNULEE';
  const tousArretsTermines = total > 0 && arretsListe.every(a => STATUTS_ARRET_TERMINAUX.includes(a.statut));

  // ── Démarrer la tournée : appel serveur réel, puis refetch — passage
  // PLANIFIEE → EN_COURS, condition pour pouvoir valider des arrêts. ──
  const handleDemarrer = async (): Promise<void> => {
    if (!tournee) return;
    setDemarrerError("");
    setIsStarting(true);
    try {
      await demarrerTournee(tournee.id);
      await queryClient.invalidateQueries({ queryKey: ["tournees"] });
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setDemarrerError(backendMessage ?? "Erreur lors du démarrage de la tournée.");
    } finally {
      setIsStarting(false);
    }
  };

  // ── Valider un arrêt : appel serveur réel, puis refetch ──
  const handleValider = async (arretId: number): Promise<void> => {
    try {
      await validerArret(arretId, 'COLLECTE_CONFIRMEE');
      await queryClient.invalidateQueries({ queryKey: ["arrets", "tournee", tournee?.id] });
    } catch (e) {
      console.error("BIDIWS — Erreur validation arrêt", e);
    }
  };

  // ── Signaler un incident sur un arrêt : appel serveur réel, puis
  // refetch — erreur remontée à l'appelant (ArretItem gère l'affichage
  // localement, propre à cet arrêt plutôt qu'un état page-level). ──
  const handleSignalerIncident = async (arretId: number, description: string): Promise<void> => {
    await signalerIncident(arretId, { descriptionIncident: description });
    await queryClient.invalidateQueries({ queryKey: ["arrets", "tournee", tournee?.id] });
  };

  // ── Terminer la tournée : appel serveur réel, puis refetch ──
  const handleTerminer = async (): Promise<void> => {
    if (!tournee) return;
    setTerminerError("");
    setIsTerminating(true);
    try {
      await terminerTournee(tournee.id);
      await queryClient.invalidateQueries({ queryKey: ["tournees"] });
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setTerminerError(backendMessage ?? "Erreur lors de la clôture de la tournée.");
    } finally {
      setIsTerminating(false);
    }
  };

  if (isChargement) {
    return <LoadingSpinner />;
  }

  // Sans ce garde, une requête en erreur (data: undefined) retombait
  // silencieusement sur "Aucune tournée programmée aujourd'hui" —
  // indiscernable d'une vraie journée sans tournée, sans message
  // explicite.
  if (isErreur) {
    return (
      <div>
        <div className="chauffeur__header">
          <h1 className="chauffeur__title">Ma tournée</h1>
          <p className="chauffeur__subtitle" style={{ color: "var(--critical)" }}>
            Erreur lors du chargement de la tournée.
          </p>
        </div>
      </div>
    );
  }

  if (!tournee) {
    return (
      <div>
        <div className="chauffeur__header">
          <h1 className="chauffeur__title">Ma tournée</h1>
          <p className="chauffeur__subtitle">Aucune tournée programmée aujourd'hui.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="chauffeur__header">
        <h1 className="chauffeur__title">Ma tournée</h1>
        <p className="chauffeur__subtitle" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <TypeCollecteIcon code={typeCode} size={16} />
          {tournee.typeCollecteLibelle} · {tournee.camionImmatriculation}
          {tournee.zoneNom && ` · ${tournee.zoneNom}`}
        </p>
        {tourneeTerminee && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            marginTop: 8, background: "rgba(76,175,80,0.12)",
            border: "1px solid rgba(76,175,80,0.25)", color: "#4caf50",
            borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600,
          }}>
            <IconCheck color="#4caf50" size={13} /> Tournée terminée
          </span>
        )}
      </div>

      {/* ── Démarrer la tournée ── */}
      {/* Visible uniquement avant toute validation d'arrêt (statut
          PLANIFIEE) — une fois EN_COURS, ce bloc disparaît et laisse
          place au fonctionnement existant (valider les arrêts, puis
          terminer la tournée une fois tous validés). */}
      {tourneePlanifiee && (
        <div className="chauffeur__demarrer">
          {demarrerError && (
            <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>
              {demarrerError}
            </div>
          )}
          <button
            className="btn-demarrer-chauffeur"
            onClick={handleDemarrer}
            disabled={isStarting}
          >
            <IconTruck color="var(--text-inverse)" />
            {isStarting ? "Démarrage en cours..." : "Démarrer la tournée"}
          </button>
        </div>
      )}

      {/* ── GPS Toggle ── */}
      <div className={`chauffeur__gps ${gpsOn ? "chauffeur__gps--on" : "chauffeur__gps--off"}`}>
        <div className="chauffeur__gps-left">
          <div
            className="chauffeur__gps-icon"
            style={{
              background: gpsOn ? "rgba(76,175,80,0.2)"  : "var(--overlay-5)",
              border    : `1.5px solid ${gpsOn ? "rgba(76,175,80,0.4)" : "var(--overlay-8)"}`,
              boxShadow : gpsOn ? "0 0 20px rgba(76,175,80,0.2)" : "none",
            }}
          >
            <IconGps color={gpsOn ? "#4caf50" : "#6b84a3"} />
          </div>
          <div>
            <div className="chauffeur__gps-title">Suivi GPS automatique</div>
            <div
              className="chauffeur__gps-desc"
              style={{ color: gpsOn ? "#4caf50" : "#6b84a3" }}
            >
              {gpsOn
                ? "Actif — détection automatique des arrêts"
                : "Désactivé — validation manuelle uniquement"
              }
            </div>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          className="toggle-switch"
          style={{ background: gpsOn ? "#4caf50" : "var(--overlay-10)" }}
          onClick={() => setGpsOn(prev => !prev)}
        >
          <div
            className="toggle-switch__thumb"
            style={{ left: gpsOn ? 28 : 4 }}
          />
        </button>
      </div>

      {/* ── Progression ── */}
      <div className="chauffeur__progress">
        <div className="chauffeur__progress-header">
          <span className="chauffeur__progress-title">Progression</span>
          <span className="chauffeur__progress-count">{done}/{total} arrêts validés</span>
        </div>
        <ProgressBar progress={progress} />
      </div>

      {/* ── Liste des arrêts ── */}
      <div className="chauffeur__arrets">
        <div className="chauffeur__arrets-header">Arrêts</div>
        {arretsListe.length === 0 && (
          <div style={{ padding: "16px 22px", color: "var(--text-secondary)", fontSize: 13 }}>
            Aucun arrêt sur cette tournée.
          </div>
        )}
        {arretsListe.map((arret, idx) => (
          <ArretItem
            key={arret.id}
            arret={arret}
            index={idx}
            onValider={handleValider}
            onSignalerIncident={handleSignalerIncident}
            readOnly={tourneeCloturee || tourneePlanifiee}
          />
        ))}
      </div>

      {/* ── Terminer la tournée ── */}
      {!tourneeCloturee && tousArretsTermines && (
        <div className="chauffeur__terminer">
          {terminerError && (
            <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>
              {terminerError}
            </div>
          )}
          <button
            className="btn-terminer-chauffeur"
            onClick={handleTerminer}
            disabled={isTerminating}
          >
            {isTerminating ? "Clôture en cours..." : "Terminer la tournée"}
          </button>
        </div>
      )}
    </div>
  );
}
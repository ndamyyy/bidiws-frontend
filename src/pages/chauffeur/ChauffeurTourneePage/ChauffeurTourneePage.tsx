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
import { validerArret }                from "../../../api/arrets.api";
import { terminerTournee }             from "../../../api/tournee.api";
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
        background: "linear-gradient(90deg, #1b3a6b, #4caf50)",
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
  readOnly,
}: {
  arret    : Arret;
  index    : number;
  onValider: (id: number) => void;
  readOnly : boolean;
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

  return (
    <div className={`c-arret-item ${isCurrent ? "c-arret-item--current" : ""}`}>
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
        <button
          className="btn-valider-chauffeur"
          onClick={() => onValider(arret.id)}
        >
          <IconCheck color="#fff" size={14} /> Valider
        </button>
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

  // ── Tournée du jour du chauffeur connecté ──
  const chauffeurId = utilisateur?.id;
  const { data: tournees, isLoading: isLoadingTournees } = useMaTourneeAujourdhui(chauffeurId);
  const tournee = tournees?.[0];
  const { data: typesCollecte } = useTypesCollecte();
  const typeCode = typesCollecte?.find(tc => tc.id === tournee?.typeCollecteId)?.code;

  // ── Arrêts de cette tournée ──
  const { data: arrets, isLoading: isLoadingArrets } = useArretsByTournee(tournee?.id);
  const arretsListe = arrets ?? [];

  const isChargement = isLoadingTournees || isLoadingArrets;

  const done     = arretsListe.filter(a => a.statut === 'COLLECTE_CONFIRMEE').length;
  const total    = arretsListe.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const tourneeTerminee = tournee?.statut === 'TERMINEE';
  const tourneeCloturee = tourneeTerminee || tournee?.statut === 'ANNULEE';
  const tousArretsTermines = total > 0 && arretsListe.every(a => STATUTS_ARRET_TERMINAUX.includes(a.statut));

  // ── Valider un arrêt : appel serveur réel, puis refetch ──
  const handleValider = async (arretId: number): Promise<void> => {
    try {
      await validerArret(arretId, 'COLLECTE_CONFIRMEE');
      await queryClient.invalidateQueries({ queryKey: ["arrets", "tournee", tournee?.id] });
    } catch (e) {
      console.error("BIDIWS — Erreur validation arrêt", e);
    }
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
            readOnly={tourneeCloturee}
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
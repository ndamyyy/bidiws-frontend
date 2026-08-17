// ============================================================
// BIDIWS — TourneesPage (Syndic)
// Fichier : src/pages/syndic/TourneesPage/TourneesPage.tsx
// ============================================================

import { useQueryClient, useQueries }        from "@tanstack/react-query";
import { useTournees }                       from "../../../hooks/useTournees";
import { getArretsByTournee, validerArret }  from "../../../api/arrets.api";
import { LoadingSpinner }                    from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import type { Arret }                        from "../../../types";
import "./TourneesPage.css";

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconCheck = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconClock = ({ color }: { color: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconTruck = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

// ─────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────

const Badge = ({ statut }: { statut: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    COLLECTE_CONFIRMEE: { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Confirmé"   },
    EN_APPROCHE:        { bg: "rgba(33,150,243,0.15)", color: "#2196f3", label: "En approche"},
    EN_COURS:           { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "En cours"   },
    PLANIFIEE:          { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "Planifiée"  },
    TERMINEE:           { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Terminée"   },
    EN_ATTENTE:         { bg: "rgba(107,132,163,0.12)",color: "#6b84a3", label: "En attente" },
    INCIDENT:           { bg: "rgba(239,68,68,0.15)",  color: "#ef4444", label: "Incident"   },
  };
  const s = map[statut] ?? map.EN_ATTENTE;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}44`,
      borderRadius: 20, padding: "3px 10px",
      fontSize: 11, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: s.color, display: "inline-block",
        ...(statut === "EN_COURS" || statut === "EN_APPROCHE"
          ? { animation: "livePulse 1.4s infinite" } : {}),
      }} />
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────
// SCORE CONFIANCE
// ─────────────────────────────────────────

const ScoreBadge = ({ score }: { score: number }) => {
  const cls = score >= 80 ? "high" : score >= 50 ? "medium" : "low";
  return (
    <span className={`score-badge score-badge--${cls}`}>
      ⚡ {score}%
    </span>
  );
};

// ─────────────────────────────────────────
// ARRET ITEM
// ─────────────────────────────────────────

const ArretItem = ({
  arret,
  index,
  onValider,
}: {
  arret    : Arret;
  index    : number;
  onValider: (id: number) => void;
}) => {
  const isDone    = arret.statut === 'COLLECTE_CONFIRMEE';
  const isEnCours = arret.statut === 'EN_APPROCHE' || arret.statut === 'COLLECTE_PROBABLE';

  const stepClass = isDone
    ? "arret-item__step--done"
    : isEnCours
    ? "arret-item__step--en-cours"
    : "arret-item__step--pending";

  return (
    <div className={`arret-item ${isEnCours ? "arret-item--en-cours" : ""}`}>
      {/* Étape */}
      <div className={`arret-item__step ${stepClass}`}>
        {isDone
          ? <IconCheck color="#4caf50" />
          : <span style={{ color: isEnCours ? "#f59e0b" : "#6b84a3" }}>{index + 1}</span>
        }
      </div>

      {/* Info résidence */}
      <div className="arret-item__info">
        <div className="arret-item__name">{arret.residenceNom}</div>
        <div className="arret-item__addr">{arret.residenceAdresse}</div>
        {arret.typesConteneurs && (
          <div className="arret-item__tags">
            {arret.typesConteneurs.split(",").map((c, i) => (
              <span key={i} className="arret-item__tag">{c.trim()}</span>
            ))}
          </div>
        )}
        {arret.heureCollecte && (
          <div className="arret-item__time">
            <IconClock color="#6b84a3" />
            Collecté à {new Date(arret.heureCollecte).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            {arret.modeDetection && ` · via ${arret.modeDetection.replace("_", " ")}`}
          </div>
        )}
        {arret.heureEstimee && !arret.heureCollecte && (
          <div className="arret-item__time">
            <IconClock color="#6b84a3" />
            Estimé à {new Date(arret.heureEstimee).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>

      {/* Droite */}
      <div className="arret-item__right">
        <Badge statut={arret.statut} />
        {arret.scoreConfiance > 0 && <ScoreBadge score={arret.scoreConfiance} />}
        {arret.statut === 'EN_ATTENTE' && (
          <button className="btn-valider" onClick={() => onValider(arret.id)}>
            <IconCheck color="#fff" /> Valider
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function TourneesPage() {
  const queryClient = useQueryClient();

  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const { data: tournees, isLoading: isLoadingTournees } = useTournees({ date });

  // ── Arrêts de chaque tournée, une query par tournée (useQueries, pas
  //    de hook dans une boucle .map()) ──
  const arretsQueries = useQueries({
    queries: (tournees ?? []).map(t => ({
      queryKey: ["arrets", "tournee", t.id],
      queryFn: () => getArretsByTournee(t.id),
      enabled: !!tournees,
    })),
  });

  // ── Valider un arrêt : appel serveur réel, puis invalide toutes les
  //    queries d'arrêts (plus simple/sûr que de retrouver la tournée
  //    précise contenant cet arrêt) ──
  const handleValider = async (arretId: number): Promise<void> => {
    try {
      await validerArret(arretId, 'COLLECTE_CONFIRMEE');
      await queryClient.invalidateQueries({ queryKey: ["arrets", "tournee"] });
    } catch (e) {
      console.error("BIDIWS — Erreur validation arrêt", e);
    }
  };

  if (isLoadingTournees) {
    return <LoadingSpinner />;
  }

  const tourneesListe = tournees ?? [];

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="tournees__header">
        <div>
          <h1 className="tournees__title">Tournées du jour</h1>
          <p className="tournees__subtitle">
            {tourneesListe.length} tournée{tourneesListe.length > 1 ? "s" : ""} planifiée{tourneesListe.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {tourneesListe.length === 0 && (
        <div style={{ padding: "24px 0", color: "var(--text-secondary)", fontSize: 13 }}>
          Aucune tournée programmée aujourd'hui.
        </div>
      )}

      {/* ── Tournées ── */}
      {tourneesListe.map((t, i) => {
        const arretsQuery    = arretsQueries[i];
        const arretsListe    = arretsQuery?.data ?? [];
        const isLoadingArret = arretsQuery?.isLoading ?? false;
        const done  = arretsListe.filter(a => a.statut === 'COLLECTE_CONFIRMEE').length;
        const total = arretsListe.length;
        return (
          <div key={t.id} className="tournee-card">
            {/* Header */}
            <div className="tournee-card__head">
              <div className="tournee-card__head-left">
                <div className="tournee-card__type">{t.typeCollecteLibelle}</div>
                <div className="tournee-card__meta">
                  <IconTruck color="#6b84a3" />
                  {t.chauffeurPrenom} {t.chauffeurNom}
                  &nbsp;·&nbsp; {t.camionImmatriculation}
                  {t.zoneNom && <>&nbsp;·&nbsp; {t.zoneNom}</>}
                </div>
              </div>
              <div className="tournee-card__head-right">
                <span style={{ fontSize: 13, color: "var(--signal)", fontWeight: 700 }}>
                  {done}/{total} arrêts
                </span>
                <Badge statut={t.statut} />
              </div>
            </div>

            {/* Arrêts */}
            {isLoadingArret && arretsListe.length === 0 ? (
              <div style={{ padding: "16px 22px", color: "var(--text-secondary)", fontSize: 13 }}>
                Chargement des arrêts…
              </div>
            ) : (
              arretsListe.map((arret, idx) => (
                <ArretItem
                  key={arret.id}
                  arret={arret}
                  index={idx}
                  onValider={handleValider}
                />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
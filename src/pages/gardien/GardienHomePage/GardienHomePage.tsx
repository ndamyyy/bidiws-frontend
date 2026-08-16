// ============================================================
// BIDIWS — GardienHomePage
// Fichier : src/pages/gardien/GardienHomePage/GardienHomePage.tsx
// ============================================================

import { JSX } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../hooks/useNotifications";
import { useResidencesGardien } from "../../../hooks/useResidences";
import { useTournee } from "../../../hooks/useTournees";
import { getArretsByResidence } from "../../../api/arrets.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import "./GardienHomePage.css";

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const formatHeure = (iso: string | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconCheck = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconClock = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconTruck = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconSmall = ({ name, color }: { name: string; color: string }) => {
  const icons: Record<string, JSX.Element> = {
    truck: <IconTruck color={color} />,
    user:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  };
  return icons[name] ?? null;
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function GardienHomePage() {
  const { utilisateur } = useAuth();
  const { notifications } = useNotifications();

  // ── Résidence(s) du gardien connecté ──
  const gardienId = utilisateur?.id;
  const { data: residencesGardien, isLoading: isLoadingResidences } =
    useResidencesGardien(gardienId);

  const residenceLien = residencesGardien?.find(r => r.principal) ?? residencesGardien?.[0];
  const residenceId   = residenceLien?.residenceId;

  // ── Arrêt "actuel" ──
  // Pas d'endpoint filtré par date côté backend, et Arret n'a pas de
  // date propre (elle vit sur la Tournee via tourneeId) : on prend le
  // plus récent par createdAt comme dernier statut connu. Ce n'est pas
  // une garantie que c'est l'arrêt "d'aujourd'hui", juste le plus
  // raisonnable en attendant un vrai filtre côté backend.
  const { data: arrets, isLoading: isLoadingArrets } = useQuery({
    queryKey: ["arrets", "residence", residenceId],
    queryFn: () => getArretsByResidence(residenceId as number),
    enabled: residenceId !== undefined,
  });

  const arretActuel = arrets
    ? [...arrets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    : undefined;

  // ── Tournée de l'arrêt actuel (type de collecte, chauffeur, camion) ──
  const { data: tournee, isLoading: isLoadingTournee } = useTournee(arretActuel?.tourneeId);

  // ── Notifications du gardien, scopées à cette résidence ──
  const mesNotifs = notifications.filter(n => n.residenceId === residenceId);

  // ── Statut de la collecte — basé sur l'arrêt, pas la dernière notif ──
  const isConfirmed  = arretActuel?.statut === 'COLLECTE_CONFIRMEE';
  const isApproching = arretActuel?.statut === 'EN_APPROCHE';

  const isChargement = isLoadingResidences || isLoadingArrets || isLoadingTournee;

  const heroClass = isConfirmed
    ? "gardien__hero--confirmed"
    : isApproching
    ? "gardien__hero--approaching"
    : "gardien__hero--waiting";

  const heroColor  = isConfirmed ? "#4caf50" : isApproching ? "#2196f3" : "#f59e0b";
  const heroBg     = isConfirmed
    ? "rgba(76,175,80,0.2)"
    : isApproching
    ? "rgba(33,150,243,0.2)"
    : "rgba(245,158,11,0.2)";

  if (isChargement) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="gardien__header">
        <h1 className="gardien__title">Ma résidence</h1>
        <p className="gardien__subtitle">
          {residenceLien?.residenceNom ?? "Résidence non assignée"}
        </p>
      </div>

      {/* ── Hero statut ── */}
      <div className={`gardien__hero ${heroClass}`}>
        <div className="gardien__hero-blob" style={{ background: heroColor }} />
        <div className="gardien__hero-content">
          <div
            className="gardien__hero-icon"
            style={{ background: heroBg, border: `1.5px solid ${heroColor}55` }}
          >
            {isConfirmed
              ? <IconCheck color={heroColor} />
              : <IconClock color={heroColor} />
            }
          </div>
          <div className="gardien__hero-text">
            <div className="gardien__hero-title">
              {isConfirmed
                ? "Collecte effectuée ✓"
                : isApproching
                ? "Camion en approche !"
                : "En attente du camion"
              }
            </div>
            <div className="gardien__hero-desc" style={{ color: heroColor }}>
              {isConfirmed
                ? "Vous pouvez rentrer les conteneurs maintenant."
                : isApproching
                ? "Le camion arrive dans environ 8 minutes. Préparez les bacs."
                : "Le camion n'est pas encore passé dans votre rue."
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Infos du jour ── */}
      <div className="gardien__info-grid">
        {[
          { label: "Type de collecte", value: tournee?.typeCollecte.libelle ?? "—", icon: "trash" },
          { label: "Chauffeur",        value: tournee ? `${tournee.chauffeur.prenom} ${tournee.chauffeur.nom}` : "—", icon: "user"  },
          { label: "Camion",           value: tournee?.camion.immatriculation ?? "—", icon: "truck" },
          { label: "Créneau estimé",   value: formatHeure(arretActuel?.heureEstimee), icon: "clock" },
        ].map(item => (
          <div key={item.label} className="info-card">
            <div className="info-card__icon">
              <IconSmall name={item.icon} color="#1b3a6b" />
            </div>
            <div>
              <div className="info-card__label">{item.label}</div>
              <div className="info-card__value">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Mes alertes ── */}
      <div className="gardien__alertes">
        <div className="gardien__alertes-header">Mes alertes récentes</div>
        {mesNotifs.length === 0 && (
          <div style={{ padding: "24px 22px", color: "#3d5166", fontSize: 13 }}>
            Aucune alerte pour le moment.
          </div>
        )}
        {mesNotifs.map(n => (
          <div key={n.id} className="alerte-item">
            <div
              className="alerte-item__icon"
              style={{
                background: n.type === 'COLLECTE_CONFIRMEE'
                  ? "rgba(76,175,80,0.15)"
                  : "rgba(33,150,243,0.15)",
                border: `1px solid ${n.type === 'COLLECTE_CONFIRMEE' ? "#4caf5044" : "#2196f344"}`,
              }}
            >
              <IconCheck color={n.type === 'COLLECTE_CONFIRMEE' ? "#4caf50" : "#2196f3"} />
            </div>
            <div className="alerte-item__msg">{n.message}</div>
            <div className="alerte-item__time">{n.heureEnvoi}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
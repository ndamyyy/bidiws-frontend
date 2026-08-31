// ============================================================
// BIDIWS — AdminSignalementsPage
// Fichier : src/pages/admin/AdminSignalementsPage/AdminSignalementsPage.tsx
// Liste complète + changement de statut — AdminDashboardPage n'affiche
// que les 5 derniers en lecture seule, cette page est la vue de
// gestion complète (updateStatutSignalement, jamais câblé jusqu'ici).
// ============================================================

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSignalementsByStatut } from "../../../hooks/useSignalements";
import { updateStatutSignalement } from "../../../api/signalements.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { AnimatedCard } from "../../../components/ui/AnimatedCard/AnimatedCard";
import type { ApiError, Signalement, StatutSignalement } from "../../../types";
import "./AdminSignalementsPage.css";

// ─────────────────────────────────────────
// ICÔNE
// ─────────────────────────────────────────

const IconAlert = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ─────────────────────────────────────────
// LIBELLÉS
// ─────────────────────────────────────────

const TYPE_SIGNALEMENT_LABEL: Record<string, string> = {
  BAC_PLEIN:      "Bac plein",
  DEPOT_SAUVAGE:  "Dépôt sauvage",
  BAC_ENDOMMAGE:  "Bac endommagé",
  BAC_NON_RENTRE: "Bac non rentré",
  AUTRE:          "Autre",
};

// Les 4 valeurs réelles de StatutSignalement (types/index.ts) — le
// contexte de cette tâche n'en citait que 3 (OUVERT/EN_TRAITEMENT/
// RESOLU), CLOS existe aussi et est inclus ici par cohérence avec le
// type réel plutôt qu'avec l'énoncé.
const STATUTS: StatutSignalement[] = ["OUVERT", "EN_TRAITEMENT", "RESOLU", "CLOS"];

const STATUT_LABEL: Record<StatutSignalement, string> = {
  OUVERT:        "Ouvert",
  EN_TRAITEMENT: "En traitement",
  RESOLU:        "Résolu",
  CLOS:          "Clos",
};

const STATUT_STYLE: Record<StatutSignalement, { bg: string; color: string }> = {
  OUVERT:        { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  EN_TRAITEMENT: { bg: "rgba(33,150,243,0.15)", color: "#2196f3" },
  RESOLU:        { bg: "rgba(76,175,80,0.15)",  color: "#4caf50" },
  CLOS:          { bg: "rgba(107,132,163,0.12)",color: "#6b84a3" },
};

// ─────────────────────────────────────────
// CARTE SIGNALEMENT
// ─────────────────────────────────────────

const SignalementCard = ({
  signalement,
  index,
  isPending,
  onChangeStatut,
}: {
  signalement  : Signalement;
  index         : number;
  isPending    : boolean;
  onChangeStatut: (id: number, statut: StatutSignalement) => void;
}) => {
  const style = STATUT_STYLE[signalement.statut] ?? STATUT_STYLE.OUVERT;
  const date = new Date(signalement.createdAt).toLocaleString("fr-FR", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <AnimatedCard className="admin-signalement-card" delay={index * 0.06} glow={false}>
      <div className="admin-signalement-card__top">
        <div className="admin-signalement-card__left">
          <div className="admin-signalement-card__icon" style={{ background: style.bg, border: `1px solid ${style.color}44` }}>
            <IconAlert color={style.color} />
          </div>
          <div>
            <div className="admin-signalement-card__type">
              {TYPE_SIGNALEMENT_LABEL[signalement.type] ?? signalement.type}
            </div>
            <div className="admin-signalement-card__meta">
              {signalement.residenceNom ?? "Résidence inconnue"}
              {(signalement.auteurPrenom || signalement.auteurNom) &&
                ` · ${signalement.auteurPrenom ?? ""} ${signalement.auteurNom ?? ""}`.trim()
              }
            </div>
          </div>
        </div>
      </div>

      {signalement.description && (
        <div className="admin-signalement-card__desc">{signalement.description}</div>
      )}

      {signalement.photoUrl && (
        <img className="admin-signalement-card__photo" src={signalement.photoUrl} alt="Photo du signalement" />
      )}

      <div className="admin-signalement-card__footer">
        <span className="admin-signalement-card__date">{date}</span>
        <select
          className="admin-signalement-card__statut-select"
          value={signalement.statut}
          onChange={(e) => onChangeStatut(signalement.id, e.target.value as StatutSignalement)}
          disabled={isPending}
          style={{ color: style.color, borderColor: `${style.color}55` }}
        >
          {STATUTS.map(s => (
            <option key={s} value={s}>{STATUT_LABEL[s]}</option>
          ))}
        </select>
      </div>
    </AnimatedCard>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function AdminSignalementsPage() {
  const queryClient = useQueryClient();

  // Un statut doit toujours être sélectionné — le backend n'a pas de
  // route "tous statuts confondus" (voir signalements.api.ts). OUVERT
  // par défaut : le statut le plus actionnable au chargement.
  const [filtreStatut, setFiltreStatut] = useState<StatutSignalement>("OUVERT");
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const { data: signalements, isLoading, isError, error } = useSignalementsByStatut(filtreStatut);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleChangeStatut = async (id: number, statut: StatutSignalement): Promise<void> => {
    setPendingIds(prev => new Set(prev).add(id));
    try {
      await updateStatutSignalement(id, statut);
      await queryClient.invalidateQueries({ queryKey: ["signalements"] });
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      console.error("BIDIWS — Erreur changement statut signalement", backendMessage ?? err);
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const signalementsListe = [...(signalements ?? [])].sort((a, b) => b.id - a.id);
  const backendMessage = isError && axios.isAxiosError<ApiError>(error) ? error.response?.data?.message : undefined;

  return (
    <div>
      <div className="admin-signalements__header">
        <h1 className="admin-signalements__title">Signalements</h1>
        <p className="admin-signalements__subtitle">
          {signalementsListe.length} signalement{signalementsListe.length > 1 ? "s" : ""} « {STATUT_LABEL[filtreStatut]} »
        </p>
      </div>

      <div className="admin-signalements__filters">
        {STATUTS.map(s => (
          <button
            key={s}
            className={`admin-signalements__filter-pill ${filtreStatut === s ? "admin-signalements__filter-pill--active" : ""}`}
            onClick={() => setFiltreStatut(s)}
          >
            {STATUT_LABEL[s]}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="admin-signalements__empty">
          {backendMessage ?? "Erreur lors du chargement des signalements."}
        </div>
      ) : signalementsListe.length === 0 ? (
        <div className="admin-signalements__empty">
          {`Aucun signalement avec le statut « ${STATUT_LABEL[filtreStatut]} ».`}
        </div>
      ) : (
        <div className="admin-signalements__list">
          {signalementsListe.map((s, i) => (
            <SignalementCard
              key={s.id}
              signalement={s}
              index={i}
              isPending={pendingIds.has(s.id)}
              onChangeStatut={handleChangeStatut}
            />
          ))}
        </div>
      )}
    </div>
  );
}

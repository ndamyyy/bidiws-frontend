// ============================================================
// BIDIWS — ResidencesPage (Syndic)
// Fichier : src/pages/syndic/ResidencesPage/ResidencesPage.tsx
// ============================================================

import { useState, type FormEvent }         from "react";
import { useQueries, useQueryClient }       from "@tanstack/react-query";
import axios                                from "axios";
import { useResidences }                    from "../../../hooks/useResidences";
import { useVilles }                        from "../../../hooks/useVilles";
import { useZones }                         from "../../../hooks/useZones";
import { getGardiensByResidence, createResidence, type ResidenceGardien } from "../../../api/residences.api";
import { getArretsByResidence }             from "../../../api/arrets.api";
import { LoadingSpinner }                   from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { StaggerContainer, StaggerItem }    from "../../../components/ui/StaggerContainer/StaggerContainer";
import type { Residence, Arret, ApiError }  from "../../../types";
import "./ResidencesPage.css";

// ─────────────────────────────────────────
// ICÔNES
// ─────────────────────────────────────────

const IconHome = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconCheck = ({ color }: { color: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────

const Badge = ({ statut }: { statut: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    COLLECTE_CONFIRMEE: { bg: "rgba(76,175,80,0.15)",  color: "#4caf50", label: "Collecté"   },
    EN_APPROCHE:        { bg: "rgba(33,150,243,0.15)", color: "#2196f3", label: "En approche"},
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
    }}>
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────
// CARTE RÉSIDENCE
// ─────────────────────────────────────────

const ResidenceCard = ({
  residence,
  gardien,
  arret,
}: {
  residence: Residence;
  gardien  : ResidenceGardien | undefined;
  arret    : Arret | undefined;
}) => {
  const initiales = gardien?.gardienPrenom && gardien?.gardienNom
    ? `${gardien.gardienPrenom[0]}${gardien.gardienNom[0]}`.toUpperCase()
    : "?";

  return (
    <div className="residence-card">
      <div className="residence-card__top">
        <div className="residence-card__icon">
          <IconHome color="#1b3a6b" />
        </div>
        <div className="residence-card__badges">
          {residence.zoneNom && (
            <span className="residence-card__secteur">{residence.zoneNom}</span>
          )}
          {arret && <Badge statut={arret.statut} />}
        </div>
      </div>

      <div className="residence-card__name">{residence.nom}</div>
      <div className="residence-card__addr">
        {residence.adresse}, {residence.codePostal} {residence.villeNom}
      </div>

      <hr className="residence-card__divider" />

      {gardien && (
        <div className="residence-card__gardien">
          <div className="residence-card__avatar">{initiales}</div>
          <div>
            <div className="residence-card__gardien-name">
              {gardien.gardienPrenom} {gardien.gardienNom}
            </div>
          </div>
        </div>
      )}

      {arret?.heureCollecte && (
        <div className="residence-card__collecte">
          <IconCheck color="#4caf50" />
          Collecté à {new Date(arret.heureCollecte).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// MODALE — AJOUTER UNE RÉSIDENCE
// ─────────────────────────────────────────

const AjouterResidenceModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { data: villes, isLoading: isLoadingVilles } = useVilles();
  const { data: zones,  isLoading: isLoadingZones }  = useZones();

  const [nom,            setNom]            = useState<string>("");
  const [adresse,        setAdresse]        = useState<string>("");
  const [complement,     setComplement]     = useState<string>("");
  const [codePostal,     setCodePostal]     = useState<string>("");
  const [villeId,        setVilleId]        = useState<string>("");
  const [zoneId,         setZoneId]         = useState<string>("");
  const [latitude,       setLatitude]       = useState<string>("");
  const [longitude,      setLongitude]      = useState<string>("");
  const [rayonDetection, setRayonDetection] = useState<string>("");

  const [error,        setError]        = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!nom || !adresse || !codePostal || !villeId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createResidence({
        nom,
        adresse,
        complement: complement || undefined,
        codePostal,
        villeId: Number(villeId),
        zoneId: zoneId ? Number(zoneId) : undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        rayonDetection: rayonDetection ? Number(rayonDetection) : 50,
      });
      await queryClient.invalidateQueries({ queryKey: ["residences"] });
      onClose();
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? "Erreur lors de la création de la résidence.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="residence-modal__backdrop" onClick={onClose}>
      <div className="residence-modal__card" onClick={(e) => e.stopPropagation()}>
        <div className="residence-modal__header">
          <h2 className="residence-modal__title">Ajouter une résidence</h2>
          <button className="residence-modal__close" onClick={onClose} title="Fermer">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="residence-modal__error">{error}</div>}

          <div className="residence-modal__grid">
            <div className="residence-modal__field residence-modal__field--full">
              <label className="residence-modal__label">Nom</label>
              <input
                className="residence-modal__input"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>

            <div className="residence-modal__field residence-modal__field--full">
              <label className="residence-modal__label">Adresse</label>
              <input
                className="residence-modal__input"
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
              />
            </div>

            <div className="residence-modal__field residence-modal__field--full">
              <label className="residence-modal__label">Complément (optionnel)</label>
              <input
                className="residence-modal__input"
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />
            </div>

            <div className="residence-modal__field">
              <label className="residence-modal__label">Code postal</label>
              <input
                className="residence-modal__input"
                type="text"
                value={codePostal}
                onChange={(e) => setCodePostal(e.target.value)}
              />
            </div>

            <div className="residence-modal__field">
              <label className="residence-modal__label">Ville</label>
              <select
                className="residence-modal__select"
                value={villeId}
                onChange={(e) => setVilleId(e.target.value)}
                disabled={isLoadingVilles}
              >
                <option value="">Sélectionner...</option>
                {villes?.map(v => (
                  <option key={v.id} value={v.id}>{v.nom}</option>
                ))}
              </select>
            </div>

            <div className="residence-modal__field">
              <label className="residence-modal__label">Zone (optionnel)</label>
              <select
                className="residence-modal__select"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                disabled={isLoadingZones}
              >
                <option value="">Aucune</option>
                {zones?.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.nom}{z.villeNom ? ` (${z.villeNom})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="residence-modal__field">
              <label className="residence-modal__label">Rayon détection (m)</label>
              <input
                className="residence-modal__input"
                type="number"
                placeholder="50"
                value={rayonDetection}
                onChange={(e) => setRayonDetection(e.target.value)}
              />
            </div>

            <div className="residence-modal__field">
              <label className="residence-modal__label">Latitude (optionnel)</label>
              <input
                className="residence-modal__input"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>

            <div className="residence-modal__field">
              <label className="residence-modal__label">Longitude (optionnel)</label>
              <input
                className="residence-modal__input"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <div className="residence-modal__actions">
            <button type="button" className="residence-modal__cancel" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="residence-modal__submit" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer la résidence"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function ResidencesPage() {
  const { data: residences, isLoading: isLoadingResidences } = useResidences();
  const residencesListe = residences ?? [];
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // ── Gardien(s) et arrêt le plus récent de chaque résidence ──
  const gardiensQueries = useQueries({
    queries: residencesListe.map(r => ({
      queryKey: ["residence-gardiens", "residence", r.id],
      queryFn: () => getGardiensByResidence(r.id),
      enabled: !!residences,
    })),
  });

  const arretsQueries = useQueries({
    queries: residencesListe.map(r => ({
      queryKey: ["arrets", "residence", r.id],
      queryFn: () => getArretsByResidence(r.id),
      enabled: !!residences,
    })),
  });

  if (isLoadingResidences) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="residences__header">
        <div>
          <h1 className="residences__title">Résidences</h1>
          <p className="residences__subtitle">
            {residencesListe.length} résidences enregistrées
          </p>
        </div>
        <button className="residences__add" onClick={() => setModalOpen(true)}>
          Ajouter une résidence
        </button>
      </div>

      {modalOpen && <AjouterResidenceModal onClose={() => setModalOpen(false)} />}

      <StaggerContainer className="residences__grid">
        {residencesListe.map((r, i) => {
          const gardiensListe = gardiensQueries[i]?.data ?? [];
          const gardien = gardiensListe.find(g => g.principal) ?? gardiensListe[0];

          // Arrêt "actuel" : le plus récent par id décroissant — pas un
          // vrai filtre par date, même logique pragmatique que
          // GardienHomePage (pas d'endpoint filtré côté backend).
          const arretsListe = arretsQueries[i]?.data ?? [];
          const arretActuel = arretsListe.length > 0
            ? [...arretsListe].sort((a, b) => b.id - a.id)[0]
            : undefined;

          return (
            <StaggerItem key={r.id}>
              <ResidenceCard residence={r} gardien={gardien} arret={arretActuel} />
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
// ============================================================
// BIDIWS — AdminAppareilsIotPage
// Fichier : src/pages/admin/AdminAppareilsIotPage/AdminAppareilsIotPage.tsx
// Gestion des capteurs de benne / lecteurs RFID : liste + création +
// désactivation + régénération de clé. Le rattachement (conteneur XOR
// camion, exactement un des deux) est un choix indépendant du
// typeAppareil — le backend n'impose aucun couplage entre les deux
// (AppareilIotService.appliquerRattachement).
// ============================================================

import { useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAppareilsIot } from "../../../hooks/useAppareilsIot";
import { useCamions } from "../../../hooks/useCamions";
import { useResidences } from "../../../hooks/useResidences";
import { useConteneursByResidence } from "../../../hooks/useConteneurs";
import {
  createAppareilIot,
  desactiverAppareilIot,
  regenererCleAppareilIot,
} from "../../../api/appareils-iot.api";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import type { ApiError, AppareilIot, AppareilIotCreeResponse, TypeAppareilIot } from "../../../types";
import "./AdminAppareilsIotPage.css";

// ─────────────────────────────────────────
// LIBELLÉS
// ─────────────────────────────────────────

const TYPE_LABEL: Record<TypeAppareilIot, string> = {
  CAPTEUR_BENNE: "Capteur de benne",
  LECTEUR_RFID:  "Lecteur RFID",
};

type Rattachement = "CONTENEUR" | "CAMION";

// ─────────────────────────────────────────
// ENCART CLÉ API — révélation unique
// ─────────────────────────────────────────

const CleApiReveal = ({
  cree,
  onClose,
}: {
  cree   : AppareilIotCreeResponse;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copyFailed, setCopyFailed] = useState<boolean>(false);
  const keyRef = useRef<HTMLDivElement>(null);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(cree.cleApi);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      // Copie automatique refusée par le navigateur (permissions) — on
      // sélectionne le texte pour que l'utilisateur puisse Ctrl+C
      // manuellement plutôt que de le laisser croire que ça a marché.
      setCopyFailed(true);
      const range = document.createRange();
      if (keyRef.current) {
        range.selectNodeContents(keyRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  return (
    <div className="admin-appareils-iot__reveal">
      <div className="admin-appareils-iot__reveal-title">
        Clé API générée pour « {cree.identifiantMateriel} »
      </div>
      <div className="admin-appareils-iot__reveal-warning">
        Cette clé ne sera plus jamais affichée — copiez-la maintenant et
        transmettez-la pour la configurer sur l'appareil physique.
      </div>
      <div className="admin-appareils-iot__reveal-key" ref={keyRef}>{cree.cleApi}</div>
      {copyFailed && (
        <div className="admin-appareils-iot__reveal-copy-error">
          Copie automatique impossible — la clé est sélectionnée ci-dessus, copiez-la avec Ctrl+C.
        </div>
      )}
      <div className="admin-appareils-iot__reveal-actions">
        <button
          className="admin-appareils-iot__reveal-copy"
          onClick={handleCopy}
          aria-label={copied ? "Clé API copiée" : "Copier la clé API"}
        >
          {copied ? "Copiée ✓" : "Copier"}
        </button>
        <button className="admin-appareils-iot__reveal-close" onClick={onClose}>
          J'ai copié la clé, fermer
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// LIGNE APPAREIL
// ─────────────────────────────────────────

const AppareilRow = ({
  appareil,
  isPending,
  onDesactiver,
  onRegenererCle,
}: {
  appareil      : AppareilIot;
  isPending     : boolean;
  onDesactiver  : (id: number) => void;
  onRegenererCle: (id: number) => void;
}) => {
  const rattachement = appareil.conteneurId
    ? `Conteneur ${appareil.conteneurCode}`
    : appareil.camionId
      ? `Camion ${appareil.camionImmatriculation}`
      : "Aucun rattachement";

  return (
    <div className="admin-appareil-iot-row">
      <div className="admin-appareil-iot-row__info">
        <div className="admin-appareil-iot-row__id">{appareil.identifiantMateriel}</div>
        <div className="admin-appareil-iot-row__meta">
          {TYPE_LABEL[appareil.typeAppareil]} · {rattachement}
        </div>
      </div>

      <div className="admin-appareil-iot-row__right">
        <span
          className={`admin-appareil-iot-row__statut ${
            appareil.actif ? "admin-appareil-iot-row__statut--actif" : "admin-appareil-iot-row__statut--inactif"
          }`}
        >
          {appareil.actif ? "Actif" : "Inactif"}
        </span>

        <button
          className="admin-appareil-iot-row__action admin-appareil-iot-row__action--regenerer"
          onClick={() => onRegenererCle(appareil.id)}
          disabled={isPending}
        >
          {isPending ? "…" : "Régénérer la clé"}
        </button>

        {appareil.actif && (
          <button
            className="admin-appareil-iot-row__action admin-appareil-iot-row__action--desactiver"
            onClick={() => onDesactiver(appareil.id)}
            disabled={isPending}
          >
            {isPending ? "…" : "Désactiver"}
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────

export default function AdminAppareilsIotPage() {
  const queryClient = useQueryClient();

  const { data: appareils, isLoading } = useAppareilsIot();
  const { data: camions, isLoading: isLoadingCamions } = useCamions();
  const { data: residences, isLoading: isLoadingResidences } = useResidences();

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [identifiantMateriel, setIdentifiantMateriel] = useState<string>("");
  const [typeAppareil, setTypeAppareil] = useState<TypeAppareilIot>("CAPTEUR_BENNE");
  const [rattachement, setRattachement] = useState<Rattachement>("CONTENEUR");
  const [residenceId, setResidenceId] = useState<string>("");
  const [conteneurId, setConteneurId] = useState<string>("");
  const [camionId, setCamionId] = useState<string>("");
  const [createError, setCreateError] = useState<string>("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  const { data: conteneurs, isLoading: isLoadingConteneurs } = useConteneursByResidence(
    residenceId ? Number(residenceId) : undefined
  );

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [reveal, setReveal] = useState<AppareilIotCreeResponse | null>(null);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const resetForm = (): void => {
    setIdentifiantMateriel("");
    setTypeAppareil("CAPTEUR_BENNE");
    setRattachement("CONTENEUR");
    setResidenceId("");
    setConteneurId("");
    setCamionId("");
  };

  const handleCreateSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setCreateError("");

    if (!identifiantMateriel.trim()) {
      setCreateError("L'identifiant matériel est obligatoire.");
      return;
    }
    if (rattachement === "CONTENEUR" && !conteneurId) {
      setCreateError("Veuillez sélectionner un conteneur.");
      return;
    }
    if (rattachement === "CAMION" && !camionId) {
      setCreateError("Veuillez sélectionner un camion.");
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const cree = await createAppareilIot({
        identifiantMateriel: identifiantMateriel.trim(),
        typeAppareil,
        conteneurId: rattachement === "CONTENEUR" ? Number(conteneurId) : undefined,
        camionId: rattachement === "CAMION" ? Number(camionId) : undefined,
      });
      setReveal(cree);
      resetForm();
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["appareils-iot"] });
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setCreateError(backendMessage ?? "Erreur lors de la création de l'appareil.");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleDesactiver = async (id: number): Promise<void> => {
    setPendingIds(prev => new Set(prev).add(id));
    try {
      await desactiverAppareilIot(id);
      await queryClient.invalidateQueries({ queryKey: ["appareils-iot"] });
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      console.error("BIDIWS — Erreur désactivation appareil IoT", backendMessage ?? err);
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRegenererCle = async (id: number): Promise<void> => {
    setPendingIds(prev => new Set(prev).add(id));
    try {
      const cree = await regenererCleAppareilIot(id);
      setReveal(cree);
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      console.error("BIDIWS — Erreur régénération clé appareil IoT", backendMessage ?? err);
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const appareilsListe = [...(appareils ?? [])].sort((a, b) => b.id - a.id);

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="admin-appareils-iot__header">
        <div>
          <h1 className="admin-appareils-iot__title">Appareils IoT</h1>
          <p className="admin-appareils-iot__subtitle">
            {appareilsListe.length} appareil{appareilsListe.length > 1 ? "s" : ""} enregistré
            {appareilsListe.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Encart clé API (révélation unique) ── */}
      {reveal && <CleApiReveal cree={reveal} onClose={() => setReveal(null)} />}

      {/* ── Création (accordéon) ── */}
      <div className="admin-appareils-iot__create">
        <button className="admin-appareils-iot__create-toggle" onClick={() => setCreateOpen(o => !o)}>
          Créer un appareil
        </button>

        {createOpen && (
          <div className="admin-appareils-iot__create-body">
            <form onSubmit={handleCreateSubmit}>
              {createError && <div className="admin-appareils-iot__error">{createError}</div>}

              <div className="admin-appareils-iot__grid">
                <div className="admin-appareils-iot__field">
                  <label className="admin-appareils-iot__label">Identifiant matériel</label>
                  <input
                    className="admin-appareils-iot__input"
                    type="text"
                    value={identifiantMateriel}
                    onChange={(e) => setIdentifiantMateriel(e.target.value)}
                    placeholder="Ex. CAPT-RESID12-001"
                  />
                </div>

                <div className="admin-appareils-iot__field">
                  <label className="admin-appareils-iot__label">Type d'appareil</label>
                  <select
                    className="admin-appareils-iot__select"
                    value={typeAppareil}
                    onChange={(e) => setTypeAppareil(e.target.value as TypeAppareilIot)}
                  >
                    <option value="CAPTEUR_BENNE">Capteur de benne</option>
                    <option value="LECTEUR_RFID">Lecteur RFID</option>
                  </select>
                </div>

                <div className="admin-appareils-iot__field">
                  <label className="admin-appareils-iot__label">Rattachement</label>
                  <select
                    className="admin-appareils-iot__select"
                    value={rattachement}
                    onChange={(e) => {
                      setRattachement(e.target.value as Rattachement);
                      setResidenceId("");
                      setConteneurId("");
                      setCamionId("");
                    }}
                  >
                    <option value="CONTENEUR">Conteneur</option>
                    <option value="CAMION">Camion</option>
                  </select>
                </div>

                {rattachement === "CONTENEUR" && (
                  <>
                    <div className="admin-appareils-iot__field">
                      <label className="admin-appareils-iot__label">Résidence</label>
                      <select
                        className="admin-appareils-iot__select"
                        value={residenceId}
                        onChange={(e) => {
                          setResidenceId(e.target.value);
                          setConteneurId("");
                        }}
                        disabled={isLoadingResidences}
                      >
                        <option value="">Sélectionner...</option>
                        {residences?.map(r => (
                          <option key={r.id} value={r.id}>{r.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-appareils-iot__field">
                      <label className="admin-appareils-iot__label">Conteneur</label>
                      <select
                        className="admin-appareils-iot__select"
                        value={conteneurId}
                        onChange={(e) => setConteneurId(e.target.value)}
                        disabled={!residenceId || isLoadingConteneurs}
                      >
                        <option value="">
                          {residenceId ? "Sélectionner..." : "Choisir une résidence d'abord"}
                        </option>
                        {conteneurs?.map(c => (
                          <option key={c.id} value={c.id}>{c.code}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {rattachement === "CAMION" && (
                  <div className="admin-appareils-iot__field">
                    <label className="admin-appareils-iot__label">Camion</label>
                    <select
                      className="admin-appareils-iot__select"
                      value={camionId}
                      onChange={(e) => setCamionId(e.target.value)}
                      disabled={isLoadingCamions}
                    >
                      <option value="">Sélectionner...</option>
                      {camions?.map(c => (
                        <option key={c.id} value={c.id}>{c.immatriculation}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button className="admin-appareils-iot__submit" type="submit" disabled={isSubmittingCreate}>
                {isSubmittingCreate ? "Création..." : "Créer l'appareil"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Liste ── */}
      {appareilsListe.length === 0 ? (
        <div className="admin-appareils-iot__list-empty">Aucun appareil enregistré.</div>
      ) : (
        <div className="admin-appareils-iot__list">
          {appareilsListe.map(a => (
            <AppareilRow
              key={a.id}
              appareil={a}
              isPending={pendingIds.has(a.id)}
              onDesactiver={handleDesactiver}
              onRegenererCle={handleRegenererCle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

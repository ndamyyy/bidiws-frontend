// ============================================================
// BIDIWS — SignalementForm
// Fichier : src/components/SignalementForm/SignalementForm.tsx
// Formulaire modal réutilisable (gardien + habitant) pour signaler un
// problème sur une résidence. residenceId est fourni par la page
// appelante (résidence du gardien/habitant connecté), pas de sélecteur.
// ============================================================

import { useState, type FormEvent } from "react";
import axios from "axios";
import { createSignalement } from "../../api/signalements.api";
import type { ApiError, TypeSignalement } from "../../types";
import "./SignalementForm.css";

const TYPE_LABEL: Record<TypeSignalement, string> = {
  BAC_PLEIN:      "Bac plein",
  DEPOT_SAUVAGE:  "Dépôt sauvage",
  BAC_ENDOMMAGE:  "Bac endommagé",
  BAC_NON_RENTRE: "Bac non rentré",
  AUTRE:          "Autre",
};

const TYPES: TypeSignalement[] = ["BAC_PLEIN", "DEPOT_SAUVAGE", "BAC_ENDOMMAGE", "BAC_NON_RENTRE", "AUTRE"];

export default function SignalementForm({
  residenceId,
  onClose,
}: {
  residenceId?: number;
  onClose     : () => void;
}) {
  const [type, setType] = useState<TypeSignalement | "">("");
  const [description, setDescription] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [succes, setSucces] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!type) {
      setError("Veuillez sélectionner un type de problème.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSignalement({
        residenceId,
        type,
        description: description.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
      });
      setSucces(true);
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? "Erreur lors de l'envoi du signalement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signalement-modal__backdrop" onClick={onClose}>
      <div className="signalement-modal__card" onClick={(e) => e.stopPropagation()}>
        <div className="signalement-modal__header">
          <h2 className="signalement-modal__title">Signaler un problème</h2>
          <button className="signalement-modal__close" onClick={onClose} title="Fermer">×</button>
        </div>

        {succes ? (
          <div>
            <div className="signalement-modal__succes">
              Votre signalement a bien été envoyé. Merci !
            </div>
            <div className="signalement-modal__actions">
              <button className="signalement-modal__submit" onClick={onClose}>Fermer</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="signalement-modal__error">{error}</div>}

            <div className="signalement-modal__field">
              <label className="signalement-modal__label">Type de problème</label>
              <select
                className="signalement-modal__select"
                value={type}
                onChange={(e) => setType(e.target.value as TypeSignalement)}
              >
                <option value="">Sélectionner...</option>
                {TYPES.map(t => (
                  <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>

            <div className="signalement-modal__field">
              <label className="signalement-modal__label">Description (optionnel)</label>
              <textarea
                className="signalement-modal__textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le problème..."
                rows={3}
              />
            </div>

            <div className="signalement-modal__field">
              <label className="signalement-modal__label">Photo — URL (optionnel)</label>
              <input
                className="signalement-modal__input"
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="signalement-modal__actions">
              <button type="button" className="signalement-modal__cancel" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="signalement-modal__submit" disabled={isSubmitting}>
                {isSubmitting ? "Envoi..." : "Envoyer le signalement"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================
// BIDIWS — SignalementForm
// Fichier : src/components/SignalementForm/SignalementForm.tsx
// Formulaire modal réutilisable (gardien + habitant) pour signaler un
// problème sur une résidence. residenceId est fourni par la page
// appelante (résidence du gardien/habitant connecté), pas de sélecteur.
// Photo : upload réel vers POST /uploads, envoyé avant la soumission du
// signalement — plus de champ URL en texte libre. Un seul input file
// (accept="image/*", sans capture) : laisse le choix natif caméra/
// galerie/fichier plutôt que deux boutons séparés.
// ============================================================

import { useEffect, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import { createSignalement } from "../../api/signalements.api";
import { uploadPhoto } from "../../api/uploads.api";
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
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [succes, setSucces] = useState<boolean>(false);

  // ── Photo : aperçu local + upload réel avant soumission ──
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  // Révoque l'URL d'objet locale quand elle change ou au démontage —
  // sinon elle reste en mémoire tant que la page vit.
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const lancerUpload = async (file: File): Promise<void> => {
    setPhotoError("");
    setIsUploadingPhoto(true);
    try {
      const url = await uploadPhoto(file);
      setUploadedPhotoUrl(url);
    } catch (err) {
      const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
      setPhotoError(backendMessage ?? "Erreur lors de l'envoi de la photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de resélectionner le même fichier après un retrait
    if (!file) return;

    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setSelectedFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setUploadedPhotoUrl(null);
    void lancerUpload(file);
  };

  const handleRetirerPhoto = (): void => {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setSelectedFile(null);
    setPhotoPreviewUrl(null);
    setUploadedPhotoUrl(null);
    setPhotoError("");
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!type) {
      setError("Veuillez sélectionner un type de problème.");
      return;
    }
    if (selectedFile && isUploadingPhoto) {
      setError("Veuillez attendre la fin de l'envoi de la photo.");
      return;
    }
    if (selectedFile && !uploadedPhotoUrl) {
      setError("L'envoi de la photo a échoué — réessayez ou retirez-la avant d'envoyer le signalement.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSignalement({
        residenceId,
        type,
        description: description.trim() || undefined,
        photoUrl: uploadedPhotoUrl ?? undefined,
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
              <label className="signalement-modal__label">Photo (optionnel)</label>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />

              {photoPreviewUrl ? (
                <div className="signalement-modal__photo-preview">
                  <img src={photoPreviewUrl} alt="Aperçu de la photo" />
                  <div className="signalement-modal__photo-status">
                    {isUploadingPhoto && <span className="signalement-modal__photo-uploading">Envoi en cours...</span>}
                    {!isUploadingPhoto && uploadedPhotoUrl && <span className="signalement-modal__photo-ok">Photo envoyée ✓</span>}
                    {!isUploadingPhoto && photoError && <span className="signalement-modal__photo-error">{photoError}</span>}
                    <button type="button" className="signalement-modal__photo-remove" onClick={handleRetirerPhoto}>
                      Retirer
                    </button>
                  </div>
                  {photoError && !isUploadingPhoto && (
                    <button
                      type="button"
                      className="signalement-modal__photo-retry"
                      onClick={() => selectedFile && void lancerUpload(selectedFile)}
                    >
                      Réessayer l'envoi
                    </button>
                  )}
                </div>
              ) : (
                <button type="button" className="signalement-modal__photo-btn" onClick={() => photoInputRef.current?.click()}>
                  Importer une photo
                </button>
              )}
            </div>

            <div className="signalement-modal__actions">
              <button type="button" className="signalement-modal__cancel" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="signalement-modal__submit" disabled={isSubmitting || isUploadingPhoto}>
                {isSubmitting ? "Envoi..." : "Envoyer le signalement"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

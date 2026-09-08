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
import { uploadPhoto } from "../../api/uploads.api";
import { createSignalementOffline, OfflineQueuedError } from "../../utils/offlineQueue";
import { Modal } from "../ui/Modal/Modal";
import { Button } from "../ui/Button/Button";
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
  // Mis en file faute de réseau — distinct de succes : message différent,
  // mais même écran de fin (l'action est prise en charge, pas perdue).
  const [queued, setQueued] = useState<boolean>(false);

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
      await createSignalementOffline({
        residenceId,
        type,
        description: description.trim() || undefined,
        photoUrl: uploadedPhotoUrl ?? undefined,
      });
      setSucces(true);
    } catch (err) {
      if (err instanceof OfflineQueuedError) {
        setQueued(true);
      } else {
        const backendMessage = axios.isAxiosError<ApiError>(err) ? err.response?.data?.message : undefined;
        setError(backendMessage ?? "Erreur lors de l'envoi du signalement.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Signaler un problème">
        {succes || queued ? (
          <div>
            <div className="signalement-modal__succes">
              {succes
                ? "Votre signalement a bien été envoyé. Merci !"
                : "Pas de réseau — votre signalement sera envoyé automatiquement dès que la connexion revient."
              }
            </div>
            <div className="signalement-modal__actions">
              <Button variant="primary" onClick={onClose}>Fermer</Button>
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
                    <Button type="button" variant="danger" size="sm" onClick={handleRetirerPhoto}>
                      Retirer
                    </Button>
                  </div>
                  {photoError && !isUploadingPhoto && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => selectedFile && void lancerUpload(selectedFile)}
                    >
                      Réessayer l'envoi
                    </Button>
                  )}
                </div>
              ) : (
                <Button type="button" variant="secondary" fullWidth onClick={() => photoInputRef.current?.click()}>
                  Importer une photo
                </Button>
              )}
            </div>

            <div className="signalement-modal__actions">
              <Button type="button" variant="secondary" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={isUploadingPhoto}>
                {isSubmitting ? "Envoi..." : "Envoyer le signalement"}
              </Button>
            </div>
          </form>
        )}
    </Modal>
  );
}

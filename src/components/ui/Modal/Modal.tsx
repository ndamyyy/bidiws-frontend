// ============================================================
// BIDIWS — Modal
// Fichier : src/components/ui/Modal/Modal.tsx
// ============================================================
//
// Repris de SignalementForm (.signalement-modal__backdrop/__card),
// le modal construit à la main le plus complet du projet : overlay
// plein écran + carte centrée, fermeture au clic sur le fond (avec
// stopPropagation sur la carte pour ne pas fermer au clic dedans).
// Pas de prop isOpen : comme SignalementForm/ResidencesPage, le
// parent monte/démonte Modal lui-même ({open && <Modal>…</Modal>}) —
// c'est déjà le pattern de tout le projet, pas la peine d'en imposer
// un autre.
//
// Ajout par rapport à l'existant (demandé) : fermeture au clavier sur
// Échap, absente de SignalementForm aujourd'hui.

import { useEffect } from "react";
import type { ReactNode } from "react";
import "./Modal.css";

export interface ModalProps {
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Zone d'actions en bas (boutons Annuler/Confirmer…). */
  footer?: ReactNode;
  /** Largeur max de la carte — défaut aligné sur .signalement-modal__card. */
  maxWidth?: number;
}

export function Modal({ onClose, title, children, footer, maxWidth = 480 }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="ui-modal__backdrop" onClick={onClose}>
      <div
        className="ui-modal__card"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && (
          <div className="ui-modal__header">
            <h2 className="ui-modal__title">{title}</h2>
            <button className="ui-modal__close" onClick={onClose} title="Fermer" aria-label="Fermer">
              ×
            </button>
          </div>
        )}

        <div className="ui-modal__body">{children}</div>

        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

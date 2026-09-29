// src/components/ui/LoadingSpinner/LoadingSpinner.tsx
import { motion } from "framer-motion";
import { Spinner } from "../Spinner/Spinner";
import "./LoadingSpinner.css";

// Fallback de route/Suspense pleine page — l'anneau lui-même vient de
// Spinner (primitive réutilisable, voir components/ui/Spinner) plutôt
// que d'être redessiné ici ; LoadingSpinner n'ajoute que la mise en
// page pleine page + le texte, inchangés pour les appelants existants.
export const LoadingSpinner = () => {
  return (
    <motion.div
      className="loading-spinner"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <div className="loading-spinner__container">
        <Spinner size="lg" />
        <motion.p
          className="loading-spinner__text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Chargement...
        </motion.p>
      </div>
    </motion.div>
  );
};
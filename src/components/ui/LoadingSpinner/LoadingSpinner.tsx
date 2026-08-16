// src/components/ui/LoadingSpinner/LoadingSpinner.tsx
import { motion } from "framer-motion";
import "./LoadingSpinner.css";

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
        <div className="loading-spinner__ring">
          <div className="loading-spinner__ring-inner"></div>
        </div>
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
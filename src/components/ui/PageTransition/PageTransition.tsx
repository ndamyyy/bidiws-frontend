// ============================================================
// BIDIWS — PageTransition
// Fichier : src/components/ui/PageTransition/PageTransition.tsx
// ============================================================

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// ─────────────────────────────────────────
// TRANSITION
// Mêmes tokens que --t-fast/--ease-smooth (styles/index.css), déjà
// utilisés par .animate-fade-scale (SplashScreen) — cohérence de
// timing entre animations CSS et Framer Motion du projet.
// ─────────────────────────────────────────

const TRANSITION = { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={TRANSITION}
    >
      {children}
    </motion.div>
  );
}

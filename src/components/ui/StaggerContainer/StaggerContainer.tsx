// src/components/ui/StaggerContainer/StaggerContainer.tsx
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.06,
  delayChildren = 0.1,
}: StaggerContainerProps) => {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
        exit: {
          opacity: 0,
          transition: {
            staggerChildren: 0.03,
            staggerDirection: -1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// ── Item pour StaggerContainer ──
export const StaggerItem = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        initial: {
          opacity: 0,
          y: 16,
        },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 350,
            damping: 30,
          },
        },
        exit: {
          opacity: 0,
          y: -10,
          transition: {
            duration: 0.15,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
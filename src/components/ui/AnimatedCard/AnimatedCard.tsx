// src/components/ui/AnimatedCard/AnimatedCard.tsx
import { motion } from "framer-motion";
import { ReactNode } from "react";
import "./AnimatedCard.css";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  hoverScale?: number;
  glow?: boolean;
}

export const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
  onClick,
  hoverScale = 1.02,
  glow = true,
}: AnimatedCardProps) => {
  return (
    <motion.div
      className={`animated-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
        delay,
        duration: 0.4,
      }}
      whileHover={{
        y: -4,
        scale: hoverScale,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25,
        },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        boxShadow: glow ? "var(--shadow-glow)" : "none",
      }}
    >
      {children}
    </motion.div>
  );
};
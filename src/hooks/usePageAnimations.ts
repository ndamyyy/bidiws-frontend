// src/hooks/usePageAnimation.ts
import { useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export const usePageAnimation = () => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: "0px 0px -100px 0px",
  });

  useEffect(() => {
    if (isInView) {
      controls.start("animate");
    }
  }, [controls, isInView]);

  return { controls, ref, isInView };
};

// ── Pour les animations au scroll ──
export const useScrollAnimation = (delay: number = 0) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.15,
    margin: "0px 0px -80px 0px",
  });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        controls.start("animate");
      }, delay);
    }
  }, [controls, isInView, delay]);

  return { controls, ref, isInView };
};
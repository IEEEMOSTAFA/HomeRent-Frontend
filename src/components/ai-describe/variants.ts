// ─────────────────────────────────────────────────────────────────────────────
// Framer Motion Variants — RentHome landing page
// ─────────────────────────────────────────────────────────────────────────────
import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.5, delay: i * 0.09, ease: "easeOut" },
  }),
};

export const slideRight: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: (i: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};
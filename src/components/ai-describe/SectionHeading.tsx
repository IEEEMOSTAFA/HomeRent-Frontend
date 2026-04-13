"use client";

import { motion } from "framer-motion";
import { fadeUp } from "./variants";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="text-center mb-14"
    >
      <motion.p variants={fadeUp} custom={0}
        className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-400 uppercase tracking-widest mb-3"
      >
        <span className="inline-block w-5 h-px bg-emerald-500" />
        {eyebrow}
        <span className="inline-block w-5 h-px bg-emerald-500" />
      </motion.p>
      <motion.h2 variants={fadeUp} custom={1}
        className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} custom={2}
          className="text-white/45 text-base max-w-2xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
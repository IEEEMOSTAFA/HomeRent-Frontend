"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { scaleIn } from "./variants";
import type { FeatureBlock as FeatureBlockType } from "./types";

interface FeatureBlockProps {
  feature: FeatureBlockType;
  index: number;
}

export function FeatureBlock({ feature, index }: FeatureBlockProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative rounded-xl border ${feature.color} bg-white/3 p-5 overflow-hidden`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
          {feature.icon}
        </div>
        <h3 className="text-white font-bold text-sm leading-tight pt-1">{feature.title}</h3>
      </div>
      <p className="text-white/45 text-[12.5px] leading-relaxed mb-3">{feature.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {feature.tags.map((tag) => (
          <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
            {tag}
          </span>
        ))}
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-emerald-500/60 to-transparent"
        initial={{ width: 0 }}
        animate={{ width: hovered ? "100%" : 0 }}
        transition={{ duration: 0.35 }}
      />
    </motion.div>
  );
}
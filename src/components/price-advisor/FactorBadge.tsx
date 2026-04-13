"use client";

import { motion } from "framer-motion";
import type { FactorItem } from "./types";

interface Props {
  factor: FactorItem;
  index: number;
}

export default function FactorBadge({ factor, index }: Props) {
  const impactColor = { high: "text-rose-400", medium: "text-amber-400", low: "text-slate-400" };
  const directionIcon = { positive: "↑", negative: "↓", neutral: "→" };
  const directionColor = { positive: "text-emerald-400", negative: "text-rose-400", neutral: "text-slate-400" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 80 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-emerald-500/30 transition-colors group"
    >
      <span className={`text-lg font-bold mt-0.5 ${directionColor[factor.direction]}`}>
        {directionIcon[factor.direction]}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-100">{factor.label}</span>
          <span className={`text-xs font-mono uppercase ${impactColor[factor.impact]}`}>
            {factor.impact}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{factor.description}</p>
      </div>
    </motion.div>
  );
}
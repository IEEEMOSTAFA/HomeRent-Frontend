"use client";

import { motion } from "framer-motion";
import { slideRight } from "./variants";
import { ACTOR_COLORS } from "./data";
import type { WorkflowStep } from "./types";

interface WorkflowItemProps {
  step: WorkflowStep;
  index: number;
  total: number;
}

export function WorkflowItem({ step, index, total }: WorkflowItemProps) {
  const isLast = index === total - 1;
  return (
    <motion.div
      variants={slideRight}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="flex gap-4 group"
    >
      {/* Line + number */}
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.15 }}
          className="w-8 h-8 rounded-full border border-emerald-700/50 bg-emerald-950/60 flex items-center justify-center text-emerald-400 text-[11px] font-bold z-10"
        >
          {String(index + 1).padStart(2, "0")}
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
            style={{ originY: 0 }}
            className="w-px flex-1 bg-gradient-to-b from-emerald-700/40 to-transparent mt-1 min-h-[32px]"
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-8 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${ACTOR_COLORS[step.actor]}`}>
            {step.actor}
          </span>
          <span className="text-white font-semibold text-sm">{step.action}</span>
        </div>
        <p className="text-white/45 text-[13px] leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}
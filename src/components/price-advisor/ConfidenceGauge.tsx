"use client";

import { motion } from "framer-motion";

interface Props {
  value: number;
}

export default function ConfidenceGauge({ value }: Props) {
  const angle = -135 + (value / 100) * 270;
  return (
    <div className="relative w-36 h-20 mx-auto">
      <svg viewBox="0 0 144 80" className="w-full h-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path d="M 12 76 A 60 60 0 0 1 132 76" stroke="#1e293b" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 12 76 A 60 60 0 0 1 132 76" stroke="url(#gaugeGrad)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${(value / 100) * 188} 188`} />
        <motion.line
          x1="72" y1="76" x2="72" y2="20"
          stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round"
          style={{ transformOrigin: "72px 76px" }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 60, damping: 12 }}
        />
        <circle cx="72" cy="76" r="5" fill="#f8fafc" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-white font-mono"
        >
          {value}%
        </motion.span>
      </div>
    </div>
  );
}
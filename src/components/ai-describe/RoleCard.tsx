"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { scaleIn } from "./variants";
import type { RoleCard as RoleCardType } from "./types";

interface RoleCardProps {
  role: RoleCardType;
  index: number;
}

export function RoleCard({ role, index }: RoleCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative rounded-2xl border ${role.borderColor} bg-gradient-to-br ${role.color} p-6 overflow-hidden backdrop-blur-sm`}
    >
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${role.glowColor} blur-3xl pointer-events-none transition-opacity duration-500`}
        style={{ opacity: hovered ? 0.8 : 0.3 }}
      />

      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0 text-white/80">
          {role.icon}
        </div>
        <div>
          <span className={`inline-block text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border mb-1.5 ${role.badgeColor}`}>
            {role.role}
          </span>
          <p className="text-white/50 text-xs">{role.tagline}</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2.5">Capabilities</p>
        <ul className="space-y-2">
          {role.capabilities.map((cap, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="flex items-start gap-2 text-[12.5px] text-white/65 leading-snug"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              {cap}
            </motion.li>
          ))}
        </ul>
      </div>

      <Separator className="bg-white/8 mb-4" />

      <div>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2.5">Key APIs</p>
        <div className="flex flex-wrap gap-1.5">
          {role.apis.map((api, i) => (
            <span key={i} className="text-[10px] font-mono bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-white/50">
              {api}
            </span>
          ))}
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"
        initial={{ width: 0 }}
        animate={{ width: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.div>
  );
}
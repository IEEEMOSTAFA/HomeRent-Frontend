"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "./types";
import { TYPE_CONFIG } from "./config";
import { timeAgo } from "./helpers";
import { Badge } from "../ui/badge";
import { useRipple } from "./useRipple";
// import { useRipple } from "./useRipple";

const rowVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(3px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 300, damping: 28, delay: i * 0.035 },
  }),
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } },
};

interface Props {
  n: Notification;
  index: number;
}

export function NotifRow({ n, index }: Props) {
  const reduced = useReducedMotion();
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
  const { Icon } = cfg;
  const { ref, fire } = useRipple();

  const inner = (
    <div
      ref={ref}
      onClick={fire}
      className={cn(
        "group flex items-start gap-3 px-4 py-4 transition-colors duration-150 cursor-pointer",
        "hover:bg-muted/40 border-l-2 border-l-transparent",
        !n.isRead && [cfg.activeBg, cfg.activeBorder]
      )}
    >
      {/* Icon avatar */}
      <div className={cn("flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5", cfg.iconBg)}>
        <Icon size={15} className={cfg.iconColor} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className={cn(
            "text-[13px] leading-snug truncate",
            !n.isRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
          )}>
            {n.title}
          </p>
          {!n.isRead && (
            <motion.span
              initial={reduced ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              className={cn("inline-block w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)}
            />
          )}
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
          {n.message}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Badge
            variant="outline"
            className={cn("text-[10px] px-2 py-0 h-4 rounded font-normal border", cfg.badgeCls)}
          >
            {cfg.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground/40">·</span>
          <span className="text-[10px] text-muted-foreground/55">{timeAgo(n.createdAt)}</span>
        </div>
      </div>

      {n.actionUrl && (
        <ChevronRight
          size={13}
          className="flex-shrink-0 self-center text-muted-foreground/25 group-hover:text-muted-foreground/60 transition-colors mt-0.5"
        />
      )}
    </div>
  );

  return (
    <motion.div
      layout
      key={n.id}
      custom={index}
      variants={reduced ? {} : rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {n.actionUrl ? <Link href={n.actionUrl}>{inner}</Link> : inner}
    </motion.div>
  );
}
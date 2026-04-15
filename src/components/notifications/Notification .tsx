"use client";
// src/components/notifications/notification.tsx
// ─────────────────────────────────────────────────────────────────────────────
// এই ফাইলে সব sub-components আছে যেগুলো page.tsx import করবে।
// Animation stack: Framer Motion + React Spring + GSAP + AOS
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Lucide Icons
import {
  Bell,
  BellOff,
  CheckCheck,
  Home,
  CreditCard,
  Star,
  Settings,
  ChevronRight,
  Sparkles,
  Inbox,
  Circle,
  Clock,
} from "lucide-react";

// shadcn/ui
import { Button }   from "@/components/ui/button";
import { Badge }    from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn }       from "@/lib/utils";

// Framer Motion
import { motion, AnimatePresence, useInView } from "framer-motion";

// React Spring
import { useSpring as useRSpring, animated, config as rsConfig } from "@react-spring/web";

// ─── TYPE CONFIG ──────────────────────────────────────────────────────────────
export type NotifType = "booking_update" | "payment" | "review" | "system";

export const TYPE_CONFIG: Record<
  NotifType,
  { label: string; icon: React.ReactNode; dot: string; ring: string; glow: string; pill: string }
> = {
  booking_update: {
    label: "Booking",
    icon: <Home size={14} />,
    dot: "bg-blue-500",
    ring: "ring-blue-500/20",
    glow: "shadow-blue-500/20",
    pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
  },
  payment: {
    label: "Payment",
    icon: <CreditCard size={14} />,
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/20",
    glow: "shadow-emerald-500/20",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
  },
  review: {
    label: "Review",
    icon: <Star size={14} />,
    dot: "bg-amber-500",
    ring: "ring-amber-500/20",
    glow: "shadow-amber-500/20",
    pill: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  },
  system: {
    label: "System",
    icon: <Settings size={14} />,
    dot: "bg-slate-400",
    ring: "ring-slate-400/20",
    glow: "shadow-slate-400/10",
    pill: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-700",
  },
};

// ─── TIME AGO HELPER ──────────────────────────────────────────────────────────
export function timeAgo(date: string) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (d < 60)     return "Just now";
  if (d < 3600)   return `${Math.floor(d / 60)}m ago`;
  if (d < 86400)  return `${Math.floor(d / 3600)}h ago`;
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. UNREAD BUBBLE — React Spring animated counter + Framer Motion scale
// ─────────────────────────────────────────────────────────────────────────────
export function UnreadBubble({ count }: { count: number }) {
  const spring = useRSpring({ val: count, config: rsConfig.wobbly });
  if (count === 0) return null;
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className="inline-flex"
    >
      <animated.span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white text-[11px] font-bold shadow-md shadow-blue-500/30">
        {spring.val.to((v) => Math.floor(v))}
      </animated.span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. NOTIFICATION CARD — Framer Motion hover, pulse, slide-in
// ─────────────────────────────────────────────────────────────────────────────
export function NotifCard({
  n,
  index,
  onRead,
  marking,
}: {
  n: any;
  index: number;
  onRead: (id: string) => void;
  marking: boolean;
}) {
  const cfg = TYPE_CONFIG[n.type as NotifType] ?? TYPE_CONFIG.system;
  const [hovered, setHovered] = useState(false);
  const [justRead, setJustRead] = useState(false);

  function handleClick() {
    if (!n.isRead && !marking) {
      onRead(n.id);
      setJustRead(true);
    }
  }

  const inner = (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
      className={cn(
        "relative flex items-start gap-4 px-5 py-4 cursor-pointer select-none transition-colors duration-200 group",
        !n.isRead && !justRead && "bg-gradient-to-r from-blue-50/60 to-transparent dark:from-blue-950/20"
      )}
    >
      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 bg-muted/50"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />

      {/* Icon circle */}
      <motion.div
        className={cn(
          "relative flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ring-2",
          cfg.ring, cfg.glow,
          !n.isRead && !justRead
            ? "bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
            : "bg-muted"
        )}
        animate={{ scale: hovered ? 1.08 : 1, rotate: hovered ? -5 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className={cn("text-base", !n.isRead && !justRead ? "" : "opacity-40")}>
          {cfg.icon}
        </span>

        {/* Unread pulse dot */}
        {!n.isRead && !justRead && (
          <motion.span
            className={cn(
              "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
              cfg.dot
            )}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Text content */}
      <div className="relative flex-1 min-w-0 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm leading-snug",
            !n.isRead && !justRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
          )}>
            {n.title}
          </p>
          <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap flex-shrink-0 mt-0.5">
            {timeAgo(n.createdAt)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>

        {/* Type pill */}
        <div className="pt-1">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
            cfg.pill
          )}>
            {cfg.icon}
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -4 }}
        transition={{ duration: 0.15 }}
        className="relative flex-shrink-0 text-muted-foreground/30 mt-1"
      >
        <ChevronRight size={15} />
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.96 }}
      transition={{ delay: 0.04 + index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      layout
      className="notif-row"
    >
      {n.actionUrl ? <Link href={n.actionUrl}>{inner}</Link> : inner}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SKELETON LOADER — Framer Motion staggered fade-in
// ─────────────────────────────────────────────────────────────────────────────
export function NotifSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-start gap-4 px-5 py-4"
        >
          <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5 w-3/5 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-2/5 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. EMPTY STATE — Framer Motion float + pulse rings
// ─────────────────────────────────────────────────────────────────────────────
export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="relative mb-8">
        {/* Floating icon box */}
        <motion.div
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center"
          animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {filtered ? (
            <Inbox size={44} className="text-slate-400/60" />
          ) : (
            <BellOff size={44} className="text-slate-400/60" />
          )}
        </motion.div>

        {/* Pulse rings */}
        {[1, 2].map((r) => (
          <motion.div
            key={r}
            className="absolute inset-0 rounded-3xl border-2 border-slate-300/40 dark:border-slate-600/30"
            animate={{ scale: [1, 1.25 + r * 0.12], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, delay: r * 0.45, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
      </div>

      <p className="text-lg font-bold mb-2">
        {filtered ? "Nothing here" : "All caught up!"}
      </p>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {filtered
          ? "No notifications match this filter."
          : "You have no notifications yet. We'll let you know when something happens."}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. STAT PILL — React Spring animated counter + Framer Motion (useInView)
// ─────────────────────────────────────────────────────────────────────────────
export function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (inView) setActive(true);
  }, [inView]);

  const spring = useRSpring({ num: active ? value : 0, config: rsConfig.gentle });

  return (
    <div ref={ref} className={cn("rounded-2xl px-4 py-3 text-center", color)}>
      <animated.p className="text-xl font-bold">
        {spring.num.to((n) => Math.floor(n))}
      </animated.p>
      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. NOTIFICATION HEADER — Title + UnreadBubble + Mark All button
// ─────────────────────────────────────────────────────────────────────────────
export function NotifHeader({
  unread,
  totalCount,
  isLoading,
  markingAll,
  onMarkAll,
}: {
  unread: number;
  totalCount: number;
  isLoading: boolean;
  markingAll: boolean;
  onMarkAll: () => void;
}) {
  return (
    <div className="g-h space-y-1">
      {/* Eyebrow label */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
          <Bell size={13} className="text-white" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Activity
        </span>
      </div>

      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <AnimatePresence mode="wait">
            {unread > 0 && <UnreadBubble key={unread} count={unread} />}
          </AnimatePresence>
        </div>

        {unread > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAll}
              disabled={markingAll}
              className="gap-1.5 text-xs rounded-xl border-border/60 hover:border-violet-300 hover:text-violet-600 transition-colors"
            >
              <CheckCheck size={13} />
              Mark all read
            </Button>
          </motion.div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {isLoading
          ? "Loading your activity…"
          : `${totalCount} notification${totalCount !== 1 ? "s" : ""} · ${unread} unread`}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. FILTER TABS — Framer Motion fade-in
// ─────────────────────────────────────────────────────────────────────────────
export function NotifFilterTabs({
  filter,
  onFilterChange,
}: {
  filter: "all" | NotifType;
  onFilterChange: (v: "all" | NotifType) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
      data-aos="fade-up"
      data-aos-delay="120"
    >
      <Tabs value={filter} onValueChange={(v) => onFilterChange(v as "all" | NotifType)}>
        <TabsList className="h-9 rounded-xl bg-muted/60 p-1 gap-0.5">
          {(["all", "booking_update", "payment", "review", "system"] as const).map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="rounded-lg text-xs font-medium px-3 data-[state=active]:shadow-sm"
            >
              {t === "all" ? "All" : TYPE_CONFIG[t]?.label ?? t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. NOTIFICATION LIST — AnimatePresence list with Card wrapper
// ─────────────────────────────────────────────────────────────────────────────
export function NotifList({
  filtered,
  filter,
  isLoading,
  unread,
  listRef,
  onRead,
  marking,
}: {
  filtered: any[];
  filter: "all" | NotifType;
  isLoading: boolean;
  unread: number;
  listRef: React.RefObject<HTMLDivElement>;
  onRead: (id: string) => void;
  marking: boolean;
}) {
  return (
    <>
      {/* Loading skeleton */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border border-border/50 shadow-sm overflow-hidden">
              <NotifSkeleton />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      <AnimatePresence>
        {!isLoading && filtered.length === 0 && (
          <EmptyState filtered={filter !== "all"} />
        )}
      </AnimatePresence>

      {/* List */}
      <AnimatePresence>
        {!isLoading && filtered.length > 0 && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            data-aos="fade-up"
            data-aos-delay="160"
          >
            <Card className="border border-border/50 bg-card/90 backdrop-blur-sm shadow-sm overflow-hidden">
              {/* Card header */}
              <CardHeader className="px-5 py-3.5 border-b border-border/40 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-violet-500" />
                  <span className="text-sm font-semibold">
                    {filter === "all" ? "All Activity" : TYPE_CONFIG[filter as NotifType]?.label}
                  </span>
                </div>
                <Badge variant="secondary" className="rounded-lg text-[11px]">
                  {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                </Badge>
              </CardHeader>

              {/* Rows */}
              <CardContent className="p-0">
                <AnimatePresence initial={false}>
                  {filtered.map((n, i) => (
                    <motion.div key={n.id} layout>
                      <NotifCard
                        n={n}
                        index={i}
                        onRead={onRead}
                        marking={marking}
                      />
                      {i < filtered.length - 1 && (
                        <div className="mx-5 h-px bg-border/40" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-xs text-muted-foreground/50 mt-5"
            >
              {unread === 0
                ? "✓ You're all caught up"
                : `${unread} unread notification${unread !== 1 ? "s" : ""} remaining`}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
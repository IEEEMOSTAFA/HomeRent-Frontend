"use client";
// src/app/(dashboardRoute)/user/notifications/page.tsx

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

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

// GSAP
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// React Spring
import { useSpring as useRSpring, animated, config as rsConfig } from "@react-spring/web";

// AOS
import AOS from "aos";
import "aos/dist/aos.css";

import {
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/user/useUserApi";

// ─── GSAP init ────────────────────────────────────────────────────────────────
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// ─── TYPE CONFIG ─────────────────────────────────────────────────────────────
type NotifType = "booking_update" | "payment" | "review" | "system";

const TYPE_CONFIG: Record<
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

// ─── TIME AGO ────────────────────────────────────────────────────────────────
function timeAgo(date: string) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (d < 60)  return "Just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── ANIMATED UNREAD COUNT (React Spring) ────────────────────────────────────
function UnreadBubble({ count }: { count: number }) {
  const spring = useRSpring({
    val: count,
    config: rsConfig.wobbly,
  });
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

// ─── NOTIFICATION CARD ───────────────────────────────────────────────────────
function NotifCard({
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
      {/* Hover bg */}
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
        {/* Unread pulse */}
        {!n.isRead && !justRead && (
          <motion.span
            className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background", cfg.dot)}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Text */}
      <div className="relative flex-1 min-w-0 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm leading-snug",
            !n.isRead && !justRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
          )}>
            {n.title}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap">
              {timeAgo(n.createdAt)}
            </span>
          </div>
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

// ─── SKELETON ────────────────────────────────────────────────────────────────
function NotifSkeleton() {
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

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="relative mb-8">
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

// ─── STAT PILL (React Spring counter) ────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [active, setActive] = useState(false);
  useEffect(() => { if (inView) setActive(true); }, [inView]);

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

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { data: notifications, isLoading } = useMyNotifications();
  const { mutate: markRead,    isPending: marking    } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead();

  const [filter, setFilter] = useState<"all" | NotifType>("all");
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);

  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;
  const allN   = notifications ?? [];

  const filtered = filter === "all"
    ? allN
    : allN.filter((n) => n.type === filter);

  // AOS
  useEffect(() => {
    AOS.init({ duration: 550, easing: "ease-out-cubic", once: true, offset: 30 });
  }, []);

  // GSAP header reveal
  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".g-h > *",
        { opacity: 0, y: 30, skewY: 1.5 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }
      );
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // GSAP ScrollTrigger on rows
  useEffect(() => {
    if (!listRef.current || isLoading || allN.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.set(".notif-row", { opacity: 0, x: -16 });
      ScrollTrigger.batch(".notif-row", {
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, x: 0, stagger: 0.055, duration: 0.42, ease: "power2.out" }),
        start: "top 93%",
      });
    }, listRef);
    return () => { ctx.revert(); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, [isLoading, allN.length]);

  function handleMarkAll() {
    markAllRead(undefined, {
      onSuccess: () => toast.success("All notifications marked as read"),
      onError:   () => toast.error("Something went wrong"),
    });
  }

  function handleMarkOne(id: string) {
    markRead(id, { onError: () => toast.error("Could not mark as read") });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-7 pb-20">

      {/* ── HEADER ── */}
      <div ref={headerRef}>
        <div className="g-h space-y-1">
          {/* Eyebrow */}
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
                  onClick={handleMarkAll}
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
              : `${allN.length} notification${allN.length !== 1 ? "s" : ""} · ${unread} unread`}
          </p>
        </div>
      </div>

      {/* ── STAT PILLS ── */}
      {!isLoading && allN.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          data-aos="fade-up"
          data-aos-delay="80"
          className="grid grid-cols-4 gap-3"
        >
          <StatPill
            label="All"
            value={allN.length}
            color="bg-slate-50 dark:bg-slate-900/60 border border-border/50 rounded-2xl"
          />
          <StatPill
            label="Bookings"
            value={allN.filter((n) => n.type === "booking_update").length}
            color="bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl"
          />
          <StatPill
            label="Payments"
            value={allN.filter((n) => n.type === "payment").length}
            color="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl"
          />
          <StatPill
            label="Unread"
            value={unread}
            color="bg-violet-50 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/40 rounded-2xl"
          />
        </motion.div>
      )}

      {/* ── FILTER TABS ── */}
      {!isLoading && allN.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          data-aos="fade-up"
          data-aos-delay="120"
        >
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
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
      )}

      {/* ── LOADING ── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border border-border/50 shadow-sm overflow-hidden">
              <NotifSkeleton />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EMPTY ── */}
      <AnimatePresence>
        {!isLoading && filtered.length === 0 && (
          <EmptyState filtered={filter !== "all"} />
        )}
      </AnimatePresence>

      {/* ── LIST ── */}
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
                        onRead={handleMarkOne}
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
    </div>
  );
}

// "use client";
// // src/app/(dashboardRoute)/user/notifications/page.tsx
// // API: GET /api/notifications | PATCH /api/notifications/:id/read | PATCH mark-all-read

// import Link from "next/link";
// import { Bell, BellOff, CheckCheck } from "lucide-react";
// import { toast } from "sonner";

// import { Button }            from "@/components/ui/button";
// import { Badge }             from "@/components/ui/badge";
// import { Card }              from "@/components/ui/card";
// import { Skeleton }          from "@/components/ui/skeleton";
// import { cn }                from "@/lib/utils";
// import {
//   useMyNotifications,
//   useMarkNotificationRead,
//   useMarkAllNotificationsRead,
// } from "@/hooks/user/useUserApi";

// const TYPE_STYLES: Record<string, { dot: string; bg: string }> = {
//   booking_update: { dot: "bg-blue-500",    bg: "bg-blue-50/60"    },
//   payment:        { dot: "bg-emerald-500", bg: "bg-emerald-50/60" },
//   review:         { dot: "bg-amber-500",   bg: "bg-amber-50/60"   },
//   system:         { dot: "bg-gray-400",    bg: "bg-gray-50/60"    },
// };

// function timeAgo(date: string) {
//   const diff = Date.now() - new Date(date).getTime();
//   const mins = Math.floor(diff / 60000);
//   if (mins < 1) return "Just now";
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;
//   return `${Math.floor(hrs / 24)}d ago`;
// }

// export default function NotificationsPage() {
//   const { data: notifications, isLoading } = useMyNotifications();
//   const { mutate: markRead,    isPending: marking     } = useMarkNotificationRead();
//   const { mutate: markAllRead, isPending: markingAll  } = useMarkAllNotificationsRead();

//   const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

//   function handleMarkAll() {
//     markAllRead(undefined, {
//       onSuccess: () => toast.success("All marked as read"),
//       onError:   () => toast.error("Failed"),
//     });
//   }

//   function handleMarkOne(id: string) {
//     markRead(id, {
//       onError: () => toast.error("Failed to mark as read"),
//     });
//   }

//   return (
//     <div className="max-w-2xl mx-auto space-y-5">

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2.5">
//           <h1 className="text-2xl font-bold">Notifications</h1>
//           {unread > 0 && (
//             <Badge className="bg-blue-600 hover:bg-blue-600">{unread} new</Badge>
//           )}
//         </div>
//         {unread > 0 && (
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handleMarkAll}
//             disabled={markingAll}
//             className="gap-1.5 text-xs"
//           >
//             <CheckCheck size={13} /> Mark all read
//           </Button>
//         )}
//       </div>

//       {/* Loading */}
//       {isLoading && (
//         <div className="space-y-2">
//           {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
//         </div>
//       )}

//       {/* Empty */}
//       {!isLoading && (!notifications || notifications.length === 0) && (
//         <div className="flex flex-col items-center justify-center py-24 text-center">
//           <BellOff size={40} className="text-muted-foreground/20 mb-3" />
//           <p className="text-muted-foreground text-sm">No notifications yet</p>
//         </div>
//       )}

//       {/* List */}
//       {!isLoading && notifications && notifications.length > 0 && (
//         <Card className="shadow-none divide-y overflow-hidden">
//           {notifications.map((n) => {
//             const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.system;

//             const content = (
//               <div
//                 className={cn(
//                   "flex items-start gap-3 px-5 py-4 hover:bg-muted/30 transition-colors group",
//                   !n.isRead && style.bg
//                 )}
//                 onClick={() => !n.isRead && handleMarkOne(n.id)}
//               >
//                 {/* Dot */}
//                 <div className="mt-1.5 flex-shrink-0">
//                   <span className={cn(
//                     "block w-2 h-2 rounded-full",
//                     !n.isRead ? style.dot : "bg-transparent border border-muted-foreground/20"
//                   )} />
//                 </div>

//                 {/* Text */}
//                 <div className="flex-1 min-w-0">
//                   <p className={cn(
//                     "text-sm leading-snug",
//                     !n.isRead ? "font-semibold" : "font-medium text-muted-foreground"
//                   )}>
//                     {n.title}
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
//                 </div>

//                 {/* Time */}
//                 <p className="text-[11px] text-muted-foreground flex-shrink-0 mt-0.5">
//                   {timeAgo(n.createdAt)}
//                 </p>
//               </div>
//             );

//             return (
//               <div key={n.id} className="cursor-pointer">
//                 {n.actionUrl
//                   ? <Link href={n.actionUrl}>{content}</Link>
//                   : content}
//               </div>
//             );
//           })}
//         </Card>
//       )}

//     </div>
//   );
// }
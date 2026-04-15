"use client";
// src/app/(dashboardRoute)/owner/notifications/page.tsx

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, RefreshCw, CheckCheck, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useMyNotifications as useNotifications, useMarkAllNotificationsRead as useMarkAllRead } from "@/hooks/owner/useOwnerApi";

import type { Notification, FilterTab } from "@/components/notifications/types";
import { TAB_LABELS } from "@/components/notifications/config";
import { dayLabel, groupByDay } from "@/components/notifications/helpers";
import { StatCard } from "@/components/notifications/StatCard";
import { NotifSkeleton } from "@/components/notifications/NotifSkeleton";
import { EmptyAll } from "@/components/notifications/EmptyAll";
import { DateSep } from "@/components/notifications/DateSep";
import { TabStrip } from "@/components/notifications/TabStrip";
import { NotifRow } from "@/components/notifications/NotifRow";

// Browser-only effects
import { useAOS } from "@/components/notifications/useAOS";
import { useGsapStagger } from "@/components/notifications/useGsapStagger";

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, refetch, isFetching } = useNotifications();
  const { mutate: markAllRead, isPending: marking } = useMarkAllRead();

  const headerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Browser-only hooks
  useAOS();
  useGsapStagger(headerRef as React.RefObject<HTMLDivElement>);

  const unread = notifications.filter((n) => !n.isRead).length;
  const todayNum = notifications.filter((n) => dayLabel(n.createdAt) === "Today").length;

  const counts: Record<FilterTab, number> = {
    all: notifications.length,
    booking_update: notifications.filter((n) => n.type === "booking_update").length,
    payment: notifications.filter((n) => n.type === "payment").length,
    review: notifications.filter((n) => n.type === "review").length,
    system: notifications.filter((n) => n.type === "system").length,
  };

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  const groups = groupByDay(filtered);

  function handleMarkAll() {
    markAllRead(undefined, {
      onSuccess: () => toast.success("All notifications marked as read"),
      onError: () => toast.error("Something went wrong"),
    });
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="max-w-2xl mx-auto space-y-4 pb-12">

        {/* Header */}
        <div ref={headerRef} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200/60 dark:shadow-indigo-900/30">
                  <Bell size={17} className="text-white" />
                </div>
                <AnimatePresence>
                  {unread > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center border-2 border-background shadow"
                    >
                      {unread > 9 ? "9+" : unread}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <h1 className="text-[18px] font-semibold tracking-tight">Notifications</h1>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {unread > 0 ? (
                    <>
                      {unread} unread &middot; {notifications.length} total
                    </>
                  ) : (
                    "You're all caught up"
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => refetch()}
                    disabled={isFetching}
                  >
                    <motion.span
                      animate={isFetching ? { rotate: 360 } : {}}
                      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                    >
                      <RefreshCw size={13} />
                    </motion.span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Refresh</TooltipContent>
              </Tooltip>

              {unread > 0 && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={marking}
                    className="h-8 text-[12px] gap-1.5 border-dashed hover:border-solid hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-all"
                    onClick={handleMarkAll}
                  >
                    <motion.span
                      animate={marking ? { rotate: 360 } : {}}
                      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                    >
                      <CheckCheck size={12} />
                    </motion.span>
                    Mark all read
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Stat cards */}
          {!isLoading && notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex gap-2.5"
            >
              <StatCard label="Unread" value={unread} color="text-sky-600 dark:text-sky-400" />
              <StatCard label="Today" value={todayNum} color="text-emerald-600 dark:text-emerald-400" />
              <StatCard label="Total" value={notifications.length} color="text-violet-600 dark:text-violet-400" />
            </motion.div>
          )}
        </div>

        {/* Tabs */}
        {!isLoading && notifications.length > 0 && (
          <div data-aos="fade-up" data-aos-delay="50">
            <TabStrip active={activeTab} onChange={setActiveTab} counts={counts} />
          </div>
        )}

        {/* Loading / Empty States / List */}
        {isLoading && <NotifSkeleton />}
        {!isLoading && notifications.length === 0 && <EmptyAll />}

        {!isLoading && notifications.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14">
            <Inbox size={28} className="text-muted-foreground/25 mb-1" />
            <p className="text-sm text-muted-foreground">
              No {TAB_LABELS[activeTab]} notifications
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setActiveTab("all")}
            >
              View all
            </Button>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <motion.div layout data-aos="fade-up" data-aos-delay="80">
            <Card className="shadow-none border-border/60 overflow-hidden rounded-2xl divide-y divide-border/40 p-0">
              <ScrollArea className="max-h-[68vh]">
                <AnimatePresence mode="popLayout">
                  {groups.map(({ day, items }) => (
                    <div key={day}>
                      <DateSep label={day} />
                      {items.map((n, i) => (
                        <NotifRow key={n.id} n={n} index={i} />
                      ))}
                    </div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}



























// "use client";
// // src/app/(dashboardRoute)/owner/notifications/page.tsx
// // API: GET /api/notifications | PATCH /api/notifications/mark-all-read

// import Link from "next/link";
// import dynamic from "next/dynamic";
// import { useEffect, useRef, useState, useCallback } from "react";
// import {
//   Bell, CheckCheck, RefreshCw, Calendar,
//   CreditCard, Star, Settings2, ChevronRight, Inbox,
// } from "lucide-react";
// import { toast } from "sonner";
// import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// import { useSpring as useReactSpring, animated } from "@react-spring/web";

// // ─── Browser-only libraries (dynamic import — Server-এ load হবে না) ──────────
// // gsap, aos, lottie এগুলো `document` ব্যবহার করে, তাই dynamic import দরকার

// import type { gsap as GsapType } from "gsap"; // শুধু type import — safe

// import { Button }     from "@/components/ui/button";
// import { Badge }      from "@/components/ui/badge";
// import { Card }       from "@/components/ui/card";
// import { Skeleton }   from "@/components/ui/skeleton";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   useMyNotifications as useNotifications,
//   useMarkAllNotificationsRead as useMarkAllRead,
// } from "@/hooks/owner/useOwnerApi";
// import { cn } from "@/lib/utils";

// // Lottie — ssr: false মানে শুধু browser-এ render হবে
// const LottiePlayer = dynamic(
//   () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
//   { ssr: false, loading: () => <div className="w-[120px] h-[120px]" /> }
// );

// // ─── Types ────────────────────────────────────────────────────────────────────

// type NotifType = "booking_update" | "payment" | "review" | "system";
// type FilterTab  = "all" | NotifType;

// interface Notification {
//   id: string;
//   type: NotifType;
//   title: string;
//   message: string;
//   isRead: boolean;
//   createdAt: string;
//   actionUrl?: string;
// }

// // ─── Config ───────────────────────────────────────────────────────────────────

// const TYPE_CONFIG: Record<
//   NotifType,
//   {
//     Icon: React.ElementType;
//     label: string;
//     iconBg: string;
//     iconColor: string;
//     activeBg: string;
//     activeBorder: string;
//     dot: string;
//     badgeCls: string;
//   }
// > = {
//   booking_update: {
//     Icon: Calendar,
//     label: "Booking",
//     iconBg: "bg-sky-50 dark:bg-sky-950/40",
//     iconColor: "text-sky-600 dark:text-sky-400",
//     activeBg: "bg-sky-50/80 dark:bg-sky-950/30",
//     activeBorder: "border-l-sky-400 dark:border-l-sky-600",
//     dot: "bg-sky-500",
//     badgeCls: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
//   },
//   payment: {
//     Icon: CreditCard,
//     label: "Payment",
//     iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
//     iconColor: "text-emerald-600 dark:text-emerald-400",
//     activeBg: "bg-emerald-50/80 dark:bg-emerald-950/30",
//     activeBorder: "border-l-emerald-400 dark:border-l-emerald-600",
//     dot: "bg-emerald-500",
//     badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
//   },
//   review: {
//     Icon: Star,
//     label: "Review",
//     iconBg: "bg-amber-50 dark:bg-amber-950/40",
//     iconColor: "text-amber-600 dark:text-amber-400",
//     activeBg: "bg-amber-50/80 dark:bg-amber-950/30",
//     activeBorder: "border-l-amber-400 dark:border-l-amber-600",
//     dot: "bg-amber-500",
//     badgeCls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
//   },
//   system: {
//     Icon: Settings2,
//     label: "System",
//     iconBg: "bg-violet-50 dark:bg-violet-950/40",
//     iconColor: "text-violet-600 dark:text-violet-400",
//     activeBg: "bg-violet-50/80 dark:bg-violet-950/30",
//     activeBorder: "border-l-violet-400 dark:border-l-violet-600",
//     dot: "bg-violet-500",
//     badgeCls: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800",
//   },
// };

// const TAB_LABELS: Record<FilterTab, string> = {
//   all: "All",
//   booking_update: "Bookings",
//   payment: "Payments",
//   review: "Reviews",
//   system: "System",
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function timeAgo(date: string) {
//   const diff = Date.now() - new Date(date).getTime();
//   const m = Math.floor(diff / 60_000);
//   if (m < 1)  return "Just now";
//   if (m < 60) return `${m}m ago`;
//   const h = Math.floor(m / 60);
//   if (h < 24) return `${h}h ago`;
//   const d = Math.floor(h / 24);
//   if (d < 7)  return `${d}d ago`;
//   return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
// }

// function dayLabel(date: string) {
//   const d = new Date(date);
//   const t = new Date();
//   const y = new Date(t);
//   y.setDate(t.getDate() - 1);
//   if (d.toDateString() === t.toDateString()) return "Today";
//   if (d.toDateString() === y.toDateString()) return "Yesterday";
//   return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
// }

// function groupByDay(items: Notification[]) {
//   const map = new Map<string, Notification[]>();
//   for (const n of items) {
//     const key = dayLabel(n.createdAt);
//     if (!map.has(key)) map.set(key, []);
//     map.get(key)!.push(n);
//   }
//   return Array.from(map.entries()).map(([day, items]) => ({ day, items }));
// }

// // ─── GSAP Ripple — useEffect-এর ভেতরে dynamic import ────────────────────────
// // GSAP সরাসরি import করলে Server crash করে।
// // তাই useEffect (browser-only) এর ভেতরে import করা হয়েছে।

// function useRipple() {
//   const ref = useRef<HTMLDivElement>(null);

//   const fire = useCallback((e: React.MouseEvent) => {
//     const el = ref.current;
//     if (!el) return;

//     // Runtime-এ browser-এ import — Server-এ এই code কখনো চলবে না
//     import("gsap").then(({ gsap }) => {
//       const { left, top } = el.getBoundingClientRect();
//       const dot = document.createElement("span");
//       Object.assign(dot.style, {
//         position: "absolute",
//         borderRadius: "50%",
//         pointerEvents: "none",
//         width: "8px",
//         height: "8px",
//         transform: "translate(-50%,-50%) scale(0)",
//         background: "rgba(99,102,241,.22)",
//         left: `${e.clientX - left}px`,
//         top: `${e.clientY - top}px`,
//       });
//       el.style.position = "relative";
//       el.style.overflow = "hidden";
//       el.appendChild(dot);
//       gsap.to(dot, {
//         scale: 55,
//         opacity: 0,
//         duration: 0.65,
//         ease: "power2.out",
//         onComplete: () => dot.remove(),
//       });
//     });
//   }, []);

//   return { ref, fire };
// }

// // ─── AOS — useEffect-এর ভেতরে dynamic import ─────────────────────────────────
// // AOS.init() browser-এ DOMContentLoaded এর পর চলতে হয়।
// // তাই useEffect এ রাখা হয়েছে।

// function useAOS() {
//   useEffect(() => {
//     import("aos").then((AOS) => {
//       // AOS CSS
//       import("aos/dist/aos.css" as string);
//       AOS.default.init({ once: true, easing: "ease-out-cubic", duration: 420 });
//     });
//   }, []);
// }

// // ─── GSAP Header stagger ──────────────────────────────────────────────────────

// function useGsapStagger(ref: React.RefObject<HTMLDivElement>) {
//   useEffect(() => {
//     if (!ref.current) return;
//     const children = [...ref.current.children] as HTMLElement[];
//     import("gsap").then(({ gsap }) => {
//       gsap.fromTo(
//         children,
//         { y: -14, opacity: 0 },
//         { y: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: "power3.out", delay: 0.05 }
//       );
//     });
//   }, [ref]);
// }

// // ─── Animated number (React Spring) ──────────────────────────────────────────

// function AnimNum({ value }: { value: number }) {
//   const { val } = useReactSpring({ val: value, config: { tension: 180, friction: 22 } });
//   return <animated.span>{val.to((v) => Math.round(v))}</animated.span>;
// }

// // ─── Stat card ────────────────────────────────────────────────────────────────

// function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
//   return (
//     <div className="flex-1 rounded-xl border border-border/60 bg-card px-3 py-2.5">
//       <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
//       <p className={cn("text-xl font-semibold tabular-nums", color)}>
//         <AnimNum value={value} />
//       </p>
//     </div>
//   );
// }

// // ─── Skeleton ─────────────────────────────────────────────────────────────────

// function NotifSkeleton() {
//   return (
//     <Card className="shadow-none border-border/60 rounded-2xl divide-y p-0">
//       {[...Array(5)].map((_, i) => (
//         <motion.div
//           key={i}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: i * 0.06 }}
//           className="flex items-start gap-3 px-4 py-4"
//         >
//           <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
//           <div className="flex-1 space-y-2 pt-0.5">
//             <Skeleton className="h-3 w-2/3" />
//             <Skeleton className="h-3 w-full" />
//             <Skeleton className="h-3 w-2/5" />
//           </div>
//           <Skeleton className="h-3 w-10 flex-shrink-0" />
//         </motion.div>
//       ))}
//     </Card>
//   );
// }

// // ─── Empty state ──────────────────────────────────────────────────────────────

// function EmptyAll() {
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.97 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ type: "spring", stiffness: 220, damping: 22 }}
//       className="flex flex-col items-center py-20 text-center"
//     >
//       {/* LottiePlayer — ssr: false দেওয়া আছে, তাই safe */}
//       <LottiePlayer
//         autoplay
//         loop
//         src="https://assets3.lottiefiles.com/packages/lf20_rqcjxmys.json"
//         style={{ width: 120, height: 120 }}
//       />
//       <p className="text-sm font-semibold mt-2 text-foreground/80">All caught up</p>
//       <p className="text-xs text-muted-foreground mt-1 max-w-xs">
//         No notifications right now. We'll let you know when something needs your attention.
//       </p>
//     </motion.div>
//   );
// }

// // ─── Date separator ───────────────────────────────────────────────────────────

// function DateSep({ label }: { label: string }) {
//   return (
//     <div className="flex items-center gap-3 px-4 py-2.5">
//       <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">
//         {label}
//       </span>
//       <div className="flex-1 h-px bg-border/40" />
//     </div>
//   );
// }

// // ─── Tab strip ────────────────────────────────────────────────────────────────

// const ALL_TABS: FilterTab[] = ["all", "booking_update", "payment", "review", "system"];

// function TabStrip({
//   active,
//   onChange,
//   counts,
// }: {
//   active: FilterTab;
//   onChange: (t: FilterTab) => void;
//   counts: Record<FilterTab, number>;
// }) {
//   return (
//     <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit max-w-full overflow-x-auto scrollbar-none">
//       {ALL_TABS.filter((t) => t === "all" || counts[t] > 0).map((t) => (
//         <button
//           key={t}
//           onClick={() => onChange(t)}
//           className={cn(
//             "relative px-3 h-7 text-[12px] rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors duration-150 font-medium",
//             active === t
//               ? "bg-background text-foreground shadow-sm border border-border/40"
//               : "text-muted-foreground hover:text-foreground hover:bg-background/50"
//           )}
//         >
//           {TAB_LABELS[t]}
//           <span
//             className={cn(
//               "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] rounded-full tabular-nums",
//               active === t
//                 ? "bg-muted text-muted-foreground"
//                 : "bg-muted/60 text-muted-foreground/70"
//             )}
//           >
//             {counts[t]}
//           </span>
//         </button>
//       ))}
//     </div>
//   );
// }

// // ─── Notification row ─────────────────────────────────────────────────────────

// const rowVariants = {
//   hidden:  { opacity: 0, y: 10, filter: "blur(3px)" },
//   visible: (i: number) => ({
//     opacity: 1,
//     y: 0,
//     filter: "blur(0px)",
//     transition: { type: "spring" as const, stiffness: 300, damping: 28, delay: i * 0.035 },
//   }),
//   exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } },
// };

// function NotifRow({ n, index }: { n: Notification; index: number }) {
//   const reduced = useReducedMotion();
//   const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
//   const { Icon } = cfg;
//   const { ref, fire } = useRipple();

//   const inner = (
//     <div
//       ref={ref}
//       onClick={fire}
//       className={cn(
//         "group flex items-start gap-3 px-4 py-4 transition-colors duration-150 cursor-pointer",
//         "hover:bg-muted/40 border-l-2 border-l-transparent",
//         !n.isRead && [cfg.activeBg, cfg.activeBorder]
//       )}
//     >
//       {/* Icon avatar */}
//       <div className={cn("flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5", cfg.iconBg)}>
//         <Icon size={15} className={cfg.iconColor} />
//       </div>

//       {/* Body */}
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-1.5 mb-0.5">
//           <p className={cn(
//             "text-[13px] leading-snug truncate",
//             !n.isRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
//           )}>
//             {n.title}
//           </p>
//           {!n.isRead && (
//             <motion.span
//               initial={reduced ? false : { scale: 0 }}
//               animate={{ scale: 1 }}
//               className={cn("inline-block w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)}
//             />
//           )}
//         </div>
//         <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
//           {n.message}
//         </p>
//         <div className="flex items-center gap-1.5 mt-1.5">
//           <Badge
//             variant="outline"
//             className={cn("text-[10px] px-2 py-0 h-4 rounded font-normal border", cfg.badgeCls)}
//           >
//             {cfg.label}
//           </Badge>
//           <span className="text-[10px] text-muted-foreground/40">·</span>
//           <span className="text-[10px] text-muted-foreground/55">{timeAgo(n.createdAt)}</span>
//         </div>
//       </div>

//       {/* Chevron — শুধু actionUrl থাকলে দেখাবে */}
//       {n.actionUrl && (
//         <ChevronRight
//           size={13}
//           className="flex-shrink-0 self-center text-muted-foreground/25 group-hover:text-muted-foreground/60 transition-colors mt-0.5"
//         />
//       )}
//     </div>
//   );

//   return (
//     <motion.div
//       layout
//       key={n.id}
//       custom={index}
//       variants={reduced ? {} : rowVariants}
//       initial="hidden"
//       animate="visible"
//       exit="exit"
//     >
//       {n.actionUrl ? <Link href={n.actionUrl}>{inner}</Link> : inner}
//     </motion.div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────

// export default function NotificationsPage() {
//   const { data: notifications = [], isLoading, refetch, isFetching } = useNotifications();
//   const { mutate: markAllRead, isPending: marking } = useMarkAllRead();
//   const headerRef = useRef<HTMLDivElement>(null);
//   const [activeTab, setActiveTab] = useState<FilterTab>("all");

//   // Browser-only hooks — Server-এ run হবে না
//   useAOS();
//   useGsapStagger(headerRef);

//   const unread   = notifications.filter((n) => !n.isRead).length;
//   const todayNum = notifications.filter((n) => dayLabel(n.createdAt) === "Today").length;

//   const counts: Record<FilterTab, number> = {
//     all:            notifications.length,
//     booking_update: notifications.filter((n) => n.type === "booking_update").length,
//     payment:        notifications.filter((n) => n.type === "payment").length,
//     review:         notifications.filter((n) => n.type === "review").length,
//     system:         notifications.filter((n) => n.type === "system").length,
//   };

//   const filtered =
//     activeTab === "all"
//       ? notifications
//       : notifications.filter((n) => n.type === activeTab);

//   const groups = groupByDay(filtered);

//   function handleMarkAll() {
//     markAllRead(undefined, {
//       onSuccess: () => toast.success("All notifications marked as read"),
//       onError:   () => toast.error("Something went wrong"),
//     });
//   }

//   return (
//     <TooltipProvider delayDuration={150}>
//       <div className="max-w-2xl mx-auto space-y-4 pb-12">

//         {/* Header */}
//         <div ref={headerRef} className="space-y-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="relative">
//                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200/60 dark:shadow-indigo-900/30">
//                   <Bell size={17} className="text-white" />
//                 </div>
//                 <AnimatePresence>
//                   {unread > 0 && (
//                     <motion.span
//                       key="badge"
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       exit={{ scale: 0 }}
//                       className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center border-2 border-background shadow"
//                     >
//                       {unread > 9 ? "9+" : unread}
//                     </motion.span>
//                   )}
//                 </AnimatePresence>
//               </div>

//               <div>
//                 <h1 className="text-[18px] font-semibold tracking-tight">Notifications</h1>
//                 <p className="text-[12px] text-muted-foreground mt-0.5">
//                   {unread > 0 ? (
//                     <>
//                       <AnimNum value={unread} /> unread &middot;{" "}
//                       <AnimNum value={notifications.length} /> total
//                     </>
//                   ) : (
//                     "You're all caught up"
//                   )}
//                 </p>
//               </div>
//             </div>

//             {/* Action buttons */}
//             <div className="flex items-center gap-2">
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8"
//                     onClick={() => refetch()}
//                     disabled={isFetching}
//                   >
//                     <motion.span
//                       animate={isFetching ? { rotate: 360 } : {}}
//                       transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
//                     >
//                       <RefreshCw size={13} />
//                     </motion.span>
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent side="bottom" className="text-xs">Refresh</TooltipContent>
//               </Tooltip>

//               {unread > 0 && (
//                 <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     disabled={marking}
//                     className="h-8 text-[12px] gap-1.5 border-dashed hover:border-solid hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-all"
//                     onClick={handleMarkAll}
//                   >
//                     <motion.span
//                       animate={marking ? { rotate: 360 } : {}}
//                       transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
//                     >
//                       <CheckCheck size={12} />
//                     </motion.span>
//                     Mark all read
//                   </Button>
//                 </motion.div>
//               )}
//             </div>
//           </div>

//           {/* Stat cards */}
//           {!isLoading && notifications.length > 0 && (
//             <motion.div
//               initial={{ opacity: 0, y: 6 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.15 }}
//               className="flex gap-2.5"
//             >
//               <StatCard label="Unread" value={unread}               color="text-sky-600 dark:text-sky-400" />
//               <StatCard label="Today"  value={todayNum}             color="text-emerald-600 dark:text-emerald-400" />
//               <StatCard label="Total"  value={notifications.length} color="text-violet-600 dark:text-violet-400" />
//             </motion.div>
//           )}
//         </div>

//         {/* Tabs */}
//         {!isLoading && notifications.length > 0 && (
//           <div data-aos="fade-up" data-aos-delay="50">
//             <TabStrip active={activeTab} onChange={setActiveTab} counts={counts} />
//           </div>
//         )}

//         {/* Loading skeleton */}
//         {isLoading && <NotifSkeleton />}

//         {/* No notifications at all */}
//         {!isLoading && notifications.length === 0 && <EmptyAll />}

//         {/* Filter returned no results */}
//         {!isLoading && notifications.length > 0 && filtered.length === 0 && (
//           <div className="flex flex-col items-center gap-2 py-14">
//             <Inbox size={28} className="text-muted-foreground/25 mb-1" />
//             <p className="text-sm text-muted-foreground">
//               No {TAB_LABELS[activeTab]} notifications
//             </p>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-xs"
//               onClick={() => setActiveTab("all")}
//             >
//               View all
//             </Button>
//           </div>
//         )}

//         {/* Notification list */}
//         {!isLoading && filtered.length > 0 && (
//           <motion.div layout data-aos="fade-up" data-aos-delay="80">
//             <Card className="shadow-none border-border/60 overflow-hidden rounded-2xl divide-y divide-border/40 p-0">
//               <ScrollArea className="max-h-[68vh]">
//                 <AnimatePresence mode="popLayout">
//                   {groups.map(({ day, items }) => (
//                     <div key={day}>
//                       <DateSep label={day} />
//                       {items.map((n, i) => (
//                         <NotifRow key={n.id} n={n as Notification} index={i} />
//                       ))}
//                     </div>
//                   ))}
//                 </AnimatePresence>
//               </ScrollArea>
//             </Card>
//           </motion.div>
//         )}

//       </div>
//     </TooltipProvider>
//   );
// }
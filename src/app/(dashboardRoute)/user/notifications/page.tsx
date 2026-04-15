"use client";
// src/app/(dashboardRoute)/user/notifications/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// এই ফাইলে শুধু page-level logic আছে।
// সব UI component আসে notification.tsx থেকে।
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Framer Motion
import { motion } from "framer-motion";

// GSAP — dynamic import দিয়ে SSR এড়ানো হচ্ছে
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// AOS
import AOS from "aos";
import "aos/dist/aos.css";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useMyNotifications } from "@/hooks/user/useUserApi";
import { NotifFilterTabs, NotifHeader, NotifList, NotifType, StatPill } from "@/components/notifications/Notification ";



// ─── GSAP plugin registration (client-side only) ─────────────────────────────
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { data: notifications, isLoading } = useMyNotifications();
  const { mutate: markRead,    isPending: marking    } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead();

  const [filter, setFilter] = useState<"all" | NotifType>("all");
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);

  const unread  = notifications?.filter((n) => !n.isRead).length ?? 0;
  const allN    = notifications ?? [];
  const filtered = filter === "all" ? allN : allN.filter((n) => n.type === filter);

  // ── AOS init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    AOS.init({ duration: 550, easing: "ease-out-cubic", once: true, offset: 30 });
  }, []);

  // ── GSAP header reveal ─────────────────────────────────────────────────────
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

  // ── GSAP ScrollTrigger on notification rows ────────────────────────────────
  useEffect(() => {
    if (!listRef.current || isLoading || allN.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.set(".notif-row", { opacity: 0, x: -16 });
      ScrollTrigger.batch(".notif-row", {
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            x: 0,
            stagger: 0.055,
            duration: 0.42,
            ease: "power2.out",
          }),
        start: "top 93%",
      });
    }, listRef);
    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isLoading, allN.length]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleMarkAll() {
    markAllRead(undefined, {
      onSuccess: () => toast.success("All notifications marked as read"),
      onError:   () => toast.error("Something went wrong"),
    });
  }

  function handleMarkOne(id: string) {
    markRead(id, { onError: () => toast.error("Could not mark as read") });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-7 pb-20">

      {/* ── HEADER ── */}
      <div ref={headerRef}>
        <NotifHeader
          unread={unread}
          totalCount={allN.length}
          isLoading={isLoading}
          markingAll={markingAll}
          onMarkAll={handleMarkAll}
        />
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
        <NotifFilterTabs filter={filter} onFilterChange={setFilter} />
      )}

      {/* ── NOTIFICATION LIST (Loading / Empty / Items) ── */}
      <NotifList
        filtered={filtered}
        filter={filter}
        isLoading={isLoading}
        unread={unread}
        listRef={listRef as React.RefObject<HTMLDivElement>}
        onRead={handleMarkOne}
        marking={marking}
      />

    </div>
  );
}
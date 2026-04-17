"use client";
// src/app/(dashboardRoute)/user/reviews/page.tsx

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Lucide Icons
import {
  Star,
  Plus,
  MessageSquare,
  Eye,
  EyeOff,
  AlertTriangle,
  TrendingUp,
  Award,
  Hash,
  Sparkles,
  ChevronRight,
  Building2,
  Calendar,
} from "lucide-react";

// shadcn/ui
import { Button }            from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge }             from "@/components/ui/badge";
import { Skeleton }          from "@/components/ui/skeleton";
import { Separator }         from "@/components/ui/separator";
import { Progress }          from "@/components/ui/progress";
import { cn }                from "@/lib/utils";

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

import { useMyReviews } from "@/hooks/user/useUserApi";

// ─── GSAP init ────────────────────────────────────────────────────────────────
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// ─── STAR RATING ─────────────────────────────────────────────────────────────
function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <motion.div
          key={s}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: s * 0.07, type: "spring", stiffness: 300, damping: 18 }}
        >
          <Star
            size={size}
            className={
              s <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-muted-foreground/20 fill-muted-foreground/10"
            }
          />
        </motion.div>
      ))}
    </div>
  );
}

// ─── ANIMATED NUMBER (React Spring) ──────────────────────────────────────────
function AnimNum({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref  = useRef<HTMLSpanElement>(null);
  const inV  = useInView(ref, { once: true });

  const sp = useRSpring({ val: inV ? to : 0, config: rsConfig.gentle });
  return (
    <span ref={ref}>
      <animated.span>
        {sp.val.to((v) => v.toFixed(decimals))}
      </animated.span>
    </span>
  );
}

// ─── RATING BREAKDOWN ────────────────────────────────────────────────────────
function RatingBreakdown({ reviews }: { reviews: any[] }) {
  const counts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === s).length / reviews.length) * 100 : 0,
  }));
  const avg = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : 0;

  return (
    <Card
      className="border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden"
      data-aos="fade-up"
      data-aos-delay="80"
    >
      <CardContent className="p-5">
        <div className="flex gap-6 items-center">
          {/* Big average */}
          <div className="flex-shrink-0 text-center">
            <p className="text-5xl font-black tracking-tight leading-none text-foreground">
              <AnimNum to={avg} decimals={1} />
            </p>
            <StarRow rating={Math.round(avg)} size={13} />
            <p className="text-[11px] text-muted-foreground mt-1">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Separator orientation="vertical" className="h-20 opacity-40" />

          {/* Bar breakdown */}
          <div className="flex-1 space-y-1.5">
            {counts.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[11px] font-semibold w-3 text-muted-foreground">{star}</span>
                <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                <div className="flex-1">
                  <motion.div
                    className="h-1.5 rounded-full bg-amber-400/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3 + star * 0.05, duration: 0.6, ease: "easeOut" }}
                    style={{ minWidth: pct > 0 ? "4px" : 0 }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── STAT PILL ────────────────────────────────────────────────────────────────
function StatPill({
  label, value, icon, accent, delay,
}: {
  label: string; value: number; icon: React.ReactNode; accent: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", accent)}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-xl font-bold leading-tight">
              <AnimNum to={value} />
            </p>
          </div>
        </CardContent>
        <span className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 transition-all duration-500 rounded-full" />
      </Card>
    </motion.div>
  );
}

// ─── REVIEW CARD ─────────────────────────────────────────────────────────────
function ReviewCard({ r, index }: { r: any; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isLong = (r.comment?.length ?? 0) > 120;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      layout
      className="review-card group relative"
    >
      {/* Hover bg */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.18 }}
      />

      <div className="relative flex gap-4 px-5 py-5">
        {/* Property thumbnail or icon */}
        <div className="flex-shrink-0">
          {r.property?.images?.[0] ? (
            <motion.div
              className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm ring-1 ring-border/40"
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={r.property.images[0]}
                alt={r.property.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/60 dark:to-orange-950/60 flex items-center justify-center shadow-sm ring-1 ring-amber-200/60 dark:ring-amber-800/40"
              animate={{ scale: hovered ? 1.07 : 1, rotate: hovered ? -4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Building2 size={20} className="text-amber-500/70" />
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {r.property && (
                <p className="font-semibold text-sm line-clamp-1 text-foreground">
                  {r.property.title}
                </p>
              )}
              <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                <StarRow rating={r.rating} size={13} />
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(r.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              {r.isFlagged && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800">
                  <AlertTriangle size={9} /> Flagged
                </span>
              )}
              {!r.isVisible && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700">
                  <EyeOff size={9} /> Hidden
                </span>
              )}
              {r.isVisible && !r.isFlagged && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                  <Eye size={9} /> Published
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          {r.comment && (
            <div>
              <p className={cn(
                "text-xs text-muted-foreground leading-relaxed",
                !expanded && isLong && "line-clamp-2"
              )}>
                {r.comment}
              </p>
              {isLong && (
                <motion.button
                  onClick={() => setExpanded(!expanded)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-medium mt-1 transition-colors"
                >
                  {expanded ? "Show less ↑" : "Read more ↓"}
                </motion.button>
              )}
            </div>
          )}

          {!r.comment && (
            <p className="text-xs text-muted-foreground/50 italic">No comment left</p>
          )}
        </div>

        {/* Hover arrow */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -4 }}
          transition={{ duration: 0.15 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30"
        >
          <ChevronRight size={15} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function ReviewSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          className="flex gap-4 px-5 py-5"
        >
          <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5 w-3/5 rounded-md" />
            <Skeleton className="h-3 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-4/5 rounded-md" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState() {
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
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 flex items-center justify-center"
          animate={{ y: [0, -10, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star size={44} className="text-amber-400/70" />
        </motion.div>
        {[1, 2].map((r) => (
          <motion.div
            key={r}
            className="absolute inset-0 rounded-3xl border-2 border-amber-400/30"
            animate={{ scale: [1, 1.28 + r * 0.12], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, delay: r * 0.45, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
      </div>

      <p className="text-xl font-bold mb-2">No reviews yet</p>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
        After a confirmed booking, share your experience to help others find the perfect property.
      </p>

      <Link href="/user/booking">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white border-0 rounded-xl px-6 shadow-lg shadow-amber-500/20">
            <Star size={15} />
            View Bookings
            <ChevronRight size={13} />
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function MyReviewsPage() {
  const { data, isLoading } = useMyReviews();
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);

  const reviews    = data?.data ?? [];
  const totalCount = data?.meta?.total ?? reviews.length;
  const avgRating  = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : 0;
  const visibleCount = reviews.filter((r) => r.isVisible).length;
  const flaggedCount = reviews.filter((r) => r.isFlagged).length;

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
        { opacity: 1, y: 0, skewY: 0, duration: 0.72, ease: "power3.out", stagger: 0.1 }
      );
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // GSAP ScrollTrigger on review cards
  useEffect(() => {
    if (!listRef.current || isLoading || reviews.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.set(".review-card", { opacity: 0, y: 18 });
      ScrollTrigger.batch(".review-card", {
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, stagger: 0.07, duration: 0.44, ease: "power2.out" }),
        start: "top 93%",
      });
    }, listRef);
    return () => { ctx.revert(); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, [isLoading, reviews.length]);

  return (
    <div className="space-y-8 pb-20">

      {/* ── HEADER ── */}
      <div ref={headerRef}>
        <div className="g-h space-y-1">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Star size={13} className="text-white fill-white" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Reviews
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Loading your reviews…"
                  : `${totalCount} review${totalCount !== 1 ? "s" : ""} submitted`}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 20 }}
            >
              <Link href="/user/reviews/new">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white border-0 rounded-xl shadow-md shadow-amber-500/20">
                    <Plus size={15} />
                    Write Review
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── STAT PILLS ── */}
      {!isLoading && reviews.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          data-aos="fade-up"
          data-aos-delay="80"
        >
          <StatPill
            label="Total"
            value={totalCount}
            icon={<Hash size={16} className="text-slate-500" />}
            accent="bg-slate-100 dark:bg-slate-800"
            delay={0}
          />
          <StatPill
            label="Avg Rating"
            value={parseFloat(avgRating.toFixed(1))}
            icon={<Star size={16} className="text-amber-500 fill-amber-400" />}
            accent="bg-amber-50 dark:bg-amber-950/50"
            delay={0.07}
          />
          <StatPill
            label="Published"
            value={visibleCount}
            icon={<Eye size={16} className="text-emerald-600" />}
            accent="bg-emerald-50 dark:bg-emerald-950/50"
            delay={0.14}
          />
          <StatPill
            label="Flagged"
            value={flaggedCount}
            icon={<AlertTriangle size={16} className="text-rose-500" />}
            accent="bg-rose-50 dark:bg-rose-950/50"
            delay={0.21}
          />
        </div>
      )}

      {/* ── RATING BREAKDOWN ── */}
      {!isLoading && reviews.length > 0 && (
        <RatingBreakdown reviews={reviews} />
      )}

      {/* ── LOADING ── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border border-border/50 shadow-sm overflow-hidden">
              <ReviewSkeleton />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EMPTY ── */}
      <AnimatePresence>
        {!isLoading && reviews.length === 0 && <EmptyState />}
      </AnimatePresence>

      {/* ── REVIEWS LIST ── */}
      <AnimatePresence>
        {!isLoading && reviews.length > 0 && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            data-aos="fade-up"
            data-aos-delay="180"
          >
            <Card className="border border-border/50 bg-card/90 backdrop-blur-sm shadow-sm overflow-hidden">
              {/* Card header */}
              <CardHeader className="px-5 py-3.5 border-b border-border/40 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-amber-500" />
                  <span className="text-sm font-semibold">All Reviews</span>
                </div>
                <Badge variant="secondary" className="rounded-lg text-[11px]">
                  {reviews.length} record{reviews.length !== 1 ? "s" : ""}
                </Badge>
              </CardHeader>

              {/* Review cards */}
              <div className="divide-y divide-border/40">
                <AnimatePresence initial={false}>
                  {reviews.map((r, i) => (
                    <ReviewCard key={r.id} r={r} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            </Card>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-muted-foreground/50 mt-5"
            >
              {reviews.length} review{reviews.length !== 1 ? "s" : ""} · Avg{" "}
              {avgRating.toFixed(1)} ★ across all properties
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


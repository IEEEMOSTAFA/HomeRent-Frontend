"use client";
// src/app/(dashboardRoute)/user/payments/page.tsx

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Lucide Icons
import {
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Wallet,
  Receipt,
  ChevronRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";

// shadcn/ui
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Framer Motion
import { motion, AnimatePresence, useInView } from "framer-motion";

// GSAP
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// React Spring
import { useSpring as useRSpring, animated } from "@react-spring/web";

// AOS
import AOS from "aos";
import "aos/dist/aos.css";

import { useMyPayments, type PaymentStatus } from "@/hooks/user/useUserApi";

// ─── GSAP plugin registration ─────────────────────────────────────────────────
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const statusConfig: Record<
  PaymentStatus,
  { label: string; icon: React.ReactNode; pill: string; dot: string }
> = {
  SUCCESS: {
    label: "Paid",
    icon: <CheckCircle2 size={12} />,
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    icon: <Clock size={12} />,
    pill: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    dot: "bg-amber-400",
  },
  FAILED: {
    label: "Failed",
    icon: <XCircle size={12} />,
    pill: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800",
    dot: "bg-rose-500",
  },
  REFUNDED: {
    label: "Refunded",
    icon: <RefreshCw size={12} />,
    pill: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800",
    dot: "bg-sky-400",
  },
};

// ─── ANIMATED COUNTER (React Spring) ─────────────────────────────────────────
function AnimatedAmount({ value }: { value: number }) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => { if (inView) setActive(true); }, [inView]);

  const spring = useRSpring({
    num: active ? value : 0,
    config: { mass: 1, tension: 70, friction: 18 },
  });

  return (
    <span ref={ref}>
      <animated.span>
        {spring.num.to((n) => `৳${Math.floor(n).toLocaleString()}`)}
      </animated.span>
    </span>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, accent, delay,
}: {
  label: string; value: string | number; icon: React.ReactNode; accent: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${accent}`}>
            {icon}
          </div>
        </CardContent>
        {/* Hover underline */}
        <span className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 transition-all duration-500 rounded-full" />
      </Card>
    </motion.div>
  );
}

// ─── PAYMENT ROW ──────────────────────────────────────────────────────────────
function PaymentRow({ payment, index }: { payment: any; index: number }) {
  const cfg = statusConfig[payment.status as PaymentStatus] ?? statusConfig.PENDING;
  const title = payment.booking?.property?.title ?? "Property Payment";
  const area  = payment.booking?.property?.area;
  const city  = payment.booking?.property?.city;
  const loc   = [area, city].filter(Boolean).join(", ");
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 + index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-xl overflow-hidden"
    >
      {/* Hover bg */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-50/70 to-violet-50/50 dark:from-blue-950/25 dark:to-violet-950/20"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.18 }}
      />

      <div className="relative flex items-center gap-4 px-4 py-4">
        {/* Icon */}
        <motion.div
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow flex items-center justify-center flex-shrink-0"
          animate={{ scale: hovered ? 1.07 : 1, rotate: hovered ? -4 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <CreditCard size={19} className="text-white" />
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm line-clamp-1">{title}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.pill}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          {loc && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {loc}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(payment.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
          {payment.refundedAt && (
            <p className="text-xs text-rose-500 mt-0.5">
              Refunded ৳{payment.refundAmount?.toLocaleString()} on{" "}
              {new Date(payment.refundedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
          <p className="text-base font-bold tracking-tight">
            <AnimatedAmount value={payment.amount} />
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {payment.currency ?? "BDT"}
          </p>
          {payment.receiptUrl && (
            <motion.a
              href={payment.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-violet-600 transition-colors"
            >
              <Receipt size={11} /> Receipt <ArrowUpRight size={10} />
            </motion.a>
          )}
        </div>

        {/* Arrow */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -5 }}
          transition={{ duration: 0.15 }}
          className="text-muted-foreground/30 flex-shrink-0"
        >
          <ChevronRight size={15} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.07 }}
          className="flex items-center gap-4 px-4 py-4"
        >
          <Skeleton className="w-11 h-11 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/5 rounded-md" />
            <Skeleton className="h-3 w-2/5 rounded-md" />
            <Skeleton className="h-3 w-1/4 rounded-md" />
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
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
      className="flex flex-col items-center justify-center py-28 text-center"
    >
      <div className="relative mb-8">
        <motion.div
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-950 dark:to-violet-950 flex items-center justify-center"
          animate={{ y: [0, -10, 0], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Wallet size={44} className="text-blue-400/70" />
        </motion.div>
        {/* Pulsing rings */}
        {[1, 2].map((r) => (
          <motion.div
            key={r}
            className="absolute inset-0 rounded-3xl border-2 border-blue-400/30"
            animate={{ scale: [1, 1.3 + r * 0.15], opacity: [0.5, 0] }}
            transition={{ duration: 2, delay: r * 0.4, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
      </div>

      <p className="text-xl font-bold mb-2">No payments yet</p>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
        Complete a booking and your full payment history will appear here automatically.
      </p>

      <Link href="/user/booking">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white border-0 rounded-xl px-6 shadow-lg shadow-blue-500/20">
            <CreditCard size={15} />
            View Bookings
            <ArrowUpRight size={13} />
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function PaymentHistoryPage() {
  const { data, isLoading, error } = useMyPayments();
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);

  const payments          = data?.data ?? [];
  const totalTransactions = data?.meta?.total ?? payments.length;
  const totalPaid         = payments.filter((p) => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0);
  const pendingCount      = payments.filter((p) => p.status === "PENDING").length;

  // AOS init
  useEffect(() => {
    AOS.init({ duration: 550, easing: "ease-out-cubic", once: true, offset: 30 });
  }, []);

  // GSAP — header stagger reveal
  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".g-header > *",
        { opacity: 0, y: 28, skewY: 1.5 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }
      );
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // GSAP — scroll-batch for payment rows
  useEffect(() => {
    if (!listRef.current || isLoading || payments.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.set(".p-row", { opacity: 0, x: -14 });
      ScrollTrigger.batch(".p-row", {
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, x: 0, stagger: 0.05, duration: 0.38, ease: "power2.out" }),
        start: "top 92%",
      });
    }, listRef);
    return () => { ctx.revert(); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, [isLoading, payments.length]);

  return (
    <div className="min-h-screen space-y-8 pb-20">

      {/* ── HEADER ── */}
      <div ref={headerRef}>
        <div className="g-header space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <CreditCard size={13} className="text-white" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Finance
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Fetching your transactions…"
              : `${totalTransactions} transaction${totalTransactions !== 1 ? "s" : ""} on record`}
          </p>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <AnimatePresence>
        {!isLoading && !error && payments.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            <StatCard
              label="Total Paid"
              value={`৳${totalPaid.toLocaleString()}`}
              icon={<TrendingUp size={18} className="text-emerald-600" />}
              accent="bg-emerald-50 dark:bg-emerald-950/50"
              delay={0}
            />
            <StatCard
              label="Transactions"
              value={totalTransactions}
              icon={<Receipt size={18} className="text-blue-600" />}
              accent="bg-blue-50 dark:bg-blue-950/50"
              delay={0.07}
            />
            <StatCard
              label="Pending"
              value={pendingCount}
              icon={<Clock size={18} className="text-amber-500" />}
              accent="bg-amber-50 dark:bg-amber-950/50"
              delay={0.14}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── LOADING ── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border border-border/50 shadow-sm overflow-hidden">
              <LoadingSkeleton />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ERROR ── */}
      <AnimatePresence>
        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={30} className="text-rose-400" />
            </div>
            <p className="font-semibold mb-1">Could not load payments</p>
            <p className="text-sm text-muted-foreground">Refresh the page and try again.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EMPTY ── */}
      <AnimatePresence>
        {!isLoading && !error && payments.length === 0 && <EmptyState />}
      </AnimatePresence>

      {/* ── LIST ── */}
      <AnimatePresence>
        {!isLoading && !error && payments.length > 0 && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            data-aos="fade-up"
            data-aos-delay="180"
          >
            <Card className="border border-border/50 bg-card/90 backdrop-blur-sm shadow-sm overflow-hidden">
              {/* Header */}
              <CardHeader className="px-5 py-3.5 border-b border-border/40 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-violet-500" />
                  <span className="text-sm font-semibold">All Transactions</span>
                </div>
                <Badge variant="secondary" className="rounded-lg text-[11px]">
                  {payments.length} records
                </Badge>
              </CardHeader>

              {/* Rows */}
              <CardContent className="p-2 space-y-0">
                {payments.map((payment, i) => (
                  <div key={payment.id} className="p-row">
                    <PaymentRow payment={payment} index={i} />
                    {i < payments.length - 1 && (
                      <Separator className="mx-4 opacity-30" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-muted-foreground/50 mt-5"
            >
              Showing all {payments.length} record{payments.length !== 1 ? "s" : ""} · Amounts in BDT (৳)
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



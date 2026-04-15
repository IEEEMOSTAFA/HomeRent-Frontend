"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarCheck,
  Building2,
  Star,
  Bell,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useMyBookings } from "@/hooks/user/useUserApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusConfig(status: string) {
  const map: Record<string, { icon: React.ReactNode; badge: string }> = {
    CONFIRMED: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    },
    PENDING: {
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    },
    CANCELLED: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      badge: "bg-red-500/15 text-red-400 border border-red-500/30",
    },
  };
  return (
    map[status] ?? {
      icon: null,
      badge: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
    }
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon,
  accent,
  delay = 0,
}: {
  title: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  accent: string; // tailwind text color class
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className={`${accent} opacity-80`}>{icon}</div>
      </div>
      <p className="text-4xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </motion.div>
  );
}

// ─── Booking Row ──────────────────────────────────────────────────────────────

function BookingRow({ booking, index }: { booking: any; index: number }) {
  const cfg = statusConfig(booking.status);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
      whileHover={{ x: 4 }}
      className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
        <Home className="h-4 w-4 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {booking.property?.title || "Property"}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock className="h-3 w-3 text-slate-500" />
          <p className="text-xs text-slate-500">
            {booking.moveInDate
              ? new Date(booking.moveInDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Date TBD"}
          </p>
        </div>
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.badge}`}
      >
        {cfg.icon}
        {booking.status}
      </span>
      <ChevronRight className="h-4 w-4 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function AnimatedBar({
  pct,
  color,
  delay,
}: {
  pct: number;
  color: string;
  delay: number;
}) {
  return (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ delay, duration: 0.9, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardContent() {
  const { data: bookingsResponse, isLoading: bookingsLoading } = useMyBookings({
    page: 1,
  });

  const bookings = Array.isArray(bookingsResponse?.data)
    ? bookingsResponse.data
    : Array.isArray(bookingsResponse)
    ? bookingsResponse
    : [];

  const recentBookings = bookings.slice(0, 5);
  const upcomingBookings = bookings
    .filter((b: any) => ["CONFIRMED", "PENDING"].includes(b.status))
    .slice(0, 3);
  const confirmedCount = bookings.filter(
    (b: any) => b.status === "CONFIRMED"
  ).length;
  const completionRate = bookings.length
    ? Math.round((confirmedCount / bookings.length) * 100)
    : 0;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (bookingsLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] p-6 space-y-6">
        <Skeleton className="h-14 w-72 rounded-2xl bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl bg-white/5" />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 space-y-10">

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Welcome back
              <span className="ml-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                !
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Here&apos;s what&apos;s happening with your rentals today
            </p>
          </div>

          {/* Live badge */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-300">Live Dashboard</span>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Bookings"
            value={bookings.length}
            sub="All time"
            icon={<CalendarCheck className="h-5 w-5" />}
            accent="text-blue-400"
            delay={0}
          />
          <StatCard
            title="Upcoming Stays"
            value={upcomingBookings.length}
            sub="Confirmed + Pending"
            icon={<Building2 className="h-5 w-5" />}
            accent="text-emerald-400"
            delay={0.08}
          />
          <StatCard
            title="Notifications"
            value={3}
            sub="Unread this week"
            icon={<Bell className="h-5 w-5" />}
            accent="text-amber-400"
            delay={0.16}
          />
          <StatCard
            title="Reviews Given"
            value={12}
            sub="This year"
            icon={<Star className="h-5 w-5" />}
            accent="text-violet-400"
            delay={0.24}
          />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Bookings — span 2 */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  <h2 className="font-bold text-white">Recent Bookings</h2>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                    {recentBookings.length}
                  </span>
                </div>
                <Link href="/user/bookings">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1 rounded-xl text-xs"
                  >
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* Rows */}
              <div className="p-3">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking: any, i: number) => (
                    <BookingRow key={booking.id} booking={booking} index={i} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    {/* Simple SVG empty state instead of Lottie */}
                    <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
                      <CalendarCheck className="h-9 w-9 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm">No bookings found yet</p>
                    <Link href="/properties">
                      <Button
                        size="sm"
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 text-xs"
                      >
                        Browse Properties
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">

            {/* Booking Health */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Booking Health
                </h3>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="space-y-4">
                {[
                  { label: "Confirmed", pct: completionRate, color: "bg-emerald-500" },
                  {
                    label: "Active Rate",
                    pct: upcomingBookings.length ? 85 : 0,
                    color: "bg-blue-500",
                  },
                  { label: "Satisfaction", pct: 92, color: "bg-violet-500" },
                ].map(({ label, pct, color }, i) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-bold text-white">{pct}%</span>
                    </div>
                    <AnimatedBar pct={pct} color={color} delay={0.5 + i * 0.1} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-1.5">
                {[
                  {
                    href: "/user/notifications",
                    icon: <Bell className="h-4 w-4" />,
                    label: "Notifications",
                    badge: "3",
                    iconBg: "text-amber-400 bg-amber-500/15",
                  },
                  {
                    href: "/properties",
                    icon: <Home className="h-4 w-4" />,
                    label: "Browse Properties",
                    iconBg: "text-blue-400 bg-blue-500/15",
                  },
                  {
                    href: "/user/bookings",
                    icon: <CalendarCheck className="h-4 w-4" />,
                    label: "All Bookings",
                    iconBg: "text-emerald-400 bg-emerald-500/15",
                  },
                ].map(({ href, icon, label, badge, iconBg }) => (
                  <Link key={href} href={href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
                      <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors">
                        {label}
                      </span>
                      {badge && (
                        <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {badge}
                        </span>
                      )}
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Promo Banner */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl p-5 cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)",
              }}
            >
              {/* Decorative circle */}
              <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/5" />
              <div className="absolute -bottom-6 -right-4 h-20 w-20 rounded-full bg-white/5" />

              <Sparkles className="h-6 w-6 text-yellow-300 mb-3 relative z-10" />
              <p className="text-sm font-bold text-white leading-snug relative z-10">
                Explore premium properties near you
              </p>
              <p className="text-xs text-blue-200 mt-1 mb-4 relative z-10">
                Handpicked listings, updated daily
              </p>
              <Link href="/properties">
                <Button
                  size="sm"
                  className="rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold gap-1 relative z-10"
                >
                  Explore now <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
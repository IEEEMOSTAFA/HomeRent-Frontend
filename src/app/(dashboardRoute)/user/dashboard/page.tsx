"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useSpring as useReactSpring, animated, useTrail } from "@react-spring/web";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lottie from "lottie-react";
import AOS from "aos";
import "aos/dist/aos.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { useMyBookings } from "@/hooks/user/useUserApi";

// ─── Register GSAP plugins ───────────────────────────────────────────────────
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Lottie animation data (inline minimal JSON — replace with real files) ───
const emptyLottie = {
  v: "5.7.4", fr: 30, ip: 0, op: 60, w: 200, h: 200, nm: "Empty",
  layers: [{
    ind: 1, ty: 4, nm: "circle", sr: 1, ks: {
      o: { a: 0, k: 60 }, r: { a: 1, k: [{ t: 0, s: [0], e: [360] }] },
      p: { a: 0, k: [100, 100, 0] }, s: { a: 0, k: [100, 100, 100] }
    },
    shapes: [{
      ty: "el", s: { a: 0, k: [80, 80] }, p: { a: 0, k: [0, 0] },
      it: [{ ty: "st", c: { a: 0, k: [0.29, 0.56, 1, 1] }, w: { a: 0, k: 6 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] } }]
    }],
    ip: 0, op: 60, st: 0
  }]
};

const welcomeLottie = {
  v: "5.7.4", fr: 30, ip: 0, op: 90, w: 120, h: 120, nm: "Sparkle",
  layers: [{
    ind: 1, ty: 4, nm: "star", sr: 1,
    ks: { o: { a: 1, k: [{ t: 0, s: [0] }, { t: 20, s: [100] }, { t: 70, s: [100] }, { t: 90, s: [0] }] }, r: { a: 1, k: [{ t: 0, s: [0], e: [45] }] }, p: { a: 0, k: [60, 60, 0] }, s: { a: 1, k: [{ t: 0, s: [0, 0, 100] }, { t: 25, s: [110, 110, 100] }, { t: 40, s: [100, 100, 100] }] } },
    shapes: [{ ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 18 }, is: { a: 0, k: 0 }, or: { a: 0, k: 35 }, os: { a: 0, k: 0 }, ix: 1, it: [{ ty: "fl", c: { a: 0, k: [1, 0.85, 0.2, 1] }, o: { a: 0, k: 100 } }, { ty: "tr", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] } }] }],
    ip: 0, op: 90, st: 0
  }]
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusConfig(status: string) {
  const map: Record<string, { color: string; icon: React.ReactNode; badge: string }> = {
    CONFIRMED: { color: "text-emerald-400", icon: <CheckCircle2 className="h-3.5 w-3.5" />, badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    PENDING:   { color: "text-amber-400",   icon: <AlertCircle  className="h-3.5 w-3.5" />, badge: "bg-amber-500/15 text-amber-400 border-amber-500/30"   },
    CANCELLED: { color: "text-red-400",     icon: <XCircle      className="h-3.5 w-3.5" />, badge: "bg-red-500/15 text-red-400 border-red-500/30"           },
  };
  return map[status] ?? { color: "text-slate-400", icon: null, badge: "bg-slate-500/15 text-slate-400 border-slate-500/30" };
}

// ─── Animated Counter (GSAP) ──────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1.4 }: { target: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { innerText: 0 },
      {
        innerText: target, duration, ease: "power2.out", snap: { innerText: 1 },
        onUpdate() { if (ref.current) ref.current.textContent = Math.round(Number(ref.current.textContent)).toString(); }
      }
    );
  }, [target, duration]);
  return <span ref={ref}>0</span>;
}

// ─── Magnetic Button (Framer Motion) ─────────────────────────────────────────
function MagneticButton({ children, className, ...props }: React.ComponentProps<typeof Button>) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  return (
    <motion.div style={{ x: sx, y: sy }} onMouseMove={(e) => {
      const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      x.set((e.clientX - r.left - r.width / 2) * 0.25);
      y.set((e.clientY - r.top - r.height / 2) * 0.25);
    }} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <Button className={className} {...props}>{children}</Button>
    </motion.div>
  );
}

// ─── Stat Card (React Spring + Framer Motion) ────────────────────────────────
function StatCard({
  title, value, sub, icon, gradient, delay = 0
}: {
  title: string; value: number; sub: string;
  icon: React.ReactNode; gradient: string; delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const spring = useReactSpring({
    scale: hovered ? 1.04 : 1,
    y: hovered ? -4 : 0,
    boxShadow: hovered
      ? "0 20px 60px rgba(0,0,0,0.4)"
      : "0 4px 20px rgba(0,0,0,0.2)",
    config: { tension: 260, friction: 20 },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <animated.div
        style={spring}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 cursor-default"
      >
        {/* Gradient blob */}
        <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 blur-2xl ${gradient}`} />

        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <div className={`rounded-xl p-2 ${gradient} bg-opacity-20`}>
            {icon}
          </div>
        </div>
        <div className="text-4xl font-black tracking-tight text-white">
          <AnimatedCounter target={value} />
        </div>
        <p className="mt-1 text-xs text-slate-500">{sub}</p>

        {/* Bottom shimmer line */}
        <motion.div
          className={`absolute bottom-0 left-0 h-[2px] ${gradient}`}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </animated.div>
    </motion.div>
  );
}

// ─── Booking Row ──────────────────────────────────────────────────────────────
function BookingRow({ booking, index }: { booking: any; index: number }) {
  const cfg = statusConfig(booking.status);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
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
              ? new Date(booking.moveInDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Date TBD"}
          </p>
        </div>
      </div>
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.badge}`}>
        {cfg.icon} {booking.status}
      </span>
      <ChevronRight className="h-4 w-4 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const { data: bookingsResponse, isLoading: bookingsLoading } = useMyBookings({ page: 1 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [showLottie, setShowLottie] = useState(true);

  // AOS init
  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic", offset: 60 });
  }, []);

  // GSAP hero parallax
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".gsap-parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current!, start: "top top", end: "bottom top", scrub: true },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Hide lottie after 3s
  useEffect(() => {
    const t = setTimeout(() => setShowLottie(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const bookings = Array.isArray(bookingsResponse?.data)
    ? bookingsResponse.data
    : Array.isArray(bookingsResponse) ? bookingsResponse : [];

  const recentBookings   = bookings.slice(0, 5);
  const upcomingBookings = bookings.filter((b: any) => ["CONFIRMED", "PENDING"].includes(b.status)).slice(0, 3);
  const confirmedCount   = bookings.filter((b: any) => b.status === "CONFIRMED").length;
  const completionRate   = bookings.length ? Math.round((confirmedCount / bookings.length) * 100) : 0;

  // Trail for quick links (React Spring)
  const [trailActive, setTrailActive] = useState(false);
  const trail = useTrail(2, {
    opacity: trailActive ? 1 : 0,
    y: trailActive ? 0 : 20,
    config: { tension: 220, friction: 22 },
  });
  useEffect(() => {
    const t = setTimeout(() => setTrailActive(true), 800);
    return () => clearTimeout(t);
  }, []);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (bookingsLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl bg-white/5" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* ── Global ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gsap-parallax-bg absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="gsap-parallax-bg absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 space-y-10">

        {/* ── Hero Header ── */}
        <div ref={heroRef} className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center gap-3 mb-2">
              <AnimatePresence>
                {showLottie && (
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="h-12 w-12"
                  >
                    <Lottie animationData={welcomeLottie} loop={false} />
                  </motion.div>
                )}
              </AnimatePresence>
              <h1 className="text-4xl font-black tracking-tight">
                Welcome back
                <span className="ml-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  !
                </span>
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              Here are what is happening with your rentals today
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden md:flex items-center gap-2"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-300">Live Dashboard</span>
            </div>
          </motion.div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Bookings"  value={bookings.length}        sub="All time"           icon={<CalendarCheck className="h-5 w-5 text-blue-400"    />} gradient="bg-blue-500"    delay={0}    />
          <StatCard title="Upcoming Stays"  value={upcomingBookings.length} sub="Confirmed + Pending" icon={<Building2     className="h-5 w-5 text-emerald-400" />} gradient="bg-emerald-500" delay={0.1}  />
          <StatCard title="Notifications"   value={3}                       sub="Unread this week"   icon={<Bell          className="h-5 w-5 text-amber-400"   />} gradient="bg-amber-500"   delay={0.2}  />
          <StatCard title="Reviews Given"   value={12}                      sub="This year"          icon={<Star          className="h-5 w-5 text-violet-400"  />} gradient="bg-violet-500"  delay={0.3}  />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Bookings (span 2) */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  <h2 className="font-bold text-white">Recent Bookings</h2>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                    {recentBookings.length}
                  </span>
                </div>
                <Link href="/user/bookings">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1 rounded-xl text-xs">
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
                    <div className="h-24 w-24 opacity-70">
                      <Lottie animationData={emptyLottie} loop />
                    </div>
                    <p className="text-slate-500 text-sm">No bookings found yet</p>
                    <Link href="/properties">
                      <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-500 text-xs">
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

            {/* Booking Completion */}
            <div data-aos="fade-left" data-aos-delay="100">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Booking Health</h3>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Confirmed", pct: completionRate, color: "bg-emerald-500" },
                    { label: "Active Rate", pct: upcomingBookings.length ? 85 : 0, color: "bg-blue-500" },
                    { label: "Satisfaction", pct: 92, color: "bg-violet-500" },
                  ].map(({ label, pct, color }, i) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-bold text-white">{pct}%</span>
                      </div>
                      <motion.div
                        className="h-1.5 rounded-full bg-white/10 overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <motion.div
                          className={`h-full rounded-full ${color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 1, ease: "easeOut" }}
                        />
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div data-aos="fade-left" data-aos-delay="200">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
                <div className="flex flex-col gap-2.5">
                  {[
                    { href: "/user/notifications", icon: <Bell className="h-4 w-4" />, label: "Notifications", badge: "3", color: "text-amber-400 bg-amber-500/15" },
                    { href: "/properties",         icon: <Home className="h-4 w-4" />, label: "Browse Properties", color: "text-blue-400 bg-blue-500/15" },
                    { href: "/user/bookings",      icon: <CalendarCheck className="h-4 w-4" />, label: "All Bookings", color: "text-emerald-400 bg-emerald-500/15" },
                  ].map(({ href, icon, label, badge, color }, i) => (
                    <Link key={href} href={href}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <div className={`rounded-lg p-2 ${color}`}>{icon}</div>
                        <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
                        {badge && (
                          <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Promo Banner */}
            <div data-aos="fade-left" data-aos-delay="300">
              <motion.div
                className="relative overflow-hidden rounded-2xl p-5 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Shine overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
                  animate={{ translateX: ["−100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                />
                <Sparkles className="h-6 w-6 text-yellow-300 mb-3" />
                <p className="text-sm font-bold text-white leading-snug">
                  Explore premium properties near you
                </p>
                <p className="text-xs text-blue-200 mt-1 mb-4">Handpicked listings, updated daily</p>
                <Link href="/properties">
                  <Button size="sm" className="rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold gap-1">
                    Explore now <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}














// "use client";


// function timeAgo(date: string) {
//   const diff = Date.now() - new Date(date).getTime();
//   const mins = Math.floor(diff / 60000);
//   if (mins < 1) return "Just now";
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;
//   return `${Math.floor(hrs / 24)}d ago`;
// }

// export default function UserDashboardPage() {
//   const { data: bookingsResponse, isLoading: bookingsLoading } = useMyBookings({ page: 1 });

//   // Safe data handling (Backend wrapper support)
//   const bookings = Array.isArray(bookingsResponse?.data) 
//     ? bookingsResponse.data 
//     : Array.isArray(bookingsResponse) 
//       ? bookingsResponse 
//       : [];

//   const recentBookings = bookings.slice(0, 5);
//   const upcomingBookings = bookings
//     .filter((b: any) => ["CONFIRMED", "PENDING"].includes(b.status))
//     .slice(0, 3);

//   if (bookingsLoading) {
//     return (
//       <div className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {[...Array(4)].map((_, i) => (
//             <Skeleton key={i} className="h-32 rounded-xl" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
//         <p className="text-muted-foreground mt-1">Here's an overview of your rental activity</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
//             <CalendarCheck className="h-5 w-5 text-blue-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">{bookings.length}</div>
//             <p className="text-xs text-muted-foreground">All time</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Upcoming Stays</CardTitle>
//             <Building2 className="h-5 w-5 text-emerald-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">{upcomingBookings.length}</div>
//             <p className="text-xs text-muted-foreground">Confirmed bookings</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Notifications</CardTitle>
//             <Bell className="h-5 w-5 text-amber-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">3</div>
//             <p className="text-xs text-muted-foreground">Unread this week</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
//             <Star className="h-5 w-5 text-purple-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">12</div>
//             <p className="text-xs text-muted-foreground">This year</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Bookings */}
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle>Recent Bookings</CardTitle>
//           <Link href="/user/bookings">
//             <Button variant="outline" size="sm">View All</Button>
//           </Link>
//         </CardHeader>
//         <CardContent>
//           {recentBookings.length > 0 ? (
//             <div className="space-y-4">
//               {recentBookings.map((booking: any) => (
//                 <div key={booking.id} className="flex justify-between items-center py-3 border-b last:border-0">
//                   <div className="flex-1">
//                     <p className="font-medium">{booking.property?.title || "Property"}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString() : 'Date not set'}
//                     </p>
//                   </div>
//                   <Badge 
//                     variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
//                   >
//                     {booking.status}
//                   </Badge>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-center text-muted-foreground py-12">No bookings found yet</p>
//           )}
//         </CardContent>
//       </Card>

//       {/* Quick Links */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Bell className="text-amber-600" /> Notifications
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Link href="/user/notifications">
//               <Button className="w-full">View All Notifications</Button>
//             </Link>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Browse More Properties</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Link href="/properties">
//               <Button variant="outline" className="w-full">Explore Properties</Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
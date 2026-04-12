"use client";



import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Home,
  CreditCard,
  Star,
  Bell,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Lock,
  Zap,
  Building2,
  UserCheck,
  ClipboardList,
  Layers,
} from "lucide-react";
import {
  motion,
  useInView,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { animate as animeAnimate } from "animejs";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { Button }      from "@/components/ui/button";
import { Badge }       from "@/components/ui/badge";
import { Separator }   from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type RoleCard = {
  icon: React.ReactNode;
  role: string;
  tagline: string;
  color: string;
  borderColor: string;
  glowColor: string;
  badgeColor: string;
  capabilities: string[];
  apis: string[];
};

type WorkflowStep = {
  actor: "OWNER" | "ADMIN" | "USER" | "SYSTEM";
  action: string;
  description: string;
};

type StatItem = {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
  isFloat?: boolean;
};

type FeatureBlock = {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
  color: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Static data (sourced from PRD)
// ─────────────────────────────────────────────────────────────────────────────
const STATS: StatItem[] = [
  { value: 3,   suffix: " Roles",   label: "User Roles",        icon: <Users className="h-4 w-4" /> },
  { value: 5,   suffix: " Steps",   label: "Booking Lifecycle",  icon: <ClipboardList className="h-4 w-4" /> },
  { value: 18,  suffix: " APIs",    label: "Integration Points", icon: <Layers className="h-4 w-4" /> },
  { value: 100, suffix: "%",        label: "Role-Based Access",  icon: <Lock className="h-4 w-4" /> },
];

const ROLES: RoleCard[] = [
  {
    icon: <Users className="h-6 w-6" />,
    role: "USER",
    tagline: "Tenant / Renter",
    color: "from-emerald-950/70 to-emerald-900/40",
    borderColor: "border-emerald-700/35",
    glowColor: "bg-emerald-500/8",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-600/30",
    capabilities: [
      "Browse and filter properties",
      "View property details",
      "Create booking requests",
      "Complete Stripe payments",
      "Submit reviews & ratings",
      "Receive real-time notifications",
    ],
    apis: [
      "GET /api/properties",
      "POST /api/bookings",
      "POST /api/payments/create-intent",
      "POST /api/reviews",
    ],
  },
  {
    icon: <Home className="h-6 w-6" />,
    role: "OWNER",
    tagline: "Property Landlord",
    color: "from-sky-950/70 to-sky-900/40",
    borderColor: "border-sky-700/35",
    glowColor: "bg-sky-500/8",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-600/30",
    capabilities: [
      "Create & manage property listings",
      "Upload property images",
      "Accept or decline bookings",
      "View performance statistics",
      "Manage owner profile",
    ],
    apis: [
      "POST /api/owner/properties",
      "GET /api/owner/bookings",
      "PATCH /api/owner/bookings/:id",
      "GET /api/owner/profile",
    ],
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    role: "ADMIN",
    tagline: "Platform Moderator",
    color: "from-violet-950/70 to-violet-900/40",
    borderColor: "border-violet-700/35",
    glowColor: "bg-violet-500/8",
    badgeColor: "bg-violet-500/15 text-violet-300 border-violet-600/30",
    capabilities: [
      "Approve or reject properties",
      "Ban or manage users",
      "Monitor all payments",
      "Manage reviews & content",
      "Access full analytics dashboard",
    ],
    apis: [
      "PATCH /api/admin/properties/:id/status",
      "PATCH /api/users/:id/ban",
      "GET /api/admin/payments",
      "GET /api/admin/analytics",
    ],
  },
];

const WORKFLOW: WorkflowStep[] = [
  { actor: "OWNER",  action: "Create Property",    description: "Owner lists a new property with details, pricing, and photos." },
  { actor: "ADMIN",  action: "Approve Property",   description: "Admin reviews and approves the listing before it goes public." },
  { actor: "USER",   action: "Browse & Book",       description: "Tenant discovers the property and submits a booking request." },
  { actor: "OWNER",  action: "Accept Booking",      description: "Owner reviews the request and accepts the tenant." },
  { actor: "USER",   action: "Initiate Payment",    description: "Tenant creates a Stripe payment intent for the booking." },
  { actor: "USER",   action: "Confirm Payment",     description: "Stripe processes the payment; client confirms with backend." },
  { actor: "SYSTEM", action: "Booking Confirmed",   description: "System marks booking as CONFIRMED and triggers notifications." },
  { actor: "USER",   action: "Submit Review",       description: "After stay, tenant leaves a verified review on the property." },
];

const FEATURES: FeatureBlock[] = [
  {
    icon: <Lock className="h-5 w-5 text-emerald-400" />,
    title: "Auth & Session",
    description: "BetterAuth handles sign-up, sign-in, and session cookies. Role is immutable post-registration.",
    tags: ["BetterAuth", "Session Cookies", "RBAC"],
    color: "border-emerald-700/30",
  },
  {
    icon: <CreditCard className="h-5 w-5 text-sky-400" />,
    title: "Stripe Payments",
    description: "Two-step payment flow: create intent → confirm. One payment per booking, enforced at API level.",
    tags: ["Stripe", "Payment Intent", "Webhook"],
    color: "border-sky-700/30",
  },
  {
    icon: <ClipboardList className="h-5 w-5 text-amber-400" />,
    title: "Booking Lifecycle",
    description: "Strict state machine: PENDING → ACCEPTED → PAYMENT_PENDING → CONFIRMED with cancellation support.",
    tags: ["State Machine", "Prisma", "Validation"],
    color: "border-amber-700/30",
  },
  {
    icon: <Bell className="h-5 w-5 text-violet-400" />,
    title: "Notifications",
    description: "Real-time notifications triggered on booking state changes, payment confirmation, and reviews.",
    tags: ["Real-time", "Mark Read", "Event-Driven"],
    color: "border-violet-700/30",
  },
  {
    icon: <Star className="h-5 w-5 text-rose-400" />,
    title: "Review System",
    description: "One verified review per booking. Reviews are tied to confirmed bookings only.",
    tags: ["One-per-booking", "Verified", "Ratings"],
    color: "border-rose-700/30",
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-teal-400" />,
    title: "Admin Analytics",
    description: "Full platform dashboard: active listings, booking rates, payment volumes, user stats.",
    tags: ["Dashboard", "Admin Only", "Analytics"],
    color: "border-teal-700/30",
  },
];

const BOOKING_STATUSES = [
  { label: "PENDING",         color: "bg-amber-500/20 text-amber-300 border-amber-600/30" },
  { label: "ACCEPTED",        color: "bg-sky-500/20 text-sky-300 border-sky-600/30" },
  { label: "PAYMENT_PENDING", color: "bg-violet-500/20 text-violet-300 border-violet-600/30" },
  { label: "CONFIRMED",       color: "bg-emerald-500/20 text-emerald-300 border-emerald-600/30" },
  { label: "DECLINED",        color: "bg-rose-500/20 text-rose-300 border-rose-600/30" },
  { label: "CANCELLED",       color: "bg-slate-500/20 text-slate-300 border-slate-600/30" },
];

const TECH_STACK = [
  { label: "Next.js",      sub: "Frontend / App Router" },
  { label: "Express + TS", sub: "Backend API"           },
  { label: "PostgreSQL",   sub: "Database"              },
  { label: "Prisma",       sub: "ORM"                   },
  { label: "BetterAuth",   sub: "Authentication"        },
  { label: "Stripe",       sub: "Payments"              },
];

const ACTOR_COLORS: Record<WorkflowStep["actor"], string> = {
  OWNER:  "bg-sky-500/20 text-sky-300 border-sky-600/30",
  ADMIN:  "bg-violet-500/20 text-violet-300 border-violet-600/30",
  USER:   "bg-emerald-500/20 text-emerald-300 border-emerald-600/30",
  SYSTEM: "bg-amber-500/20 text-amber-300 border-amber-600/30",
};

// ─────────────────────────────────────────────────────────────────────────────
// Framer Motion variants
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.5, delay: i * 0.09, ease: "easeOut" },
  }),
};

const slideRight: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: (i: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Animated Counter (Anime.js v4)
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix, isFloat }: StatItem) {
  const ref     = useRef<HTMLSpanElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-60px" });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current || !ref.current) return;
    started.current = true;
    const obj = { v: 0 };
    animeAnimate(obj, {
      v: value,
      duration: 1600,
      ease: "easeOutExpo",
      onUpdate() {
        if (ref.current)
          ref.current.textContent = (isFloat ? obj.v.toFixed(1) : Math.round(obj.v)) + suffix;
      },
    });
  }, [inView, value, suffix, isFloat]);

  return <span ref={ref} className="tabular-nums">{isFloat ? `0.0${suffix}` : `0${suffix}`}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section heading
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="text-center mb-14"
    >
      <motion.p variants={fadeUp} custom={0}
        className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-400 uppercase tracking-widest mb-3"
      >
        <span className="inline-block w-5 h-px bg-emerald-500" />
        {eyebrow}
        <span className="inline-block w-5 h-px bg-emerald-500" />
      </motion.p>
      <motion.h2 variants={fadeUp} custom={1}
        className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} custom={2}
          className="text-white/45 text-base max-w-2xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Role Card
// ─────────────────────────────────────────────────────────────────────────────
function RoleCard({ role, index }: { role: RoleCard; index: number }) {
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
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${role.glowColor} blur-3xl pointer-events-none transition-opacity duration-500`}
        style={{ opacity: hovered ? 0.8 : 0.3 }} />

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
            <motion.li key={i}
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

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Step
// ─────────────────────────────────────────────────────────────────────────────
function WorkflowItem({ step, index, total }: { step: WorkflowStep; index: number; total: number }) {
  const isLast = index === total - 1;
  return (
    <motion.div
      variants={slideRight}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className="flex gap-4 group"
    >
      {/* Line + number */}
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.15 }}
          className="w-8 h-8 rounded-full border border-emerald-700/50 bg-emerald-950/60 flex items-center justify-center text-emerald-400 text-[11px] font-bold z-10"
        >
          {String(index + 1).padStart(2, "0")}
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
            style={{ originY: 0 }}
            className="w-px flex-1 bg-gradient-to-b from-emerald-700/40 to-transparent mt-1 min-h-[32px]"
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-8 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${ACTOR_COLORS[step.actor]}`}>
            {step.actor}
          </span>
          <span className="text-white font-semibold text-sm">{step.action}</span>
        </div>
        <p className="text-white/45 text-[13px] leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature Block
// ─────────────────────────────────────────────────────────────────────────────
function FeatureBlock({ feature, index }: { feature: FeatureBlock; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative rounded-xl border ${feature.color} bg-white/3 p-5 overflow-hidden`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
          {feature.icon}
        </div>
        <h3 className="text-white font-bold text-sm leading-tight pt-1">{feature.title}</h3>
      </div>
      <p className="text-white/45 text-[12.5px] leading-relaxed mb-3">{feature.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {feature.tags.map((tag) => (
          <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
            {tag}
          </span>
        ))}
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-emerald-500/60 to-transparent"
        initial={{ width: 0 }}
        animate={{ width: hovered ? "100%" : 0 }}
        transition={{ duration: 0.35 }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AIDescribePage() {
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef<SVGPathElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const path   = svgRef.current;
    const length = path.getTotalLength();
    path.style.strokeDasharray  = String(length);
    path.style.strokeDashoffset = String(length);
    animeAnimate(path, {
      strokeDashoffset: [length, 0],
      duration: 2800,
      ease: "easeInOutSine",
      delay: 800,
    });
  }, [mounted]);

  return (
    <div className="min-h-screen bg-[#060d18] text-white overflow-x-hidden">

      {/* ── Decorative SVG path ── */}
      <svg aria-hidden className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.04] z-0">
        <path
          ref={svgRef}
          d="M -100 500 Q 400 100 800 450 T 1600 200 T 2400 500"
          fill="none" stroke="#34d399" strokeWidth="1.5"
        />
      </svg>

      {/* ── Ambient orbs ── */}
      <motion.div aria-hidden
        className="pointer-events-none fixed top-[8%] left-[2%] w-[500px] h-[500px] rounded-full z-0"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div aria-hidden
        className="pointer-events-none fixed bottom-[10%] right-[4%] w-[400px] h-[400px] rounded-full z-0"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative z-10">

        {/* ══════════════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════════════ */}
        <section className="pt-24 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="flex flex-col gap-7">
              <AnimatePresence>
                {mounted && (
                  <>
                    {/* Badge */}
                    <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
                      <motion.span
                        className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-2"
                        animate={{ boxShadow: ["0 0 0 0 rgba(16,185,129,0.3)", "0 0 0 8px rgba(16,185,129,0)", "0 0 0 0 rgba(16,185,129,0.3)"] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        <Zap className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[11px] font-semibold text-emerald-300 tracking-widest uppercase">
                          AI Platform Overview
                        </span>
                      </motion.span>
                    </motion.div>

                    {/* Headline */}
                    <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
                      <h1 className="font-black text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.06] tracking-tight">
                        <span className="text-white">RentHome</span>
                        <br />
                        <span style={{
                          background: "linear-gradient(90deg,#34d399 0%,#a7f3d0 45%,#34d399 60%,#059669 100%)",
                          backgroundSize: "200% auto",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          animation: "shimmer 3s linear infinite",
                        }}>
                          Platform Architecture
                        </span>
                        <style>{`@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}`}</style>
                      </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
                      className="text-white/50 text-base leading-[1.75] max-w-[480px]"
                    >
                      A full-stack rental marketplace with role-based access control, Stripe-powered payments,
                      and a structured booking lifecycle — built on Next.js, Express, and PostgreSQL.
                    </motion.p>

                    {/* Tech stack pills */}
                    <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible"
                      className="flex flex-wrap gap-2"
                    >
                      {TECH_STACK.map((t, i) => (
                        <motion.span key={t.label}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.07 }}
                          className="inline-flex flex-col items-center px-3 py-1.5 rounded-lg border border-white/10 bg-white/4 text-[11px]"
                        >
                          <span className="text-white font-semibold">{t.label}</span>
                          <span className="text-white/35">{t.sub}</span>
                        </motion.span>
                      ))}
                    </motion.div>

                    {/* CTA */}
                    <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible"
                      className="flex gap-3 flex-wrap"
                    >
                      <Button asChild size="lg"
                        className="h-12 px-8 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/20 transition-all duration-300"
                      >
                        <Link href="/property">
                          Browse Properties <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg"
                        className="h-12 px-8 text-sm border-white/15 text-white/70 bg-transparent hover:bg-white/5 hover:border-white/25 transition-all duration-300"
                      >
                        <Link href="/signup">Get Started</Link>
                      </Button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Right — Lottie */}
            <AnimatePresence>
              {mounted && (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className="flex justify-center"
                >
                  <motion.div
                    className="relative w-full max-w-[500px]"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="absolute pointer-events-none z-0"
                      style={{ inset: "8%", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)", filter: "blur(40px)" }}
                    />
                    <motion.div
                      className="absolute inset-[-4%] rounded-full border border-emerald-500/8 pointer-events-none z-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute top-[5%] left-1/2 w-2 h-2 rounded-full bg-emerald-400/50 -translate-x-1/2" />
                    </motion.div>
                    <DotLottieReact
                      src="https://lottie.host/472dd31a-28c9-449c-9bc2-73fa73b21eda/L3A1NShAmP.lottie"
                      loop autoplay
                      style={{ width: "100%", height: "auto", position: "relative", zIndex: 1 }}
                    />
                    {/* Floating badge — bookings */}
                    <motion.div
                      className="absolute -bottom-3 -left-3 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-emerald-700/40 bg-[#0a1a12]/90 backdrop-blur-sm shadow-xl z-10"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <ClipboardList className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white leading-none">Booking Active</p>
                        <p className="text-[9px] text-white/35 mt-0.5">PAYMENT_PENDING</p>
                      </div>
                    </motion.div>
                    {/* Floating badge — live */}
                    <motion.div
                      className="absolute -top-3 -right-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-sky-700/40 bg-[#080f1a]/90 backdrop-blur-sm shadow-xl z-10"
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    >
                      <motion.span
                        className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                      />
                      <span className="text-[11px] font-semibold text-sky-300">3 Roles Active</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* ══════════════════════════════════════════════════════════════════
            STATS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-14 px-6 md:px-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/3"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xl font-black text-white leading-none">
                    <AnimatedCounter {...stat} />
                  </p>
                  <p className="text-[11px] text-white/35 mt-0.5">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* ══════════════════════════════════════════════════════════════════
            USER ROLES
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Platform Roles"
            title="Who uses RentHome?"
            subtitle="Three distinct roles with immutable permissions, each with dedicated API access and controlled capabilities."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map((role, i) => <RoleCard key={role.role} role={role} index={i} />)}
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* ══════════════════════════════════════════════════════════════════
            BOOKING LIFECYCLE
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Booking System"
            title="End-to-End Lifecycle"
            subtitle="A structured state machine governs every booking from creation to completion."
          />

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Workflow steps */}
            <div>
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-6">
                System Workflow
              </p>
              {WORKFLOW.map((step, i) => (
                <WorkflowItem key={i} step={step} index={i} total={WORKFLOW.length} />
              ))}
            </div>

            {/* Status pills + payment flow */}
            <div className="flex flex-col gap-6">
              {/* Booking statuses */}
              <Card className="bg-white/3 border-white/8 rounded-2xl">
                <CardContent className="p-6">
                  <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
                    Booking Statuses
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BOOKING_STATUSES.map((s, i) => (
                      <motion.span
                        key={s.label}
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className={`text-[11px] font-mono font-semibold px-3 py-1.5 rounded-full border ${s.color}`}
                      >
                        {s.label}
                      </motion.span>
                    ))}
                  </div>
                  <Separator className="bg-white/8 my-4" />
                  <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">
                    State Machine Rules
                  </p>
                  {[
                    "Booking must be ACCEPTED before payment can start",
                    "Payment required before status reaches CONFIRMED",
                    "User can cancel anytime before PAYMENT_PENDING",
                    "One payment per booking — enforced at API level",
                    "One review per booking — tied to CONFIRMED only",
                  ].map((rule, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="flex items-start gap-2 mb-2"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-emerald-400/60 flex-shrink-0 mt-0.5" />
                      <span className="text-[12.5px] text-white/45 leading-snug">{rule}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Payment flow card */}
              <Card className="bg-white/3 border-white/8 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-4 w-4 text-sky-400" />
                    <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                      Stripe Payment Flow
                    </p>
                  </div>
                  {[
                    { step: "01", label: "Create Intent",    api: "POST /api/payments/create-intent", out: "Returns clientSecret + paymentId" },
                    { step: "02", label: "Stripe UI",        api: "Client-side Stripe Elements",      out: "Card input rendered by Stripe" },
                    { step: "03", label: "Confirm Payment",  api: "POST /api/payments/confirm",        out: "Payment SUCCESS → Booking CONFIRMED" },
                  ].map((s, i) => (
                    <motion.div key={i}
                      variants={slideRight} custom={i}
                      initial="hidden" whileInView="visible"
                      viewport={{ once: true }}
                      className="flex gap-3 mb-4 last:mb-0"
                    >
                      <span className="text-[10px] font-bold text-emerald-400 mt-0.5 w-5 flex-shrink-0">{s.step}</span>
                      <div>
                        <p className="text-white text-[13px] font-semibold">{s.label}</p>
                        <p className="text-[11px] font-mono text-white/35 mt-0.5">{s.api}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{s.out}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* ══════════════════════════════════════════════════════════════════
            FEATURES GRID
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="System Features"
            title="What powers the platform?"
            subtitle="Every module is independently scoped, with clear API ownership and enforced business rules."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => <FeatureBlock key={f.title} feature={f} index={i} />)}
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* ══════════════════════════════════════════════════════════════════
            ARCHITECTURE
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Architecture"
            title="Engineering Principles"
            subtitle="The system is built around a layered backend, strict typing, and centralized validation."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Layers className="h-5 w-5 text-emerald-400" />,
                title: "Backend Layers",
                color: "border-emerald-700/30",
                points: ["Controller → Service → Repository pattern", "Role-based middleware (RBAC) at route level", "Centralized error handling", "Zod validation on all inputs", "Prisma ORM with strict TypeScript typing"],
              },
              {
                icon: <Building2 className="h-5 w-5 text-sky-400" />,
                title: "Frontend Architecture",
                color: "border-sky-700/30",
                points: ["App Router with Server Components for data fetching", "Client Components for interactivity", "Global auth session management", "API abstraction layer (hooks/services)", "Role-based UI rendering"],
              },
              {
                icon: <UserCheck className="h-5 w-5 text-violet-400" />,
                title: "Security Model",
                color: "border-violet-700/30",
                points: ["Role immutable after registration", "Only Admin can approve properties", "Session cookie required on all protected routes", "Banned users blocked at middleware", "One review and one payment per booking"],
              },
              {
                icon: <BarChart3 className="h-5 w-5 text-amber-400" />,
                title: "MVP Launch Scope",
                color: "border-amber-700/30",
                points: ["Authentication & session handling", "Owner property CRUD with image upload", "Admin approval workflow", "Public property browsing with filters", "Full booking + Stripe payment pipeline", "Review system + notification panel"],
              },
            ].map((block, i) => (
              <motion.div
                key={block.title}
                variants={scaleIn} custom={i}
                initial="hidden" whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className={`rounded-2xl border ${block.color} bg-white/3 p-6`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center">
                    {block.icon}
                  </div>
                  <h3 className="text-white font-bold text-sm">{block.title}</h3>
                </div>
                <ul className="space-y-2">
                  {block.points.map((p, j) => (
                    <motion.li key={j}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + j * 0.07 }}
                      className="flex items-start gap-2 text-[12.5px] text-white/50 leading-snug"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/60 flex-shrink-0 mt-0.5" />
                      {p}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* ══════════════════════════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 md:px-10 relative overflow-hidden">
          <motion.div aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 mb-7"
            >
              <Building2 className="h-8 w-8 text-emerald-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-5"
            >
              Ready to explore{" "}
              <span className="text-emerald-400">RentHome</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/45 text-lg mb-8 leading-relaxed"
            >
              Browse verified properties, book instantly, and pay securely — or list your property and reach thousands of verified tenants.
            </motion.p>

            {/* Trust pills */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 justify-center mb-8"
            >
              {["Free registration", "No hidden charges", "Verified properties", "24/7 Support"].map((pill, i) => (
                <motion.span key={pill}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-600/25 rounded-full px-4 py-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {pill}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Button asChild size="lg"
                className="h-13 px-10 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-xl shadow-emerald-500/20 transition-all duration-300"
              >
                <Link href="/property">
                  Browse Properties <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg"
                className="h-13 px-10 text-sm border-white/15 text-white/65 bg-transparent hover:bg-white/5 hover:border-white/25 transition-all duration-300"
              >
                <Link href="/signup">List Your Property</Link>
              </Button>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
}
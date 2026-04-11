"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import {
  Home,
  ShieldCheck,
  Star,
  Users,
  Building2,
  CreditCard,
  Bell,
  CheckCircle2,
  ArrowRight,
  MapPin,
  TrendingUp,
  Lock,
  Zap,
  Eye,
  UserCheck,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// ─── Pre-computed static data (no Math.random in render) ──────────────────────
const GRID_DOTS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: ((i % 10) / 9) * 100,
  y: (Math.floor(i / 10) / 5) * 100,
  delay: (i * 0.07) % 3,
  dur: 3 + (i % 4),
}));

const FLOAT_ORBS = [
  { w: 420, h: 420, top: "-8%", left: "-5%", color: "from-emerald-600/8 to-transparent", blur: "blur-[120px]" },
  { w: 350, h: 350, top: "30%", right: "-8%", color: "from-teal-500/6 to-transparent", blur: "blur-[100px]" },
  { w: 300, h: 300, bottom: "5%", left: "20%", color: "from-cyan-500/5 to-transparent", blur: "blur-[90px]" },
];

// ─── Animation Variants ────────────────────────────────────────────────────────
// Note: cubic-bezier arrays must be cast `as const` so TS infers the tuple
// type [number,number,number,number] instead of number[], which satisfies
// Framer Motion's `Easing` type.
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};
const fadeRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.65, ease: EASE } },
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 45, damping: 12 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target]);
  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Section Wrapper with scroll reveal ───────────────────────────────────────
function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Pill Label ───────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="flex justify-center mb-5">
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 text-xs font-bold text-emerald-400 tracking-widest uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {children}
      </span>
    </motion.div>
  );
}

// ─── Thin glowing divider ─────────────────────────────────────────────────────
function GlowDivider() {
  return (
    <div className="relative h-px w-full my-24 overflow-visible">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, suffix, label, color }: {
  icon: React.ElementType; value: number; suffix: string; label: string; color: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-500"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color}`} />
      <div className="relative z-10">
        <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors duration-300">
          <Icon className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-3xl font-black text-white tracking-tight">
          <AnimatedCounter target={value} suffix={suffix} />
        </p>
        <p className="text-sm text-slate-400 mt-1 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ icon: Icon, title, role, capabilities, gradient, delay }: {
  icon: React.ElementType; title: string; role: string;
  capabilities: string[]; gradient: string; delay: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:border-slate-600 transition-all duration-500 flex flex-col"
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-7 flex-1">
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} bg-opacity-10 shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{role}</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{title}</h3>
          </div>
        </div>
        <ul className="space-y-2.5">
          {capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-2.5 text-sm text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              {cap}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ number, title, desc, icon: Icon }: {
  number: string; title: string; desc: string; icon: React.ElementType;
}) {
  return (
    <motion.div variants={fadeUp} className="relative flex gap-5 group">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:border-emerald-400 group-hover:bg-emerald-500/20 transition-all duration-300">
          <span className="text-sm font-black text-emerald-400">{number}</span>
        </div>
        <div className="flex-1 w-px bg-gradient-to-b from-emerald-500/30 to-transparent mt-2" />
      </div>
      <div className="pb-10">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Feature Pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <motion.div
      variants={scaleIn}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-700/70 bg-slate-800/50 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 group cursor-default"
    >
      <Icon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
      <span className="text-sm text-slate-300 font-medium">{label}</span>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 overflow-x-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Fixed grid background ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.035) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16,185,129,0.035) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Ambient orbs ── */}
      {FLOAT_ORBS.map((orb, i) => (
        <div
          key={i}
          className={`fixed pointer-events-none z-0 rounded-full bg-gradient-radial ${orb.color} ${orb.blur}`}
          style={{ width: orb.w, height: orb.h, top: orb.top, left: (orb as any).left, right: (orb as any).right, bottom: (orb as any).bottom }}
        />
      ))}

      <div className="relative z-10">

        {/* ════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════ */}
        <section ref={heroRef} className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 text-center pt-24 pb-16">

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-7 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-widest uppercase hover:bg-emerald-500/15 cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" />
              Bangladesh Smartest Rental Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.93] mb-6 max-w-5xl"
          >
            <span className="text-white">Find Your</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Perfect Home.
            </span>
            <br />
            <span className="text-slate-300">Effortlessly.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.25 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          >
            RentHome is Bangladesh trusted rental marketplace — connecting verified property owners with tenants through a secure, payment-protected booking lifecycle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              asChild
              className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 font-bold rounded-xl border-0 shadow-xl shadow-emerald-500/20 transition-all duration-300"
            >
              <Link href="/signup">
                Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 px-8 border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 rounded-xl font-semibold transition-all duration-300"
            >
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1 text-slate-600"
            >
              <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════
            STATS
        ════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 pb-4">
          <RevealSection>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <SectionLabel>Platform at a Glance</SectionLabel>
              <h2 className="text-4xl font-black text-white">Numbers That Matter</h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Building2} value={12000} suffix="+" label="Properties Listed" color="from-emerald-500/5 to-transparent" />
              <StatCard icon={Users} value={48000} suffix="+" label="Happy Tenants" color="from-teal-500/5 to-transparent" />
              <StatCard icon={MapPin} value={6} suffix="" label="Major Cities" color="from-cyan-500/5 to-transparent" />
              <StatCard icon={Star} value={98} suffix="%" label="Satisfaction Rate" color="from-emerald-500/5 to-transparent" />
            </div>
          </RevealSection>
        </section>

        <GlowDivider />

        {/* ════════════════════════════════════════════
            MISSION
        ════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <RevealSection>
              <motion.div variants={fadeLeft}>
                <SectionLabel>Our Mission</SectionLabel>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                  Renting, Reimagined
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    for Bangladesh.
                  </span>
                </h2>
                <p className="text-slate-400 leading-relaxed text-lg mb-5">
                  We built RentHome to eliminate the friction, fraud, and frustration from Bangladesh's rental market. Every feature — from admin-approved listings to Stripe-secured payments — is designed around trust.
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Owners list with confidence. Tenants book with security. Admins maintain platform integrity. A three-way ecosystem where everyone wins.
                </p>
              </motion.div>
            </RevealSection>

            <RevealSection>
              <motion.div variants={fadeRight} className="grid grid-cols-1 gap-4">
                {[
                  { icon: ShieldCheck, title: "Admin-Verified Listings", desc: "Every property is reviewed and approved by our moderation team before going live.", color: "text-emerald-400" },
                  { icon: Lock, title: "Stripe-Secured Payments", desc: "Industry-grade payment protection with full booking lifecycle enforcement.", color: "text-teal-400" },
                  { icon: TrendingUp, title: "Smart Booking Lifecycle", desc: "PENDING → ACCEPTED → CONFIRMED — no payment moves without proper acceptance.", color: "text-cyan-400" },
                  { icon: Bell, title: "Real-time Notifications", desc: "Stay informed at every stage — bookings, payments, and status updates.", color: "text-emerald-300" },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-slate-700 transition-colors">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </RevealSection>
          </div>
        </section>

        <GlowDivider />

        {/* ════════════════════════════════════════════
            ROLES
        ════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4">
          <RevealSection>
            <SectionLabel>Three-Role Ecosystem</SectionLabel>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Who RentHome Serves</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Distinct roles with scoped access — role-based middleware enforces every boundary.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <RoleCard
                icon={Home}
                title="Tenant"
                role="USER Role"
                gradient="from-emerald-500 to-teal-500"
                delay={0}
                capabilities={[
                  "Browse & filter listings by city, area, rent",
                  "Create and track booking requests",
                  "Secure Stripe payment flow",
                  "Submit verified reviews post-stay",
                  "Real-time notification panel",
                ]}
              />
              <RoleCard
                icon={Building2}
                title="Landlord"
                role="OWNER Role"
                gradient="from-teal-500 to-cyan-500"
                delay={0.08}
                capabilities={[
                  "Full property CRUD with image upload",
                  "Accept or decline incoming bookings",
                  "Track performance & occupancy stats",
                  "Manage owner profile and visibility",
                  "View booking history & revenue",
                ]}
              />
              <RoleCard
                icon={BarChart3}
                title="Moderator"
                role="ADMIN Role"
                gradient="from-cyan-500 to-blue-500"
                delay={0.16}
                capabilities={[
                  "Approve or reject pending properties",
                  "Manage and ban platform users",
                  "Monitor payments & issue refunds",
                  "Oversee reviews & content quality",
                  "Access full analytics dashboard",
                ]}
              />
            </div>
          </RevealSection>
        </section>

        <GlowDivider />

        {/* ════════════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-start">

            {/* Tenant flow */}
            <RevealSection>
              <motion.div variants={fadeLeft} className="mb-8">
                <SectionLabel>Tenant Journey</SectionLabel>
                <h2 className="text-3xl font-black text-white">Book in 3 Steps</h2>
              </motion.div>
              <StepCard number="1" icon={Eye} title="Discover Properties"
                desc="Search verified listings across Dhaka, Chittagong, Sylhet and more. Filter by city, area, bedrooms, and budget." />
              <StepCard number="2" icon={CheckCircle2} title="Request a Booking"
                desc="Submit a booking request. The owner reviews and accepts — you get notified the moment it's approved." />
              <StepCard number="3" icon={CreditCard} title="Pay Securely"
                desc="Complete payment via Stripe once your booking is accepted. The booking is instantly CONFIRMED and locked." />
            </RevealSection>

            {/* Owner flow */}
            <RevealSection>
              <motion.div variants={fadeRight} className="mb-8">
                <SectionLabel>Owner Journey</SectionLabel>
                <h2 className="text-3xl font-black text-white">List in 3 Steps</h2>
              </motion.div>
              <StepCard number="1" icon={Building2} title="Create Your Listing"
                desc="Add property details, upload photos, set your rent price and availability — all from your owner dashboard." />
              <StepCard number="2" icon={UserCheck} title="Get Admin Approval"
                desc="Our moderation team reviews every listing before it goes live, ensuring quality and authenticity for tenants." />
              <StepCard number="3" icon={Zap} title="Manage Bookings"
                desc="Accept or decline incoming requests, track confirmed bookings, and view your property performance metrics." />
            </RevealSection>
          </div>
        </section>

        <GlowDivider />

        {/* ════════════════════════════════════════════
            PLATFORM FEATURES
        ════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4">
          <RevealSection>
            <SectionLabel>Platform Features</SectionLabel>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Everything You Need</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Built on Next.js + Express + PostgreSQL with Stripe payments and BetterAuth sessions.</p>
            </motion.div>

            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { icon: ShieldCheck, label: "Role-Based Access Control" },
                { icon: CreditCard, label: "Stripe Payment Integration" },
                { icon: Bell, label: "Real-time Notifications" },
                { icon: Star, label: "Verified Review System" },
                { icon: MapPin, label: "City & Area Filtering" },
                { icon: Lock, label: "Session Cookie Auth" },
                { icon: Building2, label: "Admin Property Approval" },
                { icon: BarChart3, label: "Analytics Dashboard" },
                { icon: TrendingUp, label: "Booking Lifecycle Engine" },
                { icon: Users, label: "Multi-role User System" },
                { icon: Zap, label: "Instant Booking Confirmation" },
                { icon: UserCheck, label: "Owner Profile Management" },
              ].map((f) => (
                <FeaturePill key={f.label} icon={f.icon} label={f.label} />
              ))}
            </div>
          </RevealSection>
        </section>

        <GlowDivider />

        {/* ════════════════════════════════════════════
            CTA
        ════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 pb-28">
          <RevealSection>
            <motion.div
              variants={scaleIn}
              className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-12 md:p-16 text-center"
            >
              {/* Glow inside card */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-b from-emerald-500/15 to-transparent blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/2 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <motion.div variants={fadeUp}>
                  <Badge className="mb-6 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-widest uppercase">
                    Join RentHome Today
                  </Badge>
                </motion.div>

                <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                  Ready to Find Your
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Next Home?
                  </span>
                </motion.h2>

                <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                  Join thousands of tenants and landlords across Bangladesh experiencing a better, safer way to rent.
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-13 px-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 font-bold rounded-xl border-0 shadow-xl shadow-emerald-500/25 transition-all duration-300 text-base"
                  >
                    <Link href="/signup">
                      Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-13 px-10 border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200 rounded-xl font-semibold transition-all duration-300 text-base"
                  >
                    <Link href="/properties">Explore Listings</Link>
                  </Button>
                </motion.div>

                {/* Trust markers */}
                <motion.div variants={fadeUp} className="flex flex-wrap gap-6 justify-center mt-10">
                  {["No listing fees for owners", "Stripe-secured payments", "Admin-verified properties"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {t}
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </RevealSection>
        </section>
      </div>
    </div>
  );
}
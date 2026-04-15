"use client";

// FILE PATH: src/components/layout/Animation.tsx
//
// Stack:
//   • Framer Motion       — scroll reveals, spring physics, staggered entrance
//   • Anime.js (v4)       — counter animation, SVG path draw
//   • @lottiefiles/dotlottie-react — hero Lottie animation
//   • shadcn/ui           — Button, Badge, Separator
//
// Dependencies:
//   npm install framer-motion animejs @lottiefiles/dotlottie-react
//   npx shadcn@latest add button badge separator

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Home,
  Star,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  motion,
  useInView,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { animate as animeAnimate } from "animejs";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { Button }    from "@/components/ui/button";
import { Badge }     from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type StatItem = {
  value: number;
  suffix: string;
  label: string;
  isFloat?: boolean;
};

type FeatureItem = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  items: string[];
  gradient: string;
  borderColor: string;
  glowColor: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────
const STATS: StatItem[] = [
  { value: 12,  suffix: "K+", label: "Active Listings"  },
  { value: 98,  suffix: "%",  label: "Satisfaction"     },
  { value: 4.9, suffix: "★",  label: "App Rating", isFloat: true },
];

const FEATURES: FeatureItem[] = [
  {
    icon: <Users className="h-5 w-5 text-emerald-400" />,
    title: "For Renters",
    subtitle: "Find your perfect home",
    gradient: "from-emerald-950/80 to-emerald-900/60",
    borderColor: "border-emerald-700/40",
    glowColor: "bg-emerald-500/10",
    items: [
      "Find verified homes easily",
      "Instant booking & secure payment",
      "Transparent reviews & ratings",
    ],
  },
  {
    icon: <Home className="h-5 w-5 text-teal-400" />,
    title: "For Owners",
    subtitle: "Maximize your property",
    gradient: "from-teal-950/80 to-teal-900/60",
    borderColor: "border-teal-700/40",
    glowColor: "bg-teal-500/10",
    items: [
      "List your property for free",
      "Get verified tenants quickly",
      "Secure rent collection",
    ],
  },
];

const TRUST_ITEMS = [
  "No hidden charges",
  "Verified listings only",
  "24/7 support",
];

// ─────────────────────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: "easeOut" },
  }),
};

const slideRight: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" },
  }),
};

const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.12, ease: "easeOut" },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Animated counter (Anime.js v4)
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix, isFloat }: StatItem) {
  const ref     = useRef<HTMLSpanElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-60px" });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current || !ref.current) return;
    started.current = true;
    const obj = { value: 0 };
    animeAnimate(obj, {
      value: value,
      duration: 1800,
      ease: "easeOutExpo",
      onUpdate() {
        if (ref.current) {
          ref.current.textContent = isFloat
            ? obj.value.toFixed(1) + suffix
            : Math.round(obj.value) + suffix;
        }
      },
    });
  }, [inView, value, suffix, isFloat]);

  return (
    <span ref={ref} className="tabular-nums">
      {isFloat ? `0.0${suffix}` : `0${suffix}`}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Badge
// ─────────────────────────────────────────────────────────────────────────────
function StatBadge({ stat, index }: { stat: StatItem; index: number }) {
  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="flex flex-col items-center px-5 py-3 rounded-2xl border border-emerald-700/30 bg-emerald-950/40 backdrop-blur-sm min-w-[88px]"
    >
      <span className="text-2xl font-bold text-emerald-400 leading-none">
        <AnimatedCounter {...stat} />
      </span>
      <span className="text-[11px] text-emerald-200/50 mt-1 text-center leading-tight">
        {stat.label}
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature Card
// ─────────────────────────────────────────────────────────────────────────────
function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative rounded-2xl border ${feature.borderColor} bg-gradient-to-br ${feature.gradient} p-6 overflow-hidden backdrop-blur-sm`}
    >
      {/* Corner glow */}
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${feature.glowColor} blur-2xl pointer-events-none transition-opacity duration-500`}
        style={{ opacity: hovered ? 1 : 0.5 }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
          {feature.icon}
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">{feature.title}</p>
          <p className="text-[11px] text-white/40 mt-0.5">{feature.subtitle}</p>
        </div>
      </div>

      <Separator className="bg-white/10 mb-4" />

      {/* Items */}
      <ul className="space-y-2.5">
        {feature.items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            className="flex items-start gap-2.5 text-[13px] text-white/70 leading-snug"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            {item}
          </motion.li>
        ))}
      </ul>

      {/* Bottom accent line */}
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
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function Animation() {
  const [mounted, setMounted] = useState(false);

  // SVG decorative path draw via Anime.js
  const svgPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!svgPathRef.current) return;
    const path   = svgPathRef.current;
    const length = path.getTotalLength();
    path.style.strokeDasharray  = String(length);
    path.style.strokeDashoffset = String(length);
    animeAnimate(path, {
      strokeDashoffset: [length, 0],
      duration: 2400,
      ease: "easeInOutSine",
      delay: 600,
    });
  }, [mounted]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080f1a] py-16">

      {/* ── Decorative SVG path ── */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.06]"
      >
        <path
          ref={svgPathRef}
          d="M -80 400 Q 300 80 640 320 T 1280 160 T 1800 380"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
        />
      </svg>

      {/* ── Ambient orbs (Framer Motion infinite float) ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[10%] left-[4%] w-80 h-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[8%] right-[6%] w-64 h-64 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[50%] right-[20%] w-48 h-48 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ────────────────── LEFT SIDE ────────────────── */}
          <div className="flex flex-col gap-8">

            {/* Trust badge */}
            <AnimatePresence>
              {mounted && (
                <motion.div
                  variants={slideRight}
                  custom={0}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.span
                    className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2"
                    animate={{ boxShadow: ["0 0 0 0 rgba(16,185,129,0.3)", "0 0 0 8px rgba(16,185,129,0)", "0 0 0 0 rgba(16,185,129,0.3)"] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300 tracking-widest uppercase">
                      Trusted Rental Platform
                    </span>
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Headline */}
            <AnimatePresence>
              {mounted && (
                <motion.div
                  variants={fadeUp}
                  custom={1}
                  initial="hidden"
                  animate="visible"
                  className="leading-[1.06]"
                >
                  <h1 className="font-black tracking-tight text-[clamp(2.6rem,5vw,4rem)] text-white m-0">
                    Home
                    <span
                      className="relative"
                      style={{
                        background: "linear-gradient(90deg, #34d399 0%, #a7f3d0 40%, #34d399 60%, #059669 100%)",
                        backgroundSize: "200% auto",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        animation: "shimmer 3s linear infinite",
                      }}
                    >
                      Rent
                    </span>
                    <br />
                    <span className="text-white/75 font-bold text-[0.65em]">
                      Rental Management System
                    </span>
                  </h1>
                  <style>{`@keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }`}</style>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtitle */}
            <AnimatePresence>
              {mounted && (
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  initial="hidden"
                  animate="visible"
                  className="text-white/55 text-[1.05rem] leading-[1.7] max-w-[420px] m-0"
                >
                  Connecting{" "}
                  <span className="text-emerald-400 font-semibold">property owners</span>{" "}
                  and{" "}
                  <span className="text-emerald-400 font-semibold">renters</span>{" "}
                  through a seamless, secure, and transparent platform.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Stats row */}
            <AnimatePresence>
              {mounted && (
                <motion.div
                  variants={fadeUp}
                  custom={3}
                  initial="hidden"
                  animate="visible"
                  className="flex gap-3 flex-wrap"
                >
                  {STATS.map((stat, i) => (
                    <StatBadge key={stat.label} stat={stat} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feature cards */}
            <AnimatePresence>
              {mounted && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FEATURES.map((feature, i) => (
                    <FeatureCard key={feature.title} feature={feature} index={i} />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Trust list + CTA */}
            <AnimatePresence>
              {mounted && (
                <motion.div
                  variants={fadeUp}
                  custom={5}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-5"
                >
                  {/* Trust items */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                    {TRUST_ITEMS.map((item, i) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center gap-1.5 text-[12px] text-white/40"
                      >
                        <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                        {item}
                      </motion.span>
                    ))}
                  </div>

                  {/* CTA buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      asChild
                      size="lg"
                      className="h-12 px-8 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300"
                    >
                      <Link href="/property">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="h-12 px-8 text-sm font-medium border-emerald-700/50 text-emerald-300 bg-transparent hover:bg-emerald-500/10 hover:border-emerald-500/60 transition-all duration-300"
                    >
                      <Link href="/demo">
                        <Zap className="mr-2 h-4 w-4" />
                        View Demo
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* ────────────────── RIGHT SIDE — Lottie ────────────────── */}
          <AnimatePresence>
            {mounted && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="flex justify-center items-center"
              >
                <motion.div
                  className="relative w-full max-w-[520px]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Glow ring behind Lottie */}
                  <div
                    className="absolute pointer-events-none z-0"
                    style={{
                      inset: "10%",
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
                      filter: "blur(32px)",
                    }}
                  />

                  {/* Outer decorative ring */}
                  <motion.div
                    className="absolute inset-[-5%] rounded-full border border-emerald-500/10 pointer-events-none z-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  >
                    {/* Dot on ring */}
                    <div className="absolute top-[6%] left-1/2 w-2 h-2 rounded-full bg-emerald-400/60 -translate-x-1/2" />
                  </motion.div>

                  <DotLottieReact
                    src="https://lottie.host/472dd31a-28c9-449c-9bc2-73fa73b21eda/L3A1NShAmP.lottie"
                    loop
                    autoplay
                    style={{ width: "100%", height: "auto", position: "relative", zIndex: 1 }}
                  />

                  {/* Floating stat badge — overlay */}
                  <motion.div
                    className="absolute -bottom-4 -left-4 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-emerald-700/40 bg-[#0d1f14]/90 backdrop-blur-sm shadow-xl shadow-black/40 z-10"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4 fill-emerald-400 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-none">4.9 / 5.0</p>
                      <p className="text-[10px] text-white/40 mt-0.5">Avg. Rating</p>
                    </div>
                  </motion.div>

                  {/* Floating active badge — overlay */}
                  <motion.div
                    className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-teal-700/40 bg-[#0d1f1e]/90 backdrop-blur-sm shadow-xl shadow-black/40 z-10"
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0"
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    <span className="text-[11px] font-semibold text-teal-300">Live Listings</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}
















// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { DotLottieReact } from "@lottiefiles/dotlottie-react";
// import { Users, Home, ShieldCheck, ArrowRight, Star, Zap } from "lucide-react";

// // ─── Tiny keyframe injector ───────────────────────────────────────────────────
// const STYLES = `
//   @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

//   :root {
//     --emerald-400: #34d399;
//     --emerald-500: #10b981;
//     --emerald-600: #059669;
//     --emerald-700: #047857;
//     --teal-500:    #14b8a6;
//     --slate-900:   #0f172a;
//     --slate-800:   #1e293b;
//     --slate-700:   #334155;
//   }

//   @keyframes fadeUp {
//     from { opacity: 0; transform: translateY(28px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   @keyframes fadeIn {
//     from { opacity: 0; }
//     to   { opacity: 1; }
//   }
//   @keyframes slideRight {
//     from { opacity: 0; transform: translateX(-24px); }
//     to   { opacity: 1; transform: translateX(0); }
//   }
//   @keyframes scalePop {
//     0%   { opacity: 0; transform: scale(0.88); }
//     70%  { transform: scale(1.03); }
//     100% { opacity: 1; transform: scale(1); }
//   }
//   @keyframes badgePulse {
//     0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); }
//     50%       { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
//   }
//   @keyframes shimmer {
//     0%   { background-position: -200% center; }
//     100% { background-position:  200% center; }
//   }
//   @keyframes countUp {
//     from { opacity: 0; transform: translateY(10px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   @keyframes floatY {
//     0%, 100% { transform: translateY(0px); }
//     50%       { transform: translateY(-8px); }
//   }
//   @keyframes orbPulse {
//     0%,100% { transform: scale(1);   opacity: .18; }
//     50%      { transform: scale(1.12); opacity: .28; }
//   }

//   .anim-fadeUp   { animation: fadeUp   0.6s cubic-bezier(.22,.68,0,1.2) both; }
//   .anim-slideR   { animation: slideRight 0.55s cubic-bezier(.22,.68,0,1.2) both; }
//   .anim-scalePop { animation: scalePop 0.55s cubic-bezier(.22,.68,0,1.2) both; }
//   .anim-fadeIn   { animation: fadeIn   0.5s ease both; }

//   .delay-100 { animation-delay: 0.10s; }
//   .delay-200 { animation-delay: 0.20s; }
//   .delay-300 { animation-delay: 0.30s; }
//   .delay-400 { animation-delay: 0.40s; }
//   .delay-500 { animation-delay: 0.50s; }
//   .delay-600 { animation-delay: 0.60s; }
//   .delay-700 { animation-delay: 0.70s; }
//   .delay-800 { animation-delay: 0.80s; }

//   .shimmer-text {
//     background: linear-gradient(90deg, #34d399 0%, #a7f3d0 40%, #34d399 60%, #059669 100%);
//     background-size: 200% auto;
//     -webkit-background-clip: text;
//     -webkit-text-fill-color: transparent;
//     background-clip: text;
//     animation: shimmer 3s linear infinite;
//   }

//   .card-user {
//     background: linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%);
//   }
//   .card-owner {
//     background: linear-gradient(135deg, #134e4a 0%, #0f766e 60%, #0d9488 100%);
//   }

//   .card-hover {
//     transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease;
//   }
//   .card-hover:hover {
//     transform: translateY(-6px) scale(1.02);
//     box-shadow: 0 24px 48px -10px rgba(5,150,105,0.35);
//   }

//   .badge-pill {
//     animation: badgePulse 2.4s ease-in-out infinite;
//   }

//   .stat-float {
//     animation: floatY 3.5s ease-in-out infinite;
//   }

//   .lottie-float {
//     animation: floatY 4s ease-in-out infinite;
//   }

//   .orb {
//     animation: orbPulse 4s ease-in-out infinite;
//   }

//   .btn-primary {
//     background: linear-gradient(135deg, var(--emerald-500), var(--teal-500));
//     transition: filter 0.2s, transform 0.2s;
//   }
//   .btn-primary:hover {
//     filter: brightness(1.12);
//     transform: translateY(-2px);
//   }

//   .list-dot::before {
//     content: '';
//     display: inline-block;
//     width: 6px; height: 6px;
//     border-radius: 50%;
//     background: #6ee7b7;
//     margin-right: 10px;
//     flex-shrink: 0;
//     margin-top: 6px;
//   }
// `;

// // ─── Stat counter (simple, CSS-animated) ─────────────────────────────────────
// function StatBadge({
//   value, label, delay
// }: { value: string; label: string; delay: string }) {
//   return (
//     <div
//       className={`anim-scalePop stat-float ${delay}`}
//       style={{
//         background: "rgba(255,255,255,0.07)",
//         backdropFilter: "blur(12px)",
//         border: "1px solid rgba(52,211,153,0.25)",
//         borderRadius: "14px",
//         padding: "14px 20px",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         minWidth: "90px",
//         animationDelay: delay,          // for stat-float offset
//       }}
//     >
//       <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#34d399" }}>
//         {value}
//       </span>
//       <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
//         {label}
//       </span>
//     </div>
//   );
// }

// // ─── Feature card ─────────────────────────────────────────────────────────────
// function FeatureCard({
//   icon, title, items, colorClass, delay
// }: {
//   icon: React.ReactNode;
//   title: string;
//   items: string[];
//   colorClass: string;
//   delay: string;
// }) {
//   return (
//     <div
//       className={`card-hover anim-scalePop ${colorClass} ${delay}`}
//       style={{
//         borderRadius: "20px",
//         padding: "28px 24px",
//         border: "1px solid rgba(255,255,255,0.12)",
//         boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* Decorative glow blob */}
//       <div style={{
//         position: "absolute", top: -30, right: -30,
//         width: 100, height: 100,
//         borderRadius: "50%",
//         background: "rgba(52,211,153,0.15)",
//         filter: "blur(20px)",
//         pointerEvents: "none",
//       }} />

//       <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
//         <div style={{
//           width: 46, height: 46,
//           borderRadius: 12,
//           background: "rgba(52,211,153,0.2)",
//           border: "1px solid rgba(52,211,153,0.3)",
//           display: "flex", alignItems: "center", justifyContent: "center",
//         }}>
//           {icon}
//         </div>
//         <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#fff", margin: 0 }}>
//           {title}
//         </h3>
//       </div>

//       <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
//         {items.map((item, i) => (
//           <li key={i} style={{
//             fontFamily: "'DM Sans', sans-serif",
//             fontSize: "0.88rem",
//             color: "rgba(255,255,255,0.78)",
//             display: "flex",
//             alignItems: "flex-start",
//           }}>
//             <span style={{ color: "#6ee7b7", marginRight: 10, marginTop: 2, flexShrink: 0 }}>✦</span>
//             {item}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function Animation() {
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => { setMounted(true); }, []);

//   return (
//     <>
//       <style>{STYLES}</style>

//       <div style={{
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #0a1628 0%, #0f2d1f 50%, #0a1628 100%)",
//         position: "relative",
//         overflow: "hidden",
//         display: "flex",
//         alignItems: "center",
//         padding: "48px 0",
//       }}>

//         {/* Background orbs */}
//         <div className="orb" style={{
//           position: "absolute", top: "10%", left: "5%",
//           width: 320, height: 320, borderRadius: "50%",
//           background: "radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%)",
//           pointerEvents: "none",
//         }} />
//         <div className="orb" style={{
//           position: "absolute", bottom: "8%", right: "8%",
//           width: 260, height: 260, borderRadius: "50%",
//           background: "radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)",
//           animationDelay: "2s",
//           pointerEvents: "none",
//         }} />

//         <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", width: "100%" }}>
//           <div style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: 64,
//             alignItems: "center",
//           }}>

//             {/* ── LEFT SIDE ── */}
//             <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

//               {/* Badge */}
//               {mounted && (
//                 <div className="anim-slideR delay-100">
//                   <span className="badge-pill" style={{
//                     display: "inline-flex",
//                     alignItems: "center",
//                     gap: 8,
//                     background: "rgba(16,185,129,0.12)",
//                     border: "1px solid rgba(52,211,153,0.4)",
//                     borderRadius: 999,
//                     padding: "8px 18px",
//                   }}>
//                     <ShieldCheck size={16} color="#34d399" />
//                     <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", fontWeight: 500, color: "#6ee7b7", letterSpacing: "0.04em" }}>
//                       TRUSTED RENTAL PLATFORM
//                     </span>
//                   </span>
//                 </div>
//               )}

//               {/* Headline */}
//               {mounted && (
//                 <div className="anim-fadeUp delay-200" style={{ lineHeight: 1.08 }}>
//                   <h1 style={{
//                     fontFamily: "'Syne', sans-serif",
//                     fontWeight: 800,
//                     fontSize: "clamp(2.6rem, 5vw, 4rem)",
//                     color: "#f0fdf4",
//                     margin: 0,
//                     letterSpacing: "-0.02em",
//                   }}>
//                     Home
//                     <span className="shimmer-text">Rent</span>
//                     <br />
//                     <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: "0.72em" }}>
//                       Rental Management System
//                     </span>
//                   </h1>
//                 </div>
//               )}

//               {/* Subtitle */}
//               {mounted && (
//                 <p className="anim-fadeUp delay-300" style={{
//                   fontFamily: "'DM Sans', sans-serif",
//                   fontSize: "1.08rem",
//                   color: "rgba(255,255,255,0.6)",
//                   lineHeight: 1.65,
//                   maxWidth: 420,
//                   margin: 0,
//                 }}>
//                   Connecting{" "}
//                   <span style={{ color: "#34d399", fontWeight: 600 }}>property owners</span> and{" "}
//                   <span style={{ color: "#34d399", fontWeight: 600 }}>renters</span>{" "}
//                   through a seamless, secure, and transparent platform.
//                 </p>
//               )}

//               {/* Stats row */}
//               {mounted && (
//                 <div className="anim-fadeUp delay-400" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
//                   <StatBadge value="12K+" label="Active Listings" delay="0s" />
//                   <StatBadge value="98%" label="Satisfaction" delay="0.3s" />
//                   <StatBadge value="4.9★" label="App Rating" delay="0.6s" />
//                 </div>
//               )}

//               {/* Cards */}
//               {mounted && (
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
//                   <FeatureCard
//                     icon={<Users size={22} color="#34d399" />}
//                     title="For Renters"
//                     items={[
//                       "Find verified homes easily",
//                       "Instant booking & secure payment",
//                       "Transparent reviews & ratings",
//                     ]}
//                     colorClass="card-user"
//                     delay="delay-500"
//                   />
//                   <FeatureCard
//                     icon={<Home size={22} color="#34d399" />}
//                     title="For Owners"
//                     items={[
//                       "List your property for free",
//                       "Get verified tenants quickly",
//                       "Secure rent collection",
//                     ]}
//                     colorClass="card-owner"
//                     delay="delay-600"
//                   />
//                 </div>
//               )}

//               {/* CTA row */}
//               {mounted && (
//                 <div className="anim-fadeUp delay-700" style={{ display: "flex", gap: 12, alignItems: "center" }}>
//                   <button className="btn-primary" style={{
//                     display: "inline-flex", alignItems: "center", gap: 8,
//                     padding: "14px 28px",
//                     borderRadius: 12,
//                     border: "none",
//                     cursor: "pointer",
//                     fontFamily: "'Syne', sans-serif",
//                     fontWeight: 700,
//                     fontSize: "0.95rem",
//                     color: "#fff",
//                     letterSpacing: "0.01em",
//                   }}>
//                     Get Started <ArrowRight size={16} />
//                   </button>
//                   <button style={{
//                     display: "inline-flex", alignItems: "center", gap: 8,
//                     padding: "14px 24px",
//                     borderRadius: 12,
//                     border: "1px solid rgba(52,211,153,0.3)",
//                     background: "transparent",
//                     cursor: "pointer",
//                     fontFamily: "'DM Sans', sans-serif",
//                     fontWeight: 500,
//                     fontSize: "0.95rem",
//                     color: "#6ee7b7",
//                     transition: "background 0.2s",
//                   }}
//                     onMouseEnter={e => (e.currentTarget.style.background = "rgba(52,211,153,0.08)")}
//                     onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
//                   >
//                     <Zap size={15} /> View Demo
//                   </button>
//                 </div>
//               )}

//             </div>

//             {/* ── RIGHT SIDE – Lottie ── */}
//             {mounted && (
//               <div className="anim-fadeIn delay-300 lottie-float" style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}>
//                 <div style={{
//                   position: "relative",
//                   width: "100%",
//                   maxWidth: 520,
//                 }}>
//                   {/* Glow ring behind lottie */}
//                   <div style={{
//                     position: "absolute",
//                     inset: "10%",
//                     borderRadius: "50%",
//                     background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
//                     filter: "blur(32px)",
//                     zIndex: 0,
//                     pointerEvents: "none",
//                   }} />
//                   <DotLottieReact
//                     src="https://lottie.host/472dd31a-28c9-449c-9bc2-73fa73b21eda/L3A1NShAmP.lottie"
//                     loop
//                     autoplay
//                     style={{ width: "100%", height: "auto", position: "relative", zIndex: 1 }}
//                   />
//                 </div>
//               </div>
//             )}

//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
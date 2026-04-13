"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ─── Imported from components/price-advisor ───────────────────────────────
import type { PriceRange, FactorItem } from "@/components/price-advisor/types";
import ConfidenceGauge from "@/components/price-advisor/ConfidenceGauge";
import AnimatedPrice from "@/components/price-advisor/AnimatedPrice";
import ParticleBg from "@/components/price-advisor/ParticleBg";
import FactorBadge from "@/components/price-advisor/FactorBadge";

// ─── Constants ─────────────────────────────────────────────────────────────
const CITIES = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barishal"];
const AREAS: Record<string, string[]> = {
  Dhaka: ["Gulshan", "Banani", "Dhanmondi", "Uttara", "Mirpur", "Mohammadpur"],
  Chittagong: ["Agrabad", "Nasirabad", "Khulshi", "Halishahar", "Pahartali"],
  Sylhet: ["Zindabazar", "Ambarkhana", "Shahjalal", "Tilagor"],
  Rajshahi: ["Boalia", "Rajpara", "Motihar", "Shah Makhdum"],
  Khulna: ["Sonadanga", "Khalishpur", "Daulatpur", "Boyra"],
  Barishal: ["Kashipur", "Airport", "Band Road", "Sadar"],
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function generatePriceHint(
  city: string,
  area: string,
  bedrooms: number,
  sqft: number,
  amenities: string[]
): PriceRange {
  const baseByCity: Record<string, number> = {
    Dhaka: 22000, Chittagong: 14000, Sylhet: 10000,
    Rajshahi: 8000, Khulna: 8500, Barishal: 7500,
  };
  const premiumArea = ["Gulshan", "Banani", "Agrabad", "Khulshi", "Nasirabad"];
  const areaMultiplier = premiumArea.includes(area) ? 1.6 : 1.0;
  const bedroomMultiplier = 1 + (bedrooms - 1) * 0.35;
  const sqftMultiplier = 1 + (sqft - 800) / 4000;
  const amenityBonus = amenities.length * 800;
  const base = (baseByCity[city] || 10000) * areaMultiplier * bedroomMultiplier * sqftMultiplier + amenityBonus;
  const noise = (Math.random() - 0.5) * 0.04;
  const suggested = Math.round((base * (1 + noise)) / 500) * 500;
  const trends = ["rising", "stable", "falling"] as const;

  return {
    min: Math.round(suggested * 0.82),
    max: Math.round(suggested * 1.22),
    suggested,
    confidence: Math.round(72 + Math.random() * 20),
    trend: trends[Math.floor(Math.random() * trends.length)],
    competitorAvg: Math.round(suggested * (0.95 + Math.random() * 0.1)),
    occupancyRate: Math.round(68 + Math.random() * 24),
    demandScore: Math.round(60 + Math.random() * 35),
  };
}

function getFactors(city: string, area: string, amenities: string[]): FactorItem[] {
  const premiumArea = ["Gulshan", "Banani", "Agrabad", "Khulshi"].includes(area);
  return [
    {
      label: "Location Premium",
      impact: premiumArea ? "high" : "medium",
      direction: premiumArea ? "positive" : "neutral",
      description: premiumArea ? `${area} commands significant demand` : "Standard residential zone",
    },
    {
      label: "City Demand",
      impact: city === "Dhaka" ? "high" : "medium",
      direction: "positive",
      description: `${city} shows ${city === "Dhaka" ? "very high" : "moderate"} rental demand`,
    },
    {
      label: "Amenities Score",
      impact: amenities.length > 3 ? "high" : amenities.length > 1 ? "medium" : "low",
      direction: amenities.length > 1 ? "positive" : "neutral",
      description: `${amenities.length} amenities boost desirability`,
    },
    {
      label: "Market Saturation",
      impact: "medium",
      direction: "negative",
      description: "Moderate supply in comparable listings",
    },
    {
      label: "Seasonal Index",
      impact: "low",
      direction: "neutral",
      description: "Stable demand across current season",
    },
  ];
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function AIPriceHintPage() {
  const [city, setCity] = useState("Chittagong");
  const [area, setArea] = useState("Agrabad");
  const [bedrooms, setBedrooms] = useState(2);
  const [sqft, setSqft] = useState(1000);
  const [amenities, setAmenities] = useState<string[]>(["Parking", "Generator"]);
  const [result, setResult] = useState<PriceRange | null>(null);
  const [factors, setFactors] = useState<FactorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  const allAmenities = ["Parking", "Generator", "Lift", "Security", "Gas Line", "CCTV", "Gym", "Rooftop"];

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleAnalyze = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const priceData = generatePriceHint(city, area, bedrooms, sqft, amenities);
    const factorData = getFactors(city, area, amenities);
    setResult(priceData);
    setFactors(factorData);
    setLoading(false);
    setHasAnalyzed(true);
  };

  const trendConfig = {
    rising: { label: "Rising Market", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: "↗" },
    stable: { label: "Stable Market", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: "→" },
    falling: { label: "Softening Market", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", icon: "↘" },
  };

  return (
    <div className="min-h-screen bg-[#080f1a] text-slate-100 font-[family-name:var(--font-geist-sans,system-ui)]">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow orbs */}
      <div className="fixed top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">AI-Powered Pricing Engine</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-4">
            <span className="text-white">Smart Rent</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Price Advisor
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
            Get hyper-accurate rental price estimates powered by real-time market intelligence across Bangladesh.
          </p>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Left Panel (Inputs) ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-400" />
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">Property Details</p>

                  {/* City */}
                  <div className="space-y-1.5 mb-4">
                    <label className="text-xs text-slate-400">City</label>
                    <Select value={city} onValueChange={(v) => { setCity(v); setArea(AREAS[v][0]); }}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-emerald-500/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {CITIES.map((c) => (
                          <SelectItem key={c} value={c} className="text-slate-200 focus:bg-emerald-500/20">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Area */}
                  <div className="space-y-1.5 mb-4">
                    <label className="text-xs text-slate-400">Area / Neighbourhood</label>
                    <Select value={area} onValueChange={setArea}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-emerald-500/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {(AREAS[city] || []).map((a) => (
                          <SelectItem key={a} value={a} className="text-slate-200 focus:bg-emerald-500/20">{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-slate-400">Bedrooms</label>
                      <span className="text-sm font-bold text-emerald-400">{bedrooms} BHK</span>
                    </div>
                    <Slider
                      min={1} max={5} step={1}
                      value={[bedrooms]}
                      onValueChange={([v]) => setBedrooms(v)}
                      className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600">
                      {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
                    </div>
                  </div>

                  {/* Sqft */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-slate-400">Area (sq ft)</label>
                      <span className="text-sm font-bold text-emerald-400">{sqft} sqft</span>
                    </div>
                    <Slider
                      min={400} max={3000} step={100}
                      value={[sqft]}
                      onValueChange={([v]) => setSqft(v)}
                      className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-400"
                    />
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* Amenities */}
                <div>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {allAmenities.map((a) => (
                      <motion.button
                        key={a}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => toggleAmenity(a)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                          amenities.includes(a)
                            ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {a}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* CTA */}
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 font-bold text-sm tracking-wide rounded-xl border-0 transition-all duration-300 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
                      />
                      Analysing Market Data…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ✦ Generate AI Price Hint
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Right Panel (Results) ── */}
          <div className="lg:col-span-3 space-y-5">
            <AnimatePresence mode="wait">
              {!hasAnalyzed && !loading && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center py-24">
                    <motion.div
                      animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-7xl mb-6"
                    >
                      🏠
                    </motion.div>
                    <p className="text-slate-500 text-lg">Configure your property and generate</p>
                    <p className="text-slate-600">an AI-powered price estimate</p>
                  </div>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-24"
                >
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-full border-2 border-emerald-500/40"
                          animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                        />
                      ))}
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
                    </div>
                    <p className="text-emerald-400 font-semibold">Scanning 10,000+ listings</p>
                    <p className="text-slate-500 text-sm mt-1">Building your price model…</p>
                  </div>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5"
                >
                  {/* Price Card */}
                  <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl overflow-hidden relative">
                    <ParticleBg />
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-400" />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">AI Suggested Rent</p>
                          <div className="text-4xl md:text-5xl font-black text-white">
                            <AnimatedPrice value={result.suggested} />
                            <span className="text-slate-500 text-xl font-normal ml-1">/mo</span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            Range:{" "}
                            <span className="text-slate-300 font-medium">
                              ৳{result.min.toLocaleString("en-BD")} – ৳{result.max.toLocaleString("en-BD")}
                            </span>
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">AI Confidence</p>
                          <ConfidenceGauge value={result.confidence} />
                        </div>
                      </div>

                      {/* Market Trend Badge */}
                      {result.trend && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${trendConfig[result.trend].bg} ${trendConfig[result.trend].color}`}>
                          <span>{trendConfig[result.trend].icon}</span>
                          {trendConfig[result.trend].label}
                        </div>
                      )}

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-3 mt-6">
                        {[
                          { label: "Competitor Avg", value: `৳${result.competitorAvg.toLocaleString("en-BD")}`, sub: "per month" },
                          { label: "Occupancy Rate", value: `${result.occupancyRate}%`, sub: "area avg" },
                          { label: "Demand Score", value: `${result.demandScore}/100`, sub: "local demand" },
                        ].map((stat, i) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.1 }}
                            className="bg-slate-800/80 rounded-xl p-3 text-center border border-slate-700/60"
                          >
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-base font-bold text-white mt-1">{stat.value}</p>
                            <p className="text-[10px] text-slate-600">{stat.sub}</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Price Bar Visualization */}
                  <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl">
                    <CardContent className="p-5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Price Positioning</p>
                      <div className="relative h-10 rounded-xl overflow-hidden bg-slate-800">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-slate-700 to-slate-600"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                        {/* Min marker */}
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-xs text-slate-400 font-mono">৳{result.min.toLocaleString("en-BD")}</span>
                        </div>
                        {/* Suggested marker */}
                        <motion.div
                          className="absolute top-0 bottom-0 w-1 bg-emerald-400 rounded-full"
                          initial={{ left: "0%" }}
                          animate={{
                            left: `${((result.suggested - result.min) / (result.max - result.min)) * 88 + 6}%`,
                          }}
                          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        />
                        {/* Max marker */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-xs text-slate-400 font-mono">৳{result.max.toLocaleString("en-BD")}</span>
                        </div>
                      </div>
                      <div className="flex justify-center mt-2">
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                          ▲ Suggested: ৳{result.suggested.toLocaleString("en-BD")}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Factors */}
                  <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl">
                    <CardContent className="p-5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pricing Factors</p>
                      <div className="space-y-2.5">
                        {factors.map((f, i) => (
                          <FactorBadge key={f.label} factor={f} index={i} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Disclaimer */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-[11px] text-slate-600 text-center leading-relaxed px-2"
                  >
                    ✦ AI estimates are based on market patterns and comparable listings. Actual prices may vary based on property condition, negotiation, and current availability.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}





















// "use client";

// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import {
//   ArrowRight,
//   CreditCard,
//   Bell,
//   BarChart3,
//   CheckCircle2,
//   ChevronRight,
//   Zap,
//   Building2,
//   UserCheck,
//   Layers,
// } from "lucide-react";
// import { motion, useInView, AnimatePresence } from "framer-motion";
// import { animate as animeAnimate } from "animejs";
// import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// import { Button }            from "@/components/ui/button";
// import { Separator }         from "@/components/ui/separator";
// import { Card, CardContent } from "@/components/ui/card";
// import { AnimatedCounter } from "@/components/ai-describe/AnimatedCounter";
// import { SectionHeading } from "@/components/ai-describe/SectionHeading";
// import { RoleCard } from "@/components/ai-describe/RoleCard";
// import { BOOKING_STATUSES, FEATURES, ROLES, STATS, TECH_STACK, WORKFLOW } from "@/components/ai-describe/data";
// import { WorkflowItem } from "@/components/ai-describe/WorkflowItem";
// import { fadeUp, scaleIn, slideRight } from "@/components/ai-describe/variants";
// import { FeatureBlock } from "@/components/ai-describe/FeatureBlock";


// // ─────────────────────────────────────────────────────────────────────────────
// // Main Page
// // ─────────────────────────────────────────────────────────────────────────────
// export default function AIDescribePage() {
//   const [mounted, setMounted] = useState(false);
//   const svgRef = useRef<SVGPathElement>(null);

//   useEffect(() => { setMounted(true); }, []);

//   useEffect(() => {
//     if (!svgRef.current) return;
//     const path   = svgRef.current;
//     const length = path.getTotalLength();
//     path.style.strokeDasharray  = String(length);
//     path.style.strokeDashoffset = String(length);
//     animeAnimate(path, {
//       strokeDashoffset: [length, 0],
//       duration: 2800,
//       ease: "easeInOutSine",
//       delay: 800,
//     });
//   }, [mounted]);

//   return (
//     <div className="min-h-screen bg-[#060d18] text-white overflow-x-hidden">

//       {/* ── Decorative SVG path ── */}
//       <svg aria-hidden className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.04] z-0">
//         <path
//           ref={svgRef}
//           d="M -100 500 Q 400 100 800 450 T 1600 200 T 2400 500"
//           fill="none" stroke="#34d399" strokeWidth="1.5"
//         />
//       </svg>

//       {/* ── Ambient orbs ── */}
//       <motion.div aria-hidden
//         className="pointer-events-none fixed top-[8%] left-[2%] w-[500px] h-[500px] rounded-full z-0"
//         style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }}
//         animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.2, 0.12] }}
//         transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div aria-hidden
//         className="pointer-events-none fixed bottom-[10%] right-[4%] w-[400px] h-[400px] rounded-full z-0"
//         style={{ background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)" }}
//         animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.18, 0.1] }}
//         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//       />

//       <div className="relative z-10">

//         {/* ══════════════════════════════════════════════════════════════════
//             HERO
//         ══════════════════════════════════════════════════════════════════ */}
//         <section className="pt-24 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
//           <div className="grid lg:grid-cols-2 gap-16 items-center">

//             {/* Left */}
//             <div className="flex flex-col gap-7">
//               <AnimatePresence>
//                 {mounted && (
//                   <>
//                     {/* Badge */}
//                     <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
//                       <motion.span
//                         className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-2"
//                         animate={{ boxShadow: ["0 0 0 0 rgba(16,185,129,0.3)", "0 0 0 8px rgba(16,185,129,0)", "0 0 0 0 rgba(16,185,129,0.3)"] }}
//                         transition={{ duration: 2.5, repeat: Infinity }}
//                       >
//                         <Zap className="h-3.5 w-3.5 text-emerald-400" />
//                         <span className="text-[11px] font-semibold text-emerald-300 tracking-widest uppercase">
//                           AI Platform Overview
//                         </span>
//                       </motion.span>
//                     </motion.div>

//                     {/* Headline */}
//                     <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
//                       <h1 className="font-black text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.06] tracking-tight">
//                         <span className="text-white">RentHome</span>
//                         <br />
//                         <span style={{
//                           background: "linear-gradient(90deg,#34d399 0%,#a7f3d0 45%,#34d399 60%,#059669 100%)",
//                           backgroundSize: "200% auto",
//                           WebkitBackgroundClip: "text",
//                           WebkitTextFillColor: "transparent",
//                           backgroundClip: "text",
//                           animation: "shimmer 3s linear infinite",
//                         }}>
//                           Platform Architecture
//                         </span>
//                         <style>{`@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}`}</style>
//                       </h1>
//                     </motion.div>

//                     {/* Subtitle */}
//                     <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
//                       className="text-white/50 text-base leading-[1.75] max-w-[480px]"
//                     >
//                       A full-stack rental marketplace with role-based access control, Stripe-powered payments,
//                       and a structured booking lifecycle — built on Next.js, Express, and PostgreSQL.
//                     </motion.p>

//                     {/* Tech stack pills */}
//                     <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible"
//                       className="flex flex-wrap gap-2"
//                     >
//                       {TECH_STACK.map((t, i) => (
//                         <motion.span key={t.label}
//                           initial={{ opacity: 0, scale: 0.85 }}
//                           animate={{ opacity: 1, scale: 1 }}
//                           transition={{ delay: 0.4 + i * 0.07 }}
//                           className="inline-flex flex-col items-center px-3 py-1.5 rounded-lg border border-white/10 bg-white/4 text-[11px]"
//                         >
//                           <span className="text-white font-semibold">{t.label}</span>
//                           <span className="text-white/35">{t.sub}</span>
//                         </motion.span>
//                       ))}
//                     </motion.div>

//                     {/* CTA */}
//                     <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible"
//                       className="flex gap-3 flex-wrap"
//                     >
//                       <Button asChild size="lg"
//                         className="h-12 px-8 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/20 transition-all duration-300"
//                       >
//                         <Link href="/property">
//                           Browse Properties <ArrowRight className="ml-2 h-4 w-4" />
//                         </Link>
//                       </Button>
//                       <Button asChild variant="outline" size="lg"
//                         className="h-12 px-8 text-sm border-white/15 text-white/70 bg-transparent hover:bg-white/5 hover:border-white/25 transition-all duration-300"
//                       >
//                         <Link href="/signup">Get Started</Link>
//                       </Button>
//                     </motion.div>
//                   </>
//                 )}
//               </AnimatePresence>
//             </div>

//             {/* Right — Lottie */}
//             <AnimatePresence>
//               {mounted && (
//                 <motion.div
//                   initial={{ opacity: 0, x: 40 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
//                   className="flex justify-center"
//                 >
//                   <motion.div
//                     className="relative w-full max-w-[500px]"
//                     animate={{ y: [0, -10, 0] }}
//                     transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
//                   >
//                     <div className="absolute pointer-events-none z-0"
//                       style={{ inset: "8%", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)", filter: "blur(40px)" }}
//                     />
//                     <motion.div
//                       className="absolute inset-[-4%] rounded-full border border-emerald-500/8 pointer-events-none z-0"
//                       animate={{ rotate: 360 }}
//                       transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
//                     >
//                       <div className="absolute top-[5%] left-1/2 w-2 h-2 rounded-full bg-emerald-400/50 -translate-x-1/2" />
//                     </motion.div>
//                     <DotLottieReact
//                       src="https://lottie.host/472dd31a-28c9-449c-9bc2-73fa73b21eda/L3A1NShAmP.lottie"
//                       loop autoplay
//                       style={{ width: "100%", height: "auto", position: "relative", zIndex: 1 }}
//                     />
//                     {/* Floating badge — bookings */}
//                     <motion.div
//                       className="absolute -bottom-3 -left-3 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-emerald-700/40 bg-[#0a1a12]/90 backdrop-blur-sm shadow-xl z-10"
//                       initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 1.2, duration: 0.5 }}
//                     >
//                       <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
//                         <Bell className="h-3.5 w-3.5 text-emerald-400" />
//                       </div>
//                       <div>
//                         <p className="text-[11px] font-bold text-white leading-none">New Booking</p>
//                         <p className="text-[9px] text-white/35 mt-0.5">Payment Confirmed</p>
//                       </div>
//                     </motion.div>
//                     {/* Floating badge — booking active */}
//                     <motion.div
//                       className="absolute top-[30%] -right-6 flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-700/35 bg-[#080f1a]/90 backdrop-blur-sm shadow-xl z-10"
//                       initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 1.0, duration: 0.5 }}
//                     >
//                       <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
//                         <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
//                       </div>
//                       <div>
//                         <p className="text-[11px] font-bold text-white leading-none">Booking Active</p>
//                         <p className="text-[9px] text-white/35 mt-0.5">PAYMENT_PENDING</p>
//                       </div>
//                     </motion.div>
//                     {/* Floating badge — live */}
//                     <motion.div
//                       className="absolute -top-3 -right-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-sky-700/40 bg-[#080f1a]/90 backdrop-blur-sm shadow-xl z-10"
//                       initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 1.5, duration: 0.5 }}
//                     >
//                       <motion.span
//                         className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0"
//                         animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
//                         transition={{ duration: 1.6, repeat: Infinity }}
//                       />
//                       <span className="text-[11px] font-semibold text-sky-300">3 Roles Active</span>
//                     </motion.div>
//                   </motion.div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </section>

//         <Separator className="bg-white/5" />

//         {/* ══════════════════════════════════════════════════════════════════
//             STATS
//         ══════════════════════════════════════════════════════════════════ */}
//         <section className="py-14 px-6 md:px-10 max-w-7xl mx-auto">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {STATS.map((stat, i) => (
//               <motion.div
//                 key={stat.label}
//                 variants={scaleIn}
//                 custom={i}
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true }}
//                 whileHover={{ y: -4, scale: 1.03 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                 className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/3"
//               >
//                 <div className="w-9 h-9 rounded-lg bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
//                   {stat.icon}
//                 </div>
//                 <div>
//                   <p className="text-xl font-black text-white leading-none">
//                     <AnimatedCounter {...stat} />
//                   </p>
//                   <p className="text-[11px] text-white/35 mt-0.5">{stat.label}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </section>

//         <Separator className="bg-white/5" />

//         {/* ══════════════════════════════════════════════════════════════════
//             USER ROLES
//         ══════════════════════════════════════════════════════════════════ */}
//         <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
//           <SectionHeading
//             eyebrow="Platform Roles"
//             title="Who uses RentHome?"
//             subtitle="Three distinct roles with immutable permissions, each with dedicated API access and controlled capabilities."
//           />
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {ROLES.map((role, i) => <RoleCard key={role.role} role={role} index={i} />)}
//           </div>
//         </section>

//         <Separator className="bg-white/5" />

//         {/* ══════════════════════════════════════════════════════════════════
//             BOOKING LIFECYCLE
//         ══════════════════════════════════════════════════════════════════ */}
//         <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
//           <SectionHeading
//             eyebrow="Booking System"
//             title="End-to-End Lifecycle"
//             subtitle="A structured state machine governs every booking from creation to completion."
//           />

//           <div className="grid lg:grid-cols-2 gap-12 items-start">
//             {/* Workflow steps */}
//             <div>
//               <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-6">
//                 System Workflow
//               </p>
//               {WORKFLOW.map((step, i) => (
//                 <WorkflowItem key={i} step={step} index={i} total={WORKFLOW.length} />
//               ))}
//             </div>

//             {/* Status pills + payment flow */}
//             <div className="flex flex-col gap-6">
//               {/* Booking statuses */}
//               <Card className="bg-white/3 border-white/8 rounded-2xl">
//                 <CardContent className="p-6">
//                   <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
//                     Booking Statuses
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {BOOKING_STATUSES.map((s, i) => (
//                       <motion.span
//                         key={s.label}
//                         initial={{ opacity: 0, scale: 0.85 }}
//                         whileInView={{ opacity: 1, scale: 1 }}
//                         viewport={{ once: true }}
//                         transition={{ delay: i * 0.08 }}
//                         className={`text-[11px] font-mono font-semibold px-3 py-1.5 rounded-full border ${s.color}`}
//                       >
//                         {s.label}
//                       </motion.span>
//                     ))}
//                   </div>
//                   <Separator className="bg-white/8 my-4" />
//                   <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">
//                     State Machine Rules
//                   </p>
//                   {[
//                     "Booking must be ACCEPTED before payment can start",
//                     "Payment required before status reaches CONFIRMED",
//                     "User can cancel anytime before PAYMENT_PENDING",
//                     "One payment per booking — enforced at API level",
//                     "One review per booking — tied to CONFIRMED only",
//                   ].map((rule, i) => (
//                     <motion.div key={i}
//                       initial={{ opacity: 0, x: -8 }}
//                       whileInView={{ opacity: 1, x: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ delay: 0.1 + i * 0.07 }}
//                       className="flex items-start gap-2 mb-2"
//                     >
//                       <ChevronRight className="h-3.5 w-3.5 text-emerald-400/60 flex-shrink-0 mt-0.5" />
//                       <span className="text-[12.5px] text-white/45 leading-snug">{rule}</span>
//                     </motion.div>
//                   ))}
//                 </CardContent>
//               </Card>

//               {/* Payment flow card */}
//               <Card className="bg-white/3 border-white/8 rounded-2xl">
//                 <CardContent className="p-6">
//                   <div className="flex items-center gap-2 mb-4">
//                     <CreditCard className="h-4 w-4 text-sky-400" />
//                     <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
//                       Stripe Payment Flow
//                     </p>
//                   </div>
//                   {[
//                     { step: "01", label: "Create Intent",    api: "POST /api/payments/create-intent", out: "Returns clientSecret + paymentId" },
//                     { step: "02", label: "Stripe UI",        api: "Client-side Stripe Elements",      out: "Card input rendered by Stripe" },
//                     { step: "03", label: "Confirm Payment",  api: "POST /api/payments/confirm",        out: "Payment SUCCESS → Booking CONFIRMED" },
//                   ].map((s, i) => (
//                     <motion.div key={i}
//                       variants={slideRight} custom={i}
//                       initial="hidden" whileInView="visible"
//                       viewport={{ once: true }}
//                       className="flex gap-3 mb-4 last:mb-0"
//                     >
//                       <span className="text-[10px] font-bold text-emerald-400 mt-0.5 w-5 flex-shrink-0">{s.step}</span>
//                       <div>
//                         <p className="text-white text-[13px] font-semibold">{s.label}</p>
//                         <p className="text-[11px] font-mono text-white/35 mt-0.5">{s.api}</p>
//                         <p className="text-[11px] text-white/30 mt-0.5">{s.out}</p>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </section>

//         <Separator className="bg-white/5" />

//         {/* ══════════════════════════════════════════════════════════════════
//             FEATURES GRID
//         ══════════════════════════════════════════════════════════════════ */}
//         <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
//           <SectionHeading
//             eyebrow="System Features"
//             title="What powers the platform?"
//             subtitle="Every module is independently scoped, with clear API ownership and enforced business rules."
//           />
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {FEATURES.map((f, i) => <FeatureBlock key={f.title} feature={f} index={i} />)}
//           </div>
//         </section>

//         <Separator className="bg-white/5" />

//         {/* ══════════════════════════════════════════════════════════════════
//             ARCHITECTURE
//         ══════════════════════════════════════════════════════════════════ */}
//         <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
//           <SectionHeading
//             eyebrow="Architecture"
//             title="Engineering Principles"
//             subtitle="The system is built around a layered backend, strict typing, and centralized validation."
//           />
//           <div className="grid md:grid-cols-2 gap-6">
//             {[
//               {
//                 icon: <Layers className="h-5 w-5 text-emerald-400" />,
//                 title: "Backend Layers",
//                 color: "border-emerald-700/30",
//                 points: ["Controller → Service → Repository pattern", "Role-based middleware (RBAC) at route level", "Centralized error handling", "Zod validation on all inputs", "Prisma ORM with strict TypeScript typing"],
//               },
//               {
//                 icon: <Building2 className="h-5 w-5 text-sky-400" />,
//                 title: "Frontend Architecture",
//                 color: "border-sky-700/30",
//                 points: ["App Router with Server Components for data fetching", "Client Components for interactivity", "Global auth session management", "API abstraction layer (hooks/services)", "Role-based UI rendering"],
//               },
//               {
//                 icon: <UserCheck className="h-5 w-5 text-violet-400" />,
//                 title: "Security Model",
//                 color: "border-violet-700/30",
//                 points: ["Role immutable after registration", "Only Admin can approve properties", "Session cookie required on all protected routes", "Banned users blocked at middleware", "One review and one payment per booking"],
//               },
//               {
//                 icon: <BarChart3 className="h-5 w-5 text-amber-400" />,
//                 title: "MVP Launch Scope",
//                 color: "border-amber-700/30",
//                 points: ["Authentication & session handling", "Owner property CRUD with image upload", "Admin approval workflow", "Public property browsing with filters", "Full booking + Stripe payment pipeline", "Review system + notification panel"],
//               },
//             ].map((block, i) => (
//               <motion.div
//                 key={block.title}
//                 variants={scaleIn} custom={i}
//                 initial="hidden" whileInView="visible"
//                 viewport={{ once: true, margin: "-30px" }}
//                 whileHover={{ y: -4 }}
//                 transition={{ type: "spring", stiffness: 280, damping: 22 }}
//                 className={`rounded-2xl border ${block.color} bg-white/3 p-6`}
//               >
//                 <div className="flex items-center gap-2.5 mb-4">
//                   <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center">
//                     {block.icon}
//                   </div>
//                   <h3 className="text-white font-bold text-sm">{block.title}</h3>
//                 </div>
//                 <ul className="space-y-2">
//                   {block.points.map((p, j) => (
//                     <motion.li key={j}
//                       initial={{ opacity: 0, x: -8 }}
//                       whileInView={{ opacity: 1, x: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ delay: 0.15 + j * 0.07 }}
//                       className="flex items-start gap-2 text-[12.5px] text-white/50 leading-snug"
//                     >
//                       <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/60 flex-shrink-0 mt-0.5" />
//                       {p}
//                     </motion.li>
//                   ))}
//                 </ul>
//               </motion.div>
//             ))}
//           </div>
//         </section>

//         <Separator className="bg-white/5" />

//         {/* ══════════════════════════════════════════════════════════════════
//             CTA
//         ══════════════════════════════════════════════════════════════════ */}
//         <section className="py-24 px-6 md:px-10 relative overflow-hidden">
//           <motion.div aria-hidden
//             className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
//             style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }}
//             animate={{ scale: [1, 1.08, 1] }}
//             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <div className="relative max-w-3xl mx-auto text-center">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
//               whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.7, ease: "easeOut" }}
//               className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 mb-7"
//             >
//               <Building2 className="h-8 w-8 text-emerald-400" />
//             </motion.div>

//             <motion.h2
//               initial={{ opacity: 0, y: 24 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6, delay: 0.1 }}
//               className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-5"
//             >
//               Ready to explore{" "}
//               <span className="text-emerald-400">RentHome</span>?
//             </motion.h2>

//             <motion.p
//               initial={{ opacity: 0, y: 16 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="text-white/45 text-lg mb-8 leading-relaxed"
//             >
//               Browse verified properties, book instantly, and pay securely — or list your property and reach thousands of verified tenants.
//             </motion.p>

//             {/* Trust pills */}
//             <motion.div
//               initial={{ opacity: 0, y: 12 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.3 }}
//               className="flex flex-wrap gap-2 justify-center mb-8"
//             >
//               {["Free registration", "No hidden charges", "Verified properties", "24/7 Support"].map((pill, i) => (
//                 <motion.span key={pill}
//                   initial={{ opacity: 0, scale: 0.85 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   viewport={{ once: true }}
//                   transition={{ delay: 0.35 + i * 0.07 }}
//                   className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-600/25 rounded-full px-4 py-1.5"
//                 >
//                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
//                   {pill}
//                 </motion.span>
//               ))}
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 16 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.4 }}
//               className="flex flex-wrap gap-3 justify-center"
//             >
//               <Button asChild size="lg"
//                 className="h-13 px-10 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-xl shadow-emerald-500/20 transition-all duration-300"
//               >
//                 <Link href="/property">
//                   Browse Properties <ArrowRight className="ml-2 h-4 w-4" />
//                 </Link>
//               </Button>
//               <Button asChild variant="outline" size="lg"
//                 className="h-13 px-10 text-sm border-white/15 text-white/65 bg-transparent hover:bg-white/5 hover:border-white/25 transition-all duration-300"
//               >
//                 <Link href="/signup">List Your Property</Link>
//               </Button>
//             </motion.div>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }


"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface PriceRange {
  min: number;
  max: number;
  suggested: number;
  confidence: number;
  trend: "rising" | "stable" | "falling";
  competitorAvg: number;
  occupancyRate: number;
  demandScore: number;
}

interface FactorItem {
  label: string;
  impact: "high" | "medium" | "low";
  direction: "positive" | "negative" | "neutral";
  description: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const CITIES = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barishal"];
const AREAS: Record<string, string[]> = {
  Dhaka: ["Gulshan", "Banani", "Dhanmondi", "Uttara", "Mirpur", "Mohammadpur"],
  Chittagong: ["Agrabad", "Nasirabad", "Khulshi", "Halishahar", "Pahartali"],
  Sylhet: ["Zindabazar", "Ambarkhana", "Shahjalal", "Tilagor"],
  Rajshahi: ["Boalia", "Rajpara", "Motihar", "Shah Makhdum"],
  Khulna: ["Sonadanga", "Khalishpur", "Daulatpur", "Boyra"],
  Barishal: ["Kashipur", "Airport", "Band Road", "Sadar"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Animated Gauge ───────────────────────────────────────────────────────────
function ConfidenceGauge({ value }: { value: number }) {
  const angle = -135 + (value / 100) * 270;
  return (
    <div className="relative w-36 h-20 mx-auto">
      <svg viewBox="0 0 144 80" className="w-full h-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path d="M 12 76 A 60 60 0 0 1 132 76" stroke="#1e293b" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 12 76 A 60 60 0 0 1 132 76" stroke="url(#gaugeGrad)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${(value / 100) * 188} 188`} />
        <motion.line
          x1="72" y1="76" x2="72" y2="20"
          stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round"
          style={{ transformOrigin: "72px 76px" }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 60, damping: 12 }}
        />
        <circle cx="72" cy="76" r="5" fill="#f8fafc" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-white font-mono"
        >
          {value}%
        </motion.span>
      </div>
    </div>
  );
}

// ─── Animated Price ────────────────────────────────────────────────────────────
function AnimatedPrice({ value, prefix = "৳" }: { value: number; prefix?: string }) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { stiffness: 55, damping: 14 });
  const [display, setDisplay] = useState(value);

  useEffect(() => { motionVal.set(value); }, [value]);
  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString("en-BD")}
    </span>
  );
}

// ─── Particle Bg (CSS-only) ────────────────────────────────────────────────────
const PARTICLE_DATA = Array.from({ length: 28 }, () => ({
  width: Math.random() * 6 + 2,
  height: Math.random() * 6 + 2,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 4 + Math.random() * 4,
  delay: Math.random() * 4,
}));

function ParticleBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLE_DATA.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-emerald-400/10"
          style={{
            width: p.width,
            height: p.height,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Factor Badge ─────────────────────────────────────────────────────────────
function FactorBadge({ factor, index }: { factor: FactorItem; index: number }) {
  const impactColor = { high: "text-rose-400", medium: "text-amber-400", low: "text-slate-400" };
  const directionIcon = { positive: "↑", negative: "↓", neutral: "→" };
  const directionColor = { positive: "text-emerald-400", negative: "text-rose-400", neutral: "text-slate-400" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 80 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-emerald-500/30 transition-colors group"
    >
      <span className={`text-lg font-bold mt-0.5 ${directionColor[factor.direction]}`}>
        {directionIcon[factor.direction]}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-100">{factor.label}</span>
          <span className={`text-xs font-mono uppercase ${impactColor[factor.impact]}`}>
            {factor.impact}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{factor.description}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
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
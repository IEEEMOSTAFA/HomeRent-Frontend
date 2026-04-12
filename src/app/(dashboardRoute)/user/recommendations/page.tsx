"use client";

/**
 * AI Recommendations Page — RentHome
 *
 * Animation responsibilities (intentionally separated):
 *  • GSAP         — Hero headline text split + magnetic cursor + timeline scrub on scroll
 *  • React Spring — Property card hover physics (tilt + lift + scale)
 *  • AOS          — Section / row scroll-reveal (data-aos attributes via useEffect init)
 *  • Framer Motion — Page-level transitions, badge pop-ins, AnimatePresence filter changes
 *  • Lottie       — Heart save burst + AI-thinking spinner
 */

import {
  useState, useEffect, useRef, useCallback,
  MouseEvent as ReactMouseEvent,
} from "react";

// ── Framer Motion ─────────────────────────────────────────────────────────────
import {
  motion, AnimatePresence, useScroll, useTransform,
  useMotionValue, useSpring as useFramerSpring,
} from "framer-motion";

// ── React Spring ──────────────────────────────────────────────────────────────
import { useSpring as useReactSpring, animated } from "@react-spring/web";

// ── GSAP (with ScrollTrigger) ─────────────────────────────────────────────────
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── AOS ───────────────────────────────────────────────────────────────────────
import AOS from "aos";
import "aos/dist/aos.css";

// ── Lottie ────────────────────────────────────────────────────────────────────
import Lottie from "lottie-react";

// ── Lucide ────────────────────────────────────────────────────────────────────
import {
  Sparkles, MapPin, BedDouble, Bath, Wifi, Car, Wind,
  Star, Heart, ArrowRight, RefreshCw, SlidersHorizontal,
  TrendingUp, Clock, ChevronRight, Home, DollarSign,
  BookMarked, Bell, Search, Flame, ThumbsUp, Zap,
  Building2, TreePine, Coffee, ShieldCheck,
} from "lucide-react";

// ── React Icons ───────────────────────────────────────────────────────────────
import { FaSwimmingPool, FaRegBuilding, FaDumbbell } from "react-icons/fa";
import { MdOutlineBalcony, MdOutlineLocalLaundryService, MdPets } from "react-icons/md";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { TbAirConditioning, TbSmartHome } from "react-icons/tb";
import { RiBrainLine, RiMagicLine } from "react-icons/ri";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { BsGraphUpArrow, BsStars } from "react-icons/bs";

// ── shadcn/ui ─────────────────────────────────────────────────────────────────
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// ─────────────────────────────────────────────────────────────────────────────
// GSAP plugin registration (once)
// ─────────────────────────────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────────────────────────────────────
// Lottie animation data (inline — no external file)
// ─────────────────────────────────────────────────────────────────────────────
const heartBurstLottie = {
  v: "5.7.4", fr: 30, ip: 0, op: 40, w: 80, h: 80, nm: "heart-burst", ddd: 0, assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "heart", sr: 1,
    ks: {
      o: { a: 1, k: [{ t: 0, s: [0] }, { t: 6, s: [100] }, { t: 32, s: [0] }] },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [40, 40, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [{ i: { x: [0.34], y: [1.56] }, o: { x: [0.5], y: [0] }, t: 0, s: [0, 0, 100] }, { t: 16, s: [120, 120, 100] }, { t: 32, s: [80, 80, 100] }] },
    },
    ao: 0, shapes: [{
      ty: "gr", it: [
        { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [18, 18] } },
        { ty: "fl", c: { a: 0, k: [0.95, 0.27, 0.37, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
      ],
    }],
    ip: 0, op: 40, st: 0, bm: 0,
  }],
};

const aiThinkingLottie = {
  v: "5.7.4", fr: 30, ip: 0, op: 90, w: 60, h: 60, nm: "ai-thinking", ddd: 0, assets: [],
  layers: [
    ...[0, 1, 2].map((i) => ({
      ddd: 0, ind: i + 1, ty: 4, nm: `dot${i}`, sr: 1,
      ks: {
        o: { a: 0, k: 100 }, r: { a: 0, k: 0 },
        p: { a: 0, k: [20 + i * 10, 30, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: i * 10, s: [60, 60, 100] }, { t: i * 10 + 15, s: [120, 120, 100] }, { t: i * 10 + 30, s: [60, 60, 100] }] },
      },
      ao: 0, shapes: [{
        ty: "gr", it: [
          { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [8, 8] } },
          { ty: "fl", c: { a: 0, k: [0.4 + i * 0.2, 0.3, 1, 1] }, o: { a: 0, k: 100 } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
        ],
      }],
      ip: 0, op: 90, st: 0, bm: 0,
    })),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Property = {
  id: string; title: string; area: string; city: string;
  rent: number; bedrooms: number; bathrooms: number;
  rating: number; reviewCount: number; matchScore: number;
  imageGradient: string; isVerified: boolean; isTrending: boolean; isNew: boolean;
  reason: string; savedByCount: number; type: "apartment" | "house" | "studio";
  amenities: { icon: React.ReactNode; label: string }[];
};

const REASON_MAP: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  budget:   { icon: <DollarSign size={11} />, label: "Fits your budget",      color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800" },
  location: { icon: <HiOutlineLocationMarker size={11} />, label: "Preferred location", color: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800" },
  trending: { icon: <Flame size={11} />,      label: "Trending now",           color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800" },
  similar:  { icon: <ThumbsUp size={11} />,   label: "Similar to your saves",  color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800" },
  new:      { icon: <Zap size={11} />,        label: "Just listed",            color: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-400 dark:border-pink-800" },
  toprated: { icon: <BsStars size={11} />,    label: "Top rated in area",      color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800" },
};

const MOCK_PROPERTIES: Property[] = [
  {
    id: "1", title: "Sunrise Heights Apartment", area: "Agrabad", city: "Chattogram",
    rent: 22000, bedrooms: 3, bathrooms: 2, rating: 4.8, reviewCount: 34, matchScore: 97,
    isVerified: true, isTrending: true, isNew: false, reason: "budget", savedByCount: 128, type: "apartment",
    imageGradient: "from-rose-400 via-pink-500 to-purple-600",
    amenities: [{ icon: <Wifi size={13} />, label: "WiFi" }, { icon: <TbAirConditioning size={13} />, label: "AC" }, { icon: <Car size={13} />, label: "Parking" }, { icon: <FaDumbbell size={12} />, label: "Gym" }],
  },
  {
    id: "2", title: "Modern Studio Loft", area: "GEC Circle", city: "Chattogram",
    rent: 14500, bedrooms: 1, bathrooms: 1, rating: 4.6, reviewCount: 21, matchScore: 93,
    isVerified: true, isTrending: false, isNew: true, reason: "new", savedByCount: 47, type: "studio",
    imageGradient: "from-cyan-400 via-sky-500 to-indigo-600",
    amenities: [{ icon: <Wifi size={13} />, label: "WiFi" }, { icon: <TbSmartHome size={13} />, label: "Smart Home" }, { icon: <MdOutlineBalcony size={13} />, label: "Balcony" }],
  },
  {
    id: "3", title: "Green Valley Family Home", area: "Nasirabad", city: "Chattogram",
    rent: 35000, bedrooms: 4, bathrooms: 3, rating: 4.9, reviewCount: 56, matchScore: 89,
    isVerified: true, isTrending: false, isNew: false, reason: "toprated", savedByCount: 203, type: "house",
    imageGradient: "from-emerald-400 via-teal-500 to-cyan-600",
    amenities: [{ icon: <MdPets size={13} />, label: "Pet Friendly" }, { icon: <TreePine size={13} />, label: "Garden" }, { icon: <Car size={13} />, label: "Parking" }, { icon: <FaSwimmingPool size={12} />, label: "Pool" }],
  },
  {
    id: "4", title: "Central Park Residency", area: "Muradpur", city: "Chattogram",
    rent: 18000, bedrooms: 2, bathrooms: 1, rating: 4.5, reviewCount: 18, matchScore: 86,
    isVerified: false, isTrending: true, isNew: false, reason: "trending", savedByCount: 91, type: "apartment",
    imageGradient: "from-amber-400 via-orange-500 to-red-500",
    amenities: [{ icon: <Wifi size={13} />, label: "WiFi" }, { icon: <MdOutlineLocalLaundryService size={13} />, label: "Laundry" }, { icon: <Coffee size={13} />, label: "Café nearby" }],
  },
  {
    id: "5", title: "Executive Sky Suite", area: "Panchlaish", city: "Chattogram",
    rent: 28000, bedrooms: 2, bathrooms: 2, rating: 4.7, reviewCount: 40, matchScore: 84,
    isVerified: true, isTrending: false, isNew: false, reason: "similar", savedByCount: 76, type: "apartment",
    imageGradient: "from-violet-500 via-purple-600 to-blue-700",
    amenities: [{ icon: <FaRegBuilding size={12} />, label: "High-rise" }, { icon: <TbAirConditioning size={13} />, label: "AC" }, { icon: <IoShieldCheckmarkOutline size={13} />, label: "Security" }, { icon: <Wind size={13} />, label: "Ventilated" }],
  },
  {
    id: "6", title: "Cozy Hillside Retreat", area: "Khulshi", city: "Chattogram",
    rent: 12000, bedrooms: 1, bathrooms: 1, rating: 4.3, reviewCount: 12, matchScore: 79,
    isVerified: false, isTrending: false, isNew: true, reason: "location", savedByCount: 22, type: "studio",
    imageGradient: "from-lime-400 via-green-500 to-teal-600",
    amenities: [{ icon: <Wifi size={13} />, label: "WiFi" }, { icon: <TreePine size={13} />, label: "Garden" }, { icon: <Bath size={13} />, label: "Bathtub" }],
  },
];

const PREFERENCE_TAGS = [
  "Near University", "Pet Friendly", "Furnished", "Ground Floor",
  "Quiet Area", "Near Market", "High Floor", "Modern Kitchen",
  "Swimming Pool", "24/7 Security",
];

const SORT_OPTIONS = [
  { id: "match", label: "Best Match", icon: <Sparkles size={12} /> },
  { id: "price_asc", label: "Price ↑", icon: <TrendingUp size={12} /> },
  { id: "rating", label: "Top Rated", icon: <Star size={12} /> },
  { id: "newest", label: "Newest", icon: <Clock size={12} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// MatchRing — animated SVG ring (Framer Motion stroke animation)
// ─────────────────────────────────────────────────────────────────────────────
function MatchRing({ score }: { score: number }) {
  const r = 16, circ = 2 * Math.PI * r;
  const color = score >= 90 ? "#10b981" : score >= 80 ? "#f59e0b" : "#818cf8";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative w-12 h-12 shrink-0 cursor-default">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3" className="stroke-muted/30" />
            <motion.circle
              cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
              strokeLinecap="round" strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - (score / 100) * circ }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-extrabold" style={{ color }}>{score}%</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p className="text-xs">AI match score: <strong>{score}%</strong></p>
      </TooltipContent>
    </Tooltip>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PropertyCard — React Spring physics tilt + Framer badge animations
// ─────────────────────────────────────────────────────────────────────────────
function PropertyCard({
  property, onSave, saved, aosDelay,
}: {
  property: Property; onSave: (id: string) => void; saved: boolean; aosDelay: number;
}) {
  const [showLottie, setShowLottie] = useState(false);

  // React Spring — 3-D tilt + lift on hover (physics-based)
  const [springProps, springApi] = useReactSpring(() => ({
    rotateX: 0, rotateY: 0, scale: 1, shadow: 4,
    config: { mass: 1, tension: 320, friction: 28 },
  }));

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const dx = (e.clientX - rect.left - cx) / cx;
    const dy = (e.clientY - rect.top - cy) / cy;
    springApi.start({ rotateX: -dy * 6, rotateY: dx * 6, scale: 1.02, shadow: 18 });
  };
  const handleMouseLeave = () => springApi.start({ rotateX: 0, rotateY: 0, scale: 1, shadow: 4 });

  const handleSave = (e: ReactMouseEvent) => {
    e.stopPropagation();
    onSave(property.id);
    if (!saved) { setShowLottie(true); setTimeout(() => setShowLottie(false), 1600); }
  };

  const reason = REASON_MAP[property.reason];

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={aosDelay}
      data-aos-duration="600"
      data-aos-once="true"
    >
      <animated.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: springProps.rotateX,
          rotateY: springProps.rotateY,
          scale: springProps.scale,
          boxShadow: springProps.shadow.to(
            (s) => `0 ${s}px ${s * 2.5}px -8px rgba(0,0,0,0.18)`
          ),
          transformStyle: "preserve-3d",
          borderRadius: 16,
        }}
        className="h-full"
      >
        <Card className="shadow-none border border-border/60 hover:border-border overflow-hidden h-full flex flex-col transition-colors duration-200 cursor-pointer">
          {/* ── Image area ── */}
          <div className={`relative h-48 bg-gradient-to-br ${property.imageGradient} overflow-hidden`}>
            <div className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(circle at 25% 35%, rgba(255,255,255,0.25) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.15) 0%, transparent 50%)" }}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {property.isTrending && (
                <motion.div
                  initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.1 }}
                >
                  <Badge className="bg-orange-500/90 text-white border-0 text-[10px] gap-1 h-5 backdrop-blur-sm">
                    <Flame size={9} /> Trending
                  </Badge>
                </motion.div>
              )}
              {property.isNew && (
                <motion.div
                  initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.18 }}
                >
                  <Badge className="bg-pink-500/90 text-white border-0 text-[10px] gap-1 h-5 backdrop-blur-sm">
                    <Zap size={9} /> New Listing
                  </Badge>
                </motion.div>
              )}
              {property.isVerified && (
                <motion.div
                  initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.26 }}
                >
                  <Badge className="bg-sky-500/90 text-white border-0 text-[10px] gap-1 h-5 backdrop-blur-sm">
                    <IoShieldCheckmarkOutline size={10} /> Verified
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Heart save */}
            <div className="absolute top-3 right-3">
              <motion.button
                whileTap={{ scale: 0.78 }}
                onClick={handleSave}
                className="w-8 h-8 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors"
              >
                <motion.div animate={saved ? { scale: [1, 1.45, 1] } : {}}>
                  <Heart size={15} className={saved ? "fill-rose-400 text-rose-400" : "text-white"} />
                </motion.div>
              </motion.button>
              {showLottie && (
                <div className="absolute -top-5 -right-5 pointer-events-none z-10">
                  <Lottie animationData={heartBurstLottie} loop={false} style={{ width: 56, height: 56 }} />
                </div>
              )}
            </div>

            {/* Type icon */}
            <div className="absolute bottom-3 left-3 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {property.type === "house" ? <Home size={14} className="text-white" />
                : property.type === "studio" ? <Building2 size={14} className="text-white" />
                : <FaRegBuilding size={12} className="text-white" />}
            </div>

            {/* Save count */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5">
              <BookMarked size={9} className="text-white/80" />
              <span className="text-[10px] text-white/80 font-medium">{property.savedByCount}</span>
            </div>
          </div>

          {/* ── Body ── */}
          <CardContent className="p-4 flex flex-col flex-1 gap-2.5">
            {/* Title + ring */}
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-snug truncate">{property.title}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin size={10} className="shrink-0" />
                  <span className="truncate">{property.area}, {property.city}</span>
                </div>
              </div>
              <MatchRing score={property.matchScore} />
            </div>

            {/* AI reason chip — Framer pop-in */}
            {reason && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 28, delay: 0.15 }}
              >
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${reason.color}`}>
                  {reason.icon} {reason.label}
                </span>
              </motion.div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><BedDouble size={11} /> {property.bedrooms} bed</span>
              <span className="flex items-center gap-1"><Bath size={11} /> {property.bathrooms} bath</span>
              <span className="flex items-center gap-1 ml-auto">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{property.rating}</span>
                <span className="text-muted-foreground/70">({property.reviewCount})</span>
              </span>
            </div>

            {/* Amenity chips */}
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                  {a.icon} {a.label}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>

            <Separator className="opacity-40" />

            {/* Price + CTA */}
            <div className="flex items-center justify-between mt-auto pt-0.5">
              <div>
                <span className="text-lg font-extrabold">৳{property.rent.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground"> /mo</span>
              </div>
              <Button size="sm" className="h-8 text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90 rounded-xl">
                View <ArrowRight size={12} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </animated.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InsightBanner — rotating AI insights (Framer AnimatePresence)
// ─────────────────────────────────────────────────────────────────────────────
function InsightBanner() {
  const insights = [
    { icon: <BsGraphUpArrow size={13} />, text: "Properties in Agrabad are 12% cheaper this month", color: "text-emerald-600 dark:text-emerald-400" },
    { icon: <Flame size={13} />, text: "3-bed apartments near GEC Circle are in high demand", color: "text-orange-500" },
    { icon: <RiBrainLine size={14} />, text: "18 new listings match your preferences this week", color: "text-violet-600 dark:text-violet-400" },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((c) => (c + 1) % insights.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      data-aos="fade-down"
      data-aos-duration="700"
      data-aos-once="true"
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-muted/40 p-4"
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 p-2 rounded-xl bg-background border border-border/60 relative">
          <Sparkles size={15} className="text-amber-500" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-background" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">AI Insight</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className={`text-sm font-semibold flex items-center gap-2 ${insights[i].color}`}
            >
              {insights[i].icon} {insights[i].text}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex gap-1 shrink-0">
          {insights.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === i ? "w-4 bg-foreground" : "w-1.5 bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — React Spring count-up + AOS scroll reveal
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent, aosDelay }: {
  icon: React.ReactNode; label: string; value: number; accent: string; aosDelay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // React Spring number interpolation
  const spring = useReactSpring({
    number: isVisible ? value : 0,
    config: { mass: 1, tension: 80, friction: 18 },
  });

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} data-aos="zoom-in" data-aos-delay={aosDelay} data-aos-once="true">
      <Card className="shadow-none border border-border/50 overflow-hidden relative">
        <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
        <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
          <div className={`p-2 rounded-xl ${accent.replace("bg-", "bg-").replace("500", "100")} dark:bg-white/5 mt-1`}>
            {icon}
          </div>
          <p className="text-2xl font-black tracking-tight tabular-nums">
            <animated.span>{spring.number.to((n) => Math.round(n))}</animated.span>
          </p>
          <p className="text-[11px] text-muted-foreground font-medium leading-tight">{label}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PreferenceTag — Framer whileTap + active state
// ─────────────────────────────────────────────────────────────────────────────
function PreferenceTag({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -1 }}
      className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-all duration-150 ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {label}
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton grid
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}>
          <Card className="shadow-none border border-border/50 overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              </div>
              <Skeleton className="h-5 w-36 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-14" /><Skeleton className="h-3 w-14" /><Skeleton className="h-3 w-14 ml-auto" />
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-px" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24" /><Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterSheet
// ─────────────────────────────────────────────────────────────────────────────
function FilterSheet({
  priceRange, setPriceRange, bedroomsFilter, setBedroomsFilter, verifiedOnly, setVerifiedOnly,
}: {
  priceRange: number[]; setPriceRange: (v: number[]) => void;
  bedroomsFilter: number | null; setBedroomsFilter: (v: number | null) => void;
  verifiedOnly: boolean; setVerifiedOnly: (v: boolean) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
          <SlidersHorizontal size={13} /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal size={15} /> Filter Recommendations
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-7">
          <div className="space-y-3">
            <Label className="text-sm font-bold">Monthly Rent (৳)</Label>
            <Slider min={5000} max={60000} step={1000} value={priceRange} onValueChange={setPriceRange} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>৳{priceRange[0].toLocaleString()}</span>
              <span>৳{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-bold">Bedrooms</Label>
            <div className="flex gap-2 flex-wrap">
              {[null, 1, 2, 3, 4].map((n) => (
                <button key={String(n)} onClick={() => setBedroomsFilter(n)}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                    bedroomsFilter === n ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  {n === null ? "Any" : `${n}${n === 4 ? "+" : ""} bed`}
                </button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-bold">Verified Owners Only</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Only show trusted landlords</p>
            </div>
            <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionHeader
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, count }: {
  icon: React.ReactNode; title: string; subtitle?: string; count?: number;
}) {
  return (
    <div data-aos="fade-right" data-aos-once="true" className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-muted/60">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight">{title}</h2>
            {count !== undefined && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{count}</Badge>
              </motion.div>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground shrink-0">
        See all <ChevronRight size={12} />
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AIRecommendationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [activePrefs, setActivePrefs] = useState<Set<string>>(new Set(["Near University", "Furnished"]));
  const [sortBy, setSortBy] = useState("match");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([5000, 50000]);
  const [bedroomsFilter, setBedroomsFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Refs for GSAP ──────────────────────────────────────────────────────────
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const ctaBannerRef = useRef<HTMLDivElement>(null);

  // ── Framer scroll progress bar ─────────────────────────────────────────────
  const { scrollYProgress } = useScroll();
  const scaleX = useFramerSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  // ── AOS init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
    });
  }, []);

  // ── GSAP hero text split animation + ScrollTrigger on CTA ─────────────────
  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current) return;

    const ctx = gsap.context(() => {
      // Split title into individual characters with GSAP
      const titleEl = titleRef.current!;
      const text = titleEl.textContent ?? "";
      titleEl.innerHTML = text
        .split("")
        .map((char) =>
          char === " "
            ? `<span style="display:inline-block;width:0.3em"> </span>`
            : `<span class="gsap-char" style="display:inline-block;opacity:0;transform:translateY(40px) rotate(8deg)">${char}</span>`
        )
        .join("");

      gsap.to(".gsap-char", {
        opacity: 1, y: 0, rotation: 0,
        duration: 0.55,
        stagger: 0.035,
        ease: "back.out(1.8)",
        delay: 0.1,
      });

      // Subtitle fade in
      gsap.fromTo(subtitleRef.current!, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.6 });

      // CTA banner parallax on scroll
      if (ctaBannerRef.current) {
        gsap.fromTo(
          ctaBannerRef.current,
          { backgroundPositionY: "0%" },
          {
            backgroundPositionY: "30%",
            ease: "none",
            scrollTrigger: {
              trigger: ctaBannerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, [isLoading]);

  // ── Loading simulation ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setIsLoading(false);
      // Refresh AOS after content loads
      setTimeout(() => AOS.refresh(), 100);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const togglePref = (tag: string) => {
    setActivePrefs((prev) => { const n = new Set(prev); n.has(tag) ? n.delete(tag) : n.add(tag); return n; });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setIsRefreshing(false);
    setTimeout(() => AOS.refresh(), 100);
  };

  const filtered = MOCK_PROPERTIES
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        (!q || p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)) &&
        p.rent >= priceRange[0] && p.rent <= priceRange[1] &&
        (bedroomsFilter === null || p.bedrooms === bedroomsFilter) &&
        (!verifiedOnly || p.isVerified)
      );
    })
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "price_asc") return a.rent - b.rent;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0;
    });

  const verifiedCount = MOCK_PROPERTIES.filter((p) => p.isVerified).length;
  const newCount = MOCK_PROPERTIES.filter((p) => p.isNew).length;

  return (
    <TooltipProvider>
      {/* ── GSAP scroll progress bar (Framer spring) ── */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400 z-50 origin-left"
      />

      <div ref={heroRef} className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 pb-16">

        {/* ── Hero Header (GSAP char-split on mount) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-2"
        >
          <div className="flex items-start gap-4">
            {/* Animated icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.05 }}
              className="relative shrink-0"
            >
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-300/40 dark:shadow-orange-900/30">
                <BsStars size={22} className="text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-background"
              />
            </motion.div>

            <div>
              {/* GSAP will split this */}
              <h1
                ref={titleRef}
                className="text-2xl sm:text-3xl font-black tracking-tight leading-tight"
              >
                AI Recommendations
              </h1>
              <p ref={subtitleRef} className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 opacity-0">
                <RiBrainLine size={13} className="text-violet-500" />
                Personalized properties, intelligently curated for you
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isLoading && (
              <div className="w-8 h-8">
                <Lottie animationData={aiThinkingLottie} loop style={{ width: 32, height: 32 }} />
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs h-9">
              <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </Button>
            <FilterSheet
              priceRange={priceRange} setPriceRange={setPriceRange}
              bedroomsFilter={bedroomsFilter} setBedroomsFilter={setBedroomsFilter}
              verifiedOnly={verifiedOnly} setVerifiedOnly={setVerifiedOnly}
            />
          </div>
        </motion.div>

        {/* ── AI Insight Banner (AOS fade-down + Framer AnimatePresence inside) ── */}
        <InsightBanner />

        {/* ── Quick Stats (React Spring count-up + AOS zoom-in) ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<RiMagicLine size={16} className="text-violet-600" />} label="AI Matches" value={filtered.length} accent="bg-violet-500" aosDelay={0} />
          <StatCard icon={<Heart size={15} className="text-rose-500" />} label="Saved" value={savedIds.size} accent="bg-rose-500" aosDelay={80} />
          <StatCard icon={<Zap size={15} className="text-amber-500" />} label="New this week" value={newCount} accent="bg-amber-500" aosDelay={160} />
        </div>

        {/* ── Preference Tags (Framer whileTap + hover) ── */}
        <div data-aos="fade-up" data-aos-once="true" className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your preferences</p>
            <AnimatePresence>
              <motion.div key={activePrefs.size} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">{activePrefs.size} active</Badge>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_TAGS.map((tag) => (
              <PreferenceTag key={tag} label={tag} active={activePrefs.has(tag)} onClick={() => togglePref(tag)} />
            ))}
          </div>
        </div>

        {/* ── Search + Sort (Framer fade-up) ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search by name or area…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm bg-muted/30 border-border/50"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-wrap sm:flex-nowrap">
            {SORT_OPTIONS.map((opt) => (
              <motion.button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                whileTap={{ scale: 0.94 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border font-medium whitespace-nowrap transition-colors duration-150 ${
                  sortBy === opt.id
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-border hover:border-foreground/30"
                }`}
              >
                {opt.icon} {opt.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Recommended Grid ── */}
        <div className="space-y-5">
          <SectionHeader
            icon={<Sparkles size={15} className="text-amber-500" />}
            title="Recommended for You"
            subtitle="AI-matched based on your search history & preferences"
            count={filtered.length}
          />

          {isLoading ? (
            <SkeletonCards />
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Home size={28} className="text-muted-foreground/30" />
              </div>
              <h3 className="font-bold text-sm mb-1.5">No matches found</h3>
              <p className="text-xs text-muted-foreground max-w-xs">Adjust your filters or preferences to discover more properties.</p>
              <Button variant="outline" size="sm" className="mt-4 text-xs"
                onClick={() => { setSearch(""); setPriceRange([5000, 50000]); setBedroomsFilter(null); setVerifiedOnly(false); }}
              >
                Clear all filters
              </Button>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <PropertyCard
                    key={p.id} property={p}
                    onSave={toggleSave} saved={savedIds.has(p.id)}
                    aosDelay={i * 60}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ── Trending Section ── */}
        {!isLoading && (
          <div className="space-y-5">
            <SectionHeader
              icon={<Flame size={15} className="text-orange-500" />}
              title="Trending in Chattogram"
              subtitle="Most viewed properties in the last 48 hours"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MOCK_PROPERTIES.filter((p) => p.isTrending).map((p, i) => (
                <PropertyCard key={`t-${p.id}`} property={p} onSave={toggleSave} saved={savedIds.has(p.id)} aosDelay={i * 80} />
              ))}
            </div>
          </div>
        )}

        {/* ── CTA Banner — GSAP parallax via scrollTrigger ── */}
        {!isLoading && (
          <div
            ref={ctaBannerRef}
            data-aos="fade-up"
            data-aos-once="true"
            className="relative overflow-hidden rounded-2xl p-6 text-white"
            style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1035 40%, #0f172a 100%)" }}
          >
            {/* Decorative orbs */}
            <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.8) 0%, transparent 70%)" }} />
            <div className="absolute bottom-0 right-1/4 w-36 h-36 rounded-full opacity-15 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(245,158,11,0.8) 0%, transparent 70%)" }} />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm"
                >
                  <Bell size={20} className="text-amber-400" />
                </motion.div>
                <div>
                  <p className="font-extrabold text-base">Never miss a perfect match</p>
                  <p className="text-xs text-white/55 mt-0.5 max-w-xs">Get instant alerts when a property matching your criteria is listed on RentHome.</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-white text-slate-900 hover:bg-white/90 font-bold text-xs gap-1.5 h-9 shrink-0 rounded-xl shadow-lg"
              >
                <Bell size={12} /> Enable Alerts
              </Button>
            </div>
          </div>
        )}

      </div>
    </TooltipProvider>
  );
}






















// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
// import {
//   Sparkles, MapPin, BedDouble, Bath, Wifi, Car, Wind,
//   Star, Heart, ArrowRight, RefreshCw, SlidersHorizontal,
//   TrendingUp, Clock, BadgeCheck, ChevronRight, Home,
//   DollarSign, Eye, BookMarked, Bell, Filter, Search,
//   Flame, ThumbsUp, Zap, Building2, TreePine, Coffee,
// } from "lucide-react";
// import { FaSwimmingPool, FaRegBuilding, FaDumbbell } from "react-icons/fa";
// import { MdOutlineBalcony, MdOutlineLocalLaundryService, MdPets } from "react-icons/md";
// import { IoShieldCheckmarkOutline } from "react-icons/io5";
// import { TbAirConditioning, TbSmartHome } from "react-icons/tb";
// import Lottie from "lottie-react";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Separator } from "@/components/ui/separator";
// import { Input } from "@/components/ui/input";
// import {
//   Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
// } from "@/components/ui/sheet";
// import { Slider } from "@/components/ui/slider";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";

// // ── Lottie: sparkle burst (inline JSON — no external file) ──────────────────
// const sparkleLottie = {
//   v: "5.7.4", fr: 30, ip: 0, op: 45, w: 80, h: 80, nm: "sparkle", ddd: 0, assets: [],
//   layers: [
//     {
//       ddd: 0, ind: 1, ty: 4, nm: "star1", sr: 1,
//       ks: { o: { a: 1, k: [{ t: 0, s: [0] }, { t: 8, s: [100] }, { t: 35, s: [0] }] }, r: { a: 0, k: 0 }, p: { a: 0, k: [40, 40, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 1, k: [{ i: { x: [0.5], y: [1.3] }, o: { x: [0.5], y: [0] }, t: 0, s: [0, 0, 100] }, { t: 14, s: [100, 100, 100] }] } },
//       ao: 0, shapes: [{ ty: "gr", it: [{ ty: "sr", pt: { a: 0, k: 5 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 8 }, ir: { a: 0, k: 4 }, is: { a: 0, k: 0 }, or: { a: 0, k: 8 }, os: { a: 0, k: 0 }, ix: 1 }, { ty: "fl", c: { a: 0, k: [1, 0.84, 0, 1] }, o: { a: 0, k: 100 } }, { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] }],
//       ip: 0, op: 45, st: 0, bm: 0,
//     },
//   ],
// };

// // ── Types ────────────────────────────────────────────────────────────────────
// type Amenity = {
//   icon: React.ReactNode;
//   label: string;
// };

// type Property = {
//   id: string;
//   title: string;
//   area: string;
//   city: string;
//   rent: number;
//   bedrooms: number;
//   bathrooms: number;
//   rating: number;
//   reviewCount: number;
//   matchScore: number;
//   tags: string[];
//   amenities: Amenity[];
//   imageGradient: string;
//   isVerified: boolean;
//   isTrending: boolean;
//   isNew: boolean;
//   reason: string;
//   savedByCount: number;
//   type: "apartment" | "house" | "studio";
// };

// type ReasonCategory = {
//   icon: React.ReactNode;
//   label: string;
//   color: string;
// };

// // ── Reason tag map ────────────────────────────────────────────────────────────
// const REASON_MAP: Record<string, ReasonCategory> = {
//   budget:    { icon: <DollarSign size={11} />,  label: "Fits your budget",       color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
//   location:  { icon: <MapPin size={11} />,       label: "Preferred location",     color: "bg-sky-50 text-sky-700 border-sky-200" },
//   trending:  { icon: <Flame size={11} />,        label: "Trending now",           color: "bg-orange-50 text-orange-700 border-orange-200" },
//   similar:   { icon: <ThumbsUp size={11} />,     label: "Similar to your saves",  color: "bg-violet-50 text-violet-700 border-violet-200" },
//   new:       { icon: <Zap size={11} />,          label: "Just listed",            color: "bg-pink-50 text-pink-700 border-pink-200" },
//   toprated:  { icon: <Star size={11} />,         label: "Top rated in area",      color: "bg-amber-50 text-amber-700 border-amber-200" },
// };

// // ── Mock data ────────────────────────────────────────────────────────────────
// const MOCK_PROPERTIES: Property[] = [
//   {
//     id: "1", title: "Sunrise Heights Apartment", area: "Agrabad", city: "Chattogram",
//     rent: 22000, bedrooms: 3, bathrooms: 2, rating: 4.8, reviewCount: 34,
//     matchScore: 97, tags: ["Top Pick"], isVerified: true, isTrending: true, isNew: false,
//     reason: "budget",
//     imageGradient: "from-rose-400 via-pink-500 to-purple-600",
//     amenities: [{ icon: <Wifi size={13} />, label: "WiFi" }, { icon: <TbAirConditioning size={13} />, label: "AC" }, { icon: <Car size={13} />, label: "Parking" }, { icon: <FaDumbbell size={12} />, label: "Gym" }],
//     savedByCount: 128, type: "apartment",
//   },
//   {
//     id: "2", title: "Modern Studio Loft", area: "GEC Circle", city: "Chattogram",
//     rent: 14500, bedrooms: 1, bathrooms: 1, rating: 4.6, reviewCount: 21,
//     matchScore: 93, tags: ["Best Value"], isVerified: true, isTrending: false, isNew: true,
//     reason: "new",
//     imageGradient: "from-cyan-400 via-sky-500 to-indigo-600",
//     amenities: [{ icon: <Wifi size={13} />, label: "WiFi" }, { icon: <TbSmartHome size={13} />, label: "Smart Home" }, { icon: <MdOutlineBalcony size={13} />, label: "Balcony" }],
//     savedByCount: 47, type: "studio",
//   },
//   {
//     id: "3", title: "Green Valley Family Home", area: "Nasirabad", city: "Chattogram",
//     rent: 35000, bedrooms: 4, bathrooms: 3, rating: 4.9, reviewCount: 56,
//     matchScore: 89, tags: ["Family Choice"], isVerified: true, isTrending: false, isNew: false,
//     reason: "toprated",
//     imageGradient: "from-emerald-400 via-teal-500 to-cyan-600",
//     amenities: [{ icon: <MdPets size={13} />, label: "Pet Friendly" }, { icon: <TreePine size={13} />, label: "Garden" }, { icon: <Car size={13} />, label: "Parking" }, { icon: <FaSwimmingPool size={12} />, label: "Pool" }],
//     savedByCount: 203, type: "house",
//   },
//   {
//     id: "4", title: "Central Park Residency", area: "Muradpur", city: "Chattogram",
//     rent: 18000, bedrooms: 2, bathrooms: 1, rating: 4.5, reviewCount: 18,
//     matchScore: 86, tags: ["Popular"], isVerified: false, isTrending: true, isNew: false,
//     reason: "trending",
//     imageGradient: "from-amber-400 via-orange-500 to-red-500",
//     amenities: [{ icon: <Wifi size={13} />, label: "WiFi" }, { icon: <MdOutlineLocalLaundryService size={13} />, label: "Laundry" }, { icon: <Coffee size={13} />, label: "Café nearby" }],
//     savedByCount: 91, type: "apartment",
//   },
//   {
//     id: "5", title: "Executive Sky Suite", area: "Panchlaish", city: "Chattogram",
//     rent: 28000, bedrooms: 2, bathrooms: 2, rating: 4.7, reviewCount: 40,
//     matchScore: 84, tags: ["Premium"], isVerified: true, isTrending: false, isNew: false,
//     reason: "similar",
//     imageGradient: "from-violet-500 via-purple-600 to-blue-700",
//     amenities: [{ icon: <FaRegBuilding size={12} />, label: "High-rise" }, { icon: <TbAirConditioning size={13} />, label: "AC" }, { icon: <IoShieldCheckmarkOutline size={13} />, label: "Security" }, { icon: <Wind size={13} />, label: "Ventilated" }],
//     savedByCount: 76, type: "apartment",
//   },
//   {
//     id: "6", title: "Cozy Hillside Retreat", area: "Khulshi", city: "Chattogram",
//     rent: 12000, bedrooms: 1, bathrooms: 1, rating: 4.3, reviewCount: 12,
//     matchScore: 79, tags: ["Budget Friendly"], isVerified: false, isTrending: false, isNew: true,
//     reason: "location",
//     imageGradient: "from-lime-400 via-green-500 to-teal-600",
//     amenities: [{ icon: <Wifi size={13} />, label: "WiFi" }, { icon: <TreePine size={13} />, label: "Garden" }, { icon: <Bath size={13} />, label: "Bathtub" }],
//     savedByCount: 22, type: "studio",
//   },
// ];

// const PREFERENCE_TAGS = [
//   "Near University", "Pet Friendly", "Furnished", "Ground Floor",
//   "Quiet Area", "Near Market", "High Floor", "Modern Kitchen",
//   "Swimming Pool", "24/7 Security",
// ];

// const SORT_OPTIONS = [
//   { id: "match", label: "Best Match", icon: <Sparkles size={13} /> },
//   { id: "price_asc", label: "Price: Low–High", icon: <TrendingUp size={13} /> },
//   { id: "rating", label: "Top Rated", icon: <Star size={13} /> },
//   { id: "newest", label: "Newest First", icon: <Clock size={13} /> },
// ];

// // ── Match Score Ring ──────────────────────────────────────────────────────────
// function MatchRing({ score }: { score: number }) {
//   const r = 16, circ = 2 * Math.PI * r;
//   const dash = (score / 100) * circ;
//   const color = score >= 90 ? "#10b981" : score >= 80 ? "#f59e0b" : "#6366f1";
//   return (
//     <div className="relative w-12 h-12 shrink-0">
//       <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
//         <circle cx="20" cy="20" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
//         <motion.circle
//           cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
//           strokeLinecap="round"
//           strokeDasharray={circ}
//           initial={{ strokeDashoffset: circ }}
//           animate={{ strokeDashoffset: circ - dash }}
//           transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
//         />
//       </svg>
//       <div className="absolute inset-0 flex items-center justify-center">
//         <span className="text-[10px] font-bold" style={{ color }}>{score}%</span>
//       </div>
//     </div>
//   );
// }

// // ── Property Card ─────────────────────────────────────────────────────────────
// function PropertyCard({ property, index, onSave, saved }: {
//   property: Property; index: number; onSave: (id: string) => void; saved: boolean;
// }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { once: true, margin: "-60px" });
//   const [heartPop, setHeartPop] = useState(false);
//   const [showLottie, setShowLottie] = useState(false);

//   const handleSave = () => {
//     onSave(property.id);
//     if (!saved) {
//       setHeartPop(true);
//       setShowLottie(true);
//       setTimeout(() => { setHeartPop(false); setShowLottie(false); }, 1500);
//     }
//   };

//   const reason = REASON_MAP[property.reason];

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 32 }}
//       animate={inView ? { opacity: 1, y: 0 } : {}}
//       transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
//       whileHover={{ y: -3, transition: { duration: 0.2 } }}
//       layout
//     >
//       <Card className="shadow-none border border-border/60 hover:border-border overflow-hidden group cursor-pointer transition-colors duration-200 h-full flex flex-col">
//         {/* Image area */}
//         <div className={`relative h-44 bg-gradient-to-br ${property.imageGradient} overflow-hidden`}>
//           {/* Subtle mesh overlay */}
//           <div className="absolute inset-0 opacity-20"
//             style={{ backgroundImage: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.2) 0%, transparent 50%)" }}
//           />

//           {/* Floating badges */}
//           <div className="absolute top-3 left-3 flex flex-col gap-1.5">
//             {property.isTrending && (
//               <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.08 + 0.2 }}>
//                 <Badge className="bg-orange-500/90 text-white border-0 text-[10px] gap-1 backdrop-blur-sm h-5">
//                   <Flame size={9} /> Trending
//                 </Badge>
//               </motion.div>
//             )}
//             {property.isNew && (
//               <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.08 + 0.3 }}>
//                 <Badge className="bg-pink-500/90 text-white border-0 text-[10px] gap-1 backdrop-blur-sm h-5">
//                   <Zap size={9} /> New
//                 </Badge>
//               </motion.div>
//             )}
//           </div>

//           {/* Save button */}
//           <div className="absolute top-3 right-3">
//             <motion.button
//               onClick={(e) => { e.stopPropagation(); handleSave(); }}
//               whileTap={{ scale: 0.85 }}
//               className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
//             >
//               <motion.div animate={heartPop ? { scale: [1, 1.5, 1] } : {}}>
//                 <Heart size={15} className={saved ? "fill-red-400 text-red-400" : "text-white"} />
//               </motion.div>
//             </motion.button>
//             {showLottie && (
//               <div className="absolute -top-4 -right-4 pointer-events-none">
//                 <Lottie animationData={sparkleLottie} loop={false} style={{ width: 48, height: 48 }} />
//               </div>
//             )}
//           </div>

//           {/* Property type icon */}
//           <div className="absolute bottom-3 left-3">
//             <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
//               {property.type === "house" ? <Home size={15} className="text-white" />
//                 : property.type === "studio" ? <Building2 size={15} className="text-white" />
//                 : <FaRegBuilding size={13} className="text-white" />}
//             </div>
//           </div>

//           {/* Saved count */}
//           <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5">
//             <BookMarked size={10} className="text-white/80" />
//             <span className="text-[10px] text-white/80">{property.savedByCount}</span>
//           </div>
//         </div>

//         <CardContent className="p-4 flex flex-col flex-1 gap-3">
//           {/* Title + match */}
//           <div className="flex items-start justify-between gap-2">
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-1.5 mb-0.5">
//                 <p className="font-semibold text-sm leading-tight truncate">{property.title}</p>
//                 {property.isVerified && (
//                   <IoShieldCheckmarkOutline size={14} className="text-sky-500 shrink-0" />
//                 )}
//               </div>
//               <div className="flex items-center gap-1 text-xs text-muted-foreground">
//                 <MapPin size={11} className="shrink-0" />
//                 <span className="truncate">{property.area}, {property.city}</span>
//               </div>
//             </div>
//             <MatchRing score={property.matchScore} />
//           </div>

//           {/* AI reason chip */}
//           {reason && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: index * 0.08 + 0.35 }}
//             >
//               <div className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${reason.color}`}>
//                 {reason.icon}
//                 {reason.label}
//               </div>
//             </motion.div>
//           )}

//           {/* Stats row */}
//           <div className="flex items-center gap-3 text-xs text-muted-foreground">
//             <span className="flex items-center gap-1"><BedDouble size={12} /> {property.bedrooms} bed</span>
//             <span className="flex items-center gap-1"><Bath size={12} /> {property.bathrooms} bath</span>
//             <span className="flex items-center gap-1 ml-auto">
//               <Star size={11} className="fill-amber-400 text-amber-400" />
//               <span className="font-medium text-foreground">{property.rating}</span>
//               <span>({property.reviewCount})</span>
//             </span>
//           </div>

//           {/* Amenity pills */}
//           <div className="flex flex-wrap gap-1">
//             {property.amenities.slice(0, 3).map((a, i) => (
//               <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
//                 {a.icon} {a.label}
//               </span>
//             ))}
//             {property.amenities.length > 3 && (
//               <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
//                 +{property.amenities.length - 3}
//               </span>
//             )}
//           </div>

//           <Separator className="opacity-50" />

//           {/* Price + CTA */}
//           <div className="flex items-center justify-between mt-auto">
//             <div>
//               <div className="flex items-baseline gap-0.5">
//                 <span className="text-lg font-bold">৳{property.rent.toLocaleString()}</span>
//                 <span className="text-xs text-muted-foreground">/mo</span>
//               </div>
//             </div>
//             <Button size="sm" className="h-8 text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90">
//               View Details <ArrowRight size={13} />
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

// // ── Section Header ────────────────────────────────────────────────────────────
// function SectionHeader({ icon, title, subtitle, count }: {
//   icon: React.ReactNode; title: string; subtitle?: string; count?: number;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.45 }}
//       className="flex items-start justify-between gap-3"
//     >
//       <div className="flex items-center gap-2.5">
//         <div className="p-2 rounded-xl bg-muted/60">{icon}</div>
//         <div>
//           <div className="flex items-center gap-2">
//             <h2 className="text-base font-bold tracking-tight">{title}</h2>
//             {count !== undefined && (
//               <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{count}</Badge>
//             )}
//           </div>
//           {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
//         </div>
//       </div>
//       <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground shrink-0">
//         See all <ChevronRight size={12} />
//       </Button>
//     </motion.div>
//   );
// }

// // ── Preference Tag ────────────────────────────────────────────────────────────
// function PreferenceTag({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
//   return (
//     <motion.button
//       onClick={onClick}
//       whileTap={{ scale: 0.95 }}
//       className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-all duration-150 ${
//         active
//           ? "bg-foreground text-background border-foreground"
//           : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
//       }`}
//     >
//       {label}
//     </motion.button>
//   );
// }

// // ── Skeleton Cards ────────────────────────────────────────────────────────────
// function SkeletonCards() {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//       {[...Array(6)].map((_, i) => (
//         <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
//           <Card className="shadow-none border border-border/50 overflow-hidden">
//             <Skeleton className="h-44 w-full rounded-none" />
//             <CardContent className="p-4 space-y-3">
//               <div className="flex justify-between">
//                 <div className="space-y-1.5 flex-1">
//                   <Skeleton className="h-4 w-3/4 rounded" />
//                   <Skeleton className="h-3 w-1/2 rounded" />
//                 </div>
//                 <Skeleton className="h-12 w-12 rounded-full" />
//               </div>
//               <Skeleton className="h-5 w-32 rounded-full" />
//               <div className="flex gap-3">
//                 <Skeleton className="h-3 w-14 rounded" />
//                 <Skeleton className="h-3 w-14 rounded" />
//                 <Skeleton className="h-3 w-14 rounded ml-auto" />
//               </div>
//               <div className="flex gap-1.5">
//                 <Skeleton className="h-5 w-16 rounded-full" />
//                 <Skeleton className="h-5 w-16 rounded-full" />
//                 <Skeleton className="h-5 w-16 rounded-full" />
//               </div>
//               <Skeleton className="h-px w-full" />
//               <div className="flex justify-between items-center">
//                 <Skeleton className="h-6 w-24 rounded" />
//                 <Skeleton className="h-8 w-24 rounded-lg" />
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>
//       ))}
//     </div>
//   );
// }

// // ── AI Insight Banner ─────────────────────────────────────────────────────────
// function InsightBanner() {
//   const insights = [
//     { icon: <TrendingUp size={14} />, text: "Properties in Agrabad are 12% cheaper this month", color: "text-emerald-600" },
//     { icon: <Flame size={14} />, text: "3-bed apartments near GEC Circle are in high demand", color: "text-orange-600" },
//     { icon: <Zap size={14} />, text: "18 new listings match your preferences this week", color: "text-violet-600" },
//   ];
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     const t = setInterval(() => setCurrent((c) => (c + 1) % insights.length), 4000);
//     return () => clearInterval(t);
//   }, []);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -8 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-muted/60 via-muted/30 to-transparent p-4"
//     >
//       <div className="flex items-center gap-3">
//         <div className="p-2 rounded-xl bg-background border border-border/50 shrink-0">
//           <Sparkles size={16} className="text-amber-500" />
//         </div>
//         <div className="flex-1 min-w-0">
//           <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">AI Insight</p>
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={current}
//               initial={{ opacity: 0, y: 6 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -6 }}
//               transition={{ duration: 0.3 }}
//               className={`flex items-center gap-1.5 text-sm font-medium ${insights[current].color}`}
//             >
//               {insights[current].icon}
//               {insights[current].text}
//             </motion.div>
//           </AnimatePresence>
//         </div>
//         <div className="flex gap-1 shrink-0">
//           {insights.map((_, i) => (
//             <button key={i} onClick={() => setCurrent(i)}
//               className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === current ? "bg-foreground w-3" : "bg-muted-foreground/30"}`}
//             />
//           ))}
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ── Quick Stats ───────────────────────────────────────────────────────────────
// function QuickStats({ total, saved, newThisWeek }: { total: number; saved: number; newThisWeek: number }) {
//   const stats = [
//     { label: "Matches found", value: total, icon: <Sparkles size={14} />, color: "text-violet-600" },
//     { label: "Saved", value: saved, icon: <Heart size={14} />, color: "text-rose-500" },
//     { label: "New this week", value: newThisWeek, icon: <Zap size={14} />, color: "text-amber-500" },
//   ];
//   return (
//     <div className="grid grid-cols-3 gap-3">
//       {stats.map((s, i) => (
//         <motion.div
//           key={i}
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: i * 0.1 + 0.1 }}
//         >
//           <div className="bg-muted/40 rounded-xl p-3 text-center border border-border/40">
//             <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
//             <p className="text-lg font-bold">{s.value}</p>
//             <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );
// }

// // ── Filter Sheet ──────────────────────────────────────────────────────────────
// function FilterSheet({ priceRange, setPriceRange, bedroomsFilter, setBedroomsFilter, verifiedOnly, setVerifiedOnly }:
//   { priceRange: number[]; setPriceRange: (v: number[]) => void; bedroomsFilter: number | null; setBedroomsFilter: (v: number | null) => void; verifiedOnly: boolean; setVerifiedOnly: (v: boolean) => void; }) {
//   return (
//     <Sheet>
//       <SheetTrigger asChild>
//         <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
//           <SlidersHorizontal size={13} /> Filters
//         </Button>
//       </SheetTrigger>
//       <SheetContent side="right" className="w-80">
//         <SheetHeader>
//           <SheetTitle className="flex items-center gap-2">
//             <SlidersHorizontal size={16} /> Filter Recommendations
//           </SheetTitle>
//         </SheetHeader>
//         <div className="mt-6 space-y-7">
//           {/* Price range */}
//           <div className="space-y-3">
//             <Label className="text-sm font-semibold">Monthly Rent</Label>
//             <Slider
//               min={5000} max={60000} step={1000}
//               value={priceRange}
//               onValueChange={setPriceRange}
//               className="w-full"
//             />
//             <div className="flex justify-between text-xs text-muted-foreground">
//               <span>৳{priceRange[0].toLocaleString()}</span>
//               <span>৳{priceRange[1].toLocaleString()}</span>
//             </div>
//           </div>

//           <Separator />

//           {/* Bedrooms */}
//           <div className="space-y-3">
//             <Label className="text-sm font-semibold">Bedrooms</Label>
//             <div className="flex gap-2 flex-wrap">
//               {[null, 1, 2, 3, 4].map((n) => (
//                 <button
//                   key={String(n)}
//                   onClick={() => setBedroomsFilter(n)}
//                   className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
//                     bedroomsFilter === n
//                       ? "bg-foreground text-background border-foreground"
//                       : "border-border text-muted-foreground hover:border-foreground/40"
//                   }`}
//                 >
//                   {n === null ? "Any" : `${n}${n === 4 ? "+" : ""} bed`}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <Separator />

//           {/* Verified only */}
//           <div className="flex items-center justify-between">
//             <div>
//               <Label className="text-sm font-semibold">Verified Owners Only</Label>
//               <p className="text-xs text-muted-foreground mt-0.5">Show only verified landlords</p>
//             </div>
//             <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
//           </div>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }

// // ── Main Page ─────────────────────────────────────────────────────────────────
// export default function AIRecommendationsPage() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
//   const [activePrefs, setActivePrefs] = useState<Set<string>>(new Set(["Near University", "Furnished"]));
//   const [sortBy, setSortBy] = useState("match");
//   const [search, setSearch] = useState("");
//   const [priceRange, setPriceRange] = useState([5000, 50000]);
//   const [bedroomsFilter, setBedroomsFilter] = useState<number | null>(null);
//   const [verifiedOnly, setVerifiedOnly] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   useEffect(() => {
//     const t = setTimeout(() => setIsLoading(false), 1800);
//     return () => clearTimeout(t);
//   }, []);

//   const toggleSave = useCallback((id: string) => {
//     setSavedIds((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   }, []);

//   const togglePref = (tag: string) => {
//     setActivePrefs((prev) => {
//       const next = new Set(prev);
//       next.has(tag) ? next.delete(tag) : next.add(tag);
//       return next;
//     });
//   };

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     setIsLoading(true);
//     await new Promise((r) => setTimeout(r, 1400));
//     setIsLoading(false);
//     setIsRefreshing(false);
//   };

//   // Filter + sort
//   const filtered = MOCK_PROPERTIES
//     .filter((p) => {
//       const q = search.toLowerCase();
//       const matchSearch = !q || p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
//       const matchPrice = p.rent >= priceRange[0] && p.rent <= priceRange[1];
//       const matchBed = bedroomsFilter === null || p.bedrooms === bedroomsFilter;
//       const matchVerified = !verifiedOnly || p.isVerified;
//       return matchSearch && matchPrice && matchBed && matchVerified;
//     })
//     .sort((a, b) => {
//       if (sortBy === "match") return b.matchScore - a.matchScore;
//       if (sortBy === "price_asc") return a.rent - b.rent;
//       if (sortBy === "rating") return b.rating - a.rating;
//       if (sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
//       return 0;
//     });

//   const newThisWeek = MOCK_PROPERTIES.filter((p) => p.isNew).length;

//   return (
//     <TooltipProvider>
//       <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6">

//         {/* ── Page Header ── */}
//         <motion.div
//           initial={{ opacity: 0, y: -16 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
//         >
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
//                 <Sparkles size={22} className="text-white" />
//               </div>
//               <motion.div
//                 animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
//                 transition={{ repeat: Infinity, duration: 2.5 }}
//                 className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background"
//               />
//             </div>
//             <div>
//               <h1 className="text-2xl font-black tracking-tight">AI Recommendations</h1>
//               <p className="text-sm text-muted-foreground">Personalized properties picked just for you</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs h-9">
//               <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
//               Refresh
//             </Button>
//             <FilterSheet
//               priceRange={priceRange} setPriceRange={setPriceRange}
//               bedroomsFilter={bedroomsFilter} setBedroomsFilter={setBedroomsFilter}
//               verifiedOnly={verifiedOnly} setVerifiedOnly={setVerifiedOnly}
//             />
//           </div>
//         </motion.div>

//         {/* ── AI Insight Banner ── */}
//         <InsightBanner />

//         {/* ── Quick Stats ── */}
//         <QuickStats total={filtered.length} saved={savedIds.size} newThisWeek={newThisWeek} />

//         {/* ── Preference Tags ── */}
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="space-y-3"
//         >
//           <div className="flex items-center gap-2">
//             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your preferences</p>
//             <Badge variant="outline" className="text-[10px] h-4 px-1.5">{activePrefs.size} active</Badge>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {PREFERENCE_TAGS.map((tag) => (
//               <PreferenceTag key={tag} label={tag} active={activePrefs.has(tag)} onClick={() => togglePref(tag)} />
//             ))}
//           </div>
//         </motion.div>

//         {/* ── Search + Sort ── */}
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.25 }}
//           className="flex flex-col sm:flex-row gap-3"
//         >
//           <div className="relative flex-1">
//             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
//             <Input
//               placeholder="Search by property name, area…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-8 h-9 text-sm bg-muted/30 border-border/50"
//             />
//           </div>
//           <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
//             {SORT_OPTIONS.map((opt) => (
//               <button
//                 key={opt.id}
//                 onClick={() => setSortBy(opt.id)}
//                 className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border whitespace-nowrap font-medium transition-all duration-150 ${
//                   sortBy === opt.id
//                     ? "bg-foreground text-background border-foreground"
//                     : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
//                 }`}
//               >
//                 {opt.icon} {opt.label}
//               </button>
//             ))}
//           </div>
//         </motion.div>

//         {/* ── Recommended Properties ── */}
//         <div className="space-y-5">
//           <SectionHeader
//             icon={<Sparkles size={15} className="text-amber-500" />}
//             title="Recommended for You"
//             subtitle="AI-matched based on your history and preferences"
//             count={filtered.length}
//           />

//           {isLoading ? (
//             <SkeletonCards />
//           ) : filtered.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.97 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="flex flex-col items-center justify-center py-24 text-center"
//             >
//               <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
//                 <Home size={28} className="text-muted-foreground/40" />
//               </div>
//               <h3 className="font-semibold text-sm mb-1">No matches found</h3>
//               <p className="text-xs text-muted-foreground max-w-xs">Try adjusting your filters or preferences to see more results.</p>
//               <Button variant="outline" size="sm" className="mt-4 text-xs" onClick={() => { setSearch(""); setPriceRange([5000, 50000]); setBedroomsFilter(null); setVerifiedOnly(false); }}>
//                 Clear filters
//               </Button>
//             </motion.div>
//           ) : (
//             <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//               <AnimatePresence mode="popLayout">
//                 {filtered.map((property, i) => (
//                   <PropertyCard
//                     key={property.id}
//                     property={property}
//                     index={i}
//                     onSave={toggleSave}
//                     saved={savedIds.has(property.id)}
//                   />
//                 ))}
//               </AnimatePresence>
//             </motion.div>
//           )}
//         </div>

//         {/* ── Trending Section ── */}
//         {!isLoading && (
//           <div className="space-y-5 pt-2">
//             <SectionHeader
//               icon={<Flame size={15} className="text-orange-500" />}
//               title="Trending in Chattogram"
//               subtitle="Most viewed properties in the last 48 hours"
//             />
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//               {MOCK_PROPERTIES.filter((p) => p.isTrending).map((property, i) => (
//                 <PropertyCard key={`t-${property.id}`} property={property} index={i} onSave={toggleSave} saved={savedIds.has(property.id)} />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* ── CTA Banner ── */}
//         {!isLoading && (
//           <motion.div
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 }}
//             className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 text-white"
//           >
//             <div className="absolute inset-0 opacity-10"
//               style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(139,92,246,0.6) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(245,158,11,0.4) 0%, transparent 50%)" }}
//             />
//             <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2.5 rounded-xl bg-white/10">
//                   <Bell size={18} className="text-amber-400" />
//                 </div>
//                 <div>
//                   <p className="font-bold text-sm">Never miss a perfect match</p>
//                   <p className="text-xs text-white/60 mt-0.5">Get instant alerts when a property matching your criteria is listed</p>
//                 </div>
//               </div>
//               <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90 font-semibold text-xs gap-1.5 shrink-0">
//                 Enable Alerts <Bell size={13} />
//               </Button>
//             </div>
//           </motion.div>
//         )}

//         {/* ── Footer spacer ── */}
//         <div className="h-4" />
//       </div>
//     </TooltipProvider>
//   );
// }
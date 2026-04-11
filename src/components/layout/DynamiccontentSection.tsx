"use client";

// ✅ FILE PATH: src/components/layout/DynamicContentSection.tsx
//
// Stack:
//   • Framer Motion  — scroll-triggered reveals, staggered cards, spring physics
//   • Anime.js       — counter animation (rent amounts, stats), SVG path draws
//   • Lottie (lottie-react) — animated icons for feature cards
//   • shadcn/ui      — Button, Badge, Card, Separator, Skeleton
//
// Dependencies to install:
//   npm install framer-motion animejs lottie-react
//   npx shadcn@latest add button badge card separator skeleton

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  BedDouble,
  Bath,
  Star,
  Building2,
  TrendingUp,
  Home,
  Users,
} from "lucide-react";
import {
  motion,
  useInView,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { animate as animeAnimate } from "animejs";
import Lottie from "lottie-react";

import { Button }    from "@/components/ui/button";
import { Badge }     from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton }  from "@/components/ui/skeleton";

// ─────────────────────────────────────────────────────────────────────────────
// Lottie JSON stubs — replace with real Lottie JSON imports from LottieFiles
// e.g. import verifiedAnim from "@/animations/verified.json"
// ─────────────────────────────────────────────────────────────────────────────
const LOTTIE_VERIFIED   = null; // import verifiedAnim   from "@/animations/verified.json"
const LOTTIE_SECURE     = null; // import secureAnim     from "@/animations/secure.json"
const LOTTIE_QUICK      = null; // import quickAnim      from "@/animations/quick.json"
const LOTTIE_COMMUNITY  = null; // import communityAnim  from "@/animations/community.json"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Property = {
  id: string;
  title: string;
  city: string;
  area: string;
  type: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  rating: number;
  totalReviews: number;
  availableFor: string;
  status: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    lottie: LOTTIE_VERIFIED,
    fallbackIcon: "✦",
    color: "from-emerald-500/20 to-teal-500/10",
    accent: "text-emerald-600",
    border: "border-emerald-500/30",
    title: "Verified Listings",
    description:
      "Every property is manually reviewed and confirmed by our admin team before going live. Zero fake ads.",
  },
  {
    lottie: LOTTIE_SECURE,
    fallbackIcon: "⬡",
    color: "from-sky-500/20 to-blue-500/10",
    accent: "text-sky-600",
    border: "border-sky-500/30",
    title: "Secure Booking",
    description:
      "End-to-end encrypted payments and bookings. Your money and data are fully protected at every step.",
  },
  {
    lottie: LOTTIE_QUICK,
    fallbackIcon: "◈",
    color: "from-amber-500/20 to-orange-500/10",
    accent: "text-amber-600",
    border: "border-amber-500/30",
    title: "Quick Response",
    description:
      "Property owners respond to booking requests within 24 hours — guaranteed fast communication.",
  },
  {
    lottie: LOTTIE_COMMUNITY,
    fallbackIcon: "❋",
    color: "from-violet-500/20 to-purple-500/10",
    accent: "text-violet-600",
    border: "border-violet-500/30",
    title: "Trusted Community",
    description:
      "Make smarter decisions with verified tenant reviews and authentic ratings from real renters.",
  },
];

const STATS = [
  { icon: Home,      label: "Active Listings",    value: 2400, suffix: "+" },
  { icon: Users,     label: "Happy Tenants",       value: 8700, suffix: "+" },
  { icon: TrendingUp,label: "Cities Covered",      value: 32,   suffix: ""  },
  { icon: Star,      label: "Average Rating",      value: 4.9,  suffix: "",  isFloat: true },
];

const TRUST_PILLS = [
  "Free registration",
  "No hidden charges",
  "Verified properties",
  "24/7 Support",
];

// ─────────────────────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Animated counter (Anime.js)
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedCounter({
  to,
  isFloat,
  suffix,
}: {
  to: number;
  isFloat?: boolean;
  suffix: string;
}) {
  const ref       = useRef<HTMLSpanElement>(null);
  const inView    = useInView(ref, { once: true, margin: "-80px" });
  const started   = useRef(false);

  useEffect(() => {
    if (!inView || started.current || !ref.current) return;
    started.current = true;
    const obj = { value: 0 };
    animeAnimate(obj, {
      value: to,
      duration: 1800,
      ease: "easeOutExpo",
      onUpdate() {
        if (ref.current) {
          ref.current.textContent = isFloat
            ? obj.value.toFixed(1) + suffix
            : Math.round(obj.value).toLocaleString() + suffix;
        }
      },
    });
  }, [inView, to, isFloat, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {isFloat ? `0.0${suffix}` : `0${suffix}`}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Property Card
// ─────────────────────────────────────────────────────────────────────────────
function PropertyCard({
  property,
  index,
}: {
  property: Property;
  index: number;
}) {
  const image     = property.images?.[0] ?? null;
  const typeLabel = property.type.replace(/_/g, " ");
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <Link
        href={`/property/${property.id}`}
        className="group block rounded-2xl bg-card border border-border overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative h-52 bg-muted overflow-hidden">
          {image ? (
            <motion.img
              src={image}
              alt={property.title}
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.07 : 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Building2 className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/90 backdrop-blur-sm text-foreground border border-border text-[11px] font-medium capitalize">
              {typeLabel}
            </Badge>
          </div>

          {/* Rating */}
          {property.rating > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-sm border border-border">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold">
                {property.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Available for */}
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] text-white/90 font-medium bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
              For {property.availableFor}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="font-bold text-base leading-snug line-clamp-1 group-hover:text-emerald-600 transition-colors duration-200">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {property.area}, {property.city}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms} bed
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms} bath
            </span>
            {property.totalReviews > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground/70">
                {property.totalReviews} reviews
              </span>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-emerald-600 text-lg">
                ৳{property.rentAmount.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">/month</span>
            </div>
            <motion.span
              className="text-xs text-emerald-600 font-medium flex items-center gap-0.5"
              animate={{ x: hovered ? 3 : 0 }}
              transition={{ duration: 0.2 }}
            >
              View Details
              <ArrowRight className="h-3 w-3" />
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Card (loading state)
// ─────────────────────────────────────────────────────────────────────────────
function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Separator />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature Card
// ─────────────────────────────────────────────────────────────────────────────
function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const lottieRef  = useRef(null);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative p-8 rounded-2xl bg-card border ${feature.border} hover:shadow-xl transition-shadow duration-300 group overflow-hidden`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Icon / Lottie */}
      <div className="relative mb-5">
        {feature.lottie ? (
          <div className="w-16 h-16">
            <Lottie
              lottieRef={lottieRef}
              animationData={feature.lottie}
              loop={hovered}
              autoplay={false}
              style={{ width: 64, height: 64 }}
            />
          </div>
        ) : (
          <motion.div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border ${feature.border}`}
            animate={{ rotate: hovered ? [0, -8, 8, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={`text-2xl ${feature.accent}`}>
              {feature.fallbackIcon}
            </span>
          </motion.div>
        )}
      </div>

      <h3 className="relative text-lg font-bold mb-2">{feature.title}</h3>
      <p className="relative text-sm text-muted-foreground leading-relaxed">
        {feature.description}
      </p>

      {/* Bottom accent line */}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${feature.color.replace("/20", "").replace("/10", "")}`}
        initial={{ width: 0 }}
        animate={{ width: hovered ? "100%" : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component (Client — fetches on mount)
// ─────────────────────────────────────────────────────────────────────────────
export default function DynamicContentSection() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading,    setLoading]    = useState(true);

  // Anime.js — decorative SVG line draw on mount
  const svgRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    fetch(
      `${BACKEND_URL}/api/properties?limit=4&sort=rating&status=APPROVED`,
      { cache: "no-store" }
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        const outer = json?.data ?? json;
        const arr   = Array.isArray(outer?.data)
          ? outer.data
          : Array.isArray(outer)
          ? outer
          : [];
        setProperties(arr);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  // SVG decorative path draw
  useEffect(() => {
    if (!svgRef.current) return;
    const path   = svgRef.current;
    const length = path.getTotalLength();
    path.style.strokeDasharray  = String(length);
    path.style.strokeDashoffset = String(length);
    animeAnimate(path, {
      strokeDashoffset: [length, 0],
      duration: 2200,
      ease: "easeInOutSine",
      delay: 400,
    });
  }, []);

  // Parallax removed — useScroll/useTransform not needed

  return (
    <>
      {/* ── Section 1: Featured Properties ─────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        {/* Decorative SVG background line */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.07]"
          aria-hidden
        >
          <path
            ref={svgRef}
            d="M -100 300 Q 200 100 500 350 T 1100 200 T 1600 400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <div className="mx-auto w-full max-w-7xl px-4 relative">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14"
          >
            <div>
              <motion.p
                variants={fadeUp}
                custom={0}
                className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2"
              >
                <span className="inline-block w-6 h-px bg-emerald-500" />
                Featured Listings
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-4xl md:text-5xl font-bold leading-tight"
              >
                Latest Properties
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg text-muted-foreground mt-3 max-w-xl"
              >
                Top-rated, verified properties available for rent right now.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} custom={3} className="flex-shrink-0">
              <Button asChild variant="outline" size="lg" className="group">
                <Link href="/property">
                  See All Properties
                  <motion.span
                    className="ml-2 inline-block"
                    animate={{ x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14"
          >
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      <AnimatedCounter
                        to={stat.value}
                        isFloat={stat.isFloat}
                        suffix={stat.suffix}
                      />
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Property grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : properties.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 rounded-2xl border border-dashed border-border"
              >
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
                <p className="text-muted-foreground mb-4 text-lg">
                  No properties available right now.
                </p>
                <Button asChild variant="outline">
                  <Link href="/property">Browse All</Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {properties.map((property, i) => (
                  <PropertyCard key={property.id} property={property} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Section 2: Why HomeRent ─────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,currentColor,currentColor 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,currentColor,currentColor 1px,transparent 1px,transparent 48px)",
          }}
        />

        <div className="mx-auto w-full max-w-7xl px-4 relative">
          {/* Heading */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3 flex items-center justify-center gap-2"
            >
              <span className="inline-block w-6 h-px bg-emerald-500" />
              Why choose us?
              <span className="inline-block w-6 h-px bg-emerald-500" />
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Why Choose HomeRent?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              We make finding a home simple, safe, and trustworthy — every step
              of the way.
            </motion.p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: CTA ──────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        {/* Animated background blobs */}
        <motion.div
          className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-emerald-400/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-32 -right-32 w-[560px] h-[560px] rounded-full bg-teal-400/10 blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="relative mx-auto w-full max-w-4xl px-4 text-center">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 mb-8 border border-emerald-200 dark:border-emerald-800"
          >
            <Building2 className="h-10 w-10 text-emerald-600" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight"
          >
            Find your{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-emerald-600">dream home</span>
              {/* Underline decoration */}
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-emerald-400/40 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{ originX: 0 }}
              />
            </span>
            <br />
            starting today
          </motion.h2>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Thousands of verified properties. Easy booking. Secure payment. All
            in one place.
          </motion.p>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-2 justify-center mb-10"
          >
            {TRUST_PILLS.map((pill, i) => (
              <motion.span
                key={pill}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {pill}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              asChild
              size="lg"
              className="px-10 text-base h-14 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 group"
            >
              <Link href="/property">
                Browse Properties
                <motion.span
                  className="ml-2 inline-block"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-10 text-base h-14 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-400 transition-all duration-300"
            >
              <Link href="/signup">List Your Property</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}












































// // ✅ SERVER COMPONENT — no "use client", no useState, no useEffect
// // FILE PATH: src/components/layout/DynamicContentSection.tsx
// //
// // এই component টা home page এ Featured Properties দেখাবে
// // API: GET /api/properties?limit=4&sort=rating (public endpoint, no auth লাগে না)

// import Link from "next/link";
// import {
//   ArrowRight, MapPin, BedDouble, Bath,
//   Star, Shield, Clock, HeartHandshake, BadgeCheck,
//   Building2,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge }  from "@/components/ui/badge";

// // ── Types ──────────────────────────────────────────────────────────────────────
// type Property = {
//   id: string;
//   title: string;
//   city: string;
//   area: string;
//   type: string;
//   rentAmount: number;
//   bedrooms: number;
//   bathrooms: number;
//   images: string[];
//   rating: number;
//   totalReviews: number;
//   availableFor: string;
//   status: string;
// };

// // ── Why HomeRent features (static) ────────────────────────────────────────────
// const FEATURES = [
//   {
//     icon: BadgeCheck,
//     title: "Verified Properties",
//     description: "প্রতিটি property admin দ্বারা verify করা। ভুয়া listing নেই।",
//   },
//   {
//     icon: Shield,
//     title: "Secure Booking",
//     description: "Online payment ও booking সম্পূর্ণ secure এবং protected।",
//   },
//   {
//     icon: Clock,
//     title: "Quick Response",
//     description: "Owner রা ২৪ ঘণ্টার মধ্যে booking request এ respond করেন।",
//   },
//   {
//     icon: HeartHandshake,
//     title: "Trusted Community",
//     description: "Real tenant reviews দিয়ে সঠিক property বেছে নাও।",
//   },
// ];

// // ── Property Card ──────────────────────────────────────────────────────────────
// function PropertyCard({ property }: { property: Property }) {
//   const image = property.images?.[0] ?? null;
//   const typeLabel = property.type.replace(/_/g, " ");

//   return (
//     <Link
//       href={`/property/${property.id}`}
//       className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
//     >
//       {/* Image */}
//       <div className="relative h-48 bg-muted overflow-hidden">
//         {image ? (
//           <img
//             src={image}
//             alt={property.title}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//           />
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <Building2 className="h-16 w-16 text-muted-foreground/20" />
//           </div>
//         )}

//         {/* Type badge */}
//         <div className="absolute top-3 left-3">
//           <Badge className="bg-background/90 backdrop-blur-sm text-foreground border border-border text-[11px] font-medium">
//             {typeLabel}
//           </Badge>
//         </div>

//         {/* Rating badge */}
//         {property.rating > 0 && (
//           <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-sm border border-border">
//             <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
//             <span className="text-xs font-semibold">{property.rating.toFixed(1)}</span>
//           </div>
//         )}
//       </div>

//       {/* Info */}
//       <div className="p-5 space-y-3">
//         <div>
//           <h3 className="font-bold text-base leading-snug line-clamp-1 group-hover:text-emerald-600 transition-colors">
//             {property.title}
//           </h3>
//           <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
//             <MapPin className="h-3 w-3 flex-shrink-0" />
//             {property.area}, {property.city}
//           </div>
//         </div>

//         {/* Bed/Bath */}
//         <div className="flex items-center gap-3 text-xs text-muted-foreground">
//           <span className="flex items-center gap-1">
//             <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms} bed
//           </span>
//           <span className="flex items-center gap-1">
//             <Bath className="h-3.5 w-3.5" /> {property.bathrooms} bath
//           </span>
//           <span className="ml-auto text-[10px] text-muted-foreground/60">
//             For {property.availableFor}
//           </span>
//         </div>

//         {/* Price */}
//         <div className="flex items-center justify-between pt-3 border-t border-border">
//           <div>
//             <span className="font-bold text-emerald-600 text-lg">
//               ৳{property.rentAmount.toLocaleString()}
//             </span>
//             <span className="text-xs text-muted-foreground">/month</span>
//           </div>
//           <span className="text-xs text-emerald-600 font-medium group-hover:underline">
//             View Details →
//           </span>
//         </div>
//       </div>
//     </Link>
//   );
// }

// // ── Main Server Component ──────────────────────────────────────────────────────
// export default async function DynamicContentSection() {
//   const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

//   let properties: Property[] = [];

//   try {
//     // ✅ Public endpoint — কোনো auth লাগে না
//     // approved + rating অনুযায়ী sort করে top 4 নিচ্ছি
//     const res = await fetch(
//       `${BACKEND_URL}/api/properties?limit=4&sort=rating&status=APPROVED`,
//       { cache: "no-store" }  // সবসময় fresh data
//     );

//     if (res.ok) {
//       const json = await res.json();
//       // Backend response shape handle: { data: { data: [] } } বা { data: [] }
//       const outer = json?.data ?? json;
//       properties = Array.isArray(outer?.data) ? outer.data
//                  : Array.isArray(outer)       ? outer
//                  : [];
//     }
//   } catch (err) {
//     console.error("⚠️ DynamicContentSection: Failed to fetch properties:", err);
//     // properties empty থাকবে — empty state দেখাবে
//   }

//   return (
//     <>
//       {/* ── Section 1: Featured Properties ───────────────────────────────────── */}
//       <section className="py-20">
//         <div className="mx-auto w-full max-w-7xl px-4">

//           {/* Header */}
//           <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
//             <div>
//               <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-2">
//                 🏡 Featured Listings
//               </p>
//               <h2 className="text-4xl md:text-5xl font-bold leading-tight">
//                 Latest Properties
//               </h2>
//               <p className="text-lg text-muted-foreground mt-3 max-w-xl">
//                 সেরা rated এবং verified properties যা এখন available
//               </p>
//             </div>
//             <Button asChild variant="outline" size="lg" className="flex-shrink-0">
//               <Link href="/property">
//                 See All Properties
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Link>
//             </Button>
//           </div>

//           {/* Grid or Empty */}
//           {properties.length === 0 ? (
//             <div className="text-center py-20 rounded-2xl border border-dashed border-border">
//               <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
//               <p className="text-muted-foreground mb-4">
//                 এখনো কোনো property available নেই।
//               </p>
//               <Button asChild variant="outline">
//                 <Link href="/property">Browse All</Link>
//               </Button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {properties.map((property) => (
//                 <PropertyCard key={property.id} property={property} />
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* ── Section 2: Why HomeRent ───────────────────────────────────────────── */}
//       <section className="py-20 bg-muted/30">
//         <div className="mx-auto w-full max-w-7xl px-4">
//           <div className="text-center mb-14">
//             <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-2">
//               কেন আমাদের বেছে নেবে?
//             </p>
//             <h2 className="text-4xl md:text-5xl font-bold">
//               Why Choose HomeRent?
//             </h2>
//             <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
//               আমরা বাড়ি খোঁজাকে সহজ, নিরাপদ এবং বিশ্বস্ত করে তুলি
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {FEATURES.map((feature) => {
//               const Icon = feature.icon;
//               return (
//                 <div
//                   key={feature.title}
//                   className="text-center p-8 rounded-2xl bg-card border border-border hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 group"
//                 >
//                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 mb-5 group-hover:scale-110 transition-transform">
//                     <Icon className="h-8 w-8 text-emerald-600" />
//                   </div>
//                   <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
//                   <p className="text-sm text-muted-foreground leading-relaxed">
//                     {feature.description}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* ── Section 3: CTA ────────────────────────────────────────────────────── */}
//       <section className="py-24 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10" />
//         <div className="relative mx-auto w-full max-w-4xl px-4 text-center">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 mb-8 border border-emerald-200 dark:border-emerald-800">
//             <Building2 className="h-10 w-10 text-emerald-600" />
//           </div>
//           <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
//             আজই তোমার <br />
//             <span className="text-emerald-600">স্বপ্নের বাড়ি</span> খুঁজে নাও
//           </h2>
//           <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
//             Thousands of verified properties। সহজ booking। নিরাপদ payment।
//           </p>
//           <div className="flex flex-wrap gap-4 justify-center">
//             <Button
//               asChild
//               size="lg"
//               className="px-10 text-base h-14 bg-emerald-600 hover:bg-emerald-700 text-white"
//             >
//               <Link href="/property">
//                 Browse Properties
//                 <ArrowRight className="ml-2 h-5 w-5" />
//               </Link>
//             </Button>
//             <Button asChild variant="outline" size="lg" className="px-10 text-base h-14">
//               <Link href="/signup">List Your Property</Link>
//             </Button>
//           </div>
//           <p className="text-sm text-muted-foreground mt-8">
//             Free registration • No hidden charges
//           </p>
//         </div>
//       </section>
//     </>
//   );
// }
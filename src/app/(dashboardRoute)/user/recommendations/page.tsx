"use client";
/**
 * src/app/(dashboardRoute)/user/recommendations/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * এই ফাইলে শুধু:
 *   1. Page-level state (useState)
 *   2. GSAP + AOS effects (useEffect)
 *   3. Framer scroll progress bar
 *   4. Filter / sort logic
 *   5. JSX layout — সব UI recommendation.tsx থেকে import করা
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── Framer Motion ─────────────────────────────────────────────────────────────
import { motion, useScroll, useSpring as useFramerSpring, AnimatePresence } from "framer-motion";

// ── GSAP ──────────────────────────────────────────────────────────────────────
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── AOS ───────────────────────────────────────────────────────────────────────
import AOS from "aos";
import "aos/dist/aos.css";

// ── shadcn/ui (page-level only) ───────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";

// ── Lucide (page-level only) ──────────────────────────────────────────────────
import { Home, Sparkles, Flame, Heart, Zap, Search } from "lucide-react";

// ── React Icons (page-level only) ─────────────────────────────────────────────
import { RiMagicLine } from "react-icons/ri";
import { CtaBanner, HeroHeader, InsightBanner, MOCK_PROPERTIES, PREFERENCE_TAGS, PreferenceTag, Property, PropertyCard, SectionHeader, SkeletonCards, SORT_OPTIONS, StatCard } from "@/components/user/Recommendation";

// ── All UI components from recommendation.tsx ─────────────────────────────────
// import {
//   type Property,
//   MOCK_PROPERTIES,
//   PREFERENCE_TAGS,
//   SORT_OPTIONS,
//   HeroHeader,
//   InsightBanner,
//   StatCard,
//   PreferenceTag,
//   SectionHeader,
//   PropertyCard,
//   SkeletonCards,
//   CtaBanner,
// } from "@/components/recommendations/recommendation";

// ─── GSAP plugin registration (client-side only) ─────────────────────────────
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AIRecommendationsPage() {

  // ── State ──────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading]           = useState(true);
  const [savedIds, setSavedIds]             = useState<Set<string>>(new Set());
  const [activePrefs, setActivePrefs]       = useState<Set<string>>(new Set(["Near University", "Furnished"]));
  const [sortBy, setSortBy]                 = useState("match");
  const [search, setSearch]                 = useState("");
  const [priceRange, setPriceRange]         = useState([5000, 50000]);
  const [bedroomsFilter, setBedroomsFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly]     = useState(false);
  const [isRefreshing, setIsRefreshing]     = useState(false);

  // ── Refs for GSAP ──────────────────────────────────────────────────────────
  const heroRef      = useRef<HTMLDivElement>(null);
  const titleRef     = useRef<HTMLHeadingElement>(null);
  const subtitleRef  = useRef<HTMLParagraphElement>(null);
  const ctaBannerRef = useRef<HTMLDivElement>(null);

  // ── Framer scroll progress bar ─────────────────────────────────────────────
  const { scrollYProgress } = useScroll();
  const scaleX = useFramerSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  // ── AOS init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    AOS.init({ duration: 600, easing: "ease-out-cubic", once: true, offset: 60 });
  }, []);

  // ── GSAP hero char-split + CTA parallax ────────────────────────────────────
  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current) return;

    const ctx = gsap.context(() => {
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
        duration: 0.55, stagger: 0.035,
        ease: "back.out(1.8)", delay: 0.1,
      });

      gsap.fromTo(
        subtitleRef.current!,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.6 }
      );

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
      setTimeout(() => AOS.refresh(), 100);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const togglePref = (tag: string) => {
    setActivePrefs((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setIsRefreshing(false);
    setTimeout(() => AOS.refresh(), 100);
  };

  // ── Filter + Sort logic ────────────────────────────────────────────────────
  const filtered = MOCK_PROPERTIES
    .filter((p: Property) => {
      const q = search.toLowerCase();
      return (
        (!q || p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)) &&
        p.rent >= priceRange[0] && p.rent <= priceRange[1] &&
        (bedroomsFilter === null || p.bedrooms === bedroomsFilter) &&
        (!verifiedOnly || p.isVerified)
      );
    })
    .sort((a: Property, b: Property) => {
      if (sortBy === "match")     return b.matchScore - a.matchScore;
      if (sortBy === "price_asc") return a.rent - b.rent;
      if (sortBy === "rating")    return b.rating - a.rating;
      if (sortBy === "newest")    return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0;
    });

  const newCount = MOCK_PROPERTIES.filter((p: Property) => p.isNew).length;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>

      {/* ── Framer scroll progress bar (fixed top) ── */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400 z-50 origin-left"
      />

      <div ref={heroRef} className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 pb-16">

        {/* ── Hero Header (GSAP char-split + Lottie + FilterSheet) ── */}
        <HeroHeader
          titleRef={titleRef}
          subtitleRef={subtitleRef}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          priceRange={priceRange}         setPriceRange={setPriceRange}
          bedroomsFilter={bedroomsFilter} setBedroomsFilter={setBedroomsFilter}
          verifiedOnly={verifiedOnly}     setVerifiedOnly={setVerifiedOnly}
        />

        {/* ── AI Insight Banner (AOS + Framer AnimatePresence) ── */}
        <InsightBanner />

        {/* ── Quick Stat Cards (React Spring count-up + AOS zoom-in) ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<RiMagicLine size={16} className="text-violet-600" />}
            label="AI Matches" value={filtered.length}
            accent="bg-violet-500" aosDelay={0}
          />
          <StatCard
            icon={<Heart size={15} className="text-rose-500" />}
            label="Saved" value={savedIds.size}
            accent="bg-rose-500" aosDelay={80}
          />
          <StatCard
            icon={<Zap size={15} className="text-amber-500" />}
            label="New this week" value={newCount}
            accent="bg-amber-500" aosDelay={160}
          />
        </div>

        {/* ── Preference Tags (Framer whileTap + whileHover) ── */}
        <div data-aos="fade-up" data-aos-once="true" className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Your preferences
            </p>
            <AnimatePresence>
              <motion.div
                key={activePrefs.size}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <span className="text-[10px] border rounded px-1.5 h-4 inline-flex items-center">
                  {activePrefs.size} active
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_TAGS.map((tag) => (
              <PreferenceTag
                key={tag}
                label={tag}
                active={activePrefs.has(tag)}
                onClick={() => togglePref(tag)}
              />
            ))}
          </div>
        </div>

        {/* ── Search + Sort ── */}
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Home size={28} className="text-muted-foreground/30" />
              </div>
              <h3 className="font-bold text-sm mb-1.5">No matches found</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Adjust your filters or preferences to discover more properties.
              </p>
              <Button
                variant="outline" size="sm" className="mt-4 text-xs"
                onClick={() => {
                  setSearch("");
                  setPriceRange([5000, 50000]);
                  setBedroomsFilter(null);
                  setVerifiedOnly(false);
                }}
              >
                Clear all filters
              </Button>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((p: Property, i: number) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    onSave={toggleSave}
                    saved={savedIds.has(p.id)}
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
              {MOCK_PROPERTIES.filter((p: Property) => p.isTrending).map((p: Property, i: number) => (
                <PropertyCard
                  key={`t-${p.id}`}
                  property={p}
                  onSave={toggleSave}
                  saved={savedIds.has(p.id)}
                  aosDelay={i * 80}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── CTA Banner (GSAP parallax ref passed in) ── */}
        {!isLoading && (
          <CtaBanner bannerRef={ctaBannerRef as React.RefObject<HTMLDivElement>} />
        )}

      </div>
    </TooltipProvider>
  );
}
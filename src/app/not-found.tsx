"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import { Home, ArrowLeft, Search, Compass, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Lottie from "lottie-react";

// ── Stable particle data — generated once at module level, never during render ─
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 37.3 + 11) % 100,
  y: (i * 53.7 + 7) % 100,
  size: (i % 3) + 1.5,
  duration: 5 + (i % 6),
  delay: (i % 4) * 0.8,
}));

// ── Floating particle dots ────────────────────────────────────────────────────
function ParticleField() {
  const particles = PARTICLES;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
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

// ── Magnetic tilt card ────────────────────────────────────────────────────────
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

// ── 404 Lottie or SVG fallback ────────────────────────────────────────────────
function LottieOrFallback() {
  const [lottieData, setLottieData] = useState<object | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("https://assets10.lottiefiles.com/packages/lf20_kcsr6fcp.json")
      .then((r) => r.json())
      .then(setLottieData)
      .catch(() => setFailed(true));
  }, []);

  if (lottieData) {
    return (
      <Lottie
        animationData={lottieData}
        loop
        className="mx-auto h-52 w-52"
      />
    );
  }

  // Inline SVG fallback — animated broken signal
  return (
    <motion.div
      className="mx-auto flex h-52 w-52 items-center justify-center"
      animate={{ rotate: [0, -5, 5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="60" cy="60" r="54" className="stroke-border" strokeWidth="1.5" />
        {/* Ghost astronaut-like outline */}
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="60" cy="46" r="16" className="fill-muted stroke-border" strokeWidth="1.5" />
          <rect x="44" y="60" width="32" height="26" rx="8" className="fill-muted stroke-border" strokeWidth="1.5" />
          <circle cx="55" cy="44" r="3" className="fill-primary/60" />
          <circle cx="65" cy="44" r="3" className="fill-primary/60" />
          <path d="M55 51 Q60 54 65 51" className="stroke-primary/60" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
        {/* Signal waves */}
        {[28, 20, 12].map((r, i) => (
          <motion.circle
            key={r}
            cx="60" cy="60" r={r + 54}
            className="stroke-primary/30"
            strokeWidth="1"
            fill="none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.1, 0.8], opacity: [0, 0.5, 0] }}
            transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
            style={{ originX: "50%", originY: "50%" }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

// ── Quick links ───────────────────────────────────────────────────────────────
const quickLinks = [
  { label: "Dashboard", href: "/dashboard", icon: Compass },
  { label: "Search", href: "/search", icon: Search },
  { label: "Reload page", href: "#", icon: RefreshCw, onClick: () => window.location.reload() },
];

// ── Animation variants — defined outside component to avoid re-creation ───────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 160, damping: 18 },
  },
};

// ── Main component ────────────────────────────────────────────────────────────
export default function NotFound() {

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-20">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-secondary/40 blur-3xl" />

      <ParticleField />

      <motion.div
        className="relative z-10 w-full max-w-md text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6 flex justify-center">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-medium tracking-widest uppercase">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
            Error 404
          </Badge>
        </motion.div>

        {/* Lottie / SVG illustration */}
        <motion.div variants={itemVariants}>
          <TiltCard>
            <LottieOrFallback />
          </TiltCard>
        </motion.div>

        {/* Headline */}
        <motion.div variants={itemVariants} className="mt-6 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Lost in space
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            The page you are looking for floated off into the void.
            <br className="hidden sm:block" />
            Lets  get you back to solid ground.
          </p>
        </motion.div>

        <Separator className="my-8 opacity-40" />

        {/* Primary actions */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button asChild size="lg" className="gap-2 w-full sm:w-auto shadow-sm">
            <Link href="/">
              <Home className="h-4 w-4" />
              Return home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 w-full sm:w-auto"
          >
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Link>
          </Button>
        </motion.div>

        {/* Quick links */}
        <motion.div variants={itemVariants} className="mt-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Or try one of these
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickLinks.map(({ label, href, icon: Icon, onClick }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground"
                  onClick={onClick}
                >
                  <Link href={href}>
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
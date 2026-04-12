// src/app/(dashboardRoute)/user/booking/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarCheck, MapPin, Building2, ChevronRight, CreditCard,
  Search, SlidersHorizontal, CheckCircle2, AlertCircle, XCircle,
  Clock, Banknote, Users, Calendar, ArrowRight, Sparkles,
  LayoutGrid, List, RefreshCw, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// ── Framer Motion ─────────────────────────────────────────────────────────────
import {
  motion, AnimatePresence,
  useMotionValue, useSpring as useFramerSpring, useTransform,
  LayoutGroup,
} from "framer-motion";

// ── React Spring ──────────────────────────────────────────────────────────────
import { useSpring as useReactSpring, animated, useTrail } from "@react-spring/web";

// ── GSAP ──────────────────────────────────────────────────────────────────────
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

// ── AOS ───────────────────────────────────────────────────────────────────────
import AOS from "aos";
import "aos/dist/aos.css";

// ── Lottie ────────────────────────────────────────────────────────────────────
import Lottie from "lottie-react";

// ── shadcn ────────────────────────────────────────────────────────────────────
import { Button }   from "@/components/ui/button";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input }    from "@/components/ui/input";

// ── App ───────────────────────────────────────────────────────────────────────
import { useMyBookings, type BookingStatus } from "@/hooks/user/useUserApi";
import StatusBadge from "@/components/user/StatusBadge";

// ─── GSAP plugins ─────────────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// ─── Inline Lottie data ───────────────────────────────────────────────────────
const emptyLottie = {
  v:"5.7.4",fr:30,ip:0,op:90,w:180,h:180,nm:"Empty",
  layers:[
    {ind:1,ty:4,nm:"outer",sr:1,ks:{o:{a:1,k:[{t:0,s:[0]},{t:20,s:[40]},{t:70,s:[40]},{t:90,s:[0]}]},r:{a:1,k:[{t:0,s:[0],e:[360]}]},p:{a:0,k:[90,90,0]},s:{a:0,k:[100,100,100]}},
    shapes:[{ty:"el",s:{a:0,k:[80,80]},p:{a:0,k:[0,0]},it:[{ty:"st",c:{a:0,k:[0.35,0.45,0.65,1]},w:{a:0,k:4}},{ty:"tr",p:{a:0,k:[0,0]},s:{a:0,k:[100,100]}}]}],ip:0,op:90,st:0},
    {ind:2,ty:4,nm:"inner",sr:1,ks:{o:{a:1,k:[{t:0,s:[0]},{t:25,s:[70]},{t:65,s:[70]},{t:90,s:[0]}]},r:{a:1,k:[{t:0,s:[360],e:[0]}]},p:{a:0,k:[90,90,0]},s:{a:0,k:[100,100,100]}},
    shapes:[{ty:"el",s:{a:0,k:[50,50]},p:{a:0,k:[0,0]},it:[{ty:"st",c:{a:0,k:[0.24,0.52,0.98,1]},w:{a:0,k:3},d:[{n:"d",nm:"dash",v:{a:0,k:8}},{n:"o",nm:"offset",v:{a:0,k:0}}]},{ty:"tr",p:{a:0,k:[0,0]},s:{a:0,k:[100,100]}}]}],ip:0,op:90,st:0},
  ]
};

const errorLottie = {
  v:"5.7.4",fr:30,ip:0,op:60,w:120,h:120,nm:"Error",
  layers:[{ind:1,ty:4,nm:"x",sr:1,ks:{o:{a:0,k:100},r:{a:1,k:[{t:0,s:[-5],e:[5]},{t:15,s:[5],e:[-5]},{t:30,s:[-3],e:[3]},{t:45,s:[0]}]},p:{a:0,k:[60,60,0]},s:{a:0,k:[100,100,100]}},
  shapes:[{ty:"el",s:{a:0,k:[70,70]},p:{a:0,k:[0,0]},it:[{ty:"fl",c:{a:0,k:[0.9,0.2,0.2,0.12]},o:{a:0,k:100}},{ty:"st",c:{a:0,k:[0.9,0.3,0.3,1]},w:{a:0,k:4}},{ty:"tr",p:{a:0,k:[0,0]},s:{a:0,k:[100,100]}}]}],ip:0,op:60,st:0}]
};

// ─── Status metadata ──────────────────────────────────────────────────────────
const STATUS_META: Record<string, {
  icon: React.ReactNode; pill: string; dot: string; glow: string;
}> = {
  CONFIRMED:       { icon: <CheckCircle2 size={12}/>, pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400", glow: "shadow-emerald-500/20" },
  PENDING:         { icon: <AlertCircle  size={12}/>, pill: "bg-amber-500/15 text-amber-400 border-amber-500/30",       dot: "bg-amber-400",   glow: "shadow-amber-500/20"   },
  PAYMENT_PENDING: { icon: <Clock        size={12}/>, pill: "bg-blue-500/15 text-blue-400 border-blue-500/30",          dot: "bg-blue-400",    glow: "shadow-blue-500/20"    },
  ACCEPTED:        { icon: <CheckCircle2 size={12}/>, pill: "bg-violet-500/15 text-violet-400 border-violet-500/30",    dot: "bg-violet-400",  glow: "shadow-violet-500/20"  },
  DECLINED:        { icon: <XCircle      size={12}/>, pill: "bg-red-500/15 text-red-400 border-red-500/30",             dot: "bg-red-400",     glow: "shadow-red-500/20"     },
  CANCELLED:       { icon: <XCircle      size={12}/>, pill: "bg-slate-500/15 text-slate-400 border-slate-500/30",       dot: "bg-slate-500",   glow: ""                      },
};
const getMeta = (s: string) => STATUS_META[s] ?? STATUS_META["PENDING"];

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS: { label: string; value: BookingStatus | "ALL"; color: string }[] = [
  { label: "All",             value: "ALL",             color: "from-blue-500 to-violet-500"   },
  { label: "Pending",         value: "PENDING",         color: "from-amber-500 to-orange-500"  },
  { label: "Accepted",        value: "ACCEPTED",        color: "from-violet-500 to-purple-500" },
  { label: "Pay Pending",     value: "PAYMENT_PENDING", color: "from-blue-500 to-cyan-500"     },
  { label: "Confirmed",       value: "CONFIRMED",       color: "from-emerald-500 to-teal-500"  },
  { label: "Declined",        value: "DECLINED",        color: "from-red-500 to-rose-500"      },
  { label: "Cancelled",       value: "CANCELLED",       color: "from-slate-500 to-slate-600"   },
];

// ─── Reusable: GSAP heading typewriter ───────────────────────────────────────
function TypewriterHeading({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { text: "" },
      { text, duration: 0.8, ease: "none", delay: 0.1 }
    );
  }, [text]);
  return <span ref={ref} />;
}

// ─── React Spring stat pill ───────────────────────────────────────────────────
function StatPill({ count, label, color }: { count: number; label: string; color: string }) {
  const spring = useReactSpring({ number: count, from: { number: 0 }, config: { tension: 80, friction: 18 } });
  return (
    <animated.div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border ${color}`}>
      <animated.span>{spring.number.to(n => Math.round(n))}</animated.span>
      <span className="opacity-70">{label}</span>
    </animated.div>
  );
}

// ─── Animated Tab Button (Framer) ─────────────────────────────────────────────
function TabButton({
  tab, active, onClick,
}: {
  tab: typeof TABS[0]; active: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      className={`relative rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
        active ? "text-white" : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {active && (
        <motion.div
          layoutId="active-tab"
          className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.color} opacity-90`}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10">{tab.label}</span>
    </motion.button>
  );
}

// ─── Booking Card (all libraries) ────────────────────────────────────────────
function BookingCard({ booking, index, view }: { booking: any; index: number; view: "grid" | "list" }) {
  const [hovered, setHovered] = useState(false);
  const meta = getMeta(booking.status);
  const canPay = booking.status === "ACCEPTED" && !booking.payment;

  // React Spring lift
  const spring = useReactSpring({
    scale:     hovered ? 1.015 : 1,
    y:         hovered ? -4 : 0,
    boxShadow: hovered
      ? "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.12)"
      : "0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)",
    config: { tension: 260, friction: 22 },
  });

  if (view === "grid") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.96 }}
        transition={{ delay: index * 0.06, duration: 0.45, ease: [0.23,1,0.32,1] }}
        layout
      >
        <animated.div
          style={spring}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden"
        >
          {/* Image */}
          <div className="relative h-40 overflow-hidden bg-white/5">
            {booking.property?.images?.[0] ? (
              <Image
                src={booking.property.images[0]}
                alt={booking.property.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Building2 size={32} className="text-slate-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent" />

            {/* Status */}
            <div className="absolute top-3 right-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.06 + 0.2, type: "spring", stiffness: 300 }}
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold backdrop-blur-md ${meta.pill}`}
              >
                {meta.icon} {booking.status.replace("_"," ")}
              </motion.div>
            </div>

            {/* Pay badge */}
            {canPay && (
              <motion.div
                animate={{ scale: [1,1.05,1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="absolute top-3 left-3"
              >
                <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-black text-white shadow-lg shadow-blue-500/40">
                  💳 Pay Now
                </span>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="font-bold text-sm text-white line-clamp-1 mb-1">
              {booking.property?.title || "Untitled Property"}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
              <MapPin size={11}/> {booking.property?.area}, {booking.property?.city}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-lg bg-white/5 px-2.5 py-2">
                <p className="text-[10px] text-slate-500 mb-0.5">Move-in</p>
                <p className="text-xs font-semibold text-white">
                  {booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"}) : "TBD"}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 px-2.5 py-2">
                <p className="text-[10px] text-slate-500 mb-0.5">Total</p>
                <p className="text-xs font-black text-emerald-400">৳{booking.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/user/booking/${booking.id}`} className="flex-1">
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="ghost" size="sm" className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs gap-1 h-8">
                    Details <ChevronRight size={12}/>
                  </Button>
                </motion.div>
              </Link>
              {canPay && (
                <Link href={`/user/payments/${booking.id}`}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="sm" className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 border-0 text-xs font-bold h-8 px-3">
                      <CreditCard size={12}/>
                    </Button>
                  </motion.div>
                </Link>
              )}
            </div>
          </div>
        </animated.div>
      </motion.div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      layout
    >
      <animated.div
        style={spring}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden"
      >
        <div className="flex gap-0">
          {/* Left accent bar */}
          <div className={`w-1 shrink-0 bg-gradient-to-b ${
            booking.status === "CONFIRMED"       ? "from-emerald-500 to-emerald-700" :
            booking.status === "PENDING"         ? "from-amber-500 to-amber-700"     :
            booking.status === "PAYMENT_PENDING" ? "from-blue-500 to-blue-700"       :
            booking.status === "ACCEPTED"        ? "from-violet-500 to-violet-700"   :
            "from-slate-600 to-slate-800"
          }`} />

          <div className="flex flex-1 gap-4 p-4">
            {/* Thumbnail */}
            <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-white/5">
              {booking.property?.images?.[0] ? (
                <Image
                  src={booking.property.images[0]}
                  alt={booking.property.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Building2 size={20} className="text-slate-700"/>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-1 min-w-0 flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white line-clamp-1">
                    {booking.property?.title || "Untitled Property"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin size={10}/> {booking.property?.area}, {booking.property?.city}
                  </div>
                </div>

                {/* Status pill */}
                <div className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold shrink-0 ${meta.pill}`}>
                  {meta.icon} {booking.status.replace("_"," ")}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={10}/> {booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "TBD"}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Users size={10}/> {booking.numberOfTenants} tenant{booking.numberOfTenants > 1 ? "s" : ""}
                </span>
                <span className="text-xs font-black text-emerald-400">
                  ৳{booking.totalAmount.toLocaleString()}
                </span>
                {booking.payment && (
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">
                    Paid
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 justify-center shrink-0">
              <Link href={`/user/booking/${booking.id}`}>
                <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs gap-1 h-8 px-3">
                    View <ChevronRight size={12}/>
                  </Button>
                </motion.div>
              </Link>
              {canPay && (
                <Link href={`/user/payments/${booking.id}`}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button size="sm" className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 border-0 text-[11px] font-bold h-8 px-3 gap-1">
                      <CreditCard size={11}/> Pay
                    </Button>
                  </motion.div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </animated.div>
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeletons({ view }: { view: "grid" | "list" }) {
  const items = useTrail(4, {
    from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 },
    config: { tension: 200, friction: 22 },
  });
  return (
    <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3"}>
      {items.map((style, i) => (
        <animated.div key={i} style={style}>
          <div className={`rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden ${view === "grid" ? "h-64" : "h-24"}`}>
            <div className="animate-pulse h-full bg-gradient-to-r from-white/0 via-white/5 to-white/0 bg-[length:400%_100%]"
              style={{ animation: "shimmer 1.8s ease-in-out infinite", backgroundSize: "400% 100%" }}
            />
          </div>
        </animated.div>
      ))}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-2 pt-4"
    >
      <motion.button
        whileHover={{ x: -2 }} whileTap={{ scale: 0.93 }}
        disabled={page === 1}
        onClick={() => onPage(Math.max(1, page - 1))}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </motion.button>

      <div className="flex gap-1.5">
        {visible.map((p, i) => {
          const prev = visible[i - 1];
          return (
            <div key={p} className="flex items-center gap-1.5">
              {prev && p - prev > 1 && <span className="text-slate-600 text-xs">…</span>}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                onClick={() => onPage(p)}
                className={`relative h-8 w-8 rounded-xl text-xs font-bold transition-colors ${
                  p === page
                    ? "text-white"
                    : "text-slate-500 hover:text-white hover:bg-white/8"
                }`}
              >
                {p === page && (
                  <motion.div
                    layoutId="page-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{p}</span>
              </motion.button>
            </div>
          );
        })}
      </div>

      <motion.button
        whileHover={{ x: 2 }} whileTap={{ scale: 0.93 }}
        disabled={page === totalPages}
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </motion.button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const [activeTab,  setActiveTab ] = useState<BookingStatus | "ALL">("ALL");
  const [page,       setPage      ] = useState(1);
  const [view,       setView      ] = useState<"grid" | "list">("list");
  const [search,     setSearch    ] = useState("");
  const [prevTab,    setPrevTab   ] = useState<BookingStatus | "ALL">("ALL");

  const headerRef  = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const { data, isLoading, error } = useMyBookings({
    page,
    status: activeTab === "ALL" ? undefined : activeTab,
  });

  const bookings   = data?.data ?? [];
  const pagination = data?.pagination;
  const total      = pagination?.total ?? 0;

  // Filter by search locally
  const filtered = search.trim()
    ? bookings.filter((b: any) =>
        b.property?.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.property?.area?.toLowerCase().includes(search.toLowerCase())
      )
    : bookings;

  // AOS init
  useEffect(() => {
    AOS.init({ duration: 600, once: true, easing: "ease-out-cubic", offset: 40 });
  }, []);

  // GSAP: header entrance + scroll parallax blob
  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".gsap-header-word", {
        y: 40, opacity: 0, stagger: 0.08, duration: 0.7,
        ease: "power3.out", delay: 0.1,
      });
      gsap.to(".gsap-blob", {
        y: 50, ease: "none",
        scrollTrigger: { trigger: headerRef.current!, start:"top top", end:"+=400", scrub: true },
      });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // GSAP: animate total counter on data change
  useEffect(() => {
    if (!counterRef.current || isLoading) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: total, duration: 1.2, ease: "power2.out",
      onUpdate() { if (counterRef.current) counterRef.current.textContent = Math.round(obj.val).toString(); },
    });
  }, [total, isLoading]);

  // Reset page when tab/search changes
  useEffect(() => { setPage(1); }, [activeTab, search]);

  const handleTabChange = (val: BookingStatus | "ALL") => {
    setPrevTab(activeTab);
    setActiveTab(val);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#080c14] text-white">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="gsap-blob absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-600/8 blur-[130px]" />
        <div className="gsap-blob absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-600/5 blur-[90px]" />
      </div>

      {/* Framer scroll-progress bar */}
      {(() => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const sv = useMotionValue(0);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const prog = useTransform(sv, [0, 2000], [0, 1]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const sx = useFramerSpring(prog, { stiffness: 100, damping: 30 });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          const fn = () => sv.set(window.scrollY);
          window.addEventListener("scroll", fn, { passive: true });
          return () => window.removeEventListener("scroll", fn);
        }, [sv]);
        return (
          <motion.div
            style={{ scaleX: sx, transformOrigin: "0%" }}
            className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
          />
        );
      })()}

      <div className="mx-auto max-w-5xl px-4 py-8 pb-24 space-y-7">

        {/* ── Header ── */}
        <div ref={headerRef} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="overflow-hidden mb-1">
              <h1 className="text-3xl font-black tracking-tight flex gap-2 flex-wrap">
                {"My Bookings".split(" ").map((w, i) => (
                  <span key={i} className="gsap-header-word inline-block"
                    style={{ background: i === 1 ? "linear-gradient(135deg,#60a5fa,#a78bfa)" : undefined,
                             WebkitBackgroundClip: i === 1 ? "text" : undefined,
                             WebkitTextFillColor: i === 1 ? "transparent" : undefined }}>
                    {w}
                  </span>
                ))}
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              <span ref={counterRef}>0</span> total bookings
            </p>
          </div>

          {/* Stats row (React Spring) */}
          <div className="flex flex-wrap gap-2" data-aos="fade-left">
            <StatPill count={bookings.filter((b:any)=>b.status==="CONFIRMED").length}       label="Confirmed" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/25"/>
            <StatPill count={bookings.filter((b:any)=>b.status==="PENDING").length}          label="Pending"   color="bg-amber-500/10 text-amber-400 border-amber-500/25"    />
            <StatPill count={bookings.filter((b:any)=>b.status==="PAYMENT_PENDING").length}  label="Pay Due"   color="bg-blue-500/10 text-blue-400 border-blue-500/25"        />
          </div>
        </div>

        {/* ── Search + View toggle ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="flex gap-3 flex-col sm:flex-row"
        >
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by property or area…"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all backdrop-blur-md"
            />
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 gap-1 self-start sm:self-auto">
            {(["list","grid"] as const).map(v => (
              <motion.button
                key={v}
                onClick={() => setView(v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                className={`relative rounded-lg p-2 transition-colors ${view === v ? "text-white" : "text-slate-600 hover:text-slate-400"}`}
              >
                {view === v && (
                  <motion.div
                    layoutId="view-toggle"
                    className="absolute inset-0 rounded-lg bg-white/10"
                    transition={{ type:"spring", stiffness:380, damping:30 }}
                  />
                )}
                <span className="relative z-10">
                  {v === "list" ? <List size={16}/> : <LayoutGrid size={16}/>}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="flex gap-1 overflow-x-auto pb-1 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          <LayoutGroup>
            {TABS.map(tab => (
              <TabButton
                key={tab.value}
                tab={tab}
                active={activeTab === tab.value}
                onClick={() => handleTabChange(tab.value)}
              />
            ))}
          </LayoutGroup>
        </motion.div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">

          {/* Loading */}
          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingSkeletons view={view}/>
            </motion.div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 py-20 text-center"
              data-aos="zoom-in"
            >
              <div className="h-28 w-28 opacity-80">
                <Lottie animationData={errorLottie} loop/>
              </div>
              <div>
                <p className="text-lg font-bold text-white">Failed to load bookings</p>
                <p className="text-sm text-slate-500 mt-1">Please check your connection and try again.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10"
              >
                <RefreshCw size={14}/> Retry
              </motion.button>
            </motion.div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filtered.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col items-center gap-5 py-20 text-center"
              data-aos="fade-up"
            >
              <div className="h-36 w-36 opacity-80">
                <Lottie animationData={emptyLottie} loop/>
              </div>
              <div>
                <p className="text-xl font-black text-white">
                  {search ? "No results found" : "No bookings yet"}
                </p>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                  {search
                    ? `Nothing matches "${search}". Try a different search.`
                    : "You haven't made any bookings in this category."}
                </p>
              </div>
              <Link href="/properties">
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 border-0 font-bold gap-2">
                    <Sparkles size={15}/> Browse Properties <ArrowRight size={14}/>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          )}

          {/* Booking list / grid */}
          {!isLoading && !error && filtered.length > 0 && (
            <motion.div
              key={`${activeTab}-${view}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <LayoutGroup>
                <div className={
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "flex flex-col gap-3"
                }>
                  {filtered.map((booking: any, i: number) => (
                    <BookingCard key={booking.id} booking={booking} index={i} view={view}/>
                  ))}
                </div>
              </LayoutGroup>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Pagination ── */}
        {!isLoading && !error && pagination && pagination.totalPages > 1 && (
          <Pagination page={page} totalPages={pagination.totalPages} onPage={setPage}/>
        )}
      </div>

      {/* Shimmer keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          0%   { background-position: -400% 0; }
          100% { background-position:  400% 0; }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}


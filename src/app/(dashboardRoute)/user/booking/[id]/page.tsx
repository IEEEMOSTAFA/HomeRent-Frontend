// src/app/(dashboardRoute)/user/booking/[id]/page.tsx
"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, MapPin, BedDouble, Bath, CreditCard, Star,
  Building2, Ban, CheckCircle2, AlertCircle, XCircle, Clock,
  Receipt, MessageSquare, ChevronRight, Shield,
  Calendar, Users, Banknote, FileText, Download, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// ── Framer Motion ─────────────────────────────────────────────────────────────
import {
  motion, AnimatePresence,
  useMotionValue, useSpring as useFramerSpring, useTransform,
} from "framer-motion";

// ── React Spring ──────────────────────────────────────────────────────────────
import { useSpring as useReactSpring, animated, useTrail } from "@react-spring/web";

// ── GSAP ──────────────────────────────────────────────────────────────────────
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── AOS ───────────────────────────────────────────────────────────────────────
import AOS from "aos";
import "aos/dist/aos.css";

// ── Lottie ────────────────────────────────────────────────────────────────────
import Lottie from "lottie-react";

// ── shadcn ────────────────────────────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

// ── App imports ───────────────────────────────────────────────────────────────
import { useBookingById, useCancelBooking, useCreateReview } from "@/hooks/user/useUserApi";
import StatusBadge from "@/components/user/StatusBadge";

// ─── GSAP plugin registration ─────────────────────────────────────────────────
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// ─── Inline Lottie data (replace paths with real .json imports in production) ──
const notFoundLottie = {
  v:"5.7.4",fr:30,ip:0,op:90,w:160,h:160,nm:"Empty",
  layers:[{ind:1,ty:4,nm:"ring",sr:1,ks:{o:{a:1,k:[{t:0,s:[0]},{t:15,s:[60]},{t:75,s:[60]},{t:90,s:[0]}]},r:{a:1,k:[{t:0,s:[0],e:[360]}]},p:{a:0,k:[80,80,0]},s:{a:0,k:[100,100,100]}},
  shapes:[{ty:"el",s:{a:0,k:[60,60]},p:{a:0,k:[0,0]},it:[{ty:"st",c:{a:0,k:[0.4,0.5,0.7,1]},w:{a:0,k:5}},{ty:"tr",p:{a:0,k:[0,0]},s:{a:0,k:[100,100]}}]}],ip:0,op:90,st:0}]
};

const successLottie = {
  v:"5.7.4",fr:30,ip:0,op:60,w:80,h:80,nm:"Check",
  layers:[{ind:1,ty:4,nm:"check",sr:1,ks:{o:{a:0,k:100},r:{a:0,k:0},p:{a:0,k:[40,40,0]},s:{a:0,k:[100,100,100]}},
  shapes:[{ty:"el",s:{a:0,k:[50,50]},p:{a:0,k:[0,0]},it:[{ty:"fl",c:{a:0,k:[0.18,0.8,0.44,0.15]},o:{a:0,k:100}},{ty:"st",c:{a:0,k:[0.18,0.8,0.44,1]},w:{a:0,k:3}},{ty:"tr",p:{a:0,k:[0,0]},s:{a:0,k:[100,100]}}]}],ip:0,op:60,st:0}]
};

const payLottie = {
  v:"5.7.4",fr:30,ip:0,op:60,w:64,h:64,nm:"Pay",
  layers:[{ind:1,ty:4,nm:"card",sr:1,ks:{o:{a:0,k:100},r:{a:1,k:[{t:0,s:[-4],e:[4]},{t:30,s:[4],e:[-4]},{t:60,s:[-4]}]},p:{a:0,k:[32,32,0]},s:{a:0,k:[100,100,100]}},
  shapes:[{ty:"rc",s:{a:0,k:[48,32]},p:{a:0,k:[0,0]},r:{a:0,k:5},it:[{ty:"fl",c:{a:0,k:[0.24,0.52,0.98,1]},o:{a:0,k:100}},{ty:"tr",p:{a:0,k:[0,0]},s:{a:0,k:[100,100]}}]}],ip:0,op:60,st:0}]
};

// ─── Status config map ────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  blobGradient: string; border: string; icon: React.ReactNode;
  pill: string; label: string;
}> = {
  CONFIRMED:       { blobGradient:"from-emerald-600/25 to-emerald-900/5", border:"border-emerald-500/25", icon:<CheckCircle2 className="h-4 w-4 text-emerald-400"/>, pill:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30", label:"Confirmed" },
  PENDING:         { blobGradient:"from-amber-600/25 to-amber-900/5",     border:"border-amber-500/25",   icon:<AlertCircle  className="h-4 w-4 text-amber-400"/>,   pill:"bg-amber-500/15 text-amber-400 border-amber-500/30",   label:"Pending"   },
  PAYMENT_PENDING: { blobGradient:"from-blue-600/25 to-blue-900/5",       border:"border-blue-500/25",    icon:<Clock        className="h-4 w-4 text-blue-400"/>,     pill:"bg-blue-500/15 text-blue-400 border-blue-500/30",      label:"Awaiting Payment" },
  CANCELLED:       { blobGradient:"from-red-600/25 to-red-900/5",         border:"border-red-500/25",     icon:<XCircle      className="h-4 w-4 text-red-400"/>,      pill:"bg-red-500/15 text-red-400 border-red-500/30",         label:"Cancelled" },
  ACCEPTED:        { blobGradient:"from-violet-600/25 to-violet-900/5",   border:"border-violet-500/25",  icon:<CheckCircle2 className="h-4 w-4 text-violet-400"/>,   pill:"bg-violet-500/15 text-violet-400 border-violet-500/30", label:"Accepted"  },
};
const getStatus = (s: string) => STATUS_CONFIG[s] ?? STATUS_CONFIG["PENDING"];

// ─── GSAP animated number counter ────────────────────────────────────────────
function GSAPCounter({ value, prefix = "" }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value, duration: 1.5, ease: "power3.out",
      onUpdate() { if (ref.current) ref.current.textContent = prefix + Math.round(obj.val).toLocaleString(); },
    });
  }, [value, prefix]);
  return <span ref={ref}>{prefix}0</span>;
}

// ─── Info row with hover (Framer Motion) ─────────────────────────────────────
function InfoRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.03)" }}
      className="flex items-center justify-between rounded-xl px-3 py-2.5 -mx-3 transition-colors group"
    >
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-slate-600 group-hover:text-slate-400 transition-colors">{icon}</span>}
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <div className="text-sm font-semibold text-white text-right">{value}</div>
    </motion.div>
  );
}

// ─── Star picker (React Spring trail + Framer bounce) ────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const trail = useTrail(5, { opacity: 1, y: 0, from: { opacity: 0, y: 20 }, config: { tension: 280, friction: 18 } });
  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map((n, i) => {
        const active = n <= (hover || value);
        return (
          <animated.div key={n} style={trail[i]}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.25, rotate: [-5,5,-2,0] }}
              whileTap={{ scale: 0.85 }}
              transition={{ duration: 0.25 }}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(n)}
            >
              <Star
                size={34}
                className={active
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]"
                  : "text-slate-700 hover:text-slate-500"}
              />
            </motion.button>
          </animated.div>
        );
      })}
    </div>
  );
}

// ─── Glassmorphic card (React Spring lift) ────────────────────────────────────
function GlassCard({ children, className = "", aosDelay = 0 }: {
  children: React.ReactNode; className?: string; aosDelay?: number;
}) {
  const [over, setOver] = useState(false);
  const spring = useReactSpring({
    y:         over ? -3 : 0,
    boxShadow: over ? "0 28px 70px rgba(0,0,0,0.55)" : "0 4px 28px rgba(0,0,0,0.28)",
    config: { tension: 250, friction: 22 },
  });
  return (
    <div data-aos="fade-up" data-aos-delay={aosDelay}>
      <animated.div
        style={spring}
        onMouseEnter={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
        className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden ${className}`}
      >
        {children}
      </animated.div>
    </div>
  );
}

// ─── Section header bar ───────────────────────────────────────────────────────
function SectionHeader({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/8">
      <span className="opacity-70">{icon}</span>
      <span className="text-sm font-bold text-white tracking-tight">{title}</span>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: booking, isLoading } = useBookingById(id);
  const property = booking?.property;

  const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking();
  const { mutate: createReview,  isPending: reviewing  } = useCreateReview();

  const [cancelNote, setCancelNote] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating,     setRating    ] = useState(0);
  const [comment,    setComment   ] = useState("");

  const heroRef = useRef<HTMLDivElement>(null);

  // AOS init
  useEffect(() => {
    AOS.init({ duration: 640, once: true, easing: "ease-out-cubic", offset: 40 });
  }, []);

  // GSAP parallax on hero image + scroll progress
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".booking-hero-img", {
        yPercent: 20, ease: "none",
        scrollTrigger: { trigger: heroRef.current!, start: "top top", end: "+=300", scrub: true },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Framer scroll progress bar
  const scrollY = useMotionValue(0);
  const progress = useTransform(scrollY, [0, 1800], [0, 1]);
  const scaleX   = useFramerSpring(progress, { stiffness: 120, damping: 30 });
  useEffect(() => {
    const fn = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [scrollY]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] p-5 space-y-5">
        <Skeleton className="h-10 w-52 rounded-xl bg-white/5" />
        <Skeleton className="h-64 rounded-2xl bg-white/5" />
        <Skeleton className="h-72 rounded-2xl bg-white/5" />
        <Skeleton className="h-44 rounded-2xl bg-white/5" />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!booking || !property) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#080c14] px-4 text-center"
      >
        <div className="h-40 w-40 opacity-75">
          <Lottie animationData={notFoundLottie} loop />
        </div>
        <h2 className="text-2xl font-black text-white">Booking Not Found</h2>
        <p className="text-slate-400 text-sm max-w-xs">
          This booking may have been removed or the link is incorrect.
        </p>
        <Link href="/user/booking">
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-500 gap-2 font-bold">
            <ArrowLeft className="h-4 w-4" /> Back to Bookings
          </Button>
        </Link>
      </motion.div>
    );
  }

  const canCancel = ["PENDING", "ACCEPTED", "PAYMENT_PENDING"].includes(booking.status);
  const canPay    = (booking.status === "ACCEPTED" || booking.status === "PAYMENT_PENDING")
                  && (!booking.payment || booking.payment.status !== "SUCCESS");
  const canReview = booking.status === "CONFIRMED" && !booking.review;
  const cfg       = getStatus(booking.status);

  const handleCancel = () =>
    cancelBooking(
      { id: booking.id, cancellationNote: cancelNote.trim() || undefined },
      {
        onSuccess: () => { toast.success("Booking cancelled"); setCancelOpen(false); setCancelNote(""); },
        onError:   () => toast.error("Failed to cancel booking"),
      }
    );

  const handleReview = () => {
    if (!rating) return toast.error("Please give a rating");
    createReview(
      { bookingId: booking.id, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => { toast.success("Review submitted!"); setReviewOpen(false); setRating(0); setComment(""); },
        onError:   () => toast.error("Failed to submit review"),
      }
    );
  };

  return (
    <div className="relative min-h-screen bg-[#080c14] text-white">

      {/* ── Framer scroll progress bar ── */}
      <motion.div
        style={{ scaleX, transformOrigin: "0%" }}
        className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
      />

      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className={`absolute -top-40 -right-40 h-[550px] w-[550px] rounded-full bg-gradient-to-br ${cfg.blobGradient} blur-[130px]`} />
        <div className="absolute bottom-10 -left-20 h-[350px] w-[350px] rounded-full bg-blue-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-6 pb-24 space-y-5">

        {/* ── Back + ID + Status pill ── */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23,1,0.32,1] }}
          className="flex items-center gap-3"
        >
          <Link href="/user/booking">
            <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost" size="icon"
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 h-10 w-10"
              >
                <ArrowLeft size={17} />
              </Button>
            </motion.div>
          </Link>

          <div className="flex-1">
            <h1 className="text-2xl font-black tracking-tight leading-none">Booking Details</h1>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500">#{booking.id.slice(0,8).toUpperCase()}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${cfg.pill}`}
          >
            {cfg.icon} {cfg.label}
          </motion.div>
        </motion.div>

        {/* ── Hero image with GSAP parallax ── */}
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease: [0.23,1,0.32,1] }}
          className="relative h-64 rounded-2xl overflow-hidden border border-white/10"
        >
          {property.images?.[0] ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="booking-hero-img object-cover scale-110 origin-top"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-white/5">
              <Building2 size={52} className="text-slate-700" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/30 to-transparent" />

          {/* Property info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-0 left-0 right-0 p-5"
          >
            <h2 className="text-lg font-black leading-snug text-white drop-shadow-lg">{property.title}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={12} className="text-slate-400" />
              <span className="text-xs text-slate-300">{property.area}, {property.city}</span>
            </div>
            <div className="flex gap-4 mt-2">
              {property.bedrooms  && <span className="flex items-center gap-1 text-xs text-slate-400"><BedDouble size={12}/> {property.bedrooms} Beds</span>}
              {property.bathrooms && <span className="flex items-center gap-1 text-xs text-slate-400"><Bath      size={12}/> {property.bathrooms} Baths</span>}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Booking Information ── */}
        <GlassCard aosDelay={80}>
          <SectionHeader icon={<FileText className="h-4 w-4 text-blue-400"/>} title="Booking Information" />
          <div className="px-5 py-3 space-y-0.5">
            <InfoRow label="Move-in Date"      value={new Date(booking.moveInDate).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})} icon={<Calendar size={13}/>} />
            <InfoRow label="Number of Tenants" value={`${booking.numberOfTenants} person${booking.numberOfTenants > 1 ? "s" : ""}`} icon={<Users size={13}/>}   />
            <InfoRow label="Monthly Rent"      value={<span className="text-blue-400 font-black">৳<GSAPCounter value={booking.rentAmount}/></span>}        icon={<Banknote size={13}/>} />
            <InfoRow label="Booking Fee"       value={`৳${booking.bookingFee.toLocaleString()}`}                                                           icon={<Receipt  size={13}/>} />
          </div>

          {/* Total */}
          <div className="mx-5 mb-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <Banknote size={14} className="text-emerald-400"/> Total Amount
            </span>
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              ৳<GSAPCounter value={booking.totalAmount}/>
            </span>
          </div>

          {/* Message */}
          <AnimatePresence>
            {booking.message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/8 px-5 py-4"
              >
                <p className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-wide mb-2">
                  <MessageSquare size={11}/> Your Message
                </p>
                <p className="text-sm text-slate-300 bg-white/5 rounded-xl px-4 py-3 leading-relaxed">{booking.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cancellation note */}
          <AnimatePresence>
            {booking.cancellationNote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border-t border-red-500/20 bg-red-500/5 px-5 py-4"
              >
                <p className="flex items-center gap-1.5 text-[11px] text-red-400 uppercase tracking-wide mb-2">
                  <Ban size={11}/> Cancellation Note
                </p>
                <p className="text-sm text-red-300">{booking.cancellationNote}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* ── Payment Details ── */}
        <AnimatePresence>
          {booking.payment && (
            <GlassCard aosDelay={140}>
              <SectionHeader
                icon={<CreditCard className="h-4 w-4 text-violet-400"/>}
                title="Payment Details"
                right={<div className="h-7 w-7 opacity-80"><Lottie animationData={payLottie} loop/></div>}
              />
              <div className="px-5 py-3 space-y-0.5">
                <InfoRow label="Status"       value={<StatusBadge status={booking.payment.status}/>}/>
                <InfoRow label="Amount Paid"  value={<span className="text-emerald-400 font-black">৳{booking.payment.amount.toLocaleString()}</span>}/>
                <InfoRow label="Payment Date" value={new Date(booking.payment.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}/>
              </div>
              {booking.payment.receiptUrl && (
                <div className="border-t border-white/8 px-5 py-4">
                  <a href={booking.payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Download size={14}/> Download Receipt
                      <ExternalLink size={12} className="ml-auto opacity-60"/>
                    </motion.div>
                  </a>
                </div>
              )}
            </GlassCard>
          )}
        </AnimatePresence>

        {/* ── Existing Review ── */}
        <AnimatePresence>
          {booking.review && (
            <GlassCard aosDelay={180}>
              <SectionHeader
                icon={<Star className="h-4 w-4 text-amber-400 fill-amber-400"/>}
                title="Your Review"
                right={<div className="h-7 w-7"><Lottie animationData={successLottie} loop={false}/></div>}
              />
              <div className="px-5 py-4">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={20}
                      className={n <= booking.review!.rating
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : "text-slate-700"}
                    />
                  ))}
                </div>
                {booking.review.comment && (
                  <p className="text-sm text-slate-300 leading-relaxed bg-white/5 rounded-xl px-4 py-3">
                    {booking.review.comment}
                  </p>
                )}
              </div>
            </GlassCard>
          )}
        </AnimatePresence>

        {/* ── Action buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: [0.23,1,0.32,1] }}
          data-aos="fade-up"
          data-aos-delay="240"
          className="flex flex-wrap gap-3 pt-2"
        >
          {/* Pay Now */}
          {canPay && (
            <Link href={`/user/payments/${booking.id}`} className="flex-1 min-w-[200px]">
              <motion.div
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden rounded-2xl"
              >
                <div className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white">
                  <CreditCard size={16}/> Pay ৳{booking.totalAmount.toLocaleString()}
                  <ChevronRight size={14} className="opacity-70"/>
                </div>
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full pointer-events-none"
                  animate={{ translateX:["-100%","200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5, ease:"easeInOut" }}
                />
              </motion.div>
            </Link>
          )}

          {/* Leave Review */}
          {canReview && (
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.025, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-3.5 text-sm font-bold text-amber-400 hover:bg-amber-500/15 transition-colors"
                >
                  <Star size={15} className="fill-amber-400"/> Leave Review
                </motion.button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border border-white/10 bg-[#0e1420] text-white shadow-2xl max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black">Rate Your Stay</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-2">
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-3">Your Rating</p>
                    <StarRating value={rating} onChange={setRating}/>
                  </div>
                  <Textarea
                    placeholder="Share your experience (optional)…"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={4}
                    className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-600 resize-none focus:border-amber-500/50"
                  />
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleReview}
                      disabled={reviewing || !rating}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 border-0 font-bold text-white h-11"
                    >
                      {reviewing ? "Submitting…" : "Submit Review"}
                    </Button>
                  </motion.div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Cancel Booking */}
          {canCancel && (
            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <DialogTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.025, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/8 px-5 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/15 transition-colors"
                >
                  <Ban size={15}/> Cancel Booking
                </motion.button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border border-white/10 bg-[#0e1420] text-white shadow-2xl max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-black">
                    <XCircle className="h-5 w-5 text-red-400"/> Cancel Booking?
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    This action cannot be undone. You can leave a reason below.
                  </p>
                  <Textarea
                    placeholder="Reason for cancellation (optional)…"
                    value={cancelNote}
                    onChange={e => setCancelNote(e.target.value)}
                    rows={3}
                    className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-600 resize-none"
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 font-semibold"
                      onClick={() => setCancelOpen(false)}
                    >
                      Keep Booking
                    </Button>
                    <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="w-full rounded-xl bg-red-600 hover:bg-red-500 border-0 font-bold text-white h-10"
                      >
                        {cancelling ? "Cancelling…" : "Yes, Cancel"}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* ── Security footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-1.5 text-[11px] text-slate-700 pt-2"
        >
          <Shield size={11}/> All transactions are secured &amp; encrypted
        </motion.div>
      </div>
    </div>
  );
}






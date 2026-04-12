"use client";



import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import dynamic from "next/dynamic";

// ✅ Fix: @lottiefiles/react-lottie-player uses `document` internally.
// Next.js server-side render এ `document` থাকে না, তাই crash করে।
// dynamic() + ssr:false দিলে শুধু browser এ load হবে — crash বন্ধ।
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);
import {
  Plus, Pencil, Eye, Trash2, Loader2,
  MapPin, BedDouble, Bath, Ruler, Home,
  CheckCircle2, Clock, XCircle, ChevronRight,
  Sparkles, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Button }   from "@/components/ui/button";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  useOwnerProperties,
  useDeleteProperty,
  type PropertyStatus,
  type Property,
} from "@/hooks/owner/useOwnerApi";

// ── Types ──────────────────────────────────────────────────────────────────────
type TabValue = PropertyStatus | "ALL";

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS: { label: string; value: TabValue; icon: React.ReactNode; color: string }[] = [
  { label: "All",      value: "ALL",      icon: <Home size={13} />,         color: "emerald" },
  { label: "Approved", value: "APPROVED", icon: <CheckCircle2 size={13} />, color: "emerald" },
  { label: "Pending",  value: "PENDING",  icon: <Clock size={13} />,        color: "amber"   },
  { label: "Rejected", value: "REJECTED", icon: <XCircle size={13} />,      color: "red"     },
];

const STATUS_CONFIG: Record<PropertyStatus, {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}> = {
  APPROVED: {
    label: "Approved",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

// ── Animation Variants ─────────────────────────────────────────────────────────
import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,   transition: { type: "spring", stiffness: 260, damping: 22 } },
  exit:   { opacity: 0, x: -40, scale: 0.95, transition: { duration: 0.2 } },
};

const tabIndicatorVariants: Variants = {
  hidden: { scaleX: 0 },
  show:   { scaleX: 1, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

// ── Animated Counter ───────────────────────────────────────────────────────────
function AnimatedCount({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 200, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return <span>{display}</span>;
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PropertyStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
}

// ── Property Card ──────────────────────────────────────────────────────────────
function PropertyCard({
  property,
  onDelete,
  deleting,
  index,
}: {
  property: Property;
  onDelete: (id: string) => void;
  deleting: boolean;
  index: number;
}) {
  const image = property.images?.[0] ?? "/placeholder.png";
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      className="group relative bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-emerald-100/60 transition-shadow duration-300"
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-l-2xl" />

      <div className="flex flex-col sm:flex-row gap-0 pl-1">
        {/* Image */}
        <div className="relative w-full sm:w-44 h-36 sm:h-auto flex-shrink-0 overflow-hidden bg-emerald-50">
          {!imgError ? (
            <motion.img
              src={image}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home size={32} className="text-emerald-200" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:bg-gradient-to-r" />

          {/* Type badge */}
          <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            {property.type.replace(/_/g, " ")}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            {/* Title + Status */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
                {property.title}
              </h3>
              <StatusBadge status={property.status} />
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} className="text-emerald-400 flex-shrink-0" />
              <span className="truncate">{property.area}, {property.city}</span>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <BedDouble size={11} className="text-emerald-400" />
                {property.bedrooms} bed
              </span>
              <span className="flex items-center gap-1">
                <Bath size={11} className="text-emerald-400" />
                {property.bathrooms} bath
              </span>
              {property.size && (
                <span className="flex items-center gap-1">
                  <Ruler size={11} className="text-emerald-400" />
                  {property.size} sqft
                </span>
              )}
              <span className="text-[10px] text-gray-400 ml-auto">
                For: <span className="font-medium text-gray-600">{property.availableFor}</span>
              </span>
            </div>
          </div>

          {/* Bottom row: Price + Actions */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-50">
            {/* Price */}
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-black text-emerald-600 leading-none">
                ৳{property.rentAmount.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">/mo</span>
            </div>

            {/* Actions */}
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-1.5">
                {/* View */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/owner/properties/${property.id}`}>
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
                      >
                        <Eye size={11} /> View
                      </motion.button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">View details</TooltipContent>
                </Tooltip>

                {/* Edit */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/owner/properties/${property.id}/edit`}>
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                      >
                        <Pencil size={11} /> Edit
                      </motion.button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Edit property</TooltipContent>
                </Tooltip>

                {/* Delete */}
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                        >
                          {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                        </motion.button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900">Delete this property?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-500">
                        <strong className="text-gray-700">{property.title}</strong> permanently delete হয়ে যাবে। এই কাজ undo করা যাবে না।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(property.id)}
                        disabled={deleting}
                        className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
                      >
                        {deleting ? "Deleting…" : "Yes, Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Loading Skeletons ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="flex gap-0 bg-white rounded-2xl border border-emerald-100 overflow-hidden h-36"
        >
          <div className="w-1 bg-emerald-100 flex-shrink-0" />
          <Skeleton className="w-44 h-full rounded-none" />
          <div className="flex-1 p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <Skeleton className="h-5 w-24" />
              <div className="flex gap-1.5">
                <Skeleton className="h-[30px] w-16 rounded-lg" />
                <Skeleton className="h-[30px] w-16 rounded-lg" />
                <Skeleton className="h-[30px] w-[30px] rounded-lg" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: TabValue }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <Player
        autoplay
        loop
        src="https://lottie.host/4db68bbd-246e-4e78-9b82-3f93d4c0e6c3/8HVSanSZMj.json"
        style={{ height: 160, width: 160 }}
      />
      <h3 className="text-base font-bold text-gray-800 mt-2 mb-1">No properties found</h3>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        {tab === "ALL"
          ? "You haven't listed any properties yet. Add your first one to get started."
          : `You have no ${tab.toLowerCase()} properties right now.`}
      </p>
      {tab === "ALL" && (
        <motion.div
          className="mt-6"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link href="/owner/properties/new">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 shadow-md shadow-emerald-200">
              <Plus size={15} /> Add Your First Property
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 bg-white rounded-xl border px-4 py-3 border-${color}-100 shadow-sm`}
    >
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>{icon}</div>
      <div>
        <p className="text-[11px] text-gray-400 font-medium leading-none mb-0.5">{label}</p>
        <p className={`text-lg font-black text-${color}-600 leading-none`}>
          <AnimatedCount value={value} />
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OwnerPropertiesPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useOwnerProperties(
    activeTab === "ALL" ? undefined : { status: activeTab as PropertyStatus }
  );
  const { mutateAsync: deleteProperty } = useDeleteProperty();

  const properties: Property[] = data?.data ?? [];
  const total = data?.meta?.total ?? properties.length;

  // compute counts per status for stat cards
  const { data: allData } = useOwnerProperties(undefined);
  const allProperties: Property[] = allData?.data ?? [];
  const approvedCount = allProperties.filter((p) => p.status === "APPROVED").length;
  const pendingCount  = allProperties.filter((p) => p.status === "PENDING").length;
  const rejectedCount = allProperties.filter((p) => p.status === "REJECTED").length;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProperty(id);
      toast.success("Property deleted successfully");
    } catch {
      toast.error("Failed to delete property");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/40">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Owner Dashboard</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">My Properties</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {isLoading ? "Fetching your listings…" : (
                <><AnimatedCount value={total} /> propert{total === 1 ? "y" : "ies"} found</>
              )}
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/owner/properties/new">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 shadow-md shadow-emerald-200 font-semibold">
                <Plus size={15} /> Add Property
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Stat Cards ──────────────────────────────────────────── */}
        {!isLoading && allProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3"
          >
            <StatCard label="Approved"  value={approvedCount} icon={<CheckCircle2 size={14} />} color="emerald" />
            <StatCard label="Pending"   value={pendingCount}  icon={<Clock size={14} />}         color="amber"   />
            <StatCard label="Rejected"  value={rejectedCount} icon={<XCircle size={14} />}       color="red"     />
          </motion.div>
        )}

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-1"
        >
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors duration-200 ${
                activeTab === tab.value
                  ? "text-white"
                  : "text-gray-500 hover:text-emerald-700 hover:bg-emerald-100/60"
              }`}
            >
              {activeTab === tab.value && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 bg-emerald-600 rounded-xl shadow-sm shadow-emerald-300"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </motion.div>

        {/* ── Loading ──────────────────────────────────────────────── */}
        {isLoading && <LoadingSkeleton />}

        {/* ── Error ────────────────────────────────────────────────── */}
        {isError && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <Player
              autoplay
              loop
              src="https://lottie.host/f0a49635-3f8d-4b2f-8e1e-34c70e09c1cf/IrItCHGOBT.json"
              style={{ height: 120, width: 120 }}
            />
            <p className="text-sm text-red-500 font-medium">Failed to load properties.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              Try Again
            </Button>
          </motion.div>
        )}

        {/* ── Empty ────────────────────────────────────────────────── */}
        {!isLoading && !isError && properties.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {/* ── Property List ─────────────────────────────────────────── */}
        {!isLoading && !isError && properties.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {properties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onDelete={handleDelete}
                  deleting={deletingId === property.id}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </div>
  );
}
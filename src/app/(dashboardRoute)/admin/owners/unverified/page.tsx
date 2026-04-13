"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, RefreshCw,
  Users, BadgeCheck,
} from "lucide-react";
import { FaUserShield } from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";
import { animate, stagger } from "animejs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUnverifiedOwners, useVerifyOwner } from "@/hooks/admin/useAdminApi";

// ── Local component imports ───────────────────────────────────────────────────
import { StatCard }    from "@/components/owner-verification/StatCard";
import { OwnerCard }   from "@/components/owner-verification/OwnerCard";
import { SkeletonGrid } from "@/components/owner-verification/SkeletonGrid";
import { EmptyState }  from "@/components/owner-verification/EmptyState";
import { FilterPill }  from "@/components/owner-verification/FilterPill";
import type { Owner }  from "@/components/owner-verification/types";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OwnerVerificationPage() {
  const { data: owners, isLoading, refetch } = useUnverifiedOwners();
  const { mutate: verifyOwner, isPending } = useVerifyOwner();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const list: Owner[] = Array.isArray(owners) ? owners : (owners as any)?.data ?? [];

  const filtered = list.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = o.user.name.toLowerCase().includes(q) || o.user.email.toLowerCase().includes(q);
    const matchFilter =
      filter === "all" ||
      (filter === "verified" && o.verified) ||
      (filter === "pending" && !o.verified);
    return matchSearch && matchFilter;
  });

  const verifiedCount = list.filter((o) => o.verified).length;
  const pendingCount  = list.filter((o) => !o.verified).length;

  const handleVerify = (id: string, verified: boolean) => {
    verifyOwner(
      { id, verified },
      {
        onSuccess: () => toast.success(verified ? "Owner verified!" : "Verification revoked.", { icon: verified ? "✅" : "🔒" }),
        onError: (err: any) => toast.error(err?.message ?? "Something went wrong."),
      }
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  // anime.js v4 — stagger header children on mount
  useEffect(() => {
    if (!headerRef.current) return;
    const targets = headerRef.current.querySelectorAll<HTMLElement>(".anim-in");
    animate(targets, {
      opacity: [0, 1],
      translateY: [12, 0],
      delay: stagger(80),
      duration: 480,
      ease: "outCubic",
    });
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-7 p-1">

        {/* ── Header ── */}
        <div ref={headerRef} className="flex items-start justify-between gap-4 anim-in opacity-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950">
              <FaUserShield size={20} className="text-violet-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Owner Verification</h1>
              <p className="text-sm text-muted-foreground">Review and verify owner identities</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs h-8 shrink-0">
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        {/* ── Stats ── */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<Users size={16} />}          label="Total owners" value={list.length}    color="bg-violet-500" delay={0}   />
            <StatCard icon={<BadgeCheck size={16} />}     label="Verified"     value={verifiedCount}  color="bg-emerald-500" delay={100} />
            <StatCard icon={<MdPendingActions size={16} />} label="Pending"    value={pendingCount}   color="bg-amber-500"  delay={200} />
          </div>
        )}

        {/* ── Search + Filter ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm bg-muted/30 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} className="text-muted-foreground/60 shrink-0" />
            {(["all", "verified", "pending"] as const).map((f) => (
              <FilterPill key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
            ))}
          </div>
        </motion.div>

        {/* ── Content ── */}
        {isLoading && <SkeletonGrid />}
        {!isLoading && filtered.length === 0 && <EmptyState />}
        {!isLoading && filtered.length > 0 && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((owner, i) => (
                <OwnerCard key={owner.id} owner={owner} onVerify={handleVerify} isPending={isPending} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Footer ── */}
        {!isLoading && list.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-xs text-muted-foreground/60 text-center pb-2">
            Showing {filtered.length} of {list.length} owners
          </motion.p>
        )}

      </div>
    </TooltipProvider>
  );
}





































// "use client";

// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// import {
//   Phone, CreditCard, ShieldCheck, ShieldOff, UserCheck,
//   Search, Filter, RefreshCw, CheckCircle2,
//   Clock, Users, BadgeCheck,
// } from "lucide-react";
// import { FaIdCard, FaUserShield, FaHistory } from "react-icons/fa";
// import { MdVerified, MdPendingActions, MdSecurity } from "react-icons/md";
// import { HiOutlineDotsVertical } from "react-icons/hi";
// import { toast } from "sonner";

// // ── anime.js v4 — named exports, NO default export ──────────────────────────
// import { animate, stagger } from "animejs";

// // ── lottie-react — npm i lottie-react ───────────────────────────────────────
// import Lottie from "lottie-react";

// // Minimal inline Lottie JSON: animated checkmark (no external file needed)
// const checkmarkLottie = {
//   v: "5.7.4", fr: 30, ip: 0, op: 40, w: 64, h: 64, nm: "check", ddd: 0,
//   assets: [],
//   layers: [{
//     ddd: 0, ind: 1, ty: 4, nm: "check", sr: 1,
//     ks: {
//       o: { a: 0, k: 100 }, r: { a: 0, k: 0 },
//       p: { a: 0, k: [32, 32, 0] }, a: { a: 0, k: [0, 0, 0] },
//       s: { a: 1, k: [{ i: { x: [0.5], y: [1.3] }, o: { x: [0.5], y: [0] }, t: 0, s: [0, 0, 100] }, { t: 18, s: [100, 100, 100] }] },
//     },
//     ao: 0, ip: 0, op: 40, st: 0, bm: 0,
//     shapes: [{
//       ty: "gr",
//       it: [
//         { ty: "sh", ks: { a: 0, k: { i: [[0,0],[0,0],[0,0]], o: [[0,0],[0,0],[0,0]], v: [[-12, 0], [-3, 9], [12, -8]], c: false } } },
//         { ty: "st", c: { a: 0, k: [0.18, 0.8, 0.44, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3.5 }, lc: 2, lj: 2 },
//         { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
//       ],
//     }],
//   }],
// };

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu, DropdownMenuContent,
//   DropdownMenuItem, DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   AlertDialog, AlertDialogAction, AlertDialogCancel,
//   AlertDialogContent, AlertDialogDescription,
//   AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import {
//   Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { useUnverifiedOwners, useVerifyOwner } from "@/hooks/admin/useAdminApi";

// // ─── Types ────────────────────────────────────────────────────────────────────
// type Owner = {
//   id: string;
//   userId: string;
//   verified: boolean;
//   phone?: string;
//   nidNumber?: string;
//   user: { name: string; email: string; avatarUrl?: string };
// };

// // ─── Stat Card ────────────────────────────────────────────────────────────────
// // Uses anime.js v4 animate() with a plain object to drive count-up
// function StatCard({
//   icon, label, value, color, delay,
// }: {
//   icon: React.ReactNode; label: string; value: number; color: string; delay: number;
// }) {
//   const countRef = useRef<HTMLSpanElement>(null);

//   useEffect(() => {
//     if (!countRef.current) return;
//     const proxy = { val: 0 };
//     animate(proxy, {
//       val: value,
//       duration: 1200,
//       delay,
//       ease: "outExpo",
//       onUpdate: () => {
//         if (countRef.current) {
//           countRef.current.textContent = String(Math.round(proxy.val));
//         }
//       },
//     });
//   }, [value, delay]);

//   // Derive bg/text classes safely to avoid Tailwind purge issues
//   const bgMap: Record<string, string> = {
//     "bg-violet-500": "bg-violet-100 text-violet-600",
//     "bg-emerald-500": "bg-emerald-100 text-emerald-600",
//     "bg-amber-500": "bg-amber-100 text-amber-600",
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: delay / 1000 }}
//     >
//       <Card className="shadow-none border border-border/50 overflow-hidden relative">
//         <div className={`absolute inset-x-0 top-0 h-0.5 ${color}`} />
//         <CardContent className="p-4 flex items-center gap-3">
//           <div className={`p-2.5 rounded-xl ${bgMap[color] ?? "bg-muted text-muted-foreground"}`}>
//             {icon}
//           </div>
//           <div>
//             <p className="text-xs text-muted-foreground font-medium">{label}</p>
//             <p className="text-2xl font-bold tracking-tight">
//               <span ref={countRef}>0</span>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

// // ─── Avatar ───────────────────────────────────────────────────────────────────
// function Avatar({ name, src }: { name: string; src?: string }) {
//   const gradients = [
//     "from-violet-500 to-purple-600",
//     "from-emerald-500 to-teal-600",
//     "from-orange-500 to-amber-600",
//     "from-sky-500 to-blue-600",
//     "from-pink-500 to-rose-600",
//   ];
//   const idx = (name?.charCodeAt(0) ?? 0) % gradients.length;
//   return src ? (
//     <img src={src} className="w-11 h-11 rounded-full object-cover ring-2 ring-border" alt={name} />
//   ) : (
//     <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradients[idx]} flex items-center justify-center text-white font-bold text-base ring-2 ring-border`}>
//       {name?.[0]?.toUpperCase()}
//     </div>
//   );
// }

// // ─── Owner Card ───────────────────────────────────────────────────────────────
// function OwnerCard({
//   owner, onVerify, isPending, index,
// }: {
//   owner: Owner; onVerify: (id: string, verified: boolean) => void;
//   isPending: boolean; index: number;
// }) {
//   const [open, setOpen] = useState(false);
//   const [showLottie, setShowLottie] = useState(false);
//   const cardRef = useRef<HTMLDivElement>(null);
//   const shouldReduceMotion = useReducedMotion();

//   // anime.js v4 — card spring-scale on button press
//   const pulseCard = () => {
//     if (shouldReduceMotion || !cardRef.current) return;
//     animate(cardRef.current, {
//       scale: [1, 1.013, 1],
//       duration: 340,
//       ease: "outBack(1.6)",
//     });
//   };

//   const handleConfirm = () => {
//     onVerify(owner.userId, !owner.verified);
//     if (!owner.verified) {
//       setShowLottie(true);
//       setTimeout(() => setShowLottie(false), 2200);
//     }
//     setOpen(false);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 24 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.95, y: -8 }}
//       transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
//       layout
//     >
//       <div ref={cardRef}>
//         <Card className="shadow-none border border-border/60 hover:border-border transition-colors duration-200 overflow-hidden group">
//           {/* Colour-coded top accent bar */}
//           <motion.div
//             className={`h-0.5 w-full ${owner.verified ? "bg-emerald-500" : "bg-amber-400"}`}
//             layoutId={`bar-${owner.id}`}
//           />

//           <CardContent className="p-5">
//             {/* ── Header ── */}
//             <div className="flex items-start gap-3 mb-4">
//               <div className="relative shrink-0">
//                 <Avatar name={owner.user.name} src={owner.user.avatarUrl} />
//                 {/* Lottie checkmark on verify */}
//                 <AnimatePresence>
//                   {showLottie && (
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0.4 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       exit={{ opacity: 0, scale: 0.4 }}
//                       className="absolute -inset-2 flex items-center justify-center pointer-events-none"
//                     >
//                       <Lottie
//                         animationData={checkmarkLottie}
//                         loop={false}
//                         style={{ width: 56, height: 56 }}
//                       />
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-1.5">
//                   <p className="font-semibold text-sm truncate">{owner.user.name}</p>
//                   {owner.verified && (
//                     <motion.span
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ type: "spring", stiffness: 500, damping: 25 }}
//                     >
//                       <MdVerified className="text-emerald-500 shrink-0" size={15} />
//                     </motion.span>
//                   )}
//                 </div>
//                 <p className="text-xs text-muted-foreground truncate mt-0.5">{owner.user.email}</p>
//               </div>

//               <div className="flex items-center gap-1.5">
//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={owner.verified ? "v" : "p"}
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.8 }}
//                     transition={{ duration: 0.18 }}
//                   >
//                     {owner.verified ? (
//                       <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] gap-1 h-6">
//                         <CheckCircle2 size={10} /> Verified
//                       </Badge>
//                     ) : (
//                       <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] gap-1 h-6">
//                         <Clock size={10} /> Pending
//                       </Badge>
//                     )}
//                   </motion.div>
//                 </AnimatePresence>

//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <HiOutlineDotsVertical size={15} />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end" className="text-sm">
//                     <DropdownMenuItem className="gap-2 cursor-pointer">
//                       <FaHistory size={13} /> View history
//                     </DropdownMenuItem>
//                     <DropdownMenuItem className="gap-2 cursor-pointer">
//                       <FaIdCard size={13} /> View NID document
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>

//             <Separator className="mb-4 opacity-50" />

//             {/* ── Info chips ── */}
//             <div className="grid grid-cols-2 gap-2 mb-5">
//               <TooltipProvider delayDuration={300}>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5 truncate cursor-default select-none">
//                       <Phone size={12} className="shrink-0 opacity-60" />
//                       <span className="truncate">{owner.phone ?? "No phone"}</span>
//                     </div>
//                   </TooltipTrigger>
//                   <TooltipContent side="bottom">{owner.phone ?? "Not provided"}</TooltipContent>
//                 </Tooltip>

//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5 truncate cursor-default select-none">
//                       <CreditCard size={12} className="shrink-0 opacity-60" />
//                       <span className="truncate">
//                         {owner.nidNumber ? `••••${owner.nidNumber.slice(-4)}` : "No NID"}
//                       </span>
//                     </div>
//                   </TooltipTrigger>
//                   <TooltipContent side="bottom">{owner.nidNumber ?? "Not provided"}</TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             </div>

//             {/* ── Action button ── */}
//             <AlertDialog open={open} onOpenChange={setOpen}>
//               <AlertDialogTrigger asChild>
//                 <Button
//                   size="sm"
//                   onClick={pulseCard}
//                   disabled={isPending}
//                   className={`w-full gap-2 text-xs font-semibold h-9 transition-all duration-200 ${
//                     owner.verified
//                       ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-border/50"
//                       : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
//                   }`}
//                 >
//                   {owner.verified
//                     ? <><ShieldOff size={14} /> Revoke Verification</>
//                     : <><ShieldCheck size={14} /> Verify Owner</>}
//                 </Button>
//               </AlertDialogTrigger>

//               <AlertDialogContent className="sm:max-w-md">
//                 <AlertDialogHeader>
//                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${owner.verified ? "bg-red-50" : "bg-emerald-50"}`}>
//                     {owner.verified
//                       ? <ShieldOff size={22} className="text-destructive" />
//                       : <MdSecurity size={22} className="text-emerald-600" />}
//                   </div>
//                   <AlertDialogTitle className="text-lg">
//                     {owner.verified ? "Revoke Verification?" : "Verify this owner?"}
//                   </AlertDialogTitle>
//                   <AlertDialogDescription className="text-sm leading-relaxed">
//                     {owner.verified ? (
//                       <>Revoking verification for <span className="font-medium text-foreground">{owner.user.name}</span> will immediately remove their ability to list properties.</>
//                     ) : (
//                       <>You are granting <span className="font-medium text-foreground">{owner.user.name}</span> verified status. They'll be able to list properties on the platform.</>
//                     )}
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter className="gap-2">
//                   <AlertDialogCancel className="h-9 text-sm">Cancel</AlertDialogCancel>
//                   <AlertDialogAction
//                     onClick={handleConfirm}
//                     disabled={isPending}
//                     className={`h-9 text-sm font-semibold ${
//                       owner.verified
//                         ? "bg-destructive hover:bg-destructive/90"
//                         : "bg-emerald-600 hover:bg-emerald-700"
//                     }`}
//                   >
//                     {isPending && <RefreshCw size={14} className="animate-spin mr-1.5" />}
//                     {owner.verified ? "Revoke" : "Confirm & Verify"}
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>
//           </CardContent>
//         </Card>
//       </div>
//     </motion.div>
//   );
// }

// // ─── Skeleton Grid ────────────────────────────────────────────────────────────
// function SkeletonGrid() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//       {[...Array(6)].map((_, i) => (
//         <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
//           <Card className="shadow-none border border-border/50">
//             <CardContent className="p-5 space-y-4">
//               <div className="flex items-center gap-3">
//                 <Skeleton className="w-11 h-11 rounded-full" />
//                 <div className="flex-1 space-y-2">
//                   <Skeleton className="h-3.5 w-32 rounded" />
//                   <Skeleton className="h-2.5 w-48 rounded" />
//                 </div>
//                 <Skeleton className="h-6 w-16 rounded-full" />
//               </div>
//               <Skeleton className="h-px w-full" />
//               <div className="grid grid-cols-2 gap-2">
//                 <Skeleton className="h-7 rounded-lg" />
//                 <Skeleton className="h-7 rounded-lg" />
//               </div>
//               <Skeleton className="h-9 rounded-lg" />
//             </CardContent>
//           </Card>
//         </motion.div>
//       ))}
//     </div>
//   );
// }

// // ─── Empty State ──────────────────────────────────────────────────────────────
// function EmptyState() {
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.97 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className="flex flex-col items-center justify-center py-24 text-center"
//     >
//       <div className="relative mb-5">
//         <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center">
//           <UserCheck size={36} className="text-emerald-500" />
//         </div>
//         <motion.div
//           animate={{ scale: [1, 1.18, 1] }}
//           transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
//           className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
//         >
//           <CheckCircle2 size={14} className="text-white" />
//         </motion.div>
//       </div>
//       <h3 className="font-semibold text-base mb-1">All caught up!</h3>
//       <p className="text-sm text-muted-foreground max-w-xs">
//         No pending owner verifications at the moment.
//       </p>
//     </motion.div>
//   );
// }

// // ─── Filter Pill ──────────────────────────────────────────────────────────────
// function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-150 ${
//         active
//           ? "bg-foreground text-background border-foreground"
//           : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
//       }`}
//     >
//       {label}
//     </button>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function OwnerVerificationPage() {
//   const { data: owners, isLoading, refetch } = useUnverifiedOwners();
//   const { mutate: verifyOwner, isPending } = useVerifyOwner();
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const headerRef = useRef<HTMLDivElement>(null);

//   const list: Owner[] = Array.isArray(owners) ? owners : (owners as any)?.data ?? [];

//   const filtered = list.filter((o) => {
//     const q = search.toLowerCase();
//     const matchSearch = o.user.name.toLowerCase().includes(q) || o.user.email.toLowerCase().includes(q);
//     const matchFilter =
//       filter === "all" ||
//       (filter === "verified" && o.verified) ||
//       (filter === "pending" && !o.verified);
//     return matchSearch && matchFilter;
//   });

//   const verifiedCount = list.filter((o) => o.verified).length;
//   const pendingCount = list.filter((o) => !o.verified).length;

//   const handleVerify = (id: string, verified: boolean) => {
//     verifyOwner(
//       { id, verified },
//       {
//         onSuccess: () => toast.success(verified ? "Owner verified!" : "Verification revoked.", { icon: verified ? "✅" : "🔒" }),
//         onError: (err: any) => toast.error(err?.message ?? "Something went wrong."),
//       }
//     );
//   };

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await refetch();
//     setIsRefreshing(false);
//     toast.success("Data refreshed");
//   };

//   // anime.js v4 — stagger header children on mount
//   useEffect(() => {
//     if (!headerRef.current) return;
//     const targets = headerRef.current.querySelectorAll<HTMLElement>(".anim-in");
//     animate(targets, {
//       opacity: [0, 1],
//       translateY: [12, 0],
//       delay: stagger(80),
//       duration: 480,
//       ease: "outCubic",
//     });
//   }, []);

//   return (
//     <TooltipProvider>
//       <div className="space-y-7 p-1">

//         {/* ── Header ── */}
//         <div ref={headerRef} className="flex items-start justify-between gap-4 anim-in opacity-0">
//           <div className="flex items-center gap-3">
//             <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950">
//               <FaUserShield size={20} className="text-violet-600" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight">Owner Verification</h1>
//               <p className="text-sm text-muted-foreground">Review and verify owner identities</p>
//             </div>
//           </div>
//           <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs h-8 shrink-0">
//             <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
//             Refresh
//           </Button>
//         </div>

//         {/* ── Stats ── */}
//         {!isLoading && (
//           <div className="grid grid-cols-3 gap-3">
//             <StatCard icon={<Users size={16} />} label="Total owners" value={list.length} color="bg-violet-500" delay={0} />
//             <StatCard icon={<BadgeCheck size={16} />} label="Verified" value={verifiedCount} color="bg-emerald-500" delay={100} />
//             <StatCard icon={<MdPendingActions size={16} />} label="Pending" value={pendingCount} color="bg-amber-500" delay={200} />
//           </div>
//         )}

//         {/* ── Search + Filter ── */}
//         <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3">
//           <div className="relative flex-1">
//             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
//             <Input
//               placeholder="Search by name or email…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-8 h-9 text-sm bg-muted/30 border-border/50"
//             />
//           </div>
//           <div className="flex items-center gap-2 flex-wrap">
//             <Filter size={13} className="text-muted-foreground/60 shrink-0" />
//             {(["all", "verified", "pending"] as const).map((f) => (
//               <FilterPill key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
//             ))}
//           </div>
//         </motion.div>

//         {/* ── Content ── */}
//         {isLoading && <SkeletonGrid />}
//         {!isLoading && filtered.length === 0 && <EmptyState />}
//         {!isLoading && filtered.length > 0 && (
//           <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//             <AnimatePresence mode="popLayout">
//               {filtered.map((owner, i) => (
//                 <OwnerCard key={owner.id} owner={owner} onVerify={handleVerify} isPending={isPending} index={i} />
//               ))}
//             </AnimatePresence>
//           </motion.div>
//         )}

//         {/* ── Footer ── */}
//         {!isLoading && list.length > 0 && (
//           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-xs text-muted-foreground/60 text-center pb-2">
//             Showing {filtered.length} of {list.length} owners
//           </motion.p>
//         )}

//       </div>
//     </TooltipProvider>
//   );
// }
import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Phone, CreditCard, ShieldCheck, ShieldOff,
  CheckCircle2, Clock, RefreshCw,
} from "lucide-react";
import { FaIdCard, FaHistory } from "react-icons/fa";
import { MdVerified, MdSecurity } from "react-icons/md";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { animate } from "animejs";
import Lottie from "lottie-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

import { Avatar } from "./Avatar";
import { checkmarkLottie, type Owner } from "./types";

// ─── Owner Card ───────────────────────────────────────────────────────────────
export function OwnerCard({
  owner, onVerify, isPending, index,
}: {
  owner: Owner; onVerify: (id: string, verified: boolean) => void;
  isPending: boolean; index: number;
}) {
  const [open, setOpen] = useState(false);
  const [showLottie, setShowLottie] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const pulseCard = () => {
    if (shouldReduceMotion || !cardRef.current) return;
    animate(cardRef.current, {
      scale: [1, 1.013, 1],
      duration: 340,
      ease: "outBack(1.6)",
    });
  };

  const handleConfirm = () => {
    onVerify(owner.userId, !owner.verified);
    if (!owner.verified) {
      setShowLottie(true);
      setTimeout(() => setShowLottie(false), 2200);
    }
    setOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      layout
    >
      <div ref={cardRef}>
        <Card className="shadow-none border border-border/60 hover:border-border transition-colors duration-200 overflow-hidden group">
          <motion.div
            className={`h-0.5 w-full ${owner.verified ? "bg-emerald-500" : "bg-amber-400"}`}
            layoutId={`bar-${owner.id}`}
          />

          <CardContent className="p-5">
            {/* ── Header ── */}
            <div className="flex items-start gap-3 mb-4">
              <div className="relative shrink-0">
                <Avatar name={owner.user.name} src={owner.user.avatarUrl} />
                <AnimatePresence>
                  {showLottie && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      className="absolute -inset-2 flex items-center justify-center pointer-events-none"
                    >
                      <Lottie animationData={checkmarkLottie} loop={false} style={{ width: 56, height: 56 }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm truncate">{owner.user.name}</p>
                  {owner.verified && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <MdVerified className="text-emerald-500 shrink-0" size={15} />
                    </motion.span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{owner.user.email}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={owner.verified ? "v" : "p"}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {owner.verified ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] gap-1 h-6">
                        <CheckCircle2 size={10} /> Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] gap-1 h-6">
                        <Clock size={10} /> Pending
                      </Badge>
                    )}
                  </motion.div>
                </AnimatePresence>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <HiOutlineDotsVertical size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-sm">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <FaHistory size={13} /> View history
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <FaIdCard size={13} /> View NID document
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Separator className="mb-4 opacity-50" />

            {/* ── Info chips ── */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5 truncate cursor-default select-none">
                      <Phone size={12} className="shrink-0 opacity-60" />
                      <span className="truncate">{owner.phone ?? "No phone"}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{owner.phone ?? "Not provided"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5 truncate cursor-default select-none">
                      <CreditCard size={12} className="shrink-0 opacity-60" />
                      <span className="truncate">
                        {owner.nidNumber ? `••••${owner.nidNumber.slice(-4)}` : "No NID"}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{owner.nidNumber ?? "Not provided"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* ── Action button ── */}
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={pulseCard}
                  disabled={isPending}
                  className={`w-full gap-2 text-xs font-semibold h-9 transition-all duration-200 ${
                    owner.verified
                      ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-border/50"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  }`}
                >
                  {owner.verified
                    ? <><ShieldOff size={14} /> Revoke Verification</>
                    : <><ShieldCheck size={14} /> Verify Owner</>}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${owner.verified ? "bg-red-50" : "bg-emerald-50"}`}>
                    {owner.verified
                      ? <ShieldOff size={22} className="text-destructive" />
                      : <MdSecurity size={22} className="text-emerald-600" />}
                  </div>
                  <AlertDialogTitle className="text-lg">
                    {owner.verified ? "Revoke Verification?" : "Verify this owner?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm leading-relaxed">
                    {owner.verified ? (
                      <>Revoking verification for <span className="font-medium text-foreground">{owner.user.name}</span> will immediately remove their ability to list properties.</>
                    ) : (
                      <>You are granting <span className="font-medium text-foreground">{owner.user.name}</span> verified status. They will be able to list properties on the platform.</>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="h-9 text-sm">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirm}
                    disabled={isPending}
                    className={`h-9 text-sm font-semibold ${
                      owner.verified
                        ? "bg-destructive hover:bg-destructive/90"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {isPending && <RefreshCw size={14} className="animate-spin mr-1.5" />}
                    {owner.verified ? "Revoke" : "Confirm & Verify"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
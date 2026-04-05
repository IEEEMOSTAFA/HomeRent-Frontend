"use client";
// src/app/(dashboardRoute)/admin/payments/[id]/page.tsx
// API: POST /api/admin/payments/:id/refund
// Data: found from GET /api/admin/payments list

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CreditCard, User, Building2,
  Calendar, DollarSign, ExternalLink, RefreshCw,
  Hash, CheckCircle, Clock, XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button }           from "@/components/ui/button";
import { Textarea }         from "@/components/ui/textarea";
import { Label }            from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator }        from "@/components/ui/separator";
import { Skeleton }         from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
// import StatusBadge          from "../../_components/StatusBadge";
import { useAdminPayments, useRefundPayment, type AdminPayment } from "@/hooks/admin/useAdminApi";
import StatusBadge from "@/components/Admin/StatusBadge";

// ─── info row helper ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

// ─── timeline dot ─────────────────────────────────────────────────────────────
function TimelineItem({ icon, label, date, active }: {
  icon: React.ReactNode; label: string; date?: string | null; active: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${!active ? "opacity-40" : ""}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        active ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
      }`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {date && <p className="text-xs text-muted-foreground">{new Date(date).toLocaleString()}</p>}
        {!date && active && <p className="text-xs text-muted-foreground">—</p>}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Fetch from the admin payments list and find by id
  // (no dedicated single-payment endpoint in backend routes)
  const { data, isLoading } = useAdminPayments({ page: 1 });
  const payment = data?.data?.find((p) => p.id === id) as AdminPayment | undefined;

  const { mutate: refundPayment, isPending: refunding } = useRefundPayment();
  const [refundOpen,   setRefundOpen]   = useState(false);
  const [refundReason, setRefundReason] = useState("");

  function handleRefundSubmit() {
    if (!refundReason.trim()) { toast.error("Provide a reason"); return; }
    refundPayment(
      { id, reason: refundReason },
      {
        onSuccess: () => {
          toast.success("Refund initiated successfully");
          setRefundOpen(false);
          setRefundReason("");
        },
        onError: () => toast.error("Refund failed"),
      }
    );
  }

  // ── loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Payment not found
      </div>
    );
  }

  const canRefund = payment.status === "SUCCESS";

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/payments">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft size={17} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Payment Detail</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={payment.status} />
              <span className="text-xs text-muted-foreground font-mono">#{payment.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Refund button */}
        {canRefund && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setRefundOpen(true); setRefundReason(""); }}
            className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <RefreshCw size={13} /> Refund
          </Button>
        )}
      </div>

      {/* ── Amount hero ── */}
      <Card className="shadow-none border-emerald-100 bg-emerald-50/30">
        <CardContent className="p-6 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Amount</p>
          <p className="text-4xl font-bold text-emerald-700">৳{payment.amount.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">{payment.currency}</p>
          {payment.receiptUrl && (
            <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs mt-2">
                <ExternalLink size={12} /> View Stripe Receipt
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      {/* ── Payment details ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard size={14} className="text-purple-500" /> Payment Info
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-2">
          <InfoRow icon={<Hash size={14} />}         label="Payment ID"        value={<span className="font-mono text-xs">{payment.id}</span>} />
          <InfoRow icon={<Hash size={14} />}         label="Stripe Intent ID"  value={<span className="font-mono text-xs">{payment.stripePaymentIntentId ?? "—"}</span>} />
          <InfoRow icon={<CheckCircle size={14} />}  label="Status"            value={<StatusBadge status={payment.status} />} />
          <InfoRow icon={<Calendar size={14} />}     label="Created"           value={new Date(payment.createdAt).toLocaleString()} />
          {payment.refundedAt && (
            <InfoRow icon={<RefreshCw size={14} />}  label="Refunded At"       value={new Date(payment.refundedAt).toLocaleString()} />
          )}
          {payment.refundAmount != null && payment.refundAmount > 0 && (
            <InfoRow icon={<DollarSign size={14} />} label="Refund Amount"     value={`৳${payment.refundAmount.toLocaleString()}`} />
          )}
        </CardContent>
      </Card>

      {/* ── User ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User size={14} className="text-blue-500" /> Payer
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold flex-shrink-0">
              {payment.user.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{payment.user.name}</p>
              <p className="text-xs text-muted-foreground">{payment.user.email}</p>
            </div>
            <Link href={`/admin/users/${payment.userId}`} className="ml-auto">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                View user <ExternalLink size={11} />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── Booking & Property ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 size={14} className="text-amber-500" /> Booking & Property
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-2">
          <InfoRow icon={<Hash size={14} />}        label="Booking ID"    value={<span className="font-mono text-xs">{payment.bookingId}</span>} />
          <InfoRow icon={<CheckCircle size={14} />} label="Booking Status" value={<StatusBadge status={payment.booking.status} />} />
          <InfoRow icon={<Calendar size={14} />}    label="Move-in Date"  value={new Date(payment.booking.moveInDate).toLocaleDateString()} />
          <InfoRow icon={<DollarSign size={14} />}  label="Total Amount"  value={`৳${payment.booking.totalAmount.toLocaleString()}`} />
          <InfoRow icon={<Building2 size={14} />}   label="Property"      value={payment.booking.property.title} />
          <InfoRow icon={<Building2 size={14} />}   label="Location"      value={`${payment.booking.property.area}, ${payment.booking.property.city}`} />
        </CardContent>
      </Card>

      {/* ── Status timeline ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock size={14} className="text-blue-500" /> Payment Timeline
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-4">
          <TimelineItem icon={<CreditCard size={14} />} label="Payment Created"   date={payment.createdAt}  active={true} />
          <TimelineItem icon={<CheckCircle size={14} />} label="Payment Success"  date={payment.status === "SUCCESS" ? payment.createdAt : null} active={payment.status === "SUCCESS"} />
          <TimelineItem icon={<XCircle size={14} />}     label="Payment Failed"   date={null}               active={payment.status === "FAILED"} />
          <TimelineItem icon={<RefreshCw size={14} />}   label="Refunded"         date={payment.refundedAt} active={payment.status === "REFUNDED"} />
        </CardContent>
      </Card>

      {/* ── Refund Dialog ── */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted/40 rounded-lg p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User</span>
                <strong>{payment.user.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <strong className="text-emerald-700">৳{payment.amount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property</span>
                <strong className="line-clamp-1 max-w-[200px]">{payment.booking.property.title}</strong>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>
                Reason for refund <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={3}
                placeholder="Reason for issuing this refund…"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={handleRefundSubmit}
              disabled={refunding || !refundReason.trim()}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {refunding ? "Processing…" : "Confirm Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
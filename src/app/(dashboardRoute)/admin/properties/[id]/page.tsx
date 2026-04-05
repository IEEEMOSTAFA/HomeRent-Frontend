"use client";
// src/app/(dashboardRoute)/admin/properties/[id]/page.tsx
// API: PATCH /api/admin/properties/:id/status (approve / reject)
// Data: fetched from GET /api/properties/:id (public endpoint, admin has access)

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, MapPin, BedDouble, Bath, SquareIcon,
  Calendar, Users, CheckCircle2, XCircle, Trash2,
  Building2, Star, DollarSign, Eye,
} from "lucide-react";
import { toast } from "sonner";

import { Button }           from "@/components/ui/button";
import { Badge }            from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator }        from "@/components/ui/separator";
import { Skeleton }         from "@/components/ui/skeleton";
import { Textarea }         from "@/components/ui/textarea";
import { Label }            from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import StatusBadge          from "../../_components/StatusBadge";
import {
  useApproveProperty,
  useAdminDeleteProperty,
  type PendingProperty,
} from "@/hooks/admin/useAdminApi";
import { useQuery }         from "@tanstack/react-query";
import { apiFetch }         from "@/lib/api";

// ─── fetch single property via public endpoint ────────────────────────────────
function usePropertyDetail(id: string) {
  return useQuery<PendingProperty>({
    queryKey: ["admin", "property", id],
    queryFn:  () => apiFetch(`/properties/${id}`),
    enabled:  !!id,
  });
}

// ─── INFO ROW helper ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: p, isLoading } = usePropertyDetail(id);
  const { mutate: approveProperty, isPending: approving } = useApproveProperty();
  const { mutate: deleteProperty,  isPending: deleting  } = useAdminDeleteProperty();

  const [rejectOpen,       setRejectOpen]       = useState(false);
  const [rejectionReason,  setRejectionReason]  = useState("");

  // ── handlers ────────────────────────────────────────────────────────────────
  function handleApprove() {
    approveProperty(
      { id, status: "APPROVED" },
      {
        onSuccess: () => toast.success("Property approved!"),
        onError:   () => toast.error("Approval failed"),
      }
    );
  }

  function handleRejectSubmit() {
    if (!rejectionReason.trim()) { toast.error("Provide a reason"); return; }
    approveProperty(
      { id, status: "REJECTED", rejectionReason },
      {
        onSuccess: () => {
          toast.success("Property rejected");
          setRejectOpen(false);
          setRejectionReason("");
        },
        onError: () => toast.error("Rejection failed"),
      }
    );
  }

  // ── loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Property not found
      </div>
    );
  }

  const canAct = p.status === "PENDING";

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/properties">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft size={17} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold line-clamp-1">{p.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={p.status} />
              <Badge variant="secondary" className="text-[10px]">
                {p.type.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Delete — always available */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/5">
              <Trash2 size={13} /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this property?</AlertDialogTitle>
              <AlertDialogDescription>
                Permanently removes <strong>{p.title}</strong> and all related bookings. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProperty(id, {
                  onSuccess: () => toast.success("Deleted"),
                  onError:   () => toast.error("Delete failed"),
                })}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* ── Images ── */}
      {p.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
          {p.images.slice(0, 3).map((img, i) => (
            <div key={i} className={`relative ${i === 0 ? "col-span-2" : ""} h-52`}>
              <Image src={img} alt={`img-${i}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* ── Rejection reason banner ── */}
      {p.status === "REJECTED" && p.rejectionReason && (
        <Card className="shadow-none border-destructive/40 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-destructive mb-1">Rejection Reason</p>
            <p className="text-sm text-destructive/80">{p.rejectionReason}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Overview ── */}
      <Card className="shadow-none">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin size={14} />
              {p.address}, {p.area}, {p.city}
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              ৳{p.rentAmount.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { icon: <BedDouble size={16} />, label: "Bedrooms",  val: p.bedrooms },
              { icon: <Bath size={16} />,      label: "Bathrooms", val: p.bathrooms },
              { icon: <SquareIcon size={16} />,label: "Size",      val: p.size ? `${p.size} sqft` : "—" },
              { icon: <Eye size={16} />,       label: "For",       val: p.availableFor },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-muted-foreground flex justify-center mb-1">{item.icon}</div>
                <p className="text-sm font-semibold">{item.val}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Description ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
        </CardContent>
      </Card>

      {/* ── Pricing details ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Pricing</CardTitle></CardHeader>
        <CardContent>
          <InfoRow icon={<DollarSign size={14} />} label="Monthly Rent"    value={`৳${p.rentAmount.toLocaleString()}`} />
          <InfoRow icon={<DollarSign size={14} />} label="Advance Deposit" value={`৳${(p as any).advanceDeposit?.toLocaleString() ?? 0}`} />
          <InfoRow icon={<DollarSign size={14} />} label="Booking Fee"     value={`৳${(p as any).bookingFee?.toLocaleString() ?? 0}`} />
          {(p as any).isNegotiable && (
            <p className="text-xs text-emerald-600 mt-2">✓ Rent is negotiable</p>
          )}
        </CardContent>
      </Card>

      {/* ── Availability ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Availability</CardTitle></CardHeader>
        <CardContent>
          <InfoRow icon={<Calendar size={14} />} label="Available From" value={new Date(p.availableFrom).toLocaleDateString()} />
          <InfoRow icon={<Users size={14} />}    label="Suitable For"   value={p.availableFor} />
        </CardContent>
      </Card>

      {/* ── Owner info ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Owner</CardTitle></CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
              {p.owner.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{p.owner.name}</p>
              <p className="text-xs text-muted-foreground">{p.owner.email}</p>
            </div>
            {p.owner.ownerProfile?.verified ? (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-[10px]">
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-200 text-[10px]">
                Unverified
              </Badge>
            )}
          </div>
          {p.owner.ownerProfile && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>Phone: {p.owner.ownerProfile.phone ?? "—"}</span>
              <span>NID: {p.owner.ownerProfile.nidNumber ?? "—"}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Action buttons (PENDING only) ── */}
      {canAct && (
        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => { setRejectOpen(true); setRejectionReason(""); }}
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <XCircle size={15} /> Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={approving}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 size={15} /> Approve Property
          </Button>
        </div>
      )}

      {/* ── Reject Dialog ── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Rejecting: <strong>{p.title}</strong>
          </p>
          <div className="space-y-1.5">
            <Label>
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={4}
              placeholder="Explain why this property is being rejected…"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={handleRejectSubmit}
              disabled={approving || !rejectionReason.trim()}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}







"use client";
// src/app/(dashboardRoute)/admin/users/[id]/page.tsx
// API: PATCH /api/users/:id/ban
// Data: fetched from GET /api/users/:id (or found from list)

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Mail, Calendar, ShieldCheck, ShieldOff,
  Ban, Building2, CalendarCheck, Star, CreditCard,
  BookOpen, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button }           from "@/components/ui/button";
import { Badge }            from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator }        from "@/components/ui/separator";
import { Skeleton }         from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import StatusBadge          from "../../_components/StatusBadge";
import { useAdminUsers, useBanUser, useVerifyOwner } from "@/hooks/admin/useAdminApi";
import { useQuery }         from "@tanstack/react-query";
import { apiFetch }         from "@/lib/api";
import StatusBadge from "@/components/Admin/StatusBadge";
// import StatusBadge from "@/components/user/StatusBadge";

// Fetch single user — using /api/users/:id if backend supports it,
// otherwise fall back to finding from the list
function useUserDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn:  () => apiFetch<any>(`/users/${id}`),
    enabled:  !!id,
  });
}

// ─── info row helper ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

// ─── stat box helper ──────────────────────────────────────────────────────────
function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-muted/40 rounded-lg p-3 text-center">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: user, isLoading } = useUserDetail(id);
  const { mutate: banUser,     isPending: banning   } = useBanUser();
  const { mutate: verifyOwner, isPending: verifying } = useVerifyOwner();

  function handleBan(isBanned: boolean) {
    banUser(
      { id, isBanned },
      {
        onSuccess: () => toast.success(isBanned ? "User banned" : "User unbanned"),
        onError:   () => toast.error("Action failed"),
      }
    );
  }

  function handleVerify(ownerProfileId: string, verified: boolean) {
    verifyOwner(
      { id: ownerProfileId, verified },
      {
        onSuccess: () => toast.success(verified ? "Owner verified" : "Verification revoked"),
        onError:   () => toast.error("Action failed"),
      }
    );
  }

  // ── loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-muted-foreground">User not found</div>
    );
  }

  const isOwner = user.role === "OWNER";
  const op      = user.ownerProfile;   // OwnerProfile | null

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft size={17} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">User Detail</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Full profile and actions</p>
          </div>
        </div>

        {/* Ban / Unban */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`gap-1.5 text-xs ${
                user.isBanned
                  ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  : "text-destructive border-destructive/30 hover:bg-destructive/5"
              }`}
            >
              {user.isBanned ? <><ShieldCheck size={13} /> Unban User</> : <><Ban size={13} /> Ban User</>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{user.isBanned ? "Unban" : "Ban"} {user.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                {user.isBanned
                  ? "Restores full platform access for this user."
                  : "Blocks this user from all protected routes immediately."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleBan(!user.isBanned)}
                disabled={banning}
                className={user.isBanned ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90"}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* ── Identity card ── */}
      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-2xl font-bold flex-shrink-0">
              {user.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold">{user.name}</h2>
                <StatusBadge status={user.role} />
                {user.isBanned && (
                  <Badge variant="outline" className="text-destructive border-destructive/40 bg-destructive/5 text-[10px]">
                    Banned
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <InfoRow icon={<Mail size={14} />}      label="Email"          value={user.email} />
          <InfoRow icon={<ShieldCheck size={14} />} label="Role"         value={<StatusBadge status={user.role} />} />
          <InfoRow icon={<CheckCircle size={14} />} label="Email Verified" value={user.emailVerified ? "Yes" : "No"} />
          <InfoRow icon={<Calendar size={14} />}  label="Joined"         value={new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
          <InfoRow
            icon={<Ban size={14} />}
            label="Account Status"
            value={
              user.isBanned
                ? <span className="text-destructive font-semibold text-xs">Banned</span>
                : <span className="text-emerald-600 font-semibold text-xs">Active</span>
            }
          />
        </CardContent>
      </Card>

      {/* ── Activity stats ── */}
      {user._count && (
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Activity</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="grid grid-cols-4 gap-3">
              <StatBox icon={<Building2 size={16} />}     label="Properties" value={user._count.properties ?? 0} color="text-blue-500" />
              <StatBox icon={<CalendarCheck size={16} />} label="Bookings"   value={user._count.bookings   ?? 0} color="text-emerald-500" />
              <StatBox icon={<Star size={16} />}          label="Reviews"    value={user._count.reviews    ?? 0} color="text-amber-500" />
              <StatBox icon={<CreditCard size={16} />}    label="Payments"   value={user._count.payments   ?? 0} color="text-purple-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Owner profile (OWNER role only) ── */}
      {isOwner && op && (
        <Card className="shadow-none">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Owner Profile</CardTitle>
            {/* Verify / revoke */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-1.5 h-7 text-xs ${
                    op.verified
                      ? "text-gray-500 border-gray-200 hover:bg-gray-50"
                      : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  {op.verified
                    ? <><ShieldOff size={12} /> Revoke</>
                    : <><ShieldCheck size={12} /> Verify</>}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{op.verified ? "Revoke" : "Verify"} owner?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {op.verified
                      ? "This removes their verified badge and may restrict listings."
                      : "Confirms their NID and identity. They can then list properties."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleVerify(op.id, !op.verified)}
                    disabled={verifying}
                    className={op.verified ? "bg-destructive hover:bg-destructive/90" : "bg-emerald-600 hover:bg-emerald-700"}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <InfoRow icon={<ShieldCheck size={14} />} label="Verified"          value={op.verified ? "Yes ✓" : "No"} />
            <InfoRow icon={<CreditCard size={14} />}  label="NID Number"        value={op.nidNumber ?? "Not provided"} />
            <InfoRow icon={<Building2 size={14} />}   label="Total Properties"  value={op.totalProperties} />
            <InfoRow icon={<Star size={14} />}         label="Rating"           value={`${op.rating.toFixed(1)} / 5.0`} />
            <InfoRow icon={<CreditCard size={14} />}  label="Total Earnings"    value={`৳${op.totalEarnings.toLocaleString()}`} />
          </CardContent>
        </Card>
      )}

    </div>
  );
}
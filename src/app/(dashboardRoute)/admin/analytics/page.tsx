"use client";
// src/app/(dashboardRoute)/admin/analytics/page.tsx
// API: GET /api/admin/analytics

import {
  Users, Building2, CalendarCheck, DollarSign,
  Star, ShieldCheck, TrendingUp, Ban,
  CheckCircle, Clock, XCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
// import StatCard from "../_components/StatCard";
import { useAdminAnalytics } from "@/hooks/admin/useAdminApi";
import StatCard from "@/components/Admin/StatCard";

export default function AdminAnalyticsPage() {
  const { data: s, isLoading } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const propertyTotal = s?.totalProperties ?? 1;
  const bookingTotal  = s?.totalBookings   ?? 1;
  const ownerTotal    = s?.totalOwners     ?? 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Full platform statistics</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"      value={`৳${(s?.totalRevenue ?? 0).toLocaleString()}`} icon={<DollarSign size={20} />} color="emerald" />
        <StatCard label="This Month"         value={`৳${(s?.revenueThisMonth ?? 0).toLocaleString()}`} icon={<TrendingUp size={20} />} color="blue" />
        <StatCard label="Total Users"        value={s?.totalUsers ?? 0}      icon={<Users size={20} />}     color="purple" />
        <StatCard label="Total Properties"   value={s?.totalProperties ?? 0} icon={<Building2 size={20} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Users breakdown */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Users size={15} className="text-blue-500" /> User Breakdown</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-4">
            {[
              { label: "Total Users",       val: s?.totalUsers   ?? 0, icon: <Users size={14} />,     color: "text-blue-500" },
              { label: "Owners",            val: s?.totalOwners  ?? 0, icon: <ShieldCheck size={14} />,color: "text-purple-500" },
              { label: "Admins",            val: s?.totalAdmins  ?? 0, icon: <ShieldCheck size={14} />,color: "text-rose-500" },
              { label: "Banned",            val: s?.bannedUsers  ?? 0, icon: <Ban size={14} />,        color: "text-destructive" },
              { label: "New This Month",    val: s?.newUsersThisMonth ?? 0, icon: <TrendingUp size={14} />, color: "text-emerald-500" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-sm ${r.color}`}>{r.icon}<span className="text-foreground">{r.label}</span></div>
                <span className="font-bold text-sm">{r.val}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Properties breakdown */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Building2 size={15} className="text-amber-500" /> Property Breakdown</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-4">
            {[
              { label: "Approved", val: s?.approvedProperties ?? 0, color: "bg-emerald-500" },
              { label: "Pending",  val: s?.pendingProperties  ?? 0, color: "bg-amber-500" },
              { label: "Rejected", val: s?.rejectedProperties ?? 0, color: "bg-red-500" },
            ].map((r) => (
              <div key={r.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-bold">{r.val} <span className="text-xs text-muted-foreground font-normal">({Math.round((r.val / propertyTotal) * 100)}%)</span></span>
                </div>
                <Progress value={(r.val / propertyTotal) * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bookings breakdown */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><CalendarCheck size={15} className="text-blue-500" /> Booking Breakdown</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-4">
            {[
              { label: "Confirmed",  val: s?.confirmedBookings ?? 0, color: "bg-emerald-500", icon: <CheckCircle size={13} className="text-emerald-500" /> },
              { label: "Pending",    val: s?.pendingBookings   ?? 0, color: "bg-amber-500",   icon: <Clock size={13} className="text-amber-500" /> },
              { label: "Cancelled",  val: s?.cancelledBookings ?? 0, color: "bg-gray-300",    icon: <XCircle size={13} className="text-gray-400" /> },
            ].map((r) => (
              <div key={r.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">{r.icon}<span className="text-muted-foreground">{r.label}</span></div>
                  <span className="font-bold">{r.val}</span>
                </div>
                <Progress value={(r.val / bookingTotal) * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reviews & Owners */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Star size={15} className="text-amber-500" /> Reviews & Verification</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Reviews</span>
              <span className="font-bold">{s?.totalReviews ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Flagged</span>
              <span className="font-bold text-amber-600">{s?.flaggedReviews ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Hidden</span>
              <span className="font-bold text-gray-500">{s?.hiddenReviews ?? 0}</span>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verified Owners</span>
                <span className="font-bold text-emerald-600">{s?.verifiedOwners ?? 0}</span>
              </div>
              <Progress value={((s?.verifiedOwners ?? 0) / ownerTotal) * 100} className="h-1.5" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Unverified Owners</span>
              <span className="font-bold text-amber-600">{s?.unverifiedOwners ?? 0}</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Revenue summary */}
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><DollarSign size={15} className="text-emerald-500" /> Revenue Summary</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Revenue",    val: `৳${(s?.totalRevenue ?? 0).toLocaleString()}`,     bg: "bg-emerald-50 border-emerald-100" },
              { label: "This Month",       val: `৳${(s?.revenueThisMonth ?? 0).toLocaleString()}`, bg: "bg-blue-50 border-blue-100" },
              { label: "Total Refunds",    val: `৳${(s?.totalRefunds ?? 0).toLocaleString()}`,     bg: "bg-rose-50 border-rose-100" },
            ].map((r) => (
              <div key={r.label} className={`border rounded-xl p-4 text-center ${r.bg}`}>
                <p className="text-xs text-muted-foreground">{r.label}</p>
                <p className="text-xl font-bold mt-1">{r.val}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
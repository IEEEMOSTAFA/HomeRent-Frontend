"use client";
// src/app/(dashboardRoute)/owner/dashboard/page.tsx
// API: GET /api/owner/stats  +  GET /api/owner/bookings?status=PENDING

import Link from "next/link";
import {
  Building2, CalendarCheck, Star, DollarSign,
  Clock, CheckCircle, XCircle, ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import StatCard from "../_components/StatCard";
import StatusBadge from "../_components/StatusBadge";
import { useOwnerStats, useOwnerBookings } from "@/hooks/owner/useOwnerApi";

export default function OwnerDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useOwnerStats();
  const { data: bookingsData, isLoading: bookingsLoading } = useOwnerBookings({ status: "PENDING" });
  const pendingBookings = bookingsData?.data?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your property portfolio at a glance</p>
      </div>

      {/* Stats Row */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Properties" value={stats?.totalProperties ?? 0} icon={<Building2 size={20} />} color="emerald" />
          <StatCard label="Total Bookings"   value={stats?.totalBookings   ?? 0} icon={<CalendarCheck size={20} />} color="blue" />
          <StatCard label="Avg Rating"        value={stats?.rating?.toFixed(1) ?? "—"} icon={<Star size={20} />} color="amber" />
          <StatCard
            label="Total Earnings"
            value={`৳${(stats?.totalEarnings ?? 0).toLocaleString()}`}
            icon={<DollarSign size={20} />}
            color="rose"
          />
        </div>
      )}

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Clock size={16} />,        label: "Pending Approval", val: stats?.pendingProperties  ?? 0, sub: "Awaiting admin",    color: "text-amber-600 bg-amber-50" },
          { icon: <CheckCircle size={16} />,   label: "Live Properties",  val: stats?.approvedProperties ?? 0, sub: "Live on platform",  color: "text-emerald-600 bg-emerald-50" },
          { icon: <CalendarCheck size={16} />, label: "Active Tenants",   val: stats?.confirmedBookings  ?? 0, sub: "Confirmed bookings",color: "text-blue-600 bg-blue-50" },
        ].map((s) => (
          <Card key={s.label} className="shadow-none">
            <CardContent className="p-5">
              <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md mb-3 ${s.color}`}>
                {s.icon} {s.label}
              </div>
              <p className="text-3xl font-bold text-foreground">{s.val}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Bookings */}
      <Card className="shadow-none">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Pending Booking Requests</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Requires your response</p>
          </div>
          <Link href="/owner/bookings">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
              View all <ArrowRight size={13} />
            </Button>
          </Link>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {bookingsLoading && (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          )}
          {!bookingsLoading && pendingBookings.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No pending bookings 🎉
            </div>
          )}
          {!bookingsLoading && pendingBookings.map((b, idx) => (
            <div key={b.id}>
              <div className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.property.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.user.name} · Move in: {new Date(b.moveInDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    ৳{b.totalAmount.toLocaleString()}
                  </span>
                  <StatusBadge status={b.status} />
                </div>
              </div>
              {idx < pendingBookings.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
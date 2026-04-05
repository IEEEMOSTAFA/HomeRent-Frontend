"use client";
// src/app/(dashboardRoute)/user/dashboard/page.tsx
// API: GET /api/users/me/stats + GET /api/bookings

import Link from "next/link";
import {
  CalendarCheck, CreditCard, Star,
  Bell, CheckCircle, Clock, XCircle, ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button }       from "@/components/ui/button";
import { Separator }    from "@/components/ui/separator";
import { Skeleton }     from "@/components/ui/skeleton";
// import StatCard         from "../_components/StatCard";
// import StatusBadge      from "../_components/StatusBadge";
import { useUserStats, useMyBookings } from "@/hooks/user/useUserApi";
import StatCard from "@/components/user/StatCard";
import StatusBadge from "@/components/user/StatusBadge";

export default function UserDashboardPage() {
  const { data: stats,    isLoading: statsLoading }    = useUserStats();
  const { data: bookings, isLoading: bookingsLoading } = useMyBookings({ page: 1 });

  const recentBookings = bookings?.data?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back — here is your rental activity</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Bookings"   value={stats?.totalBookings     ?? 0} icon={<CalendarCheck size={20} />} color="blue" />
          <StatCard label="Confirmed"        value={stats?.confirmedBookings ?? 0} icon={<CheckCircle size={20} />}   color="emerald" />
          <StatCard label="Total Payments"   value={stats?.totalPayments     ?? 0} icon={<CreditCard size={20} />}    color="purple" />
          <StatCard label="Notifications"    value={stats?.unreadNotifications ?? 0} icon={<Bell size={20} />}        color="amber" sub="unread" />
        </div>
      )}

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Clock size={16} />,        label: "Pending",   val: stats?.pendingBookings   ?? 0, color: "text-amber-600   bg-amber-50" },
          { icon: <XCircle size={16} />,      label: "Cancelled", val: stats?.cancelledBookings ?? 0, color: "text-red-500     bg-red-50" },
          { icon: <Star size={16} />,         label: "Reviews",   val: stats?.totalReviews      ?? 0, color: "text-emerald-600 bg-emerald-50" },
        ].map((s) => (
          <Card key={s.label} className="shadow-none">
            <CardContent className="p-5">
              <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md mb-3 ${s.color}`}>
                {s.icon} {s.label}
              </div>
              <p className="text-3xl font-bold">{s.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card className="shadow-none">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Your latest rental requests</p>
          </div>
          <Link href="/user/bookings">
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
          {!bookingsLoading && recentBookings.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No bookings yet —{" "}
              <Link href="/user/properties" className="text-blue-600 hover:underline">browse properties</Link>
            </div>
          )}
          {!bookingsLoading && recentBookings.map((b, idx) => (
            <div key={b.id}>
              <Link href={`/user/bookings/${b.id}`}>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{b.property.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.property.area} · Move in: {new Date(b.moveInDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">৳{b.totalAmount.toLocaleString()}</span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              </Link>
              {idx < recentBookings.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
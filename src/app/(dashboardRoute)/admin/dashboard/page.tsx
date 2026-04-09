"use client";

import {
  Users,
  Building2,
  CalendarCheck,
  DollarSign,
  Star,
  ShieldCheck,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Ban,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAdminAnalytics } from "@/hooks/admin/useAdminApi";
import StatCard from "@/components/Admin/StatCard";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  const { 
    data: stats, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useAdminAnalytics();

  // Force Refresh Function
  const handleForceRefresh = async () => {
    // Invalidate cache first
    await queryClient.invalidateQueries({ 
      queryKey: ["admin", "analytics"],
      exact: true 
    });
    
    // Then refetch
    await refetch();
  };

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 text-xl">Failed to load dashboard data</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        <Button 
          onClick={handleForceRefresh} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of RentHome platform
          </p>
        </div>

        <Button 
          onClick={handleForceRefresh} 
          variant="outline" 
          size="sm"
          disabled={isRefetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          {isRefetching ? "Refreshing..." : "Refresh Now"}
        </Button>
      </div>

      {/* Users Section */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Users</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Users" 
            value={stats?.totalUsers ?? 0} 
            icon={<Users size={20} />} 
            color="blue" 
          />
          <StatCard 
            label="Owners" 
            value={stats?.totalOwners ?? 0} 
            icon={<ShieldCheck size={20} />} 
            color="purple" 
          />
          <StatCard 
            label="Banned Users" 
            value={stats?.bannedUsers ?? 0} 
            icon={<Ban size={20} />} 
            color="rose" 
          />
          <StatCard 
            label="New This Month" 
            value={stats?.newUsersThisMonth ?? 0} 
            icon={<TrendingUp size={20} />} 
            color="emerald" 
            sub="new registrations" 
          />
        </div>
      </section>

      {/* Properties Section */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Properties</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Properties" 
            value={stats?.totalProperties ?? 0} 
            icon={<Building2 size={20} />} 
            color="blue" 
          />
          <StatCard 
            label="Approved" 
            value={stats?.approvedProperties ?? 0} 
            icon={<CheckCircle size={20} />} 
            color="emerald" 
          />
          <StatCard 
            label="Pending Review" 
            value={stats?.pendingProperties ?? 0} 
            icon={<Clock size={20} />} 
            color="amber" 
          />
          <StatCard 
            label="Rejected" 
            value={stats?.rejectedProperties ?? 0} 
            icon={<XCircle size={20} />} 
            color="rose" 
          />
        </div>
      </section>

      {/* Bookings, Revenue, Reviews & Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Bookings */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarCheck size={16} className="text-blue-500" /> Bookings
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            {[
              { label: "Total",     val: stats?.totalBookings ?? 0 },
              { label: "Confirmed", val: stats?.confirmedBookings ?? 0 },
              { label: "Pending",   val: stats?.pendingBookings ?? 0 },
              { label: "Cancelled", val: stats?.cancelledBookings ?? 0 },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="font-semibold">{r.val}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" /> Revenue
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            {[
              { label: "Total Revenue", val: `৳ ${(stats?.totalRevenue ?? 0).toLocaleString()}` },
              { label: "This Month",    val: `৳ ${(stats?.revenueThisMonth ?? 0).toLocaleString()}` },
              { label: "Total Refunds", val: `৳ ${(stats?.totalRefunds ?? 0).toLocaleString()}` },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="font-semibold">{r.val}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star size={16} className="text-amber-500" /> Reviews
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            {[
              { label: "Total Reviews", val: stats?.totalReviews ?? 0 },
              { label: "Flagged",       val: stats?.flaggedReviews ?? 0 },
              { label: "Hidden",        val: stats?.hiddenReviews ?? 0 },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="font-semibold">{r.val}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Owner Verification */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck size={16} className="text-purple-500" /> Owner Verification
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            {[
              { label: "Verified Owners",   val: stats?.verifiedOwners ?? 0 },
              { label: "Unverified Owners", val: stats?.unverifiedOwners ?? 0 },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="font-semibold">{r.val}</span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
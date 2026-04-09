"use client";

import Link from "next/link";
import { 
  CalendarCheck, 
  Building2, 
  Star, 
  Bell, 
  DollarSign 
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  useMyBookings 
} from "@/hooks/user/useUserApi";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function UserDashboardPage() {
  const { data: bookingsResponse, isLoading: bookingsLoading } = useMyBookings({ page: 1 });

  // Safe data handling (Backend wrapper support)
  const bookings = Array.isArray(bookingsResponse?.data) 
    ? bookingsResponse.data 
    : Array.isArray(bookingsResponse) 
      ? bookingsResponse 
      : [];

  const recentBookings = bookings.slice(0, 5);
  const upcomingBookings = bookings
    .filter((b: any) => ["CONFIRMED", "PENDING"].includes(b.status))
    .slice(0, 3);

  if (bookingsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your rental activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarCheck className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Stays</CardTitle>
            <Building2 className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Unread this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
            <Star className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Link href="/user/bookings">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking: any) => (
                <div key={booking.id} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{booking.property?.title || "Property"}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString() : 'Date not set'}
                    </p>
                  </div>
                  <Badge 
                    variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No bookings found yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="text-amber-600" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/user/notifications">
              <Button className="w-full">View All Notifications</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browse More Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/properties">
              <Button variant="outline" className="w-full">Explore Properties</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
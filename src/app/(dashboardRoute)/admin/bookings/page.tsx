"use client";
// src/app/(dashboardRoute)/admin/bookings/page.tsx

import { useState } from "react";
import { CalendarDays, MapPin, User, BookOpen } from "lucide-react";
import { Badge }             from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton }          from "@/components/ui/skeleton";
import { Button }            from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminBookings, type BookingStatus } from "@/hooks/admin/useAdminApi";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING:         "bg-amber-50   text-amber-700   border-amber-200",
  ACCEPTED:        "bg-blue-50    text-blue-700    border-blue-200",
  PAYMENT_PENDING: "bg-orange-50  text-orange-700  border-orange-200",
  CONFIRMED:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  DECLINED:        "bg-red-50     text-red-700     border-red-200",
  CANCELLED:       "bg-gray-50    text-gray-600    border-gray-200",
};

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[status] ?? ""}`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

const TABS: { label: string; value: BookingStatus | "ALL" }[] = [
  { label: "All",             value: "ALL" },
  { label: "Pending",         value: "PENDING" },
  { label: "Accepted",        value: "ACCEPTED" },
  { label: "Payment Pending", value: "PAYMENT_PENDING" },
  { label: "Confirmed",       value: "CONFIRMED" },
  { label: "Cancelled",       value: "CANCELLED" },
];

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminBookings({
    page,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const bookings   = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pagination?.total ?? 0} total bookings on platform
        </p>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(1); }}>
        <TabsList className="flex-wrap h-auto gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="text-center py-20">
          <BookOpen size={40} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No bookings found</p>
        </div>
      )}

      {!isLoading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <BookingStatusBadge status={b.status} />
                      <span className="text-xs text-muted-foreground font-mono">#{b.id.slice(-8).toUpperCase()}</span>
                      {b.payment && (
                        <Badge variant="outline" className={`text-[10px] ${b.payment.status === "SUCCESS" ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-gray-500 border-gray-200"}`}>
                          Payment: {b.payment.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold line-clamp-1">{b.property?.title ?? "Unknown Property"}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={11} />{[b.property?.area, b.property?.city].filter(Boolean).join(", ")}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User size={11} />{b.user?.name ?? "Unknown"} — {b.user?.email ?? ""}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays size={11} />
                      Move-in: {b.moveInDate ? new Date(b.moveInDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className="text-base font-bold text-emerald-700">৳{b.totalAmount?.toLocaleString() ?? 0}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <p className="text-[10px] text-muted-foreground">{b.numberOfTenants} tenant{b.numberOfTenants !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground">{pagination.page} / {pagination.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}
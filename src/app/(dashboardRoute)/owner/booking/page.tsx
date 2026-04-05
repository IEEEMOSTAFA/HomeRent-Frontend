"use client";
// src/app/(dashboardRoute)/owner/bookings/page.tsx
// API: GET /api/owner/bookings | PATCH /api/owner/bookings/:id

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2, XCircle, User, Calendar, Users2,
  MessageSquare, Building2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "../_components/StatusBadge";
import {
  useOwnerBookings,
  useRespondToBooking,
  type BookingStatus,
} from "@/hooks/owner/useOwnerApi";

const TABS: { label: string; value: BookingStatus | "ALL" }[] = [
  { label: "All",       value: "ALL" },
  { label: "Pending",   value: "PENDING" },
  { label: "Accepted",  value: "ACCEPTED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Declined",  value: "DECLINED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function OwnerBookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOwnerBookings({
    page,
    status: activeTab === "ALL" ? undefined : activeTab,
  });
  const { mutate: respond, isPending: responding } = useRespondToBooking();

  const bookings = data?.data ?? [];
  const meta = data?.meta;

  function handleRespond(id: string, status: "ACCEPTED" | "DECLINED") {
    respond(
      { id, status },
      {
        onSuccess: () => toast.success(`Booking ${status === "ACCEPTED" ? "accepted" : "declined"}`),
        onError: () => toast.error("Action failed"),
      }
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">{meta?.total ?? 0} total requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setPage(1); }}>
        <TabsList className="flex-wrap h-auto gap-1">
          {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && bookings.length === 0 && (
        <div className="text-center py-20 text-muted-foreground text-sm">No bookings found</div>
      )}

      {/* List */}
      {!isLoading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="shadow-none hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex gap-4">

                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {b.property.images[0] ? (
                      <Image src={b.property.images[0]} alt={b.property.title} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 size={20} className="text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/owner/properties/${b.propertyId}`}
                          className="text-sm font-semibold hover:text-emerald-600 transition-colors line-clamp-1"
                        >
                          {b.property.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{b.property.area}, {b.property.city}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><User size={11} /> {b.user.name}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={11} /> {new Date(b.moveInDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Users2 size={11} /> {b.numberOfTenants} tenant(s)</span>
                      <span className="font-semibold text-foreground ml-auto">৳{b.totalAmount.toLocaleString()}</span>
                    </div>

                    {b.message && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                        <MessageSquare size={11} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{b.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Accept / Decline — PENDING only */}
                {b.status === "PENDING" && (
                  <>
                    <Separator className="mt-4" />
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRespond(b.id, "DECLINED")}
                        disabled={responding}
                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                      >
                        <XCircle size={14} /> Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRespond(b.id, "ACCEPTED")}
                        disabled={responding}
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 size={14} /> Accept
                      </Button>
                    </div>
                  </>
                )}

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={15} /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">{meta.page} / {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>
            Next <ChevronRight size={15} />
          </Button>
        </div>
      )}

    </div>
  );
}
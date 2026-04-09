"use client";
// src/app/(dashboardRoute)/user/booking/page.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, MapPin, Building2, ChevronRight } from "lucide-react";

import { Card, CardContent }          from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button }                     from "@/components/ui/button";
import { Badge }                      from "@/components/ui/badge";
import { Skeleton }                   from "@/components/ui/skeleton";
import { useMyBookings, type BookingStatus } from "@/hooks/user/useUserApi";
import StatusBadge from "@/components/user/StatusBadge";

// ✅ FIXED: PAYMENT_PENDING tab যোগ করা হয়েছে — আগে ছিল না
const TABS: { label: string; value: BookingStatus | "ALL" }[] = [
  { label: "All",             value: "ALL" },
  { label: "Pending",         value: "PENDING" },
  { label: "Accepted",        value: "ACCEPTED" },
  { label: "Payment Pending", value: "PAYMENT_PENDING" },
  { label: "Confirmed",       value: "CONFIRMED" },
  { label: "Declined",        value: "DECLINED" },
  { label: "Cancelled",       value: "CANCELLED" },
];

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useMyBookings({
    page,
    status: activeTab === "ALL" ? undefined : activeTab,
  });

  const bookings   = data?.data ?? [];
  const pagination = data?.pagination;

  // ✅ DEBUG: console-এ দেখান কী আসছে (develop শেষে এই লাইন মুছুন)
  if (typeof window !== "undefined") {
    console.log("📦 Bookings API response:", data);
    console.log("📋 Bookings array:", bookings);
    if (error) console.error("❌ Booking fetch error:", error);
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pagination?.total ?? 0} total requests
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as typeof activeTab);
          setPage(1);
        }}
      >
        <TabsList className="flex-wrap h-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {/* ✅ Error দেখানো — আগে ছিল না, তাই নীরবে fail হতো */}
      {!isLoading && error && (
        <div className="text-center py-20">
          <p className="text-red-500 text-sm">
            ডেটা লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।
          </p>
        </div>
      )}

      {!isLoading && !error && bookings.length === 0 && (
        <div className="text-center py-20">
          <CalendarCheck size={44} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No bookings found</p>
          <Link href="/property">
            <Button variant="link" className="text-blue-600 mt-2">
              Browse properties →
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link href={`/user/booking/${b.id}`} key={b.id}>
              <Card className="shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {b.property?.images?.[0] ? (
                        <Image
                          src={b.property.images[0]}
                          alt={b.property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Building2 size={20} className="text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">
                            {b.property?.title || "Untitled"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin size={11} />
                            {b.property?.area}, {b.property?.city}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={b.status} />
                          <ChevronRight size={15} className="text-muted-foreground" />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <span>
                          Move in:{" "}
                          {b.moveInDate
                            ? new Date(b.moveInDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                        <span>{b.numberOfTenants} tenant(s)</span>
                        <span className="font-bold text-foreground">
                          ৳{b.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      {b.payment && (
                        <Badge variant="outline" className="text-[10px] mt-2">
                          Payment: {b.payment.status}
                        </Badge>
                      )}
                      {b.status === "ACCEPTED" && !b.payment && (
                        <Badge className="text-[10px] bg-blue-600 hover:bg-blue-600 mt-2">
                          Ready to pay
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

    </div>
  );
}






























// "use client";
// // src/app/(dashboardRoute)/user/booking/page.tsx
// // API: GET /api/bookings  (role-based auto filter)

// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { CalendarCheck, MapPin, Building2, ChevronRight } from "lucide-react";

// import { Card, CardContent }         from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button }                    from "@/components/ui/button";
// import { Badge }                     from "@/components/ui/badge";
// import { Skeleton }                  from "@/components/ui/skeleton";
// import { useMyBookings, type BookingStatus } from "@/hooks/user/useUserApi";
// import StatusBadge from "@/components/user/StatusBadge";

// const TABS: { label: string; value: BookingStatus | "ALL" }[] = [
//   { label: "All",       value: "ALL" },
//   { label: "Pending",   value: "PENDING" },
//   { label: "Accepted",  value: "ACCEPTED" },
//   { label: "Confirmed", value: "CONFIRMED" },
//   { label: "Declined",  value: "DECLINED" },
//   { label: "Cancelled", value: "CANCELLED" },
// ];

// export default function MyBookingsPage() {
//   const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");
//   const [page, setPage] = useState(1);

//   const { data, isLoading } = useMyBookings({
//     page,
//     status: activeTab === "ALL" ? undefined : activeTab,
//   });

//   // ✅ Backend returns { data, pagination } — keys fixed
//   const bookings = data?.data ?? [];
//   const pagination = data?.pagination;

//   return (
//     <div className="space-y-6">

//       <div>
//         <h1 className="text-2xl font-bold">My Bookings</h1>
//         <p className="text-sm text-muted-foreground mt-1">{pagination?.total ?? 0} total requests</p>
//       </div>

//       <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setPage(1); }}>
//         <TabsList className="flex-wrap h-auto">
//           {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
//         </TabsList>
//       </Tabs>

//       {isLoading && (
//         <div className="space-y-3">
//           {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
//         </div>
//       )}

//       {!isLoading && bookings.length === 0 && (
//         <div className="text-center py-20">
//           <CalendarCheck size={44} className="text-muted-foreground/20 mx-auto mb-3" />
//           <p className="text-muted-foreground text-sm">No bookings found</p>
//           <Link href="/property">
//             <Button variant="link" className="text-blue-600 mt-2">Browse properties →</Button>
//           </Link>
//         </div>
//       )}

//       {!isLoading && bookings.length > 0 && (
//         <div className="space-y-3">
//           {bookings.map((b) => (
//             <Link href={`/user/booking/${b.id}`} key={b.id}>
//               <Card className="shadow-none hover:shadow-sm transition-shadow cursor-pointer">
//                 <CardContent className="p-5">
//                   <div className="flex gap-4">
//                     {/* Thumbnail */}
//                     <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
//                       {b.property?.images?.[0] ? (
//                         <Image src={b.property.images[0]} alt={b.property.title} fill className="object-cover" />
//                       ) : (
//                         <div className="flex items-center justify-center h-full">
//                           <Building2 size={20} className="text-muted-foreground/30" />
//                         </div>
//                       )}
//                     </div>

//                     {/* Info */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between gap-2">
//                         <div>
//                           <p className="font-semibold text-sm line-clamp-1">{b.property?.title || "Untitled"}</p>
//                           <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
//                             <MapPin size={11} /> {b.property?.area}, {b.property?.city}
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2 flex-shrink-0">
//                           <StatusBadge status={b.status} />
//                           <ChevronRight size={15} className="text-muted-foreground" />
//                         </div>
//                       </div>

//                       <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
//                         <span>Move in: {b.moveInDate ? new Date(b.moveInDate).toLocaleDateString() : "N/A"}</span>
//                         <span>{b.numberOfTenants} tenant(s)</span>
//                         <span className="font-bold text-foreground">৳{b.totalAmount.toLocaleString()}</span>
//                       </div>

//                       {b.payment && (
//                         <Badge variant="outline" className="text-[10px] mt-2">Payment: {b.payment.status}</Badge>
//                       )}
//                       {b.status === "ACCEPTED" && !b.payment && (
//                         <Badge className="text-[10px] bg-blue-600 hover:bg-blue-600 mt-2">Ready to pay</Badge>
//                       )}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>
//           ))}
//         </div>
//       )}

//       {/* Pagination — uses pagination.totalPages, not meta */}
//       {pagination && pagination.totalPages > 1 && (
//         <div className="flex items-center justify-center gap-3">
//           <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
//             Previous
//           </Button>
//           <span className="text-sm text-muted-foreground">{pagination.page} / {pagination.totalPages}</span>
//           <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>
//             Next
//           </Button>
//         </div>
//       )}

//     </div>
//   );
// }



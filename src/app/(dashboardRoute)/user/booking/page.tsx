// test file::

"use client";
// src/app/(dashboardRoute)/user/booking/page.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, MapPin, Building2, ChevronRight, CreditCard } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useMyBookings, type BookingStatus } from "@/hooks/user/useUserApi";
import StatusBadge from "@/components/user/StatusBadge";

const TABS: { label: string; value: BookingStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Payment Pending", value: "PAYMENT_PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useMyBookings({
    page,
    status: activeTab === "ALL" ? undefined : activeTab,
  });

  const bookings = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pagination?.total ?? 0} total bookings
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
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
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

      {!isLoading && error && (
        <div className="text-center py-20 text-red-500">
          Failed to load bookings. Please refresh the page.
        </div>
      )}

      {!isLoading && !error && bookings.length === 0 && (
        <div className="text-center py-20">
          <CalendarCheck size={44} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No bookings found</p>
          <Link href="/properties">
            <Button variant="link" className="text-blue-600 mt-3">
              Browse Properties →
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="shadow-none hover:shadow-sm transition-all duration-200 overflow-hidden"
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {booking.property?.images?.[0] ? (
                      <Image
                        src={booking.property.images[0]}
                        alt={booking.property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building2 size={20} className="text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-1">
                          {booking.property?.title || "Untitled Property"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin size={11} />
                          {booking.property?.area}, {booking.property?.city}
                        </div>
                      </div>

                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                      <span>
                        Move-in: {booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString() : "N/A"}
                      </span>
                      <span>{booking.numberOfTenants} tenant(s)</span>
                      <span className="font-bold text-foreground">
                        ৳{booking.totalAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Action Area */}
                    <div className="mt-4 flex items-center gap-3">
                      <Link href={`/user/booking/${booking.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          View Details <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </Link>

                      {/* Ready to Pay Button - Most Important Change */}
                      {booking.status === "ACCEPTED" && !booking.payment && (
                        <Link href={`/user/payments/${booking.id}`}>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs font-medium px-4"
                          >
                            <CreditCard size={15} />
                            Pay Now
                          </Button>
                        </Link>
                      )}

                      {booking.payment && (
                        <Badge variant="outline" className="text-[10px]">
                          Paid: {booking.payment.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
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


























// // src/app/(dashboardRoute)/user/booking/page.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { CalendarCheck, MapPin, Building2, ChevronRight } from "lucide-react";

// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";

// import { useMyBookings, type BookingStatus } from "@/hooks/user/useUserApi";
// import StatusBadge from "@/components/user/StatusBadge";

// // ─── Tabs Configuration ─────────────────────────────────────────────────────
// const TABS: { label: string; value: BookingStatus | "ALL" }[] = [
//   { label: "All", value: "ALL" },
//   { label: "Pending", value: "PENDING" },
//   { label: "Accepted", value: "ACCEPTED" },
//   { label: "Payment Pending", value: "PAYMENT_PENDING" },
//   { label: "Confirmed", value: "CONFIRMED" },
//   { label: "Declined", value: "DECLINED" },
//   { label: "Cancelled", value: "CANCELLED" },
// ];

// export default function MyBookingsPage() {
//   const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");
//   const [page, setPage] = useState(1);

//   const { data, isLoading, error } = useMyBookings({
//     page,
//     status: activeTab === "ALL" ? undefined : activeTab,
//   });

//   const bookings = data?.data ?? [];
//   const pagination = data?.pagination;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-bold">My Bookings</h1>
//         <p className="text-sm text-muted-foreground mt-1">
//           {pagination?.total ?? 0} total bookings
//         </p>
//       </div>

//       {/* Tabs */}
//       <Tabs
//         value={activeTab}
//         onValueChange={(v) => {
//           setActiveTab(v as typeof activeTab);
//           setPage(1); // Reset to first page when tab changes
//         }}
//       >
//         <TabsList className="flex-wrap h-auto">
//           {TABS.map((tab) => (
//             <TabsTrigger key={tab.value} value={tab.value}>
//               {tab.label}
//             </TabsTrigger>
//           ))}
//         </TabsList>
//       </Tabs>

//       {/* Loading State */}
//       {isLoading && (
//         <div className="space-y-3">
//           {[...Array(4)].map((_, i) => (
//             <Skeleton key={i} className="h-32 rounded-xl" />
//           ))}
//         </div>
//       )}

//       {/* Error State */}
//       {!isLoading && error && (
//         <div className="text-center py-20">
//           <p className="text-red-500">Failed to load bookings.</p>
//           <p className="text-sm text-muted-foreground mt-1">
//             Please refresh the page or try again later.
//           </p>
//         </div>
//       )}

//       {/* Empty State */}
//       {!isLoading && !error && bookings.length === 0 && (
//         <div className="text-center py-20">
//           <CalendarCheck size={44} className="text-muted-foreground/20 mx-auto mb-3" />
//           <p className="text-muted-foreground">No bookings found in this category</p>
//           <Link href="/properties">
//             <Button variant="link" className="text-blue-600 mt-3">
//               Browse Properties →
//             </Button>
//           </Link>
//         </div>
//       )}

//       {/* Bookings List */}
//       {!isLoading && !error && bookings.length > 0 && (
//         <div className="space-y-3">
//           {bookings.map((booking) => (
//             <Link href={`/user/booking/${booking.id}`} key={booking.id}>
//               <Card className="shadow-none hover:shadow-sm transition-all duration-200 cursor-pointer">
//                 <CardContent className="p-5">
//                   <div className="flex gap-4">
//                     {/* Thumbnail */}
//                     <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
//                       {booking.property?.images?.[0] ? (
//                         <Image
//                           src={booking.property.images[0]}
//                           alt={booking.property.title}
//                           fill
//                           className="object-cover"
//                         />
//                       ) : (
//                         <div className="flex h-full items-center justify-center">
//                           <Building2 size={20} className="text-muted-foreground/30" />
//                         </div>
//                       )}
//                     </div>

//                     {/* Details */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between gap-2">
//                         <div className="flex-1 min-w-0">
//                           <p className="font-semibold text-sm line-clamp-1">
//                             {booking.property?.title || "Untitled Property"}
//                           </p>
//                           <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
//                             <MapPin size={11} />
//                             {booking.property?.area}, {booking.property?.city}
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 flex-shrink-0">
//                           <StatusBadge status={booking.status} />
//                           <ChevronRight size={15} className="text-muted-foreground" />
//                         </div>
//                       </div>

//                       <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
//                         <span>
//                           Move-in:{" "}
//                           {booking.moveInDate
//                             ? new Date(booking.moveInDate).toLocaleDateString()
//                             : "N/A"}
//                         </span>
//                         <span>{booking.numberOfTenants} tenant(s)</span>
//                         <span className="font-bold text-foreground">
//                           ৳{booking.totalAmount.toLocaleString()}
//                         </span>
//                       </div>

//                       {/* Payment Status Badges */}
//                       {booking.payment && (
//                         <Badge variant="outline" className="text-[10px] mt-2">
//                           Paid: {booking.payment.status}
//                         </Badge>
//                       )}
//                       {booking.status === "ACCEPTED" && !booking.payment && (
//                         <Badge className="text-[10px] mt-2 bg-blue-600 hover:bg-blue-700">
//                           Ready to Pay
//                         </Badge>
//                       )}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>
//           ))}
//         </div>
//       )}

//       {/* Pagination */}
//       {pagination && pagination.totalPages > 1 && (
//         <div className="flex items-center justify-center gap-3 pt-4">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={page === 1}
//           >
//             Previous
//           </Button>
//           <span className="text-sm text-muted-foreground px-2">
//             Page {pagination.page} of {pagination.totalPages}
//           </span>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
//             disabled={page === pagination.totalPages}
//           >
//             Next
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
// src/app/(dashboardRoute)/user/payments/page.tsx
// API: GET /api/payments/my-payments

import Link from "next/link";
import { CreditCard, ExternalLink, Building2 } from "lucide-react";

import { Card, CardContent }  from "@/components/ui/card";
import { Button }             from "@/components/ui/button";
import { Skeleton }           from "@/components/ui/skeleton";
import { Separator }          from "@/components/ui/separator";
// import StatusBadge            from "../_components/StatusBadge";
import { useMyPayments }      from "@/hooks/user/useUserApi";
import StatusBadge from "@/components/user/StatusBadge";

export default function PaymentHistoryPage() {
  const { data, isLoading } = useMyPayments();
  const payments = data?.data ?? [];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Payment History</h1>
        <p className="text-sm text-muted-foreground mt-1">{data?.meta?.total ?? 0} transactions</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {!isLoading && payments.length === 0 && (
        <div className="text-center py-20">
          <CreditCard size={44} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No payments yet</p>
          <Link href="/user/bookings">
            <Button variant="link" className="text-blue-600 mt-2">View bookings →</Button>
          </Link>
        </div>
      )}

      {!isLoading && payments.length > 0 && (
        <Card className="shadow-none divide-y">
          {payments.map((p) => (
            <div key={p.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-4">

                {/* Left */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">
                        {p.booking?.property?.title ?? "Property"}
                      </p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.booking?.property?.area}, {p.booking?.property?.city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    {p.refundedAt && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Refunded: ৳{p.refundAmount?.toLocaleString()} on {new Date(p.refundedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-lg font-bold text-blue-700">৳{p.amount.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">{p.currency}</p>
                  {p.receiptUrl && (
                    <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                        <ExternalLink size={11} /> Receipt
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

    </div>
  );
}

















































// "use client";
// // src/app/(user)/user/payments/page.tsx
// // Derived from bookings that have payments

// import { useEffect, useState } from "react";
// import { bookingsApi } from "@/lib/api/user.api";
// import type { Booking } from "@/types/user";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { CreditCard, CheckCircle2, XCircle, Clock, RefreshCcw } from "lucide-react";

// const PAYMENT_STATUS_CONFIG = {
//   SUCCESS:  { label: "Paid",     icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
//   PENDING:  { label: "Pending",  icon: Clock,        color: "text-amber-500 bg-amber-500/10" },
//   FAILED:   { label: "Failed",   icon: XCircle,      color: "text-destructive bg-destructive/10" },
//   REFUNDED: { label: "Refunded", icon: RefreshCcw,   color: "text-blue-500 bg-blue-500/10" },
// };

// export default function PaymentHistoryPage() {
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     bookingsApi.list()
//       .then((data) => setBookings(data.filter((b) => b.payment)))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   const totalSpent = bookings
//     .filter((b) => b.payment?.status === "SUCCESS")
//     .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0);

//   return (
//     <div className="p-6 space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
//         <p className="text-muted-foreground text-sm mt-1">Track all your rental payments</p>
//       </div>

//       {/* Summary */}
//       <Card>
//         <CardContent className="pt-5 flex items-center gap-4">
//           <div className="rounded-xl bg-primary/10 p-3">
//             <CreditCard className="h-5 w-5 text-primary" />
//           </div>
//           <div>
//             <p className="text-sm text-muted-foreground">Total Spent</p>
//             <p className="text-2xl font-bold">৳{totalSpent.toLocaleString()}</p>
//           </div>
//           <div className="ml-auto text-right">
//             <p className="text-sm text-muted-foreground">Transactions</p>
//             <p className="text-2xl font-bold">{bookings.length}</p>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Transactions */}
//       {loading ? (
//         <div className="space-y-3">
//           {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
//         </div>
//       ) : bookings.length === 0 ? (
//         <div className="py-20 text-center text-muted-foreground">No payment records yet.</div>
//       ) : (
//         <div className="space-y-3">
//           {bookings.map((booking) => {
//             if (!booking.payment) return null;
//             const config = PAYMENT_STATUS_CONFIG[booking.payment.status] ?? PAYMENT_STATUS_CONFIG.PENDING;
//             const Icon = config.icon;

//             return (
//               <Card key={booking.id}>
//                 <CardContent className="pt-4">
//                   <div className="flex items-center gap-4">
//                     <div className={`rounded-lg p-2 ${config.color.split(" ")[1]}`}>
//                       <Icon className={`h-4 w-4 ${config.color.split(" ")[0]}`} />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium text-sm truncate">{booking.property.title}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {booking.property.city} · {new Date(booking.payment.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-bold">৳{booking.payment.amount.toLocaleString()}</p>
//                       <Badge
//                         variant="outline"
//                         className={`text-xs ${config.color.split(" ")[0]}`}
//                       >
//                         {config.label}
//                       </Badge>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
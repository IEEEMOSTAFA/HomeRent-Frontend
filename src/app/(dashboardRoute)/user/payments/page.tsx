"use client";
// src/app/(dashboardRoute)/user/payments/page.tsx

import Link from "next/link";
import { CreditCard, ExternalLink, Building2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { useMyPayments } from "@/hooks/user/useUserApi";
import StatusBadge from "@/components/user/StatusBadge";

export default function PaymentHistoryPage() {
  const { data, isLoading } = useMyPayments();
  
  // Backend returns PaginatedResponse<UserPayment>
  const payments = data?.data ?? [];
  const totalTransactions = data?.meta?.total ?? payments.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Payment History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totalTransactions} transaction{totalTransactions !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && payments.length === 0 && (
        <div className="text-center py-20">
          <CreditCard size={48} className="text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No payments yet</p>
          <p className="text-sm text-muted-foreground mt-1">You have not made any payments yet.</p>
          <Link href="/user/booking">
            <Button variant="link" className="text-blue-600 mt-4">
              View My Bookings →
            </Button>
          </Link>
        </div>
      )}

      {/* Payments List */}
      {!isLoading && payments.length > 0 && (
        <Card className="shadow-none divide-y divide-border">
          {payments.map((payment) => (
            <div key={payment.id} className="px-6 py-5 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                
                {/* Left Side */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CreditCard size={20} className="text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm line-clamp-1">
                        {payment.booking?.property?.title ?? "Unknown Property"}
                      </p>
                      <StatusBadge status={payment.status} />
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {payment.booking?.property?.area}, {payment.booking?.property?.city}
                    </p>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(payment.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    {payment.refundedAt && (
                      <p className="text-xs text-rose-600 mt-1">
                        Refunded ৳{payment.refundAmount?.toLocaleString()} on{" "}
                        {new Date(payment.refundedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end gap-2 text-right flex-shrink-0">
                  <p className="text-xl font-bold text-blue-700">
                    ৳{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {payment.currency}
                  </p>

                  {payment.receiptUrl && (
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink size={13} />
                        Receipt
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
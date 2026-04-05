"use client";
// src/app/(dashboardRoute)/admin/payments/page.tsx
// API: GET /api/admin/payments | POST /api/admin/payments/:id/refund

import { useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
// import StatusBadge from "../_components/StatusBadge";
import { useAdminPayments, useRefundPayment, type PaymentStatus, type AdminPayment } from "@/hooks/admin/useAdminApi";
import StatusBadge from "@/components/Admin/StatusBadge";

const TABS: { label: string; value: PaymentStatus | "ALL" }[] = [
  { label: "All",      value: "ALL" },
  { label: "Success",  value: "SUCCESS" },
  { label: "Pending",  value: "PENDING" },
  { label: "Failed",   value: "FAILED" },
  { label: "Refunded", value: "REFUNDED" },
];

export default function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [refundTarget, setRefundTarget] = useState<AdminPayment | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const { data, isLoading } = useAdminPayments({
    page,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });
  const { mutate: refundPayment, isPending: refunding } = useRefundPayment();

  const payments = data?.data ?? [];
  const meta = data?.meta;

  function handleRefundSubmit() {
    if (!refundTarget || !refundReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    refundPayment(
      { id: refundTarget.id, reason: refundReason },
      {
        onSuccess: () => {
          toast.success("Refund initiated");
          setRefundTarget(null);
          setRefundReason("");
        },
        onError: () => toast.error("Refund failed"),
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">{meta?.total ?? 0} transactions on platform</p>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(1); }}>
        <TabsList>
          {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      )}

      {!isLoading && payments.length === 0 && (
        <div className="text-center py-20">
          <CreditCard size={40} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No payments found</p>
        </div>
      )}

      {!isLoading && payments.length > 0 && (
        <Card className="shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">User</th>
                    <th className="text-left px-4 py-3 font-medium">Property</th>
                    <th className="text-left px-4 py-3 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-right px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-sm">{p.user.name}</p>
                        <p className="text-xs text-muted-foreground">{p.user.email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm line-clamp-1">{p.booking.property.title}</p>
                        <p className="text-xs text-muted-foreground">{p.booking.property.area}, {p.booking.property.city}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-emerald-700">৳{p.amount.toLocaleString()}</p>
                        <p className="text-[11px] text-muted-foreground">{p.currency}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.receiptUrl && (
                            <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                                <ExternalLink size={11} /> Receipt
                              </Button>
                            </a>
                          )}
                          {p.status === "SUCCESS" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setRefundTarget(p); setRefundReason(""); }}
                              className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground">{meta.page} / {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>Next</Button>
        </div>
      )}

      {/* Refund Dialog */}
      <Dialog open={!!refundTarget} onOpenChange={(o) => !o && setRefundTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
              <p>User: <strong>{refundTarget?.user.name}</strong></p>
              <p>Amount: <strong className="text-emerald-700">৳{refundTarget?.amount.toLocaleString()}</strong></p>
              <p>Property: <strong>{refundTarget?.booking.property.title}</strong></p>
            </div>
            <div className="space-y-1.5">
              <Label>Reason <span className="text-destructive">*</span></Label>
              <Textarea
                rows={3}
                placeholder="Reason for refund…"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={handleRefundSubmit}
              disabled={refunding || !refundReason.trim()}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Confirm Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
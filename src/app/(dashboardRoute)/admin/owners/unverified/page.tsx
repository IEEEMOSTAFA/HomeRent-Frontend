"use client";
// src/app/(dashboardRoute)/admin/owners/unverified/page.tsx
// API: GET /api/admin/owners/unverified | PATCH /api/admin/owners/:id/verify

import { Phone, CreditCard, ShieldCheck, ShieldOff, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUnverifiedOwners, useVerifyOwner } from "@/hooks/admin/useAdminApi";

export default function OwnerVerificationPage() {
  const { data: owners, isLoading } = useUnverifiedOwners();
  const { mutate: verifyOwner, isPending } = useVerifyOwner();

  function handleVerify(id: string, verified: boolean) {
    verifyOwner(
      { id, verified },
      {
        onSuccess: () => toast.success(verified ? "Owner verified!" : "Verification revoked"),
        onError:   () => toast.error("Action failed"),
      }
    );
  }

  const list = Array.isArray(owners) ? owners : (owners as any)?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Owner Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and verify owner identities before they can list properties
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="text-center py-20">
          <UserCheck size={40} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No pending verifications</p>
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((owner: any) => (
            <Card key={owner.id} className="shadow-none">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold flex-shrink-0">
                    {owner.user.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{owner.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{owner.user.email}</p>
                  </div>
                  {owner.verified ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-[10px]">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[10px]">
                      Pending
                    </Badge>
                  )}
                </div>

                <Separator className="mb-4" />

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone size={13} />
                    <span>{owner.phone ?? "No phone provided"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard size={13} />
                    <span>{owner.nidNumber ?? "No NID provided"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registered: {new Date(owner.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Action */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      className={`w-full gap-1.5 text-xs ${owner.verified
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                    >
                      {owner.verified
                        ? <><ShieldOff size={13} /> Revoke Verification</>
                        : <><ShieldCheck size={13} /> Verify Owner</>}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {owner.verified ? "Revoke" : "Verify"} {owner.user.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {owner.verified
                          ? "This will remove their verified status."
                          : "This confirms their NID and identity. They will be able to list properties."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleVerify(owner.id, !owner.verified)}
                        disabled={isPending}
                        className={owner.verified ? "bg-destructive hover:bg-destructive/90" : "bg-emerald-600 hover:bg-emerald-700"}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
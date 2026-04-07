"use client";

import { Phone, CreditCard, ShieldCheck, ShieldOff, UserCheck } from "lucide-react";
import { toast } from "sonner";   // ← Sonner toast

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

  const handleVerify = (id: string, verified: boolean) => {
    verifyOwner(
      { id, verified },
      {
        onSuccess: () => {
          toast.success(
            verified 
              ? "Owner verified successfully!" 
              : "Verification revoked successfully!"
          );
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to update verification status");
        },
      }
    );
  };

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
          <p className="text-muted-foreground text-sm">No pending verifications found</p>
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((owner: any) => (
            <Card key={owner.id} className="shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                    {owner.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{owner.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{owner.user.email}</p>
                  </div>
                  {owner.verified ? (
                    <Badge className="bg-emerald-50 text-emerald-700">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600">Pending</Badge>
                  )}
                </div>

                <Separator className="mb-4" />

                <div className="space-y-2 mb-5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{owner.phone ?? "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} />
                    <span>{owner.nidNumber ?? "No NID"}</span>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      className={`w-full gap-2 ${owner.verified 
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                    >
                      {owner.verified ? (
                        <><ShieldOff size={16} /> Revoke Verification</>
                      ) : (
                        <><ShieldCheck size={16} /> Verify Owner</>
                      )}
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {owner.verified ? "Revoke Verification" : "Verify Owner"}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {owner.verified
                          ? `Are you sure you want to revoke verification for ${owner.user.name}?`
                          : `Confirm identity verification for ${owner.user.name}? They will be able to list properties.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleVerify(owner.userId, !owner.verified)}
                        disabled={isPending}
                        className={owner.verified ? "bg-destructive hover:bg-destructive/90" : ""}
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
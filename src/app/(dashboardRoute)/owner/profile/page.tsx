// src/app/(dashboardRoute)/owner/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Phone, CreditCard, Loader2, Pencil, X, CheckCircle, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useOwnerProfile, useUpdateOwnerProfile } from "@/hooks/owner/useOwnerApi";

const schema = z.object({
  phone: z.string().min(10, "Valid phone number দিন (১০+ ডিজিট)").or(z.literal("")),
  nidNumber: z.string().min(10, "Valid NID number দিন").or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function OwnerProfilePage() {
  const { data: profile, isLoading, refetch } = useOwnerProfile();
  const { mutate: updateProfile, isPending } = useUpdateOwnerProfile();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: "",
      nidNumber: "",
    },
  });

  // Auto fill form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone || "",
        nidNumber: profile.nidNumber || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: FormValues) => {
    updateProfile(
      {
        phone: data.phone || undefined,
        nidNumber: data.nidNumber || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Profile সফলভাবে আপডেট হয়েছে!");
          refetch();
        },
        onError: (err: any) => {
          toast.error(err?.message || "Profile আপডেট করতে সমস্যা হয়েছে");
        },
      }
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  // No Profile Found
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Owner Profile Not Found</h2>
        <p className="text-muted-foreground mt-2">
          Please refresh the page or contact support.
        </p>
      </div>
    );
  }

  const userInitial = profile.user?.name?.[0]?.toUpperCase() ?? "O";

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your owner account information</p>
      </div>

      {/* Identity Card */}
      <Card className="shadow-none">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-4xl font-bold flex-shrink-0">
              {userInitial}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.user?.name || "Owner"}</h2>
              <p className="text-muted-foreground">{profile.user?.email}</p>

              <div className="mt-3">
                {profile.verified ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <CheckCircle className="mr-1.5" size={14} />
                    Verified Owner
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600">
                    Verification Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Properties", value: profile.totalProperties ?? 0 },
              { label: "Reviews", value: profile.totalReviews ?? 0 },
              { label: "Rating", value: profile.rating?.toFixed(1) ?? "—" },
              { label: "Earnings", value: `৳${(profile.totalEarnings ?? 0).toLocaleString()}` },
            ].map((item) => (
              <div key={item.label} className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Card */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Contact & Verification Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Phone Number <span className="text-destructive">*</span></Label>
              <Input
                {...register("phone")}
                placeholder="017XXXXXXXX"
                type="tel"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>NID Number <span className="text-destructive">*</span></Label>
              <Input
                {...register("nidNumber")}
                placeholder="1234567890123"
              />
              {errors.nidNumber && <p className="text-sm text-destructive">{errors.nidNumber.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


























// "use client";
// // src/app/(dashboardRoute)/owner/profile/page.tsx
// // API: GET /api/owner/profile | PATCH /api/owner/profile

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Phone, CreditCard, CheckCircle, Loader2, Pencil, X } from "lucide-react";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useOwnerProfile, useUpdateOwnerProfile } from "@/hooks/owner/useOwnerApi";

// const schema = z.object({
//   phone:     z.string().min(10, "Enter valid phone").or(z.literal("")),
//   nidNumber: z.string().min(5, "Enter valid NID").or(z.literal("")),
// });
// type FormValues = z.infer<typeof schema>;

// export default function OwnerProfilePage() {
//   const { data: profile, isLoading } = useOwnerProfile();
//   const { mutate: update, isPending } = useUpdateOwnerProfile();
//   const [editing, setEditing] = useState(false);

//   const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
//     resolver: zodResolver(schema),
//     values: {
//       phone:     profile?.phone     ?? "",
//       nidNumber: profile?.nidNumber ?? "",
//     },
//   });

//   function onSubmit(data: FormValues) {
//     update(
//       { phone: data.phone || undefined, nidNumber: data.nidNumber || undefined },
//       {
//         onSuccess: () => { toast.success("Profile updated!"); setEditing(false); },
//         onError:   () => toast.error("Update failed"),
//       }
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="max-w-2xl mx-auto space-y-4">
//         <Skeleton className="h-40 rounded-xl" />
//         <Skeleton className="h-64 rounded-xl" />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto space-y-5">

//       <div>
//         <h1 className="text-2xl font-bold">My Profile</h1>
//         <p className="text-sm text-muted-foreground mt-1">Manage your owner account</p>
//       </div>

//       {/* Identity Card */}
//       <Card className="shadow-none">
//         <CardContent className="p-6">
//           <div className="flex items-center gap-4">
//             <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold flex-shrink-0">
//               {profile?.user.name?.[0]?.toUpperCase() ?? "O"}
//             </div>
//             <div>
//               <h2 className="text-lg font-bold">{profile?.user.name}</h2>
//               <p className="text-sm text-muted-foreground">{profile?.user.email}</p>
//               <div className="mt-1.5">
//                 {profile?.verified ? (
//                   <Badge className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200">
//                     <CheckCircle size={11} /> Verified Owner
//                   </Badge>
//                 ) : (
//                   <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
//                     ⏳ Verification Pending
//                   </Badge>
//                 )}
//               </div>
//             </div>
//           </div>

//           <Separator className="my-5" />

//           {/* Stats */}
//           <div className="grid grid-cols-4 gap-3">
//             {[
//               { label: "Properties", val: profile?.totalProperties ?? 0 },
//               { label: "Reviews",    val: profile?.totalReviews    ?? 0 },
//               { label: "Rating",     val: profile?.rating?.toFixed(1) ?? "—" },
//               { label: "Earnings",   val: `৳${(profile?.totalEarnings ?? 0).toLocaleString()}` },
//             ].map((s) => (
//               <div key={s.label} className="text-center bg-muted/40 rounded-lg py-3 px-2">
//                 <p className="text-base font-bold">{s.val}</p>
//                 <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Editable Fields */}
//       <Card className="shadow-none">
//         <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
//           <CardTitle className="text-base">Contact & Verification</CardTitle>
//           {!editing ? (
//             <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1.5 text-xs">
//               <Pencil size={12} /> Edit
//             </Button>
//           ) : (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => { setEditing(false); reset(); }}
//               className="gap-1.5 text-xs text-muted-foreground"
//             >
//               <X size={12} /> Cancel
//             </Button>
//           )}
//         </CardHeader>
//         <Separator />
//         <CardContent className="pt-5">
//           {!editing ? (
//             <div className="space-y-4">
//               <InfoRow icon={<Phone size={15} />}      label="Phone Number" value={profile?.phone     ?? "Not provided"} />
//               <InfoRow icon={<CreditCard size={15} />} label="NID Number"   value={profile?.nidNumber ?? "Not provided"} />
//               <InfoRow
//                 icon={<CheckCircle size={15} />}
//                 label="Member Since"
//                 value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}
//               />
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <div className="space-y-1.5">
//                 <Label>Phone Number</Label>
//                 <Input {...register("phone")} placeholder="e.g. 01711000000" />
//                 {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
//               </div>
//               <div className="space-y-1.5">
//                 <Label>NID Number</Label>
//                 <Input {...register("nidNumber")} placeholder="e.g. 1234567890" />
//                 {errors.nidNumber && <p className="text-xs text-destructive">{errors.nidNumber.message}</p>}
//               </div>
//               <div className="flex justify-end">
//                 <Button
//                   type="submit"
//                   disabled={isPending}
//                   className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
//                 >
//                   {isPending && <Loader2 size={14} className="animate-spin" />}
//                   Save Changes
//                 </Button>
//               </div>
//             </form>
//           )}
//         </CardContent>
//       </Card>

//     </div>
//   );
// }

// function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
//   return (
//     <div className="flex items-center gap-3">
//       <div className="text-muted-foreground w-5 flex-shrink-0">{icon}</div>
//       <div className="flex-1">
//         <p className="text-xs text-muted-foreground">{label}</p>
//         <p className="text-sm font-medium mt-0.5">{value}</p>
//       </div>
//     </div>
//   );
// }
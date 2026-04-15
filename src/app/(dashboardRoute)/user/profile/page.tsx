"use client";
// src/app/(dashboardRoute)/user/profile/page.tsx
// API: GET /api/users/me | PATCH /api/users/me

import { useState } from "react";
import { useForm }  from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z }        from "zod";
import { Pencil, X, Loader2, CheckCircle, Mail, Calendar, Shield } from "lucide-react";
import { toast }    from "sonner";

import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge }     from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton }  from "@/components/ui/skeleton";
import { useCurrentUser, useUpdateProfile } from "@/hooks/user/useUserApi";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  name:  z.string().min(2, "Min 2 chars"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export default function UserProfilePage() {
  const { data: user,   isLoading } = useCurrentUser();
  const { mutate: update, isPending } = useUpdateProfile();
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name:  user?.name  ?? "",
      image: user?.image ?? "",
    },
  });

  function onSubmit(data: FormValues) {
    update(
      { name: data.name, image: data.image || undefined },
      {
        onSuccess: () => { toast.success("Profile updated!"); setEditing(false); },
        onError:   () => toast.error("Update failed"),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">

      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your account details</p>
      </div>

      {/* Identity */}
      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <h2 className="text-lg font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-[10px]">
                  {user?.role ?? "USER"}
                </Badge>
                {user?.email  && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px] gap-1">
                    <CheckCircle size={9} /> Verified
                  </Badge>
                )}
                {user?.isBanned && (
                  <Badge variant="outline" className="text-destructive border-destructive/30 text-[10px]">
                    Banned
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <InfoRow icon={<Mail size={14} />}     label="Email"         value={user?.email} />
          <InfoRow icon={<Shield size={14} />}   label="Role"          value={user?.role} />
          <InfoRow icon={<CheckCircle size={14} />} label="Email Verified" value={user?.email  ? "Yes" : "No"} />
          <InfoRow icon={<Calendar size={14} />} label="Member Since"  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
        </CardContent>
      </Card>

      {/* Editable */}
      <Card className="shadow-none">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Edit Profile</CardTitle>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1.5 text-xs">
              <Pencil size={12} /> Edit
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => { setEditing(false); reset(); }} className="gap-1.5 text-xs text-muted-foreground">
              <X size={12} /> Cancel
            </Button>
          )}
        </CardHeader>
        <Separator />
        <CardContent className="pt-5">
          {!editing ? (
            <div className="space-y-4">
              <InfoRow icon={<></>} label="Display Name" value={user?.name ?? "—"} />
              <InfoRow icon={<></>} label="Avatar URL"   value={user?.image ? <span className="text-xs text-muted-foreground truncate max-w-45 block">{user.image}</span> : "Not set"} />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Display Name</Label>
                <Input {...register("name")} placeholder="Your name" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Avatar URL <span className="text-muted-foreground text-xs font-normal">(Cloudinary)</span></Label>
                <Input {...register("image")} placeholder="https://res.cloudinary.com/…" />
                {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
"use client";
// src/app/(dashboardRoute)/owner/properties/[id]/edit/page.tsx
// API: PUT /api/owner/properties/:id

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
// import PropertyForm from "../../../_components/PropertyForm";
import {
  useOwnerProperty,
  useUpdateProperty,
  type CreatePropertyInput,
} from "@/hooks/owner/useOwnerApi";
import PropertyForm from "@/components/owner/PropertyForm";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: property, isLoading } = useOwnerProperty(id);
  const { mutate: updateProperty, isPending } = useUpdateProperty();

  function handleSubmit(data: CreatePropertyInput) {
    updateProperty(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Property updated!");
          router.push(`/owner/properties/${id}`);
        },
        onError: () => toast.error("Update failed. Try again."),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/owner/properties/${id}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft size={17} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Property</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Updates on rejected properties will require re-review
          </p>
        </div>
      </div>

      <PropertyForm
        defaultValues={property}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
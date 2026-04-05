"use client";
// src/app/(dashboardRoute)/owner/properties/new/page.tsx
// API: POST /api/owner/properties

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
// import PropertyForm from "../../_components/PropertyForm";
import { useCreateProperty, type CreatePropertyInput } from "@/hooks/owner/useOwnerApi";
import PropertyForm from "@/components/owner/PropertyForm";

export default function AddPropertyPage() {
  const router = useRouter();
  const { mutate: createProperty, isPending } = useCreateProperty();

  function handleSubmit(data: CreatePropertyInput) {
    createProperty(data, {
      onSuccess: () => {
        toast.success("Property submitted for admin approval!");
        router.push("/owner/properties");
      },
      onError: () => toast.error("Failed to create property. Try again."),
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/owner/properties">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft size={17} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Property</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submitted properties are reviewed by admin before going live
          </p>
        </div>
      </div>

      <PropertyForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Submit for Approval"
      />
    </div>
  );
}
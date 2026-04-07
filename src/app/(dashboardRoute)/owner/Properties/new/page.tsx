// src/app/(dashboardRoute)/owner/properties/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { useCreateProperty, type CreatePropertyInput } from "@/hooks/owner/useOwnerApi";
import ImageUploader from "@/components/owner/ImageUploader";

// Validation Schema
const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["FAMILY_FLAT", "BACHELOR_ROOM", "SUBLET", "HOSTEL", "OFFICE_SPACE", "COMMERCIAL"]),
  city: z.string().min(2, "City name is required"),
  area: z.string().min(2, "Area name is required"),
  address: z.string().min(5, "Full address is required"),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  size: z.coerce.number().optional(),
  rentAmount: z.coerce.number().min(1, "Rent amount is required"),
  advanceDeposit: z.coerce.number().min(0),
  bookingFee: z.coerce.number().min(0),
  isNegotiable: z.boolean().default(false),
  availableFrom: z.string().min(1, "Date is required"),
  availableFor: z.enum(["FAMILY", "BACHELOR", "CORPORATE", "ANY"]),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function CreatePropertyPage() {
  const router = useRouter();
  const { mutateAsync: createProperty, isPending } = useCreateProperty();

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: "FAMILY_FLAT",
      availableFor: "ANY",
      isNegotiable: false,
      bedrooms: 1,
      bathrooms: 1,
      advanceDeposit: 0,
      bookingFee: 0,
      size: undefined,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: PropertyFormData) => {
    if (imageUrls.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      const payload: CreatePropertyInput = {
        ...data,
        images: imageUrls,
      };

      await createProperty(payload);
      toast.success("Property created successfully! Awaiting admin approval...");
      router.push("/owner/properties");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create property");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/owner/Properties">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Property</h1>
          <p className="text-muted-foreground">Property will go live after admin approval</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> */}
        {/* Image Uploader */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Images <span className="text-destructive">*</span></CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader onUrlsChange={setImageUrls} maxImages={10} />
            {imageUrls.length === 0 && (
              <p className="text-sm text-destructive mt-2">At least 1 image is required</p>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input {...register("title")} placeholder="e.g., Beautiful 3-bedroom flat in Mirpur" />
              {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Type */}
              <div>
                <Label>Property Type <span className="text-destructive">*</span></Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? "FAMILY_FLAT"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FAMILY_FLAT">Family Flat</SelectItem>
                        <SelectItem value="BACHELOR_ROOM">Bachelor Room</SelectItem>
                        <SelectItem value="SUBLET">Sublet</SelectItem>
                        <SelectItem value="HOSTEL">Hostel</SelectItem>
                        <SelectItem value="OFFICE_SPACE">Office Space</SelectItem>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Available For */}
              <div>
                <Label>Available For</Label>
                <Controller
                  name="availableFor"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? "ANY"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FAMILY">Family</SelectItem>
                        <SelectItem value="BACHELOR">Bachelor</SelectItem>
                        <SelectItem value="CORPORATE">Corporate</SelectItem>
                        <SelectItem value="ANY">Anyone</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div>
              <Label>Description <span className="text-destructive">*</span></Label>
              <Textarea {...register("description")} rows={5} placeholder="Detailed description of the property..." />
              {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>City <span className="text-destructive">*</span></Label>
                <Input {...register("city")} placeholder="e.g., Dhaka" />
                {errors.city && <p className="text-destructive text-sm">{errors.city.message}</p>}
              </div>
              <div>
                <Label>Area <span className="text-destructive">*</span></Label>
                <Input {...register("area")} placeholder="e.g., Mirpur-10" />
                {errors.area && <p className="text-destructive text-sm">{errors.area.message}</p>}
              </div>
            </div>

            <div>
              <Label>Full Address <span className="text-destructive">*</span></Label>
              <Input {...register("address")} placeholder="Road 5, House 12, Mirpur-10, Dhaka" />
              {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Bedrooms</Label>
                <Input {...register("bedrooms")} type="number" min={0} />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input {...register("bathrooms")} type="number" min={0} />
              </div>
              <div>
                <Label>Size (sqft)</Label>
                <Input {...register("size")} type="number" min={0} placeholder="Optional" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Monthly Rent (৳) <span className="text-destructive">*</span></Label>
                <Input {...register("rentAmount")} type="number" min={0} placeholder="25000" />
                {errors.rentAmount && <p className="text-destructive text-sm">{errors.rentAmount.message}</p>}
              </div>
              <div>
                <Label>Advance Deposit (৳)</Label>
                <Input {...register("advanceDeposit")} type="number" min={0} placeholder="0" />
              </div>
              <div>
                <Label>Booking Fee (৳)</Label>
                <Input {...register("bookingFee")} type="number" min={0} placeholder="0" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Controller
                name="isNegotiable"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="negotiable"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="negotiable" className="cursor-pointer">
                Rent is negotiable
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Available From <span className="text-destructive">*</span></Label>
              <Input
                {...register("availableFrom")}
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="mt-1"
              />
              {errors.availableFrom && <p className="text-destructive text-sm">{errors.availableFrom.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Property...
            </>
          ) : (
            "Submit Property"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          After submission, admin will review your property. It will be publicly visible once approved.
        </p>
      </form>
    </div>
  );
}
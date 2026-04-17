"use client";

// ✅ FILE PATH: src/app/(ownerRoute)/owner/properties/new/page.tsx
// এই file টি আগে ছিল না — নতুন তৈরি করা হয়েছে

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, X, Plus } from "lucide-react";
import Link from "next/link";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import {
  useCreateProperty,
  type PropertyType,
  type AvailableFor,
  type CreatePropertyInput,
} from "@/hooks/owner/useOwnerApi";

// ── Zod Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  title:          z.string().min(5, "Title কমপক্ষে ৫ অক্ষর হতে হবে"),
  description:    z.string().min(20, "Description কমপক্ষে ২০ অক্ষর হতে হবে"),
  type:           z.enum(["FAMILY_FLAT","BACHELOR_ROOM","SUBLET","HOSTEL","OFFICE_SPACE","COMMERCIAL"]),
  city:           z.string().min(2, "City লিখুন"),
  area:           z.string().min(2, "Area লিখুন"),
  address:        z.string().min(5, "Full address লিখুন"),
  bedrooms:       z.number().min(0).max(20),
  bathrooms:      z.number().min(0).max(20),
  size:           z.number().optional(),
  rentAmount:     z.number().min(1, "Rent amount দিন"),
  advanceDeposit: z.number().min(0),
  bookingFee:     z.number().min(0),
  isNegotiable:   z.boolean().optional(),
  availableFrom:  z.string().min(1, "Available date দিন"),
  availableFor:   z.enum(["FAMILY","BACHELOR","CORPORATE","ANY"]),
});

type FormValues = z.infer<typeof schema>;

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "FAMILY_FLAT",    label: "Family Flat"    },
  { value: "BACHELOR_ROOM",  label: "Bachelor Room"  },
  { value: "SUBLET",         label: "Sublet"         },
  { value: "HOSTEL",         label: "Hostel"         },
  { value: "OFFICE_SPACE",   label: "Office Space"   },
  { value: "COMMERCIAL",     label: "Commercial"     },
];

const AVAILABLE_FOR: { value: AvailableFor; label: string }[] = [
  { value: "FAMILY",    label: "Family"    },
  { value: "BACHELOR",  label: "Bachelor"  },
  { value: "CORPORATE", label: "Corporate" },
  { value: "ANY",       label: "Anyone"    },
];

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border border-border/60 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

// ── Field wrapper ──────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AddPropertyPage() {
  const router = useRouter();
  const { mutateAsync: createProperty, isPending } = useCreateProperty();

  // Image URLs (simple text input for now — replace with Cloudinary if needed)
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      isNegotiable: false,
      bedrooms:     1,
      bathrooms:    1,
      advanceDeposit: 0,
      bookingFee:     0,
    },
  });

  const isNegotiable = watch("isNegotiable");

  // ── Image helpers ────────────────────────────────────────────────────────────
  const addImageField = () => setImageUrls((prev) => [...prev, ""]);
  const removeImageField = (idx: number) =>
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  const updateImageUrl = (idx: number, val: string) =>
    setImageUrls((prev) => prev.map((u, i) => (i === idx ? val : u)));

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    const validImages = imageUrls.filter((u) => u.trim() !== "");

    const payload: CreatePropertyInput = {
      ...values,
      images: validImages,
    };

    try {
      await createProperty(payload);
      toast.success("🎉 Property submitted! Admin approval এর জন্য অপেক্ষা করুন।");
      router.push("/owner/properties");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Property add করতে সমস্যা হয়েছে।";
      toast.error(message);
    }
  };

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/owner/properties">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add New Property</h1>
            <p className="text-sm text-muted-foreground">
              সব তথ্য পূরণ করুন। Admin review করার পর property publish হবে।
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* ── Basic Info ─────────────────────────────────────────────────── */}
          <Section title="Basic Information" description="Property এর মূল তথ্য">
            <Field label="Property Title" error={errors.title?.message} required>
              <Input
                {...register("title")}
                placeholder="e.g. Spacious 3-bedroom flat in Agrabad"
              />
            </Field>

            <Field label="Description" error={errors.description?.message} required>
              <Textarea
                {...register("description")}
                placeholder="Property সম্পর্কে বিস্তারিত লিখুন…"
                rows={4}
                className="resize-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Property Type" error={errors.type?.message} required>
                <Select onValueChange={(v) => setValue("type", v as PropertyType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Available For" error={errors.availableFor?.message} required>
                <Select onValueChange={(v) => setValue("availableFor", v as AvailableFor)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant type" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FOR.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          {/* ── Location ───────────────────────────────────────────────────── */}
          <Section title="Location" description="Property এর ঠিকানা">
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" error={errors.city?.message} required>
                <Input {...register("city")} placeholder="e.g. Chattogram" />
              </Field>
              <Field label="Area" error={errors.area?.message} required>
                <Input {...register("area")} placeholder="e.g. Agrabad" />
              </Field>
            </div>
            <Field label="Full Address" error={errors.address?.message} required>
              <Input {...register("address")} placeholder="House no, Road no, Area…" />
            </Field>
          </Section>

          {/* ── Details ────────────────────────────────────────────────────── */}
          <Section title="Property Details">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Bedrooms" error={errors.bedrooms?.message} required>
                <Input {...register("bedrooms")} type="number" min={0} max={20} />
              </Field>
              <Field label="Bathrooms" error={errors.bathrooms?.message} required>
                <Input {...register("bathrooms")} type="number" min={0} max={20} />
              </Field>
              <Field label="Size (sq ft)" error={errors.size?.message}>
                <Input {...register("size")} type="number" min={0} placeholder="Optional" />
              </Field>
            </div>

            <Field label="Available From" error={errors.availableFrom?.message} required>
              <Input {...register("availableFrom")} type="date" />
            </Field>
          </Section>

          {/* ── Pricing ────────────────────────────────────────────────────── */}
          <Section title="Pricing" description="মাসিক ভাড়া ও অন্যান্য চার্জ">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Rent / Month (৳)" error={errors.rentAmount?.message} required>
                <Input {...register("rentAmount")} type="number" min={0} placeholder="e.g. 15000" />
              </Field>
              <Field label="Advance Deposit (৳)" error={errors.advanceDeposit?.message}>
                <Input {...register("advanceDeposit")} type="number" min={0} />
              </Field>
              <Field label="Booking Fee (৳)" error={errors.bookingFee?.message}>
                <Input {...register("bookingFee")} type="number" min={0} />
              </Field>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Switch
                id="negotiable"
                checked={isNegotiable}
                onCheckedChange={(v) => setValue("isNegotiable", v)}
              />
              <Label htmlFor="negotiable" className="cursor-pointer text-sm">
                Rent negotiable (ভাড়া আলোচনা সাপেক্ষ)
              </Label>
            </div>
          </Section>

          {/* ── Images ─────────────────────────────────────────────────────── */}
          <Section
            title="Property Images"
            description="Image URL গুলো দিন (Cloudinary, S3 etc.)"
          >
            <div className="space-y-2">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Upload size={14} className="text-muted-foreground shrink-0" />
                  <Input
                    value={url}
                    onChange={(e) => updateImageUrl(idx, e.target.value)}
                    placeholder={`Image URL ${idx + 1}`}
                    className="flex-1"
                  />
                  {imageUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => removeImageField(idx)}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={addImageField}
            >
              <Plus size={12} /> Add Another Image
            </Button>
          </Section>

          {/* ── Submit ─────────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <Link href="/owner/properties" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isPending}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Property"
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
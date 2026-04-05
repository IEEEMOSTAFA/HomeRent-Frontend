"use client";
// src/app/(dashboardRoute)/owner/_components/PropertyForm.tsx
// Shared by: properties/new/page.tsx  &  properties/[id]/edit/page.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/card";

import {
  useAIDescription,
  useAIPriceHint,
  type CreatePropertyInput,
  type Property,
} from "@/hooks/owner/useOwnerApi";

// ─── ZOD SCHEMA ───────────────────────────────────────────────────────────────
const schema = z.object({
  title:          z.string().min(5, "Min 5 characters"),
  description:    z.string().min(20, "Min 20 characters"),
  type:           z.enum(["FAMILY_FLAT","BACHELOR_ROOM","SUBLET","HOSTEL","OFFICE_SPACE","COMMERCIAL"]),
  city:           z.string().min(2, "Required"),
  area:           z.string().min(2, "Required"),
  address:        z.string().min(5, "Required"),
  bedrooms:       z.coerce.number().min(0),
  bathrooms:      z.coerce.number().min(0),
  size:           z.coerce.number().optional(),
  rentAmount:     z.coerce.number().min(1, "Required"),
  advanceDeposit: z.coerce.number().min(0).optional(),
  bookingFee:     z.coerce.number().min(0).optional(),
  isNegotiable:   z.boolean().optional(),
  availableFrom:  z.string().min(1, "Required"),
  availableFor:   z.enum(["FAMILY","BACHELOR","CORPORATE","ANY"]),
  images:         z.array(z.string().url("Must be valid URL")).min(1, "At least 1 image URL"),
});

type FormValues = z.infer<typeof schema>;

const PROPERTY_TYPES = [
  { value: "FAMILY_FLAT",   label: "Family Flat" },
  { value: "BACHELOR_ROOM", label: "Bachelor Room" },
  { value: "SUBLET",        label: "Sublet" },
  { value: "HOSTEL",        label: "Hostel" },
  { value: "OFFICE_SPACE",  label: "Office Space" },
  { value: "COMMERCIAL",    label: "Commercial" },
];

const AVAILABLE_FOR_OPTIONS = [
  { value: "ANY",       label: "Any" },
  { value: "FAMILY",    label: "Family" },
  { value: "BACHELOR",  label: "Bachelor" },
  { value: "CORPORATE", label: "Corporate" },
];

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface PropertyFormProps {
  defaultValues?: Partial<Property>;
  onSubmit: (data: CreatePropertyInput) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function PropertyForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: PropertyFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:          defaultValues?.title         ?? "",
      description:    defaultValues?.description   ?? "",
      type:           defaultValues?.type          ?? "FAMILY_FLAT",
      city:           defaultValues?.city          ?? "",
      area:           defaultValues?.area          ?? "",
      address:        defaultValues?.address       ?? "",
      bedrooms:       defaultValues?.bedrooms      ?? 1,
      bathrooms:      defaultValues?.bathrooms     ?? 1,
      size:           defaultValues?.size          ?? undefined,
      rentAmount:     defaultValues?.rentAmount    ?? 0,
      advanceDeposit: defaultValues?.advanceDeposit ?? 0,
      bookingFee:     defaultValues?.bookingFee    ?? 0,
      isNegotiable:   defaultValues?.isNegotiable  ?? false,
      availableFrom:  defaultValues?.availableFrom ? defaultValues.availableFrom.slice(0, 10) : "",
      availableFor:   defaultValues?.availableFor  ?? "ANY",
      images:         defaultValues?.images        ?? [],
    },
  });

  const aiDescribe  = useAIDescription();
  const aiPrice     = useAIPriceHint();
  const watchFields = watch(["type","city","area","bedrooms","bathrooms","availableFor","size"]);
  const imagesValue = watch("images") ?? [];

  function handleAIDescription() {
    const [type, city, area, bedrooms, bathrooms, availableFor] = watchFields;
    if (!city || !area) { toast.error("Fill city and area first"); return; }
    aiDescribe.mutate(
      { type, city, area, bedrooms, bathrooms, availableFor },
      {
        onSuccess: (d) => { setValue("description", d.description); toast.success("AI description generated!"); },
        onError: () => toast.error("AI generation failed"),
      }
    );
  }

  function handleAIPriceHint() {
    const [type, city, area, bedrooms, bathrooms, availableFor, size] = watchFields;
    if (!city || !area) { toast.error("Fill city and area first"); return; }
    aiPrice.mutate(
      { type, city, area, bedrooms, bathrooms, availableFor, size },
      {
        onSuccess: (d) => { setValue("rentAmount", d.suggestedRent); toast.success(`Suggested ৳${d.minRent}–৳${d.maxRent}`); },
        onError: () => toast.error("AI price hint failed"),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Basic Info ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <Field label="Title" error={errors.title?.message}>
            <Input {...register("title")} placeholder="e.g. Spacious 3BHK Family Flat in Gulshan" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Property Type" error={errors.type?.message}>
              <Select
                defaultValue={defaultValues?.type ?? "FAMILY_FLAT"}
                onValueChange={(v) => setValue("type", v as FormValues["type"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Available For" error={errors.availableFor?.message}>
              <Select
                defaultValue={defaultValues?.availableFor ?? "ANY"}
                onValueChange={(v) => setValue("availableFor", v as FormValues["availableFor"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FOR_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <div className="relative">
              <Textarea
                {...register("description")}
                rows={4}
                placeholder="Describe the property…"
                className="resize-none pr-32"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAIDescription}
                disabled={aiDescribe.isPending}
                className="absolute bottom-2 right-2 h-7 text-xs gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                {aiDescribe.isPending
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Sparkles size={11} />}
                AI Generate
              </Button>
            </div>
          </Field>

        </CardContent>
      </Card>

      {/* ── Location ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" error={errors.city?.message}>
              <Input {...register("city")} placeholder="Dhaka" />
            </Field>
            <Field label="Area" error={errors.area?.message}>
              <Input {...register("area")} placeholder="Gulshan" />
            </Field>
          </div>
          <Field label="Full Address" error={errors.address?.message}>
            <Input {...register("address")} placeholder="House 12, Road 5, Gulshan 2" />
          </Field>
        </CardContent>
      </Card>

      {/* ── Details ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Bedrooms" error={errors.bedrooms?.message}>
              <Input {...register("bedrooms")} type="number" min={0} />
            </Field>
            <Field label="Bathrooms" error={errors.bathrooms?.message}>
              <Input {...register("bathrooms")} type="number" min={0} />
            </Field>
            <Field label="Size (sqft)" error={errors.size?.message}>
              <Input {...register("size")} type="number" placeholder="Optional" />
            </Field>
          </div>
          <Field label="Available From" error={errors.availableFrom?.message}>
            <Input {...register("availableFrom")} type="date" />
          </Field>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isNegotiable"
              defaultChecked={defaultValues?.isNegotiable ?? false}
              onCheckedChange={(v) => setValue("isNegotiable", !!v)}
            />
            <Label htmlFor="isNegotiable" className="text-sm font-normal cursor-pointer">
              Rent is negotiable
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* ── Pricing ── */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Pricing</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAIPriceHint}
            disabled={aiPrice.isPending}
            className="h-7 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            {aiPrice.isPending
              ? <Loader2 size={11} className="animate-spin" />
              : <TrendingUp size={11} />}
            AI Price Hint
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Monthly Rent (৳)" error={errors.rentAmount?.message}>
              <Input {...register("rentAmount")} type="number" min={0} />
            </Field>
            <Field label="Advance Deposit (৳)" error={errors.advanceDeposit?.message}>
              <Input {...register("advanceDeposit")} type="number" min={0} />
            </Field>
            <Field label="Booking Fee (৳)" error={errors.bookingFee?.message}>
              <Input {...register("bookingFee")} type="number" min={0} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ── Images ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Image URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Paste Cloudinary URLs — one per line (max 10)
          </p>
          <Field label="" error={errors.images?.message}>
            <Textarea
              rows={4}
              className="resize-none font-mono text-xs"
              value={imagesValue.join("\n")}
              onChange={(e) =>
                setValue(
                  "images",
                  e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder={"https://res.cloudinary.com/…\nhttps://res.cloudinary.com/…"}
            />
          </Field>
        </CardContent>
      </Card>

      {/* ── Submit ── */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>

    </form>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && <Label className="text-sm">{label}</Label>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
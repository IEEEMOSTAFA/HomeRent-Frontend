"use client";
// src/app/(dashboardRoute)/user/reviews/new/page.tsx
// API: POST /api/reviews (only after CONFIRMED booking, one per booking)

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateReview, useMyBookings } from "@/hooks/user/useUserApi";

const schema = z.object({
  bookingId: z.string().min(1, "Select a booking"),
  rating: z.number().min(1).max(5),  // ✅ z.coerce.number() → z.number()
  comment: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={
              s <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-muted-foreground/30"
            }
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {value > 0 ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value] : "Select rating"}
      </span>
    </div>
  );
}

export default function NewReviewForm()  {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preBookingId = searchParams.get("bookingId") ?? "";

  const { data: bookingsData } = useMyBookings({ status: "CONFIRMED" });
  const confirmedBookings = (bookingsData?.data ?? []).filter((b) => !b.review);
  const { mutate: createReview, isPending } = useCreateReview();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bookingId: preBookingId,
      rating: 0,
      comment: "",
    },
  });

  const rating = watch("rating");

  function onSubmit(data: FormValues) {
    if (data.rating === 0) { toast.error("Please select a rating"); return; }
    createReview(
      { bookingId: data.bookingId, rating: data.rating, comment: data.comment || undefined },
      {
        onSuccess: () => {
          toast.success("Review submitted! Thank you.");
          router.push("/user/reviews");
        },
        onError: () => toast.error("Failed to submit review"),
      }
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/user/reviews">
          <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft size={17} /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Write a Review</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Share your rental experience</p>
        </div>
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-3"><CardTitle className="text-base">Review Details</CardTitle></CardHeader>
        <Separator />
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5"> {/* ✅ removed as any */}

            {/* Booking Select */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Select Booking <span className="text-destructive">*</span></Label>
              {confirmedBookings.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                  No confirmed bookings available for review. A booking must be confirmed before you can leave a review.
                </div>
              ) : (
                <Select
                  defaultValue={preBookingId}
                  onValueChange={(v) => setValue("bookingId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a booking…" />
                  </SelectTrigger>
                  <SelectContent>
                    {confirmedBookings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.property.title} · {new Date(b.moveInDate).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.bookingId && <p className="text-xs text-destructive">{errors.bookingId.message}</p>}
            </div>

            {/* Star rating */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Rating <span className="text-destructive">*</span></Label>
              <StarPicker value={rating} onChange={(v) => setValue("rating", v)} />
              {errors.rating && <p className="text-xs text-destructive">Please select a rating</p>}
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Comment <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
              <Textarea
                {...register("comment")}
                rows={5}
                placeholder="Share your experience with this property — cleanliness, location, owner responsiveness…"
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending || confirmedBookings.length === 0}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              Submit Review
            </Button>

          </form>
        </CardContent>
      </Card>

    </div>
  );
}
// src/app/(dashboardRoute)/user/booking/[id]/page.tsx
"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  CreditCard,
  Star,
  Building2,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  useBookingById,
  useCancelBooking,
  useCreateReview,
} from "@/hooks/user/useUserApi";
import StatusBadge from "@/components/user/StatusBadge";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star
            size={28}
            className={n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: booking, isLoading: bookingLoading } = useBookingById(id);
  const property = booking?.property;

  const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking();
  const { mutate: createReview, isPending: reviewing } = useCreateReview();

  const [cancelNote, setCancelNote] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const isLoading = bookingLoading;

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  // Not Found
  if (!booking || !property) {
    return (
      <div className="text-center py-24 space-y-4">
        <Building2 size={48} className="mx-auto text-muted-foreground/30" />
        <p className="text-xl font-semibold">Booking not found</p>
        <p className="text-muted-foreground max-w-xs mx-auto">
          This booking may have been removed or the link is incorrect.
        </p>
        <Link href="/user/booking">
          <Button variant="outline">Back to My Bookings</Button>
        </Link>
      </div>
    );
  }

  // const canCancel = ["PENDING", "ACCEPTED"].includes(booking.status);
  // const canReview = booking.status === "CONFIRMED" && !booking.review;
  // const canPay = booking.status === "ACCEPTED" && !booking.payment;





  // Add these lines after const property = booking?.property;
  const canCancel = ["PENDING", "ACCEPTED", "PAYMENT_PENDING"].includes(booking.status);
  
  const canPay = (booking.status === "ACCEPTED" || booking.status === "PAYMENT_PENDING") 
                 && (!booking.payment || booking.payment.status !== "SUCCESS");

  const canReview = booking.status === "CONFIRMED" && !booking.review;






  const handleCancel = () => {
    cancelBooking(
      { id: booking.id, cancellationNote: cancelNote.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Booking cancelled successfully");
          setCancelOpen(false);
          setCancelNote("");
        },
        onError: () => toast.error("Failed to cancel booking"),
      }
    );
  };

  const handleReview = () => {
    if (rating === 0) return toast.error("Please give a rating");

    createReview(
      { bookingId: booking.id, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Thank you for your review!");
          setReviewOpen(false);
          setRating(0);
          setComment("");
        },
        onError: () => toast.error("Failed to submit review"),
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/user/booking">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <p className="text-sm text-muted-foreground">#{booking.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Property Summary */}
      <Card>
        <div className="relative h-52 bg-muted">
          {property.images?.[0] ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 size={48} className="text-muted-foreground/20" />
            </div>
          )}
        </div>

        <CardContent className="pt-4 space-y-3">
          <h2 className="font-semibold text-lg leading-tight">{property.title}</h2>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin size={16} />
            {property.area}, {property.city}
          </div>

          <div className="flex gap-5 text-sm">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <BedDouble size={16} /> {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath size={16} /> {property.bathrooms} Baths
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Move-in Date" value={new Date(booking.moveInDate).toLocaleDateString("en-GB")} />
          <InfoRow label="Number of Tenants" value={booking.numberOfTenants} />
          <InfoRow label="Monthly Rent" value={`৳${booking.rentAmount.toLocaleString()}`} />
          <InfoRow label="Booking Fee" value={`৳${booking.bookingFee.toLocaleString()}`} />
          <Separator />
          <InfoRow
            label="Total Amount"
            value={
              <span className="text-lg font-bold text-primary">
                ৳{booking.totalAmount.toLocaleString()}
              </span>
            }
          />

          {booking.message && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground text-sm mb-1">Your Message</p>
                <p className="text-sm">{booking.message}</p>
              </div>
            </>
          )}

          {booking.cancellationNote && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground text-sm mb-1">Cancellation Note</p>
                <p className="text-sm text-destructive">{booking.cancellationNote}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Info */}
      {booking.payment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard size={18} /> Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Status" value={<StatusBadge status={booking.payment.status} />} />
            <InfoRow label="Amount Paid" value={`৳${booking.payment.amount.toLocaleString()}`} />
            <InfoRow label="Payment Date" value={new Date(booking.payment.createdAt).toLocaleDateString("en-GB")} />
            {booking.payment.receiptUrl && (
              <a href={booking.payment.receiptUrl} target="_blank" className="text-blue-600 hover:underline text-sm block">
                Download Receipt →
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Review */}
      {booking.review && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star size={18} /> Your Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={18}
                  className={n <= booking.review!.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}
                />
              ))}
            </div>
            {booking.review.comment && <p className="text-sm text-muted-foreground">{booking.review.comment}</p>}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4">
        {canPay && (
          <Link href={`/user/payments/${booking.id}`}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <CreditCard className="mr-2" size={18} />
              Pay Now — ৳{booking.totalAmount.toLocaleString()}
            </Button>
          </Link>
        )}

        {canReview && (
          <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">
                <Star className="mr-2" size={18} />
                Leave Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rate Your Experience</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <StarRating value={rating} onChange={setRating} />
                <Textarea
                  placeholder="Write your review (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleReview} disabled={reviewing || rating === 0} className="w-full">
                  {reviewing ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {canCancel && (
          <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="text-destructive hover:bg-destructive/10">
                <Ban className="mr-2" size={18} />
                Cancel Booking
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel this booking?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="Reason for cancellation (optional)"
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setCancelOpen(false)}>
                    Keep Booking
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleCancel} disabled={cancelling}>
                    {cancelling ? "Cancelling..." : "Yes, Cancel"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
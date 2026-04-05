"use client";
// src/app/(dashboardRoute)/user/payments/[bookingId]/page.tsx
// API: POST /api/payments/create-intent → Stripe Elements → POST /api/payments/confirm
// PRD Section 6: Payment Flow

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { Button }             from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator }          from "@/components/ui/separator";
import { Skeleton }           from "@/components/ui/skeleton";
import StatusBadge            from "../../_components/StatusBadge";
import {
  useMyBooking,
  useCreatePaymentIntent,
  useConfirmPayment,
} from "@/hooks/user/useUserApi";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

// ─── Inner Stripe form ────────────────────────────────────────────────────────
function StripePaymentForm({
  clientSecret,
  paymentId,
  amount,
  onSuccess,
}: {
  clientSecret: string;
  paymentId: string;
  amount: number;
  onSuccess: () => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const { mutate: confirmPayment, isPending } = useConfirmPayment();
  const [processing, setProcessing] = useState(false);

  async function handlePay() {
    if (!stripe || !elements) return;
    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) { setProcessing(false); return; }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      toast.error(error.message ?? "Payment failed");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      confirmPayment(
        { paymentId, stripePaymentIntentId: paymentIntent.id },
        {
          onSuccess: () => { toast.success("Payment confirmed! Booking is now active."); onSuccess(); },
          onError:   () => toast.error("Could not confirm payment. Contact support."),
        }
      );
    }
    setProcessing(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/40 rounded-lg p-4 border border-border">
        <Label className="text-xs text-muted-foreground mb-2 block">Card Details</Label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "14px",
                color: "#111827",
                "::placeholder": { color: "#9ca3af" },
              },
            },
          }}
        />
      </div>

      <Button
        onClick={handlePay}
        disabled={!stripe || processing || isPending}
        className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white h-11 text-sm font-semibold"
      >
        {(processing || isPending)
          ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
          : <><CreditCard size={15} /> Pay ৳{amount.toLocaleString()}</>}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck size={12} className="text-emerald-500" />
        Secured by Stripe — your card data is never stored
      </div>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={`text-sm font-medium ${className ?? ""}`}>{children}</p>;
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function PaymentPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const { data: booking, isLoading: bookingLoading } = useMyBooking(bookingId);
  const { mutate: createIntent, isPending: creating }  = useCreatePaymentIntent();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId,    setPaymentId]    = useState<string | null>(null);
  const [paid,         setPaid]         = useState(false);

  // Trigger intent creation once booking loaded
  useEffect(() => {
    if (!booking || booking.status !== "ACCEPTED" || clientSecret) return;
    createIntent(bookingId, {
      onSuccess: (res) => {
        setClientSecret(res.clientSecret);
        setPaymentId(res.paymentId);
      },
      onError: () => toast.error("Could not initiate payment"),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking]);

  if (bookingLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!booking) {
    return <div className="text-center py-20 text-muted-foreground">Booking not found</div>;
  }

  if (booking.status !== "ACCEPTED") {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-3">
        <p className="text-muted-foreground text-sm">
          Payment is only available for <strong>ACCEPTED</strong> bookings.
        </p>
        <p className="text-xs text-muted-foreground">Current status: <StatusBadge status={booking.status} /></p>
        <Link href="/user/bookings">
          <Button variant="outline" size="sm" className="mt-2">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  // Success state
  if (paid) {
    return (
      <div className="max-w-lg mx-auto text-center py-24 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold">Payment Successful!</h2>
        <p className="text-sm text-muted-foreground">
          Your booking for <strong>{booking.property.title}</strong> is now confirmed.
        </p>
        <Link href="/user/bookings">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-2">View My Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/user/bookings/${bookingId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft size={17} /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Complete Payment</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Confirm and pay for your booking</p>
        </div>
      </div>

      {/* Booking summary */}
      <Card className="shadow-none">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Booking Summary</CardTitle></CardHeader>
        <Separator />
        <CardContent className="pt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Property</span>
            <strong className="text-right max-w-[200px] line-clamp-1">{booking.property.title}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location</span>
            <span>{booking.property.area}, {booking.property.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Move-in Date</span>
            <span>{new Date(booking.moveInDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tenants</span>
            <span>{booking.numberOfTenants}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rent</span>
            <span>৳{booking.rentAmount.toLocaleString()}/mo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Fee</span>
            <span>৳{booking.bookingFee.toLocaleString()}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between font-bold text-base">
            <span>Total Due</span>
            <span className="text-blue-700">৳{booking.totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stripe form */}
      <Card className="shadow-none">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CreditCard size={14} /> Payment</CardTitle></CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {creating && (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
              <Loader2 size={16} className="animate-spin" /> Preparing payment…
            </div>
          )}
          {!creating && clientSecret && paymentId && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                clientSecret={clientSecret}
                paymentId={paymentId}
                amount={booking.totalAmount}
                onSuccess={() => setPaid(true)}
              />
            </Elements>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
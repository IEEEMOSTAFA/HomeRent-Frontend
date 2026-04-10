// test form: 

"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  useBookingById,
  useCreatePaymentIntent,
  useConfirmPayment,
} from "@/hooks/user/useUserApi";
import StatusBadge from "@/components/user/StatusBadge";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

// ====================== STRIPE PAYMENT FORM ======================
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
  const stripe = useStripe();
  const elements = useElements();
  const { mutate: confirmPayment, isPending: confirming } = useConfirmPayment();
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      if (!paymentId) {
        toast.error("Payment ID is missing. Please try again.");
        setProcessing(false);
        return;
      }

      confirmPayment(
        {
          paymentId: paymentId,
          stripePaymentIntentId: paymentIntent.id,
        },
        {
          onSuccess: () => {
            toast.success("✅ Payment Successful! Your booking is confirmed.");
            onSuccess();
          },
          onError: (err: any) => {
            console.error("❌ Confirm Payment Failed:", err);
            toast.error(
              "Payment was successful on Stripe, but failed to update on server. " +
              "Please contact support with your booking ID."
            );
          },
        }
      );
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-muted/50 rounded-xl p-5 border">
        <p className="text-xs font-medium text-muted-foreground mb-3">CARD INFORMATION</p>
        <CardElement
          options={{
            style: { base: { fontSize: "16px", color: "#1f2937" } },
          }}
        />
      </div>

      <Button
        onClick={handlePay}
        disabled={!stripe || processing || confirming}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
      >
        {processing || confirming ? (
          <>
            <Loader2 className="mr-2 animate-spin" size={20} />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2" size={20} />
            Pay ৳{amount.toLocaleString()} Securely
          </>
        )}
      </Button>
    </div>
  );
}

// ====================== MAIN PAYMENT PAGE ======================
export default function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);

  const { data: booking, isLoading: bookingLoading } = useBookingById(bookingId);
  const { mutate: createIntent, isPending: creating } = useCreatePaymentIntent();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  // ==================== CREATE PAYMENT INTENT ====================
  useEffect(() => {
    if (!booking || clientSecret || paid || creating) return;

    // Already paid
    if (booking.status === "CONFIRMED" || booking.payment?.status === "SUCCESS") {
      setPaid(true);
      return;
    }

    // Only allow payment for these statuses
    if (!["ACCEPTED", "PAYMENT_PENDING"].includes(booking.status)) return;

    console.log("🔄 Creating payment intent for booking:", bookingId);

    createIntent(bookingId, {
      onSuccess: (res: any) => {
        console.log("✅ Full Response from Backend:", res);

        const responseData = res?.data || res;

        if (responseData?.clientSecret) {
          setClientSecret(responseData.clientSecret);

          const newPaymentId = responseData.paymentId || 
                              responseData.paymentIntentId || 
                              responseData.id;

          if (newPaymentId) {
            setPaymentId(newPaymentId);
          }

          console.log("✅ Payment Intent Created Successfully!");
          console.log("Client Secret:", responseData.clientSecret);
          console.log("Payment ID:", newPaymentId);
        } else {
          console.error("❌ clientSecret not found in response!", responseData);
          toast.error("Failed to get payment details from server.");
        }
      },
      onError: (err: any) => {
        console.error("❌ Create Payment Intent Error:", err);
        toast.error(err?.message || "Failed to initialize payment. Please try again.");
      },
    });
  }, [booking, bookingId, clientSecret, paid, creating, createIntent]);

  // ==================== LOADING STATE ====================
  if (bookingLoading) {
    return <div className="p-8 text-center">Loading booking details...</div>;
  }

  if (!booking) {
    return <div className="text-center py-20">Booking not found</div>;
  }

  // ==================== ALREADY PAID STATE ====================
  if (booking.status === "CONFIRMED" || booking.payment?.status === "SUCCESS") {
    return (
      <div className="max-w-lg mx-auto text-center py-24 space-y-5">
        <CheckCircle size={60} className="mx-auto text-emerald-600" />
        <h2 className="text-2xl font-bold text-emerald-600">Payment Already Completed</h2>
        <p className="text-lg">This booking has already been paid and confirmed.</p>
        <p className="text-sm text-muted-foreground">
          Current Status: <StatusBadge status={booking.status} />
        </p>
        <Link href="/user/booking">
          <Button>Go to My Bookings</Button>
        </Link>
      </div>
    );
  }

  // ==================== INVALID STATUS ====================
  if (!["ACCEPTED", "PAYMENT_PENDING"].includes(booking.status)) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <AlertCircle size={50} className="mx-auto text-amber-500" />
        <h2 className="text-xl font-semibold">Payment Not Available</h2>
        <p>Payment is only allowed when booking status is Accepted or Payment Pending.</p>
        <p className="text-sm">Current Status: <StatusBadge status={booking.status} /></p>
        <Link href="/user/booking">
          <Button variant="outline">Back to My Bookings</Button>
        </Link>
      </div>
    );
  }

  // ==================== MAIN PAYMENT UI ====================
  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/user/booking/${bookingId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-sm text-muted-foreground">Secure payment for your booking</p>
        </div>
      </div>

      {/* Booking Summary */}
      <Card>
        <CardHeader><CardTitle>Booking Summary</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm pt-2">
          <div className="flex justify-between"><span className="text-muted-foreground">Property</span><strong>{booking.property.title}</strong></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{booking.property.area}, {booking.property.city}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Move-in</span><span>{new Date(booking.moveInDate).toLocaleDateString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tenants</span><span>{booking.numberOfTenants}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Monthly Rent</span><span>৳{booking.rentAmount.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Booking Fee</span><span>৳{booking.bookingFee.toLocaleString()}</span></div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-blue-700">৳{booking.totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={18} /> Secure Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {creating && (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin mx-auto mb-3" size={28} />
              <p>Preparing secure payment...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait a moment</p>
            </div>
          )}

          {!creating && clientSecret && paymentId ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                clientSecret={clientSecret}
                paymentId={paymentId}
                amount={booking.totalAmount}
                onSuccess={() => setPaid(true)}
              />
            </Elements>
          ) : (
            !creating && (
              <div className="py-12 text-center text-amber-600">
                <AlertCircle className="mx-auto mb-3" size={28} />
                <p>Preparing payment gateway...</p>
                <p className="text-xs mt-1">Please wait a moment</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}























// // test form
// "use client";

// import { use, useState, useEffect } from "react";
// import Link from "next/link";
// import { ArrowLeft, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
// import { toast } from "sonner";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";

// import {
//   useBookingById,
//   useCreatePaymentIntent,
//   useConfirmPayment,
// } from "@/hooks/user/useUserApi";
// import StatusBadge from "@/components/user/StatusBadge";

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

// // Stripe Payment Form Component
// function StripePaymentForm({
//   clientSecret,
//   paymentId,
//   amount,
//   onSuccess,
// }: {
//   clientSecret: string;
//   paymentId: string;
//   amount: number;
//   onSuccess: () => void;
// }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const { mutate: confirmPayment, isPending: confirming } = useConfirmPayment();
//   const [processing, setProcessing] = useState(false);

//   // const handlePay = async () => {
//   //   if (!stripe || !elements) return;
//   //   setProcessing(true);

//   //   const cardElement = elements.getElement(CardElement);
//   //   if (!cardElement) {
//   //     setProcessing(false);
//   //     return;
//   //   }

//   //   const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//   //     payment_method: { card: cardElement },
//   //   });

//   //   if (error) {
//   //     toast.error(error.message || "Payment failed");
//   //     setProcessing(false);
//   //     return;
//   //   }

//   //   if (paymentIntent?.status === "succeeded") {

//   //     if (!paymentId) {
//   //     toast.error("Payment ID is missing. Please try again.");
//   //     setProcessing(false);
//   //     return;
//   //   }
//   //     confirmPayment(
//   //       { paymentId, stripePaymentIntentId: paymentIntent.id },
//   //       {
//   //         onSuccess: () => {
//   //           toast.success("✅ Payment Successful! Your booking is confirmed.");
//   //           onSuccess();
//   //         },
//   //         onError: () => toast.error("Payment succeeded but update failed."),
//   //       }
//   //     );
//   //   }
//   //   setProcessing(false);
//   // };


//   // tested form:
// const handlePay = async () => {
//   if (!stripe || !elements) return;
//   setProcessing(true);

//   const cardElement = elements.getElement(CardElement);
//   if (!cardElement) {
//     setProcessing(false);
//     return;
//   }

//   const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//     payment_method: { card: cardElement },
//   });

//   if (error) {
//     toast.error(error.message || "Payment failed");
//     setProcessing(false);
//     return;
//   }

//   // Stripe Payment সফল হলে
//   if (paymentIntent?.status === "succeeded") {
    
//     // paymentId না থাকলে এড়িয়ে যাওয়া যাবে না
//     if (!paymentId) {
//       toast.error("Payment ID is missing. Please try again.");
//       setProcessing(false);
//       return;
//     }

//     // Server-কে জানাও যে পেমেন্ট হয়েছে
//     confirmPayment(
//       {
//         paymentId: paymentId,                    // Database Payment ID
//         stripePaymentIntentId: paymentIntent.id  // Stripe-এর ID
//       },
//       {
//         onSuccess: () => {
//           toast.success("✅ Payment Successful! Your booking is confirmed.");
//           onSuccess();        // Success screen দেখাবে
//         },
//         onError: (err: any) => {
//           console.error("❌ Confirm Payment Failed:", err);
//           toast.error(
//             "Payment was successful on Stripe, but failed to update on server. " +
//             "Please contact support with your booking ID."
//           );
//         },
//       }
//     );
//   }

//   setProcessing(false);
// };






//   return (
//     <div className="space-y-5">
//       <div className="bg-muted/50 rounded-xl p-5 border">
//         <p className="text-xs font-medium text-muted-foreground mb-3">CARD INFORMATION</p>
//         <CardElement
//           options={{
//             style: { base: { fontSize: "16px", color: "#1f2937" } },
//           }}
//         />
//       </div>

//       <Button
//         onClick={handlePay}
//         disabled={!stripe || processing || confirming}
//         className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
//       >
//         {processing || confirming ? (
//           <>
//             <Loader2 className="mr-2 animate-spin" size={20} />
//             Processing...
//           </>
//         ) : (
//           <>
//             <CreditCard className="mr-2" size={20} />
//             Pay ৳{amount.toLocaleString()} Securely
//           </>
//         )}
//       </Button>
//     </div>
//   );
// }

// // ====================== MAIN PAGE ======================
// export default function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
//   const { bookingId } = use(params);

//   const { data: booking, isLoading: bookingLoading } = useBookingById(bookingId);
//   const { mutate: createIntent, isPending: creating } = useCreatePaymentIntent();

//   const [clientSecret, setClientSecret] = useState<string | null>(null);
//   const [paymentId, setPaymentId] = useState<string | null>(null);
//   const [paid, setPaid] = useState(false);

//   // ==================== FIXED useEffect (এবার আর লুপ হবে না) ====================
//   useEffect(() => {
//     if (!booking || clientSecret || paid || creating) return;

//     if (!["ACCEPTED", "PAYMENT_PENDING"].includes(booking.status)) return;

//     if (booking.payment?.status === "SUCCESS") {
//       setPaid(true);
//       return;
//     }

//     console.log("🔄 Creating payment intent for booking:", bookingId);

 


//     createIntent(bookingId, {
//   onSuccess: (res: any) => {
//     console.log("✅ Full Response from Backend:", res);

//     // Handle both wrapped and unwrapped responses
//     const responseData = res?.data || res;

//     if (responseData?.clientSecret) {
//       setClientSecret(responseData.clientSecret);
      
//       // Use paymentId if available, otherwise fallback to paymentIntentId
//       const newPaymentId = responseData.paymentId || responseData.paymentIntentId || responseData.id;
      
//       if (newPaymentId) {
//         setPaymentId(newPaymentId);
//       }

//       console.log("✅ Payment Intent Created Successfully!");
//       console.log("Client Secret:", responseData.clientSecret);
//       console.log("Payment ID:", newPaymentId);
//     } else {
//       console.error("❌ clientSecret not found in response!", responseData);
//       toast.error("Failed to get payment details from server.");
//     }
//   },

//   onError: (err: any) => {
//     console.error("❌ Create Payment Intent Error:", err);
//     toast.error(
//       err?.message || 
//       err?.response?.data?.message || 
//       "Failed to initialize payment. Please try again."
//     );
//   },
// });





//   }, [booking, bookingId, clientSecret, paid, creating, createIntent]);

//   // Loading State
//   if (bookingLoading) {
//     return <div className="p-8 text-center">Loading booking details...</div>;
//   }

//   if (!booking) {
//     return <div className="text-center py-20">Booking not found</div>;
//   }

//   // Invalid Status
//   if (!["ACCEPTED", "PAYMENT_PENDING"].includes(booking.status)) {
//     return (
//       <div className="max-w-lg mx-auto text-center py-20 space-y-4">
//         <AlertCircle size={50} className="mx-auto text-amber-500" />
//         <h2 className="text-xl font-semibold">Payment Not Available</h2>
//         <p>Payment is only allowed when booking status is Accepted or Payment Pending.</p>
//         <p className="text-sm">Current Status: <StatusBadge status={booking.status} /></p>
//         <Link href="/user/booking">
//           <Button variant="outline">Back to My Bookings</Button>
//         </Link>
//       </div>
//     );
//   }

//   // Success State
//   if (paid || booking.payment?.status === "SUCCESS") {
//     return (
//       <div className="max-w-lg mx-auto text-center py-24 space-y-5">
//         <CheckCircle size={60} className="mx-auto text-emerald-600" />
//         <h2 className="text-2xl font-bold">Payment Successful!</h2>
//         <p>Your booking has been confirmed.</p>
//         <Link href="/user/booking">
//           <Button>Go to My Bookings</Button>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-lg mx-auto p-4 space-y-6">
//       <div className="flex items-center gap-3">
//         <Link href={`/user/booking/${bookingId}`}>
//           <Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button>
//         </Link>
//         <div>
//           <h1 className="text-2xl font-bold">Complete Payment</h1>
//           <p className="text-sm text-muted-foreground">Secure payment for your booking</p>
//         </div>
//       </div>

//       {/* Booking Summary */}
//       <Card>
//         <CardHeader><CardTitle>Booking Summary</CardTitle></CardHeader>
//         <CardContent className="space-y-3 text-sm pt-2">
//           <div className="flex justify-between"><span className="text-muted-foreground">Property</span><strong>{booking.property.title}</strong></div>
//           <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{booking.property.area}, {booking.property.city}</span></div>
//           <div className="flex justify-between"><span className="text-muted-foreground">Move-in</span><span>{new Date(booking.moveInDate).toLocaleDateString()}</span></div>
//           <div className="flex justify-between"><span className="text-muted-foreground">Tenants</span><span>{booking.numberOfTenants}</span></div>
//           <Separator />
//           <div className="flex justify-between"><span className="text-muted-foreground">Monthly Rent</span><span>৳{booking.rentAmount.toLocaleString()}</span></div>
//           <div className="flex justify-between"><span className="text-muted-foreground">Booking Fee</span><span>৳{booking.bookingFee.toLocaleString()}</span></div>
//           <Separator />
//           <div className="flex justify-between text-lg font-bold">
//             <span>Total Amount</span>
//             <span className="text-blue-700">৳{booking.totalAmount.toLocaleString()}</span>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Payment Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <CreditCard size={18} /> Secure Payment
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="pt-2">
//           {creating && (
//             <div className="py-12 text-center">
//               <Loader2 className="animate-spin mx-auto mb-3" size={28} />
//               <p>Preparing secure payment...</p>
//               <p className="text-xs text-muted-foreground mt-1">Please wait a moment</p>
//             </div>
//           )}

//           {!creating && clientSecret && paymentId ? (
//             <Elements stripe={stripePromise} options={{ clientSecret }}>
//               <StripePaymentForm
//                 clientSecret={clientSecret}
//                 paymentId={paymentId}
//                 amount={booking.totalAmount}
//                 onSuccess={() => setPaid(true)}
//               />
//             </Elements>
//           ) : (
//             !creating && (
//               <div className="py-12 text-center text-amber-600">
//                 <AlertCircle className="mx-auto mb-3" size={28} />
//                 <p>Preparing payment gateway...</p>
//                 <p className="text-xs mt-1">Please wait a moment</p>
//               </div>
//             )
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


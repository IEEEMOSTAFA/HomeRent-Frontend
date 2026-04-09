// // src/app/(commonRoute)/property/[id]/_components/BookingCard.tsx
// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// export default function BookingCard({ property }: { property: any }) {
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleBooking = async () => {
//     // ✅ Validation
//     if (!property?.id) {
//       toast.error("Property information missing");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const bookingData = {
//         propertyId: property.id,
//         moveInDate: new Date(),
//         numberOfTenants: 1,
//       };

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bookings`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include", // for auth cookies
//           body: JSON.stringify(bookingData),
//         }
//       );

//       if (res.ok) {
//         toast.success("Booking request submitted!");
//       } else {
//         const error = await res.json();
//         toast.error(error.message || "Booking failed");
//       }
//     } catch (error) {
//       console.error("Booking error:", error);
//       toast.error("Something went wrong");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 mt-8">
//       <h3 className="text-xl font-semibold mb-4">Book This Property</h3>
      
//       <div className="space-y-3">
//         <div>
//           <span className="text-gray-600">Monthly Rent:</span>
//           <span className="font-bold ml-2">৳{property.price?.toLocaleString()}</span>
//         </div>
        
//         <Button 
//           onClick={handleBooking} 
//           disabled={isSubmitting}
//           className="w-full"
//         >
//           {isSubmitting ? "Submitting..." : "Request to Book"}
//         </Button>
//       </div>
//     </div>
//   );
// }
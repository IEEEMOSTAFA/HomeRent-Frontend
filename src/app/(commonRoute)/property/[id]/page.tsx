"use client";
// src/app/(commonRoute)/property/[id]/page.tsx

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, BedDouble, Bath, Ruler,
  Users, ChevronLeft, BadgeCheck, Star,
} from "lucide-react";

import { Button }             from "@/components/ui/button";
import { Badge }              from "@/components/ui/badge";
import { Card, CardContent }  from "@/components/ui/card";
import { Skeleton }           from "@/components/ui/skeleton";
import { Textarea }           from "@/components/ui/textarea";
import { Input }              from "@/components/ui/input";
import { Label }              from "@/components/ui/label";
import { useQuery }           from "@tanstack/react-query";
import { apiFetch }           from "@/lib/api";
import { useCreateBooking, type Property } from "@/hooks/user/useUserApi";

// ✅ Custom hook: unwraps { data: property } OR returns property directly
function usePropertyDetail(id: string) {
  return useQuery<Property>({
    queryKey: ["property", "detail", id],
    queryFn: async () => {
      const res = await apiFetch<any>(`/properties/${id}`);
      return res?.data ?? res;
    },
    enabled: !!id,
  });
}

export default function PropertyDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const { data: property, isLoading } = usePropertyDetail(id);
  const createBooking = useCreateBooking();

  const [moveInDate,      setMoveInDate]      = useState("");
  const [numberOfTenants, setNumberOfTenants] = useState(1);
  const [message,         setMessage]         = useState("");
  const [activeImg,       setActiveImg]       = useState(0);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Property not found.</p>
        <Link href="/property"><Button variant="link" className="mt-2">Back to listings</Button></Link>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!moveInDate) return alert("Please select a move-in date.");
    try {
      // ✅ Fix: input type="date" returns "2025-04-15"
      // Backend Zod expects ISO datetime: "2025-04-15T00:00:00.000Z"
      const moveInDateISO = new Date(moveInDate).toISOString();
      await createBooking.mutateAsync({ propertyId: property.id, moveInDate: moveInDateISO, message: message || undefined, numberOfTenants });
      router.push("/user/booking");
    } catch (err: any) {
      alert(err?.message || "Booking failed. Please try again.");
    }
  };

  // ✅ Safe fallbacks — toLocaleString never throws on undefined
  const rentAmount = property.rentAmount ?? 0;
  const bookingFee = property.bookingFee ?? 0;
  const images     = property.images?.length ? property.images : ["/placeholder.jpg"];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

      <Link href="/property" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} /> Back to listings
      </Link>

      {/* Images */}
      <div className="space-y-2">
        <div className="relative h-80 w-full rounded-2xl overflow-hidden bg-muted">
          <Image src={images[activeImg]} alt={property.title} fill className="object-cover" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-primary" : "border-transparent"}`}>
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{property.title}</h1>
              <Badge variant={property.status === "APPROVED" ? "default" : "secondary"}>{property.status}</Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin size={14} /> {property.area}, {property.city}
            </div>
            {(property.rating ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-sm mt-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{property.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({property.totalReviews} reviews)</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1"><BedDouble size={15} /> {property.bedrooms ?? "—"} Bed</span>
            <span className="flex items-center gap-1"><Bath size={15} /> {property.bathrooms ?? "—"} Bath</span>
            {property.size && <span className="flex items-center gap-1"><Ruler size={15} /> {property.size} sqft</span>}
            <span className="flex items-center gap-1"><Users size={15} /> For: {property.availableFor}</span>
          </div>

          <div>
            <h2 className="font-semibold mb-2">About this property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {property.owner && (
            <div className="border rounded-xl p-4 flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {property.owner.image
                  ? <Image src={property.owner.image} alt={property.owner.name} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">{property.owner.name?.[0]}</div>
                }
              </div>
              <div>
                <div className="flex items-center gap-1 font-medium text-sm">
                  {property.owner.name}
                  {property.owner.ownerProfile?.verified && <BadgeCheck size={14} className="text-blue-500" />}
                </div>
                <p className="text-xs text-muted-foreground">{property.owner.ownerProfile?.totalProperties ?? 0} properties listed</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking Card */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-2xl font-bold">
                  ৳{rentAmount.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Booking fee: ৳{bookingFee.toLocaleString()}{property.isNegotiable && " · Negotiable"}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="moveInDate" className="text-xs">Move-in Date *</Label>
                  <Input id="moveInDate" type="date" value={moveInDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setMoveInDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="tenants" className="text-xs">Number of Tenants</Label>
                  <Input id="tenants" type="number" min={1} max={10} value={numberOfTenants}
                    onChange={(e) => setNumberOfTenants(Number(e.target.value))} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message" className="text-xs">Message to Owner (optional)</Label>
                  <Textarea id="message" placeholder="Tell the owner about yourself..."
                    value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="mt-1 resize-none" />
                </div>
              </div>

              <Button className="w-full" onClick={handleBooking}
                disabled={createBooking.isPending || property.status !== "APPROVED"}>
                {createBooking.isPending ? "Submitting..." : "Request Booking"}
              </Button>

              {property.status !== "APPROVED" && (
                <p className="text-xs text-center text-muted-foreground">This property is not available for booking.</p>
              )}
              {property.availableFrom && (
                <div className="text-xs text-muted-foreground text-center">
                  Available from: {new Date(property.availableFrom).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}















// "use client";
// // src/app/(commonRoute)/property/[id]/page.tsx

// import { useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   MapPin, BedDouble, Bath, Ruler,
//   Users, ChevronLeft, BadgeCheck, Star,
// } from "lucide-react";

// import { Button }             from "@/components/ui/button";
// import { Badge }              from "@/components/ui/badge";
// import { Card, CardContent }  from "@/components/ui/card";
// import { Skeleton }           from "@/components/ui/skeleton";
// import { Textarea }           from "@/components/ui/textarea";
// import { Input }              from "@/components/ui/input";
// import { Label }              from "@/components/ui/label";
// import { useQuery }           from "@tanstack/react-query";
// import { apiFetch }           from "@/lib/api";
// import { useCreateBooking, type Property } from "@/hooks/user/useUserApi";

// // ✅ Custom hook: unwraps { data: property } OR returns property directly
// function usePropertyDetail(id: string) {
//   return useQuery<Property>({
//     queryKey: ["property", "detail", id],
//     queryFn: async () => {
//       const res = await apiFetch<any>(`/properties/${id}`);
//       return res?.data ?? res;
//     },
//     enabled: !!id,
//   });
// }

// export default function PropertyDetailPage() {
//   const { id }  = useParams<{ id: string }>();
//   const router  = useRouter();

//   const { data: property, isLoading } = usePropertyDetail(id);
//   const createBooking = useCreateBooking();

//   const [moveInDate,      setMoveInDate]      = useState("");
//   const [numberOfTenants, setNumberOfTenants] = useState(1);
//   const [message,         setMessage]         = useState("");
//   const [activeImg,       setActiveImg]       = useState(0);

//   if (isLoading) {
//     return (
//       <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
//         <Skeleton className="h-80 w-full rounded-2xl" />
//         <Skeleton className="h-8 w-1/2" />
//         <Skeleton className="h-4 w-1/3" />
//       </div>
//     );
//   }

//   if (!property) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-muted-foreground">Property not found.</p>
//         <Link href="/property"><Button variant="link" className="mt-2">Back to listings</Button></Link>
//       </div>
//     );
//   }

//   const handleBooking = async () => {
//     if (!moveInDate) return alert("Please select a move-in date.");
//     try {
//       await createBooking.mutateAsync({ propertyId: property.id, moveInDate, message: message || undefined, numberOfTenants });
//       router.push("/user/booking");
//     } catch (err: any) {
//       alert(err?.message || "Booking failed. Please try again.");
//     }
//   };

//   // ✅ Safe fallbacks — toLocaleString never throws on undefined
//   const rentAmount = property.rentAmount ?? 0;
//   const bookingFee = property.bookingFee ?? 0;
//   const images     = property.images?.length ? property.images : ["/placeholder.jpg"];

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

//       <Link href="/property" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
//         <ChevronLeft size={16} /> Back to listings
//       </Link>

//       {/* Images */}
//       <div className="space-y-2">
//         <div className="relative h-80 w-full rounded-2xl overflow-hidden bg-muted">
//           <Image src={images[activeImg]} alt={property.title} fill className="object-cover" />
//         </div>
//         {images.length > 1 && (
//           <div className="flex gap-2 overflow-x-auto">
//             {images.map((img, i) => (
//               <button key={i} onClick={() => setActiveImg(i)}
//                 className={`relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-primary" : "border-transparent"}`}>
//                 <Image src={img} alt="" fill className="object-cover" />
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//         {/* Left: Info */}
//         <div className="lg:col-span-2 space-y-6">
//           <div>
//             <div className="flex items-start justify-between gap-3 flex-wrap">
//               <h1 className="text-2xl font-bold">{property.title}</h1>
//               <Badge variant={property.status === "APPROVED" ? "default" : "secondary"}>{property.status}</Badge>
//             </div>
//             <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
//               <MapPin size={14} /> {property.area}, {property.city}
//             </div>
//             {(property.rating ?? 0) > 0 && (
//               <div className="flex items-center gap-1 text-sm mt-1">
//                 <Star size={14} className="fill-yellow-400 text-yellow-400" />
//                 <span className="font-medium">{property.rating.toFixed(1)}</span>
//                 <span className="text-muted-foreground">({property.totalReviews} reviews)</span>
//               </div>
//             )}
//           </div>

//           <div className="flex flex-wrap gap-4 text-sm">
//             <span className="flex items-center gap-1"><BedDouble size={15} /> {property.bedrooms ?? "—"} Bed</span>
//             <span className="flex items-center gap-1"><Bath size={15} /> {property.bathrooms ?? "—"} Bath</span>
//             {property.size && <span className="flex items-center gap-1"><Ruler size={15} /> {property.size} sqft</span>}
//             <span className="flex items-center gap-1"><Users size={15} /> For: {property.availableFor}</span>
//           </div>

//           <div>
//             <h2 className="font-semibold mb-2">About this property</h2>
//             <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
//           </div>

//           {property.owner && (
//             <div className="border rounded-xl p-4 flex items-center gap-3">
//               <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
//                 {property.owner.image
//                   ? <Image src={property.owner.image} alt={property.owner.name} fill className="object-cover" />
//                   : <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">{property.owner.name?.[0]}</div>
//                 }
//               </div>
//               <div>
//                 <div className="flex items-center gap-1 font-medium text-sm">
//                   {property.owner.name}
//                   {property.owner.ownerProfile?.verified && <BadgeCheck size={14} className="text-blue-500" />}
//                 </div>
//                 <p className="text-xs text-muted-foreground">{property.owner.ownerProfile?.totalProperties ?? 0} properties listed</p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Right: Booking Card */}
//         <div>
//           <Card className="sticky top-24">
//             <CardContent className="p-5 space-y-4">
//               <div>
//                 <p className="text-2xl font-bold">
//                   ৳{rentAmount.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
//                 </p>
//                 <p className="text-xs text-muted-foreground mt-0.5">
//                   Booking fee: ৳{bookingFee.toLocaleString()}{property.isNegotiable && " · Negotiable"}
//                 </p>
//               </div>

//               <div className="space-y-3">
//                 <div>
//                   <Label htmlFor="moveInDate" className="text-xs">Move-in Date *</Label>
//                   <Input id="moveInDate" type="date" value={moveInDate}
//                     min={new Date().toISOString().split("T")[0]}
//                     onChange={(e) => setMoveInDate(e.target.value)} className="mt-1" />
//                 </div>
//                 <div>
//                   <Label htmlFor="tenants" className="text-xs">Number of Tenants</Label>
//                   <Input id="tenants" type="number" min={1} max={10} value={numberOfTenants}
//                     onChange={(e) => setNumberOfTenants(Number(e.target.value))} className="mt-1" />
//                 </div>
//                 <div>
//                   <Label htmlFor="message" className="text-xs">Message to Owner (optional)</Label>
//                   <Textarea id="message" placeholder="Tell the owner about yourself..."
//                     value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="mt-1 resize-none" />
//                 </div>
//               </div>

//               <Button className="w-full" onClick={handleBooking}
//                 disabled={createBooking.isPending || property.status !== "APPROVED"}>
//                 {createBooking.isPending ? "Submitting..." : "Request Booking"}
//               </Button>

//               {property.status !== "APPROVED" && (
//                 <p className="text-xs text-center text-muted-foreground">This property is not available for booking.</p>
//               )}
//               {property.availableFrom && (
//                 <div className="text-xs text-muted-foreground text-center">
//                   Available from: {new Date(property.availableFrom).toLocaleDateString()}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }















// "use client";

// import React, { useState } from "react";
// import { use } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import {
//   ArrowLeft,
//   MapPin,
//   ChevronLeft,
//   ChevronRight,
//   BedDouble,
//   Bath,
//   Maximize2,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Separator } from "@/components/ui/separator";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toast } from "sonner";

// import {
//   usePublicProperty,
//   useCreateBooking,
//   type Property,
// } from "@/hooks/user/useUserApi";

// // ─── Gallery Component ───────────────────────────────────────────────────────

// function Gallery({ images = [], title }: { images: string[]; title: string }) {
//   const [lightboxOpen, setLightboxOpen] = useState(false);
//   const [activeIdx, setActiveIdx] = useState(0);
//   const shown = images.slice(0, 3);

//   const prev = () => setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1));
//   const next = () => setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1));

//   return (
//     <>
//       <div className="mb-8 grid grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl h-[400px]">
//         <div
//           className="col-span-2 row-span-2 relative bg-muted cursor-pointer"
//           onClick={() => { setActiveIdx(0); setLightboxOpen(true); }}
//         >
//           {shown[0] ? (
//             <Image src={shown[0]} alt={title} fill className="object-cover" priority />
//           ) : (
//             <div className="flex h-full items-center justify-center bg-muted">No Image</div>
//           )}
//         </div>
//         {[1, 2].map((idx) => (
//           <div
//             key={idx}
//             className="relative bg-muted cursor-pointer"
//             onClick={() => { setActiveIdx(idx); setLightboxOpen(true); }}
//           >
//             {shown[idx] ? (
//               <Image src={shown[idx]} alt={`${title} ${idx + 1}`} fill className="object-cover" />
//             ) : (
//               <div className="flex h-full items-center justify-center bg-muted text-xs">No Image</div>
//             )}
//           </div>
//         ))}
//       </div>

//       <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
//         <DialogContent className="max-w-3xl p-0 bg-black border-none max-h-[90vh]">
//           <div className="relative h-[70vh] flex items-center justify-center">
//             {images[activeIdx] && (
//               <Image src={images[activeIdx]} alt={`Photo ${activeIdx + 1}`} fill className="object-contain" />
//             )}
//             <Button
//               size="icon"
//               variant="ghost"
//               className="absolute left-3 text-white hover:bg-white/20"
//               onClick={prev}
//             >
//               <ChevronLeft size={24} />
//             </Button>
//             <Button
//               size="icon"
//               variant="ghost"
//               className="absolute right-3 text-white hover:bg-white/20"
//               onClick={next}
//             >
//               <ChevronRight size={24} />
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

// // ─── Booking Card Component ─────────────────────────────────────────────────

// // function BookingCard({ property }: { property: Property }) {
// //   const createBooking = useCreateBooking();
// //   const [open, setOpen] = useState(false);
// //   const [moveInDate, setMoveInDate] = useState("");
// //   const [numberOfTenants, setNumberOfTenants] = useState(1);
// //   const [message, setMessage] = useState("");

// //   const handleBooking = async () => {
// //     if (!moveInDate) {
// //       toast.error("Move-in date required", {
// //         description: "দয়া করে move-in তারিখ নির্বাচন করুন",
// //       });
// //       return;
// //     }

// //     try {
// //       await createBooking.mutateAsync({
// //         propertyId: property.id,
// //         moveInDate,
// //         numberOfTenants,
// //         message: message || undefined,
// //       });

// //       toast.success("Booking request sent!", {
// //         description: "আপনার বুকিং রিকোয়েস্ট পাঠানো হয়েছে।",
// //       });
// //       setOpen(false);
// //     } catch (err) {
// //       toast.error("Booking failed", {
// //         description: "Booking করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
// //       });
// //     }
// //   };

// //   return (
// //     <Card className="sticky top-6 shadow-md">
// //       <CardContent className="p-6 space-y-5">
// //         <div>
// //           <p className="text-3xl font-bold">৳{property.rentAmount}</p>
// //           <p className="text-xs text-muted-foreground">per month</p>
// //         </div>

// //         <Separator />

// //         <Dialog open={open} onOpenChange={setOpen}>
// //           <DialogTrigger asChild>
// //             <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
// //               Book Now
// //             </Button>
// //           </DialogTrigger>
// //           <DialogContent>
// //             <DialogHeader>
// //               <DialogTitle>Book {property.title}</DialogTitle>
// //             </DialogHeader>

// //             <div className="space-y-4 py-4">
// //               <div>
// //                 <Label>Move-in Date</Label>
// //                 <Input
// //                   type="date"
// //                   value={moveInDate}
// //                   onChange={(e) => setMoveInDate(e.target.value)}
// //                 />
// //               </div>

// //               <div>
// //                 <Label>Number of Tenants</Label>
// //                 <Select value={String(numberOfTenants)} onValueChange={(v) => setNumberOfTenants(Number(v))}>
// //                   <SelectTrigger>
// //                     <SelectValue />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {[1, 2, 3, 4, 5].map((n) => (
// //                       <SelectItem key={n} value={String(n)}>{n} Tenant{n > 1 ? "s" : ""}</SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               </div>

// //               <div>
// //                 <Label>Message to Owner (optional)</Label>
// //                 <Textarea
// //                   placeholder="আমি ফ্যামিলি নিয়ে থাকবো..."
// //                   value={message}
// //                   onChange={(e) => setMessage(e.target.value)}
// //                 />
// //               </div>
// //             </div>

// //             <Button onClick={handleBooking} disabled={createBooking.isPending} className="w-full">
// //               {createBooking.isPending ? "Sending..." : "Confirm Booking Request"}
// //             </Button>
// //           </DialogContent>
// //         </Dialog>

// //         <Button variant="outline" className="w-full">
// //           Save for later
// //         </Button>
// //       </CardContent>
// //     </Card>
// //   );
// // }









// function BookingCard({ property }: { property: Property }) {
//   const createBooking = useCreateBooking();
//   const [open, setOpen] = useState(false);
//   const [moveInDate, setMoveInDate] = useState("");
//   const [numberOfTenants, setNumberOfTenants] = useState(1);
//   const [message, setMessage] = useState("");




//   const handleBooking = async () => {
//   // ✅ Step 1: property object থেকে id নাও
//   const propertyId = property?.id;

//   if (!propertyId) {
//     console.error("Property ID is undefined:", property); // debug
//     toast({
//       variant: "destructive",
//       description: "Please refresh the page and try again."
//     });
//     return;
//   }
//   return (
//     <Card className="sticky top-6 shadow-md">
//       <CardContent className="p-6 space-y-5">
//         <div>
//           <p className="text-3xl font-bold">৳{property.rentAmount}</p>
//           <p className="text-xs text-muted-foreground">per month</p>
//         </div>

//         <Separator />

//         <Dialog open={open} onOpenChange={setOpen}>
//           <DialogTrigger asChild>
//             <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
//               Book Now
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Book {property.title}</DialogTitle>
//             </DialogHeader>

//             <div className="space-y-4 py-4">
//               <div>
//                 <Label>Move-in Date</Label>
//                 <Input
//                   type="date"
//                   value={moveInDate}
//                   onChange={(e) => setMoveInDate(e.target.value)}
//                   min={new Date().toISOString().split('T')[0]} // ✅ Can't select past dates
//                 />
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Select your preferred move-in date
//                 </p>
//               </div>

//               <div>
//                 <Label>Number of Tenants</Label>
//                 <Select value={String(numberOfTenants)} onValueChange={(v) => setNumberOfTenants(Number(v))}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {[1, 2, 3, 4, 5].map((n) => (
//                       <SelectItem key={n} value={String(n)}>
//                         {n} Tenant{n > 1 ? "s" : ""}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Message to Owner (optional)</Label>
//                 <Textarea
//                   placeholder="আমি ফ্যামিলি নিয়ে থাকবো..."
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   rows={3}
//                 />
//               </div>
//             </div>

//             <Button 
//               onClick={handleBooking} 
//               disabled={createBooking.isPending} 
//               className="w-full"
//             >
//               {createBooking.isPending ? "Sending..." : "Confirm Booking Request"}
//             </Button>
//           </DialogContent>
//         </Dialog>

//         <Button variant="outline" className="w-full">
//           Save for later
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }
// // ─── Main Page ───────────────────────────────────────────────────────────────

// export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = use(params);
//   const { data: property, isLoading, error } = usePublicProperty(id);

//   if (isLoading) return <Skeleton className="h-screen w-full" />;

//   if (error || !property) {
//     return (
//       <div className="flex flex-col items-center justify-center py-32">
//         <p className="text-2xl font-semibold">Property not found</p>
//         <Link href="/property">
//           <Button variant="outline" className="mt-4">Browse all properties</Button>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto px-4 pb-16 pt-6">
//       {/* Back + Share */}
//       <div className="flex justify-between mb-6">
//         <Link href="/property" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
//           <ArrowLeft size={18} /> Back to properties
//         </Link>
//       </div>

//       <Gallery images={property.images || []} title={property.title} />

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
//         {/* Left Content */}
//         <div className="lg:col-span-2 space-y-8">
//           <div>
//             <div className="flex gap-2 mb-3">
//               <Badge>Available</Badge>
//               {/* <Badge variant="secondary">{property.type.replace("_", " ")}</Badge> */}
//               <Badge variant="secondary">
//                 {property.type?.replace("_", " ") || "Not specified"}
//               </Badge>
//             </div>
//             <h1 className="text-4xl font-bold">{property.title}</h1>
//             <div className="flex items-center gap-1 mt-2 text-muted-foreground">
//               <MapPin size={16} />
//               {property.area}, {property.city}
//             </div>
//           </div>

//           <div className="grid grid-cols-3 gap-4">
//             <Card>
//               <CardContent className="p-4 text-center">
//                 <BedDouble className="mx-auto mb-2" size={28} />
//                 <p className="font-semibold">{property.bedrooms} Bedrooms</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4 text-center">
//                 <Bath className="mx-auto mb-2" size={28} />
//                 <p className="font-semibold">{property.bathrooms} Bathrooms</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4 text-center">
//                 <Maximize2 className="mx-auto mb-2" size={28} />
//                 <p className="font-semibold">{property.size || "—"} sqft</p>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="prose">
//             <p>{property.description}</p>
//           </div>
//         </div>

//         {/* Right Sidebar - Booking */}
//         <BookingCard property={property} />
//       </div>
//     </div>
//   );
// }
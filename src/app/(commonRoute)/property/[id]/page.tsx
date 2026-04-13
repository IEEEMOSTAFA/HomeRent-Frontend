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


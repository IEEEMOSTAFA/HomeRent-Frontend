"use client";
// src/app/(dashboardRoute)/owner/properties/[id]/page.tsx
// API: GET /api/owner/properties/:id

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Pencil, MapPin, BedDouble, Bath,
  SquareIcon, Calendar, Users, Star, Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
// import StatusBadge from "../../_components/StatusBadge";
import { useOwnerProperty } from "@/hooks/owner/useOwnerApi";
import StatusBadge from "@/components/owner/StatusBadge";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: p, isLoading } = useOwnerProperty(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!p) {
    return <div className="text-center py-20 text-muted-foreground">Property not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/owner/properties">
            <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft size={17} /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold line-clamp-1">{p.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={p.status} />
              <Badge variant="secondary" className="text-[10px]">{p.type.replace("_", " ")}</Badge>
            </div>
          </div>
        </div>
        <Link href={`/owner/properties/${id}/edit`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50">
            <Pencil size={13} /> Edit
          </Button>
        </Link>
      </div>

      {/* Images */}
      {p.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
          {p.images.slice(0, 3).map((img, i) => (
            <div key={i} className={`relative ${i === 0 ? "col-span-2" : ""} h-52`}>
              <Image src={img} alt={`img-${i}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Overview */}
      <Card className="shadow-none">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin size={14} /> {p.address}, {p.area}, {p.city}
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              ৳{p.rentAmount.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { icon: <BedDouble size={16} />,    label: "Bedrooms",  val: p.bedrooms },
              { icon: <Bath size={16} />,          label: "Bathrooms", val: p.bathrooms },
              { icon: <SquareIcon size={16} />,    label: "Size",      val: p.size ? `${p.size} sqft` : "—" },
              { icon: <Eye size={16} />,           label: "Views",     val: p.views },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-muted-foreground flex justify-center mb-1">{item.icon}</div>
                <p className="text-sm font-semibold">{item.val}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          {p.isNegotiable && (
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
              ✓ Rent negotiable
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="shadow-none">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="shadow-none">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Pricing Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Monthly Rent",    val: `৳${p.rentAmount.toLocaleString()}` },
              { label: "Advance Deposit", val: `৳${p.advanceDeposit.toLocaleString()}` },
              { label: "Booking Fee",     val: `৳${p.bookingFee.toLocaleString()}` },
            ].map((item) => (
              <div key={item.label} className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-base font-bold mt-1">{item.val}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className="shadow-none">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Availability</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={14} />
            Available from: <strong className="text-foreground">
              {new Date(p.availableFrom).toLocaleDateString()}
            </strong>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={14} />
            Suitable for: <strong className="text-foreground">{p.availableFor}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Rating */}
      {p.totalReviews > 0 && (
        <Card className="shadow-none">
          <CardContent className="p-5 flex items-center gap-3">
            <Star size={20} className="text-amber-400 fill-amber-400" />
            <div>
              <p className="font-semibold">{p.rating.toFixed(1)} / 5.0</p>
              <p className="text-xs text-muted-foreground">{p.totalReviews} reviews</p>
            </div>
            <Link href={`/owner/reviews`} className="ml-auto">
              <Button variant="ghost" size="sm" className="text-xs">View reviews</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Rejection reason */}
      {p.status === "REJECTED" && p.rejectionReason && (
        <Card className="shadow-none border-destructive/40 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-destructive mb-1">Rejection Reason</p>
            <p className="text-sm text-destructive/80">{p.rejectionReason}</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
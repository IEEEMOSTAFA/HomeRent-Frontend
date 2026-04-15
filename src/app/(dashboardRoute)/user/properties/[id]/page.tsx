"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, BedDouble, Bath, Calendar, Star, Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { usePublicProperty } from "@/hooks/user/useUserApi";   // ← React Query hook ব্যবহার করছি

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);   // ✅ Next.js App Router requirement

  // React Query দিয়ে data fetch করছি (সবচেয়ে ভালো প্র্যাকটিস)
  const { data: propertyResponse, isLoading, error } = usePublicProperty(id);

  // propertyResponse is already typed as Property directly
  const property = propertyResponse;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <Skeleton className="h-[500px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h2 className="text-2xl font-semibold mb-2">Property Not Found</h2>
        <p className="text-muted-foreground mb-6">The property you are looking for does not exist or has been removed.</p>
        <Link href="/properties">
          <Button>Browse All Properties</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pb-20">
      {/* Back Button */}
      <Link href="/properties" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={18} /> Back to Properties
      </Link>

      {/* Hero Image */}
      <div className="relative h-[520px] rounded-3xl overflow-hidden mb-10 shadow-xl">
        <Image
          src={property.images?.[0] || "/placeholder-property.jpg"}
          alt={property.title}
          fill
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-bold tracking-tight">{property.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-lg">
            <MapPin size={20} />
            {property.area}, {property.city}
          </div>
        </div>

        <div className="absolute top-6 right-6">
          <Badge className="bg-black/70 text-white text-sm px-4 py-1">
            {property.type.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Info */}
        <div className="lg:col-span-8 space-y-10">
          <div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BedDouble size={18} /> {property.bedrooms} Bedrooms
              </div>
              <div className="flex items-center gap-1">
                <Bath size={18} /> {property.bathrooms} Bathrooms
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={18} /> Available from {new Date(property.availableFrom).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          </div>
        </div>

        {/* Sidebar - Price & Action */}
        <div className="lg:col-span-4">
          <Card className="sticky top-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-emerald-600">
                ৳{property.rentAmount.toLocaleString()}<span className="text-xl font-normal text-muted-foreground">/month</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button size="lg" className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700">
                Book This Property
              </Button>

              <Button variant="outline" size="lg" className="w-full h-12">
                <Heart className="mr-2" size={18} /> Save for Later
              </Button>

              <div className="pt-4 border-t text-sm text-muted-foreground space-y-2">
                <p>✓ Verified Property</p>
                <p>✓ Instant Booking Available</p>
                <p>✓ Secure Payment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
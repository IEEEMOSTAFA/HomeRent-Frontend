"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { use } from "react";
import {
  ArrowLeft, MapPin, Star, Heart, Wifi, Shield, Car,
  Zap, Building2, TreePine, Calendar, MessageCircle,
  CheckCircle2, Share2, Flag, ChevronLeft, ChevronRight,
} from "lucide-react";

import { Button }                       from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge }                        from "@/components/ui/badge";
import { Skeleton }                     from "@/components/ui/skeleton";
import { Separator }                    from "@/components/ui/separator";
import { Avatar, AvatarFallback }       from "@/components/ui/avatar";
import { Toggle }                       from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea }  from "@/components/ui/scroll-area";
import { Progress }    from "@/components/ui/progress";
import { cn }          from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  comment: string;
}

interface Property {
  _id: string;
  title: string;
  description: string;
  type: string;
  area: string;
  city: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  floor?: number;
  images?: string[];
  amenities?: string[];
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  ownerName?: string;
  ownerSince?: string;
  ownerListings?: number;
  ownerResponseRate?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  available?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi:      <Wifi size={14} />,
  security:  <Shield size={14} />,
  parking:   <Car size={14} />,
  generator: <Zap size={14} />,
  lift:      <Building2 size={14} />,
  rooftop:   <TreePine size={14} />,
};

const DURATION_OPTIONS = [
  { label: "6 mo",  months: 6  },
  { label: "12 mo", months: 12 },
  { label: "24 mo", months: 24 },
];

const SERVICE_CHARGE = 1_500;
const ADVANCE_MONTHS = 2;

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    author: "Nadia Islam",
    initials: "NI",
    rating: 5,
    date: "March 2024",
    comment: "Excellent location and very responsive owner. The apartment was exactly as described.",
  },
  {
    id: "2",
    author: "Tarek Hossain",
    initials: "TH",
    rating: 4,
    date: "January 2024",
    comment: "Great space and clean. Minor issues with the elevator but overall very good.",
  },
];

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/25"
          )}
        />
      ))}
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <Card className="text-center py-4">
      <CardContent className="p-0 flex flex-col items-center gap-1">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xl font-semibold">{value}</span>
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function FeeRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between text-sm", bold ? "font-semibold" : "text-muted-foreground")}>
      <span className={bold ? "text-foreground" : ""}>{label}</span>
      <span className={bold ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}

// ─── Gallery with Dialog lightbox ─────────────────────────────────────────────

function Gallery({ images = [], title }: { images: string[]; title: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx]       = useState(0);
  const shown = images.slice(0, 3);

  const prev = () => setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  const PlaceholderImg = ({ small = false }: { small?: boolean }) => (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <svg
        width={small ? 28 : 52}
        height={small ? 28 : 52}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="opacity-20"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );

  return (
    <>
      <div className="mb-8 grid grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl h-[400px]">
        {/* Hero */}
        <div className="col-span-2 row-span-2 relative bg-muted cursor-pointer"
          onClick={() => { setActiveIdx(0); setLightboxOpen(true); }}>
          {shown[0]
            ? <Image src={shown[0]} alt={title} fill className="object-cover hover:brightness-95 transition-all" priority sizes="55vw" />
            : <PlaceholderImg />}
        </div>

        {/* Thumbs */}
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="relative bg-muted cursor-pointer"
            onClick={() => { setActiveIdx(idx); setLightboxOpen(true); }}
          >
            {shown[idx]
              ? <Image src={shown[idx]} alt={`${title} ${idx + 1}`} fill className="object-cover hover:brightness-95 transition-all" sizes="20vw" />
              : <PlaceholderImg small />}
            {idx === 2 && images.length > 3 && (
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                <span className="text-white text-sm font-medium">+{images.length - 3} photos</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{title} — Photo gallery</DialogTitle>
          </DialogHeader>
          <div className="relative h-[70vh] flex items-center justify-center">
            {images[activeIdx]
              ? <Image src={images[activeIdx]} alt={`Photo ${activeIdx + 1}`} fill className="object-contain" sizes="80vw" />
              : <PlaceholderImg />}
            <Button size="icon" variant="ghost" className="absolute left-3 text-white hover:bg-white/20"
              onClick={prev}><ChevronLeft size={20} /></Button>
            <Button size="icon" variant="ghost" className="absolute right-3 text-white hover:bg-white/20"
              onClick={next}><ChevronRight size={20} /></Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {activeIdx + 1} / {images.length || 3}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Booking Sidebar ──────────────────────────────────────────────────────────

function BookingCard({ rentAmount }: { rentAmount: number }) {
  const [duration, setDuration] = useState(12);
  const [saved, setSaved]       = useState(false);
  const [booked, setBooked]     = useState(false);

  const advance = rentAmount * ADVANCE_MONTHS;
  const total   = advance + SERVICE_CHARGE;

  return (
    <Card className="sticky top-6 shadow-md">
      <CardContent className="p-6 space-y-5">

        {/* Price */}
        <div>
          <p className="text-3xl font-bold tracking-tight">
            ৳{rentAmount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">per month · negotiable</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 text-sm">
          <StarRating rating={4} />
          <span className="font-medium">4.0</span>
          <span className="text-muted-foreground">(23 reviews)</span>
        </div>

        <Separator />

        {/* Duration Toggle */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Calendar size={12} /> Lease duration
          </p>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map(({ label, months }) => (
              <Toggle
                key={months}
                pressed={duration === months}
                onPressedChange={() => setDuration(months)}
                className={cn(
                  "flex-1 text-xs border border-border/50",
                  duration === months && "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                )}
              >
                {label}
              </Toggle>
            ))}
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-3">
          <FeeRow label="Monthly rent"                        value={`৳${rentAmount.toLocaleString()}`} />
          <FeeRow label={`Advance (${ADVANCE_MONTHS} months)`} value={`৳${advance.toLocaleString()}`} />
          <FeeRow label="Service charge"                      value={`৳${SERVICE_CHARGE.toLocaleString()}`} />
          <Separator className="my-1" />
          <FeeRow label="Total to move in" value={`৳${total.toLocaleString()}`} bold />
        </div>

        {/* CTAs */}
        <Button
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={booked}
          onClick={() => setBooked(true)}
        >
          {booked
            ? <><CheckCircle2 size={16} className="mr-2" />Request sent</>
            : "Book a viewing"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={() => setSaved((s) => !s)}
        >
          <Heart size={15} className={cn(saved && "fill-rose-500 text-rose-500")} />
          {saved ? "Saved" : "Save for later"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Questions?{" "}
          <button className="underline underline-offset-2 hover:text-foreground transition-colors">
            Contact the owner
          </button>
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Amenities ────────────────────────────────────────────────────────────────

function AmenitiesGrid({ amenities }: { amenities: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? amenities : amenities.slice(0, 6);

  return (
    <div>
      <SectionLabel>Amenities</SectionLabel>
      <div className="grid grid-cols-2 gap-x-6">
        {visible.map((a) => {
          const key = a.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "");
          const iconKey = Object.keys(AMENITY_ICONS).find((k) => key.includes(k));
          return (
            <div
              key={a}
              className="flex items-center gap-3 border-b border-border/40 py-2.5 text-sm text-muted-foreground"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                {iconKey ? AMENITY_ICONS[iconKey] : <Zap size={14} />}
              </span>
              {a}
            </div>
          );
        })}
      </div>
      {amenities.length > 6 && (
        <Button
          variant="link"
          size="sm"
          className="mt-2 px-0 text-xs"
          onClick={() => setShowAll((s) => !s)}
        >
          {showAll ? "Show less" : `Show all ${amenities.length} amenities`}
        </Button>
      )}
    </div>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

function ReviewsSection({ reviews, rating }: { reviews: Review[]; rating: number }) {
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  return (
    <div>
      <SectionLabel>Reviews</SectionLabel>
      <div className="flex items-center gap-3 mb-4">
        <StarRating rating={rating} size={16} />
        <span className="text-lg font-semibold">{rating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">· {reviews.length} reviews</span>
      </div>

      {/* Rating breakdown */}
      <div className="space-y-1.5 mb-6">
        {ratingBreakdown.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-3 text-sm">
            <span className="w-4 text-muted-foreground">{star}</span>
            <Progress value={(count / Math.max(reviews.length, 1)) * 100} className="h-1.5 flex-1" />
            <span className="w-4 text-right text-muted-foreground">{count}</span>
          </div>
        ))}
      </div>

      <ScrollArea className="h-64 pr-3">
        <div className="space-y-5">
          {reviews.map((r) => (
            <div key={r.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-muted">{r.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{r.author}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <StarRating rating={r.rating} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-11">{r.comment}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Host Card ────────────────────────────────────────────────────────────────

function HostCard({ property }: { property: Property }) {
  const initials =
    property.ownerName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "??";

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className="cursor-pointer hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{property.ownerName ?? "Property Owner"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Member since {property.ownerSince ?? "2021"}
                {property.ownerListings && ` · ${property.ownerListings} listings`}
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <MessageCircle size={13} />
              Message
            </Button>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 text-sm space-y-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{property.ownerName ?? "Owner"}</p>
            <p className="text-xs text-muted-foreground">Verified landlord</p>
          </div>
        </div>
        {property.ownerResponseRate !== undefined && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Response rate</p>
            <Progress value={property.ownerResponseRate} className="h-1.5" />
            <p className="text-xs text-right text-muted-foreground mt-0.5">{property.ownerResponseRate}%</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PropertySkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-pulse">
      <Skeleton className="h-[400px] w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <div className="flex gap-2">
            {[1,2,3].map(i => <Skeleton key={i} className="h-6 w-20 rounded-full" />)}
          </div>
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${id}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Not found");
      const json = await res.json();
      setProperty(json?.data ?? json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProperty(); }, [fetchProperty]);

  if (loading) return <PropertySkeleton />;

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <p className="text-2xl font-semibold">Property not found</p>
        <p className="text-muted-foreground text-sm max-w-xs">
          This listing may have been removed or the link is incorrect.
        </p>
        <Link href="/properties">
          <Button variant="outline">Browse all properties</Button>
        </Link>
      </div>
    );
  }

  const amenities = property.amenities ?? [
    "Generator backup", "24/7 security", "Covered parking",
    "Lift / elevator", "Rooftop terrace", "High-speed WiFi",
  ];

  const reviews = property.reviews ?? MOCK_REVIEWS;
  const rating  = property.rating  ?? 4.0;

  return (
    <TooltipProvider>
      <div className="max-w-5xl mx-auto px-4 pb-16 pt-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/properties" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} /> Back to properties
          </Link>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Share2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share listing</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Flag size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Report listing</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Gallery */}
        <Gallery images={property.images ?? []} title={property.title} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {property.available !== false && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                    Available
                  </Badge>
                )}
                <Badge variant="secondary">{property.type}</Badge>
                {property.furnished   && <Badge variant="secondary">Furnished</Badge>}
                {property.petFriendly && <Badge variant="secondary">Pet friendly</Badge>}
              </div>

              <h1 className="text-3xl font-bold tracking-tight leading-snug">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <MapPin size={14} />
                {property.area}, {property.city}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard value={property.bedrooms}         label="Bedrooms"  icon={<BedDouble size={18} />} />
              <StatCard value={property.bathrooms}        label="Bathrooms" icon={<Bath      size={18} />} />
              <StatCard value={property.squareFeet ?? "—"} label="Sq. ft"  icon={<Maximize2 size={18} />} />
            </div>

            {/* Tabs: Description / Amenities / Reviews */}
            <Tabs defaultValue="about">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {property.description}
                </p>
              </TabsContent>

              <TabsContent value="amenities" className="mt-4">
                <AmenitiesGrid amenities={amenities} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <ReviewsSection reviews={reviews} rating={rating} />
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Host */}
            <div>
              <SectionLabel>Listed by</SectionLabel>
              <HostCard property={property} />
            </div>
          </div>

          {/* ── Right: Booking ────────────────────────────────────────── */}
          <BookingCard rentAmount={property.rentAmount} />
        </div>
      </div>
    </TooltipProvider>
  );
}

// ─── Missing icon imports (add to top import) ─────────────────────────────────
// import { BedDouble, Bath, Maximize2 } from "lucide-react";
// (moved here for clarity — merge into the top import block)
import { BedDouble, Bath, Maximize2 } from "lucide-react";
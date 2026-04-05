"use client";
// src/app/(dashboardRoute)/user/properties/page.tsx
// API: GET /api/properties (public, APPROVED only)

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, BedDouble, Bath, SlidersHorizontal, Building2, Star } from "lucide-react";

import { Button }             from "@/components/ui/button";
import { Input }              from "@/components/ui/input";
import { Card, CardContent }  from "@/components/ui/card";
import { Badge }              from "@/components/ui/badge";
import { Skeleton }           from "@/components/ui/skeleton";
import { Label }              from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { usePublicProperties, type PropertyType } from "@/hooks/user/useUserApi";

const PROPERTY_TYPES: { value: PropertyType | "ALL"; label: string }[] = [
  { value: "ALL",          label: "All Types" },
  { value: "FAMILY_FLAT",  label: "Family Flat" },
  { value: "BACHELOR_ROOM",label: "Bachelor Room" },
  { value: "SUBLET",       label: "Sublet" },
  { value: "HOSTEL",       label: "Hostel" },
  { value: "OFFICE_SPACE", label: "Office Space" },
  { value: "COMMERCIAL",   label: "Commercial" },
];

export default function BrowsePropertiesPage() {
  const [city,     setCity]     = useState("");
  const [area,     setArea]     = useState("");
  const [minRent,  setMinRent]  = useState("");
  const [maxRent,  setMaxRent]  = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [type,     setType]     = useState<PropertyType | "ALL">("ALL");
  const [sort,     setSort]     = useState("newest");
  const [page,     setPage]     = useState(1);

  // applied filters (only sent on search)
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});

  const { data, isLoading } = usePublicProperties({
    page,
    ...appliedFilters,
  });

  const properties = data?.data ?? [];
  const meta       = data?.meta;

  function handleSearch() {
    setPage(1);
    setAppliedFilters({
      city:     city     || undefined,
      area:     area     || undefined,
      minRent:  minRent  ? Number(minRent)  : undefined,
      maxRent:  maxRent  ? Number(maxRent)  : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      type:     type !== "ALL" ? type : undefined,
      sort,
    });
  }

  function handleReset() {
    setCity(""); setArea(""); setMinRent(""); setMaxRent("");
    setBedrooms(""); setType("ALL"); setSort("newest");
    setPage(1); setAppliedFilters({});
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Browse Properties</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta?.total ?? 0} approved properties available
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-none">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dhaka" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Area</Label>
              <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Gulshan" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Min Rent (৳)</Label>
              <Input value={minRent} onChange={(e) => setMinRent(e.target.value)} type="number" placeholder="5000" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max Rent (৳)</Label>
              <Input value={maxRent} onChange={(e) => setMaxRent(e.target.value)} type="number" placeholder="30000" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Bedrooms</Label>
              <Input value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} type="number" min={0} placeholder="2" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sort</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_asc">Price: Low → High</SelectItem>
                  <SelectItem value="price_desc">Price: High → Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1 h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                <Search size={14} /> Search
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm" className="h-9 text-xs">
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && properties.length === 0 && (
        <div className="text-center py-20">
          <Building2 size={44} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No properties found matching your criteria</p>
          <Button variant="link" onClick={handleReset} className="text-blue-600 mt-2">Clear filters</Button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <Card key={p.id} className="overflow-hidden shadow-none hover:shadow-md transition-shadow">
              <div className="relative h-44 bg-muted">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 size={28} className="text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    {p.type.replace(/_/g, " ")}
                  </Badge>
                </div>
                {p.rating > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
                    <Star size={10} className="fill-amber-400 text-amber-400" /> {p.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-sm line-clamp-1">{p.title}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={11} /> {p.area}, {p.city}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BedDouble size={11} /> {p.bedrooms} bed</span>
                  <span className="flex items-center gap-1"><Bath size={11} /> {p.bathrooms} bath</span>
                  <span className="ml-auto font-bold text-blue-700 text-sm">
                    ৳{p.rentAmount.toLocaleString()}/mo
                  </span>
                </div>
                <div className="pt-1">
                  <Link href={`/property/${p.id}`}>
                    <Button size="sm" className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground">{meta.page} / {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>Next</Button>
        </div>
      )}

    </div>
  );
}
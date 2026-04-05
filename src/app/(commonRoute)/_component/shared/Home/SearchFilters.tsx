// src/app/(commonRoute)/_component/shared/Home/SearchFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ✅ FIXED: no empty string
const propertyTypes = [
  { value: "all", label: "All Types" },
  { value: "FAMILY_FLAT", label: "Family Flat" },
  { value: "BACHELOR_ROOM", label: "Bachelor Room" },
  { value: "SUBLET", label: "Sublet" },
  { value: "HOSTEL", label: "Hostel" },
  { value: "OFFICE_SPACE", label: "Office Space" },
  { value: "COMMERCIAL", label: "Commercial" },
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ FIXED default values
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [minRent, setMinRent] = useState(searchParams.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(searchParams.get("maxRent") || "");
  const [bedrooms, setBedrooms] = useState(
    searchParams.get("bedrooms") || "any"
  );
  const [type, setType] = useState(searchParams.get("type") || "all");

  const updateFilters = () => {
    const params = new URLSearchParams();

    if (city) params.set("city", city);
    if (area) params.set("area", area);
    if (minRent) params.set("minRent", minRent);
    if (maxRent) params.set("maxRent", maxRent);

    // ✅ FIXED: ignore default values
    if (bedrooms && bedrooms !== "any") {
      params.set("bedrooms", bedrooms);
    }

    if (type && type !== "all") {
      params.set("type", type);
    }

    const query = params.toString();
    router.push(`/property${query ? `?${query}` : ""}`);
  };

  const resetFilters = () => {
    setCity("");
    setArea("");
    setMinRent("");
    setMaxRent("");
    setBedrooms("any"); // ✅ FIXED
    setType("all");     // ✅ FIXED
    router.push("/property");
  };

  // ✅ debounce auto search
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateFilters();
    }, 600);

    return () => clearTimeout(timeout);
  }, [city, area, minRent, maxRent, bedrooms, type]);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* City */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            City
          </label>
          <Input
            placeholder="Dhaka, Chattogram..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        {/* Area */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Area
          </label>
          <Input
            placeholder="Mirpur, Gulshan..."
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>

        {/* Property Type */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Property Type
          </label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min Rent */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Min Rent (৳)
          </label>
          <Input
            type="number"
            placeholder="5000"
            value={minRent}
            onChange={(e) => setMinRent(e.target.value)}
          />
        </div>

        {/* Max Rent */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Max Rent (৳)
          </label>
          <Input
            type="number"
            placeholder="50000"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Bedrooms
          </label>
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem> {/* ✅ FIXED */}
              <SelectItem value="1">1 Bedroom</SelectItem>
              <SelectItem value="2">2 Bedrooms</SelectItem>
              <SelectItem value="3">3+ Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <Button onClick={updateFilters} className="flex-1">
          Search
        </Button>
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
      </div>
    </div>
  );
}
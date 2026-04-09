// src/app/(commonRoute)/_component/shared/PropertyCard.tsx
import Link from "next/link";
import Image from "next/image";
import { MapPin, Bed, Bath, Square, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    rentAmount: number;
    city: string;
    area: string;
    bedrooms: number;
    bathrooms: number;
    size?: number;
    images: string[];
    type: string;
    rating?: number;
    totalReviews?: number;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      
      {/* Image Section */}
      <Link href={`/property/${property.id}`} className="relative h-56 overflow-hidden">
        <Image
          src={mainImage}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Price Tag */}
        <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
          ৳{property.rentAmount.toLocaleString()}/mo
        </div>

        {/* Property Type Badge */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 text-xs font-medium px-3 py-1 rounded-full">
          {property.type.replace("_", " ")}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/property/${property.id}`} className="flex-1">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{property.area}, {property.city}</span>
          </div>

          {/* Details */}
          <div className="grid grid-cols-3 gap-4 text-sm mb-6">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-gray-500" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-gray-500" />
              <span>{property.bathrooms}</span>
            </div>
            {property.size && (
              <div className="flex items-center gap-1.5">
                <Square className="w-4 h-4 text-gray-500" />
                <span>{property.size} sqft</span>
              </div>
            )}
          </div>
        </Link>

        {/* Rating */}
        {property.rating && property.rating > 0 && (
          <div className="flex items-center gap-1 text-sm mb-4">
            <span className="text-yellow-500">★</span>
            <span className="font-medium">{property.rating.toFixed(1)}</span>
            <span className="text-gray-500">
              ({property.totalReviews || 0} reviews)
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-auto pt-4 border-t">
          {/* View Details Button */}
          <Link href={`/property/${property.id}`} className="flex-1">
            <Button variant="outline" className="w-full text-sm">
              View Details
            </Button>
          </Link>

          {/* Book Now Button */}
          <Link href={`/property/${property.id}`} className="flex-1">
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm flex items-center gap-2"
            >
              <CalendarCheck size={16} />
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
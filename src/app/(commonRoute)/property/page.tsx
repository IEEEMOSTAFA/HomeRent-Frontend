// src/app/(commonRoute)/property/page.tsx
import PropertyCard from "../_component/shared/Home/PropertyCard";
import SearchFilters from "../_component/shared/Home/SearchFilters";

export default async function PropertyListingPage({
  searchParams,
}: {
  // ✅ Must be Promise in Next.js 15+
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  // Build query string safely
  const queryParams = new URLSearchParams();

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const queryString = queryParams.toString();
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties${queryString ? `?${queryString}` : ""}`;

  let properties: any[] = [];

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (res.ok) {
      const result = await res.json();
      properties = result.data || result || [];
    }
  } catch (error) {
    console.error("Error fetching properties:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-10">
        Find Your Perfect Home
      </h1>

      <SearchFilters />

      {properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No properties found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {properties.map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
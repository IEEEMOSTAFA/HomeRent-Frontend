// src/app/(commonRoute)/property/[id]/page.tsx
// import PropertyGallery from '../_component/shared/PropertyGallery'

import PropertyGallery from "../../_component/shared/Home/PropertyGallery"

export default async function PropertyDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${params.id}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    return <div>Property not found</div>
  }

  const { data: property } = await res.json()

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PropertyGallery images={property.images} title={property.title} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{property.title}</h1>
          <p className="text-2xl text-green-600 font-semibold">
            ৳{property.rentAmount}/month
          </p>
          <p className="text-gray-600 mt-2">
            {property.city}, {property.area}
          </p>
          <div className="prose mt-8">
            <p>{property.description}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Property Details</h3>
          <ul className="space-y-3">
            <li>Bedrooms: {property.bedrooms}</li>
            <li>Bathrooms: {property.bathrooms}</li>
            <li>Size: {property.size} sqft</li>
            <li>Type: {property.type.replace('_', ' ')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
// test file :
// ============================================================
// types/owner.ts
// RentHome — OWNER Role (Landlord / Property Poster) Types
// Routes: /api/owner/*, /api/ai/describe, /api/ai/price-hint
// ============================================================

import { AvailableFor, Booking, PropertyStatus, PropertyType } from "@/hooks/owner/useOwnerApi";
import type { AuthUser } from "./auth";
import type {
  // PropertyType,
  // AvailableFor,
  // PropertyStatus,
  BookingStatus,
  Property,
  Review,
  
} from "./user";

// ─── OWNER PROFILE ────────────────────────────────────────────────────────────

/**
 * OwnerProfile — schema.prisma OwnerProfile model
 * GET /api/owner/profile
 * Registration-এর সময় auto-create হয় (auth.ts databaseHooks-এ)
 */
export interface OwnerProfile {
  id: string;
  userId: string;

  phone: string | null;
  nidNumber: string | null;     // National ID — Admin verify করে
  verified: boolean;            // Admin verify করার পর true হয়
  verifiedAt: string | null;    // ISO date string

  // Stats — denormalized, fast dashboard queries-এর জন্য
  totalProperties: number;
  totalEarnings: number;
  rating: number;
  totalReviews: number;

  createdAt: string;
  updatedAt: string;

  // Populated relation
  user?: Pick<AuthUser, "id" | "name" | "email" | "image">;
}

/**
 * UpdateOwnerProfileInput — PATCH /api/owner/profile
 */
export interface UpdateOwnerProfileInput {
  phone?: string;
  nidNumber?: string;
}

/**
 * OwnerStats — GET /api/owner/stats
 * Owner dashboard-এর summary statistics
 */
export interface OwnerStats {
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalEarnings: number;
  rating: number;
  totalReviews: number;
}

// ─── OWNER PROPERTY ───────────────────────────────────────────────────────────

/**
 * OwnerProperty — Owner-এর নিজের property (full details সহ, status দেখা যায়)
 * GET /api/owner/properties, GET /api/owner/properties/:id
 */
export interface OwnerProperty extends Property {
  rejectionReason: string | null; // Admin reject করলে কারণ দেয়
  _count?: {
    bookings: number;
    reviews: number;
  };
}

/**
 * CreatePropertyInput — POST /api/owner/properties
 * নতুন property listing submit করতে হবে — Admin approve করলে publicly visible হবে
 */
export interface CreatePropertyInput {
  title: string;
  description: string;
  type: PropertyType;
  availableFor: AvailableFor;

  // Location
  city: string;
  area: string;
  address: string;

  // Details
  bedrooms: number;
  bathrooms: number;
  size?: number;                // sqft, optional

  // Pricing
  rent: number;                 // FIX: was `rentAmount` — correct field is `rent` (matches Property)
  advanceDeposit?: number;
  bookingFee?: number;
  isNegotiable?: boolean;

  // Availability
  availableFrom: string;        // ISO date string

  // Media — Cloudinary URLs (আগে /api/images/upload দিয়ে upload করতে হবে)
  images: string[];
}

/**
 * UpdatePropertyInput — PUT /api/owner/properties/:id
 * সব field optional — শুধু পরিবর্তন করতে চাওয়া field পাঠাবে
 */
export type UpdatePropertyInput = Partial<CreatePropertyInput>;

/**
 * OwnerPropertyFilters — GET /api/owner/properties query params
 */
export interface OwnerPropertyFilters {
  status?: PropertyStatus;
  page?: number;
  pageSize?: number;
}

/**
 * PaginatedOwnerProperties — Property list-এর paginated response
 */
export interface PaginatedOwnerProperties {
  data: OwnerProperty[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── OWNER BOOKINGS ───────────────────────────────────────────────────────────

/**
 * OwnerBooking — Owner-এর property-র booking (tenant info সহ)
 * GET /api/owner/bookings
 *
 * FIX: `Booking.property` is typed as the full `Property` object in the base
 *      interface, so overriding it with a narrower `Pick` causes an
 *      incompatibility error. We use `Omit` to drop the base `property` field
 *      and re-declare it with only the fields the owner dashboard needs.
 *      `rentAmount` → `rent` to match the actual Property field name.
 */
// FIX: Booking.property is typed as full `Property`. Overriding it with a
//      narrower Pick inside `extends Booking` causes an incompatibility error.
//      Solution: Omit the conflicting `property` key from Booking, then
//      re-declare it with only the fields the owner dashboard needs.
// export interface OwnerBooking extends Omit<Booking, "property"> {
//   user: Pick<AuthUser, "id" | "name" | "email" | "image">;
//   property: Pick<
//     Property,
//     "id" | "title" | "images" | "city" | "area" | "rentAmount"
//   >;
// }


export interface OwnerBooking extends Omit<Booking, "property"> {
  user: Pick<AuthUser, "id" | "name" | "email" | "image">;
  
  property: Pick<
    Property,
    "id" | "title" | "images" | "city" | "area" | "rent"   // ← rentAmount → rent
  >;
}
/**
 * UpdateBookingStatusInput — PATCH /api/owner/bookings/:id
 * Owner শুধু ACCEPTED অথবা DECLINED করতে পারবে
 */
export interface UpdateBookingStatusInput {
  status: "ACCEPTED" | "DECLINED";
  declineReason?: string;       // Decline করলে কারণ দিতে পারে (optional)
}

/**
 * OwnerBookingFilters — GET /api/owner/bookings query params
 */
export interface OwnerBookingFilters {
  status?: BookingStatus;
  propertyId?: string;
  page?: number;
  pageSize?: number;
}

// ─── OWNER REVIEWS ────────────────────────────────────────────────────────────

/**
 * PropertyReview — Owner-এর property-র review
 * GET /api/owner/properties/:propertyId/reviews
 */
export interface PropertyReview extends Review {
  user: Pick<AuthUser, "id" | "name" | "image">;
}

/**
 * FlagReviewInput — PATCH /api/owner/reviews/:id/flag
 * Owner অনুপযুক্ত review flag করতে পারবে → Admin review করবে
 */
export interface FlagReviewInput {
  reason: string;
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────

/**
 * ImageUploadResponse — POST /api/images/upload এবং upload-multiple
 * Property images upload করলে এই URL গুলো property-তে save করতে হবে
 */
export interface ImageUploadResponse {
  urls: string[];               // Cloudinary URLs
}

/**
 * DeleteMultipleImagesInput — POST /api/images/delete-multiple
 */
export interface DeleteMultipleImagesInput {
  imageUrls: string[];
}

// ─── AI FEATURES (OWNER) ──────────────────────────────────────────────────────

/**
 * AiDescribeInput — POST /api/ai/describe
 * Owner-এর property details দিলে AI professional description generate করবে
 */
export interface AiDescribeInput {
  type: PropertyType;
  city: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  size?: number;
  availableFor: AvailableFor;
  rent: number;                 // FIX: was `rentAmount` — correct field is `rent`
  amenities?: string[];         // ["GAS", "LIFT", "PARKING", "GENERATOR"]
}

/**
 * AiDescribeResponse — AI description-এর response
 */
export interface AiDescribeResponse {
  description: string;          // 3-paragraph polished description
}

/**
 * AiPriceHintInput — POST /api/ai/price-hint
 * Similar properties analyze করে competitive rent range দেবে
 */
export interface AiPriceHintInput {
  city: string;
  area: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  size?: number;
}

/**
 * AiPriceHintResponse — AI price suggestion-এর response
 */
export interface AiPriceHintResponse {
  suggestedMin: number;         // BDT
  suggestedMax: number;         // BDT
  marketAverage: number;        // Database থেকে similar properties-এর average
  reasoning?: string;           // AI-এর explanation
}





















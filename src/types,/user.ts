// ============================================================
// types/user.ts
// RentHome — USER Role (Tenant / Property Seeker) Types
// Routes: /api/bookings, /api/reviews, /api/payments, /api/notifications
// ============================================================

import type { AuthUser } from "./auth";

// ─── ENUMS (schema.prisma থেকে exact match) ──────────────────────────────────

export type PropertyType =
  | "FAMILY_FLAT"
  | "BACHELOR_ROOM"
  | "SUBLET"
  | "HOSTEL"
  | "OFFICE_SPACE"
  | "COMMERCIAL";

export type AvailableFor = "FAMILY" | "BACHELOR" | "CORPORATE" | "ANY";

export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED";

export type BookingStatus =
  | "PENDING"           // User submit করেছে, Owner respond করেনি
  | "ACCEPTED"          // Owner accept করেছে, payment বাকি
  | "PAYMENT_PENDING"   // Stripe session তৈরি, payment হয়নি
  | "CONFIRMED"         // Payment successful, booking live
  | "DECLINED"          // Owner decline করেছে
  | "CANCELLED";        // User cancel করেছে

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type NotificationType = "booking_update" | "payment" | "review" | "system";

// ─── PROPERTY (PUBLIC VIEW) ───────────────────────────────────────────────────

/**
 * OwnerPublicInfo — Property detail page-এ owner-এর যতটুকু দেখাবে
 */
export interface OwnerPublicInfo {
  id: string;
  name: string;
  image: string | null;
  ownerProfile: {
    verified: boolean;
    rating: number;
    totalReviews: number;
    totalProperties: number;
    phone?: string | null;      // শুধু verified owner-এর phone দেখাবে
  } | null;
}

/**
 * Property — GET /api/properties এবং GET /api/properties/:id
 * Public-এ দেখা যাবে শুধু APPROVED properties
 */
export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;

  // Location
  city: string;
  area: string;
  address: string;

  // Details
  bedrooms: number;
  bathrooms: number;
  size: number | null;          // sqft, optional

  // Pricing
  rentAmount: number;
  advanceDeposit: number;
  bookingFee: number;
  isNegotiable: boolean;

  // Availability
  availableFrom: string;        // ISO date string
  availableFor: AvailableFor;

  // Media
  images: string[];             // Cloudinary URLs (max 10)

  // Stats
  rating: number;
  totalReviews: number;
  views: number;

  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Owner info (public properties-এ populated হয়)
  owner?: OwnerPublicInfo;
}

// ─── PROPERTY FILTERS ─────────────────────────────────────────────────────────

/**
 * PropertyFilters — GET /api/properties query params
 * Browse/search page-এ filter করতে ব্যবহার করবে
 */
export interface PropertyFilters {
  search?: string;              // full-text: title, description, area
  city?: string;
  area?: string;
  type?: PropertyType;
  availableFor?: AvailableFor;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
  page?: number;
  pageSize?: number;
}

/**
 * PaginatedProperties — Property list-এর paginated response
 */
export interface PaginatedProperties {
  data: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── BOOKING ──────────────────────────────────────────────────────────────────

/**
 * Booking — User-এর booking object
 * GET /api/bookings, GET /api/bookings/:id
 */
export interface Booking {
  id: string;
  propertyId: string;
  userId: string;

  moveInDate: string;           // ISO date string
  moveOutDate: string | null;
  message: string | null;       // User-এর optional note
  numberOfTenants: number;

  // Pricing snapshot (booking-এর সময়কার price, পরে change হলেও affect করবে না)
  rentAmount: number;
  bookingFee: number;
  totalAmount: number;

  status: BookingStatus;
  cancellationNote: string | null;

  expiresAt: string | null;     // 24h পরে auto-expire
  confirmedAt: string | null;
  cancelledAt: string | null;

  createdAt: string;
  updatedAt: string;

  // Populated relations
  property?: Property;
  payment?: UserPayment | null;
  review?: Review | null;
}

/**
 * CreateBookingInput — POST /api/bookings
 */
export interface CreateBookingInput {
  propertyId: string;
  moveInDate: string;           // ISO date string "2026-02-01"
  message?: string;
  months?: number;
}

/**
 * CancelBookingInput — PATCH /api/bookings/:id/cancel
 */
export interface CancelBookingInput {
  cancellationNote?: string;
}

// ─── PAYMENT ──────────────────────────────────────────────────────────────────

/**
 * UserPayment — User-এর payment info
 * GET /api/payments/my-payments, GET /api/payments/:id
 */
export interface UserPayment {
  id: string;
  bookingId: string;
  userId: string;

  amount: number;
  currency: string;             // "BDT"
  status: PaymentStatus;

  stripePaymentIntentId: string | null;
  stripeSessionId: string | null;
  receiptUrl: string | null;    // Stripe-hosted receipt link

  refundAmount: number | null;
  refundedAt: string | null;

  createdAt: string;
  updatedAt: string;

  booking?: Booking;
}

/**
 * CreatePaymentIntentInput — POST /api/payments/create-intent
 */
export interface CreatePaymentIntentInput {
  bookingId: string;
}

/**
 * CreatePaymentIntentResponse — create-intent-এর response
 */
export interface CreatePaymentIntentResponse {
  clientSecret: string;         // Stripe-এ confirm করতে লাগবে
  paymentId: string;
}

/**
 * ConfirmPaymentInput — POST /api/payments/confirm (Stripe success-এর পর)
 */
export interface ConfirmPaymentInput {
  paymentId: string;
  stripePaymentIntentId: string;
}

// ─── REVIEW ───────────────────────────────────────────────────────────────────

/**
 * Review — User-এর review object
 * POST /api/reviews, GET /api/reviews/my, GET /api/reviews/property/:propertyId
 */
export interface Review {
  id: string;
  bookingId: string;
  propertyId: string;
  userId: string;

  rating: number;               // 1–5 stars
  comment: string | null;

  isFlagged: boolean;           // Owner flag করেছে কিনা
  isVisible: boolean;           // Admin hide করতে পারে

  createdAt: string;
  updatedAt: string;

  // Populated relations
  user?: Pick<AuthUser, "id" | "name" | "image">;
  property?: Pick<Property, "id" | "title" | "images">;
}

/**
 * CreateReviewInput — POST /api/reviews
 * শুধু CONFIRMED booking-এর জন্য review দেওয়া যাবে
 */
export interface CreateReviewInput {
  bookingId: string;
  rating: number;               // 1–5
  comment?: string;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

/**
 * Notification — In-app notification
 * GET /api/notifications
 */
export interface Notification {
  id: string;
  userId: string;
  bookingId: string | null;

  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl: string | null;     // Frontend route, click করলে navigate করবে

  createdAt: string;
}

/**
 * NotificationFilters — GET /api/notifications query params
 */
export interface NotificationFilters {
  isRead?: boolean;
  page?: number;
  limit?: number;
}

// ─── USER STATS ───────────────────────────────────────────────────────────────

/**
 * UserStats — GET /api/users/me/stats
 * User dashboard-এর statistics
 */
export interface UserStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalPayments: number;
  totalReviews: number;
  unreadNotifications: number;
}

// ─── AI FEATURES (USER) ───────────────────────────────────────────────────────

/**
 * AiRecommendInput — POST /api/ai/recommend
 * Backend নিজেই user-এর booking history দেখে recommend করে
 */
export interface AiRecommendInput {
  limit?: number;               // কতটা property recommend করবে (default: 5)
}

/**
 * AiRecommendResponse — AI recommendation-এর response
 */
export interface AiRecommendResponse {
  recommendations: Property[];
  reasoning?: string;           // AI কেন recommend করেছে (optional)
}
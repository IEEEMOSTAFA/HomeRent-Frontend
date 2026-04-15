// src/types/user.ts
// Shared types for the USER (tenant) feature — RentHome PRD

// ── Auth / User ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "OWNER" | "ADMIN";
  image?: string;
  phone?: string;
  createdAt: string;
  isBanned: boolean;
}

export interface UserStats {
  totalBookings: number;
  activeBookings: number;
  totalSpent: number;
  totalReviews: number;
}

// ── Property ──────────────────────────────────────────────────────────────────

export interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  area: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  owner: {
    id: string;
    name: string;
    image?: string;
  };
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface PropertyFilters {
  city?: string;
  area?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  sort?: "price_asc" | "price_desc" | "newest";
  page?: number;
}

export interface PropertiesResponse {
  data: Property[];
  total: number;
  page: number;
  totalPages: number;
}

// ── Booking ───────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "CANCELLED";



export interface CreateBookingPayload {
  propertyId: string;
  startDate: string;
  endDate: string;
}

// ── Payment ───────────────────────────────────────────────────────────────────

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  createdAt: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentId: string;
}

// ── Review ────────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  bookingId: string;
  property: Pick<Property, "id" | "title" | "images" | "city">;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment: string;
}

// ── Notification ──────────────────────────────────────────────────────────────

export type NotificationType =
  | "BOOKING_ACCEPTED"
  | "BOOKING_DECLINED"
  | "PAYMENT_SUCCESS"
  | "BOOKING_CONFIRMED"
  | "GENERAL";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ── API Generic ───────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status?: number;
}















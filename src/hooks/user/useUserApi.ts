// src/hooks/user/useUserApi.ts
// Matches: user_route.ts + booking/payment/review/notification routes
// All USER-specific API calls

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type PropertyType =
  | "FAMILY_FLAT" | "BACHELOR_ROOM" | "SUBLET"
  | "HOSTEL" | "OFFICE_SPACE" | "COMMERCIAL";

export type AvailableFor = "FAMILY" | "BACHELOR" | "CORPORATE" | "ANY";
export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED";

export type BookingStatus =
  | "PENDING" | "ACCEPTED" | "PAYMENT_PENDING"
  | "CONFIRMED" | "DECLINED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  city: string;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size: number | null;
  rentAmount: number;
  advanceDeposit: number;
  bookingFee: number;
  isNegotiable: boolean;
  availableFrom: string;
  availableFor: AvailableFor;
  images: string[];
  rating: number;
  totalReviews: number;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  owner?: {
    id: string;
    name: string;
    image: string | null;
    ownerProfile: {
      verified: boolean;
      rating: number;
      totalReviews: number;
      totalProperties: number;
      phone?: string | null;
    } | null;
  };
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  moveInDate: string;
  moveOutDate: string | null;
  message: string | null;
  numberOfTenants: number;
  rentAmount: number;
  bookingFee: number;
  totalAmount: number;
  status: BookingStatus;
  cancellationNote: string | null;
  expiresAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  property: Pick<Property, "id" | "title" | "city" | "area" | "images" | "rentAmount">;
  payment: UserPayment | null;
  review: Review | null;
}

export interface CreateBookingInput {
  propertyId: string;
  moveInDate: string;
  message?: string;
  numberOfTenants?: number;
}

export interface UserPayment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string | null;
  receiptUrl: string | null;
  refundAmount: number | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: Pick<Booking, "id" | "status" | "moveInDate" | "totalAmount"> & {
    property: Pick<Property, "id" | "title" | "city" | "area">;
  };
}

export interface Review {
  id: string;
  bookingId: string;
  propertyId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isFlagged: boolean;
  isVisible: boolean;
  createdAt: string;
  user?: { id: string; name: string; image: string | null };
  property?: Pick<Property, "id" | "title" | "images">;
}

export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface Notification {
  id: string;
  userId: string;
  bookingId: string | null;
  title: string;
  message: string;
  type: "booking_update" | "payment" | "review" | "system";
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export interface UserStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalPayments: number;
  totalReviews: number;
  unreadNotifications: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentId: string;
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn:  () => apiFetch<any>("/users/me"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; image?: string }) =>
      apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "me"] }),
  });
}

// ─── USER STATS — GET /api/users/me/stats ─────────────────────────────────────

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ["user", "stats"],
    queryFn:  () => apiFetch("/users/me/stats"),
  });
}

// ─── PROPERTIES (public browse) — GET /api/properties ────────────────────────

export function usePublicProperties(params?: {
  page?: number;
  city?: string;
  area?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  type?: PropertyType;
  sort?: string;
}) {
  const q = new URLSearchParams();
  if (params?.page)     q.set("page",     String(params.page));
  if (params?.city)     q.set("city",     params.city);
  if (params?.area)     q.set("area",     params.area);
  if (params?.minRent)  q.set("minRent",  String(params.minRent));
  if (params?.maxRent)  q.set("maxRent",  String(params.maxRent));
  if (params?.bedrooms) q.set("bedrooms", String(params.bedrooms));
  if (params?.type)     q.set("type",     params.type);
  if (params?.sort)     q.set("sort",     params.sort);

  return useQuery<PaginatedResponse<Property>>({
    queryKey: ["properties", "public", params],
    queryFn:  () => apiFetch(`/properties?${q}`),
  });
}

export function usePublicProperty(id: string) {
  return useQuery<Property>({
    queryKey: ["properties", "public", id],
    queryFn:  () => apiFetch(`/properties/${id}`),
    enabled:  !!id,
  });
}

// ─── BOOKINGS — GET/POST /api/bookings | PATCH cancel ─────────────────────────

export function useMyBookings(params?: { page?: number; status?: BookingStatus }) {
  const q = new URLSearchParams();
  if (params?.page)   q.set("page",   String(params.page));
  if (params?.status) q.set("status", params.status);
  return useQuery<PaginatedResponse<Booking>>({
    queryKey: ["user", "bookings", params],
    queryFn:  () => apiFetch(`/bookings?${q}`),
  });
}

export function useMyBooking(id: string) {
  return useQuery<Booking>({
    queryKey: ["user", "bookings", id],
    queryFn:  () => apiFetch(`/bookings/${id}`),
    enabled:  !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingInput) =>
      apiFetch<Booking>("/bookings", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "bookings"] });
      qc.invalidateQueries({ queryKey: ["user", "stats"] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cancellationNote }: { id: string; cancellationNote?: string }) =>
      apiFetch(`/bookings/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ cancellationNote }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "bookings"] });
      qc.invalidateQueries({ queryKey: ["user", "stats"] });
    },
  });
}

// ─── PAYMENTS — POST create-intent | POST confirm ─────────────────────────────

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiFetch<CreatePaymentIntentResponse>("/payments/create-intent", {
        method: "POST",
        body: JSON.stringify({ bookingId }),
      }),
  });
}

export function useConfirmPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      stripePaymentIntentId,
    }: {
      paymentId: string;
      stripePaymentIntentId: string;
    }) =>
      apiFetch("/payments/confirm", {
        method: "POST",
        body: JSON.stringify({ paymentId, stripePaymentIntentId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "bookings"] });
      qc.invalidateQueries({ queryKey: ["user", "stats"] });
      qc.invalidateQueries({ queryKey: ["user", "payments"] });
    },
  });
}

export function useMyPayments(params?: { page?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  return useQuery<PaginatedResponse<UserPayment>>({
    queryKey: ["user", "payments", params],
    queryFn:  () => apiFetch(`/payments/my-payments?${q}`),
  });
}

// ─── REVIEWS — POST /api/reviews | GET my reviews ─────────────────────────────

export function useMyReviews() {
  return useQuery<PaginatedResponse<Review>>({
    queryKey: ["user", "reviews"],
    queryFn:  () => apiFetch("/reviews?userId=me"),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewInput) =>
      apiFetch<Review>("/reviews", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "reviews"] });
      qc.invalidateQueries({ queryKey: ["user", "bookings"] });
      qc.invalidateQueries({ queryKey: ["user", "stats"] });
    },
  });
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export function useMyNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["user", "notifications"],
    queryFn:  () => apiFetch("/notifications"),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch("/notifications/mark-all-read", { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "notifications"] }),
  });
}

// ─── AI RECOMMENDATIONS — POST /api/ai/recommend ─────────────────────────────

export function useAIRecommendations() {
  return useMutation({
    mutationFn: (limit?: number) =>
      apiFetch<{ recommendations: Property[]; reasoning?: string }>("/ai/recommend", {
        method: "POST",
        body: JSON.stringify({ limit: limit ?? 6 }),
      }),
  });
}
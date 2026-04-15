// src/hooks/user/useUserApi.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── TYPES ───────────────────────────────────────────────────────────────────

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
  property: Pick<Property, "id" | "title" | "city" | "area" | "images" | "rentAmount"> & {
    owner?: Pick<Property["owner"] & object, "id" | "name" | "image">;
  };
  user?: { id: string; name: string; email: string; image: string | null };
  payment: UserPayment | null;
  review: Review | null;
}

export interface CreateBookingInput {
  propertyId: string;
  moveInDate: string;
  message?: string;
  numberOfTenants?: number;
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

export interface BookingListResponse {
  data: Booking[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
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
  return useQuery<{ id: string; name: string; email: string; image?: string }>({
    queryKey: ["user", "me"],
    queryFn: () => apiFetch<{ id: string; name: string; email: string; image?: string }>("/users/me"),
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

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ["user", "stats"],
    queryFn: () => apiFetch("/users/me/stats"),
  });
}

// ─── PROPERTIES ───────────────────────────────────────────────────────────────

export function usePublicProperties(params?: {
  page?: number; city?: string; area?: string;
  minRent?: number; maxRent?: number; bedrooms?: number;
  type?: PropertyType; sort?: string;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.city) q.set("city", params.city);
  if (params?.area) q.set("area", params.area);
  if (params?.minRent) q.set("minRent", String(params.minRent));
  if (params?.maxRent) q.set("maxRent", String(params.maxRent));
  if (params?.bedrooms) q.set("bedrooms", String(params.bedrooms));
  if (params?.type) q.set("type", params.type);
  if (params?.sort) q.set("sort", params.sort);

  return useQuery<PaginatedResponse<Property>>({
    queryKey: ["properties", "public", params],
    queryFn: () => apiFetch(`/properties?${q}`),
  });
}

export function usePublicProperty(id: string) {
  return useQuery<Property>({
    queryKey: ["properties", "public", id],
    queryFn: () => apiFetch(`/properties/${id}`),
    enabled: !!id,
  });
}

// ─── OWNER PROFILE ────────────────────────────────────────────────────────────

export interface OwnerProfile {
  id: string;
  phone: string | null;
  nidNumber: string | null;
  verified: boolean;
  rating: number;
  totalReviews: number;
  totalProperties: number;
  totalEarnings: number;
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export function useOwnerProfile() {
  return useQuery<OwnerProfile>({
    queryKey: ["owner", "profile"],
    queryFn: async () => {
      const res = await apiFetch<{ data: OwnerProfile }>("/owner/profile");
      return res.data; // Extract the `data` property
    },
    retry: 1,
    staleTime: 30000,
  });
}

export function useUpdateOwnerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { phone?: string; nidNumber?: string }) =>
      apiFetch("/owner/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "profile"] });
      qc.invalidateQueries({ queryKey: ["owner", "stats"] });
    },
  });
}

// ─── OWNER PROPERTIES ─────────────────────────────────────────────────────────

// export function useOwnerProperties(params?: {
//   page?: number;
//   limit?: number;
//   status?: PropertyStatus;
// }) {
//   const q = new URLSearchParams();
//   if (params?.page) q.set("page", String(params.page));
//   if (params?.limit) q.set("limit", String(params.limit));
//   if (params?.status) q.set("status", params.status);

//   return useQuery<PaginatedResponse<Property>>({
//     queryKey: ["owner", "properties", params],
//     queryFn: async () => {
//       const res = await apiFetch<any>(`/owner/properties?${q}`);
//       // backend সাধারণত { data: { data: [], meta: {} } } দেয়
//       const payload = res?.data ?? res;
//       return payload;
//     },
//     retry: 1,
//     staleTime: 30000,
//   });
// }


// test file:

// ──────────────────────────────────────────────────────────────────
// useOwnerApi.ts এ শুধু useOwnerProperties function টা replace করো
// ──────────────────────────────────────────────────────────────────

export function useOwnerProperties(params?: {
  page?: number;
  limit?: number;
  status?: PropertyStatus;
}) {
  const q = new URLSearchParams();
  if (params?.page)   q.set("page",   String(params.page));
  if (params?.limit)  q.set("limit",  String(params.limit));
  if (params?.status) q.set("status", params.status);

  return useQuery<PaginatedResponse<Property>>({
    queryKey: ["owner", "properties", params],
    queryFn: async () => {
      const res = await apiFetch<{ data: PaginatedResponse<Property> }>(
        `/owner/properties?${q}`
      );
      return res.data; // Extract the `data` property
    },
    retry: 1,
    staleTime: 30000,
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) =>
      apiFetch(`/owner/properties/${propertyId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "properties"] });
      qc.invalidateQueries({ queryKey: ["owner", "stats"] });
    },
  });
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

export function useMyBookings(params?: {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("pageSize", String(params.limit)); // ✅ backend uses pageSize not limit
  if (params?.status) q.set("status", params.status);

  return useQuery<BookingListResponse>({
    queryKey: ["user", "bookings", params],
    queryFn: async () => {
      // ✅ FIX: Backend sendResponse wraps everything inside "data"
      // Actual response shape: { statusCode, success, message, data: { data: [], pagination: {} } }
      const response = await apiFetch<any>(`/bookings?${q}`);

      // ✅ Unwrap: response.data হলো আসল payload { data: [], pagination: {} }
      const payload = response?.data ?? response;

      if (payload?.data && payload?.pagination) return payload;

      // Fallback: plain array হলে
      if (Array.isArray(payload)) {
        return {
          data: payload,
          pagination: { page: 1, pageSize: payload.length, total: payload.length, totalPages: 1 },
        };
      }

      return { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } };
    },
    retry: 1,
    staleTime: 30000,
  });
}














export function useRespondToBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) =>
      apiFetch(`/owner/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "bookings"] });
      qc.invalidateQueries({ queryKey: ["owner", "stats"] });
    },
  });
}



export function useBookingById(id: string) {
  return useQuery<Booking>({
    queryKey: ["user", "bookings", id],
    // ✅ FIX: same unwrap — response.data is the booking object
    queryFn: () => apiFetch<any>(`/bookings/${id}`).then((res) => res?.data ?? res),
    enabled: !!id,
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

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────

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
    mutationFn: ({ paymentId, stripePaymentIntentId }: { paymentId: string; stripePaymentIntentId: string }) =>
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
    queryFn: () => apiFetch(`/payments/my-payments?${q}`),
  });
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export function useMyReviews() {
  return useQuery<PaginatedResponse<Review>>({
    queryKey: ["user", "reviews"],
    queryFn: () => apiFetch("/reviews?userId=me"),
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



// ─── OWNER STATS ──────────────────────────────────────────────────────────────

export interface OwnerStats {
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  totalBookings: number;
  confirmedBookings: number;
  totalEarnings: number;
  rating: number;
  totalReviews: number;
}

export function useOwnerStats() {
  return useQuery<OwnerStats>({
    queryKey: ["owner", "stats"],
    queryFn: async () => {
      const res = await apiFetch<any>("/owner/stats");
      if (res?.data) return res.data;
      return res;
    },
  });
}

// ─── OWNER BOOKINGS ───────────────────────────────────────────────────────────

export function useOwnerBookings(params?: {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.status) q.set("status", params.status);

  return useQuery<BookingListResponse>({
    queryKey: ["owner", "bookings", params],
    queryFn: async () => {
      const res = await apiFetch<any>(`/owner/bookings?${q}`);

      // 🔍 DEBUG — browser console এ দেখো কী আসছে
      console.log("🏠 Owner bookings raw response:", JSON.stringify(res, null, 2));

     

      const outer = res?.data ?? res;

      // ✅ Case 1: { data: [...], pagination: {...} }
      if (Array.isArray(outer?.data) && outer?.pagination) {
        return { data: outer.data, pagination: outer.pagination };
      }

      // ✅ Case 2: { data: [...], meta: {...} }
      if (Array.isArray(outer?.data) && outer?.meta) {
        return {
          data: outer.data,
          pagination: {
            page: outer.meta.page ?? 1,
            pageSize: outer.meta.limit ?? 10,
            total: outer.meta.total ?? outer.data.length,
            totalPages: outer.meta.totalPages ?? 1,
          },
        };
      }

      // ✅ Case 3: outer নিজেই array
      if (Array.isArray(outer)) {
        return {
          data: outer,
          pagination: { page: 1, pageSize: outer.length, total: outer.length, totalPages: 1 },
        };
      }

      // ✅ Case 4: outer.data array কিন্তু pagination নেই
      if (Array.isArray(outer?.data)) {
        return {
          data: outer.data,
          pagination: { page: 1, pageSize: outer.data.length, total: outer.data.length, totalPages: 1 },
        };
      }

      // Fallback
      return { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } };
    },
    retry: 1,
    staleTime: 30000,
  });
}

// ─── OWNER BOOKING ACTION (Accept / Decline) ──────────────────────────────────

export function useOwnerUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) =>
      apiFetch(`/owner/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "bookings"] });
      qc.invalidateQueries({ queryKey: ["owner", "stats"] });
    },
  });
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────



// useOwnerApi.ts এ এভাবে করো
export function useMyNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["owner", "notifications"],  // "user" → "owner" করো
    queryFn: async () => {
      const res = await apiFetch<any>("/notifications");

      console.log("🔔 Owner notification response:", res);

      if (Array.isArray(res?.data?.notifications)) return res.data.notifications;
      if (Array.isArray(res?.notifications)) return res.notifications;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res)) return res;

      return [];
    },
    retry: 1,
    staleTime: 30000,
  });
}
// ─── NOTIFICATION MUTATIONS (missing — added now) ─────────────────────────────

// PATCH /api/notifications/:id/read



export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "notifications"] }),
  });
}

// PATCH /api/notifications/mark-all-read
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch("/notifications/mark-all-read", { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "notifications"] }),
  });
}




export function useFlagReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFlagged }: { id: string; isFlagged: boolean }) =>
      apiFetch(`/owner/reviews/${id}/flag`, {
        method: "PATCH",
        body: JSON.stringify({ isFlagged }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "reviews"] });
    },
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// useOwnerApi.ts এ পুরনো useAllOwnerReviews function টা এটা দিয়ে replace করো
// ─────────────────────────────────────────────────────────────────────────────
//
// ✅ Backend এ correct endpoint আছে (owner.route.ts line 38):
//    GET /api/owner/properties/:propertyId/reviews
//
// Strategy:
//   Step 1 → GET /owner/properties          — owner এর সব property আনো
//   Step 2 → GET /owner/properties/:id/reviews — প্রতিটার reviews আনো (parallel)
//   Step 3 → সব merge করে return করো
// ─────────────────────────────────────────────────────────────────────────────

export function useAllOwnerReviews(params?: { page?: number; limit?: number }) {
  return useQuery<PaginatedResponse<Review>>({
    queryKey: ["owner", "reviews", params],
    queryFn: async () => {

      // ── Step 1: Owner এর সব properties আনো ──────────────────────────────
      const propRes = await apiFetch<any>("/owner/properties?limit=100");
      console.log("🏠 Owner properties (for reviews):", propRes);

      const propOuter = propRes?.data ?? propRes;
      const properties: Property[] =
        Array.isArray(propOuter?.data) ? propOuter.data :
        Array.isArray(propOuter)       ? propOuter      : [];

      if (properties.length === 0) {
        return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      }

      // ── Step 2: প্রতিটা property র reviews আনো parallel এ ────────────────
      // ✅ CORRECT endpoint: /owner/properties/:propertyId/reviews
      // ❌ WRONG (403):      /reviews?propertyId=xxx
      // ❌ WRONG (404):      /owner/reviews
      const reviewArrays = await Promise.all(
        properties.map((p) =>
          apiFetch<any>(`/owner/properties/${p.id}/reviews`)
            .then((res) => {
              console.log(`⭐ Reviews for property ${p.id}:`, res);

              const outer = res?.data ?? res;

              // response shape handle
              if (Array.isArray(outer?.data)) return outer.data as Review[];
              if (Array.isArray(outer))       return outer      as Review[];
              return [] as Review[];
            })
            .catch((err) => {
              console.warn(`⚠️ Reviews fetch failed for property ${p.id}:`, err);
              return [] as Review[];
            })
        )
      );

      // ── Step 3: Merge ─────────────────────────────────────────────────────
      const allReviews = reviewArrays.flat();
      console.log(`✅ Total reviews loaded: ${allReviews.length}`);

      return {
        data: allReviews,
        meta: {
          total:      allReviews.length,
          page:       1,
          limit:      allReviews.length,
          totalPages: 1,
        },
      } as PaginatedResponse<Review>;
    },
    retry: 1,
    staleTime: 30_000,
  });
}





export interface CreatePropertyInput {
  title: string;
  description: string;
  type: PropertyType;
  city: string;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size?: number;
  rentAmount: number;
  advanceDeposit: number;
  bookingFee: number;
  isNegotiable?: boolean;
  availableFrom: string;
  availableFor: AvailableFor;
  images?: string[];
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePropertyInput) =>
      apiFetch<Property>("/owner/properties", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "properties"] });
      qc.invalidateQueries({ queryKey: ["owner", "stats"] });
    },
  });
}

// ─── UPDATE PROPERTY ──────────────────────────────────────────────────────────

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePropertyInput> }) =>
      apiFetch<Property>(`/owner/properties/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "properties"] });
    },
  });
}

// ─── AI DESCRIPTION ───────────────────────────────────────────────────────────

export function useAIDescription() {
  return useMutation<
    { description: string },
    Error,
    { type: PropertyType; city: string; area: string; bedrooms: number; bathrooms: number; availableFor: AvailableFor }
  >({
    mutationFn: (input) =>
      apiFetch<{ description: string }>("/ai/description", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

// ─── AI PRICE HINT ────────────────────────────────────────────────────────────

export function useAIPriceHint() {
  return useMutation<
    { suggestedRent: number; minRent: number; maxRent: number },
    Error,
    { type: PropertyType; city: string; area: string; bedrooms: number; bathrooms: number; availableFor: AvailableFor; size?: number }
  >({
    mutationFn: (input) =>
      apiFetch<{ suggestedRent: number; minRent: number; maxRent: number }>("/ai/price-hint", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}
























// "use client";
// // src/app/(dashboardRoute)/owner/_components/PropertyForm.tsx
// // Shared by: properties/new/page.tsx  &  properties/[id]/edit/page.tsx

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Sparkles, TrendingUp, Loader2 } from "lucide-react";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import {
//   useAIDescription,
//   useAIPriceHint,
//   type CreatePropertyInput,
//   type Property,
// } from "@/hooks/owner/useOwnerApi";

// // ─── ZOD SCHEMA ───────────────────────────────────────────────────────────────
// const schema = z.object({
//   title:          z.string().min(5, "Min 5 characters"),
//   description:    z.string().min(20, "Min 20 characters"),
//   type:           z.enum(["FAMILY_FLAT","BACHELOR_ROOM","SUBLET","HOSTEL","OFFICE_SPACE","COMMERCIAL"]),
//   city:           z.string().min(2, "Required"),
//   area:           z.string().min(2, "Required"),
//   address:        z.string().min(5, "Required"),
//   bedrooms:       z.number().min(0),       // ✅ z.coerce.number() → z.number()
//   bathrooms:      z.number().min(0),       // ✅ z.coerce.number() → z.number()
//   size:           z.number().optional(),   // ✅ z.coerce.number() → z.number()
//   rentAmount:     z.number().min(1, "Required"),    // ✅ z.coerce.number() → z.number()
//   advanceDeposit: z.number().min(0).optional(),     // ✅ z.coerce.number() → z.number()
//   bookingFee:     z.number().min(0).optional(),     // ✅ z.coerce.number() → z.number()
//   isNegotiable:   z.boolean().optional(),
//   availableFrom:  z.string().min(1, "Required"),
//   availableFor:   z.enum(["FAMILY","BACHELOR","CORPORATE","ANY"]),
//   images:         z.array(z.string().url("Must be valid URL")).min(1, "At least 1 image URL"),
// });

// type FormValues = z.infer<typeof schema>;

// const PROPERTY_TYPES = [
//   { value: "FAMILY_FLAT",   label: "Family Flat" },
//   { value: "BACHELOR_ROOM", label: "Bachelor Room" },
//   { value: "SUBLET",        label: "Sublet" },
//   { value: "HOSTEL",        label: "Hostel" },
//   { value: "OFFICE_SPACE",  label: "Office Space" },
//   { value: "COMMERCIAL",    label: "Commercial" },
// ];

// const AVAILABLE_FOR_OPTIONS = [
//   { value: "ANY",       label: "Any" },
//   { value: "FAMILY",    label: "Family" },
//   { value: "BACHELOR",  label: "Bachelor" },
//   { value: "CORPORATE", label: "Corporate" },
// ];

// // ─── PROPS ────────────────────────────────────────────────────────────────────
// interface PropertyFormProps {
//   defaultValues?: Partial<Property>;
//   onSubmit: (data: CreatePropertyInput) => void;
//   isSubmitting: boolean;
//   submitLabel: string;
// }

// // ─── COMPONENT ────────────────────────────────────────────────────────────────
// export default function PropertyForm({
//   defaultValues,
//   onSubmit,
//   isSubmitting,
//   submitLabel,
// }: PropertyFormProps) {
//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm<FormValues>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       title:          defaultValues?.title         ?? "",
//       description:    defaultValues?.description   ?? "",
//       type:           defaultValues?.type          ?? "FAMILY_FLAT",
//       city:           defaultValues?.city          ?? "",
//       area:           defaultValues?.area          ?? "",
//       address:        defaultValues?.address       ?? "",
//       bedrooms:       defaultValues?.bedrooms      ?? 1,
//       bathrooms:      defaultValues?.bathrooms     ?? 1,
//       size:           defaultValues?.size          ?? undefined,
//       rentAmount:     defaultValues?.rentAmount    ?? 0,
//       advanceDeposit: defaultValues?.advanceDeposit ?? 0,
//       bookingFee:     defaultValues?.bookingFee    ?? 0,
//       isNegotiable:   defaultValues?.isNegotiable  ?? false,
//       availableFrom:  defaultValues?.availableFrom ? defaultValues.availableFrom.slice(0, 10) : "",
//       availableFor:   defaultValues?.availableFor  ?? "ANY",
//       images:         defaultValues?.images        ?? [],
//     },
//   });

//   const aiDescribe  = useAIDescription();
//   const aiPrice     = useAIPriceHint();
//   const watchFields = watch(["type","city","area","bedrooms","bathrooms","availableFor","size"]);
//   const imagesValue = watch("images") ?? [];

//   function handleAIDescription() {
//     const [type, city, area, bedrooms, bathrooms, availableFor] = watchFields;
//     if (!city || !area) { toast.error("Fill city and area first"); return; }
//     aiDescribe.mutate(
//       { type, city, area, bedrooms, bathrooms, availableFor },
//       {
//         onSuccess: (d) => { setValue("description", d.description); toast.success("AI description generated!"); },
//         onError: () => toast.error("AI generation failed"),
//       }
//     );
//   }

//   function handleAIPriceHint() {
//     const [type, city, area, bedrooms, bathrooms, availableFor, size] = watchFields;
//     if (!city || !area) { toast.error("Fill city and area first"); return; }
//     aiPrice.mutate(
//       { type, city, area, bedrooms, bathrooms, availableFor, size },
//       {
//         onSuccess: (d) => { setValue("rentAmount", d.suggestedRent); toast.success(`Suggested ৳${d.minRent}–৳${d.maxRent}`); },
//         onError: () => toast.error("AI price hint failed"),
//       }
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

//       {/* ── Basic Info ── */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-base">Basic Information</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">

//           <Field label="Title" error={errors.title?.message}>
//             <Input {...register("title")} placeholder="e.g. Spacious 3BHK Family Flat in Gulshan" />
//           </Field>

//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Property Type" error={errors.type?.message}>
//               <Select
//                 defaultValue={defaultValues?.type ?? "FAMILY_FLAT"}
//                 onValueChange={(v) => setValue("type", v as FormValues["type"])}
//               >
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   {PROPERTY_TYPES.map((t) => (
//                     <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </Field>

//             <Field label="Available For" error={errors.availableFor?.message}>
//               <Select
//                 defaultValue={defaultValues?.availableFor ?? "ANY"}
//                 onValueChange={(v) => setValue("availableFor", v as FormValues["availableFor"])}
//               >
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   {AVAILABLE_FOR_OPTIONS.map((a) => (
//                     <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </Field>
//           </div>

//           <Field label="Description" error={errors.description?.message}>
//             <div className="relative">
//               <Textarea
//                 {...register("description")}
//                 rows={4}
//                 placeholder="Describe the property…"
//                 className="resize-none pr-32"
//               />
//               <Button
//                 type="button"
//                 size="sm"
//                 variant="outline"
//                 onClick={handleAIDescription}
//                 disabled={aiDescribe.isPending}
//                 className="absolute bottom-2 right-2 h-7 text-xs gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
//               >
//                 {aiDescribe.isPending
//                   ? <Loader2 size={11} className="animate-spin" />
//                   : <Sparkles size={11} />}
//                 AI Generate
//               </Button>
//             </div>
//           </Field>

//         </CardContent>
//       </Card>

//       {/* ── Location ── */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-base">Location</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="City" error={errors.city?.message}>
//               <Input {...register("city")} placeholder="Dhaka" />
//             </Field>
//             <Field label="Area" error={errors.area?.message}>
//               <Input {...register("area")} placeholder="Gulshan" />
//             </Field>
//           </div>
//           <Field label="Full Address" error={errors.address?.message}>
//             <Input {...register("address")} placeholder="House 12, Road 5, Gulshan 2" />
//           </Field>
//         </CardContent>
//       </Card>

//       {/* ── Details ── */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-base">Property Details</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-3 gap-4">
//             <Field label="Bedrooms" error={errors.bedrooms?.message}>
//               <Input
//                 {...register("bedrooms", { valueAsNumber: true })}
//                 type="number"
//                 min={0}
//               />
//             </Field>
//             <Field label="Bathrooms" error={errors.bathrooms?.message}>
//               <Input
//                 {...register("bathrooms", { valueAsNumber: true })}
//                 type="number"
//                 min={0}
//               />
//             </Field>
//             <Field label="Size (sqft)" error={errors.size?.message}>
//               <Input
//                 {...register("size", { valueAsNumber: true })}
//                 type="number"
//                 placeholder="Optional"
//               />
//             </Field>
//           </div>
//           <Field label="Available From" error={errors.availableFrom?.message}>
//             <Input {...register("availableFrom")} type="date" />
//           </Field>
//           <div className="flex items-center gap-2">
//             <Checkbox
//               id="isNegotiable"
//               defaultChecked={defaultValues?.isNegotiable ?? false}
//               onCheckedChange={(v) => setValue("isNegotiable", !!v)}
//             />
//             <Label htmlFor="isNegotiable" className="text-sm font-normal cursor-pointer">
//               Rent is negotiable
//             </Label>
//           </div>
//         </CardContent>
//       </Card>

//       {/* ── Pricing ── */}
//       <Card>
//         <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
//           <CardTitle className="text-base">Pricing</CardTitle>
//           <Button
//             type="button"
//             size="sm"
//             variant="outline"
//             onClick={handleAIPriceHint}
//             disabled={aiPrice.isPending}
//             className="h-7 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
//           >
//             {aiPrice.isPending
//               ? <Loader2 size={11} className="animate-spin" />
//               : <TrendingUp size={11} />}
//             AI Price Hint
//           </Button>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-3 gap-4">
//             <Field label="Monthly Rent (৳)" error={errors.rentAmount?.message}>
//               <Input
//                 {...register("rentAmount", { valueAsNumber: true })}
//                 type="number"
//                 min={0}
//               />
//             </Field>
//             <Field label="Advance Deposit (৳)" error={errors.advanceDeposit?.message}>
//               <Input
//                 {...register("advanceDeposit", { valueAsNumber: true })}
//                 type="number"
//                 min={0}
//               />
//             </Field>
//             <Field label="Booking Fee (৳)" error={errors.bookingFee?.message}>
//               <Input
//                 {...register("bookingFee", { valueAsNumber: true })}
//                 type="number"
//                 min={0}
//               />
//             </Field>
//           </div>
//         </CardContent>
//       </Card>

//       {/* ── Images ── */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-base">Image URLs</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-2">
//           <p className="text-xs text-muted-foreground">
//             Paste Cloudinary URLs — one per line (max 10)
//           </p>
//           <Field label="" error={errors.images?.message}>
//             <Textarea
//               rows={4}
//               className="resize-none font-mono text-xs"
//               value={imagesValue.join("\n")}
//               onChange={(e) =>
//                 setValue(
//                   "images",
//                   e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
//                 )
//               }
//               placeholder={"https://res.cloudinary.com/…\nhttps://res.cloudinary.com/…"}
//             />
//           </Field>
//         </CardContent>
//       </Card>

//       {/* ── Submit ── */}
//       <div className="flex justify-end">
//         <Button
//           type="submit"
//           disabled={isSubmitting}
//           className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8"
//         >
//           {isSubmitting && <Loader2 size={15} className="animate-spin" />}
//           {submitLabel}
//         </Button>
//       </div>

//     </form>
//   );
// }

// // ─── Field helper ─────────────────────────────────────────────────────────────
// function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
//   return (
//     <div className="space-y-1.5">
//       {label && <Label className="text-sm">{label}</Label>}
//       {children}
//       {error && <p className="text-xs text-destructive">{error}</p>}
//     </div>
//   );
// }
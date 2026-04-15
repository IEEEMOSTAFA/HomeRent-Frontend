"use client"
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

export function useAIDescription(input: { title: string; type: PropertyType }) {
  return useQuery<{ description: string }>({
    queryKey: ["ai", "description", input],
    queryFn: async () => {
      const res = await apiFetch<{ description: string }>("/ai/description", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return res; // Return the full response object
    },
    enabled: !!input.title && !!input.type,
  });
}

// ─── AI PRICE HINT ────────────────────────────────────────────────────────────

export function useAIPriceHint(input: { type: PropertyType; area: string; size: number }) {
  return useQuery<{ priceHint: number }>({
    queryKey: ["ai", "priceHint", input],
    queryFn: async () => {
      const res = await apiFetch<{ priceHint: number }>("/ai/price-hint", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return res; // Return the full response object
    },
    enabled: !!input.type && !!input.area && !!input.size,
  });
}





























































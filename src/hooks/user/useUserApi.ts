"use client"
// src/hooks/user/useUserApi.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { User } from "../../types,/user";

// ─── TYPES ───────────────────────────────────────────────────────────────────

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
  | "PENDING"
  | "ACCEPTED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "DECLINED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

// Main Property Interface
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
  booking?: {
    id: string;
    property?: {
      id: string;
      title: string;
      city: string;
      area: string;
      images: string[];
    };
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

  property: Pick<
    Property,
    "id" | "title" | "city" | "area" | "images" | "rentAmount" | "bedrooms" | "bathrooms"
  > & {
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

export interface UserNotification {
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

// ✅ একটাই PaginatedResponse interface — duplicate নেই
export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentId: string;
}

// ─── RESPONSE UNWRAPPER ──────────────────────────────────────────────────────

const unwrap = <T>(response: unknown): T => {
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {
    return (response as { data: T }).data;
  }
  throw new Error("Invalid response format");
};

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => apiFetch<{ data: User }>('/users/me').then(unwrap<User>),
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
    queryFn: () => apiFetch("/users/me/stats").then(unwrap<UserStats>),
  });
}

// ─── PROPERTIES ───────────────────────────────────────────────────────────────

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
    queryFn: () => apiFetch(`/properties?${q}`).then(unwrap<PaginatedResponse<Property>>),
  });
}

export function usePublicProperty(id: string) {
  return useQuery<Property>({
    queryKey: ["properties", "public", id],
    queryFn: () => apiFetch(`/properties/${id}`).then(unwrap<Property>),
    enabled: !!id,
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
  if (params?.limit) q.set("pageSize", String(params.limit));
  if (params?.status) q.set("status", params.status);

  return useQuery<BookingListResponse>({
    queryKey: ["user", "bookings", params],
    queryFn: () =>
      apiFetch<{ data: BookingListResponse }>(`/bookings?${q}`).then((res) => {
        const raw = res.data;
        return {
          data: raw.data,
          pagination: raw.pagination,
        };
      }),
    retry: 1,
    staleTime: 30000,
  });
}

export function useBookingById(id: string) {
  return useQuery<Booking>({
    queryKey: ["user", "bookings", id],
    queryFn: () => apiFetch(`/bookings/${id}`).then(unwrap<Booking>),
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
      apiFetch("/payments/create-intent", {
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

  return useQuery({
    queryKey: ["user", "payments", params],
    queryFn: async () => {
      // apiFetch → res.json() করে return করে
      // Backend পাঠায়: { data: [...], pagination: {...} }
      // তাই সরাসরি type করো:
      const res = await apiFetch<{
        data: UserPayment[];
        pagination: {
          total: number;
          page: number;
          pageSize: number;
          totalPages: number;
        };
      }>(`/payments/my-payments?${q}`);

      return {
        data: res.data ?? [],        // ✅ res.data — একবারই .data
        meta: {
          total: res.pagination?.total ?? 0,
          page: res.pagination?.page ?? 1,
          limit: res.pagination?.pageSize ?? 20,
          totalPages: res.pagination?.totalPages ?? 1,
        },
      };
    },
  });
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export function useMyReviews() {
  return useQuery<PaginatedResponse<Review>>({
    queryKey: ["user", "reviews"],
    queryFn: () => apiFetch("/reviews/my").then(unwrap<PaginatedResponse<Review>>),
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
  return useQuery<UserNotification[]>({
    queryKey: ["user", "notifications"],
    queryFn: async () => {
      const res = await apiFetch<{ data: { notifications: UserNotification[] } }>("/notifications");
      if (Array.isArray(res.data?.notifications)) return res.data.notifications;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res)) return res;
      return [];
    },
    retry: 1,
    staleTime: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "notifications"] });
      qc.invalidateQueries({ queryKey: ["user", "stats"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch("/notifications/mark-all-read", { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "notifications"] });
      qc.invalidateQueries({ queryKey: ["user", "stats"] });
    },
  });
}





















// // "use client"
// // src/hooks/user/useUserApi.ts

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiFetch } from "@/lib/api";
// import { User } from "../../types,/user";

// // ─── TYPES ───────────────────────────────────────────────────────────────────

// export type PropertyType =
//   | "FAMILY_FLAT"
//   | "BACHELOR_ROOM"
//   | "SUBLET"
//   | "HOSTEL"
//   | "OFFICE_SPACE"
//   | "COMMERCIAL";

// export type AvailableFor = "FAMILY" | "BACHELOR" | "CORPORATE" | "ANY";
// export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED";

// export type BookingStatus =
//   | "PENDING"
//   | "ACCEPTED"
//   | "PAYMENT_PENDING"
//   | "CONFIRMED"
//   | "DECLINED"
//   | "CANCELLED";

// export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

// // Main Property Interface
// export interface Property {
//   id: string;
//   title: string;
//   description: string;
//   type: PropertyType;
//   status: PropertyStatus;
//   city: string;
//   area: string;
//   address: string;
//   bedrooms: number;
//   bathrooms: number;
//   size: number | null;
//   rentAmount: number;
//   advanceDeposit: number;
//   bookingFee: number;
//   isNegotiable: boolean;
//   availableFrom: string;
//   availableFor: AvailableFor;
//   images: string[];
//   rating: number;
//   totalReviews: number;
//   views: number;
//   publishedAt: string | null;
//   createdAt: string;
//   owner?: {
//     id: string;
//     name: string;
//     image: string | null;
//     ownerProfile: {
//       verified: boolean;
//       rating: number;
//       totalReviews: number;
//       totalProperties: number;
//       phone?: string | null;
//     } | null;
//   };
// }

// export interface UserPayment {
//   id: string;
//   bookingId: string;
//   userId: string;
//   amount: number;
//   currency: string;
//   status: PaymentStatus;
//   stripePaymentIntentId: string | null;
//   receiptUrl: string | null;
//   refundAmount: number | null;
//   refundedAt: string | null;
//   createdAt: string;
//   updatedAt: string;
//   // ✅ Added: booking + property info used in payment history page
//   booking?: {
//     id: string;
//     property?: {
//       id: string;
//       title: string;
//       city: string;
//       area: string;
//       images: string[];
//     };
//   };
// }

// export interface Review {
//   id: string;
//   bookingId: string;
//   propertyId: string;
//   userId: string;
//   rating: number;
//   comment: string | null;
//   isFlagged: boolean;
//   isVisible: boolean;
//   createdAt: string;
//   user?: { id: string; name: string; image: string | null };
//   property?: Pick<Property, "id" | "title" | "images">;
// }

// export interface Booking {
//   id: string;
//   propertyId: string;
//   userId: string;
//   moveInDate: string;
//   moveOutDate: string | null;
//   message: string | null;
//   numberOfTenants: number;
//   rentAmount: number;
//   bookingFee: number;
//   totalAmount: number;
//   status: BookingStatus;
//   cancellationNote: string | null;
//   expiresAt: string | null;
//   confirmedAt: string | null;
//   cancelledAt: string | null;
//   createdAt: string;
//   updatedAt: string;

//   property: Pick<
//     Property,
//     "id" | "title" | "city" | "area" | "images" | "rentAmount" | "bedrooms" | "bathrooms"
//   > & {
//     owner?: Pick<Property["owner"] & object, "id" | "name" | "image">;
//   };

//   user?: { id: string; name: string; email: string; image: string | null };
//   payment: UserPayment | null;
//   review: Review | null;
// }

// export interface CreateBookingInput {
//   propertyId: string;
//   moveInDate: string;
//   message?: string;
//   numberOfTenants?: number;
// }

// export interface CreateReviewInput {
//   bookingId: string;
//   rating: number;
//   comment?: string;
// }

// export interface UserNotification {
//   id: string;
//   userId: string;
//   bookingId: string | null;
//   title: string;
//   message: string;
//   type: "booking_update" | "payment" | "review" | "system";
//   isRead: boolean;
//   actionUrl: string | null;
//   createdAt: string;
// }

// export interface UserStats {
//   totalBookings: number;
//   confirmedBookings: number;
//   pendingBookings: number;
//   cancelledBookings: number;
//   totalPayments: number;
//   totalReviews: number;
//   unreadNotifications: number;
// }

// export interface BookingListResponse {
//   data: Booking[];
//   pagination: {
//     page: number;
//     pageSize: number;
//     total: number;
//     totalPages: number;
//   };
// }

// export interface PaginatedResponse<T> {
//   data: T[];
//   meta: { total: number; page: number; limit: number; totalPages: number };
// }

// export interface CreatePaymentIntentResponse {
//   clientSecret: string;
//   paymentId: string;
// }

// // ─── RESPONSE UNWRAPPER ─────────────────────────────────────────────────────

// const unwrap = <T>(response: unknown): T => {
//   if (
//     typeof response === "object" &&
//     response !== null &&
//     "data" in response
//   ) {
//     return (response as { data: T }).data;
//   }
//   throw new Error("Invalid response format");
// };

// // ─── USER PROFILE ─────────────────────────────────────────────────────────────

// export function useCurrentUser() {
//   return useQuery({
//     queryKey: ["user", "me"],
//     queryFn: () => apiFetch<{ data: User }>('/users/me').then(unwrap<User>),
//   });
// }

// export function useUpdateProfile() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (data: { name?: string; image?: string }) =>
//       apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "me"] }),
//   });
// }

// export function useUserStats() {
//   return useQuery<UserStats>({
//     queryKey: ["user", "stats"],
//     queryFn: () => apiFetch("/users/me/stats").then(unwrap<UserStats>),
//   });
// }

// // ─── PROPERTIES ───────────────────────────────────────────────────────────────

// export function usePublicProperties(params?: {
//   page?: number;
//   city?: string;
//   area?: string;
//   minRent?: number;
//   maxRent?: number;
//   bedrooms?: number;
//   type?: PropertyType;
//   sort?: string;
// }) {
//   const q = new URLSearchParams();
//   if (params?.page) q.set("page", String(params.page));
//   if (params?.city) q.set("city", params.city);
//   if (params?.area) q.set("area", params.area);
//   if (params?.minRent) q.set("minRent", String(params.minRent));
//   if (params?.maxRent) q.set("maxRent", String(params.maxRent));
//   if (params?.bedrooms) q.set("bedrooms", String(params.bedrooms));
//   if (params?.type) q.set("type", params.type);
//   if (params?.sort) q.set("sort", params.sort);

//   return useQuery<PaginatedResponse<Property>>({
//     queryKey: ["properties", "public", params],
//     queryFn: () => apiFetch(`/properties?${q}`).then(unwrap<PaginatedResponse<Property>>),
//   });
// }

// export function usePublicProperty(id: string) {
//   return useQuery<Property>({
//     queryKey: ["properties", "public", id],
//     queryFn: () => apiFetch(`/properties/${id}`).then(unwrap<Property>),
//     enabled: !!id,
//   });
// }

// // ─── BOOKINGS ─────────────────────────────────────────────────────────────────

// export function useMyBookings(params?: {
//   page?: number;
//   limit?: number;
//   status?: BookingStatus;
// }) {
//   const q = new URLSearchParams();
//   if (params?.page) q.set("page", String(params.page));
//   if (params?.limit) q.set("pageSize", String(params.limit));
//   if (params?.status) q.set("status", params.status);

//   return useQuery<BookingListResponse>({
//     queryKey: ["user", "bookings", params],
//     queryFn: () =>
//       apiFetch<{ data: BookingListResponse }>(`/bookings?${q}`).then((res) => {
//         const raw = res.data;
//         return {
//           data: raw.data,
//           pagination: raw.pagination,
//         };
//       }),
//     retry: 1,
//     staleTime: 30000,
//   });
// }

// export function useBookingById(id: string) {
//   return useQuery<Booking>({
//     queryKey: ["user", "bookings", id],
//     queryFn: () => apiFetch(`/bookings/${id}`).then(unwrap<Booking>),
//     enabled: !!id,
//   });
// }

// export function useCreateBooking() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (data: CreateBookingInput) =>
//       apiFetch<Booking>("/bookings", { method: "POST", body: JSON.stringify(data) }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["user", "bookings"] });
//       qc.invalidateQueries({ queryKey: ["user", "stats"] });
//     },
//   });
// }

// export function useCancelBooking() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, cancellationNote }: { id: string; cancellationNote?: string }) =>
//       apiFetch(`/bookings/${id}/cancel`, {
//         method: "PATCH",
//         body: JSON.stringify({ cancellationNote }),
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["user", "bookings"] });
//       qc.invalidateQueries({ queryKey: ["user", "stats"] });
//     },
//   });
// }

// // ─── PAYMENTS ─────────────────────────────────────────────────────────────────

// // ─── PAYMENTS ─────────────────────────────────────────────────────────────────

// export function useCreatePaymentIntent() {
//   return useMutation({
//     mutationFn: (bookingId: string) =>
//       apiFetch("/payments/create-intent", {
//         method: "POST",
//         body: JSON.stringify({ bookingId }),
//       }),
//   });
// }

// export function useConfirmPayment() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ paymentId, stripePaymentIntentId }: { paymentId: string; stripePaymentIntentId: string }) =>
//       apiFetch("/payments/confirm", {
//         method: "POST",
//         body: JSON.stringify({ paymentId, stripePaymentIntentId }),
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["user", "bookings"] });
//       qc.invalidateQueries({ queryKey: ["user", "stats"] });
//       qc.invalidateQueries({ queryKey: ["user", "payments"] });
//     },
//   });
// }

// // export function useMyPayments(params?: { page?: number }) {
// //   const q = new URLSearchParams();
// //   if (params?.page) q.set("page", String(params.page));

// //   return useQuery<PaginatedResponse<UserPayment>>({
// //     queryKey: ["user", "payments", params],
// //     queryFn: () => apiFetch(`/payments/my-payments?${q}`).then(unwrap<PaginatedResponse<UserPayment>>),
// //   });
// // }

// // ─── REVIEWS ──────────────────────────────────────────────────────────────────
// // useUserApi.ts এ এই interface টা আছে:
// export interface PaginatedResponse<T> {
//   data: T[];
//   meta: { total: number; page: number; limit: number; totalPages: number };
// }

// // কিন্তু backend "pagination" key পাঠায়, "meta" না
// // তাই নতুন interface বানান অথবা manually map করুন:

// export function useMyPayments(params?: { page?: number }) {
//   const q = new URLSearchParams();
//   if (params?.page) q.set("page", String(params.page));

//   return useQuery({
//     queryKey: ["user", "payments", params],
//     queryFn: async () => {
//       const res = await apiFetch<{ data: { data: UserPayment[]; pagination: any } }>(
//         `/payments/my-payments?${q}`
//       );
//       const raw = res.data; // ← apiFetch এর outer wrapper
//       return {
//         data: raw.data,           // payments array
//         meta: {
//           total: raw.pagination?.total ?? 0,
//           page: raw.pagination?.page ?? 1,
//           limit: raw.pagination?.pageSize ?? 20,
//           totalPages: raw.pagination?.totalPages ?? 1,
//         },
//       };
//     },
//   });
// }
// export function useMyReviews() {
//   return useQuery<PaginatedResponse<Review>>({
//     queryKey: ["user", "reviews"],
//     queryFn: () => apiFetch("/reviews/my").then(unwrap<PaginatedResponse<Review>>),
//   });
// }

// export function useCreateReview() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (data: CreateReviewInput) =>
//       apiFetch<Review>("/reviews", { method: "POST", body: JSON.stringify(data) }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["user", "reviews"] });
//       qc.invalidateQueries({ queryKey: ["user", "bookings"] });
//       qc.invalidateQueries({ queryKey: ["user", "stats"] });
//     },
//   });
// }

// // ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

// export function useMyNotifications() {
//   return useQuery<UserNotification[]>({
//     queryKey: ["user", "notifications"],
//     queryFn: async () => {
//       const res = await apiFetch<{ data: { notifications: UserNotification[] } }>("/notifications");

//       // Correctly access notifications
//       if (Array.isArray(res.data?.notifications)) return res.data.notifications;

//       // fallback
//       if (Array.isArray(res?.data)) return res.data;
//       if (Array.isArray(res)) return res;

//       return [];
//     },
//     retry: 1,
//     staleTime: 30000,
//   });
// }

// export function useMarkNotificationRead() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) =>
//       apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["user", "notifications"] });
//       qc.invalidateQueries({ queryKey: ["user", "stats"] });
//     },
//   });
// }

// export function useMarkAllNotificationsRead() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: () =>
//       apiFetch("/notifications/mark-all-read", { method: "PATCH" }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["user", "notifications"] });
//       qc.invalidateQueries({ queryKey: ["user", "stats"] });
//     },
//   });
// }




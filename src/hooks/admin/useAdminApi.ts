"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── SHARED TYPES ─────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "OWNER" | "USER";
export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BookingStatus =
  | "PENDING" | "ACCEPTED" | "PAYMENT_PENDING"
  | "CONFIRMED" | "DECLINED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ─── USER TYPES ───────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  ownerProfile: any | null;
  _count?: any;
}

// ─── PROPERTY TYPES ───────────────────────────────────────────────────────────

export interface PendingProperty {
  id: string;
  title: string;
  description: string;
  type: string;
  status: PropertyStatus;
  rejectionReason: string | null;
  city: string;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size: number | null;
  rentAmount: number;
  availableFrom: string;
  availableFor: string;
  images: string[];
  createdAt: string;
  owner: any;
}

// ─── OWNER TYPES ──────────────────────────────────────────────────────────────

export interface UnverifiedOwner {
  id: string;
  userId: string;
  phone: string | null;
  nidNumber: string | null;
  verified: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string; image: string | null };
}

// ─── REVIEW TYPES ─────────────────────────────────────────────────────────────

export interface FlaggedReview {
  id: string;
  bookingId: string;
  propertyId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isFlagged: boolean;
  isVisible: boolean;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
  property: { id: string; title: string; city: string; area: string };
  booking: { id: string; status: BookingStatus };
}

// ─── PAYMENT TYPES ────────────────────────────────────────────────────────────

export interface AdminPayment {
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
  user: { id: string; name: string; email: string };
  booking: {
    id: string;
    status: BookingStatus;
    moveInDate: string;
    totalAmount: number;
    propertyId: string;
    property: { id: string; title: string; city: string; area: string };
  };
}

// ─── BLOG TYPES ───────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name: string; image: string | null };
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  tags?: string[];
  isPublished?: boolean;
}

// ─── ANALYTICS TYPES ──────────────────────────────────────────────────────────

export interface AdminAnalytics {
  totalUsers: number;
  totalOwners: number;
  totalAdmins: number;
  bannedUsers: number;
  newUsersThisMonth: number;
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalRefunds: number;
  totalReviews: number;
  flaggedReviews: number;
  hiddenReviews: number;
  verifiedOwners: number;
  unverifiedOwners: number;
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────

// Analytics Hook
export function useAdminAnalytics() {
  return useQuery<AdminAnalytics>({
    queryKey: ["admin", "analytics"],
    queryFn: () => apiFetch("/admin/analytics"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Users
export function useAdminUsers(params?: {
  page?: number;
  role?: UserRole;
  isBanned?: boolean;
  search?: string;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.role) q.set("role", params.role);
  if (params?.search) q.set("search", params.search);
  if (params?.isBanned !== undefined) q.set("isBanned", String(params.isBanned));

  return useQuery<PaginatedResponse<AdminUser>>({
    queryKey: ["admin", "users", params],
    queryFn: () => apiFetch(`/users?${q}`),
  });
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isBanned }: { id: string; isBanned: boolean }) =>
      apiFetch(`/users/${id}/ban`, { 
        method: "PATCH", 
        body: JSON.stringify({ isBanned }) 
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

// Properties
export function usePendingProperties() {
  return useQuery<PaginatedResponse<PendingProperty>>({
    queryKey: ["admin", "properties", "pending"],
    queryFn: () => apiFetch("/admin/properties/pending"),
  });
}

export function useAllAdminProperties(params?: { page?: number; status?: PropertyStatus }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.status) q.set("status", params.status);

  return useQuery<PaginatedResponse<PendingProperty>>({
    queryKey: ["admin", "properties", "all", params],
    queryFn: () => apiFetch(`/properties?${q}`),
  });
}

export function useApproveProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
      rejectionReason?: string;
    }) =>
      apiFetch(`/admin/properties/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "properties"] });
    },
  });
}

export function useAdminDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/properties/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "properties"] }),
  });
}

// Owners
export function useUnverifiedOwners() {
  return useQuery<UnverifiedOwner[]>({
    queryKey: ["admin", "owners", "unverified"],
    queryFn: () => apiFetch("/admin/owners/unverified"),
  });
}

// useVerifyOwner 
export function useVerifyOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      apiFetch(`/admin/owners/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ verified }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "owners", "unverified"] });
    },
  });
}




// export function useVerifyOwner() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, verified }: { id: string; verified: boolean }) => {
//       console.log("🔄 Verifying owner - ID:", id, "Verified:", verified); // Debug
//       return apiFetch(`/admin/owners/${id}/verify`, {
//         method: "PATCH",
//         body: JSON.stringify({ verified }),
//       });
//     },
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "owners", "unverified"] });
//       toast.success("Owner verification updated successfully");
//     },
//     onError: (error: any) => {
//       console.error("Verify error:", error);
//       toast.error(error?.message || "Failed to update verification");
//     },
//   });
// }









export function useFlaggedReviews() {
  return useQuery<PaginatedResponse<FlaggedReview>>({
    queryKey: ["admin", "reviews", "flagged"],
    queryFn: () => apiFetch("/admin/reviews/flagged"),
  });
}

export function useReviewVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) =>
      apiFetch(`/admin/reviews/${id}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ isHidden }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
}

// Payments
export function useAdminPayments(params?: { page?: number; status?: PaymentStatus }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.status) q.set("status", params.status);

  return useQuery<PaginatedResponse<AdminPayment>>({
    queryKey: ["admin", "payments", params],
    queryFn: () => apiFetch(`/admin/payments?${q}`),
  });
}

export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch(`/admin/payments/${id}/refund`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "payments"] }),
  });
}

// Blog
export function useAdminBlogPosts() {
  return useQuery<PaginatedResponse<BlogPost>>({
    queryKey: ["admin", "blog"],
    queryFn: () => apiFetch("/admin/blog"),
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogPostInput) =>
      apiFetch<BlogPost>("/admin/blog", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBlogPostInput> }) =>
      apiFetch<BlogPost>(`/admin/blog/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });
}

export function usePublishBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiFetch(`/admin/blog/${id}/publish`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/blog/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });
}























































// "use client";

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiFetch } from "@/lib/api";

// // ─── SHARED TYPES ─────────────────────────────────────────────────────────────

// export type UserRole = "ADMIN" | "OWNER" | "USER";
// export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED";
// export type BookingStatus =
//   | "PENDING" | "ACCEPTED" | "PAYMENT_PENDING"
//   | "CONFIRMED" | "DECLINED" | "CANCELLED";
// export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

// export interface PaginatedResponse<T> {
//   data: T[];
//   meta: { total: number; page: number; limit: number; totalPages: number };
// }

// // ─── USER TYPES ───────────────────────────────────────────────────────────────

// export interface AdminUser {
//   id: string;
//   name: string;
//   email: string;
//   image: string | null;
//   role: UserRole;
//   isActive: boolean;
//   isBanned: boolean;
//   createdAt: string;
//   updatedAt: string;
//   ownerProfile: {
//     id: string;
//     verified: boolean;
//     phone: string | null;
//     nidNumber: string | null;
//     totalProperties: number;
//     totalEarnings: number;
//     rating: number;
//   } | null;
//   _count?: {
//     bookings: number;
//     properties: number;
//     reviews: number;
//     payments: number;
//   };
// }

// // ─── PROPERTY TYPES ───────────────────────────────────────────────────────────

// export interface PendingProperty {
//   id: string;
//   title: string;
//   description: string;
//   type: string;
//   status: PropertyStatus;
//   rejectionReason: string | null;
//   city: string;
//   area: string;
//   address: string;
//   bedrooms: number;
//   bathrooms: number;
//   size: number | null;
//   rentAmount: number;
//   availableFrom: string;
//   availableFor: string;
//   images: string[];
//   createdAt: string;
//   owner: {
//     id: string;
//     name: string;
//     email: string;
//     image: string | null;
//     ownerProfile: {
//       verified: boolean;
//       phone: string | null;
//       nidNumber: string | null;
//     } | null;
//   };
// }

// // ─── OWNER TYPES ──────────────────────────────────────────────────────────────

// export interface UnverifiedOwner {
//   id: string;
//   userId: string;
//   phone: string | null;
//   nidNumber: string | null;
//   verified: boolean;
//   createdAt: string;
//   user: { id: string; name: string; email: string; image: string | null };
// }

// // ─── REVIEW TYPES ─────────────────────────────────────────────────────────────

// export interface FlaggedReview {
//   id: string;
//   bookingId: string;
//   propertyId: string;
//   userId: string;
//   rating: number;
//   comment: string | null;
//   isFlagged: boolean;
//   isVisible: boolean;
//   createdAt: string;
//   user: { id: string; name: string; image: string | null };
//   property: { id: string; title: string; city: string; area: string };
//   booking: { id: string; status: BookingStatus };
// }

// // ─── PAYMENT TYPES ────────────────────────────────────────────────────────────

// export interface AdminPayment {
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
//   user: { id: string; name: string; email: string };
//   booking: {
//     id: string;
//     status: BookingStatus;
//     moveInDate: string;
//     totalAmount: number;
//     propertyId: string;
//     property: { id: string; title: string; city: string; area: string };
//   };
// }

// // ─── BLOG TYPES ───────────────────────────────────────────────────────────────

// export interface BlogPost {
//   id: string;
//   authorId: string;
//   title: string;
//   slug: string;
//   excerpt: string;
//   content: string;
//   featuredImage: string | null;
//   tags: string[];
//   isPublished: boolean;
//   publishedAt: string | null;
//   createdAt: string;
//   updatedAt: string;
//   author?: { id: string; name: string; image: string | null };
// }

// export interface CreateBlogPostInput {
//   title: string;
//   slug: string;
//   excerpt: string;
//   content: string;
//   featuredImage?: string;
//   tags?: string[];
//   isPublished?: boolean;
// }

// // ─── ANALYTICS TYPES ──────────────────────────────────────────────────────────

// export interface AdminAnalytics {
//   totalUsers: number;
//   totalOwners: number;
//   totalAdmins: number;
//   bannedUsers: number;
//   newUsersThisMonth: number;
//   totalProperties: number;
//   approvedProperties: number;
//   pendingProperties: number;
//   rejectedProperties: number;
//   totalBookings: number;
//   confirmedBookings: number;
//   pendingBookings: number;
//   cancelledBookings: number;
//   totalRevenue: number;
//   revenueThisMonth: number;
//   totalRefunds: number;
//   totalReviews: number;
//   flaggedReviews: number;
//   hiddenReviews: number;
//   verifiedOwners: number;
//   unverifiedOwners: number;
// }

// // ─── MAIN HOOKS ───────────────────────────────────────────────────────────────

// // Analytics
// export function useAdminAnalytics() {
//   return useQuery<AdminAnalytics>({
//     queryKey: ["admin", "analytics"],
//     queryFn: () => apiFetch("/api/admin/analytics"),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
// }

// // Users
// export function useAdminUsers(params?: {
//   page?: number;
//   role?: UserRole;
//   isBanned?: boolean;
//   search?: string;
// }) {
//   const q = new URLSearchParams();
//   if (params?.page) q.set("page", String(params.page));
//   if (params?.role) q.set("role", params.role);
//   if (params?.search) q.set("search", params.search);
//   if (params?.isBanned !== undefined) q.set("isBanned", String(params.isBanned));

//   return useQuery<PaginatedResponse<AdminUser>>({
//     queryKey: ["admin", "users", params],
//     queryFn: () => apiFetch(`/api/users?${q}`),
//   });
// }

// export function useBanUser() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, isBanned }: { id: string; isBanned: boolean }) =>
//       apiFetch(`/api/users/${id}/ban`, { 
//         method: "PATCH", 
//         body: JSON.stringify({ isBanned }) 
//       }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
//   });
// }

// // Properties
// export function usePendingProperties() {
//   return useQuery<PaginatedResponse<PendingProperty>>({
//     queryKey: ["admin", "properties", "pending"],
//     queryFn: () => apiFetch("/api/admin/properties/pending"),
//   });
// }

// export function useAllAdminProperties(params?: { page?: number; status?: PropertyStatus }) {
//   const q = new URLSearchParams();
//   if (params?.page) q.set("page", String(params.page));
//   if (params?.status) q.set("status", params.status);

//   return useQuery<PaginatedResponse<PendingProperty>>({
//     queryKey: ["admin", "properties", "all", params],
//     queryFn: () => apiFetch(`/api/properties?${q}`),
//   });
// }

// export function useApproveProperty() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({
//       id,
//       status,
//       rejectionReason,
//     }: {
//       id: string;
//       status: "APPROVED" | "REJECTED";
//       rejectionReason?: string;
//     }) =>
//       apiFetch(`/api/admin/properties/${id}/status`, {
//         method: "PATCH",
//         body: JSON.stringify({ status, rejectionReason }),
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "properties"] });
//     },
//   });
// }

// export function useAdminDeleteProperty() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) =>
//       apiFetch(`/api/admin/properties/${id}`, { method: "DELETE" }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "properties"] }),
//   });
// }

// // Owners
// export function useUnverifiedOwners() {
//   return useQuery<UnverifiedOwner[]>({
//     queryKey: ["admin", "owners", "unverified"],
//     queryFn: () => apiFetch("/api/admin/owners/unverified"),
//   });
// }

// export function useVerifyOwner() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
//       apiFetch(`/api/admin/owners/${id}/verify`, {
//         method: "PATCH",
//         body: JSON.stringify({ verified }),
//       }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "owners"] }),
//   });
// }

// // Reviews
// export function useFlaggedReviews() {
//   return useQuery<PaginatedResponse<FlaggedReview>>({
//     queryKey: ["admin", "reviews", "flagged"],
//     queryFn: () => apiFetch("/api/admin/reviews/flagged"),
//   });
// }

// export function useReviewVisibility() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) =>
//       apiFetch(`/api/admin/reviews/${id}/visibility`, {
//         method: "PATCH",
//         body: JSON.stringify({ isHidden }),
//       }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reviews"] }),
//   });
// }

// // Payments
// export function useAdminPayments(params?: { page?: number; status?: PaymentStatus }) {
//   const q = new URLSearchParams();
//   if (params?.page) q.set("page", String(params.page));
//   if (params?.status) q.set("status", params.status);

//   return useQuery<PaginatedResponse<AdminPayment>>({
//     queryKey: ["admin", "payments", params],
//     queryFn: () => apiFetch(`/api/admin/payments?${q}`),
//   });
// }

// export function useRefundPayment() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, reason }: { id: string; reason: string }) =>
//       apiFetch(`/api/admin/payments/${id}/refund`, {
//         method: "POST",
//         body: JSON.stringify({ reason }),
//       }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "payments"] }),
//   });
// }

// // Blog
// export function useAdminBlogPosts() {
//   return useQuery<PaginatedResponse<BlogPost>>({
//     queryKey: ["admin", "blog"],
//     queryFn: () => apiFetch("/api/admin/blog"),
//   });
// }

// export function useCreateBlogPost() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (data: CreateBlogPostInput) =>
//       apiFetch<BlogPost>("/api/admin/blog", { method: "POST", body: JSON.stringify(data) }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
//   });
// }

// export function useUpdateBlogPost() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: Partial<CreateBlogPostInput> }) =>
//       apiFetch<BlogPost>(`/api/admin/blog/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
//   });
// }

// export function usePublishBlogPost() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
//       apiFetch(`/api/admin/blog/${id}/publish`, {
//         method: "PATCH",
//         body: JSON.stringify({ isPublished }),
//       }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
//   });
// }

// export function useDeleteBlogPost() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) =>
//       apiFetch(`/api/admin/blog/${id}`, { method: "DELETE" }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
//   });
// }




































// // src/hooks/admin/useAdminApi.ts
// // Matches: admin_route.ts — /api/admin/* + /api/users

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiFetch } from "@/lib/api";

// // ─── SHARED TYPES ─────────────────────────────────────────────────────────────

// export type UserRole = "ADMIN" | "OWNER" | "USER";
// export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED";
// export type BookingStatus =
//   | "PENDING" | "ACCEPTED" | "PAYMENT_PENDING"
//   | "CONFIRMED" | "DECLINED" | "CANCELLED";
// export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

// export interface PaginatedResponse<T> {
//   data: T[];
//   meta: { total: number; page: number; limit: number; totalPages: number };
// }

// // ─── USER TYPES ───────────────────────────────────────────────────────────────

// export interface AdminUser {
//   id: string;
//   name: string;
//   email: string;
//   image: string | null;
//   role: UserRole;
//   isActive: boolean;
//   isBanned: boolean;
//   createdAt: string;
//   updatedAt: string;
//   ownerProfile: {
//     id: string;
//     verified: boolean;
//     phone: string | null;
//     nidNumber: string | null;
//     totalProperties: number;
//     totalEarnings: number;
//     rating: number;
//   } | null;
//   _count?: {
//     bookings: number;
//     properties: number;
//     reviews: number;
//     payments: number;
//   };
// }

// // ─── PROPERTY TYPES ───────────────────────────────────────────────────────────

// export interface PendingProperty {
//   id: string;
//   title: string;
//   description: string;
//   type: string;
//   status: PropertyStatus;
//   rejectionReason: string | null;
//   city: string;
//   area: string;
//   address: string;
//   bedrooms: number;
//   bathrooms: number;
//   size: number | null;
//   rentAmount: number;
//   availableFrom: string;
//   availableFor: string;
//   images: string[];
//   createdAt: string;
//   owner: {
//     id: string;
//     name: string;
//     email: string;
//     image: string | null;
//     ownerProfile: {
//       verified: boolean;
//       phone: string | null;
//       nidNumber: string | null;
//     } | null;
//   };
// }

// // ─── OWNER TYPES ──────────────────────────────────────────────────────────────

// export interface UnverifiedOwner {
//   id: string;
//   userId: string;
//   phone: string | null;
//   nidNumber: string | null;
//   verified: boolean;
//   createdAt: string;
//   user: { id: string; name: string; email: string; image: string | null };
// }

// // ─── REVIEW TYPES ─────────────────────────────────────────────────────────────

// export interface FlaggedReview {
//   id: string;
//   bookingId: string;
//   propertyId: string;
//   userId: string;
//   rating: number;
//   comment: string | null;
//   isFlagged: boolean;
//   isVisible: boolean;
//   createdAt: string;
//   user: { id: string; name: string; image: string | null };
//   property: { id: string; title: string; city: string; area: string };
//   booking: { id: string; status: BookingStatus };
// }

// // ─── PAYMENT TYPES ────────────────────────────────────────────────────────────

// export interface AdminPayment {
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
//   user: { id: string; name: string; email: string };
//   booking: {
//     id: string;
//     status: BookingStatus;
//     moveInDate: string;
//     totalAmount: number;
//     propertyId: string;
//     property: { id: string; title: string; city: string; area: string };
//   };
// }

// // ─── BLOG TYPES ───────────────────────────────────────────────────────────────

// export interface BlogPost {
//   id: string;
//   authorId: string;
//   title: string;
//   slug: string;
//   excerpt: string;
//   content: string;
//   featuredImage: string | null;
//   tags: string[];
//   isPublished: boolean;
//   publishedAt: string | null;
//   createdAt: string;
//   updatedAt: string;
//   author?: { id: string; name: string; image: string | null };
// }

// export interface CreateBlogPostInput {
//   title: string;
//   slug: string;
//   excerpt: string;
//   content: string;
//   featuredImage?: string;
//   tags?: string[];
//   isPublished?: boolean;
// }

// // ─── ANALYTICS TYPES ──────────────────────────────────────────────────────────

// export interface AdminAnalytics {
//   totalUsers: number;
//   totalOwners: number;
//   totalAdmins: number;
//   bannedUsers: number;
//   newUsersThisMonth: number;
//   totalProperties: number;
//   approvedProperties: number;
//   pendingProperties: number;
//   rejectedProperties: number;
//   totalBookings: number;
//   confirmedBookings: number;
//   pendingBookings: number;
//   cancelledBookings: number;
//   totalRevenue: number;
//   revenueThisMonth: number;
//   totalRefunds: number;
//   totalReviews: number;
//   flaggedReviews: number;
//   hiddenReviews: number;
//   verifiedOwners: number;
//   unverifiedOwners: number;
// }

// // ─── ANALYTICS ────────────────────────────────────────────────────────────────

// export function useAdminAnalytics() {
//   return useQuery<AdminAnalytics>({
//     queryKey: ["admin", "analytics"],
//     queryFn: () => apiFetch("/admin/analytics"),
//   });
// }

// // ─── USERS — GET /api/users | PATCH /api/users/:id/ban ────────────────────────

// export function useAdminUsers(params?: {
//   page?: number;
//   role?: UserRole;
//   isBanned?: boolean;
//   search?: string;
// }) {
//   const q = new URLSearchParams();
//   if (params?.page)     q.set("page",     String(params.page));
//   if (params?.role)     q.set("role",     params.role);
//   if (params?.search)   q.set("search",   params.search);
//   if (params?.isBanned !== undefined) q.set("isBanned", String(params.isBanned));
//   return useQuery<PaginatedResponse<AdminUser>>({
//     queryKey: ["admin", "users", params],
//     queryFn: () => apiFetch(`/users?${q}`),
//   });
// }

// export function useBanUser() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, isBanned }: { id: string; isBanned: boolean }) =>
//       apiFetch(`/users/${id}/ban`, { method: "PATCH", body: JSON.stringify({ isBanned }) }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
//   });
// }

// // ─── PROPERTIES — GET /api/admin/properties/pending | PATCH status ────────────

// export function usePendingProperties() {
//   return useQuery<PaginatedResponse<PendingProperty>>({
//     queryKey: ["admin", "properties", "pending"],
//     queryFn: () => apiFetch("/admin/properties/pending"),
//   });
// }

// export function useAllAdminProperties(params?: { page?: number; status?: PropertyStatus }) {
//   const q = new URLSearchParams();
//   if (params?.page)   q.set("page",   String(params.page));
//   if (params?.status) q.set("status", params.status);
//   return useQuery<PaginatedResponse<PendingProperty>>({
//     queryKey: ["admin", "properties", "all", params],
//     queryFn: () => apiFetch(`/properties?${q}`),
//   });
// }

// export function useApproveProperty() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({
//       id,
//       status,
//       rejectionReason,
//     }: {
//       id: string;
//       status: "APPROVED" | "REJECTED";
//       rejectionReason?: string;
//     }) =>
//       apiFetch(`/admin/properties/${id}/status`, {
//         method: "PATCH",
//         body: JSON.stringify({ status, rejectionReason }),
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "properties"] });
//     },
//   });
// }

// export function useAdminDeleteProperty() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) =>
//       apiFetch(`/admin/properties/${id}`, { method: "DELETE" }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "properties"] }),
//   });
// }

// // ─── OWNERS — GET /api/admin/owners/unverified | PATCH verify ─────────────────

// export function useUnverifiedOwners() {
//   return useQuery<UnverifiedOwner[]>({
//     queryKey: ["admin", "owners", "unverified"],
//     queryFn: () => apiFetch("/admin/owners/unverified"),
//   });
// }

// export function useVerifyOwner() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
//       apiFetch(`/admin/owners/${id}/verify`, {
//         method: "PATCH",
//         body: JSON.stringify({ verified }),
//       }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "owners"] }),
//   });
// }

// // ─── REVIEWS — GET flagged | PATCH visibility ─────────────────────────────────

// export function useFlaggedReviews() {
//   return useQuery<PaginatedResponse<FlaggedReview>>({
//     queryKey: ["admin", "reviews", "flagged"],
//     queryFn: () => apiFetch("/admin/reviews/flagged"),
//   });
// }

// export function useReviewVisibility() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) =>
//       apiFetch(`/admin/reviews/${id}/visibility`, {
//         method: "PATCH",
//         body: JSON.stringify({ isHidden }),
//       }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reviews"] }),
//   });
// }

// // ─── PAYMENTS — GET all | POST refund ─────────────────────────────────────────

// export function useAdminPayments(params?: { page?: number; status?: PaymentStatus }) {
//   const q = new URLSearchParams();
//   if (params?.page)   q.set("page",   String(params.page));
//   if (params?.status) q.set("status", params.status);
//   return useQuery<PaginatedResponse<AdminPayment>>({
//     queryKey: ["admin", "payments", params],
//     queryFn: () => apiFetch(`/admin/payments?${q}`),
//   });
// }

// export function useRefundPayment() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, reason }: { id: string; reason: string }) =>
//       apiFetch(`/admin/payments/${id}/refund`, {
//         method: "POST",
//         body: JSON.stringify({ reason }),
//       }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "payments"] }),
//   });
// }

// // ─── BLOG ─────────────────────────────────────────────────────────────────────

// export function useAdminBlogPosts() {
//   return useQuery<PaginatedResponse<BlogPost>>({
//     queryKey: ["admin", "blog"],
//     queryFn: () => apiFetch("/admin/blog"),
//   });
// }

// export function useCreateBlogPost() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (data: CreateBlogPostInput) =>
//       apiFetch<BlogPost>("/admin/blog", { method: "POST", body: JSON.stringify(data) }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
//   });
// }

// export function useUpdateBlogPost() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: Partial<CreateBlogPostInput> }) =>
//       apiFetch<BlogPost>(`/admin/blog/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
//   });
// }

// export function usePublishBlogPost() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
//       apiFetch(`/admin/blog/${id}/publish`, {
//         method: "PATCH",
//         body: JSON.stringify({ isPublished }),
//       }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
//   });
// }

// export function useDeleteBlogPost() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) =>
//       apiFetch(`/admin/blog/${id}`, { method: "DELETE" }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
//   });
// }
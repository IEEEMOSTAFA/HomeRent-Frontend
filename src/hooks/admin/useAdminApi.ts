"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── TYPES ─────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "OWNER" | "USER";
export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "DECLINED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ─── USER TYPES ────────────────────────────────────────────────────────
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
  ownerProfile?: any;
}

// ─── PROPERTY TYPES ────────────────────────────────────────────────────
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
  owner: {
    id: string;
    name: string;
    email: string;
    ownerProfile?: { verified: boolean };
  };
}

// ─── OWNER TYPES ───────────────────────────────────────────────────────
export interface UnverifiedOwner {
  id: string;
  userId: string;
  phone: string | null;
  nidNumber: string | null;
  verified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

// ─── REVIEW TYPES ──────────────────────────────────────────────────────
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
}

// ─── PAYMENT TYPES ─────────────────────────────────────────────────────
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
    property: { id: string; title: string; city: string; area: string };
  };
}

// ─── BLOG TYPES ────────────────────────────────────────────────────────
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

// ─── ANALYTICS TYPES ───────────────────────────────────────────────────
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

// ─── HOOKS ─────────────────────────────────────────────────────────────

// Analytics (Dashboard) - Fixed for Real-time Update
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

// ─── HOOKS ─────────────────────────────────────────────────────────────

// FIXED: Analytics Hook - Backend response wrapper ({success, data}) handle করা হয়েছে
// export function useAdminAnalytics() {
//   return useQuery<AdminAnalytics>({
//     queryKey: ["admin", "analytics"],
//     queryFn: async () => {
//       const response = await apiFetch("/admin/analytics");
//       // Backend { success, message, data } ফরম্যাট থেকে শুধু data নিচ্ছি
//       return response?.data  ?? response;
//     },
//     staleTime: 0,
//     gcTime: 0,
//     refetchOnWindowFocus: true,
//     refetchOnMount: true,
//     refetchOnReconnect: true,
//     retry: 2,
//   });
// }



// FIXED: Analytics Hook with proper TypeScript handling
export function useAdminAnalytics() {
  return useQuery<AdminAnalytics>({
    queryKey: ["admin", "analytics"],
    queryFn: async (): Promise<AdminAnalytics> => {
      const response: any = await apiFetch("/admin/analytics");
      
      // Backend থেকে { success, message, data } আসে
      if (response?.success === true && response?.data) {
        return response.data;
      }

      // Fallback যদি সরাসরি data আসে
      return response as AdminAnalytics;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 2,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isBanned }: { id: string; isBanned: boolean }) =>
      apiFetch(`/users/${id}/ban`, {
        method: "PATCH",
        body: JSON.stringify({ isBanned }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}

// Properties
export function usePendingProperties() {
  return useQuery<PaginatedResponse<PendingProperty>>({
    queryKey: ["admin", "properties", "pending"],
    queryFn: () => apiFetch("/admin/properties/pending"),
  });
}

export function useApproveProperty() {
  const queryClient = useQueryClient();
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "properties"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "properties", "pending"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}

export function useAdminDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/properties/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "properties"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}

// Owners
export function useUnverifiedOwners() {
  return useQuery<UnverifiedOwner[]>({
    queryKey: ["admin", "owners", "unverified"],
    queryFn: () => apiFetch("/admin/owners/unverified"),
  });
}

export function useVerifyOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      apiFetch(`/admin/owners/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ verified }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "owners"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}

// Reviews
export function useFlaggedReviews() {
  return useQuery<PaginatedResponse<FlaggedReview>>({
    queryKey: ["admin", "reviews", "flagged"],
    queryFn: () => apiFetch("/admin/reviews/flagged"),
  });
}

export function useReviewVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      apiFetch(`/admin/reviews/${id}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ isVisible }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}

// Payments
export function useAdminPayments(params?: {
  page?: number;
  status?: PaymentStatus;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.status) q.set("status", params.status);

  return useQuery<PaginatedResponse<AdminPayment>>({
    queryKey: ["admin", "payments", params],
    queryFn: () => apiFetch(`/admin/payments?${q}`),
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, refundAmount }: { id: string; refundAmount?: number }) =>
      apiFetch(`/admin/payments/${id}/refund`, {
        method: "POST",
        body: JSON.stringify({ refundAmount }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "payments"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogPostInput) =>
      apiFetch<BlogPost>("/admin/blog", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBlogPostInput> }) =>
      apiFetch<BlogPost>(`/admin/blog/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
  });
}

export function usePublishBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiFetch(`/admin/blog/${id}/publish`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/blog/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
  });
}




























// "use client";

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiFetch } from "@/lib/api";

// // ─── TYPES ─────────────────────────────────────────────────────────────

// export type UserRole = "ADMIN" | "OWNER" | "USER";
// export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED";
// export type BookingStatus =
//   | "PENDING"
//   | "ACCEPTED"
//   | "PAYMENT_PENDING"
//   | "CONFIRMED"
//   | "DECLINED"
//   | "CANCELLED";
// export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

// export interface PaginatedResponse<T> {
//   data: T[];
//   pagination: {
//     total: number;
//     page: number;
//     pageSize: number;
//     totalPages: number;
//   };
// }

// // ─── USER TYPES ────────────────────────────────────────────────────────
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
//   ownerProfile?: any;
// }

// // ─── PROPERTY TYPES ────────────────────────────────────────────────────
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
//     ownerProfile?: { verified: boolean };
//   };
// }

// // ─── OWNER TYPES ───────────────────────────────────────────────────────
// export interface UnverifiedOwner {
//   id: string;
//   userId: string;
//   phone: string | null;
//   nidNumber: string | null;
//   verified: boolean;
//   createdAt: string;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     image: string | null;
//   };
// }

// // ─── REVIEW TYPES ──────────────────────────────────────────────────────
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
// }

// // ─── PAYMENT TYPES ─────────────────────────────────────────────────────
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
//     property: { id: string; title: string; city: string; area: string };
//   };
// }

// // ─── BLOG TYPES ────────────────────────────────────────────────────────
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

// // ─── ANALYTICS TYPES ───────────────────────────────────────────────────
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

// // ─── HOOKS ─────────────────────────────────────────────────────────────

// // Analytics (Dashboard)
// export function useAdminAnalytics() {
//   return useQuery<AdminAnalytics>({
//     queryKey: ["admin", "analytics"],
//     queryFn: () => apiFetch("/admin/analytics"),
//     staleTime: 0,
//     refetchOnWindowFocus: true,
//     refetchOnMount: true,
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
//     queryFn: () => apiFetch(`/users?${q}`),
//   });
// }

// export function useBanUser() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, isBanned }: { id: string; isBanned: boolean }) =>
//       apiFetch(`/users/${id}/ban`, {
//         method: "PATCH",
//         body: JSON.stringify({ isBanned }),
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "users"] });
//       qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
//     },
//   });
// }

// // Properties
// export function usePendingProperties() {
//   return useQuery<PaginatedResponse<PendingProperty>>({
//     queryKey: ["admin", "properties", "pending"],
//     queryFn: () => apiFetch("/admin/properties/pending"),
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
//       qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
//     },
//   });
// }

// export function useAdminDeleteProperty() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) =>
//       apiFetch(`/admin/properties/${id}`, { method: "DELETE" }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "properties"] });
//       qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
//     },
//   });
// }

// // Owners
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
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "owners"] });
//       qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
//     },
//   });
// }

// // Reviews
// export function useFlaggedReviews() {
//   return useQuery<PaginatedResponse<FlaggedReview>>({
//     queryKey: ["admin", "reviews", "flagged"],
//     queryFn: () => apiFetch("/admin/reviews/flagged"),
//   });
// }

// export function useReviewVisibility() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
//       apiFetch(`/admin/reviews/${id}/visibility`, {
//         method: "PATCH",
//         body: JSON.stringify({ isVisible }),
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
//     },
//   });
// }

// // Payments
// export function useAdminPayments(params?: {
//   page?: number;
//   status?: PaymentStatus;
// }) {
//   const q = new URLSearchParams();
//   if (params?.page) q.set("page", String(params.page));
//   if (params?.status) q.set("status", params.status);

//   return useQuery<PaginatedResponse<AdminPayment>>({
//     queryKey: ["admin", "payments", params],
//     queryFn: () => apiFetch(`/admin/payments?${q}`),
//   });
// }

// export function useRefundPayment() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, refundAmount }: { id: string; refundAmount?: number }) =>
//       apiFetch(`/admin/payments/${id}/refund`, {
//         method: "POST",
//         body: JSON.stringify({ refundAmount }),
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "payments"] });
//       qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
//     },
//   });
// }

// // Blog
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
//       apiFetch<BlogPost>("/admin/blog", {
//         method: "POST",
//         body: JSON.stringify(data),
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "blog"] });
//     },
//   });
// }

// export function useUpdateBlogPost() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: Partial<CreateBlogPostInput> }) =>
//       apiFetch<BlogPost>(`/admin/blog/${id}`, {
//         method: "PATCH",
//         body: JSON.stringify(data),
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "blog"] });
//     },
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
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "blog"] });
//     },
//   });
// }

// export function useDeleteBlogPost() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) =>
//       apiFetch(`/admin/blog/${id}`, { method: "DELETE" }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["admin", "blog"] });
//     },
//   });
// }































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

// // export interface PaginatedResponse<T> {
// //   data: T[];
// //   meta: { total: number; page: number; limit: number; totalPages: number };
// // }

// // ─── USER TYPES ───────────────────────────────────────────────────────────────


// export interface PaginatedResponse<T> {
//   data: T[];
//   pagination: { // ← "meta" থেকে "pagination" করো
//     total: number;
//     page: number;
//     pageSize: number; // ← "limit" না, "pageSize"
//     totalPages: number;
//   };
// }
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
//   ownerProfile: any | null;
//   _count?: any;
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
//   owner: any;
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

// // ─── HOOKS ────────────────────────────────────────────────────────────────────

// // Analytics Hook
// // export function useAdminAnalytics() {
// //   return useQuery<AdminAnalytics>({
// //     queryKey: ["admin", "analytics"],
// //     queryFn: () => apiFetch("/admin/analytics"),
// //     staleTime: 5 * 60 * 1000, // 5 minutes
// //   });
// // }

// export function useAdminAnalytics() {
//   return useQuery<AdminAnalytics>({
//     queryKey: ["admin", "analytics"],
//     queryFn: () => apiFetch("/admin/analytics"),
//     staleTime: 0,              // ← প্রতিবার page focus হলেই fresh fetch করবে
//     refetchOnWindowFocus: true, // ← tab-এ ফিরে আসলেও refetch হবে
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
//     queryFn: () => apiFetch(`/users?${q}`),
//   });
// }

// export function useBanUser() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, isBanned }: { id: string; isBanned: boolean }) =>
//       apiFetch(`/users/${id}/ban`, { 
//         method: "PATCH", 
//         body: JSON.stringify({ isBanned }) 
//       }),
//     // onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),


//     onSuccess: () => {
//   qc.invalidateQueries({ queryKey: ["admin", "users"] });
//   qc.invalidateQueries({ queryKey: ["admin", "analytics"] }); // ← যোগ করো
// },
//   });
// }

// // Properties
// export function usePendingProperties() {
//   return useQuery<PaginatedResponse<PendingProperty>>({
//     queryKey: ["admin", "properties", "pending"],
//     queryFn: () => apiFetch("/admin/properties/pending"),
//   });
// }

// export function useAllAdminProperties(params?: { page?: number; status?: PropertyStatus }) {
//   const q = new URLSearchParams();
//   if (params?.page) q.set("page", String(params.page));
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
//     // onSuccess: () => {
//     //   qc.invalidateQueries({ queryKey: ["admin", "properties"] });
//     // },



//     // useApproveProperty
// onSuccess: () => {
//   qc.invalidateQueries({ queryKey: ["admin", "properties"] });
//   qc.invalidateQueries({ queryKey: ["admin", "analytics"] }); // ← যোগ করো
// },
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

// // Owners
// export function useUnverifiedOwners() {
//   return useQuery<UnverifiedOwner[]>({
//     queryKey: ["admin", "owners", "unverified"],
//     queryFn: () => apiFetch("/admin/owners/unverified"),
//   });
// }

// // useVerifyOwner 
// export function useVerifyOwner() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
//       apiFetch(`/admin/owners/${id}/verify`, {
//         method: "PATCH",
//         body: JSON.stringify({ verified }),
//       }),
//     // onSuccess: () => {
//     //   qc.invalidateQueries({ queryKey: ["admin", "owners", "unverified"] });
//     // },

//     onSuccess: () => {
//   qc.invalidateQueries({ queryKey: ["admin", "owners"] });
//   qc.invalidateQueries({ queryKey: ["admin", "analytics"] }); // ← যোগ করো
// },
//   });
// }




// // export function useVerifyOwner() {
// //   const qc = useQueryClient();
// //   return useMutation({
// //     mutationFn: ({ id, verified }: { id: string; verified: boolean }) => {
// //       console.log("🔄 Verifying owner - ID:", id, "Verified:", verified); // Debug
// //       return apiFetch(`/admin/owners/${id}/verify`, {
// //         method: "PATCH",
// //         body: JSON.stringify({ verified }),
// //       });
// //     },
// //     onSuccess: () => {
// //       qc.invalidateQueries({ queryKey: ["admin", "owners", "unverified"] });
// //       toast.success("Owner verification updated successfully");
// //     },
// //     onError: (error: any) => {
// //       console.error("Verify error:", error);
// //       toast.error(error?.message || "Failed to update verification");
// //     },
// //   });
// // }









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

// // Payments
// export function useAdminPayments(params?: { page?: number; status?: PaymentStatus }) {
//   const q = new URLSearchParams();
//   if (params?.page) q.set("page", String(params.page));
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

// // Blog
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
























































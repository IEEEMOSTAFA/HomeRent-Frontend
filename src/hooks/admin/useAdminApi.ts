// "use client";

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
    ownerProfile?: { verified: boolean; phone?: string; nidNumber?: string };
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

export interface FlaggedReviewsResponse {
  data: FlaggedReview[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

// ─── BOOKING TYPES ─────────────────────────────────────────────────────
export interface AdminBooking {
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
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    city: string;
    area: string;
    images: string[];
    rentAmount: number;
  };
  user: { id: string; name: string; email: string; image: string | null };
  payment: { id: string; status: PaymentStatus; amount: number; receiptUrl: string | null } | null;
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

// ─── HELPER: Backend Response Unwrap ───────────────────────────────────
//
// Backend সবসময় এই format এ পাঠায়:
//   { success: true, data: { data: [...], pagination: {...} } }
//
// এই helper টা সেই double-nesting handle করে।
//
function unwrapPaginated<T>(res: any): PaginatedResponse<T> {
  // Case 1: { success: true, data: { data: [...], pagination: {...} } }  ← সবচেয়ে common
  if (res?.success === true && res?.data?.data !== undefined) {
    return {
      data: res.data.data ?? [],
      pagination: res.data.pagination ?? res.data.meta ?? {
        total: 0, page: 1, pageSize: 10, totalPages: 0,
      },
    };
  }

  // Case 2: { success: true, data: [...] }  ← array সরাসরি data তে
  if (res?.success === true && Array.isArray(res?.data)) {
    return {
      data: res.data,
      pagination: res.pagination ?? res.meta ?? {
        total: res.data.length, page: 1, pageSize: res.data.length, totalPages: 1,
      },
    };
  }

  // Case 3: { data: [...], pagination: {...} }  ← wrapper ছাড়া
  if (Array.isArray(res?.data)) {
    return {
      data: res.data,
      pagination: res.pagination ?? { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    };
  }

  // Case 4: সরাসরি array
  if (Array.isArray(res)) {
    return {
      data: res,
      pagination: { total: res.length, page: 1, pageSize: res.length, totalPages: 1 },
    };
  }

  return res;
}

// ─── HOOKS ─────────────────────────────────────────────────────────────

// Analytics
export function useAdminAnalytics() {
  return useQuery<AdminAnalytics>({
    queryKey: ["admin", "analytics"],
    queryFn: async (): Promise<AdminAnalytics> => {
      const res: any = await apiFetch("/admin/analytics");
      if (res?.success === true && res?.data) return res.data;
      return res as AdminAnalytics;
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
  if (params?.page)   q.set("page",    String(params.page));
  if (params?.role)   q.set("role",    params.role);
  if (params?.search) q.set("search",  params.search);
  if (params?.isBanned !== undefined) q.set("isBanned", String(params.isBanned));

  return useQuery<PaginatedResponse<AdminUser>>({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const res: any = await apiFetch(`/users?${q}`);
      return unwrapPaginated<AdminUser>(res);
    },
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

// Properties — Pending
export function usePendingProperties() {
  return useQuery<PaginatedResponse<PendingProperty>>({
    queryKey: ["admin", "properties", "pending"],
    queryFn: async () => {
      const res: any = await apiFetch("/admin/properties/pending");
      return unwrapPaginated<PendingProperty>(res);
    },
  });
}

// Properties — All (admin view)
export function useAllAdminProperties(params?: {
  page?: number;
  status?: PropertyStatus;
}) {
  const q = new URLSearchParams();
  if (params?.page)   q.set("page",   String(params.page));
  if (params?.status) q.set("status", params.status);

  return useQuery<PaginatedResponse<PendingProperty>>({
    queryKey: ["admin", "properties", "all", params],
    queryFn: async () => {
      const res: any = await apiFetch(`/properties?${q}`);
      return unwrapPaginated<PendingProperty>(res);
    },
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
  return useQuery<PaginatedResponse<UnverifiedOwner>>({
    queryKey: ["admin", "owners", "unverified"],
    queryFn: async () => {
      const res: any = await apiFetch("/admin/owners/unverified");
      return unwrapPaginated<UnverifiedOwner>(res);
    },
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

// Reviews — Flagged
export function useFlaggedReviews() {
  return useQuery<FlaggedReviewsResponse>({
    queryKey: ["admin", "reviews", "flagged"],
    queryFn: async (): Promise<FlaggedReviewsResponse> => {
      const res: any = await apiFetch("/admin/reviews/flagged");
      const unwrapped = unwrapPaginated<FlaggedReview>(res);
      return {
        data: unwrapped.data,
        pagination: unwrapped.pagination,
      };
    },
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

// Bookings — All (NEW)
export function useAdminBookings(params?: {
  page?: number;
  status?: BookingStatus;
}) {
  const q = new URLSearchParams();
  if (params?.page)   q.set("page",   String(params.page));
  if (params?.status) q.set("status", params.status);

  return useQuery<PaginatedResponse<AdminBooking>>({
    queryKey: ["admin", "bookings", params],
    queryFn: async () => {
      const res: any = await apiFetch(`/bookings?${q}`);
      return unwrapPaginated<AdminBooking>(res);
    },
  });
}

// Payments
export function useAdminPayments(params?: {
  page?: number;
  status?: PaymentStatus;
}) {
  const q = new URLSearchParams();
  if (params?.page)   q.set("page",   String(params.page));
  if (params?.status) q.set("status", params.status);

  return useQuery<PaginatedResponse<AdminPayment>>({
    queryKey: ["admin", "payments", params],
    queryFn: async () => {
      const res: any = await apiFetch(`/admin/payments?${q}`);
      return unwrapPaginated<AdminPayment>(res);
    },
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
    queryFn: async () => {
      const res: any = await apiFetch("/admin/blog");
      return unwrapPaginated<BlogPost>(res);
    },
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
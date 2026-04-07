// src/hooks/owner/useOwnerApi.ts
// Matches: owner_route.ts — /api/owner/*

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type PropertyType =
  | "FAMILY_FLAT"
  | "BACHELOR_ROOM"
  | "SUBLET"
  | "HOSTEL"
  | "OFFICE_SPACE"
  | "COMMERCIAL";

export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AvailableFor = "FAMILY" | "BACHELOR" | "CORPORATE" | "ANY";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "DECLINED"
  | "CANCELLED";

export interface OwnerProfile {
  id: string;
  userId: string;
  phone: string | null;
  nidNumber: string | null;
  verified: boolean;
  verifiedAt: string | null;
  totalProperties: number;
  totalEarnings: number;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string; image: string | null };
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  rejectionReason: string | null;
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
  updatedAt: string;
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
  advanceDeposit?: number;
  bookingFee?: number;
  isNegotiable?: boolean;
  availableFrom: string;
  availableFor?: AvailableFor;
  images: string[];
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
  property: Pick<Property, "id" | "title" | "city" | "area" | "images">;
  user: { id: string; name: string; email: string; image: string | null };
  payment: { status: string } | null;
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
  user: { name: string; image: string | null };
  property: { title: string };
}

export interface OwnerStats {
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalEarnings: number;
  rating: number;
  totalReviews: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
  booking: { id: string } | null;
}

// ─── STATS — GET /api/owner/stats ─────────────────────────────────────────────
export function useOwnerStats() {
  return useQuery<OwnerStats>({
    queryKey: ["owner", "stats"],
    queryFn: () => apiFetch("/owner/stats"),
  });
}

// ─── PROFILE — GET/PATCH /api/owner/profile ───────────────────────────────────
export function useOwnerProfile() {
  return useQuery<OwnerProfile>({
    queryKey: ["owner", "profile"],
    queryFn: () => apiFetch("/owner/profile"),
  });
}

export function useUpdateOwnerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { phone?: string; nidNumber?: string }) =>
      apiFetch("/owner/profile", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner", "profile"] }),
  });
}

// ─── PROPERTIES ───────────────────────────────────────────────────────────────
export function useOwnerProperties(params?: { page?: number; status?: PropertyStatus }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.status) q.set("status", params.status);
  return useQuery<PaginatedResponse<Property>>({
    queryKey: ["owner", "properties", params],
    queryFn: () => apiFetch(`/owner/properties?${q}`),
  });
}

export function useOwnerProperty(id: string) {
  return useQuery<Property>({
    queryKey: ["owner", "properties", id],
    queryFn: () => apiFetch(`/owner/properties/${id}`),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePropertyInput) =>
      apiFetch<Property>("/owner/properties", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "properties"] });
      qc.invalidateQueries({ queryKey: ["owner", "stats"] });
    },
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePropertyInput> }) =>
      apiFetch<Property>(`/owner/properties/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ["owner", "properties"] });
      qc.invalidateQueries({ queryKey: ["owner", "properties", id] });
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/owner/properties/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "properties"] });
      qc.invalidateQueries({ queryKey: ["owner", "stats"] });
    },
  });
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
export function useOwnerBookings(params?: { page?: number; status?: BookingStatus }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.status) q.set("status", params.status);
  return useQuery<PaginatedResponse<Booking>>({
    queryKey: ["owner", "bookings", params],
    queryFn: () => apiFetch(`/owner/bookings?${q}`),
  });
}

export function useRespondToBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) =>
      apiFetch(`/owner/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "bookings"] });
      qc.invalidateQueries({ queryKey: ["owner", "stats"] });
    },
  });
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export function usePropertyReviews(propertyId: string) {
  return useQuery<PaginatedResponse<Review>>({
    queryKey: ["owner", "reviews", propertyId],
    queryFn: () => apiFetch(`/owner/properties/${propertyId}/reviews`),
    enabled: !!propertyId,
  });
}

export function useAllOwnerReviews() {
  return useQuery<PaginatedResponse<Review>>({
    queryKey: ["owner", "reviews", "all"],
    queryFn: () => apiFetch(`/reviews?ownerId=me`),
  });
}

export function useFlagReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/owner/reviews/${id}/flag`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner", "reviews"] }),
  });
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => apiFetch("/notifications"),
    refetchInterval: 30000,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/notifications/mark-all-read", { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ─── AI TOOLS ─────────────────────────────────────────────────────────────────
export function useAIDescription() {
  return useMutation({
    mutationFn: (data: {
      type: PropertyType;
      city: string;
      area: string;
      bedrooms: number;
      bathrooms: number;
      availableFor: AvailableFor;
    }) =>
      apiFetch<{ description: string }>("/ai/describe", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useAIPriceHint() {
  return useMutation({
    mutationFn: (data: {
      type: PropertyType;
      city: string;
      area: string;
      bedrooms: number;
      bathrooms: number;
      size?: number;
      availableFor: AvailableFor;
    }) =>
      apiFetch<{ suggestedRent: number; minRent: number; maxRent: number }>("/ai/price-hint", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}
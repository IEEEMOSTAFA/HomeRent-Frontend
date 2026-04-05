// ============================================================
// types/index.ts
// RentHome — Barrel Export (সব types এক জায়গা থেকে import করো)
//
// Usage:
//   import type { AuthUser, UserRole } from "@/types"
//   import type { Property, Booking } from "@/types"
//   import type { OwnerProfile, CreatePropertyInput } from "@/types"
//   import type { AdminAnalytics, BlogPost } from "@/types"
// ============================================================

export type * from "./auth";
export type * from "./user";
export type * from "./owner";
export type * from "./admin";

// Re-export non-type (value) exports from auth.ts
export { ROLE_ROUTES, isAdmin, isOwner, isUser, isActiveUser } from "./auth";
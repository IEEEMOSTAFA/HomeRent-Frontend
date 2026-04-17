// src/constants/adminRoutes.tsx
// Admin navigation routes — based on RentHome PRD
// API: /api/admin/* | Access: ADMIN role only

export interface RouteItem {
  title: string;
  url: string;
}

export const adminRoutes: RouteItem[] = [
  // ── Overview ──────────────────────────────────────────────
  { title: "Dashboard",            url: "/admin/dashboard" },         // GET /api/admin/analytics

  // ── User Management ───────────────────────────────────────
  { title: "All Users",            url: "/admin/users" },             // GET /api/users
  { title: "Owner Verification",   url: "/admin/owners/unverified" }, // GET /api/admin/owners/unverified

  // ── Property Moderation ───────────────────────────────────
  { title: "Pending Properties",   url: "/admin/properties/pending" },// GET /api/admin/properties/pending

  { title: "All Properties",       url: "/admin/properties" },        // via /api/properties (admin view)

  // ── Bookings & Payments ───────────────────────────────────
  { title: "All Bookings",         url: "/admin/bookings" },          // GET /api/bookings (admin)
  { title: "Payments",             url: "/admin/payments" },          // GET /api/admin/payments

  // ── Content Moderation ────────────────────────────────────
  { title: "Flagged Reviews",      url: "/admin/reviews/flagged" },   // GET /api/admin/reviews/flagged

  // ── Blog ──────────────────────────────────────────────────
  { title: "Blog Posts",           url: "/admin/blog" }             // GET /api/admin/blog
];


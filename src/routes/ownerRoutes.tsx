// src/constants/ownerRoutes.tsx
// Owner navigation routes — based on RentHome PRD
// API: /api/owner/* | Access: OWNER role only

export interface RouteItem {
  title: string;
  url: string;
}

export const ownerRoutes: RouteItem[] = [
  // ── Overview ──────────────────────────────────────────────
  { title: "Dashboard",          url: "/owner/dashboard" },     // GET /api/owner/stats

  // ── Property Management ───────────────────────────────────
  { title: "My Properties",      url: "/owner/properties" },    // GET /api/owner/properties
  { title: "Add Property",       url: "/owner/properties/new" },// POST /api/owner/properties

  // ── Booking Management ────────────────────────────────────
  { title: "Bookings",           url: "/owner/bookings" },      // GET /api/owner/bookings (accept/decline)

  // ── Reviews ───────────────────────────────────────────────
  { title: "Reviews",            url: "/owner/reviews" },       // GET /api/reviews?ownerId=me

  // ── AI Tools ──────────────────────────────────────────────
  { title: "AI Description",     url: "/owner/ai/describe" },   // POST /api/ai/describe
  { title: "AI Price Hint",      url: "/owner/ai/price-hint" }, // POST /api/ai/price-hint

  // ── Account ───────────────────────────────────────────────
  { title: "Profile",            url: "/owner/profile" },       // GET/PATCH /api/users/me
  { title: "Notifications",      url: "/owner/notifications" }, // GET /api/notifications
];






// export interface RouteItem {
//   title: string;
//   url: string;
// }

// export const ownerRoutes: RouteItem[] = [
//    { title: "Owner Dashboard", url: "/tutor/dashboard" },
//   { title: "Profile", url: "/tutor/profile" },
//   { title: "Availability", url: "/tutor/availability" },
// ];











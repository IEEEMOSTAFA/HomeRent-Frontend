// src/constants/ownerRoutes.tsx
// Owner navigation routes — based on RentHome PRD
// API: /api/owner/* | Access: OWNER role only

export interface RouteItem {
  title: string;
  url: string;
  comingSoon?: boolean;
}

export const ownerRoutes: RouteItem[] = [
  // ── Overview ──────────────────────────────────────────────
  { title: "Dashboard",      url: "/owner/dashboard" },        // GET /api/owner/stats

  // ── Property Management ───────────────────────────────────
  { title: "My Properties",  url: "/owner/properties" },       // GET /api/owner/properties
  { title: "Add Property",   url: "/owner/properties/new" },   // POST /api/owner/properties
  // NOTE: /owner/create folder is a dead duplicate — delete it.
  // NOTE: /owner/Properties (capital P) must be renamed to /owner/properties
  //       to avoid 404s on Linux/Vercel (case-sensitive file system).

  // ── Booking Management ────────────────────────────────────
  { title: "Bookings",       url: "/owner/booking" },          // GET /api/owner/bookings
  // NOTE: folder is /owner/booking (no 's') — route now matches.

  // ── Reviews ───────────────────────────────────────────────
  { title: "Reviews",        url: "/owner/reviews" },          // GET /api/reviews?ownerId=me

  // ── AI Tools (coming soon — no pages yet) ─────────────────
  { title: "AI Description", url: "/owner/ai/describe",   comingSoon: true }, // POST /api/ai/describe
  { title: "AI Price Hint",  url: "/owner/ai/price-hint", comingSoon: true }, // POST /api/ai/price-hint

  // ── Account ───────────────────────────────────────────────
  { title: "Profile",        url: "/owner/profile" },          // GET/PATCH /api/users/me
  { title: "Notifications",  url: "/owner/notifications" },    // GET /api/notifications
];
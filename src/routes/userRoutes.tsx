// src/constants/userRoutes.tsx
// User (tenant) navigation routes — based on RentHome PRD
// API: /api/users/*, /api/bookings/*, /api/ai/* | Access: USER role only

export interface RouteItem {
  title: string;
  url: string;
}

export const userRoutes: RouteItem[] = [
  // ── Overview ──────────────────────────────────────────────
  { title: "Dashboard",           url: "/user/dashboard" },           // GET /api/users/me/stats

  // ── Property Discovery ────────────────────────────────────
  { title: "Browse Properties",   url: "/user/properties" },          // GET /api/properties (public)
  { title: "AI Recommendations",  url: "/user/recommendations" },     // POST /api/ai/recommend

  // ── Bookings & Payments ───────────────────────────────────
  { title: "My Bookings",         url: "/user/bookings" },            // GET /api/bookings (own)
  { title: "Payment History",     url: "/user/payments" },            // via booking receipts

  // ── Reviews ───────────────────────────────────────────────
  { title: "My Reviews",          url: "/user/reviews" },             // GET /api/reviews?userId=me

  // ── Account ───────────────────────────────────────────────
  { title: "Notifications",       url: "/user/notifications" },       // GET /api/notifications
  { title: "Profile",             url: "/user/profile" },             // GET/PATCH /api/users/me
];












// export interface RouteItem {
//    title: string;
//    url: string;
// }

// export const userRoutes: RouteItem[] = [
//    { title: "Dashboard", url: "/student/dashboard" },   
//    { title: "My Bookings", url: "/student/bookings" },  
//    { title: "Profile", url: "/student/profile" },       
// ];




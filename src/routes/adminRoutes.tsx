// src/routes/adminRoutes.tsx
// Admin navigation routes — Navbar এ use করা হয়

export interface RouteItem {
  title: string;
  url: string;
}

export const adminRoutes: RouteItem[] = [
  { title: "Admin Dashboard", url: "/admin/dashboard" },
  { title: "Users", url: "/admin/getAlUsers" },
  { title: "Bookings", url: "/admin/AllBooking" },
  { title: "Categories", url: "/admin/getCategory" },
];
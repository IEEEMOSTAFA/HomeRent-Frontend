// src/constants/userRoutes.tsx

export interface RouteItem {
  title: string;
  url: string;
}

export const userRoutes: RouteItem[] = [
  { title: "Dashboard",          url: "/user/dashboard" },
  { title: "Browse Properties",  url: "/property" },
  { title: "AI Recommendations", url: "/user/recommendations" },
  { title: "My Bookings",        url: "/user/booking" },      // ✅ Fixed: was /user/bookings, folder is /user/booking
  { title: "Payment History",    url: "/user/payments" },
  { title: "My Reviews",         url: "/user/reviews" },
  { title: "Notifications",      url: "/user/notifications" },
  { title: "Profile",            url: "/user/profile" },
];



















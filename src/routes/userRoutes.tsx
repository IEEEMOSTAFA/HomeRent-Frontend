// src/constants/userRoutes.tsx
"use client";
export interface RouteItem {
  title: string;
  url: string;
  icon: React.ElementType; // Icon component
}

import { Home, Search, Star, Calendar, CreditCard, MessageSquare, Bell, User } from "lucide-react";

export const userRoutes: RouteItem[] = [
  { title: "Dashboard",          url: "/user/dashboard",       icon: Home },
  { title: "Browse Properties",  url: "/property",             icon: Search },
  { title: "AI Recommendations", url: "/user/recommendations", icon: Star },
  { title: "My Bookings",        url: "/user/booking",         icon: Calendar },
  { title: "Payment History",    url: "/user/payments",        icon: CreditCard },
  { title: "My Reviews",         url: "/user/reviews",         icon: MessageSquare },
  { title: "Notifications",      url: "/user/notifications",   icon: Bell },
  { title: "Profile",            url: "/user/profile",         icon: User },
];



















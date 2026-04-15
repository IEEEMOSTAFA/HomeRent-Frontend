import { Calendar, CreditCard, Star, Settings2 } from "lucide-react";
import type { NotifType, FilterTab } from "./types";

export const TYPE_CONFIG: Record<
  NotifType,
  {
    Icon: React.ElementType;
    label: string;
    iconBg: string;
    iconColor: string;
    activeBg: string;
    activeBorder: string;
    dot: string;
    badgeCls: string;
  }
> = {
  booking_update: {
    Icon: Calendar,
    label: "Booking",
    iconBg: "bg-sky-50 dark:bg-sky-950/40",
    iconColor: "text-sky-600 dark:text-sky-400",
    activeBg: "bg-sky-50/80 dark:bg-sky-950/30",
    activeBorder: "border-l-sky-400 dark:border-l-sky-600",
    dot: "bg-sky-500",
    badgeCls: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
  },
  payment: {
    Icon: CreditCard,
    label: "Payment",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    activeBg: "bg-emerald-50/80 dark:bg-emerald-950/30",
    activeBorder: "border-l-emerald-400 dark:border-l-emerald-600",
    dot: "bg-emerald-500",
    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  },
  review: {
    Icon: Star,
    label: "Review",
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    activeBg: "bg-amber-50/80 dark:bg-amber-950/30",
    activeBorder: "border-l-amber-400 dark:border-l-amber-600",
    dot: "bg-amber-500",
    badgeCls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
  system: {
    Icon: Settings2,
    label: "System",
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    activeBg: "bg-violet-50/80 dark:bg-violet-950/30",
    activeBorder: "border-l-violet-400 dark:border-l-violet-600",
    dot: "bg-violet-500",
    badgeCls: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800",
  },
};

export const TAB_LABELS: Record<FilterTab, string> = {
  all: "All",
  booking_update: "Bookings",
  payment: "Payments",
  review: "Reviews",
  system: "System",
};
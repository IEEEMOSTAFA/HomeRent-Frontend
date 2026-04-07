// src/app/(dashboardRoute)/owner/_components/OwnerSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  PlusSquare,
  CalendarCheck,
  Star,
  Sparkles,
  TrendingUp,
  User,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useNotifications } from "@/hooks/owner/useOwnerApi";
import { RouteItem } from "@/routes/ownerRoutes";

const ICON_MAP: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard size={16} />,
  "My Properties": <Building2 size={16} />,
  "Add Property": <PlusSquare size={16} />,
  Bookings: <CalendarCheck size={16} />,
  Reviews: <Star size={16} />,
  "AI Description": <Sparkles size={16} />,
  "AI Price Hint": <TrendingUp size={16} />,
  Profile: <User size={16} />,
  Notifications: <Bell size={16} />,
};

export default function OwnerSidebar({ routes }: { routes: RouteItem[] }) {
  const pathname = usePathname();
  
  // ✅ Fixed: Safe notifications handling
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications();

  // ✅ Safe unread count
  const unread = Array.isArray(notifications) 
    ? notifications.filter((n) => !n?.isRead).length 
    : 0;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <Building2 size={15} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground leading-tight">RentHome</p>
          <p className="text-[10px] text-muted-foreground">Owner Portal</p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
          Navigation
        </p>

        {routes.map((route) => {
          const isActive =
            pathname === route.url ||
            (route.url !== "/owner/dashboard" && pathname.startsWith(route.url));

          return (
            <Link key={route.url} href={route.url}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2.5 h-9 text-sm font-medium",
                  isActive
                    ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={isActive ? "text-emerald-600" : "text-muted-foreground/70"}>
                  {ICON_MAP[route.title] ?? <Building2 size={16} />}
                </span>
                {route.title}

                {/* Notifications Badge - Safe */}
                {route.title === "Notifications" && unread > 0 && (
                  <Badge className="ml-auto h-4 px-1.5 text-[10px] bg-emerald-600 hover:bg-emerald-600">
                    {unread}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Sign out */}
      <div className="px-3 py-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>

      {/* Optional: Loading indicator */}
      {notificationsLoading && (
        <div className="px-5 py-2 text-[10px] text-muted-foreground">
          Loading notifications...
        </div>
      )}
    </aside>
  );
}
"use client";
// src/app/(dashboardRoute)/user/_components/UserSidebar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Sparkles,
  CalendarCheck, CreditCard, Star,
  Bell, User, LogOut,
} from "lucide-react";

import { cn }           from "@/lib/utils";
import { Button }       from "@/components/ui/button";
import { Badge }        from "@/components/ui/badge";
import { Separator }    from "@/components/ui/separator";
// import type { RouteItem } from "@/constants/userRoutes";
import { useMyNotifications } from "@/hooks/user/useUserApi";
import { RouteItem } from "@/routes/userRoutes";

const ICON_MAP: Record<string, React.ReactNode> = {
  "Dashboard":          <LayoutDashboard size={16} />,
  "Browse Properties":  <Building2 size={16} />,
  "AI Recommendations": <Sparkles size={16} />,
  "My Bookings":        <CalendarCheck size={16} />,
  "Payment History":    <CreditCard size={16} />,
  "My Reviews":         <Star size={16} />,
  "Notifications":      <Bell size={16} />,
  "Profile":            <User size={16} />,
};

export default function UserSidebar({ routes }: { routes: RouteItem[] }) {
  const pathname = usePathname();
  const { data: notifications } = useMyNotifications();
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Building2 size={15} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">RentHome</p>
          <p className="text-[10px] text-muted-foreground">Tenant Portal</p>
        </div>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
          Navigation
        </p>
        {routes.map((route) => {
          const isActive =
            pathname === route.url ||
            (route.url !== "/user/dashboard" && pathname.startsWith(route.url));

          return (
            <Link key={route.url} href={route.url}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2.5 h-9 text-sm font-medium",
                  isActive
                    ? "text-blue-700 bg-blue-50 hover:bg-blue-100"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={isActive ? "text-blue-600" : "text-muted-foreground/70"}>
                  {ICON_MAP[route.title] ?? <LayoutDashboard size={16} />}
                </span>
                {route.title}
                {route.title === "Notifications" && unread > 0 && (
                  <Badge className="ml-auto h-4 px-1.5 text-[10px] bg-blue-600 hover:bg-blue-600">
                    {unread}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="px-3 py-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut size={16} /> Sign Out
        </Button>
      </div>
    </aside>
  );
}
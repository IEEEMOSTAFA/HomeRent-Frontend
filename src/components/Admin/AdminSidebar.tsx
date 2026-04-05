"use client";
// src/app/(dashboardRoute)/admin/_components/AdminSidebar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShieldCheck, Building2,
  ListFilter, CalendarDays, CreditCard, Flag,
  BookOpen, LogOut, ShieldAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RouteItem } from "@/routes/adminRoutes";
// import type { RouteItem } from "@/constants/adminRoutes";

const ICON_MAP: Record<string, React.ReactNode> = {
  "Dashboard":          <LayoutDashboard size={16} />,
  "All Users":          <Users size={16} />,
  "Owner Verification": <ShieldCheck size={16} />,
  "Pending Properties": <ListFilter size={16} />,
  "All Properties":     <Building2 size={16} />,
  "All Bookings":       <CalendarDays size={16} />,
  "Payments":           <CreditCard size={16} />,
  "Flagged Reviews":    <Flag size={16} />,
  "Blog Posts":         <BookOpen size={16} />,
};

export default function AdminSidebar({ routes }: { routes: RouteItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center flex-shrink-0">
          <ShieldAlert size={15} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground leading-tight">RentHome</p>
          <p className="text-[10px] text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
          Administration
        </p>
        {routes.map((route) => {
          const isActive =
            pathname === route.url ||
            (route.url !== "/admin/dashboard" && pathname.startsWith(route.url));

          return (
            <Link key={route.url} href={route.url}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2.5 h-9 text-sm font-medium",
                  isActive
                    ? "text-rose-700 bg-rose-50 hover:bg-rose-100"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={isActive ? "text-rose-600" : "text-muted-foreground/70"}>
                  {ICON_MAP[route.title] ?? <LayoutDashboard size={16} />}
                </span>
                {route.title}
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
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
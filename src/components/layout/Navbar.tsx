// Test data::

// src/components/layout/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "./ModeToggle";

import { adminRoutes } from "@/routes/adminRoutes";
import { ownerRoutes } from "@/routes/ownerRoutes";
import { userRoutes } from "@/routes/userRoutes";

type UserRole = "USER" | "OWNER" | "ADMIN";

interface NavUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}

const publicMenu = [
  { title: "Home",       url: "/" },
  { title: "Properties", url: "/property" },
  { title: "About",      url: "/About" },
  { title: "Blog",       url: "/blog" },
];

export function Navbar({ className }: { className?: string }) {
  const [user, setUser]       = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router   = useRouter();
  const pathname = usePathname();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) { setUser(null); return; }

        const data = await res.json();
        if (!data?.user) { setUser(null); return; }

        setUser({
          id:    data.user.id,
          name:  data.user.name,
          email: data.user.email,
          role:  data.user.role as UserRole,
        });
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [pathname, BACKEND_URL]);

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/sign-out`, { method: "POST", credentials: "include" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const roleMenu = (() => {
    if (!user) return [];
    if (user.role === "ADMIN") return adminRoutes;
    if (user.role === "OWNER") return ownerRoutes;
    if (user.role === "USER")  return userRoutes;
    return [];
  })();

  // ✅ Fix: publicMenu의 url이 roleMenu에 중복되면 제거 → duplicate key 방지
  const publicUrls = new Set(publicMenu.map((m) => m.url));
  const filteredRoleMenu = roleMenu.filter((item) => !publicUrls.has(item.url));
  const navItems = [...publicMenu, ...filteredRoleMenu];

  if (loading) {
    return (
      <div className={cn("py-4 border-b", className)}>
        <div className="container mx-auto px-4">
          <div className="h-12 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
    );
  }

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) =>
    !user ? (
      <>
        <Button asChild variant="outline" size={mobile ? "default" : "sm"} className={mobile ? "w-full" : ""}>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild size={mobile ? "default" : "sm"} className={mobile ? "w-full" : ""}>
          <Link href="/signup">Register</Link>
        </Button>
      </>
    ) : (
      <div className={cn("flex items-center gap-3", mobile && "flex-col items-start w-full")}>
        <span className="text-sm text-muted-foreground">
          {user.name} <span className="text-xs opacity-70">({user.role})</span>
        </span>
        <Button
          size={mobile ? "default" : "sm"}
          variant="destructive"
          onClick={handleLogout}
          className={mobile ? "w-full" : ""}
        >
          Logout
        </Button>
      </div>
    );

  return (
    <section className={cn("py-4 border-b bg-background sticky top-0 z-50", className)}>
      <div className="container mx-auto px-4">

        {/* DESKTOP */}
        <nav className="hidden lg:flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              // src="https://i.ibb.co/GfSxzpnb/skillbridge.png"
              //  src="https://res.cloudinary.com/dldqjm9da/image/upload/v1775882365/homerent/properties/alzrgmiger6pioj541ev.jpg"
               src="https://res.cloudinary.com/dldqjm9da/image/upload/v1775882623/homerent/properties/x0visc67d5pqiufymdgh.jpg"
              alt="HomeRent logo"
              width={140} height={40}
              className="h-9 w-auto dark:invert"
              priority
            />
            <span className="font-bold text-xl tracking-tight">HomeRent</span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.url}>
                  <NavigationMenuLink asChild>
                    <Link href={item.url} className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <AuthButtons />
          </div>
        </nav>

        {/* MOBILE */}
        <div className="lg:hidden flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              // src="https://i.ibb.co/GfSxzpnb/skillbridge.png"
              src="https://res.cloudinary.com/dldqjm9da/image/upload/v1775882623/homerent/properties/x0visc67d5pqiufymdgh.jpg"
              alt="HomeRent logo"
              width={32} height={32}
              className="dark:invert"
            />
            <span className="font-semibold text-lg">HomeRent</span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon"><Menu className="size-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
              <div className="mt-8 flex flex-col gap-6 text-lg">
                {navItems.map((item) => (
                  <Link key={item.url} href={item.url} className="hover:text-primary transition-colors">
                    {item.title}
                  </Link>
                ))}
                <div className="pt-6 border-t"><ModeToggle /></div>
                <div className="flex flex-col gap-3 pt-2"><AuthButtons mobile /></div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </section>
  );
}





























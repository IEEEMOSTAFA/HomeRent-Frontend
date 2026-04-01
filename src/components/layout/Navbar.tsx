"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";

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

// ================= ROUTES =================
import { adminRoutes } from "@/routes/adminRoutes";
import { userRoutes } from "@/routes/userRoutes";
import { ownerRoutes } from "@/routes/ownerRoutes";
// import { tutorRoutes } from "@/routes/tutorRoutes";
// import { studentRoutes } from "@/routes/studentRoutes";

// ================= TYPES =================
type UserRole = "USER" | "OWNER" | "ADMIN";

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface MenuItem {
  title: string;
  url: string;
}

// ================= PUBLIC MENU =================
const publicMenu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Find Tutor", url: "/tutors" },
  { title: "About", url: "/about" },
];

// ================= COMPONENT =================
const Navbar = ({ className }: { className?: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // 🔐 get logged-in user
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (!res.ok) return setUser(null);
        const json = await res.json();
        setUser(json.data);
      } catch {
        setUser(null);
      }
    };
    fetchMe();
  }, []);

  // 🚪 logout
  const handleLogout = async () => {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    router.push("/login");
  };

  // 🧠 role-based routes
  const roleMenu: MenuItem[] = (() => {
    if (!user) return [];
    if (user.role === "ADMIN") return adminRoutes;
    if (user.role === "OWNER") return ownerRoutes;
    return userRoutes;
  })();

  return (
    <section className={cn("py-4 border-b", className)}>
      <div className="container mx-auto px-4">

        {/* ================= DESKTOP ================= */}
        <nav className="hidden lg:flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://i.ibb.co/GfSxzpnb/skillbridge.png"
              className="h-8 dark:invert"
              alt="SkillBridge"
            />
            <span className="font-semibold text-lg">SkillBridge</span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              {[...publicMenu, ...roleMenu].map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.url}
                      className="px-4 py-2 text-sm font-medium hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex gap-2 items-center">
            <ModeToggle />
            {!user ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                {/* ✅ FIX: /register → /signup */}
                <Button asChild size="sm">
                  <Link href="/signup">Register</Link>
                </Button>
              </>
            ) : (
              <Button size="sm" variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>
        </nav>

        {/* ================= MOBILE ================= */}
        <div className="lg:hidden flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://i.ibb.co/GfSxzpnb/skillbridge.png"
              className="h-8 dark:invert"
              alt="SkillBridge"
            />
            <span className="font-semibold">SkillBridge</span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>

            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-4">
                {[...publicMenu, ...roleMenu].map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    className="text-sm font-semibold hover:text-primary"
                  >
                    {item.title}
                  </Link>
                ))}

                <ModeToggle />

                {!user ? (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/login">Login</Link>
                    </Button>
                    {/* ✅ FIX: /register → /signup */}
                    <Button asChild>
                      <Link href="/signup">Register</Link>
                    </Button>
                  </>
                ) : (
                  <Button variant="destructive" onClick={handleLogout}>
                    Logout
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </section>
  );
};

export { Navbar };



















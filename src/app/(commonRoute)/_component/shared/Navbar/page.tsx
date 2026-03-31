"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Search,
  Building2,
  BookOpen,
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
  Bell,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/blog", label: "Blog", icon: BookOpen },
];

const propertyTypes = [
  { label: "Family Flat", href: "/properties?type=FAMILY_FLAT" },
  { label: "Bachelor Room", href: "/properties?type=BACHELOR_ROOM" },
  { label: "Sublet", href: "/properties?type=SUBLET" },
  { label: "Hostel", href: "/properties?type=HOSTEL" },
  { label: "Office Space", href: "/properties?type=OFFICE_SPACE" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-[72px]">
          {/* ─── Logo ─── */}
          <Link
            href="/"
            id="navbar-logo"
            className="group flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/25 transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-primary/35">
              <Home className="h-4.5 w-4.5 text-primary-foreground" />
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span
                className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                  isScrolled ? "text-foreground" : "text-white"
                }`}
              >
                Rent<span className="text-primary">Home</span>
              </span>
              <span
                className={`-mt-1 text-[10px] font-medium tracking-widest uppercase transition-colors duration-300 ${
                  isScrolled ? "text-muted-foreground" : "text-white/60"
                }`}
              >
                Bangladesh
              </span>
            </div>
          </Link>

          {/* ─── Desktop Navigation ─── */}
          <nav
            id="desktop-nav"
            className="hidden items-center gap-1 lg:flex"
          >
            {navLinks.map((link) => {
              if (link.label === "Properties") {
                return (
                  <DropdownMenu key={link.href}>
                    <DropdownMenuTrigger asChild>
                      <button
                        id="nav-properties-dropdown"
                        className={`group flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-300 hover:bg-primary/10 ${
                          isScrolled
                            ? "text-foreground/80 hover:text-foreground"
                            : "text-white/85 hover:text-white"
                        }`}
                      >
                        <link.icon className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                        <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:opacity-80 transition-all group-data-[state=open]:rotate-180" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="w-52 mt-2"
                    >
                      <DropdownMenuItem asChild>
                        <Link
                          href="/properties"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Search className="h-3.5 w-3.5" />
                          All Properties
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {propertyTypes.map((type) => (
                        <DropdownMenuItem key={type.href} asChild>
                          <Link
                            href={type.href}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Building2 className="h-3.5 w-3.5" />
                            {type.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-300 hover:bg-primary/10 ${
                    isScrolled
                      ? "text-foreground/80 hover:text-foreground"
                      : "text-white/85 hover:text-white"
                  }`}
                >
                  <link.icon className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ─── Desktop Actions ─── */}
          <div
            id="desktop-actions"
            className="hidden items-center gap-2 lg:flex"
          >
            {/* AI Recommendation CTA */}
            <Link href="/properties" id="navbar-search-btn">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 transition-colors duration-300 ${
                  isScrolled
                    ? "text-foreground/70 hover:text-foreground"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </Link>

            <div
              className={`h-5 w-px transition-colors duration-300 ${
                isScrolled ? "bg-border" : "bg-white/20"
              }`}
            />

            {/* Auth Buttons */}
            <Link href="/login" id="navbar-login-btn">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 transition-colors duration-300 ${
                  isScrolled
                    ? "text-foreground/70 hover:text-foreground"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>

            <Link href="/signup" id="navbar-signup-btn">
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-primary to-primary/80 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-300 hover:scale-[1.02]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Get Started
              </Button>
            </Link>
          </div>

          {/* ─── Mobile Menu Button ─── */}
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  id="mobile-menu-toggle"
                  variant="ghost"
                  size="icon"
                  className={`transition-colors duration-300 ${
                    isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[320px] border-l-primary/10 p-0"
              >
                <SheetHeader className="border-b border-border/50 px-6 py-5">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/20">
                      <Home className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-base font-bold tracking-tight">
                      Rent<span className="text-primary">Home</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 p-4">
                  {/* Nav Links */}
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-primary/8 hover:text-foreground hover:pl-5"
                    >
                      <link.icon className="h-4.5 w-4.5 text-primary/70" />
                      {link.label}
                    </Link>
                  ))}

                  {/* Property Types */}
                  <div className="mt-2">
                    <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Property Types
                    </p>
                    {propertyTypes.map((type) => (
                      <Link
                        key={type.href}
                        href={type.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-foreground/70 transition-all duration-200 hover:bg-primary/8 hover:text-foreground hover:pl-5"
                      >
                        <Building2 className="h-3.5 w-3.5 text-primary/50" />
                        {type.label}
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="my-3 h-px bg-border/60" />

                  {/* Auth Actions */}
                  <Link
                    href="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-primary/8 hover:text-foreground"
                  >
                    <LogIn className="h-4.5 w-4.5 text-primary/70" />
                    Sign In
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setIsMobileOpen(false)}
                    className="mt-1"
                  >
                    <Button className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-md shadow-primary/20 py-5">
                      <Sparkles className="h-4 w-4" />
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

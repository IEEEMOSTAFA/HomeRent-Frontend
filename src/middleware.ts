import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const url = req.nextUrl.pathname;

  try {
    // BetterAuth-এর নিজের endpoint দিয়ে session যাচাই করুন
    const sessionRes = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!sessionRes.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const data = await sessionRes.json();

    if (!data?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole: string = data.user.role;

    // Role-based access control
    if (url.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (url.startsWith("/owner") && userRole !== "OWNER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (url.startsWith("/user") && userRole !== "USER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/user/:path*",
    "/owner/:path*",
    "/admin/:path*",
    "/booking/:path*",
  ],
};